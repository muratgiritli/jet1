import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import path from "path";
import { getStoreByExactHost, canonicalHost } from "@shared/stores";

process.on("uncaughtException", (err) => {
  console.error("[uncaughtException - keeping process alive]", err?.message, err?.stack);
});
process.on("unhandledRejection", (reason: any) => {
  console.error("[unhandledRejection - keeping process alive]", reason?.message || reason);
});

const app = express();
const httpServer = createServer(app);

const productImagesPath = path.resolve(process.cwd(), "client", "public", "product-images");
app.use("/product-images", express.static(productImagesPath, {
  maxAge: "7d",
  immutable: true,
}));
app.use("/product-images", (_req, res) => {
  res.status(404).end();
});

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.set("trust proxy", 1);

// Canonical host: 301 redirect each configured store's non-canonical hostname
// (e.g. apex) to its canonical domain so Google consolidates signals per site.
// Only configured production hostnames are touched; dev hosts (replit.dev /
// replit.app / localhost) and unknown hosts pass through untouched.
app.use((req, res, next) => {
  const reqHost = req.hostname.toLowerCase();
  const store = getStoreByExactHost(reqHost);
  if (store) {
    const target = canonicalHost(store);
    if (target && reqHost !== target) {
      return res.redirect(301, `${store.domain}${req.originalUrl}`);
    }
  }
  next();
});

app.use((_req, res, next) => {
  res.removeHeader("X-Powered-By");
  next();
});

app.use(
  express.json({
    limit: "10mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: "10mb" }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        const responseStr = JSON.stringify(capturedJsonResponse);
        logLine += ` :: ${responseStr.length > 200 ? responseStr.substring(0, 200) + "..." : responseStr}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.on("error", (err: any) => {
    console.error("[FATAL] httpServer error:", err?.code, err?.message);
    if (err?.code === "EADDRINUSE" || err?.code === "EACCES") {
      process.exit(1);
    }
  });
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
