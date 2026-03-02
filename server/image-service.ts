import sharp from "sharp";
import path from "path";
import fs from "fs";
import { storage } from "./storage";

function getImageDir(): string {
  const candidates = [
    path.join(process.cwd(), "client", "public", "product-images"),
    path.join(process.cwd(), "dist", "public", "product-images"),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }
  const fallback = candidates[0];
  fs.mkdirSync(fallback, { recursive: true });
  return fallback;
}

const IMAGE_DIR = getImageDir();

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

    const filename = `product-${productId}.webp`;
    const filepath = path.join(IMAGE_DIR, filename);
    fs.writeFileSync(filepath, webpBuffer);

    const localPath = `/product-images/${filename}?v=${Date.now()}`;
    console.log(`[image] Converted product ${productId} -> ${filename} (${Math.round(webpBuffer.length / 1024)} KB)`);
    return localPath;
  } catch (err: any) {
    console.log(`[image] Error processing product ${productId}: ${err.message}`);
    return null;
  }
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

    const filename = `product-${product.id}.webp`;
    const filepath = path.join(IMAGE_DIR, filename);
    const fileExists = fs.existsSync(filepath);

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
        img: `/product-images/${filename}`,
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
