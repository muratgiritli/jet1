import express, { type Express } from "express";
import fs from "fs";
import path from "path";

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

  const imageDirs = [
    path.join(distPath, "product-images"),
    path.join(process.cwd(), "client", "public", "product-images"),
  ].filter(d => fs.existsSync(d));

  for (const dir of imageDirs) {
    const count = fs.readdirSync(dir).length;
    console.log(`[static] product-images dir: ${dir}, count: ${count}`);
  }

  app.use("/product-images", (req, res) => {
    const cleanPath = req.path.split("?")[0];
    for (const dir of imageDirs) {
      const filePath = path.join(dir, cleanPath);
      if (fs.existsSync(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=604800, immutable");
        if (filePath.endsWith(".webp")) {
          res.setHeader("Content-Type", "image/webp");
        }
        return res.sendFile(filePath);
      }
    }
    res.status(404).end();
  });

  app.use(express.static(distPath));

  app.use("/{*path}", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
