import { pool } from "./storage";
import { STORES, type StoreGoogle } from "@shared/stores";

// Her domain'in Google etiketleri (GTM / GA4 / Ads / Search Console meta) artık
// koda gömülü değil; admin panelinden DB'ye yazılır ve redeploy gerekmeden
// canlıya yansır. app_settings içinde "<storeId>:google_tags" anahtarında tek bir
// JSON değeri olarak saklanır. ASLA "all"/ortak taban yoktur: her domain Google'a
// karşı bağımsız bir mülktür, bu yüzden yalnızca kendi anahtarı okunur.

const KEY_SUFFIX = ":google_tags";
const TTL_MS = 60_000;
const MAX_IDS = 10;
const MAX_ID_LEN = 64;
const MAX_VERIFY_LEN = 256;

const VALID_STORE_IDS = new Set(STORES.map((s) => s.id));

// HTML her istekte sunulduğu için DB'ye her seferinde gitmemek adına tüm google
// config'leri kısa TTL'li bir cache'te tutulur; yazımda anında geçersiz kılınır.
let cache: Map<string, StoreGoogle> = new Map();
let cacheTs = 0;

function cleanList(v: unknown): string[] {
  let arr: string[] = [];
  if (Array.isArray(v)) arr = v.map((x) => String(x));
  else if (typeof v === "string") arr = v.split(/[\n,]/);
  const seen = new Set<string>();
  const out: string[] = [];
  for (let s of arr) {
    s = s.trim();
    if (!s) continue;
    if (s.length > MAX_ID_LEN) s = s.slice(0, MAX_ID_LEN);
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
    if (out.length >= MAX_IDS) break;
  }
  return out;
}

// Admin'den gelen ham girdiyi temiz bir StoreGoogle'a indirger. Render anında
// sanitizeGId/escapeHtml ek güvenlik katmanı olarak yine uygulanır.
export function normalizeGoogleConfig(raw: any): StoreGoogle {
  const cfg: StoreGoogle = {};
  if (raw && typeof raw === "object") {
    const gtm = typeof raw.gtmId === "string" ? raw.gtmId.trim().slice(0, MAX_ID_LEN) : "";
    if (gtm) cfg.gtmId = gtm;
    const ga4 = cleanList(raw.ga4Ids);
    if (ga4.length) cfg.ga4Ids = ga4;
    const ads = cleanList(raw.adsIds);
    if (ads.length) cfg.adsIds = ads;
    const sv = typeof raw.siteVerification === "string" ? raw.siteVerification.trim().slice(0, MAX_VERIFY_LEN) : "";
    if (sv) cfg.siteVerification = sv;
  }
  return cfg;
}

async function loadAll(): Promise<Map<string, StoreGoogle>> {
  const m = new Map<string, StoreGoogle>();
  const { rows } = await pool.query(
    `SELECT key, value FROM app_settings WHERE key LIKE $1`,
    [`%${KEY_SUFFIX}`],
  );
  for (const r of rows) {
    const key: string = r.key;
    if (!key.endsWith(KEY_SUFFIX)) continue;
    const storeId = key.slice(0, -KEY_SUFFIX.length);
    if (!VALID_STORE_IDS.has(storeId)) continue;
    try {
      m.set(storeId, normalizeGoogleConfig(JSON.parse(r.value ?? "{}")));
    } catch {
      // bozuk satırı yok say
    }
  }
  return m;
}

async function ensureCache(): Promise<Map<string, StoreGoogle>> {
  const now = Date.now();
  if (cacheTs > 0 && now - cacheTs < TTL_MS) return cache;
  cache = await loadAll();
  cacheTs = now;
  return cache;
}

export function invalidateGoogleCache(): void {
  cacheTs = 0;
}

// Bir store'un DB override'ı; yoksa null. DB hatasında null'a düşer (fail-closed)
// böylece HTML sunumu hiçbir zaman bozulmaz, statik koda gömülü değere geri düşülür.
export async function getStoreGoogleConfig(storeId: string): Promise<StoreGoogle | null> {
  try {
    const m = await ensureCache();
    return m.get(storeId) ?? null;
  } catch {
    return null;
  }
}

export async function setStoreGoogleConfig(storeId: string, raw: any): Promise<StoreGoogle> {
  if (!VALID_STORE_IDS.has(storeId)) throw new Error("invalid store");
  const cfg = normalizeGoogleConfig(raw);
  await pool.query(
    "INSERT INTO app_settings (key, value, updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=NOW()",
    [storeId + KEY_SUFFIX, JSON.stringify(cfg)],
  );
  invalidateGoogleCache();
  return cfg;
}

// DB override'ı kaldırır; store yeniden statik koda gömülü değere döner.
export async function deleteStoreGoogleConfig(storeId: string): Promise<void> {
  if (!VALID_STORE_IDS.has(storeId)) throw new Error("invalid store");
  await pool.query("DELETE FROM app_settings WHERE key = $1", [storeId + KEY_SUFFIX]);
  invalidateGoogleCache();
}

export type GoogleTagRow = {
  id: string;
  name: string;
  domain: string;
  override: StoreGoogle | null;
  static: StoreGoogle | null;
  effective: StoreGoogle;
  hasOverride: boolean;
  source: "db" | "static" | "none";
};

// Admin listesi: her store için DB override + statik varsayılan + etkin (effective).
export async function getAllStoreGoogleConfigs(): Promise<GoogleTagRow[]> {
  const m = await ensureCache();
  return STORES.map((s) => {
    const override = m.get(s.id) ?? null;
    const staticCfg = s.google ?? null;
    const hasOverride = override != null;
    const effective: StoreGoogle = hasOverride ? override! : (staticCfg ?? {});
    return {
      id: s.id,
      name: s.name,
      domain: s.domain,
      override,
      static: staticCfg,
      effective,
      hasOverride,
      source: hasOverride ? "db" : staticCfg ? "static" : "none",
    };
  });
}
