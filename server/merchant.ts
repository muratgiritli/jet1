import { pool } from "./storage";
import { STORES } from "@shared/stores";

// Her domain'in Google Merchant Center kurulumu admin panelinden DB'ye yazılır.
// app_settings içinde "<storeId>:merchant" anahtarında tek bir JSON değeri olarak
// saklanır. Her domain Google'a karşı bağımsız bir mülktür (ayrı Merchant hesabı),
// bu yüzden ASLA "all"/ortak taban yoktur; yalnızca kendi anahtarı okunur.

const KEY_SUFFIX = ":merchant";
const TTL_MS = 60_000;
const MAX_ID_LEN = 20;

const VALID_STORE_IDS = new Set(STORES.map((s) => s.id));

let cache: Map<string, MerchantConfig> = new Map();
let cacheTs = 0;

export interface MerchantConfig {
  /** Google Merchant Center hesap (mağaza) kimliği — yalnızca rakam. Kayıt amaçlı. */
  merchantId?: string;
  /** Feed'deki kargo/teslimat ücreti override'ı ("X.XX"). Boş => ticaret modeline
   *  göre otomatik (kargo: cargo_fee, aynı gün: 0.00). */
  shippingAmount?: string;
  /** Google Business Profile mağaza kodu — yerel envanter (Local Inventory) feed'i
   *  için. Business Profile'daki konumun store code'u ile birebir aynı olmalı.
   *  Boşsa yerel envanter feed'i ürün satırı üretmez. */
  storeCode?: string;
}

export function normalizeMerchantConfig(raw: any): MerchantConfig {
  const cfg: MerchantConfig = {};
  if (raw && typeof raw === "object") {
    if (raw.merchantId != null) {
      const id = String(raw.merchantId).replace(/\D/g, "").slice(0, MAX_ID_LEN);
      if (id) cfg.merchantId = id;
    }
    if (raw.shippingAmount != null && String(raw.shippingAmount).trim() !== "") {
      const n = Number(String(raw.shippingAmount).replace(",", "."));
      if (Number.isFinite(n) && n >= 0) cfg.shippingAmount = n.toFixed(2);
    }
    if (raw.storeCode != null && String(raw.storeCode).trim() !== "") {
      const sc = String(raw.storeCode).replace(/[\x00-\x1F\x7F]/g, "").trim().slice(0, 60);
      if (sc) cfg.storeCode = sc;
    }
  }
  return cfg;
}

async function loadAll(): Promise<Map<string, MerchantConfig>> {
  const m = new Map<string, MerchantConfig>();
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
      m.set(storeId, normalizeMerchantConfig(JSON.parse(r.value ?? "{}")));
    } catch {
      // bozuk satırı yok say
    }
  }
  return m;
}

async function ensureCache(): Promise<Map<string, MerchantConfig>> {
  const now = Date.now();
  if (cacheTs > 0 && now - cacheTs < TTL_MS) return cache;
  cache = await loadAll();
  cacheTs = now;
  return cache;
}

export function invalidateMerchantCache(): void {
  cacheTs = 0;
}

// Bir store'un merchant config'i; yoksa null. DB hatasında null'a düşer (fail-closed)
// böylece feed üretimi hiçbir zaman bozulmaz, ticaret modeline göre varsayılana düşer.
export async function getStoreMerchantConfig(storeId: string): Promise<MerchantConfig | null> {
  try {
    const m = await ensureCache();
    return m.get(storeId) ?? null;
  } catch {
    return null;
  }
}

export async function setStoreMerchantConfig(storeId: string, raw: any): Promise<MerchantConfig> {
  if (!VALID_STORE_IDS.has(storeId)) throw new Error("invalid store");
  const cfg = normalizeMerchantConfig(raw);
  await pool.query(
    "INSERT INTO app_settings (key, value, updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=NOW()",
    [storeId + KEY_SUFFIX, JSON.stringify(cfg)],
  );
  invalidateMerchantCache();
  return cfg;
}

export async function deleteStoreMerchantConfig(storeId: string): Promise<void> {
  if (!VALID_STORE_IDS.has(storeId)) throw new Error("invalid store");
  await pool.query("DELETE FROM app_settings WHERE key = $1", [storeId + KEY_SUFFIX]);
  invalidateMerchantCache();
}

export type MerchantRow = {
  id: string;
  name: string;
  domain: string;
  fulfillment: "local" | "cargo";
  feedUrl: string;
  localFeedUrl: string;
  config: MerchantConfig;
  hasConfig: boolean;
};

// Admin listesi: her store için merchant config + feed adresi + teslimat modeli.
export async function getAllStoreMerchantConfigs(): Promise<MerchantRow[]> {
  const m = await ensureCache();
  return STORES.map((s) => {
    const config = m.get(s.id) ?? {};
    return {
      id: s.id,
      name: s.name,
      domain: s.domain,
      fulfillment: s.commerce.fulfillment,
      feedUrl: `${s.domain}/google-merchant.xml`,
      localFeedUrl: `${s.domain}/google-local-inventory.xml`,
      config,
      hasConfig: m.has(s.id),
    };
  });
}
