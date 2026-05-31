import { db, storage } from "./storage";
import { downloadAndSaveImage } from "./image-service";
import { products } from "@shared/schema";

const BASE = "https://www.bypetvet.com";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

type Collection = {
  slug: string;
  alt?: string[];
  display: string;
  sort: number;
};

const COLLECTIONS: Collection[] = [
  { slug: "renal-kedi-mamalari", display: "Renal (Böbrek) Kedi Maması", sort: 1 },
  { slug: "renal-kopek-mamalari", display: "Renal (Böbrek) Köpek Maması", sort: 2 },
  { slug: "gastrointestinal-kedi-mamalari", display: "Gastrointestinal (Sindirim) Kedi Maması", sort: 3 },
  { slug: "gastrointestinal-kopek-mamalari", display: "Gastrointestinal (Sindirim) Köpek Maması", sort: 4 },
  { slug: "diabetic-obesity-diyet-kedi-mamalari", display: "Diyabet & Obezite Diyet Kedi Maması", sort: 5 },
  { slug: "diabetic-obesity-diyet-kopek-mamalari", display: "Diyabet & Obezite Diyet Köpek Maması", sort: 6 },
  { slug: "uriner-sistem-kedi-mamalari", display: "Üriner Sistem Kedi Maması", sort: 7 },
  { slug: "uriner-sistem-kopek-mamalari", display: "Üriner Sistem Köpek Maması", sort: 8 },
  { slug: "hepatic-kedi-mamalari", display: "Hepatic (Karaciğer) Kedi Maması", sort: 9 },
  { slug: "hepatic-kopek-mamalari", display: "Hepatic (Karaciğer) Köpek Maması", sort: 10 },
  { slug: "hipoalerjik-deri-ve-tuy-sagligi-kedi-mamalari", display: "Hipoalerjik Deri & Tüy Kedi Maması", sort: 11 },
  { slug: "hipoalerjik-deri-ve-tuy-destegi-kopek-mamalari", display: "Hipoalerjik Deri & Tüy Köpek Maması", sort: 12 },
  { slug: "cardiac-kedi-mamalari", display: "Cardiac (Kalp) Kedi Maması", sort: 13 },
  { slug: "cardiac-kopek-mamalari", display: "Cardiac (Kalp) Köpek Maması", sort: 14 },
  { slug: "veteriner-seri-kedi-mamalari", alt: ["veteriner-serisi-kedi-mamalari", "petshop-serisi-kedi-mamalari"], display: "Veteriner Seri Kedi Maması", sort: 15 },
  { slug: "veteriner-seri-kopek-mamalari", alt: ["veteriner-serisi-kopek-mamalari", "petshop-serisi-kopek-mamalari"], display: "Veteriner Seri Köpek Maması", sort: 16 },
];

type Card = {
  extId: string;
  href: string;
  name: string;
  brand: string;
  img: string | null;
  price: number | null;
  original: number | null;
};

function trPrice(s: string | null | undefined): number | null {
  if (!s) return null;
  const cleaned = s.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

function brandSlug(brand: string): string {
  const b = brand.toLowerCase();
  if (b.includes("hills") || b.includes("hill's")) return "hills";
  if (b.includes("royal canin")) return "royal-canin";
  if (b.includes("pro plan") || b.includes("proplan") || b.includes("purina")) return "pro-plan";
  if (b.includes("virbac")) return "virbac";
  if (b.includes("prochoice")) return "prochoice";
  if (b.includes("brit")) return "brit";
  if (b.includes("n&d") || b.includes("farmina")) return "nd";
  if (b.includes("reflex")) return "reflex";
  if (b.includes("spectrum")) return "spectrum";
  if (b.includes("enjoy")) return "enjoy";
  return b
    .replace(/&/g, " ve ")
    .replace(/[^a-z0-9ğüşıöç\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-") || "diger";
}

function parseCards(html: string): Card[] {
  const cards: Card[] = [];
  const articles = html.match(/<article class="listing-product-card[\s\S]*?<\/article>/g) || [];
  for (const a of articles) {
    const hrefM = a.match(/href="(https:\/\/www\.bypetvet\.com\/product\/[^"]+)"/);
    const href = hrefM ? hrefM[1] : "";
    const idM = href.match(/-(\d+)$/);
    const extId = idM ? idM[1] : href;
    const imgM = a.match(/<img[^>]+src="(https:\/\/www\.bypetvet\.com\/storage\/derived\/webp\/[^"]+)"/);
    const img = imgM ? imgM[1] : null;
    const brandM = a.match(/tracking-wider text-slate-500">\s*([^<]+?)\s*</);
    const brand = brandM ? brandM[1].trim() : "Veteriner";
    const nameM = a.match(/class="[^"]*text-\[13\.5px\][^"]*">\s*([\s\S]*?)\s*<\/a>/);
    const name = nameM ? nameM[1].replace(/\s+/g, " ").trim() : "";
    const origM = a.match(/line-through">\s*([\d.,]+)\s*₺/);
    const original = trPrice(origM ? origM[1] : null);
    const priceM = a.match(/text-lg font-extrabold[^>]*>\s*([\d.,]+)\s*<\/span>/);
    const price = trPrice(priceM ? priceM[1] : null);
    if (href && name) cards.push({ extId, href, name, brand, img, price, original });
  }
  return cards;
}

type Logger = (msg: string) => void;

async function fetchCollectionCards(col: Collection, log: Logger): Promise<Card[]> {
  const slugsToTry = [col.slug, ...(col.alt || [])];
  for (const slug of slugsToTry) {
    const url = `${BASE}/products/${slug}`;
    const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(15000) });
    if (!res.ok) continue;
    const html = await res.text();
    let cards = parseCards(html);
    if (cards.length === 0) continue;
    const seen = new Set(cards.map((c) => c.extId));
    for (let page = 2; page <= 25; page++) {
      let pageHtml = "";
      try {
        const r = await fetch(`${url}?page=${page}`, {
          headers: { "User-Agent": UA, Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
          signal: AbortSignal.timeout(15000),
        });
        if (!r.ok) break;
        const j: any = await r.json();
        pageHtml = j?.html || "";
      } catch {
        break;
      }
      const more = parseCards(pageHtml).filter((c) => !seen.has(c.extId));
      if (more.length === 0) break;
      more.forEach((c) => seen.add(c.extId));
      cards = cards.concat(more);
    }
    log(`[collection] ${slug}: ${cards.length} ürün`);
    return cards;
  }
  log(`[collection] ${col.slug}: 0 ürün (bulunamadı)`);
  return [];
}

function cleanDesc(frag: string): string {
  let s = frag;
  s = s.replace(/<(script|style)[\s\S]*?<\/\1>/gi, "");
  s = s.replace(/<!--[\s\S]*?-->/g, "");
  s = s.replace(/\sstyle="[^"]*"/gi, "");
  s = s.replace(/\sclass="[^"]*"/gi, "");
  s = s.replace(/\s(data-[a-z-]+|id|aria-[a-z]+)="[^"]*"/gi, "");
  s = s.replace(/<(div|span|section|figure)[^>]*>/gi, "");
  s = s.replace(/<\/(div|span|section|figure)>/gi, "");
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

async function fetchDescription(href: string): Promise<string | null> {
  try {
    const res = await fetch(href, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(12000) });
    if (!res.ok) return null;
    const html = await res.text();
    const idx = html.indexOf("store-product-description");
    if (idx === -1) return null;
    const region = html.slice(idx, idx + 20000);
    const h2M = region.match(/<h2[^>]*>[\s\S]*?<\/h2>/i);
    const blocks = region.match(/richText-content">([\s\S]*?)<\/div>\s*<\/div>/gi) || [];
    let body = "";
    if (blocks.length) {
      body = blocks.map((b) => b.replace(/^.*?richText-content">/i, "").replace(/<\/div>\s*<\/div>$/i, "")).join(" ");
    } else {
      const pAll = region.match(/<p[\s\S]*?<\/p>/gi) || [];
      body = pAll.slice(0, 12).join(" ");
    }
    let out = (h2M ? h2M[0] : "") + body;
    out = cleanDesc(out);
    if (out.length < 30) return null;
    return out.slice(0, 9000);
  } catch {
    return null;
  }
}

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    p.catch(() => fallback),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

async function pool<T>(items: T[], size: number, fn: (item: T) => Promise<void>) {
  let i = 0;
  const workers = Array.from({ length: size }, async () => {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx]);
    }
  });
  await Promise.all(workers);
}

export type VetImportStatus = {
  running: boolean;
  created: number;
  skipped: number;
  done: boolean;
  error: string | null;
  startedAt: number | null;
  finishedAt: number | null;
};

const status: VetImportStatus = {
  running: false,
  created: 0,
  skipped: 0,
  done: false,
  error: null,
  startedAt: null,
  finishedAt: null,
};

export function getVetImportStatus(): VetImportStatus {
  return { ...status };
}

export function isVetImportRunning(): boolean {
  return status.running;
}

export async function runVetImport(log: Logger = () => {}): Promise<VetImportStatus> {
  if (status.running) {
    log("[uyarı] İçe aktarma zaten çalışıyor");
    return getVetImportStatus();
  }
  status.running = true;
  status.created = 0;
  status.skipped = 0;
  status.done = false;
  status.error = null;
  status.startedAt = Date.now();
  status.finishedAt = null;

  log("=== Veteriner import başladı ===");
  try {
    const existingSubs = await storage.getAllSubcategories();
    const subBySlug = new Map(existingSubs.filter((s) => s.animal === "veteriner").map((s) => [s.slug, s]));

    const existingBrandCats = await storage.getAllBrandCategories();
    const brandKey = (sub: string, slug: string) => `${sub}::${slug}`;
    const bcMap = new Map(
      existingBrandCats.filter((b) => b.animal === "veteriner").map((b) => [brandKey(b.subcategory, b.brandSlug), b]),
    );

    const allProducts = await db.select().from(products);
    const existingProductKeys = new Set(allProducts.map((p) => `${p.brandCategoryId}::${p.name}`));

    for (const col of COLLECTIONS) {
      const cards = await fetchCollectionCards(col, log);
      if (cards.length === 0) continue;

      if (!subBySlug.has(col.slug)) {
        const sub = await storage.createSubcategory({
          animal: "veteriner",
          slug: col.slug,
          displayName: col.display,
          color: "#5848A3",
          hasBrands: true,
          sortOrder: col.sort,
          isActive: true,
        } as any);
        subBySlug.set(col.slug, sub);
      }

      for (const card of cards) {
        const bSlug = brandSlug(card.brand);
        const key = brandKey(col.slug, bSlug);
        if (!bcMap.has(key)) {
          const bc = await storage.createBrandCategory({
            brandName: card.brand,
            brandSlug: bSlug,
            animal: "veteriner",
            subcategory: col.slug,
          } as any);
          bcMap.set(key, bc);
        }
      }

      await pool(cards, 3, async (card) => {
        const bSlug = brandSlug(card.brand);
        const bc = bcMap.get(brandKey(col.slug, bSlug))!;
        const pkey = `${bc.id}::${card.name}`;
        if (existingProductKeys.has(pkey)) {
          status.skipped++;
          return;
        }
        existingProductKeys.add(pkey);
        try {
          const desc = await withTimeout(fetchDescription(card.href), 16000, null);
          const price = card.price ?? card.original ?? 0;
          const original = card.original && card.original > price ? card.original : null;
          const product = await storage.createProduct({
            name: card.name,
            price,
            originalPrice: original,
            skt: null,
            longDescription: desc,
            brandCategoryId: bc.id,
            stock: 0,
            img: card.img,
          } as any);
          if (card.img) {
            const imgPath = await withTimeout(downloadAndSaveImage(card.img, product.id), 22000, null);
            if (imgPath) await storage.updateProduct(product.id, { img: imgPath });
          }
          status.created++;
          if (status.created % 20 === 0) log(`[progress] ${status.created} ürün eklendi...`);
        } catch (err: any) {
          log(`[hata] ${card.name}: ${err?.message || err}`);
        }
      });
    }

    log(`=== Bitti. Eklendi: ${status.created}, Atlandı: ${status.skipped} ===`);
    status.done = true;
  } catch (err: any) {
    status.error = err?.message || String(err);
    log(`[FATAL] ${status.error}`);
  } finally {
    status.running = false;
    status.finishedAt = Date.now();
  }
  return getVetImportStatus();
}
