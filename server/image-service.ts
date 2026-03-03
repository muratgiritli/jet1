import sharp from "sharp";
import { db } from "./storage";
import { productImages } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function saveProductImage(buffer: Buffer, productId: number): Promise<string> {
  const webpBuffer = await sharp(buffer)
    .resize(800, 800, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const base64 = webpBuffer.toString("base64");

  await db
    .insert(productImages)
    .values({ productId, data: base64, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: productImages.productId,
      set: { data: base64, updatedAt: new Date() },
    });

  const imgPath = `/api/product-image/${productId}?v=${Date.now()}`;
  console.log(`[image] Saved product ${productId} (${Math.round(webpBuffer.length / 1024)} KB)`);
  return imgPath;
}

export async function getProductImage(productId: number): Promise<Buffer | null> {
  const [row] = await db
    .select({ data: productImages.data })
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .limit(1);

  if (!row) return null;
  return Buffer.from(row.data, "base64");
}

export async function downloadAndSaveImage(imageUrl: string, productId: number): Promise<string | null> {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "image/*",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.log(`[image] Download failed for product ${productId}: HTTP ${response.status}`);
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return await saveProductImage(buffer, productId);
  } catch (err: any) {
    console.log(`[image] Error downloading product ${productId}: ${err.message}`);
    return null;
  }
}

export async function hasProductImage(productId: number): Promise<boolean> {
  const [row] = await db
    .select({ productId: productImages.productId })
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .limit(1);
  return !!row;
}
