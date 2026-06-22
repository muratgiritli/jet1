import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { injectAllMeta } from "./seo-meta";

export function serveStatic(app: Express) {
  const candidates = [
    path.resolve(__dirname, "public"),
    path.resolve(process.cwd(), "dist", "public"),
  ];

  const distPath = candidates.find((p) => fs.existsSync(p));
  if (!distPath) {
    throw new Error(
      `Could not find the build directory. Tried: ${candidates.join(", ")}`,
    );
  }

  console.log(`[static] serving from: ${distPath}`);

  app.use(express.static(distPath, {
    index: false,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        // HTML is the entry point — never cache it so new deploys (which point at
        // freshly hashed asset filenames) are picked up immediately.
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        return;
      }
      if (/[\\/]assets[\\/]/.test(filePath)) {
        // Vite build assets carry a content hash in their filename, so they are
        // immutable: a changed file always gets a new name. Cache them for a year
        // so repeat visits serve ~1MB of JS/CSS from disk with ZERO network
        // requests (previously they revalidated on every page open).
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        return;
      }
      // Other static files (manifest, icons, favicon, etc.) are not hashed —
      // allow caching but require revalidation so updates are picked up.
      res.setHeader("Cache-Control", "public, max-age=3600");
    }
  }));

  const indexPath = path.resolve(distPath, "index.html");
  let cachedTemplate: string | null = null;
  const getTemplate = () => {
    if (cachedTemplate) return cachedTemplate;
    cachedTemplate = fs.readFileSync(indexPath, "utf-8");
    return cachedTemplate;
  };

  app.use("/{*path}", async (req, res, next) => {
    try {
      const template = getTemplate();
      const html = await injectAllMeta(template, req.originalUrl, req.hostname);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.status(200).end(html);
    } catch (e) {
      next(e);
    }
  });
}
