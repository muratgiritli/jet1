import sharp from "sharp";
import path from "path";
import fs from "fs";
import { storage } from "./storage";

function getImageDirs(): string[] {
  const dirs = [
    path.join(process.cwd(), "dist", "public", "product-images"),
    path.join(process.cwd(), "client", "public", "product-images"),
  ];
  return dirs.filter(d => fs.existsSync(d));
}

function getWriteDir(): string {
  const distDir = path.join(process.cwd(), "dist", "public", "product-images");
  if (fs.existsSync(distDir)) return distDir;

  const clientDir = path.join(process.cwd(), "client", "public", "product-images");
  if (fs.existsSync(clientDir)) return clientDir;

  fs.mkdirSync(distDir, { recursive: true });
  return distDir;
}

function imageFileExists(productId: number): boolean {
  const filename = `product-${productId}.webp`;
  for (const dir of getImageDirs()) {
    if (fs.existsSync(path.join(dir, filename))) return true;
  }
  return false;
}

export async function downloadAndConvertImage(imageUrl: string, productId: number): Promise<string | null> {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "image/*",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.log(`[image] Failed to download image for product ${productId}: HTTP ${response.status}`);
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    const webpBuffer = await sharp(buffer)
      .resize(800, 800, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    if (webpBuffer.length < 500) {
      console.log(`[image] Image too small for product ${productId}: ${webpBuffer.length} bytes`);
      return null;
    }

    const filename = `product-${productId}.webp`;
    const writeDir = getWriteDir();
    fs.writeFileSync(path.join(writeDir, filename), webpBuffer);

    const clientDir = path.join(process.cwd(), "client", "public", "product-images");
    if (fs.existsSync(clientDir) && clientDir !== writeDir) {
      fs.writeFileSync(path.join(clientDir, filename), webpBuffer);
    }

    const localPath = `/product-images/${filename}?v=${Date.now()}`;
    console.log(`[image] Converted product ${productId} -> ${filename} (${Math.round(webpBuffer.length / 1024)} KB)`);
    return localPath;
  } catch (err: any) {
    console.log(`[image] Error processing product ${productId}: ${err.message}`);
    return null;
  }
}

export async function saveUploadedImage(buffer: Buffer, productId: number): Promise<string> {
  const webpBuffer = await sharp(buffer)
    .resize(800, 800, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const filename = `product-${productId}.webp`;
  const writeDir = getWriteDir();
  fs.writeFileSync(path.join(writeDir, filename), webpBuffer);

  const clientDir = path.join(process.cwd(), "client", "public", "product-images");
  if (fs.existsSync(clientDir) && clientDir !== writeDir) {
    fs.writeFileSync(path.join(clientDir, filename), webpBuffer);
  }

  const localPath = `/product-images/${filename}?v=${Date.now()}`;
  console.log(`[image] Uploaded product ${productId} -> ${filename} (${Math.round(webpBuffer.length / 1024)} KB)`);
  return localPath;
}

export async function migrateAllImages(): Promise<{ success: number; failed: number; skipped: number }> {
  const products = await storage.getAllProducts();
  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (const product of products) {
    if (!product.img) {
      skipped++;
      continue;
    }

    const fileExists = imageFileExists(product.id);

    if (product.img.startsWith("/product-images/")) {
      if (fileExists) {
        skipped++;
      } else if (product.originalImg) {
        const localPath = await downloadAndConvertImage(product.originalImg, product.id);
        if (localPath) {
          await storage.updateProduct(product.id, { img: localPath });
          success++;
        } else {
          failed++;
        }
        await new Promise(r => setTimeout(r, 200));
      } else {
        skipped++;
      }
      continue;
    }

    if (fileExists) {
      await storage.updateProduct(product.id, {
        img: `/product-images/product-${product.id}.webp`,
        originalImg: product.img,
      });
      skipped++;
      continue;
    }

    await storage.updateProduct(product.id, { originalImg: product.img });

    const localPath = await downloadAndConvertImage(product.img, product.id);
    if (localPath) {
      await storage.updateProduct(product.id, { img: localPath });
      success++;
    } else {
      failed++;
    }

    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`[image] Migration complete: ${success} converted, ${failed} failed, ${skipped} skipped`);
  return { success, failed, skipped };
}
