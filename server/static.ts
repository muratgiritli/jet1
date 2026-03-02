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

  const productImagesPath = path.join(distPath, "product-images");
  const productImagesExist = fs.existsSync(productImagesPath);
  console.log(`[static] product-images path: ${productImagesPath}, exists: ${productImagesExist}`);

  if (productImagesExist) {
    const count = fs.readdirSync(productImagesPath).length;
    console.log(`[static] product-images count: ${count}`);
  }

  app.use("/product-images", (req, res) => {
    const filePath = path.join(productImagesPath, req.path);
    if (fs.existsSync(filePath)) {
      res.setHeader("Cache-Control", "public, max-age=604800, immutable");
      if (filePath.endsWith(".webp")) {
        res.setHeader("Content-Type", "image/webp");
      }
      return res.sendFile(filePath);
    }
    res.status(404).end();
  });

  app.use(express.static(distPath));

  app.use("/{*path}", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
