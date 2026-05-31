import { storage } from "./storage";

type LogFn = (msg: string) => void;

interface SeoFillStatus {
  running: boolean;
  total: number;
  updated: number;
  skipped: number;
  done: boolean;
  error: string | null;
  startedAt: number | null;
  finishedAt: number | null;
}

let status: SeoFillStatus = {
  running: false,
  total: 0,
  updated: 0,
  skipped: 0,
  done: false,
  error: null,
  startedAt: null,
  finishedAt: null,
};

export function getSeoFillStatus(): SeoFillStatus {
  return { ...status };
}

export function isSeoFillRunning(): boolean {
  return status.running;
}

const TITLE_SUFFIXES = [
  " - Samsun Aynı Gün Teslim | JETGO",
  " - Samsun Pet Shop | JETGO",
  " | JETGO Pet Shop Samsun",
  " | JETGO Pet Shop",
  " | JETGO",
];

function buildTitle(name: string): string {
  const n = name.trim();
  for (const s of TITLE_SUFFIXES) {
    if ((n + s).length <= 60) return n + s;
  }
  if (n.length <= 60) return n;
  return n.slice(0, 57).replace(/\s+\S*$/, "").trimEnd() + "...";
}

function buildDescription(name: string, price: number, originalPrice: number | null, brand: string): string {
  const n = name.trim();
  const priceStr = Math.round(price).toLocaleString("tr-TR");
  const payClause = brand
    ? ` ${brand} ürünlerinde kapıda nakit/kart ödeme, hızlı ve güvenli teslimat.`
    : ` Kapıda nakit/kart ödeme, hızlı ve güvenli teslimat.`;
  let d = `${n}, Samsun'da ${priceStr} TL fiyatla aynı gün kapıya teslim.${payClause} JETGO Pet Shop'tan online sipariş verin.`;
  const fillers = [
    " Uygun fiyat, güvenilir hizmet.",
    " Samsun içi hızlı gönderim.",
    " Samsun'un güvenilir pet shop'u JETGO.",
  ];
  let fi = 0;
  while (d.length < 140 && fi < fillers.length) {
    d += fillers[fi++];
  }
  if (d.length > 160) {
    d = d.slice(0, 159).replace(/\s+\S*$/, "").replace(/[\s,;:.\-/]+$/, "").trimEnd() + ".";
  }
  if (d.length > 160) {
    d = d.slice(0, 160);
  }
  return d;
}

function buildKeywords(name: string, brand: string): string {
  const n = name.trim().toLowerCase();
  const words = n.split(/\s+/).filter(Boolean);
  const firstTwo = words.slice(0, 2).join(" ");
  const parts = [
    n,
    brand ? brand.toLowerCase() : "",
    brand ? `${brand.toLowerCase()} samsun` : "",
    `${firstTwo} samsun`,
    "samsun pet shop",
    "samsun petshop",
    "kapıda ödeme",
    "aynı gün teslimat",
  ];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const v = p.trim();
    if (v && !seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out.join(", ");
}

export async function runSeoFill(log: LogFn, opts: { overwrite?: boolean } = {}): Promise<SeoFillStatus> {
  if (status.running) throw new Error("SEO doldurma zaten çalışıyor");
  const overwrite = !!opts.overwrite;
  status = {
    running: true,
    total: 0,
    updated: 0,
    skipped: 0,
    done: false,
    error: null,
    startedAt: Date.now(),
    finishedAt: null,
  };

  try {
    log(`=== SEO doldurma başladı (overwrite=${overwrite}) ===`);
    const [allProducts, brandCats] = await Promise.all([
      storage.getAllProducts(),
      storage.getAllBrandCategories(),
    ]);
    const brandById = new Map<number, string>();
    for (const bc of brandCats) brandById.set(bc.id, bc.brandName);

    status.total = allProducts.length;
    log(`Toplam ürün: ${allProducts.length}`);

    for (const p of allProducts) {
      const brand = brandById.get(p.brandCategoryId) || "";
      const patch: { metaTitle?: string; metaDescription?: string; metaKeywords?: string } = {};

      if (overwrite || !(p.metaTitle && p.metaTitle.trim())) {
        patch.metaTitle = buildTitle(p.name);
      }
      if (overwrite || !(p.metaDescription && p.metaDescription.trim())) {
        patch.metaDescription = buildDescription(p.name, p.price, p.originalPrice ?? null, brand);
      }
      if (overwrite || !(p.metaKeywords && p.metaKeywords.trim())) {
        patch.metaKeywords = buildKeywords(p.name, brand);
      }

      if (Object.keys(patch).length === 0) {
        status.skipped++;
      } else {
        await storage.updateProduct(p.id, patch);
        status.updated++;
      }

      if ((status.updated + status.skipped) % 100 === 0) {
        log(`[ilerleme] ${status.updated} güncellendi, ${status.skipped} atlandı...`);
      }
    }

    log(`=== Bitti. Güncellendi: ${status.updated}, Atlandı: ${status.skipped} ===`);
    status.done = true;
    return getSeoFillStatus();
  } catch (err: any) {
    status.error = err?.message || String(err);
    log(`[HATA] ${status.error}`);
    throw err;
  } finally {
    status.running = false;
    status.finishedAt = Date.now();
  }
}
