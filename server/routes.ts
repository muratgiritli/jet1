import crypto from "crypto";
import type { Express, Request, Response, NextFunction } from "express";
import { type Server } from "http";
import { storage, pool as sharedPool, db } from "./storage";
import { seedDatabase } from "./seed";
import { insertBrandCategorySchema, insertProductSchema, insertCrossSellSectionSchema, insertCrossSellItemSchema, insertOrderSchema, orderItemSchema, insertBreedStatSchema, insertStockAlertSchema, orders, virtualPets, petContestEntries, petContestVotes, productReviews, insertContactMessageSchema, brandCategories } from "@shared/schema";
import { getStoreByHost, STORES, brandifyFor, canonicalHost, DEFAULT_STORE } from "@shared/stores";
import { eq, desc, and, sql } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { saveProductImage, getProductImage, downloadAndSaveImage } from "./image-service";
import { runVetImport, getVetImportStatus, isVetImportRunning } from "./vet-import";
import { runSeoFill, getSeoFillStatus, isSeoFillRunning } from "./seo-fill";
import multer from "multer";
import OpenAI from "openai";
import { getSeoPagesForStore, getSitemapPagesForStore, isCargoStore } from "../client/src/lib/seo-data";
import { getAllStoreGoogleConfigs, setStoreGoogleConfig, deleteStoreGoogleConfig } from "./google-tags";
import { getAllStoreMerchantConfigs, getStoreMerchantConfig, setStoreMerchantConfig, deleteStoreMerchantConfig, effectiveStoreCode } from "./merchant";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function parseSkt(skt: string): Date | null {
  if (skt.includes("/")) {
    const parts = skt.split("/");
    if (parts.length === 2) {
      const month = parseInt(parts[0]);
      const year = parseInt(parts[1]);
      if (!isNaN(month) && !isNaN(year) && month >= 1 && month <= 12) {
        return new Date(year, month, 0);
      }
    }
  }
  if (skt.includes(".")) {
    const parts = skt.split(".");
    if (parts.length === 3) {
      const month = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      if (!isNaN(month) && !isNaN(year) && month >= 1 && month <= 12) {
        return new Date(year, month, 0);
      }
    }
    if (parts.length === 2) {
      const month = parseInt(parts[0]);
      const year = parseInt(parts[1]);
      if (!isNaN(month) && !isNaN(year) && month >= 1 && month <= 12) {
        return new Date(year, month, 0);
      }
    }
  }
  return null;
}

const otpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();
const otpSendCount = new Map<string, { count: number; resetAt: number }>();

const apiRateLimits = new Map<string, { count: number; resetAt: number }>();
function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = apiRateLimits.get(key);
  if (!entry || entry.resetAt <= now) {
    apiRateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count++;
  return entry.count > maxRequests;
}
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of apiRateLimits) {
    if (val.resetAt <= now) apiRateLimits.delete(key);
  }
  for (const [key, val] of otpStore) {
    if (val.expiresAt <= now) otpStore.delete(key);
  }
  for (const [key, val] of otpSendCount) {
    if (val.resetAt <= now) otpSendCount.delete(key);
  }
  for (const [key, val] of loginAttempts) {
    if ((val.blockedUntil > 0 && val.blockedUntil <= now) || (val.blockedUntil === 0 && val.count > 0)) loginAttempts.delete(key);
  }
  if (apiRateLimits.size > 10000) apiRateLimits.clear();
  if (loginAttempts.size > 5000) loginAttempts.clear();
  if (otpStore.size > 5000) otpStore.clear();
  if (otpSendCount.size > 5000) otpSendCount.clear();
}, 60000);

const loginAttempts = new Map<string, { count: number; blockedUntil: number }>();

function generateOTP(): string {
  return crypto.randomInt(1000, 10000).toString();
}

// Test-only OTP bypass: lets automated e2e/integration tests complete the
// SMS-gated registration/checkout without a real SMS code. Double-guarded so it
// can NEVER run in production: requires NODE_ENV !== "production" AND an explicit
// TEST_OTP_BYPASS=1 env flag (set only in the development environment).
// Evaluated per request so tests can toggle the flag at runtime.
const TEST_OTP_CODE = "0000";
export function isTestOtpBypass(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.TEST_OTP_BYPASS === "1";
}

function normalizeTrSms(s: string): string {
  if (!s) return "";
  const map: Record<string, string> = {
    "ı":"i","İ":"I","ş":"s","Ş":"S","ğ":"g","Ğ":"G",
    "ü":"u","Ü":"U","ö":"o","Ö":"O","ç":"c","Ç":"C",
  };
  return s.replace(/[ıİşŞğĞüÜöÖçÇ]/g, (c) => map[c] || c);
}

// Türk cep numarasını kanonik forma indirger: baştaki +90 / 90 / 0 atılır, 5XXXXXXXXX (10 hane)
// döner. Yasaklı numara eşleştirmesi farklı yazımlardan (05.., +90 5.., 5..) etkilenmesin diye.
function canonicalTrPhone(raw: string): string {
  let d = (raw || "").replace(/\D/g, "");
  if (d.startsWith("90")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d;
}

async function sendSmsViaNetgsm(phone: string, message: string, msgheaderOverride?: string): Promise<boolean> {
  // Test/e2e guard: when running under the OTP bypass (NODE_ENV !== production AND
  // TEST_OTP_BYPASS=1), NEVER hit the real NetGSM API. The e2e suite places real
  // orders across every store on each run, and the buyer/admin "siparişiniz alındı"
  // SMS paths are not otherwise gated — without this, every test run burns real SMS
  // credits (the suite uses fake 5XX numbers, so they queue but never deliver).
  // Return true so claim-before-send dedup flags still behave as "sent".
  // Exception: tests that explicitly want to exercise this function's logic install
  // an SMS capture (mocking global fetch, so no real network is touched) and set
  // TEST_SMS_CAPTURE=1 — let those proceed so they can count/inspect the payload.
  if (isTestOtpBypass() && process.env.TEST_SMS_CAPTURE !== "1") {
    console.log("NetGSM send skipped (TEST_OTP_BYPASS active, no SMS capture)");
    return true;
  }
  const usercode = process.env.NETGSM_USERCODE;
  const password = process.env.NETGSM_PASSWORD;
  const msgheader = (msgheaderOverride && msgheaderOverride.trim()) || process.env.NETGSM_MSGHEADER;
  if (!usercode || !password || !msgheader) {
    console.error("NetGSM credentials not configured");
    return false;
  }
  message = normalizeTrSms(message);
  const gsmno = phone.replace(/\D/g, "");
  const fullPhone = gsmno.startsWith("90") ? gsmno : "90" + gsmno;
  const maskedPhone = fullPhone.length >= 6 ? `${fullPhone.slice(0,4)}****${fullPhone.slice(-2)}` : "****";
  console.log(`NetGSM sending to: ${maskedPhone}`);

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<mainbody>
<header>
<company dession="1">Netgsm</company>
<usercode>${usercode}</usercode>
<password>${password}</password>
<type>1:n</type>
<msgheader>${msgheader}</msgheader>
</header>
<body>
<msg><![CDATA[${message}]]></msg>
<no>${fullPhone}</no>
</body>
</mainbody>`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch("https://api.netgsm.com.tr/sms/send/xml", {
        method: "POST",
        headers: { "Content-Type": "application/xml" },
        body: xmlBody,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const text = await res.text();
      console.log(`NetGSM response (attempt ${attempt}):`, text);
      const code = text.split(" ")[0];
      if (["00", "01", "02"].includes(code)) return true;
      if (["30", "40", "50", "51", "70", "80", "85"].includes(code)) {
        console.error(`NetGSM permanent error code: ${code}`);
        return false;
      }
    } catch (err: any) {
      console.error(`NetGSM SMS error (attempt ${attempt}):`, err?.message || err);
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
        continue;
      }
    }
  }

  try {
    console.log("NetGSM XML failed, trying GET fallback...");
    const params = new URLSearchParams({
      usercode,
      password,
      gsmno: fullPhone,
      message,
      msgheader,
      dil: "TR",
    });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(`https://api.netgsm.com.tr/sms/send/get/?${params.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const text = await res.text();
    console.log("NetGSM GET fallback response:", text);
    const code = text.split(" ")[0];
    return ["00", "01", "02"].includes(code);
  } catch (err: any) {
    console.error("NetGSM GET fallback error:", err?.message || err);
    return false;
  }
}

// Sends the admin "new order" SMS exactly once per order. Reads admin_phone +
// order_notification_sms from app_settings, then atomically claims the order's
// admin_sms_sent flag so concurrent payment callbacks/webhooks never double-send.
async function notifyAdminNewOrder(orderId: number, paymentConfirmed = false): Promise<void> {
  try {
    if (!orderId) return;
    const cfgRows = await sharedPool.query(
      "SELECT key, value FROM app_settings WHERE key IN ('admin_phone','order_notification_sms')"
    );
    const cfg: Record<string, string> = {};
    for (const r of cfgRows.rows) cfg[r.key] = r.value;
    if (!cfg.admin_phone || cfg.order_notification_sms === "0") return;
    const claim = await sharedPool.query(
      "UPDATE orders SET admin_sms_sent = true WHERE id = $1 AND admin_sms_sent = false RETURNING id, customer_name, grand_total, payment_method, items",
      [orderId]
    );
    if (claim.rowCount === 0) return;
    const ord = claim.rows[0];
    const itemsArr = Array.isArray(ord.items) ? ord.items : [];
    const smsMsg = `YENI SIPARIS #${ord.id}\n${ord.customer_name || "Bilinmeyen"}\nTutar: ${ord.grand_total} TL\nOdeme: ${ord.payment_method}${paymentConfirmed ? " (Onaylandi)" : ""}\n${itemsArr.length} urun`;
    await sendSmsViaNetgsm(cfg.admin_phone, smsMsg);
  } catch (e) {
    console.error("notifyAdminNewOrder error:", e);
  }
}

const PgSession = pgSession(session);

async function ensureAdminExists() {
  const existing = await storage.getUserByUsername("admin");
  if (!existing) {
    const hashed = await bcrypt.hash("jetgo2024", 10);
    await storage.createUser({ username: "admin", password: hashed });
    console.log("Default admin user created (admin / jetgo2024)");
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!(req.session as any)?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ===== Domain'e özel içerik (multi-store) yardımcıları =====
  const STORE_IDS = STORES.map((s) => s.id);
  const isValidStore = (s: any): boolean => s === "all" || STORE_IDS.includes(String(s));
  // Public okuma: aktif domain'in store id'si.
  const publicStoreId = (req: any): string => reqStore(req).id;
  // Admin yazma/okuma: ?store= veya body.store; geçersizse "all".
  const adminStoreId = (req: any): string => {
    const q = req.query?.store ?? req.body?.store;
    return isValidStore(q) ? String(q) : "all";
  };
  // Public (SEO/feed) için aktif store config'ini çöz. Proxy arkasında gerçek
  // host x-forwarded-host'ta gelir; yoksa Host başlığına / req.hostname'e düşer.
  const reqStore = (req: any) => getStoreByHost(
    (req.headers?.["x-forwarded-host"] as string) || req.headers?.host || req.hostname,
  );

  // Scheme://host the client actually used, from the same proxy headers as
  // reqStore. The crawler file chain (sitemap index → sub-sitemaps, robots
  // Sitemap:) references the SAME host it was fetched on, so Search Console
  // never hits a redirect or a cross-host fetch on those files. Page <loc> URLs
  // stay canonical (store.domain) for correct indexing.
  const reqOrigin = (req: any) => {
    const proto = (
      (req.headers?.["x-forwarded-proto"] as string) || req.protocol || "https"
    )
      .split(",")[0]
      .trim();
    const host = (
      (req.headers?.["x-forwarded-host"] as string) ||
      req.headers?.host ||
      req.hostname ||
      ""
    )
      .split(",")[0]
      .trim();
    return `${proto}://${host}`;
  };
  // Store id'sinden (jetgo/atakum/all) StoreConfig'e; bilinmeyende varsayılan.
  const storeById = (id?: string | null) => STORES.find((s) => s.id === id) || STORES[0];
  // Defense-in-depth: belirli bir mağaza bağlamında (storeContext) yapılan
  // düzenleme/silme işleminin, BAŞKA bir mağazaya ait bir satırı etkilemesini
  // engeller. Paylaşılan ("all") satırlar her zaman izinlidir (UI'da açık onay
  // ile düzenlenir); yalnızca farklı bir spesifik mağazanın satırı engellenir.
  // storeContext gönderilmezse veya "all" ise kısıtlama uygulanmaz.
  const storeContextConflict = (req: any, rowStore: string | null | undefined): boolean => {
    const raw = req.query?.storeContext ?? req.body?.storeContext;
    if (raw === undefined || raw === null || raw === "") return false;
    const ctx = String(raw);
    if (ctx === "all" || !isValidStore(ctx)) return false;
    const rs = rowStore ?? "all";
    if (rs === "all") return false;
    return rs !== ctx;
  };
  // Verilen tablodaki satırın store'unu okuyup storeContext çakışmasını denetler.
  // Çakışma varsa 403 döner ve true (engellendi) verir; aksi halde false.
  const blockedByStoreContext = async (req: any, res: any, table: string, id: number): Promise<boolean> => {
    try {
      const { rows } = await sharedPool.query(`SELECT store FROM ${table} WHERE id = $1`, [id]);
      if (rows.length === 0) return false; // 404'ü rota kendi ele alsın
      if (storeContextConflict(req, rows[0].store)) {
        res.status(403).json({ message: "Bu içerik başka bir mağazaya ait; seçili mağaza bağlamında düzenlenemez." });
        return true;
      }
      return false;
    } catch {
      // Hata durumunda güvenli tarafta kal (fail-closed): işlemi reddet.
      res.status(500).json({ message: "Mağaza bağlamı doğrulanamadı; lütfen tekrar deneyin." });
      return true;
    }
  };
  // app_settings için store öneki. Sadece "all" temel (öneksiz) anahtarları
  // kullanır; jetgo dahil her store kendi "<store>:" önekiyle yazar. Önekli
  // değer yoksa resolve* fonksiyonları temel ("all") değere geri düşer
  // (geriye dönük uyumluluk: mevcut öneksiz anahtarlar her domainde görünür).
  const settingsPrefix = (store: string): string =>
    store === "all" ? "" : `${store}:`;
  // Verilen store için app_settings anahtarlarını çöz: önekli değer varsa temel
  // değeri ezer. Liste döner: { key: value }.
  async function resolveSettings(keys: string[], store: string): Promise<Record<string, string>> {
    const prefix = settingsPrefix(store);
    const want = prefix ? [...keys, ...keys.map((k) => prefix + k)] : keys;
    const { rows } = await sharedPool.query(
      `SELECT key, value FROM app_settings WHERE key = ANY($1)`,
      [want]
    );
    const base: Record<string, string> = {};
    const over: Record<string, string> = {};
    for (const r of rows) {
      if (prefix && r.key.startsWith(prefix)) over[r.key.slice(prefix.length)] = r.value;
      else base[r.key] = r.value;
    }
    return { ...base, ...over };
  }
  // Store'a göre NetGSM gönderici başlığını çöz: önekli (<store>:sms_msgheader)
  // değer varsa onu, yoksa temel değeri, o da yoksa undefined döner (çağıran
  // taraf env NETGSM_MSGHEADER'a geri düşer). Hata durumunda da undefined.
  async function resolveSmsHeader(store: string): Promise<string | undefined> {
    try {
      const s = await resolveSettings(["sms_msgheader"], store || "all");
      const v = s["sms_msgheader"];
      return v && v.trim() ? v.trim() : undefined;
    } catch {
      return undefined;
    }
  }
  // Alıcıya "siparişiniz alındı" SMS'ini tam olarak bir kez gönderir. customer_sms_sent
  // bayrağını atomik olarak işaretler; eşzamanlı ödeme callback/webhook'ları asla iki kez
  // göndermez. Telefon yoksa hiç işaretlemez/göndermez. paymentConfirmed=true (online kart)
  // ise ödemenin onaylandığı da mesaja eklenir. SMS başlığı domain'e göre çözülür.
  async function notifyCustomerNewOrder(orderId: number, paymentConfirmed = false): Promise<void> {
    try {
      if (!orderId) return;
      const claim = await sharedPool.query(
        "UPDATE orders SET customer_sms_sent = true WHERE id = $1 AND customer_sms_sent = false AND customer_phone IS NOT NULL AND customer_phone <> '' RETURNING id, customer_phone, grand_total, source_site",
        [orderId]
      );
      if (claim.rowCount === 0) return;
      const ord = claim.rows[0];
      const stCfg = storeById(ord.source_site);
      const brand = stCfg.id === "jetgo" ? "Jetgo" : stCfg.shortName;
      const apexHost = canonicalHost(stCfg).replace(/^www\./, "");
      const smsMsg = `${brand} - #${ord.id} numarali siparisiniz alindi.${paymentConfirmed ? " Odemeniz onaylandi." : ""} Tutar: ${ord.grand_total} TL. Tesekkurler! ${apexHost}`;
      const stHeader = await resolveSmsHeader(stCfg.id);
      await sendSmsViaNetgsm(ord.customer_phone, smsMsg, stHeader);
    } catch (e) {
      console.error("notifyCustomerNewOrder error:", e);
    }
  }
  // Verilen store için LIKE desenine uyan app_settings anahtarlarını çöz.
  async function resolveSettingsLike(basePattern: string, store: string): Promise<Record<string, string>> {
    const prefix = settingsPrefix(store);
    const { rows } = await sharedPool.query(
      `SELECT key, value FROM app_settings WHERE key LIKE $1 OR key LIKE $2`,
      [basePattern, prefix ? prefix + basePattern : "\u0000__none__"]
    );
    const base: Record<string, string> = {};
    const over: Record<string, string> = {};
    for (const r of rows) {
      if (prefix && r.key.startsWith(prefix)) over[r.key.slice(prefix.length)] = r.value;
      else if (!r.key.includes(":")) base[r.key] = r.value;
    }
    return { ...base, ...over };
  }
  // Store'a göre app_settings yazımı (önek ile).
  async function writeStoreSettings(updates: Array<[string, string]>, store: string): Promise<void> {
    const prefix = settingsPrefix(store);
    for (const [k, v] of updates) {
      await sharedPool.query(
        "INSERT INTO app_settings (key, value, updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=NOW()",
        [prefix + k, v]
      );
    }
  }
  // Domain'e özel olabilecek app_settings anahtarları. Ödeme yöntemi açma/kapama
  // anahtarları her domain için ayrı tutulur; banka IBAN ve Tosla/iyzico API
  // bilgileri ile pet ayarları tüm domainler için ortaktır.
  const STORE_SCOPED_SETTING_KEYS = new Set<string>([
    "sms_msgheader",
    "payment_nakit_enabled", "payment_pos_enabled", "payment_qr_enabled", "payment_eft_enabled",
    "payment_installments_enabled", "payment_tosla_enabled", "payment_iyzico_enabled",
    "campaign_hero_title", "campaign_hero_subtitle", "campaign_end_date",
    "daily_cargo_widget_enabled",
    "sokak_banner_enabled", "veteriner_banner_enabled",
    "sokak_banner_image", "sokak_banner_link", "veteriner_banner_image", "veteriner_banner_link",
    "top_banner_enabled", "top_banner_text", "top_banner_link", "top_banner_bg", "top_banner_color",
    "konum_link", "whatsapp_number",
    "breed_banners", "category_banners",
    "cargo_fee", "cargo_free_limit", "cargo_min_order",
    "card_surcharge_percent",
  ]);
  // Tüm app_settings'i verilen store için çöz: temel değerler + store öneki ezmeleri.
  async function resolveAllSettings(store: string): Promise<Record<string, string>> {
    const prefix = settingsPrefix(store);
    const { rows } = await sharedPool.query("SELECT key, value FROM app_settings");
    const base: Record<string, string> = {};
    const over: Record<string, string> = {};
    for (const r of rows) {
      if (prefix && r.key.startsWith(prefix)) over[r.key.slice(prefix.length)] = r.value;
      else if (!r.key.includes(":")) base[r.key] = r.value;
    }
    return { ...base, ...over };
  }

  try {
    await sharedPool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      )
      WITH (OIDS=FALSE);
    `);
    await sharedPool.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'session_pkey') THEN
          ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
        END IF;
      END $$;
    `);
    await sharedPool.query(`CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");`);
  } catch (e) {
    console.error("Session table setup error:", e);
  }

  try {
    await sharedPool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_campaign boolean NOT NULL DEFAULT false;`);
  } catch (e) {
    console.error("Orders is_campaign migration error:", e);
  }

  try {
    await sharedPool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS source_site text;`);
    await sharedPool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS city text;`);
    await sharedPool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS district text;`);
    await sharedPool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS cargo_company text;`);
    await sharedPool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number text;`);
    await sharedPool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_url text;`);
    await sharedPool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_sms_sent boolean NOT NULL DEFAULT false;`);
    await sharedPool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_sms_sent boolean NOT NULL DEFAULT false;`);
    await sharedPool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_sms_sent boolean NOT NULL DEFAULT false;`);
  } catch (e) {
    console.error("Orders source_site migration error:", e);
  }

  try {
    await sharedPool.query(`
      CREATE TABLE IF NOT EXISTS tosla_payment_tokens (
        token VARCHAR(256) PRIMARY KEY,
        order_id INTEGER NOT NULL,
        tosla_order_id TEXT,
        transaction_id VARCHAR(64),
        amount NUMERIC(10,2),
        status TEXT NOT NULL DEFAULT 'pending',
        raw_response JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    // Widen tosla_order_id to TEXT: prod held values longer than the original
    // VARCHAR(64), which broke the publish-time schema migration. Idempotent.
    await sharedPool.query(`ALTER TABLE tosla_payment_tokens ALTER COLUMN tosla_order_id TYPE TEXT;`);
    await sharedPool.query(`CREATE INDEX IF NOT EXISTS idx_tosla_token_order ON tosla_payment_tokens (order_id);`);
    await sharedPool.query(`CREATE INDEX IF NOT EXISTS idx_tosla_token_tosla_order ON tosla_payment_tokens (tosla_order_id);`);
  } catch (e) {
    console.error("Tosla payment tokens table setup error:", e);
  }

  try {
    await sharedPool.query(`
      CREATE TABLE IF NOT EXISTS iyzico_payment_tokens (
        token VARCHAR(256) PRIMARY KEY,
        order_id INTEGER NOT NULL,
        conversation_id VARCHAR(64),
        payment_id VARCHAR(64),
        amount NUMERIC(10,2),
        status TEXT NOT NULL DEFAULT 'pending',
        raw_response JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    await sharedPool.query(`CREATE INDEX IF NOT EXISTS idx_iyzico_token_order ON iyzico_payment_tokens (order_id);`);
    await sharedPool.query(`CREATE INDEX IF NOT EXISTS idx_iyzico_token_conversation ON iyzico_payment_tokens (conversation_id);`);
    await sharedPool.query(`ALTER TABLE iyzico_payment_tokens ADD COLUMN IF NOT EXISTS payment_id VARCHAR(64);`);
  } catch (e) {
    console.error("Iyzico payment tokens table setup error:", e);
  }

  try {
    await sharedPool.query(`ALTER TABLE banners ADD COLUMN IF NOT EXISTS device TEXT NOT NULL DEFAULT 'both';`);
  } catch (e) {
    console.error("Banner device column migration error:", e);
  }

  // Çoklu domain (store) içerik kapsamı: banner/kampanya/kupon/teslimat
  // satırlarına 'store' kolonu (varsayılan 'all' = tüm siteler). Mevcut satırlar
  // 'all' olarak kalır (geriye dönük uyumluluk). Kupon kodu artık (store, code)
  // bazında benzersizdir; eski global benzersiz kısıt kaldırılır.
  try {
    for (const t of ["banners", "campaign_items", "coupons", "delivery_neighborhoods"]) {
      await sharedPool.query(`ALTER TABLE ${t} ADD COLUMN IF NOT EXISTS store TEXT NOT NULL DEFAULT 'all';`);
      await sharedPool.query(`UPDATE ${t} SET store = 'all' WHERE store IS NULL OR store = '';`);
    }
    await sharedPool.query(`ALTER TABLE coupons DROP CONSTRAINT IF EXISTS coupons_code_unique;`);
    await sharedPool.query(`ALTER TABLE coupons DROP CONSTRAINT IF EXISTS coupons_code_key;`);
    await sharedPool.query(`CREATE UNIQUE INDEX IF NOT EXISTS coupons_store_code_unique ON coupons (store, upper(code));`);
  } catch (e) {
    console.error("Store-scoped content (store column) migration error:", e);
  }

  try {
    await sharedPool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_street_animal boolean NOT NULL DEFAULT false;`);
    await sharedPool.query(`CREATE INDEX IF NOT EXISTS idx_products_street_animal ON products (is_street_animal) WHERE is_street_animal = true;`);
  } catch (e) {
    console.error("Products is_street_animal migration error:", e);
  }

  try {
    await sharedPool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS long_description text;`);
    await sharedPool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_title text;`);
    await sharedPool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description text;`);
    await sharedPool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_keywords text;`);
  } catch (e) {
    console.error("Products rich description / SEO columns migration error:", e);
  }

  try {
    await sharedPool.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        phone TEXT NOT NULL,
        pet_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    await sharedPool.query(`CREATE INDEX IF NOT EXISTS idx_subscriptions_created ON subscriptions(created_at);`);
  } catch (e) {
    console.error("Subscriptions table setup error:", e);
  }

  try {
    await sharedPool.query(`
      CREATE TABLE IF NOT EXISTS site_visits (
        id SERIAL PRIMARY KEY,
        ip TEXT,
        source TEXT NOT NULL DEFAULT 'Direkt',
        referrer TEXT,
        path TEXT,
        city TEXT,
        region TEXT,
        country TEXT,
        user_agent TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    await sharedPool.query(`CREATE INDEX IF NOT EXISTS idx_site_visits_created ON site_visits(created_at);`);
    await sharedPool.query(`CREATE INDEX IF NOT EXISTS idx_site_visits_source ON site_visits(source);`);
    await sharedPool.query(`ALTER TABLE site_visits ADD COLUMN IF NOT EXISTS isp TEXT;`);
    await sharedPool.query(`ALTER TABLE site_visits ADD COLUMN IF NOT EXISTS is_bot BOOLEAN NOT NULL DEFAULT false;`);
    // One-time cleanup: rows captured before bot/datacenter detection recorded
    // the GCP/Replit infra IP (34.x / 35.x) instead of the real visitor. Flag them.
    await sharedPool.query(`UPDATE site_visits SET is_bot = true WHERE is_bot = false AND (ip LIKE '34.%' OR ip LIKE '35.%');`);
    await sharedPool.query(`
      CREATE TABLE IF NOT EXISTS ip_geo_cache (
        ip TEXT PRIMARY KEY,
        city TEXT,
        region TEXT,
        country TEXT,
        isp TEXT,
        is_hosting BOOLEAN,
        resolved_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    await sharedPool.query(`ALTER TABLE ip_geo_cache ADD COLUMN IF NOT EXISTS isp TEXT;`);
    await sharedPool.query(`ALTER TABLE ip_geo_cache ADD COLUMN IF NOT EXISTS is_hosting BOOLEAN;`);
  } catch (e) {
    console.error("Site visits table setup error:", e);
  }

  try {
    await sharedPool.query(`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        barcode TEXT,
        delta INTEGER NOT NULL,
        mode TEXT NOT NULL,
        new_stock INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    await sharedPool.query(`CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON stock_movements(created_at);`);
    await sharedPool.query(`CREATE INDEX IF NOT EXISTS idx_stock_movements_mode_created ON stock_movements(mode, created_at);`);
    await sharedPool.query(`CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);`);
    await sharedPool.query(`ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS order_id INTEGER;`);
    await sharedPool.query(`CREATE INDEX IF NOT EXISTS idx_stock_movements_order ON stock_movements(order_id);`);
    await sharedPool.query(`DROP INDEX IF EXISTS idx_stock_movements_created_at;`);
  } catch (e) {
    console.error("Stock movements table setup error:", e);
  }

  try {
    const defaults: Array<[string, string]> = [
      ["payment_nakit_enabled", "true"],
      ["payment_eft_enabled", "true"],
      ["payment_qr_enabled", "true"],
      ["payment_pos_enabled", "true"],
      ["payment_installments_enabled", "true"],
      ["payment_tosla_enabled", "0"],
      ["tosla_client_id", ""],
      ["tosla_api_user", ""],
      ["tosla_api_pass", ""],
      ["tosla_base_url", "https://prepentegrasyon.tosla.com"],
      ["payment_iyzico_enabled", "0"],
      ["iyzico_api_key", ""],
      ["iyzico_secret_key", ""],
      ["iyzico_base_url", "https://sandbox-api.iyzipay.com"],
      ["top_banner_enabled", "1"],
      ["top_banner_image", ""],
      ["top_banner_link", "/giris"],
      ["breed_banner_enabled", "1"],
      ["breed_banner1_image", ""],
      ["breed_banner1_link", "/kategori/kopek/maltese-mamalari"],
      ["breed_banner1_alt", "Maltese Özel Mamaları"],
      ["breed_banner2_image", ""],
      ["breed_banner2_link", "/kategori/kopek/toy-poodle-mamalari"],
      ["breed_banner2_alt", "Toy Poodle Özel Mamaları"],
      ["breed_banner3_image", ""],
      ["breed_banner3_link", "/kategori/kopek/cavalier-king-charles-mamalari"],
      ["breed_banner3_alt", "Cavalier King Charles Özel Mamaları"],
      ["breed_banner4_image", ""],
      ["breed_banner4_link", "/kategori/kopek/shih-tzu-mamalari"],
      ["breed_banner4_alt", "Shih Tzu Özel Mamaları"],
      ["breed_banner5_image", ""],
      ["breed_banner5_link", "/kategori/kopek/chihuahua-mamalari"],
      ["breed_banner5_alt", "Chihuahua Özel Mamaları"],
      ["breed_banner6_image", ""],
      ["breed_banner6_link", "/kategori/kopek/pekinese-mamalari"],
      ["breed_banner6_alt", "Pekinese Özel Mamaları"],
      ["breed_banner7_image", ""],
      ["breed_banner7_link", "/kategori/kopek/pug-mamalari"],
      ["breed_banner7_alt", "Pug Özel Mamaları"],
      ["breed_banner8_image", ""],
      ["breed_banner8_link", "/kategori/kopek/yorkshire-terrier-mamalari"],
      ["breed_banner8_alt", "Yorkshire Terrier Özel Mamaları"],
      ["breed_banner9_image", ""],
      ["breed_banner9_link", "/kategori/kopek/cocker-spaniel-mamalari"],
      ["breed_banner9_alt", "Cocker Spaniel Özel Mamaları"],
      ["breed_banner10_image", ""],
      ["breed_banner10_link", "/kategori/kopek/pomeranian-mamalari"],
      ["breed_banner10_alt", "Pomeranian Özel Mamaları"],
    ];
    for (const [key, value] of defaults) {
      await sharedPool.query(
        "INSERT INTO app_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO NOTHING",
        [key, value]
      );
    }
  } catch (e) {
    console.error("Payment settings defaults seeding error:", e);
  }

  app.use(
    session({
      store: new PgSession({
        pool: sharedPool,
        createTableIfMissing: false,
      }),
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: { secure: process.env.NODE_ENV === "production", httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: "lax" },
    })
  );

  await seedDatabase();
  await ensureAdminExists();

  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(self), microphone=(), geolocation=(self)");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    res.setHeader("X-Download-Options", "noopen");
    res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://googleads.g.doubleclick.net https://www.googleadservices.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://www.google-analytics.com https://www.google.com https://googleads.g.doubleclick.net https://www.googleadservices.com; frame-src 'self' https://www.google.com https://maps.google.com https://www.google.com.tr; frame-ancestors 'self'; base-uri 'self'; form-action 'self';");

    if (req.path.startsWith("/api/")) {
      const ip = req.ip || "unknown";
      if (req.method === "POST") {
        if (rateLimit(`global:post:${ip}`, 60, 60 * 1000)) {
          return res.status(429).json({ message: "Çok fazla istek. Lütfen bekleyin." });
        }
      }
      if (rateLimit(`global:all:${ip}`, 300, 60 * 1000)) {
        return res.status(429).json({ message: "Çok fazla istek. Lütfen bekleyin." });
      }
    }

    next();
  });

  app.get("/sitemap.xml", async (req, res) => {
    try {
      // Sub-sitemap refs use the fetched host (reqOrigin), not canonical
      // store.domain, so the index never points cross-host / through a redirect.
      const SITE = reqOrigin(req);
      const today = new Date().toISOString().split("T")[0];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      xml += `  <sitemap>\n    <loc>${SITE}/sitemap-main.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
      xml += `  <sitemap>\n    <loc>${SITE}/sitemap-products.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
      xml += `  <sitemap>\n    <loc>${SITE}/sitemap-seo.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;

      xml += `</sitemapindex>`;

      res.set("Content-Type", "application/xml");
      res.set("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch (err) {
      res.status(500).send("Sitemap error");
    }
  });

  app.get("/sitemap-main.xml", async (req, res) => {
    try {
      const SITE = reqStore(req).domain;
      const staticPages = [
        { url: "/", priority: "1.0", changefreq: "daily" },
        { url: "/kategori", priority: "0.9", changefreq: "weekly" },
        { url: "/kategori/kopek", priority: "0.8", changefreq: "weekly" },
        { url: "/kategori/kedi", priority: "0.8", changefreq: "weekly" },
        { url: "/kategori/kus", priority: "0.7", changefreq: "weekly" },
        { url: "/kategori/kemirgen", priority: "0.7", changefreq: "weekly" },
        { url: "/kampanya", priority: "0.8", changefreq: "daily" },
        { url: "/magaza", priority: "0.9", changefreq: "monthly" },
        { url: "/sss", priority: "0.5", changefreq: "monthly" },
        { url: "/hakkimizda", priority: "0.4", changefreq: "monthly" },
        { url: "/iletisim", priority: "0.4", changefreq: "monthly" },
        { url: "/islem-rehberi", priority: "0.5", changefreq: "monthly" },
        { url: "/teslimat-iade", priority: "0.5", changefreq: "monthly" },
        { url: "/kvkk", priority: "0.3", changefreq: "yearly" },
        { url: "/gizlilik", priority: "0.3", changefreq: "yearly" },
        { url: "/kullanim-kosullari", priority: "0.3", changefreq: "yearly" },
        { url: "/cerez-politikasi", priority: "0.3", changefreq: "yearly" },
        { url: "/mesafeli-satis", priority: "0.3", changefreq: "yearly" },
        { url: "/gizlilik-sozlesmesi", priority: "0.3", changefreq: "yearly" },
      ];

      const today = new Date().toISOString().split("T")[0];
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      for (const page of staticPages) {
        xml += `  <url>\n    <loc>${SITE}${page.url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
      }

      const categories = await storage.getAllBrandCategories();
      const seenCategories = new Set<string>();
      for (const cat of categories) {
        const catKey = `${cat.animal}/${cat.subcategory}`;
        if (!seenCategories.has(catKey)) {
          seenCategories.add(catKey);
          xml += `  <url>\n    <loc>${SITE}/kategori/${cat.animal}/${cat.subcategory}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
        }
        if (cat.brandSlug) {
          xml += `  <url>\n    <loc>${SITE}/siparis/${cat.animal}/${cat.subcategory}/${cat.brandSlug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
        }
      }

      xml += `</urlset>`;

      res.set("Content-Type", "application/xml");
      res.set("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch (err) {
      res.status(500).send("Sitemap error");
    }
  });

  app.get("/sitemap-products.xml", async (req, res) => {
    try {
      const SITE = reqStore(req).domain;
      const allProducts = await storage.getAllProducts();
      const activeProducts = allProducts.filter((p: any) => p.isActive && p.price > 0);
      const today = new Date().toISOString().split("T")[0];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      for (const p of activeProducts) {
        const slug = p.name.toLowerCase().replace(/[^a-z0-9ğüşıöç]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
        xml += `  <url>\n    <loc>${SITE}/urun/${p.id}/${slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      }
      xml += `</urlset>`;

      res.set("Content-Type", "application/xml");
      res.set("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch (err) {
      res.status(500).send("Sitemap error");
    }
  });


  app.get("/sitemap-seo.xml", async (req, res) => {
    try {
      const store = reqStore(req);
      const SITE = store.domain;
      const today = new Date().toISOString().split("T")[0];

      // Priority/changefreq by page type. SEO landing pages are derived from the
      // shared corpus, filtered to THIS domain's commerce model, so cargo
      // domains never list local-only (same-day/neighborhood) pages and local
      // domains never list cargo-only pages.
      const TYPE_META: Record<string, { priority: string; changefreq: string }> = {
        core: { priority: "0.9", changefreq: "weekly" },
        district: { priority: "0.8", changefreq: "weekly" },
        category: { priority: "0.8", changefreq: "weekly" },
        keyword: { priority: "0.7", changefreq: "weekly" },
        brand: { priority: "0.7", changefreq: "weekly" },
        blog: { priority: "0.7", changefreq: "monthly" },
        "mahalle-block": { priority: "0.7", changefreq: "monthly" },
        mahalle: { priority: "0.6", changefreq: "monthly" },
      };
      const DEFAULT_META = { priority: "0.6", changefreq: "monthly" };

      // The three independent JETGO domains each list a DISTINCT, disjoint slice
      // of the shared local corpus so their sitemaps differ (pages still resolve
      // on every domain). Other stores list their full eligible set.
      const landingSlugs = getSitemapPagesForStore(store).map((p) => {
        const meta = TYPE_META[p.type] ?? DEFAULT_META;
        return { url: `/${p.slug}`, priority: meta.priority, changefreq: meta.changefreq };
      });

      // Standalone blog content (separate /blog routes, not part of the SEO
      // landing corpus). Geo-specific articles are dropped on cargo domains so
      // they don't imply a local presence.
      const cargo = isCargoStore(store);
      const blogSlugs = [
        { url: "/blog", priority: "0.8", changefreq: "weekly" },
        { url: "/blog/kedi-mamasi-nasil-secilir", priority: "0.7", changefreq: "monthly" },
        { url: "/blog/kopek-mamasi-secim-rehberi", priority: "0.7", changefreq: "monthly" },
        { url: "/blog/kedi-kumu-secim-rehberi", priority: "0.7", changefreq: "monthly" },
        { url: "/blog/evcil-hayvan-beslenme-hatalari", priority: "0.7", changefreq: "monthly" },
        { url: "/blog/kedi-bakim-ipuclari", priority: "0.7", changefreq: "monthly" },
        { url: "/blog/samsun-evcil-hayvan-gezilecek-yerler", priority: "0.6", changefreq: "monthly" },
      ].filter((b) => !(cargo && /samsun|atakum|ilkadim|canik/i.test(b.url)));

      const seoSlugs = [...landingSlugs, ...blogSlugs];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      for (const page of seoSlugs) {
        xml += `  <url>\n    <loc>${SITE}${page.url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
      }
      xml += `</urlset>`;

      res.set("Content-Type", "application/xml");
      res.set("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch (err) {
      res.status(500).send("Sitemap error");
    }
  });

  app.get("/api/export/xlsx", requireAdmin, async (req, res) => {
    try {
      const ExcelJS = (await import("exceljs")).default;
      const SITE = storeById(adminStoreId(req)).domain;
      const ANIMAL_MAP: Record<string, string> = { kedi: "Kedi", kopek: "Köpek", kus: "Kuş", kemirgen: "Kemirgen" };

      const { rows } = await sharedPool.query(`
        SELECT p.id, p.name, p.price, p.original_price, p.skt, p.img, p.stock,
               bc.brand_name, bc.animal, s.display_name as subcategory_name
        FROM products p
        LEFT JOIN brand_categories bc ON p.brand_category_id = bc.id
        LEFT JOIN subcategories s ON bc.subcategory = s.slug AND bc.animal = s.animal
        WHERE p.is_active = true AND p.stock > 0 AND p.price > 0
        ORDER BY p.id
      `);

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Ürünler");
      ws.columns = [
        { header: "ID", key: "id", width: 6 },
        { header: "Title", key: "title", width: 60 },
        { header: "Description", key: "description", width: 70 },
        { header: "Price", key: "price", width: 12 },
        { header: "Old price", key: "oldPrice", width: 14 },
        { header: "Currency", key: "currency", width: 6 },
        { header: "URL", key: "url", width: 35 },
        { header: "Image URL", key: "image", width: 45 },
        { header: "Category", key: "category", width: 30 },
        { header: "Brand", key: "brand", width: 25 },
        { header: "Availability", key: "availability", width: 12 },
        { header: "Stock", key: "stock", width: 6 },
      ];
      for (const r of rows as any[]) {
        ws.addRow({
          id: r.id,
          title: r.name,
          description: `${r.brand_name ? r.brand_name + " - " : ""}${r.name}${r.subcategory_name ? " | " + r.subcategory_name : ""}`,
          price: r.price,
          oldPrice: r.original_price || "",
          currency: "TRY",
          url: `${SITE}/urun/${r.id}`,
          image: r.img ? `${SITE}${r.img}` : "",
          category: `${ANIMAL_MAP[r.animal] || r.animal || ""} > ${r.subcategory_name || ""}`,
          brand: r.brand_name || "",
          availability: r.stock > 0 ? "in stock" : "out of stock",
          stock: r.stock,
        });
      }

      const buf = await wb.xlsx.writeBuffer();
      res.setHeader("Content-Disposition", "attachment; filename=enuygun_urunler.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.send(Buffer.from(buf));
    } catch (err) {
      console.error("Export XLSX error:", err);
      res.status(500).json({ error: "Export failed" });
    }
  });

  app.get("/api/admin/export/products-xlsx", requireAdmin, async (req, res) => {
    try {
      const ExcelJS = (await import("exceljs")).default;
      const ANIMAL_MAP: Record<string, string> = { kedi: "Kedi", kopek: "Köpek", kus: "Kuş", kemirgen: "Kemirgen", akvaryum: "Akvaryum" };
      const type = String(req.query.type || "all");

      let where = "1=1";
      let title = "Ürünler";
      let filename = "enuygun_urunler.xlsx";
      if (type === "preorder") {
        where = "p.preorder_enabled = true";
        title = "Ön Sipariş Ürünleri";
        filename = "enuygun_on_siparis.xlsx";
      } else if (type === "out_of_stock") {
        where = "p.stock <= 0 AND p.is_active = true";
        title = "Stokta Yok Ürünler";
        filename = "enuygun_stokta_yok.xlsx";
      }

      const { rows } = await sharedPool.query(`
        SELECT p.id, p.name, p.price, p.original_price, p.skt, p.stock, p.barcode,
               p.is_active, p.preorder_enabled,
               bc.brand_name, bc.animal, s.display_name as subcategory_name
        FROM products p
        LEFT JOIN brand_categories bc ON p.brand_category_id = bc.id
        LEFT JOIN subcategories s ON bc.subcategory = s.slug AND bc.animal = s.animal
        WHERE ${where}
        ORDER BY p.name ASC
      `);

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet(title);
      ws.columns = [
        { header: "ID", key: "id", width: 6 },
        { header: "Ürün Adı", key: "name", width: 60 },
        { header: "Marka", key: "brand", width: 22 },
        { header: "Hayvan", key: "animal", width: 12 },
        { header: "Kategori", key: "category", width: 28 },
        { header: "Fiyat (TL)", key: "price", width: 12 },
        { header: "Eski Fiyat (TL)", key: "oldPrice", width: 14 },
        { header: "Stok", key: "stock", width: 8 },
        { header: "SKT", key: "skt", width: 12 },
        { header: "Barkod", key: "barcode", width: 20 },
        { header: "Aktif", key: "active", width: 8 },
        { header: "Ön Sipariş", key: "preorder", width: 12 },
      ];
      ws.getRow(1).font = { bold: true };
      ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6B3480" } };
      ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

      for (const r of rows as any[]) {
        ws.addRow({
          id: r.id,
          name: r.name,
          brand: r.brand_name || "",
          animal: ANIMAL_MAP[r.animal] || r.animal || "",
          category: r.subcategory_name || "",
          price: Number(r.price) || 0,
          oldPrice: r.original_price ? Number(r.original_price) : "",
          stock: r.stock,
          skt: r.skt || "",
          barcode: r.barcode || "",
          active: r.is_active ? "Evet" : "Hayır",
          preorder: r.preorder_enabled ? "Evet" : "Hayır",
        });
      }

      ws.addRow({});
      const summaryRow = ws.addRow({ name: `Toplam: ${rows.length} ürün — ${new Date().toLocaleString("tr-TR")}` });
      summaryRow.font = { italic: true, color: { argb: "FF666666" } };

      const buf = await wb.xlsx.writeBuffer();
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.send(Buffer.from(buf));
    } catch (err) {
      console.error("Admin export XLSX error:", err);
      res.status(500).json({ error: "Export failed" });
    }
  });

  // ---- Toplu ürün yükleme şablonu dışa aktarma (enuygunpet bulk upload) ----
  // Geçerli barkod: yalnızca rakam, 8-14 hane (EAN-8 / UPC-12 / EAN-13 / GTIN-14)
  const BULK_BARCODE_RE = /^\d{8,14}$/;

  async function getBulkUploadExportData() {
    const { rows } = await sharedPool.query(`
      SELECT id, name, price, is_active, stock, barcode
      FROM products
      ORDER BY name ASC
    `);
    const withoutBarcode: { id: number; name: string }[] = [];
    const invalid: { id: number; name: string; barcode: string }[] = [];
    const duplicates: { id: number; name: string; barcode: string; keptId: number; keptName: string }[] = [];
    const seen = new Map<string, { id: number; name: string }>();
    const exportRows: { barcode: string; price: number; isActive: 0 | 1 }[] = [];
    let activeCount = 0;
    let passiveCount = 0;
    for (const r of rows as any[]) {
      // Satışa açık VE stok > 0 ise aktif (stok 0 veya pasif ürün = 0)
      const isActiveVal: 0 | 1 = r.is_active && Number(r.stock) > 0 ? 1 : 0;
      if (isActiveVal) activeCount++; else passiveCount++;
      const bc = String(r.barcode ?? "").trim();
      if (!bc) { withoutBarcode.push({ id: r.id, name: r.name }); continue; }
      if (!BULK_BARCODE_RE.test(bc)) { invalid.push({ id: r.id, name: r.name, barcode: bc }); continue; }
      const first = seen.get(bc);
      if (first) { duplicates.push({ id: r.id, name: r.name, barcode: bc, keptId: first.id, keptName: first.name }); continue; }
      seen.set(bc, { id: r.id, name: r.name });
      exportRows.push({ barcode: bc, price: Number(r.price) || 0, isActive: isActiveVal });
    }
    return {
      summary: {
        totalProducts: rows.length,
        withBarcode: rows.length - withoutBarcode.length,
        withoutBarcode: withoutBarcode.length,
        activeCount,
        passiveCount,
        duplicateCount: duplicates.length,
        invalidCount: invalid.length,
        exportCount: exportRows.length,
      },
      withoutBarcodeList: withoutBarcode,
      duplicateList: duplicates,
      invalidList: invalid,
      exportRows,
    };
  }

  app.get("/api/admin/product-export/bulk-summary", requireAdmin, async (_req, res) => {
    try {
      const data = await getBulkUploadExportData();
      res.json({
        summary: data.summary,
        withoutBarcode: data.withoutBarcodeList,
        duplicates: data.duplicateList,
        invalid: data.invalidList,
      });
    } catch (err) {
      console.error("Bulk export summary error:", err);
      res.status(500).json({ error: "Özet alınamadı" });
    }
  });

  app.get("/api/admin/export/bulk-upload-xlsx", requireAdmin, async (_req, res) => {
    try {
      const ExcelJS = (await import("exceljs")).default;
      const data = await getBulkUploadExportData();

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Menüye Ürün Ekleme");
      ws.columns = [{ width: 24 }, { width: 14 }, { width: 52 }, { width: 44 }] as any;
      // Barkod sütunu METİN: Excel bilimsel formata çevirmesin, son haneler bozulmasın
      ws.getColumn(1).numFmt = "@";

      const row1 = ws.addRow([
        "Barkod (doldurulması zorunlu alan)",
        "Fiyat (doldurulması zorunlu alan)",
        "Aktiflik (0: Satışa Kapalı, 1: Satışa Açık) (doldurulması zorunlu alan)",
        "Bir Siparişte Maksimum Satılabilir Adet (opsiyonel alan)",
      ]);
      row1.font = { bold: true };
      const row2 = ws.addRow(["barcodes", "price", "isActive", "maxSellCount"]);
      row2.font = { bold: true };

      for (const r of data.exportRows) {
        // Ürün bazlı özel limit alanı yok; varsayılan 10 (şablon kuralı)
        ws.addRow([r.barcode, r.price, r.isActive, 10]);
      }

      const dateStr = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
      const filename = `enuygunpetshop-toplu-urun-yukleme-${dateStr}.xlsx`;

      const buf = await wb.xlsx.writeBuffer();
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.send(Buffer.from(buf));
    } catch (err) {
      console.error("Bulk upload export error:", err);
      res.status(500).json({ error: "Export failed" });
    }
  });

  const MAMA_SUBCATS: Record<string, string[]> = {
    kedi: ["kedi-mamasi", "acik-mama", "yas-mama"],
    kopek: ["mama-markalari", "kopek-kuru-mama", "acik-mama", "uygun-cuval", "yas-mama"],
  };

  async function getMamaStockData() {
    const allSubcats = Array.from(new Set([...MAMA_SUBCATS.kedi, ...MAMA_SUBCATS.kopek]));
    const { rows } = await sharedPool.query(
      `SELECT p.id, p.name, p.price, p.stock, p.skt, p.barcode,
              bc.brand_name, bc.animal, s.display_name as subcategory_name, s.slug as subcategory_slug
       FROM products p
       LEFT JOIN brand_categories bc ON p.brand_category_id = bc.id
       LEFT JOIN subcategories s ON bc.subcategory = s.slug AND bc.animal = s.animal
       WHERE p.is_active = true
         AND p.stock > 0
         AND bc.animal IN ('kedi','kopek')
         AND s.slug = ANY($1::text[])
       ORDER BY bc.animal, bc.brand_name, p.name`,
      [allSubcats]
    );
    const filtered = (rows as any[]).filter(r => MAMA_SUBCATS[r.animal]?.includes(r.subcategory_slug));

    const brandSummary: Record<string, { animal: string; brand: string; itemCount: number; totalStock: number; totalValue: number }> = {};
    let kediStock = 0, kediValue = 0, kediItems = 0;
    let kopekStock = 0, kopekValue = 0, kopekItems = 0;

    for (const r of filtered) {
      const stock = Number(r.stock) || 0;
      const price = Number(r.price) || 0;
      const value = stock * price;
      const key = `${r.animal}|${r.brand_name || "Diğer"}`;
      if (!brandSummary[key]) brandSummary[key] = { animal: r.animal, brand: r.brand_name || "Diğer", itemCount: 0, totalStock: 0, totalValue: 0 };
      brandSummary[key].itemCount += 1;
      brandSummary[key].totalStock += stock;
      brandSummary[key].totalValue += value;
      if (r.animal === "kedi") { kediStock += stock; kediValue += value; kediItems += 1; }
      else { kopekStock += stock; kopekValue += value; kopekItems += 1; }
    }

    return {
      details: filtered,
      brandSummary: Object.values(brandSummary).sort((a, b) => a.animal.localeCompare(b.animal) || b.totalValue - a.totalValue),
      totals: {
        kedi: { itemCount: kediItems, totalStock: kediStock, totalValue: kediValue },
        kopek: { itemCount: kopekItems, totalStock: kopekStock, totalValue: kopekValue },
        grand: { itemCount: kediItems + kopekItems, totalStock: kediStock + kopekStock, totalValue: kediValue + kopekValue },
      },
    };
  }

  app.get("/api/admin/reports/mama-stock", requireAdmin, async (_req, res) => {
    try {
      const data = await getMamaStockData();
      res.json(data);
    } catch (err) {
      console.error("Mama stock report error:", err);
      res.status(500).json({ error: "Report failed" });
    }
  });

  app.get("/api/admin/export/mama-stock-xlsx", requireAdmin, async (_req, res) => {
    try {
      const ExcelJS = (await import("exceljs")).default;
      const data = await getMamaStockData();
      const ANIMAL_LABEL: Record<string, string> = { kedi: "Kedi", kopek: "Köpek" };

      const wb = new ExcelJS.Workbook();
      const PURPLE = "FF6B3480";

      const wsSummary = wb.addWorksheet("Özet");
      wsSummary.columns = [
        { header: "", key: "label", width: 28 },
        { header: "Ürün Çeşidi", key: "items", width: 14 },
        { header: "Toplam Stok (Adet)", key: "stock", width: 22 },
        { header: "Toplam Değer (TL)", key: "value", width: 22 },
      ];
      wsSummary.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      wsSummary.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: PURPLE } };
      wsSummary.addRow({ label: "Kedi Maması", items: data.totals.kedi.itemCount, stock: data.totals.kedi.totalStock, value: Math.round(data.totals.kedi.totalValue * 100) / 100 });
      wsSummary.addRow({ label: "Köpek Maması", items: data.totals.kopek.itemCount, stock: data.totals.kopek.totalStock, value: Math.round(data.totals.kopek.totalValue * 100) / 100 });
      const totalRow = wsSummary.addRow({ label: "GENEL TOPLAM", items: data.totals.grand.itemCount, stock: data.totals.grand.totalStock, value: Math.round(data.totals.grand.totalValue * 100) / 100 });
      totalRow.font = { bold: true };
      totalRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEDE7F6" } };
      wsSummary.getColumn("value").numFmt = '#,##0.00 "TL"';

      const wsBrand = wb.addWorksheet("Marka Bazında");
      wsBrand.columns = [
        { header: "Hayvan", key: "animal", width: 10 },
        { header: "Marka", key: "brand", width: 28 },
        { header: "Ürün Çeşidi", key: "items", width: 14 },
        { header: "Toplam Stok (Adet)", key: "stock", width: 22 },
        { header: "Toplam Değer (TL)", key: "value", width: 22 },
      ];
      wsBrand.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      wsBrand.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: PURPLE } };
      for (const b of data.brandSummary) {
        wsBrand.addRow({
          animal: ANIMAL_LABEL[b.animal] || b.animal,
          brand: b.brand,
          items: b.itemCount,
          stock: b.totalStock,
          value: Math.round(b.totalValue * 100) / 100,
        });
      }
      wsBrand.getColumn("value").numFmt = '#,##0.00 "TL"';

      const wsDetail = wb.addWorksheet("Detay");
      wsDetail.columns = [
        { header: "ID", key: "id", width: 6 },
        { header: "Hayvan", key: "animal", width: 10 },
        { header: "Marka", key: "brand", width: 22 },
        { header: "Kategori", key: "cat", width: 22 },
        { header: "Ürün Adı", key: "name", width: 60 },
        { header: "Birim Fiyat (TL)", key: "price", width: 16 },
        { header: "Stok", key: "stock", width: 8 },
        { header: "Stok Değeri (TL)", key: "value", width: 18 },
        { header: "SKT", key: "skt", width: 12 },
        { header: "Barkod", key: "barcode", width: 18 },
      ];
      wsDetail.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      wsDetail.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: PURPLE } };
      for (const r of data.details) {
        const stock = Number(r.stock) || 0;
        const price = Number(r.price) || 0;
        wsDetail.addRow({
          id: r.id,
          animal: ANIMAL_LABEL[r.animal] || r.animal,
          brand: r.brand_name || "",
          cat: r.subcategory_name || "",
          name: r.name,
          price,
          stock,
          value: Math.round(stock * price * 100) / 100,
          skt: r.skt || "",
          barcode: r.barcode || "",
        });
      }
      wsDetail.getColumn("price").numFmt = '#,##0.00 "TL"';
      wsDetail.getColumn("value").numFmt = '#,##0.00 "TL"';

      wsSummary.addRow({});
      wsSummary.addRow({ label: `Rapor tarihi: ${new Date().toLocaleString("tr-TR")}` }).font = { italic: true, color: { argb: "FF666666" } };

      const buf = await wb.xlsx.writeBuffer();
      res.setHeader("Content-Disposition", `attachment; filename=enuygun_mama_stok_raporu.xlsx`);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.send(Buffer.from(buf));
    } catch (err) {
      console.error("Mama stock XLSX error:", err);
      res.status(500).json({ error: "Export failed" });
    }
  });

  app.get("/api/export/yml", requireAdmin, async (req, res) => {
    try {
      const stCfg = storeById(adminStoreId(req));
      const SITE = stCfg.domain;
      const ANIMAL_MAP: Record<string, string> = { kedi: "Kedi", kopek: "Köpek", kus: "Kuş", kemirgen: "Kemirgen" };

      const { rows } = await sharedPool.query(`
        SELECT p.id, p.name, p.price, p.original_price, p.skt, p.img, p.stock,
               bc.brand_name, bc.animal, s.display_name as subcategory_name
        FROM products p
        LEFT JOIN brand_categories bc ON p.brand_category_id = bc.id
        LEFT JOIN subcategories s ON bc.subcategory = s.slug AND bc.animal = s.animal
        WHERE p.is_active = true AND p.stock > 0 AND p.price > 0
        ORDER BY p.id
      `);

      const categories = new Map<string, { id: number; animal: string; subcat: string }>();
      let catId = 1;
      for (const r of rows as any[]) {
        const key = (r.animal || "") + "|" + (r.subcategory_name || "");
        if (!categories.has(key) && r.subcategory_name) {
          categories.set(key, { id: catId++, animal: r.animal, subcat: r.subcategory_name });
        }
      }

      const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

      let yml = `<?xml version="1.0" encoding="UTF-8"?>\n<yml_catalog date="${new Date().toISOString().split("T")[0]}">\n  <shop>\n    <name>${esc(stCfg.name)}</name>\n    <company>Sizpa İnternet Tic. Ltd. Şti.</company>\n    <url>${SITE}</url>\n    <currencies>\n      <currency id="TRY" rate="1"/>\n    </currencies>\n    <categories>\n`;

      for (const [, cat] of categories) {
        yml += `      <category id="${cat.id}">${esc(cat.subcat)} (${ANIMAL_MAP[cat.animal] || cat.animal})</category>\n`;
      }
      yml += "    </categories>\n    <offers>\n";

      for (const r of rows as any[]) {
        const key = (r.animal || "") + "|" + (r.subcategory_name || "");
        const cat = categories.get(key);
        yml += `      <offer id="${r.id}" available="true">\n`;
        yml += `        <name>${esc(r.name)}</name>\n`;
        yml += `        <url>${SITE}/urun/${r.id}</url>\n`;
        yml += `        <price>${r.price}</price>\n`;
        if (r.original_price && r.original_price > r.price) yml += `        <oldprice>${r.original_price}</oldprice>\n`;
        yml += `        <currencyId>TRY</currencyId>\n`;
        if (cat) yml += `        <categoryId>${cat.id}</categoryId>\n`;
        if (r.img) yml += `        <picture>${SITE}${r.img}</picture>\n`;
        if (r.brand_name) yml += `        <vendor>${esc(r.brand_name)}</vendor>\n`;
        yml += `        <delivery>true</delivery>\n        <store>true</store>\n      </offer>\n`;
      }
      yml += "    </offers>\n  </shop>\n</yml_catalog>\n";

      res.setHeader("Content-Disposition", `attachment; filename=${stCfg.brandWord.toLowerCase()}_urunler.yml`);
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.send(yml);
    } catch (err) {
      console.error("Export YML error:", err);
      res.status(500).json({ error: "Export failed" });
    }
  });

  await sharedPool.query(`CREATE TABLE IF NOT EXISTS product_images (product_id INTEGER PRIMARY KEY, data TEXT NOT NULL, updated_at TIMESTAMP NOT NULL DEFAULT NOW())`);
  
  const { rows: [{ count: imgCount }] } = await sharedPool.query(`SELECT COUNT(*)::int as count FROM product_images`);
  
  if (imgCount === 0) {
    setTimeout(async () => {
      console.log(`[image] product_images table is empty, importing disk images in background...`);
      const fs = await import("fs");
      const pathMod = await import("path");
      const bgPool = sharedPool;
      
      const imageDirs = [
        pathMod.default.join(process.cwd(), "dist", "public", "product-images"),
        pathMod.default.join(process.cwd(), "client", "public", "product-images"),
      ].filter(d => fs.existsSync(d));
      
      let imported = 0;
      for (const dir of imageDirs) {
        const files = fs.readdirSync(dir).filter((f: string) => f.endsWith(".webp"));
        for (let i = 0; i < files.length; i += 50) {
          const batch = files.slice(i, i + 50);
          for (const file of batch) {
            const match = file.match(/product-(\d+)\.webp/);
            if (!match) continue;
            const productId = parseInt(match[1]);
            const data = fs.readFileSync(pathMod.default.join(dir, file));
            const base64 = data.toString("base64");
            try {
              await bgPool.query(
                `INSERT INTO product_images (product_id, data, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (product_id) DO NOTHING`,
                [productId, base64]
              );
              imported++;
            } catch {}
          }
          console.log(`[image] Imported ${Math.min(i + 50, files.length)}/${files.length} from ${dir}`);
        }
      }
      console.log(`[image] Disk import complete: ${imported} images`);

      const allProducts = await storage.getAllProducts();
      for (const p of allProducts) {
        if (p.originalImg && p.img?.startsWith("/product-images/")) {
          try {
            const imgPath = await (await import("./image-service")).downloadAndSaveImage(p.originalImg, p.id);
            if (imgPath) {
              await storage.updateProduct(p.id, { img: imgPath });
            }
          } catch {}
          await new Promise(r => setTimeout(r, 300));
        }
      }
      console.log(`[image] Background import fully complete`);
    }, 3000);
  }

  app.get("/api/product-image/:id", async (req, res) => {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) return res.status(400).end();
    const buffer = await getProductImage(id);
    if (!buffer) return res.status(404).end();
    res.setHeader("Content-Type", "image/webp");
    res.setHeader("Cache-Control", "public, max-age=604800, immutable");
    res.send(buffer);
  });

  app.get("/product-images/:filename", async (req, res) => {
    const match = req.params.filename.match(/product-(\d+)\.webp/);
    if (!match) return res.status(404).end();
    const id = parseInt(match[1]);
    const buffer = await getProductImage(id);
    if (!buffer) return res.status(404).end();
    res.setHeader("Content-Type", "image/webp");
    res.setHeader("Cache-Control", "public, max-age=604800, immutable");
    res.send(buffer);
  });

  app.get("/api/subcategories", async (req, res) => {
    const subs = await storage.getAllSubcategories();
    res.setHeader("Cache-Control", "public, max-age=120, stale-while-revalidate=600");
    if (req.query.all === "true") return res.json(subs);
    res.json(subs.filter(s => s.isActive));
  });

  app.get("/api/subcategories/:animal", async (req, res) => {
    const subs = await storage.getSubcategoriesByAnimal(req.params.animal);
    res.setHeader("Cache-Control", "public, max-age=120, stale-while-revalidate=600");
    if (req.query.all === "true") return res.json(subs);
    res.json(subs.filter(s => s.isActive));
  });

  app.post("/api/admin/subcategories", requireAdmin, async (req, res) => {
    try {
      const schema = z.object({ animal: z.string().min(1).max(30), slug: z.string().min(1).max(50), displayName: z.string().min(1).max(100), color: z.string().max(20).optional(), hasBrands: z.boolean().optional(), sortOrder: z.number().int().optional(), isActive: z.boolean().optional() });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Geçersiz veri", errors: parsed.error.errors });
      const sub = await storage.createSubcategory(parsed.data as any);
      res.status(201).json(sub);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.patch("/api/admin/subcategories/:id", requireAdmin, async (req, res) => {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) return res.status(400).json({ message: "Geçersiz ID" });
    const allowedKeys = ["animal", "slug", "displayName", "color", "hasBrands", "sortOrder", "isActive"];
    const safeBody: Record<string, any> = {};
    for (const key of allowedKeys) {
      if (req.body[key] !== undefined) safeBody[key] = req.body[key];
    }
    const sub = await storage.updateSubcategory(id, safeBody);
    if (!sub) return res.status(404).json({ message: "Subcategory not found" });
    res.json(sub);
  });

  app.delete("/api/admin/subcategories/:id", requireAdmin, async (req, res) => {
    const id = parseInt(String(req.params.id));
    await storage.deleteSubcategory(id);
    res.json({ message: "Deleted" });
  });

  app.get("/api/brand-categories", async (_req, res) => {
    const categories = await storage.getAllBrandCategories();
    res.setHeader("Cache-Control", "public, max-age=120, stale-while-revalidate=600");
    res.json(categories);
  });

  app.get("/api/brand-categories/:id/products", async (req, res) => {
    const id = parseInt(String(req.params.id));
    const category = await storage.getBrandCategory(id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    const prods = await storage.getProductsByBrandCategory(id);
    const activeOnly = req.query.all !== "true";
    if (!activeOnly) {
      res.json({ category, products: prods });
    } else {
      res.json({ category, products: prods.filter(p => p.isActive) });
    }
  });

  const SUBCATEGORY_SLUG_MAP: Record<string, string> = {
    "kedi-odulu": "odul",
    "kedi-bakim-saglik": "bakim-saglik",
    "kedi-konserve": "kedi-konserve",
    "malt-macun": "malt-macun",
    "malt-vitamin": "malt-vitamin",
    "kopek-mamasi": "mama-markalari",
    "kopek-kuru-mama": "mama-markalari",
  };

  app.get("/api/brand-products/:animal/:subcategory/:brandSlug", async (req, res) => {
    const { animal, brandSlug } = req.params;
    const subcategory = SUBCATEGORY_SLUG_MAP[req.params.subcategory] || req.params.subcategory;
    const aggregateAll = brandSlug === subcategory || brandSlug === req.params.subcategory;
    if (aggregateAll) {
      const all = await storage.getAllBrandCategories();
      const subMatches = all.filter(bc => bc.animal === animal && bc.subcategory === subcategory);
      if (subMatches.length > 0) {
        const allProducts = await storage.getAllProducts();
        const ids = subMatches.map(c => c.id);
        const prods = allProducts.filter(p => p.isActive && p.brandCategoryId && ids.includes(p.brandCategoryId));
        const defaultCat = subMatches.find(c => c.brandSlug === brandSlug) || subMatches[0];
        return res.json({ category: defaultCat, products: prods });
      }
    }
    let category = await storage.getBrandCategoryBySlug(animal, subcategory, brandSlug);
    if (!category) {
      const all = await storage.getAllBrandCategories();
      const subMatches = all.filter(bc => bc.animal === animal && bc.subcategory === subcategory);
      if (subMatches.length === 0) return res.status(404).json({ message: "Brand category not found" });
      const allProducts = await storage.getAllProducts();
      const ids = subMatches.map(c => c.id);
      const prods = allProducts.filter(p => p.isActive && p.brandCategoryId && ids.includes(p.brandCategoryId));
      return res.json({ category: subMatches[0], products: prods });
    }
    const prods = await storage.getProductsByBrandCategory(category.id);
    res.json({ category, products: prods.filter(p => p.isActive) });
  });

  app.get("/api/animal-products/:animal", async (req, res) => {
    const { animal } = req.params;
    const allBrandCats = await storage.getAllBrandCategories();
    const matchingCatIds = allBrandCats
      .filter((bc) => bc.animal === animal)
      .map((bc) => bc.id);
    if (matchingCatIds.length === 0) return res.json([]);
    const allProducts = await storage.getAllProducts();
    const filtered = allProducts.filter(
      (p) => p.isActive && p.brandCategoryId && matchingCatIds.includes(p.brandCategoryId)
    );
    res.setHeader("Cache-Control", "public, max-age=120, stale-while-revalidate=600");
    res.json(filtered.map(({ costPrice, ...rest }) => rest));
  });

  app.get("/api/subcategory-products/:animal/:subcategorySlug", async (req, res) => {
    const { animal } = req.params;
    const subcategorySlug = SUBCATEGORY_SLUG_MAP[req.params.subcategorySlug] || req.params.subcategorySlug;
    const allBrandCats = await storage.getAllBrandCategories();
    const matchingCatIds = allBrandCats
      .filter((bc) => bc.animal === animal && bc.subcategory === subcategorySlug)
      .map((bc) => bc.id);
    if (matchingCatIds.length === 0) return res.json([]);
    const allProducts = await storage.getAllProducts();
    const filtered = allProducts.filter(
      (p) => p.isActive && p.brandCategoryId && matchingCatIds.includes(p.brandCategoryId)
    );
    res.setHeader("Cache-Control", "public, max-age=120, stale-while-revalidate=600");
    res.json(filtered);
  });


  // Google Search Console HTML-dosya doğrulaması, DOMAIN BAZLI. Her mağaza kendi
  // google.verificationFileId değerini ayarlar; dosya yalnızca ait olduğu domainde
  // sunulur (diğerlerinde 404), böylece her domain Google'da bağımsız doğrulanır.
  app.get(/^\/google([0-9a-zA-Z]+)\.html$/, (req, res) => {
    const store = reqStore(req);
    const id = req.path.match(/^\/google([0-9a-zA-Z]+)\.html$/)?.[1];
    if (id && store.google?.verificationFileId && id === store.google.verificationFileId) {
      res.type("text/html").send(`google-site-verification: google${id}.html`);
      return;
    }
    res.status(404).end();
  });

  app.get("/yandex_bac46bfa93c251d0.html", (_req, res) => {
    res.type("text/html").send(
      `<html>\n    <head>\n        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">\n    </head>\n    <body>Verification: bac46bfa93c251d0</body>\n</html>`
    );
  });

  // Google Merchant Center product feed (RSS 2.0 with g: namespace)
  app.get("/google-merchant.xml", async (req, res) => {
    try {
      const stCfg = reqStore(req);
      const SITE = stCfg.domain;
      const ANIMAL_LABEL: Record<string, string> = {
        kedi: "Kedi", kopek: "Köpek", kus: "Kuş",
        kemirgen: "Kemirgen", akvaryum: "Akvaryum", balik: "Balık",
      };
      const GOOGLE_CATEGORY: Record<string, string> = {
        kedi: "Animals & Pet Supplies > Pet Supplies > Cat Supplies > Cat Food",
        kopek: "Animals & Pet Supplies > Pet Supplies > Dog Supplies > Dog Food",
        kus: "Animals & Pet Supplies > Pet Supplies > Bird Supplies > Bird Food",
        kemirgen: "Animals & Pet Supplies > Pet Supplies > Small Animal Supplies > Small Animal Food",
        akvaryum: "Animals & Pet Supplies > Pet Supplies > Fish Supplies",
      };

      const { rows } = await sharedPool.query(`
        SELECT p.id, p.name, p.price, p.original_price, p.img, p.stock, p.barcode,
               p.is_active, p.preorder_enabled,
               bc.brand_name, bc.animal, s.display_name as subcategory_name
        FROM products p
        LEFT JOIN brand_categories bc ON p.brand_category_id = bc.id
        LEFT JOIN subcategories s ON bc.subcategory = s.slug AND bc.animal = s.animal
        WHERE p.is_active = true AND p.price > 0
        ORDER BY p.id
      `);

      const clean = (s: string | null | undefined) =>
        String(s ?? "")
          .replace(/[\r\n\t]+/g, " ")
          .replace(/[\x00-\x1F\x7F]/g, "")
          .replace(/\s+/g, " ")
          .trim();
      const esc = (s: string | null | undefined) =>
        clean(s)
          .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

      const fmtPrice = (n: number) => `${Number(n).toFixed(2)} TRY`;
      const truncate = (s: string, max: number) =>
        s.length <= max ? s : s.slice(0, max - 1).trimEnd() + "…";

      // Preorder availability date: 3 days from now in ISO 8601
      const preorderDate = new Date();
      preorderDate.setDate(preorderDate.getDate() + 3);
      const preorderDateStr = preorderDate.toISOString().split("T")[0];

      // Teslimat modeli: kargo domainleri "aynı gün teslimat" demez.
      const isCargo = stCfg.commerce.fulfillment === "cargo";
      const merchantCfg = await getStoreMerchantConfig(stCfg.id);
      // Kargo ücreti SADECE kargo modelinde anlamlıdır; aynı gün modeli her zaman
      // ücretsizdir (override yok sayılır). Kargo için pozitif bir fiyat yoksa
      // (ne admin override ne cargo_fee) shipping bloğu HİÇ yazılmaz; Google
      // Merchant Center hesap düzeyi kargo ayarına bırakılır. Kargo domaini
      // ASLA "0.00 TRY / ücretsiz aynı gün" iddiasında bulunmaz.
      let shipAmount: string | null;
      if (isCargo) {
        let amt = merchantCfg?.shippingAmount != null ? Number(merchantCfg.shippingAmount) : NaN;
        if (!Number.isFinite(amt)) {
          const cs = await resolveSettings(["cargo_fee"], stCfg.id);
          amt = Number(cs.cargo_fee ?? 0) || 0;
        }
        shipAmount = amt > 0 ? amt.toFixed(2) : null;
      } else {
        shipAmount = "0.00";
      }
      const shipService = isCargo ? "Kargo" : "Aynı Gün Teslimat";
      const deliveryLine = isCargo
        ? "Türkiye geneli hızlı kargo ile teslimat."
        : "Aynı gün kapıda teslimat ve kapıda ödeme imkanı.";
      const channelDesc = isCargo
        ? `${stCfg.name} — Türkiye geneli hızlı kargo. Kedi maması, köpek maması, kedi kumu ve tüm pet ürünleri.`
        : `${stCfg.name} — aynı gün kapıda teslimat ve kapıda ödeme. Kedi maması, köpek maması, kedi kumu ve tüm pet ürünleri.`;
      const mpnPrefix = (stCfg.brandWord || "PET").replace(/[^A-Za-z0-9]+/g, "").toUpperCase() || "PET";

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n`;
      xml += `  <channel>\n`;
      xml += `    <title>${esc(stCfg.name)}</title>\n`;
      xml += `    <link>${SITE}</link>\n`;
      xml += `    <description>${esc(channelDesc)}</description>\n`;

      let included = 0;
      let skippedNoImage = 0;
      for (const r of rows as any[]) {
        // Google requires a valid image_link — skip products without images
        if (!r.img) { skippedNoImage++; continue; }

        const animal = clean(r.animal).toLowerCase();
        const animalLabel = ANIMAL_LABEL[animal] || "";
        const subcatClean = clean(r.subcategory_name);
        const brandClean = clean(r.brand_name) || stCfg.brandWord;
        const nameClean = truncate(clean(r.name), 150);

        const productType = [animalLabel, subcatClean, brandClean].filter(Boolean).join(" > ");
        const googleCat = GOOGLE_CATEGORY[animal] || "Animals & Pet Supplies > Pet Supplies";
        const inStock = r.stock > 0;
        const availability = inStock
          ? "in_stock"
          : (r.preorder_enabled ? "preorder" : "out_of_stock");
        const imageUrl = r.img.startsWith("http") ? r.img : `${SITE}${r.img}`;
        const nameStartsWithBrand = brandClean && nameClean.toLowerCase().startsWith(brandClean.toLowerCase());
        const descPrefix = nameStartsWithBrand ? nameClean : `${brandClean} ${nameClean}`;
        const descRaw = `${descPrefix}. ${animalLabel} için ${subcatClean || "pet ürünü"}. ${deliveryLine}`;
        const description = truncate(descRaw, 5000);

        // Pricing: if original_price > price, original goes in g:price, discounted in g:sale_price
        const hasDiscount = r.original_price && r.original_price > r.price;
        const listPrice = hasDiscount ? r.original_price : r.price;

        xml += `    <item>\n`;
        xml += `      <g:id>${r.id}</g:id>\n`;
        xml += `      <g:title>${esc(nameClean)}</g:title>\n`;
        xml += `      <g:description>${esc(description)}</g:description>\n`;
        xml += `      <g:link>${SITE}/urun/${r.id}</g:link>\n`;
        xml += `      <g:image_link>${esc(imageUrl)}</g:image_link>\n`;
        xml += `      <g:availability>${availability}</g:availability>\n`;
        if (availability === "preorder") {
          xml += `      <g:availability_date>${preorderDateStr}</g:availability_date>\n`;
        }
        xml += `      <g:price>${fmtPrice(listPrice)}</g:price>\n`;
        if (hasDiscount) {
          xml += `      <g:sale_price>${fmtPrice(r.price)}</g:sale_price>\n`;
        }
        xml += `      <g:condition>new</g:condition>\n`;
        xml += `      <g:brand>${esc(brandClean)}</g:brand>\n`;
        if (r.barcode && /^\d{8,14}$/.test(String(r.barcode).trim())) {
          xml += `      <g:gtin>${esc(r.barcode)}</g:gtin>\n`;
        } else {
          // No valid GTIN — provide MPN; with brand+mpn Google accepts the product.
          // Marka sızıntısını önlemek için domaine özel marka kelimesini kullan.
          xml += `      <g:mpn>${esc(mpnPrefix)}-${r.id}</g:mpn>\n`;
        }
        xml += `      <g:google_product_category>${esc(googleCat)}</g:google_product_category>\n`;
        if (productType) xml += `      <g:product_type>${esc(productType)}</g:product_type>\n`;
        if (shipAmount != null) {
          xml += `      <g:shipping>\n`;
          xml += `        <g:country>TR</g:country>\n`;
          xml += `        <g:service>${esc(shipService)}</g:service>\n`;
          xml += `        <g:price>${shipAmount} TRY</g:price>\n`;
          xml += `      </g:shipping>\n`;
        }
        xml += `    </item>\n`;
        included++;
      }
      console.log(`[google-merchant] included=${included} skippedNoImage=${skippedNoImage}`);

      xml += `  </channel>\n</rss>\n`;

      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch (err) {
      console.error("Google Merchant feed error:", err);
      res.status(500).send("Feed generation failed");
    }
  });

  // Google Yerel Envanter (Local Inventory) feed'i — fiziksel mağaza stok/fiyat verisi.
  // Ürün feed'indeki (/google-merchant.xml) g:id ile eşleşir; her satır bir mağaza
  // kodu (store_code) ile o üründeki yerel stok ve fiyatı bildirir. Mağaza kodu jetgo
  // için ATAKUM001 varsayılanına düşer; diğer mağazalar kod girilmediyse ürün satırı
  // ÜRETMEZ (davranış değişmez). Canlı üretilir: ürün fiyatı/stoğu/aktifliği anında
  // yansır. Kanonik adres /google-local-inventory-feed.xml; eski adres alias korunur.
  app.get(["/google-local-inventory-feed.xml", "/google-local-inventory.xml"], async (req, res) => {
    try {
      const stCfg = reqStore(req);
      const SITE = stCfg.domain;
      const merchantCfg = await getStoreMerchantConfig(stCfg.id);
      const storeCode = effectiveStoreCode(stCfg.id, merchantCfg);

      const clean = (s: string | null | undefined) =>
        String(s ?? "")
          .replace(/[\r\n\t]+/g, " ")
          .replace(/[\x00-\x1F\x7F]/g, "")
          .replace(/\s+/g, " ")
          .trim();
      const esc = (s: string | null | undefined) =>
        clean(s)
          .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
      const fmtPrice = (n: number) => `${Number(n).toFixed(2)} TRY`;

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n`;
      xml += `  <channel>\n`;
      xml += `    <title>${esc(stCfg.name)} — Yerel Envanter</title>\n`;
      xml += `    <link>${SITE}</link>\n`;
      xml += `    <description>${esc(stCfg.name)} fiziksel mağaza yerel envanteri.</description>\n`;

      let included = 0;
      if (storeCode) {
        // Ürün feed'iyle aynı ürün kümesi: aktif, fiyatı>0, resimli (pasif ürün hariç).
        const { rows } = await sharedPool.query(`
          SELECT p.id, p.price, p.original_price, p.stock
          FROM products p
          WHERE p.is_active = true AND p.price > 0 AND p.img IS NOT NULL AND p.img <> ''
          ORDER BY p.id
        `);
        for (const r of rows as any[]) {
          const qty = Math.max(0, Math.floor(Number(r.stock) || 0));
          const availability = qty > 0 ? "in_stock" : "out_of_stock";
          const hasDiscount = r.original_price && r.original_price > r.price;
          const listPrice = hasDiscount ? r.original_price : r.price;
          // g:id ürün feed'iyle BİREBİR eşleşmeli (Google yerel satırı ürünle id ile
          // eşler). Ayrı bir SKU alanı yok → ürün ID kullanılır.
          xml += `    <item>\n`;
          xml += `      <g:store_code>${esc(storeCode)}</g:store_code>\n`;
          xml += `      <g:id>${r.id}</g:id>\n`;
          xml += `      <g:availability>${availability}</g:availability>\n`;
          xml += `      <g:quantity>${qty}</g:quantity>\n`;
          xml += `      <g:price>${fmtPrice(listPrice)}</g:price>\n`;
          if (hasDiscount) {
            xml += `      <g:sale_price>${fmtPrice(r.price)}</g:sale_price>\n`;
          }
          xml += `      <g:pickup_method>buy</g:pickup_method>\n`;
          xml += `      <g:pickup_sla>same day</g:pickup_sla>\n`;
          xml += `    </item>\n`;
          included++;
        }
      }
      console.log(`[google-local-inventory] store=${stCfg.id} code=${storeCode ? "set" : "MISSING"} included=${included}`);

      xml += `  </channel>\n</rss>\n`;

      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      // Yerel envanter stok/fiyata duyarlı; ürün feed'inden (3600) daha kısa cache.
      res.setHeader("Cache-Control", "public, max-age=300");
      res.send(xml);
    } catch (err) {
      console.error("Google Local Inventory feed error:", err);
      res.status(500).send("Feed generation failed");
    }
  });

  // Per-domain PWA manifest. Every store gets its own name/short_name/theme so the
  // installed home-screen app is branded for the domain the customer visited, instead
  // of the shared static client/public/manifest.json (which still carries the legacy
  // "JETGO" name). This route serves all stores dynamically from per-store config, so
  // the static file is only a fallback if this handler is ever bypassed.
  app.get("/manifest.json", (req, res) => {
    const store = reqStore(req);
    res.type("application/manifest+json").json({
      name: store.name,
      short_name: store.shortName,
      description: `${store.name} - Hızlı Sipariş, Kapınıza Teslimat`,
      start_url: "/",
      display: "standalone",
      background_color: store.theme.topBar,
      theme_color: store.theme.topBar,
      orientation: "portrait",
      scope: "/",
      lang: "tr",
      categories: ["shopping", "lifestyle"],
      icons: [
        { src: "/favicon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
        { src: "/favicon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
      ],
    });
  });

  app.get("/robots.txt", (req, res) => {
    res.set("Content-Type", "text/plain");
    const robotsStore = reqStore(req);
    const txt = [
      `# ${robotsStore.name} - robots.txt`,
      "User-agent: *",
      "Allow: /",
      "Disallow: /admin",
      "Disallow: /odeme",
      "Disallow: /giris",
      "Disallow: /hesabim",
      "Disallow: /siparis-takip",
      "Disallow: /sepet",
      "",
      "# AI Search Crawlers (explicitly allowed)",
      "User-agent: GPTBot",
      "Allow: /",
      "User-agent: OAI-SearchBot",
      "Allow: /",
      "User-agent: ChatGPT-User",
      "Allow: /",
      "User-agent: Google-Extended",
      "Allow: /",
      "User-agent: PerplexityBot",
      "Allow: /",
      "User-agent: Perplexity-User",
      "Allow: /",
      "User-agent: ClaudeBot",
      "Allow: /",
      "User-agent: anthropic-ai",
      "Allow: /",
      "User-agent: Claude-Web",
      "Allow: /",
      "User-agent: cohere-ai",
      "Allow: /",
      "User-agent: Bytespider",
      "Allow: /",
      "User-agent: Applebot-Extended",
      "Allow: /",
      "User-agent: YouBot",
      "Allow: /",
      "User-agent: Meta-ExternalAgent",
      "Allow: /",
      "",
      "# Search Engine Bots",
      "User-agent: Googlebot",
      "Allow: /",
      "User-agent: Googlebot-Image",
      "Allow: /",
      "User-agent: Bingbot",
      "Allow: /",
      "User-agent: YandexBot",
      "Allow: /",
      "User-agent: DuckDuckBot",
      "Allow: /",
      "",
      `Sitemap: ${reqOrigin(req)}/sitemap.xml`,
      "",
    ].join("\n");
    res.send(txt);
  });

  // llms.txt — AI agent / LLM-friendly site summary (emerging standard)
  app.get("/llms.txt", (req, res) => {
    res.type("text/plain").send(brandifyFor(reqStore(req), `# JETGO Pet Shop Samsun

> Samsun'un (Atakum, İlkadım, Canik) en hızlı pet shop'u. Kedi maması, köpek maması, kedi kumu, ödül maması, kuş yemi, kemirgen yemi, akvaryum ve pet aksesuarlarında **aynı gün teslimat** ve **kapıda ödeme** sunan online evcil hayvan mağazası.

## Hakkımızda
- **Marka:** JETGO Pet Shop
- **Şirket:** Sizpa İnternet Tic. Ltd. Şti.
- **Şehir:** Samsun, Türkiye
- **Hizmet bölgeleri:** Atakum, İlkadım, Canik (tüm mahalleler)
- **Mağaza adresi:** Yenimahalle Atatürk 3. Kısım Bulvarı No:113/A, Atakum, Samsun (55200)
- **Domain:** https://www.jetgomarket.com
- **Telefon:** +90 850 840 39 59
- **E-posta:** info@sizpa.com
- **Çalışma saatleri:** Pazartesi-Cumartesi 09:00-22:00, Pazar 10:00-22:00 (online sipariş 7/24)

## Ana Hizmetler
- Aynı gün teslimat (Samsun içi 20 km yarıçap)
- Kapıda nakit / kart ödeme
- AI destekli pet bakım danışmanı (chatbot)
- Akıllı mama hesaplama
- Reçeteli mama tekrar siparişi hatırlatma
- Sahiplendirme & kayıp ilan tahtası
- Sokak hayvanlarına askıda mama bağışı

## Ana Sayfalar
- Anasayfa: https://www.jetgomarket.com/
- Kedi Maması: https://www.jetgomarket.com/kedi-mamasi
- Köpek Maması: https://www.jetgomarket.com/kopek-mamasi
- Kedi Kumu: https://www.jetgomarket.com/kedi-kumu
- Pet Aksesuar: https://www.jetgomarket.com/pet-aksesuar
- Atakum Pet Shop: https://www.jetgomarket.com/atakum-petshop
- İlkadım Pet Shop: https://www.jetgomarket.com/ilkadim-petshop
- Canik Pet Shop: https://www.jetgomarket.com/canik-petshop
- Kampanyalar: https://www.jetgomarket.com/kampanya
- Blog: https://www.jetgomarket.com/blog
- İletişim: https://www.jetgomarket.com/iletisim
- Sitemap: https://www.jetgomarket.com/sitemap.xml

## Sıkça Sorulan Sorular
- **Samsun'da pet shop ürünleri kaç saatte teslim edilir?** Atakum, İlkadım, Canik içi siparişler aynı gün, çoğu zaman 1-3 saat içinde teslim edilir.
- **Kapıda ödeme var mı?** Evet, nakit ve kredi kartıyla kapıda ödeme yapabilirsiniz.
- **Minimum sipariş tutarı nedir?** Bölgeye göre değişir; çoğu mahallede 200 TL üzeri siparişlerde teslimat ücretsizdir.
- **İade politikanız nedir?** Açılmamış mama ürünlerinde 14 gün iade hakkı vardır.

## İçerik Politikası
Bu site içeriği, AI arama motorları (ChatGPT, Perplexity, Claude, Gemini, Bing AI, vb.) tarafından **kullanıcılara yanıt verirken kaynak gösterilerek** kullanılabilir.
`));
  });

  // IndexNow key file (Bing/Yandex instant indexing)
  app.get("/jetgo-indexnow-2026.txt", (_req, res) => {
    res.type("text/plain").send("jetgo-indexnow-2026");
  });

  app.get("/api/social-proof/recent", async (_req, res) => {
    try {
      const all = await storage.getAllOrders();
      const since = Date.now() - 24 * 60 * 60 * 1000;
      const districtRegex = /(atakum|i̇lkadım|ilkadım|canik|tekkek[oö]y|bafra|terme|carşamba|çarşamba|vezirk[oö]pr[uü]|samsun)/i;
      const districtNorm = (s: string) => {
        const m = s.toLowerCase().normalize("NFC");
        if (m.includes("atakum")) return "Atakum";
        if (m.includes("ilkadım") || m.includes("i̇lkadım") || m.includes("ilkadim")) return "İlkadım";
        if (m.includes("canik")) return "Canik";
        if (m.includes("tekkek")) return "Tekkeköy";
        if (m.includes("bafra")) return "Bafra";
        if (m.includes("terme")) return "Terme";
        if (m.includes("çarşamba") || m.includes("carşamba") || m.includes("carsamba")) return "Çarşamba";
        if (m.includes("vezir")) return "Vezirköprü";
        return "Samsun";
      };
      const seen = new Set<string>();
      const out = all
        .filter((o) => {
          const created = o.createdAt ? new Date(o.createdAt).getTime() : 0;
          if (created < since) return false;
          if (!o.customerName || !Array.isArray(o.items) || o.items.length === 0) return false;
          if (o.status === "iptal" || o.status === "cancelled") return false;
          return true;
        })
        .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
        .slice(0, 40)
        .map((o) => {
          const fullName = (o.customerName || "").trim();
          const parts = fullName.split(/\s+/);
          const firstName = parts[0] || "Bir müşteri";
          const lastInitial = parts[1] && parts[1].length > 0 ? parts[1][0].toUpperCase() + "." : "";
          const safeName = (firstName.length > 10 ? firstName.slice(0, 10) : firstName) + (lastInitial ? " " + lastInitial : "");
          const addr = (o.customerAddress || "").trim();
          const district = districtRegex.test(addr) ? districtNorm(addr) : "";
          const firstItem = (o.items as any[])[0];
          const productName = String(firstItem?.name || "Pet ürünü").slice(0, 60);
          const ageMin = Math.floor((Date.now() - new Date(o.createdAt!).getTime()) / 60000);
          const timeLabel = ageMin <= 30 ? "az önce" : ageMin <= 180 ? "biraz önce" : "bugün";
          return { firstName: safeName, district, productName, timeLabel };
        })
        .filter((r) => {
          const key = r.firstName + "|" + r.productName;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, 20);
      res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
      res.json(out);
    } catch {
      res.json([]);
    }
  });

  app.get("/api/products", async (req, res) => {
    const allProducts = await storage.getAllProducts();
    const isAdmin = !!(req.session as any)?.userId;
    const showAll = req.query.all === "true" && isAdmin;
    if (showAll) {
      res.setHeader("Cache-Control", "private, no-store");
      res.json(allProducts);
    } else {
      res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
      res.json(allProducts.filter(p => p.isActive).map(({ costPrice, ...rest }) => rest));
    }
  });

  app.get("/api/admin/missing-products", requireAdmin, async (_req, res) => {
    const all = await storage.getAllProducts();
    const noImage = all.filter(p => !p.img || p.img === "");
    const noPrice = all.filter(p => !p.price || p.price <= 0);
    const noStock = all.filter(p => p.isActive && (p.stock ?? 0) <= 0);
    const inactive = all.filter(p => !p.isActive);
    res.json({
      counts: {
        total: all.length,
        noImage: noImage.length,
        noPrice: noPrice.length,
        noStock: noStock.length,
        inactive: inactive.length,
      },
      noImage: noImage.slice(0, 200).map(p => ({ id: p.id, name: p.name, isActive: p.isActive, price: p.price, stock: p.stock })),
      noPrice: noPrice.slice(0, 200).map(p => ({ id: p.id, name: p.name, isActive: p.isActive, price: p.price, stock: p.stock })),
      noStock: noStock.slice(0, 200).map(p => ({ id: p.id, name: p.name, isActive: p.isActive, price: p.price, stock: p.stock })),
      inactive: inactive.slice(0, 200).map(p => ({ id: p.id, name: p.name, isActive: p.isActive, price: p.price, stock: p.stock })),
    });
  });

  app.get("/api/products/search", async (req, res) => {
    const query = (req.query.q as string || "").trim();
    if (!query || query.length < 2) return res.json([]);
    const results = await storage.searchProducts(query);
    res.json(results.filter(p => p.isActive && !(p as any).isStreetAnimal).slice(0, 20).map(({ costPrice, ...rest }) => rest));
  });

  app.get("/api/street-animals", async (_req, res) => {
    try {
      const r = await sharedPool.query(
        `SELECT id, name, price, original_price AS "originalPrice", img, stock, barcode, is_active AS "isActive", is_street_animal AS "isStreetAnimal"
         FROM products WHERE is_street_animal = true AND is_active = true ORDER BY id DESC`
      );
      res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
      res.json(r.rows);
    } catch (e: any) {
      console.error("[/api/street-animals]", e?.message);
      res.status(500).json({ message: "Hata" });
    }
  });

  app.get("/api/admin/street-animals", requireAdmin, async (_req, res) => {
    const r = await sharedPool.query(
      `SELECT id, name, price, original_price AS "originalPrice", img, stock, barcode, is_active AS "isActive",
              skt, cost_price AS "costPrice"
       FROM products WHERE is_street_animal = true ORDER BY id DESC`
    );
    res.json(r.rows);
  });

  app.post("/api/admin/street-animals/quick-create", requireAdmin, upload.single("image"), async (req, res) => {
    try {
      const name = String(req.body.name || "").trim();
      const price = parseFloat(req.body.price);
      const originalPriceRaw = req.body.originalPrice ? parseFloat(req.body.originalPrice) : null;
      const stock = req.body.stock !== undefined ? parseInt(String(req.body.stock)) : 0;
      const barcode = req.body.barcode ? String(req.body.barcode).trim() : null;
      const skt = req.body.skt ? String(req.body.skt).trim() : null;
      const costPrice = req.body.costPrice ? parseFloat(req.body.costPrice) : null;
      const isActive = req.body.isActive === undefined ? true : (req.body.isActive === "true" || req.body.isActive === true || req.body.isActive === "1");
      if (!name) return res.status(400).json({ message: "Ürün adı gerekli" });
      if (!price || price <= 0) return res.status(400).json({ message: "Geçerli fiyat gerekli" });

      const catRes = await sharedPool.query(
        `SELECT id FROM brand_categories WHERE animal = 'sokak_canlari' AND subcategory = 'sokak_canlari' LIMIT 1`
      );
      let catId: number;
      if (catRes.rows.length > 0) {
        catId = catRes.rows[0].id;
      } else {
        const ins = await sharedPool.query(
          `INSERT INTO brand_categories (brand_name, brand_slug, animal, subcategory)
           VALUES ('Sokak Canları', 'sokak-canlari', 'sokak_canlari', 'sokak_canlari') RETURNING id`
        );
        catId = ins.rows[0].id;
      }
      const cat = { id: catId } as any;

      const product = await storage.createProduct({
        name,
        price,
        originalPrice: originalPriceRaw && originalPriceRaw > price ? originalPriceRaw : null,
        skt,
        img: null,
        originalImg: null,
        brandCategoryId: cat!.id,
        isActive,
        stock: isNaN(stock) ? 0 : stock,
        barcode,
        costPrice: costPrice && !isNaN(costPrice) ? costPrice : null,
        mamaType: null,
        preorderEnabled: false,
        isStreetAnimal: true,
      } as any);

      if (req.file && req.file.mimetype.startsWith("image/")) {
        try {
          const imgPath = await saveProductImage(req.file.buffer, product.id);
          await storage.updateProduct(product.id, { img: imgPath });
          (product as any).img = imgPath;
        } catch (e: any) {
          console.error("[street-animals quick-create] image save failed:", e?.message);
        }
      }

      res.status(201).json(product);
    } catch (err: any) {
      console.error("[/api/admin/street-animals/quick-create]", err?.message, err?.stack);
      res.status(500).json({ message: "Oluşturulamadı", detail: err?.message });
    }
  });

  app.patch("/api/admin/street-animals/:id", requireAdmin, async (req, res) => {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) return res.status(400).json({ message: "Geçersiz id" });
    const allowed: any = {};
    if (req.body.isActive !== undefined) allowed.isActive = !!req.body.isActive;
    if (req.body.price !== undefined) allowed.price = parseFloat(req.body.price);
    if (req.body.stock !== undefined) allowed.stock = parseInt(String(req.body.stock));
    if (req.body.name !== undefined) allowed.name = String(req.body.name).trim();
    if (req.body.skt !== undefined) allowed.skt = req.body.skt ? String(req.body.skt).trim() : null;
    if (req.body.costPrice !== undefined) allowed.costPrice = req.body.costPrice ? parseFloat(req.body.costPrice) : null;
    if (req.body.barcode !== undefined) allowed.barcode = req.body.barcode ? String(req.body.barcode).trim() : null;
    if (req.body.originalPrice !== undefined) allowed.originalPrice = req.body.originalPrice ? parseFloat(req.body.originalPrice) : null;
    if (Object.keys(allowed).length === 0) return res.status(400).json({ message: "Güncellenecek alan yok" });
    const updated = await storage.updateProduct(id, allowed);
    res.json(updated);
  });

  app.delete("/api/admin/street-animals/:id", requireAdmin, async (req, res) => {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) return res.status(400).json({ message: "Geçersiz id" });
    await sharedPool.query("DELETE FROM products WHERE id = $1 AND is_street_animal = true", [id]);
    res.json({ ok: true });
  });

  app.post("/api/admin/login", async (req, res) => {
    const ip = req.ip || "unknown";
    const now = Date.now();
    const attempt = loginAttempts.get(ip);
    if (attempt && attempt.blockedUntil > now) {
      const wait = Math.ceil((attempt.blockedUntil - now) / 1000);
      return res.status(429).json({ message: `Çok fazla deneme. ${wait} saniye bekleyin.` });
    }

    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }
    const user = await storage.getUserByUsername(username);
    if (!user) {
      const c = (attempt?.count || 0) + 1;
      loginAttempts.set(ip, { count: c, blockedUntil: c >= 5 ? now + 5 * 60 * 1000 : 0 });
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      const c = (attempt?.count || 0) + 1;
      loginAttempts.set(ip, { count: c, blockedUntil: c >= 5 ? now + 5 * 60 * 1000 : 0 });
      return res.status(401).json({ message: "Invalid credentials" });
    }
    loginAttempts.delete(ip);
    (req.session as any).userId = user.id;
    res.json({ message: "Login successful" });
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.post("/api/admin/import-vet", requireAdmin, async (_req, res) => {
    if (isVetImportRunning()) {
      return res.status(409).json({ message: "İçe aktarma zaten çalışıyor" });
    }
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("X-Accel-Buffering", "no");
    const write = (msg: string) => {
      try {
        res.write(msg + "\n");
      } catch {
        /* client gone */
      }
    };
    try {
      const result = await runVetImport(write);
      write(`STATUS: ${JSON.stringify(result)}`);
    } catch (err: any) {
      write(`[FATAL] ${err?.message || err}`);
    } finally {
      res.end();
    }
  });

  app.get("/api/admin/import-vet/status", requireAdmin, (_req, res) => {
    res.json(getVetImportStatus());
  });

  app.post("/api/admin/fill-seo", requireAdmin, async (req, res) => {
    if (isSeoFillRunning()) {
      return res.status(409).json({ message: "SEO doldurma zaten çalışıyor" });
    }
    const overwrite = req.query.overwrite === "1" || req.query.overwrite === "true";
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("X-Accel-Buffering", "no");
    const write = (msg: string) => {
      try {
        res.write(msg + "\n");
      } catch {
        /* client gone */
      }
    };
    try {
      const result = await runSeoFill(write, { overwrite });
      write(`STATUS: ${JSON.stringify(result)}`);
    } catch (err: any) {
      write(`[FATAL] ${err?.message || err}`);
    } finally {
      res.end();
    }
  });

  app.get("/api/admin/fill-seo/status", requireAdmin, (_req, res) => {
    res.json(getSeoFillStatus());
  });

  app.get("/api/admin/me", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const user = await storage.getUser(userId);
    if (!user) return res.status(401).json({ message: "Not authenticated" });
    res.json({ username: user.username });
  });

  app.post("/api/admin/brand-categories", requireAdmin, async (req, res) => {
    const parsed = insertBrandCategorySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    const category = await storage.createBrandCategory(parsed.data);
    res.status(201).json(category);
  });

  app.patch("/api/admin/brand-categories/:id", requireAdmin, async (req, res) => {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) return res.status(400).json({ message: "Geçersiz ID" });
    const allowedKeys = ["brandName", "brandSlug", "animal", "subcategory"];
    const safeBody: Record<string, any> = {};
    for (const key of allowedKeys) {
      if (req.body[key] !== undefined) safeBody[key] = req.body[key];
    }
    const category = await storage.updateBrandCategory(id, safeBody);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  });

  app.delete("/api/admin/brand-categories/:id", requireAdmin, async (req, res) => {
    const id = parseInt(String(req.params.id));
    await storage.deleteBrandCategory(id);
    res.json({ message: "Deleted" });
  });

  app.post("/api/admin/products", requireAdmin, async (req, res) => {
    const parsed = insertProductSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    const data: any = { ...parsed.data };
    try {
      if (data.brandCategoryId) {
        const c = await sharedPool.query(`SELECT animal FROM brand_categories WHERE id = $1`, [data.brandCategoryId]);
        if (c.rows[0]?.animal === "sokak_canlari") data.isStreetAnimal = true;
      }
    } catch {}
    const product = await storage.createProduct(data);
    if (product.img && product.img.startsWith("http")) {
      const imgPath = await downloadAndSaveImage(product.img, product.id);
      if (imgPath) {
        const updated = await storage.updateProduct(product.id, { img: imgPath });
        return res.status(201).json(updated);
      }
    }
    res.status(201).json(product);
  });

  app.patch("/api/admin/products/:id", requireAdmin, async (req, res) => {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) return res.status(400).json({ message: "Geçersiz ürün ID" });
    const allowedFields = ["name", "price", "originalPrice", "skt", "img", "originalImg", "brandCategoryId", "isActive", "stock", "barcode", "costPrice", "mamaType", "preorderEnabled", "hiddenPaymentMethods", "variants", "longDescription", "metaTitle", "metaDescription", "metaKeywords"];
    const safeBody: Record<string, any> = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) safeBody[key] = req.body[key];
    }
    if (safeBody.img && typeof safeBody.img === "string" && safeBody.img.startsWith("http")) {
      const imgPath = await downloadAndSaveImage(safeBody.img, id);
      if (imgPath) {
        safeBody.img = imgPath;
      }
    }
    if (safeBody.brandCategoryId) {
      try {
        const c = await sharedPool.query(`SELECT animal FROM brand_categories WHERE id = $1`, [safeBody.brandCategoryId]);
        if (c.rows[0]?.animal === "sokak_canlari") safeBody.isStreetAnimal = true;
        else if (c.rows[0]?.animal) safeBody.isStreetAnimal = false;
      } catch {}
    }
    const product = await storage.updateProduct(id, safeBody);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.post("/api/admin/products/:id/image", requireAdmin, upload.single("image"), async (req, res) => {
    const id = parseInt(String(req.params.id));
    if (!req.file) return res.status(400).json({ message: "Resim dosyası gerekli" });
    if (!req.file.mimetype.startsWith("image/")) return res.status(400).json({ message: "Sadece resim dosyaları yüklenebilir" });
    try {
      const imgPath = await saveProductImage(req.file.buffer, id);
      const product = await storage.updateProduct(id, { img: imgPath });
      if (!product) return res.status(404).json({ message: "Ürün bulunamadı" });
      res.json(product);
    } catch (err: any) {
      console.log(`[image] Upload error for product ${id}: ${err.message}`);
      res.status(500).json({ message: "Resim yüklenemedi" });
    }
  });

  app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
    const id = parseInt(String(req.params.id));
    await storage.deleteProduct(id);
    res.json({ message: "Deleted" });
  });

  app.post("/api/admin/products/bulk-price-update", requireAdmin, async (req, res) => {
    const { productIds, percentage } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0 || typeof percentage !== "number" || percentage === 0) {
      return res.status(400).json({ message: "Invalid data" });
    }
    const multiplier = 1 + percentage / 100;
    let updated = 0;
    for (const id of productIds) {
      const product = await storage.getProduct(id);
      if (product) {
        const newPrice = Math.round(product.price * multiplier * 100) / 100;
        const updateData: any = { price: newPrice };
        if (product.originalPrice) {
          updateData.originalPrice = Math.round(product.originalPrice * multiplier * 100) / 100;
        }
        await storage.updateProduct(id, updateData);
        updated++;
      }
    }
    res.json({ message: `${updated} ürün fiyatı güncellendi`, updated });
  });

  app.post("/api/admin/products/bulk-individual-update", requireAdmin, async (req, res) => {
    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: "Invalid data" });
    }
    let updated = 0;
    for (const { id, price } of updates) {
      if (typeof id === "number" && typeof price === "number" && price >= 0) {
        await storage.updateProduct(id, { price });
        updated++;
      }
    }
    res.json({ message: `${updated} ürün fiyatı güncellendi`, updated });
  });

  app.post("/api/admin/products/rename-hills", requireAdmin, async (_req, res) => {
    const all = await storage.getAllProducts();
    const re = /^Hill(?:&#0?39;|')?s\s+Prescription\s+Diet\s+/i;
    const changes: { id: number; from: string; to: string }[] = [];
    for (const p of all) {
      if (re.test(p.name)) {
        const newName = p.name.replace(re, "Hills ");
        if (newName !== p.name) {
          await storage.updateProduct(p.id, { name: newName });
          changes.push({ id: p.id, from: p.name, to: newName });
        }
      }
    }
    res.json({ message: `${changes.length} ürün adı güncellendi`, count: changes.length, changes });
  });

  app.post("/api/admin/products/bulk-stock-update", requireAdmin, async (req, res) => {
    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0 || updates.length > 500) {
      return res.status(400).json({ message: "Invalid data" });
    }
    let updated = 0;
    for (const item of updates) {
      const id = Number(item.id);
      const stock = Number(item.stock);
      if (!Number.isInteger(id) || id <= 0 || !Number.isFinite(stock) || stock < 0) continue;
      const product = await storage.getProduct(id);
      if (product) {
        await storage.updateProduct(id, { stock: Math.floor(stock) });
        updated++;
      }
    }
    res.json({ message: `${updated} ürün stoğu güncellendi`, updated });
  });

  app.get("/api/product-detail/:id", async (req, res) => {
    const id = parseInt(String(req.params.id));
    const product = await storage.getProduct(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const category = await storage.getBrandCategory(product.brandCategoryId);
    const allSections = await storage.getAllCrossSellSections();
    const productAnimal = category?.animal || null;
    const activeSections = allSections
      .filter(s => {
        if (!s.isActive) return false;
        if (s.forProductId !== null) return s.forProductId === id;
        if (s.forAnimal !== null) return s.forAnimal === productAnimal;
        return true;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const allSubsForLookup = await storage.getAllSubcategories();
    const subLookup = new Map<string, string>();
    for (const s of allSubsForLookup) subLookup.set(`${s.animal}|${s.slug}`, s.displayName.replace(/\n/g, " "));
    const sectionsWithProducts = await Promise.all(
      activeSections.map(async (section) => {
        const items = await storage.getCrossSellItemsBySection(section.id);
        const sectionProducts = (await Promise.all(
          items.sort((a, b) => a.sortOrder - b.sortOrder).map(async (item) => {
            const p = await storage.getProduct(item.productId);
            if (!p || !p.isActive) return null;
            const cat = await storage.getBrandCategory(p.brandCategoryId);
            const subcategoryName = cat ? (subLookup.get(`${cat.animal}|${cat.subcategory}`) || null) : null;
            return { ...p, subcategoryName };
          })
        )).filter(Boolean);
        return { ...section, products: sectionProducts };
      })
    );
    const breedStatsList = await storage.getBreedStatsByProduct(id);
    const sortedBreedStats = breedStatsList.sort((a, b) => a.sortOrder - b.sortOrder);
    res.json({ product, category, crossSellSections: sectionsWithProducts.filter(s => s.products.length > 0), breedStats: sortedBreedStats });
  });

  app.get("/api/cross-sell-sections", async (_req, res) => {
    const sections = await storage.getAllCrossSellSections();
    const sectionsWithItems = await Promise.all(
      sections.sort((a, b) => a.sortOrder - b.sortOrder).map(async (section) => {
        const items = await storage.getCrossSellItemsBySection(section.id);
        return { ...section, items };
      })
    );
    res.json(sectionsWithItems);
  });

  app.post("/api/admin/cross-sell-sections", requireAdmin, async (req, res) => {
    const parsed = insertCrossSellSectionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    const section = await storage.createCrossSellSection(parsed.data);
    res.status(201).json(section);
  });

  app.patch("/api/admin/cross-sell-sections/:id", requireAdmin, async (req, res) => {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) return res.status(400).json({ message: "Geçersiz ID" });
    const allowedKeys = ["title", "forProductId", "forAnimal", "sortOrder", "isActive"];
    const safeBody: Record<string, any> = {};
    for (const key of allowedKeys) {
      if (req.body[key] !== undefined) safeBody[key] = req.body[key];
    }
    const section = await storage.updateCrossSellSection(id, safeBody);
    if (!section) return res.status(404).json({ message: "Section not found" });
    res.json(section);
  });

  app.delete("/api/admin/cross-sell-sections/:id", requireAdmin, async (req, res) => {
    const id = parseInt(String(req.params.id));
    await storage.deleteCrossSellSection(id);
    res.json({ message: "Deleted" });
  });

  app.post("/api/admin/cross-sell-items", requireAdmin, async (req, res) => {
    const parsed = insertCrossSellItemSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    const item = await storage.addCrossSellItem(parsed.data);
    res.status(201).json(item);
  });

  app.post("/api/admin/cross-sell-items/bulk", requireAdmin, async (req, res) => {
    try {
      const sectionId = parseInt(String(req.body?.sectionId));
      const productIds: number[] = Array.isArray(req.body?.productIds)
        ? Array.from(new Set(req.body.productIds.map((x: any) => parseInt(String(x))).filter((x: number) => !isNaN(x) && x > 0)))
        : [];
      if (isNaN(sectionId) || productIds.length === 0) {
        return res.status(400).json({ message: "sectionId ve productIds zorunlu" });
      }
      const section = await storage.getCrossSellSection(sectionId);
      if (!section) return res.status(404).json({ message: "Bölüm bulunamadı" });
      const existing = await storage.getCrossSellItemsBySection(sectionId);
      const existingIds = new Set(existing.map(i => i.productId));
      const startOrder = existing.length;
      const toAdd = productIds.filter(id => !existingIds.has(id));
      let added = 0;
      for (let i = 0; i < toAdd.length; i++) {
        try {
          await storage.addCrossSellItem({ sectionId, productId: toAdd[i], sortOrder: startOrder + i + 1 });
          added++;
        } catch (e) {
          console.error("Bulk add cross-sell item error", toAdd[i], e);
        }
      }
      res.status(201).json({ added, skipped: productIds.length - added });
    } catch (err) {
      console.error("Bulk cross-sell error", err);
      res.status(500).json({ message: "Toplu ekleme hatası" });
    }
  });

  app.delete("/api/admin/cross-sell-items/:id", requireAdmin, async (req, res) => {
    const id = parseInt(String(req.params.id));
    await storage.removeCrossSellItem(id);
    res.json({ message: "Deleted" });
  });

  app.post("/api/admin/quick-cross-sell", requireAdmin, async (req, res) => {
    try {
      const { forProductId, addProductId } = req.body;
      if (!forProductId || !addProductId) return res.status(400).json({ message: "forProductId and addProductId required" });
      const allSections = await storage.getAllCrossSellSections();
      let section = allSections.find(s => s.forProductId === forProductId);
      if (!section) {
        section = await storage.createCrossSellSection({
          title: "Sıklıkla Birlikte Alınan",
          forProductId,
          forAnimal: null,
          sortOrder: 0,
          isActive: true,
        });
      }
      const existingItems = await storage.getCrossSellItemsBySection(section.id);
      if (existingItems.some(i => i.productId === addProductId)) {
        return res.status(400).json({ message: "Bu ürün zaten ekli" });
      }
      const item = await storage.addCrossSellItem({
        sectionId: section.id,
        productId: addProductId,
        sortOrder: existingItems.length + 1,
      });
      res.status(201).json(item);
    } catch (err) {
      res.status(500).json({ message: "Cross-sell ekleme hatası" });
    }
  });

  app.post("/api/admin/quick-cross-sell/bulk", requireAdmin, async (req, res) => {
    try {
      const forProductId = parseInt(String(req.body?.forProductId));
      const addProductIds: number[] = Array.isArray(req.body?.addProductIds)
        ? Array.from(new Set(req.body.addProductIds.map((x: any) => parseInt(String(x))).filter((x: number) => !isNaN(x) && x > 0)))
        : [];
      if (isNaN(forProductId) || addProductIds.length === 0) {
        return res.status(400).json({ message: "forProductId ve addProductIds zorunlu" });
      }
      const allSections = await storage.getAllCrossSellSections();
      let section = allSections.find(s => s.forProductId === forProductId);
      if (!section) {
        section = await storage.createCrossSellSection({
          title: "Sıklıkla Birlikte Alınan",
          forProductId,
          forAnimal: null,
          sortOrder: 0,
          isActive: true,
        });
      }
      const existing = await storage.getCrossSellItemsBySection(section.id);
      const existingIds = new Set(existing.map(i => i.productId));
      const toAdd = addProductIds.filter(id => id !== forProductId && !existingIds.has(id));
      let added = 0;
      for (let i = 0; i < toAdd.length; i++) {
        try {
          await storage.addCrossSellItem({ sectionId: section.id, productId: toAdd[i], sortOrder: existing.length + i + 1 });
          added++;
        } catch (e) {
          console.error("Bulk quick cross-sell add error", toAdd[i], e);
        }
      }
      res.status(201).json({ sectionId: section.id, added, skipped: addProductIds.length - added });
    } catch (err) {
      console.error("Bulk quick cross-sell error", err);
      res.status(500).json({ message: "Toplu ekleme hatası" });
    }
  });

  app.get("/api/admin/product-cross-sell/:productId", requireAdmin, async (req, res) => {
    try {
      const pid = parseInt(String(req.params.productId));
      const allSections = await storage.getAllCrossSellSections();
      const section = allSections.find(s => s.forProductId === pid);
      if (!section) return res.json([]);
      const items = await storage.getCrossSellItemsBySection(section.id);
      const itemsWithProducts = await Promise.all(
        items.sort((a, b) => a.sortOrder - b.sortOrder).map(async (item) => {
          const p = await storage.getProduct(item.productId);
          return p ? { ...item, product: p } : null;
        })
      );
      res.json(itemsWithProducts.filter(Boolean));
    } catch (err) {
      res.status(500).json({ message: "Cross-sell fetch error" });
    }
  });

  const createOrderSchema = z.object({
    items: z.array(orderItemSchema).min(1),
    subtotal: z.number(),
    shipping: z.number(),
    discount: z.number(),
    grandTotal: z.number(),
    paymentMethod: z.string(),
    customerNote: z.string().max(500).optional(),
    deliverySlot: z.string().max(60).optional(),
    customerPhone: z.string().min(7, "Telefon numarası gerekli").max(20, "Telefon numarası çok uzun"),
    customerName: z.string().min(1, "Ad soyad gerekli").max(100, "Ad soyad çok uzun"),
    customerAddress: z.string().min(1, "Adres gerekli").max(500, "Adres çok uzun"),
    city: z.string().max(60).optional(),
    district: z.string().max(60).optional(),
    couponCode: z.string().max(50).optional(),
    donationAmount: z.number().min(0).max(1000).optional(),
    installmentMonths: z.number().optional(),
    installmentRate: z.number().optional(),
    installmentMonthly: z.number().optional(),
    installmentTotal: z.number().optional(),
  });

  app.post("/api/orders", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) {
      return res.status(401).json({ message: "Sipariş vermek için giriş yapmalısınız." });
    }
    const customerCheck = await sharedPool.query("SELECT is_blacklisted FROM customers WHERE id = $1", [customerId]);
    if (customerCheck.rows[0]?.is_blacklisted) {
      return res.status(403).json({ message: "Hesabınız askıya alınmıştır. Sipariş veremezsiniz. Lütfen müşteri hizmetleri ile iletişime geçin." });
    }
    const ip = req.ip || "unknown";
    if (rateLimit(`order:${ip}`, 20, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla sipariş denemesi. Lütfen bekleyin." });
    }
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.errors.map(e => e.message).join(", ");
      return res.status(400).json({ message: fieldErrors || "Geçersiz sipariş verisi", errors: parsed.error.errors });
    }
    const { couponCode, ...orderData } = parsed.data;

    try {
      // Ödeme yöntemi açma/kapama anahtarları domaine özeldir (resolveSettings,
      // önekli değer yoksa ortak "all" değerine düşer). Tosla/iyzico API bilgileri
      // tüm domainler için ortak kalır.
      const pmMap = await resolveSettings([
        'payment_nakit_enabled', 'payment_pos_enabled', 'payment_qr_enabled', 'payment_eft_enabled',
        'payment_tosla_enabled', 'payment_iyzico_enabled',
        'tosla_client_id', 'tosla_api_user', 'tosla_api_pass',
        'iyzico_api_key', 'iyzico_secret_key',
      ], reqStore(req).id);
      const isOn = (k: string) => pmMap[k] !== "0" && pmMap[k] !== "false" && pmMap[k] !== undefined;
      const pm = String(orderData.paymentMethod || "").toLowerCase();
      const isOnlineCard = /tosla|iyzico|online/.test(pm);
      const toslaReady = isOn("payment_tosla_enabled") && !!(pmMap.tosla_client_id?.trim() && pmMap.tosla_api_user?.trim() && pmMap.tosla_api_pass?.trim());
      const iyzicoReady = isOn("payment_iyzico_enabled") && !!(pmMap.iyzico_api_key?.trim() && pmMap.iyzico_secret_key?.trim());
      const onlineKeyOk = isOnlineCard && (toslaReady || iyzicoReady);
      if (reqStore(req).commerce.onlinePaymentOnly && !isOnlineCard) {
        return res.status(400).json({ message: "Bu mağazada yalnızca online kredi kartı ile ödeme yapılabilir." });
      }
      const requiredKey = isOnlineCard
        ? null
        : /havale|eft/.test(pm)
        ? "payment_eft_enabled"
        : /qr/.test(pm)
        ? "payment_qr_enabled"
        : /pos|kart/.test(pm)
        ? "payment_pos_enabled"
        : /nakit/.test(pm)
        ? "payment_nakit_enabled"
        : null;
      if (isOnlineCard && !onlineKeyOk) {
        return res.status(400).json({ message: "Seçtiğiniz ödeme yöntemi şu anda kullanılamıyor. Lütfen başka bir yöntem seçin." });
      }
      if (requiredKey && !isOn(requiredKey)) {
        return res.status(400).json({ message: "Seçtiğiniz ödeme yöntemi şu anda kullanılamıyor. Lütfen başka bir yöntem seçin." });
      }
    } catch (e) {
      console.error("Payment method validation error:", e);
    }

    const clientCampaignIds = Array.isArray((req.body as any).campaignProductIds)
      ? new Set((req.body as any).campaignProductIds.map((id: any) => parseInt(String(id))))
      : null;

    const orderStore = publicStoreId(req);
    const allCampaignItems = await sharedPool.query(
      "SELECT product_id, item_type, campaign_price FROM campaign_items WHERE is_active = true AND (store = 'all' OR store = $1)",
      [orderStore]
    );
    const campaignMap = new Map<number, string>();
    const campaignPriceLookup = new Map<number, number>();
    for (const row of allCampaignItems.rows) {
      campaignMap.set(row.product_id, row.item_type);
      if (row.campaign_price !== null && row.campaign_price !== undefined) {
        const cp = parseFloat(String(row.campaign_price));
        if (!isNaN(cp) && cp > 0) campaignPriceLookup.set(row.product_id, cp);
      }
    }

    // SECURITY: server-side price recompute to prevent client tampering
    const allProductsForPrice = await storage.getAllProducts();
    const productPriceMap = new Map<number, { price: number; name: string; img: string | null; isCampaignMain: boolean }>();
    for (const p of allProductsForPrice) {
      productPriceMap.set(p.id, {
        price: Number(p.price) || 0,
        name: p.name,
        img: p.img,
        isCampaignMain: campaignMap.get(p.id) === "main",
      });
    }
    let serverSubtotal = 0;
    for (const item of orderData.items) {
      const pid = parseInt(String(item.productId));
      const p = productPriceMap.get(pid);
      if (!p) {
        return res.status(400).json({ message: `Geçersiz ürün: ${item.productId}` });
      }
      const qty = Math.max(1, parseInt(String(item.quantity)) || 1);
      // Kampanya sayfasından eklenen ürünlerde kampanya fiyatını uygula; aksi halde normal fiyat
      const isFromCampaign = clientCampaignIds !== null && clientCampaignIds.has(pid);
      const effectivePrice = (isFromCampaign && campaignPriceLookup.has(pid))
        ? campaignPriceLookup.get(pid)!
        : p.price;
      item.price = effectivePrice;
      item.name = p.name;
      item.quantity = qty;
      serverSubtotal += effectivePrice * qty;
    }
    serverSubtotal = Math.round(serverSubtotal * 100) / 100;
    orderData.subtotal = serverSubtotal;
    orderData.discount = 0;

    let campaignMainCount = 0;
    let campaignExtraCount = 0;
    for (const item of orderData.items) {
      const pid = parseInt(String(item.productId));
      if (clientCampaignIds && !clientCampaignIds.has(pid)) continue;
      const type = campaignMap.get(pid);
      if (type === "main") campaignMainCount += item.quantity;
      if (type === "extra") campaignExtraCount += item.quantity;
    }
    const isCampaignOrder = clientCampaignIds !== null && (campaignMainCount > 0 || campaignExtraCount > 0);

    let couponDiscount = 0;
    let appliedCoupon: any = null;
    if (couponCode && !isCampaignOrder) {
      const coupon = await storage.getCouponByCode(couponCode, publicStoreId(req));
      if (coupon && coupon.isActive) {
        const now = new Date();
        const notExpired = !coupon.expiresAt || new Date(coupon.expiresAt) > now;
        const notMaxed = !coupon.maxUses || coupon.usedCount < coupon.maxUses;
        const minMet = orderData.subtotal >= coupon.minOrderAmount;
        const ownerOk = !coupon.customerId || coupon.customerId === customerId;
        if (notExpired && notMaxed && minMet && ownerOk) {
          appliedCoupon = coupon;
          if (coupon.discountType === "percentage") {
            couponDiscount = Math.round(orderData.subtotal * (coupon.discountValue / 100) * 100) / 100;
          } else {
            couponDiscount = coupon.discountValue;
          }
        }
      }
    }

    let STANDARD_MIN_ORDER = 0;
    let STANDARD_FREE_SHIP_LIMIT = 1000;
    let STANDARD_SHIP_FEE = 89;
    let matchedNeighborhood: string | null = null;
    try {
      const nbRes = await sharedPool.query(
        "SELECT name, min_order, shipping_fee, free_shipping_limit, store FROM delivery_neighborhoods WHERE is_active = true AND (store = 'all' OR store = $1)",
        [orderStore]
      );
      let bestMatch: { name: string; min_order: number; shipping_fee: number; free_shipping_limit: number } | null = null;
      // Mahalle açıkça seçildiyse (checkout dropdown) o satırı birebir kullan;
      // store'a özel satır "all" satırına tercih edilir. Aksi halde adres metninden eşleştir.
      const explicitNb = String((req.body as any)?.neighborhood || "").trim().toLocaleLowerCase("tr");
      if (explicitNb) {
        const exactRows = nbRes.rows.filter((row: any) => String(row.name || "").trim().toLocaleLowerCase("tr") === explicitNb);
        const row = exactRows.find((r: any) => r.store === orderStore) || exactRows[0];
        if (row) {
          bestMatch = {
            name: String(row.name || "").trim(),
            min_order: Number(row.min_order),
            shipping_fee: Number(row.shipping_fee),
            free_shipping_limit: Number(row.free_shipping_limit),
          };
        }
      }
      if (!bestMatch) {
        const addrLower = String(orderData.customerAddress || "").toLocaleLowerCase("tr");
        for (const row of nbRes.rows) {
          const nbName = String(row.name || "").trim();
          if (!nbName) continue;
          const nbLower = nbName.toLocaleLowerCase("tr");
          const compactAddr = addrLower.replace(/\s+/g, " ");
          const compactNb = nbLower.replace(/\s+/g, " ");
          const noSpaceAddr = addrLower.replace(/\s+/g, "");
          const noSpaceNb = nbLower.replace(/\s+/g, "");
          if (compactAddr.includes(compactNb) || noSpaceAddr.includes(noSpaceNb)) {
            if (!bestMatch || nbName.length > bestMatch.name.length) {
              bestMatch = {
                name: nbName,
                min_order: Number(row.min_order),
                shipping_fee: Number(row.shipping_fee),
                free_shipping_limit: Number(row.free_shipping_limit),
              };
            }
          }
        }
      }
      if (bestMatch) {
        STANDARD_FREE_SHIP_LIMIT = bestMatch.free_shipping_limit;
        STANDARD_SHIP_FEE = bestMatch.shipping_fee;
        matchedNeighborhood = bestMatch.name;
      }
    } catch (e) {
      console.error("Neighborhood lookup error:", e);
    }
    if (!isCampaignOrder) {
      if (reqStore(req).commerce.fulfillment === "cargo") {
        const cargoSettings = await resolveSettings(["cargo_fee", "cargo_free_limit", "cargo_min_order"], orderStore);
        const cFee = Math.max(0, Number(cargoSettings.cargo_fee ?? 0) || 0);
        const cFree = Math.max(0, Number(cargoSettings.cargo_free_limit ?? 0) || 0);
        const cMin = Math.max(0, Number(cargoSettings.cargo_min_order ?? 0) || 0);
        if (cMin > 0 && orderData.subtotal < cMin) {
          return res.status(400).json({ message: `Minimum sipariş tutarı ${cMin} TL.` });
        }
        orderData.shipping = (cFree > 0 && orderData.subtotal >= cFree) ? 0 : cFee;
      } else {
        orderData.shipping = orderData.subtotal >= STANDARD_FREE_SHIP_LIMIT ? 0 : STANDARD_SHIP_FEE;
      }
      orderData.grandTotal = orderData.subtotal - orderData.discount + orderData.shipping;
    }

    const KEDI_KUMU_MAX = 2;
    const kediKumuProductIds = new Set<number>();
    const allProds = await storage.getAllProducts();
    for (const p of allProds) {
      if (p.brandCategoryId === 24) kediKumuProductIds.add(p.id);
    }

    for (const item of orderData.items) {
      const pid = parseInt(String(item.productId));
      if (kediKumuProductIds.has(pid) && item.quantity > KEDI_KUMU_MAX) {
        return res.status(400).json({ message: `Kedi kumundan en fazla ${KEDI_KUMU_MAX} adet alabilirsiniz.` });
      }
    }

    if (isCampaignOrder) {
      if (campaignMainCount < 1) {
        return res.status(400).json({ message: "Kampanya siparişlerinde en az 1 ana ürün gereklidir." });
      }
      if (campaignMainCount > 1) {
        return res.status(400).json({ message: "Kampanya ana ürünlerinden toplamda sadece 1 adet alabilirsiniz." });
      }
      if (orderData.paymentMethod !== "Kapıda Nakit") {
        return res.status(400).json({ message: "Kampanya siparişlerinde sadece kapıda nakit ödeme geçerlidir." });
      }
      orderData.discount = 0;
      const CAMPAIGN_SHIP_LIMIT = 4000;
      const SHIP_FEE = 89;
      orderData.shipping = orderData.subtotal >= CAMPAIGN_SHIP_LIMIT ? 0 : SHIP_FEE;
      orderData.grandTotal = orderData.subtotal + orderData.shipping;
    }

    if (!isCampaignOrder && couponDiscount > 0) {
      orderData.discount = (orderData.discount || 0) + couponDiscount;
      orderData.grandTotal = Math.max(0, orderData.subtotal - orderData.discount + orderData.shipping);
    }

    // Non-cash payment methods (POS / Havale-EFT / QR / Online card) add a 5% surcharge
    // on the product subtotal only (not shipping). Cash (Kapıda Nakit) is the base price.
    // Campaign orders are cash-only, so they never get a surcharge.
    const pmForSurcharge = String(orderData.paymentMethod || "").toLowerCase();
    const surchargeStoreId = reqStore(req).id;
    const surchargeSettings = await resolveSettings(["card_surcharge_percent", "product_surcharge_overrides"], surchargeStoreId);
    const surchargePctRaw = Number(surchargeSettings.card_surcharge_percent);
    const surchargeRate = (Number.isFinite(surchargePctRaw) && surchargePctRaw >= 0)
      ? Math.min(surchargePctRaw, 100) / 100
      : 0.05;
    // jetgomarket-only: per-product surcharge overrides (JSON map productId->percent).
    // Any other store, or jetgo with no overrides, falls through to the store-wide
    // single-rate branch below untouched (byte-identical to the previous behavior).
    const surchargeOverrides: Record<number, number> = {};
    if (surchargeStoreId === "jetgo" && surchargeSettings.product_surcharge_overrides) {
      try {
        const obj = JSON.parse(surchargeSettings.product_surcharge_overrides);
        if (obj && typeof obj === "object") {
          for (const [k, v] of Object.entries(obj)) {
            const id = Number(k);
            const pct = Number(v);
            if (Number.isFinite(id) && Number.isFinite(pct) && pct >= 0 && pct <= 100) surchargeOverrides[id] = pct / 100;
          }
        }
      } catch { /* malformed map -> ignore, keep single-rate */ }
    }
    let paymentSurcharge = 0;
    if (!isCampaignOrder && !/nakit/.test(pmForSurcharge)) {
      if (Object.keys(surchargeOverrides).length > 0) {
        // Per-line: sum(item.price * qty * effectiveRate), rounded once.
        let s = 0;
        for (const item of orderData.items) {
          const pid = parseInt(String(item.productId));
          const rate = (Number.isFinite(pid) && surchargeOverrides[pid] !== undefined) ? surchargeOverrides[pid] : surchargeRate;
          s += (Number(item.price) || 0) * (Number(item.quantity) || 0) * rate;
        }
        paymentSurcharge = Math.round(s * 100) / 100;
      } else {
        paymentSurcharge = Math.round(orderData.subtotal * surchargeRate * 100) / 100;
      }
    }
    if (paymentSurcharge > 0) {
      orderData.grandTotal = Math.round((orderData.grandTotal + paymentSurcharge) * 100) / 100;
    }

    let hasPreorderItems = false;
    const saleMovements: Array<{ productId: number; name: string; barcode: string | null; qty: number; newStock: number }> = [];
    for (const item of orderData.items) {
      const productId = parseInt(String(item.productId));
      if (!isNaN(productId)) {
        const prod = allProds.find(p => p.id === productId);
        if (prod && prod.skt) {
          const sktDate = parseSkt(prod.skt);
          if (sktDate && sktDate < new Date()) {
            return res.status(400).json({ message: `${item.name} ürününün son kullanma tarihi geçmiş. Sipariş verilemez.` });
          }
        }
        if (prod && prod.preorderEnabled && reqStore(req).commerce.preorderEnabled) {
          // Atomically deduct only the available stock (partial), allow backorder for the rest.
          const upd = await sharedPool.query(
            "WITH old AS (SELECT stock AS s FROM products WHERE id = $1 FOR UPDATE) UPDATE products p SET stock = GREATEST(0, p.stock - $2) FROM old WHERE p.id = $1 RETURNING p.stock AS new_stock, old.s AS old_stock, p.name, p.barcode",
            [productId, item.quantity]
          );
          if (upd.rows.length > 0) {
            const row = upd.rows[0];
            const deducted = (row.old_stock ?? 0) - (row.new_stock ?? 0);
            (item as any).deductedQty = deducted;
            if (deducted > 0) {
              saleMovements.push({ productId, name: row.name, barcode: row.barcode ?? null, qty: deducted, newStock: row.new_stock });
            }
            if ((row.old_stock ?? 0) < item.quantity) {
              hasPreorderItems = true;
              (item as any).isPreorder = true;
            }
          }
        } else {
          // Atomic conditional decrement; the returned stock is the true post-decrement value.
          const upd = await sharedPool.query(
            "UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING stock, name, barcode",
            [item.quantity, productId]
          );
          if (upd.rows.length === 0) {
            return res.status(400).json({ message: `Stok yetersiz: ${item.name}` });
          }
          const row = upd.rows[0];
          (item as any).deductedQty = item.quantity;
          saleMovements.push({ productId, name: row.name, barcode: row.barcode ?? null, qty: item.quantity, newStock: row.stock });
        }
      }
    }
    if (hasPreorderItems) {
      (orderData as any).hasPreorder = true;
    }

    (orderData as any).isCampaign = isCampaignOrder;
    (orderData as any).sourceSite = reqStore(req).id;

    const isOnlinePayment = /tosla|online/i.test(orderData.paymentMethod || "");
    if (isOnlinePayment) {
      (orderData as any).paymentStatus = "pending";
    }

    const order = await storage.createOrder(orderData);

    if (saleMovements.length > 0) {
      try {
        for (const sm of saleMovements) {
          if (sm.qty <= 0) continue;
          await sharedPool.query(
            "INSERT INTO stock_movements (product_id, product_name, barcode, delta, mode, new_stock, order_id) VALUES ($1,$2,$3,$4,$5,$6,$7)",
            [sm.productId, sm.name, sm.barcode, -sm.qty, "sub", sm.newStock, order.id]
          );
        }
      } catch (e) {
        console.error("Stock movement record error (order sale):", e);
      }
    }

    if (appliedCoupon) {
      await storage.incrementCouponUsage(appliedCoupon.id);
    }

    if (!isOnlinePayment) {
      notifyAdminNewOrder(order.id).catch(() => {});
      // Havale/EFT alıcısı zaten IBAN bilgilendirme SMS'i alıyor; çift SMS olmasın.
      if (!/havale|eft/i.test(orderData.paymentMethod || "")) {
        notifyCustomerNewOrder(order.id).catch(() => {});
      }
    }

    try {
      if (/havale|eft/i.test(orderData.paymentMethod || "") && orderData.customerPhone) {
        const bankRes = await sharedPool.query(
          "SELECT key, value FROM app_settings WHERE key IN ('bank_account_name','bank_iban','bank_name')"
        );
        const bank: Record<string, string> = {};
        for (const r of bankRes.rows) bank[r.key] = r.value || "";
        if (bank.bank_iban) {
          const stCfg = storeById((orderData as any).sourceSite);
          const formUrl = `${stCfg.domain}/hesabim?tab=havale&order=${order.id}`;
          const lines = [
            brandifyFor(stCfg, `JETGO Siparis #${order.id}`),
            `Tutar: ${orderData.grandTotal} TL`,
            `Alici: ${bank.bank_account_name || "SIZPA LTD"}`,
            bank.bank_name ? `Banka: ${bank.bank_name}` : "",
            `IBAN: ${bank.bank_iban}`,
            ``,
            `ONEMLI: Aciklama kismina "${order.id}" yazin.`,
            `Onay icin: ${formUrl}`,
          ].filter(Boolean);
          const stHeader = await resolveSmsHeader(stCfg.id);
          sendSmsViaNetgsm(orderData.customerPhone, lines.join("\n"), stHeader).catch(err => {
            console.error("Customer havale SMS error:", err);
          });
        }
      }
    } catch (e) {
      console.error("Havale SMS error:", e);
    }

    res.status(201).json(order);
  });

  // Tosla API bilgileri tüm domainler için ortak; payment_tosla_enabled domaine
  // özeldir (resolveSettings önekli değer yoksa ortak değere düşer).
  async function getToslaConfig(store: string = "all"): Promise<Record<string, string>> {
    return await resolveSettings(
      ['tosla_client_id', 'tosla_api_user', 'tosla_api_pass', 'tosla_base_url', 'payment_tosla_enabled'],
      store
    );
  }

  function toslaOrigin(cfg: Record<string, string>) {
    let b = (cfg.tosla_base_url || "https://prepentegrasyon.tosla.com").trim();
    b = b.replace(/\/api\/payment\/?$/i, "");
    return b.replace(/\/+$/, "");
  }

  function toslaTimeSpan() {
    const d = new Date(Date.now() + 3 * 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`;
  }

  async function toslaRnd() {
    const crypto = await import("crypto");
    return crypto.randomBytes(12).toString("hex").slice(0, 24);
  }

  async function toslaRequestHash(cfg: Record<string, string>, rnd: string, timeSpan: string) {
    const crypto = await import("crypto");
    const data = `${cfg.tosla_api_pass}${cfg.tosla_client_id}${cfg.tosla_api_user}${rnd}${timeSpan}`;
    return crypto.createHash("sha512").update(data, "utf8").digest("base64");
  }

  async function toslaCallbackHash(cfg: Record<string, string>, params: {
    OrderId: string; MdStatus: string; BankResponseCode: string; BankResponseMessage: string; RequestStatus: string;
  }) {
    const crypto = await import("crypto");
    const data = `${cfg.tosla_api_pass}${cfg.tosla_client_id}${cfg.tosla_api_user}${params.OrderId}${params.MdStatus}${params.BankResponseCode}${params.BankResponseMessage}${params.RequestStatus}`;
    return crypto.createHash("sha512").update(data, "utf8").digest("base64");
  }

  function callbackBaseUrl(req: Request) {
    const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
    const host = (req.headers["x-forwarded-host"] as string) || req.get("host") || "www.jetgomarket.com";
    return `${proto}://${host}`;
  }

  const restoreStockWithMovement = async (pid: number, qty: number, orderId: number) => {
    const r = await sharedPool.query(
      "UPDATE products SET stock = stock + $1 WHERE id = $2 RETURNING stock, name, barcode",
      [qty, pid]
    );
    if (r.rows.length > 0) {
      await sharedPool.query(
        "INSERT INTO stock_movements (product_id, product_name, barcode, delta, mode, new_stock, order_id) VALUES ($1,$2,$3,$4,$5,$6,$7)",
        [pid, r.rows[0].name, r.rows[0].barcode, qty, "add", r.rows[0].stock, orderId]
      );
    }
  };

  const cancelOrderAndRestoreStock = async (orderId: number, reason: string) => {
    try {
      const upd = await sharedPool.query(
        "UPDATE orders SET payment_status = 'failed', status = 'iptal' WHERE id = $1 AND status <> 'iptal' AND payment_status IN ('pending','awaiting') RETURNING items",
        [orderId]
      );
      if (upd.rowCount === 0) return;
      // Bu sipariş için bekleyen ödeme token'larını da 'failed' yap; aksi halde geç
      // gelen geçerli bir Tosla/iyzico callback'i hâlâ 'pending' token'ı işleyip
      // stoğu ikinci kez iade edebilir veya iptal edilmiş siparişi tamamlayabilir.
      await sharedPool.query(
        "UPDATE tosla_payment_tokens SET status = 'failed', updated_at = NOW() WHERE order_id = $1 AND status = 'pending'",
        [orderId]
      );
      await sharedPool.query(
        "UPDATE iyzico_payment_tokens SET status = 'failed', updated_at = NOW() WHERE order_id = $1 AND status = 'pending'",
        [orderId]
      );
      const items = upd.rows[0]?.items || [];
      for (const it of items) {
        const pid = parseInt(String(it.productId));
        const qty = it.deductedQty != null ? (parseInt(String(it.deductedQty)) || 0) : (it.isPreorder ? 0 : (parseInt(String(it.quantity)) || 0));
        if (!isNaN(pid) && qty > 0) {
          await restoreStockWithMovement(pid, qty, orderId);
        }
      }
      console.log(`[order-cancel] order=${orderId} reason=${reason} items_restored=${items.length}`);
    } catch (e) {
      console.error("[order-cancel] error:", e);
    }
  };

  // Ödemesi tamamlanmayan online siparişlerin (pending/awaiting) temizliği.
  // iyzico/Tosla sayfası açılıp ödeme yapılmadan kapatılırsa sipariş "pending"de
  // kalır ve stoğu rezerve tutar. Belirli süre (TTL) sonra bu siparişleri iptal
  // edip stoğu geri veriyoruz.
  const STALE_PENDING_MINUTES = 45;
  let stalePendingRunning = false;
  const runStalePendingCleanup = async () => {
    if (stalePendingRunning) return;
    stalePendingRunning = true;
    try {
      const stale = await sharedPool.query(
        `SELECT id FROM orders
         WHERE payment_status IN ('pending','awaiting')
           AND status <> 'iptal'
           AND created_at < (now() - ($1 || ' minutes')::interval)`,
        [String(STALE_PENDING_MINUTES)]
      );
      for (const row of stale.rows) {
        await cancelOrderAndRestoreStock(row.id, "stale-pending-timeout");
      }
      if (stale.rows.length > 0) {
        console.log(`[stale-pending-cleanup] cancelled=${stale.rows.length}`);
      }
    } catch (e) {
      console.error("[stale-pending-cleanup] error:", e);
    } finally {
      stalePendingRunning = false;
    }
  };
  setInterval(runStalePendingCleanup, 10 * 60 * 1000);
  runStalePendingCleanup();

  app.post("/api/tosla/init-payment", async (req: Request, res: Response) => {
    try {
      const customerId = (req.session as any)?.customerId;
      if (!customerId) return res.status(401).json({ message: "Giriş gerekli" });
      const orderId = parseInt(String(req.body?.orderId));
      if (!orderId || isNaN(orderId)) return res.status(400).json({ message: "Sipariş bulunamadı" });

      const orderRow = await sharedPool.query(
        "SELECT id, customer_name, customer_phone, customer_address, items, grand_total, payment_method, payment_status, source_site FROM orders WHERE id = $1",
        [orderId]
      );
      const o = orderRow.rows[0];
      if (!o) return res.status(404).json({ message: "Sipariş bulunamadı" });

      const custRow = await sharedPool.query("SELECT phone FROM customers WHERE id = $1", [customerId]);
      const sessionPhone = String(custRow.rows[0]?.phone || "").replace(/\D/g, "");
      const orderPhone = String(o.customer_phone || "").replace(/\D/g, "");
      if (!sessionPhone || sessionPhone !== orderPhone) {
        return res.status(403).json({ message: "Yetkisiz" });
      }

      if (o.payment_status === "completed" || o.payment_status === "paid") {
        return res.status(400).json({ message: "Bu sipariş zaten ödenmiş" });
      }

      const cfg = await getToslaConfig(o.source_site || reqStore(req).id);
      if (cfg.payment_tosla_enabled === "0" || cfg.payment_tosla_enabled === "false") {
        await cancelOrderAndRestoreStock(o.id, "tosla-disabled");
        return res.status(400).json({ message: "Online ödeme şu anda kapalı", cancelled: true });
      }
      if (!cfg.tosla_client_id || !cfg.tosla_api_user || !cfg.tosla_api_pass) {
        await cancelOrderAndRestoreStock(o.id, "tosla-not-configured");
        return res.status(500).json({ message: "Online ödeme yapılandırılmamış", cancelled: true });
      }

      const items = Array.isArray(o.items) ? o.items : [];
      if (items.length === 0) return res.status(400).json({ message: "Sipariş kalemi bulunamadı" });

      const grandTotal = Number(o.grand_total);
      if (!grandTotal || grandTotal <= 0) return res.status(400).json({ message: "Geçersiz tutar" });

      const merchantOrderId = `JET${o.id}T${Date.now().toString(36)}`.slice(0, 20);
      const baseUrl = callbackBaseUrl(req);
      const callbackUrl = `${baseUrl}/api/tosla/callback`;

      const rnd = await toslaRnd();
      const timeSpan = toslaTimeSpan();
      const hash = await toslaRequestHash(cfg, rnd, timeSpan);

      const amountKurus = Math.round(grandTotal * 100);

      const requestBody = {
        clientId: cfg.tosla_client_id,
        apiUser: cfg.tosla_api_user,
        rnd,
        timeSpan,
        hash,
        callbackUrl,
        orderId: merchantOrderId,
        amount: amountKurus,
        currency: 949,
        installmentCount: 0,
        languageCode: "tr",
        transactionType: 1,
        transactionDateTime: timeSpan,
        description: `JETGO Sipariş #${o.id}`,
      };

      const origin = toslaOrigin(cfg);
      const apiUrl = `${origin}/api/Payment/threeDPayment`;

      let result: any = null;
      try {
        const fetchRes = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(requestBody),
        });
        const text = await fetchRes.text();
        try { result = JSON.parse(text); } catch { result = { raw: text }; }
      } catch (netErr: any) {
        console.error("[tosla-init] network error:", netErr?.message || netErr);
        await cancelOrderAndRestoreStock(o.id, "tosla-network-error");
        return res.status(502).json({ message: "Tosla bağlantı hatası", cancelled: true });
      }

      const code = result?.Code ?? result?.code;
      const sessionId = result?.ThreeDSessionId || result?.threeDSessionId;
      const transactionId = result?.TransactionId || result?.transactionId || null;

      if (String(code) !== "0" || !sessionId) {
        console.error("[tosla-init-error]", result);
        await cancelOrderAndRestoreStock(o.id, "tosla-init-failed");
        const msg = result?.Message || result?.message || "Online ödeme başlatılamadı";
        return res.status(400).json({ message: msg, cancelled: true });
      }

      await sharedPool.query(
        `INSERT INTO tosla_payment_tokens (token, order_id, tosla_order_id, transaction_id, amount, status, raw_response, updated_at)
         VALUES ($1, $2, $3, $4, $5, 'pending', $6::jsonb, NOW())
         ON CONFLICT (token) DO UPDATE SET order_id = $2, tosla_order_id = $3, transaction_id = $4, amount = $5, status = 'pending', raw_response = $6::jsonb, updated_at = NOW()`,
        [merchantOrderId, o.id, String(sessionId), transactionId ? String(transactionId) : null, grandTotal.toFixed(2), JSON.stringify(result || {})]
      );

      await sharedPool.query(
        "UPDATE orders SET payment_status = 'awaiting' WHERE id = $1",
        [o.id]
      );

      const paymentPageUrl = `${origin}/api/Payment/threeDSecure/${sessionId}`;
      res.json({
        success: true,
        token: merchantOrderId,
        paymentPageUrl,
        threeDSessionId: sessionId,
      });
    } catch (err: any) {
      console.error("[tosla-init] error:", err?.message || err);
      res.status(500).json({ message: "Online ödeme başlatılamadı" });
    }
  });

  app.all("/api/tosla/callback", async (req: Request, res: Response) => {
    const baseUrl = callbackBaseUrl(req);
    const buildResultUrl = (orderId: number | undefined, status: "success" | "failed", token: string, msg?: string) => {
      const params = new URLSearchParams();
      if (orderId) params.set("order", String(orderId));
      params.set("status", status);
      params.set("t", token);
      if (msg) params.set("msg", msg);
      return `${baseUrl}/odeme-sonuc?${params.toString()}`;
    };
    const failRedirect = (orderId: number | undefined, token: string, msg?: string) =>
      res.redirect(303, buildResultUrl(orderId, "failed", token, msg));

    try {
      const data: any = (req.body && Object.keys(req.body).length > 0) ? req.body : req.query;
      const merchantOrderId = String(data?.OrderId || data?.orderId || "").trim();
      const transactionId = String(data?.TransactionId || data?.transactionId || "").trim();
      const code = String(data?.Code ?? data?.code ?? "").trim();
      const responseCode = String(data?.ResponseCode ?? data?.responseCode ?? "").trim();
      const bankResponseCode = String(data?.BankResponseCode ?? data?.bankResponseCode ?? "").trim();
      const bankResponseMessage = String(data?.BankResponseMessage ?? data?.bankResponseMessage ?? "").trim();
      const requestStatus = String(data?.RequestStatus ?? data?.requestStatus ?? "").trim();
      const mdStatus = String(data?.MdStatus ?? data?.mdStatus ?? "").trim();
      const callbackHash = String(data?.Hash ?? data?.hash ?? "").trim();

      console.log("[tosla-callback]", new Date().toISOString(), {
        merchantOrderId, code, responseCode, bankResponseCode, requestStatus, mdStatus, transactionId,
      });

      if (!merchantOrderId) {
        return res.redirect(303, `${baseUrl}/odeme-sonuc?status=failed&msg=order-missing`);
      }

      const tokRow = await sharedPool.query(
        "SELECT order_id, status FROM tosla_payment_tokens WHERE token = $1",
        [merchantOrderId]
      );
      const tok = tokRow.rows[0];
      if (!tok) {
        return res.redirect(303, `${baseUrl}/odeme-sonuc?status=failed&msg=token-not-found&t=${encodeURIComponent(merchantOrderId)}`);
      }

      if (tok.status === "completed") {
        return res.redirect(303, buildResultUrl(tok.order_id, "success", merchantOrderId));
      }
      if (tok.status === "failed") {
        return failRedirect(tok.order_id, merchantOrderId, "payment-failed");
      }

      const cfg = await getToslaConfig();
      if (!cfg.tosla_client_id || !cfg.tosla_api_user || !cfg.tosla_api_pass) {
        return failRedirect(tok.order_id, merchantOrderId, "config-missing");
      }

      // GÜVENLİK: Bu uç nokta herkese açık ve başarı kararı tamamen istemcinin
      // gönderdiği alanlardan (Code/BankResponseCode/MdStatus/RequestStatus)
      // çıkıyor. Alıcı kendi merchantOrderId token'ını bildiği için, Hash
      // doğrulanmazsa ödeme yapmadan siparişini "completed" yapabilir. Tosla
      // Hash'i yalnızca merchant gizli anahtarlarıyla üretilebildiği için, geçerli
      // bir Hash olmadan siparişi ASLA tamamlamıyoruz. Hash yok/yanlışsa siparişi
      // ne tamamlıyoruz ne de iptal ediyoruz (pending kalsın; webhook veya
      // stale-cleanup çözer).
      let hashValid = false;
      try {
        const expected = await toslaCallbackHash(cfg, {
          OrderId: merchantOrderId,
          MdStatus: mdStatus,
          BankResponseCode: bankResponseCode,
          BankResponseMessage: bankResponseMessage,
          RequestStatus: requestStatus,
        });
        hashValid = !!callbackHash && expected === callbackHash;
      } catch (e) {
        console.warn("[tosla-callback] hash check error:", e);
      }
      if (!hashValid) {
        console.error("[tosla-callback] REJECTED unverified callback", { merchantOrderId, hasHash: !!callbackHash });
        return failRedirect(tok.order_id, merchantOrderId, "verification-failed");
      }

      const codeOk = code === "" || code === "0" || code === "00";
      const success = codeOk
        && bankResponseCode === "00"
        && (mdStatus === "" || mdStatus === "1")
        && (requestStatus === "" || requestStatus === "1");

      const claim = await sharedPool.query(
        "UPDATE tosla_payment_tokens SET status = $1, transaction_id = COALESCE($2, transaction_id), raw_response = $3::jsonb, updated_at = NOW() WHERE token = $4 AND status = 'pending' RETURNING token",
        [success ? "completed" : "failed", transactionId || null, JSON.stringify(data || {}), merchantOrderId]
      );
      if (claim.rowCount === 0) {
        return res.redirect(303, buildResultUrl(tok.order_id, success ? "success" : "failed", merchantOrderId));
      }

      if (success) {
        await sharedPool.query(
          "UPDATE orders SET payment_status = 'completed' WHERE id = $1 AND status <> 'iptal'",
          [tok.order_id]
        );
        notifyAdminNewOrder(tok.order_id, true).catch(() => {});
        notifyCustomerNewOrder(tok.order_id, true).catch(() => {});
        return res.redirect(303, buildResultUrl(tok.order_id, "success", merchantOrderId));
      }

      await sharedPool.query(
        "UPDATE orders SET payment_status = 'failed', status = 'iptal' WHERE id = $1 AND status <> 'iptal'",
        [tok.order_id]
      );
      try {
        const itemsRow = await sharedPool.query("SELECT items FROM orders WHERE id = $1", [tok.order_id]);
        const items = itemsRow.rows[0]?.items || [];
        for (const it of items) {
          const pid = parseInt(String(it.productId));
          const qty = it.deductedQty != null ? (parseInt(String(it.deductedQty)) || 0) : (it.isPreorder ? 0 : (parseInt(String(it.quantity)) || 0));
          if (!isNaN(pid) && qty > 0) {
            await restoreStockWithMovement(pid, qty, tok.order_id);
          }
        }
      } catch (e) {
        console.error("Stock restore error after failed tosla:", e);
      }
      return failRedirect(tok.order_id, merchantOrderId, bankResponseMessage || "payment-failed");
    } catch (err: any) {
      console.error("[tosla-callback] error:", err?.message || err);
      return res.redirect(303, `${baseUrl}/odeme-sonuc?status=failed&msg=callback-error`);
    }
  });

  app.get("/api/orders/:id/payment-status", async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) return res.status(400).json({ error: "invalid id" });

      const customerId = (req.session as any)?.customerId;
      const token = (req.query?.t as string) || "";

      let allowed = false;
      if (token) {
        const tokRow = await sharedPool.query(
          "SELECT order_id FROM tosla_payment_tokens WHERE token = $1",
          [token]
        );
        if (tokRow.rows[0]?.order_id === id) allowed = true;
        if (!allowed) {
          const iyzRow = await sharedPool.query(
            "SELECT order_id FROM iyzico_payment_tokens WHERE token = $1",
            [token]
          );
          if (iyzRow.rows[0]?.order_id === id) allowed = true;
        }
      }
      if (!allowed && customerId) {
        const custRow = await sharedPool.query("SELECT phone FROM customers WHERE id = $1", [customerId]);
        const sessionPhone = String(custRow.rows[0]?.phone || "").replace(/\D/g, "");
        if (sessionPhone) {
          const ownRow = await sharedPool.query(
            "SELECT customer_phone FROM orders WHERE id = $1",
            [id]
          );
          const orderPhone = String(ownRow.rows[0]?.customer_phone || "").replace(/\D/g, "");
          if (orderPhone && orderPhone === sessionPhone) allowed = true;
        }
      }
      if (!allowed) return res.status(403).json({ error: "forbidden" });

      const r = await sharedPool.query(
        "SELECT id, grand_total, payment_status, status, payment_method FROM orders WHERE id = $1",
        [id]
      );
      const row = r.rows[0];
      if (!row) return res.status(404).json({ error: "not found" });
      res.set("Cache-Control", "no-store");
      res.json({
        id: row.id,
        grandTotal: Number(row.grand_total) || 0,
        paymentStatus: row.payment_status,
        status: row.status,
        paymentMethod: row.payment_method,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "error" });
    }
  });

  app.all("/api/tosla/webhook", async (req: Request, res: Response) => {
    const sendOk = () => res.status(200).json({ status: "success" });
    try {
      const payload: any = req.method === "GET" ? req.query : (req.body || {});
      console.log("[tosla-webhook]", new Date().toISOString(), JSON.stringify(payload).slice(0, 500));

      const merchantOrderId = String(payload.OrderId || payload.orderId || "").trim();
      if (!merchantOrderId) {
        console.warn("[tosla-webhook] missing OrderId");
        return sendOk();
      }

      const tokRow = await sharedPool.query(
        "SELECT token, order_id, status FROM tosla_payment_tokens WHERE token = $1",
        [merchantOrderId]
      );
      const tokenRow = tokRow.rows[0];
      if (!tokenRow) {
        console.warn("[tosla-webhook] no matching token", { merchantOrderId });
        return sendOk();
      }

      if (tokenRow.status === "completed" || tokenRow.status === "failed") {
        return sendOk();
      }

      const cfg = await getToslaConfig();
      if (!cfg.tosla_client_id || !cfg.tosla_api_user || !cfg.tosla_api_pass) {
        console.warn("[tosla-webhook] config missing");
        return sendOk();
      }

      const code = String(payload.Code ?? payload.code ?? "").trim();
      const bankResponseCode = String(payload.BankResponseCode ?? "").trim();
      const bankResponseMessage = String(payload.BankResponseMessage ?? "").trim();
      const requestStatus = String(payload.RequestStatus ?? "").trim();
      const mdStatus = String(payload.MdStatus ?? "").trim();
      const transactionId = String(payload.TransactionId ?? "").trim();
      const callbackHash = String(payload.Hash ?? payload.hash ?? "").trim();

      // GÜVENLİK: callback ile aynı gerekçe — geçerli bir Tosla Hash'i olmadan
      // (yalnızca merchant gizli anahtarlarıyla üretilebilir) siparişi tamamlamayız.
      let hashValid = false;
      try {
        const expected = await toslaCallbackHash(cfg, {
          OrderId: merchantOrderId,
          MdStatus: mdStatus,
          BankResponseCode: bankResponseCode,
          BankResponseMessage: bankResponseMessage,
          RequestStatus: requestStatus,
        });
        hashValid = !!callbackHash && expected === callbackHash;
      } catch (e) {
        console.warn("[tosla-webhook] hash check error:", e);
      }
      if (!hashValid) {
        console.error("[tosla-webhook] REJECTED unverified webhook", { merchantOrderId, hasHash: !!callbackHash });
        return sendOk();
      }

      const codeOk = code === "" || code === "0" || code === "00";
      const success = codeOk
        && bankResponseCode === "00"
        && (mdStatus === "" || mdStatus === "1")
        && (requestStatus === "" || requestStatus === "1");

      const claim = await sharedPool.query(
        "UPDATE tosla_payment_tokens SET status = $1, transaction_id = COALESCE($2, transaction_id), raw_response = $3::jsonb, updated_at = NOW() WHERE token = $4 AND status = 'pending' RETURNING token",
        [success ? "completed" : "failed", transactionId || null, JSON.stringify(payload || {}), merchantOrderId]
      );
      if (claim.rowCount === 0) {
        return sendOk();
      }

      if (success) {
        await sharedPool.query(
          "UPDATE orders SET payment_status = 'completed' WHERE id = $1 AND status <> 'iptal'",
          [tokenRow.order_id]
        );
        notifyAdminNewOrder(tokenRow.order_id, true).catch(() => {});
        notifyCustomerNewOrder(tokenRow.order_id, true).catch(() => {});
        return sendOk();
      }

      await sharedPool.query(
        "UPDATE orders SET payment_status = 'failed', status = 'iptal' WHERE id = $1 AND status <> 'iptal'",
        [tokenRow.order_id]
      );
      try {
        const itemsRow = await sharedPool.query("SELECT items FROM orders WHERE id = $1", [tokenRow.order_id]);
        const items = itemsRow.rows[0]?.items || [];
        for (const it of items) {
          const pid = parseInt(String(it.productId));
          const qty = it.deductedQty != null ? (parseInt(String(it.deductedQty)) || 0) : (it.isPreorder ? 0 : (parseInt(String(it.quantity)) || 0));
          if (!isNaN(pid) && qty > 0) {
            await restoreStockWithMovement(pid, qty, tokenRow.order_id);
          }
        }
      } catch (e) {
        console.error("[tosla-webhook] stock restore error:", e);
      }
      return sendOk();
    } catch (err: any) {
      console.error("[tosla-webhook] error:", err?.message || err);
      return sendOk();
    }
  });

  // ============ IYZICO PAYMENT ============
  // İyzico API bilgileri tüm domainler için ortak; payment_iyzico_enabled domaine
  // özeldir (resolveSettings önekli değer yoksa ortak değere düşer).
  async function getIyzicoConfig(store: string = "all"): Promise<Record<string, string>> {
    return await resolveSettings(
      ['iyzico_api_key', 'iyzico_secret_key', 'iyzico_base_url', 'payment_iyzico_enabled'],
      store
    );
  }

  function buildIyzicoClient(cfg: Record<string, string>) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Iyzipay = require("iyzipay");
    return new Iyzipay({
      apiKey: cfg.iyzico_api_key,
      secretKey: cfg.iyzico_secret_key,
      uri: (cfg.iyzico_base_url || "https://sandbox-api.iyzipay.com").trim(),
    });
  }

  function splitName(full: string): { name: string; surname: string } {
    const clean = String(full || "").trim().replace(/\s+/g, " ");
    if (!clean) return { name: "Müşteri", surname: "-" };
    const parts = clean.split(" ");
    if (parts.length === 1) return { name: parts[0], surname: "-" };
    return { name: parts[0], surname: parts.slice(1).join(" ") };
  }

  function normalizeGsm(phone: string): string {
    const digits = String(phone || "").replace(/\D/g, "");
    if (!digits) return "+905555555555";
    if (digits.startsWith("90")) return "+" + digits;
    if (digits.startsWith("0")) return "+9" + digits;
    if (digits.length === 10) return "+90" + digits;
    return "+" + digits;
  }

  app.post("/api/iyzico/init-payment", async (req: Request, res: Response) => {
    try {
      const customerId = (req.session as any)?.customerId;
      if (!customerId) return res.status(401).json({ message: "Giriş gerekli" });

      const orderId = parseInt(String(req.body?.orderId || ""));
      if (!orderId || isNaN(orderId)) {
        return res.status(400).json({ message: "Geçersiz sipariş" });
      }
      const ordRow = await sharedPool.query(
        "SELECT id, customer_name, customer_phone, customer_address, items, grand_total, payment_method, payment_status, source_site FROM orders WHERE id = $1",
        [orderId]
      );
      const o = ordRow.rows[0];
      if (!o) return res.status(404).json({ message: "Sipariş bulunamadı" });

      const custRow = await sharedPool.query("SELECT phone FROM customers WHERE id = $1", [customerId]);
      const sessionPhone = String(custRow.rows[0]?.phone || "").replace(/\D/g, "");
      const orderPhone = String(o.customer_phone || "").replace(/\D/g, "");
      if (!sessionPhone || sessionPhone !== orderPhone) {
        return res.status(403).json({ message: "Yetkisiz" });
      }

      if (o.payment_status === "completed" || o.payment_status === "paid") {
        return res.status(400).json({ message: "Bu sipariş zaten ödenmiş" });
      }
      const pm = String(o.payment_method || "").toLowerCase();
      const isOnline = pm.includes("online") || pm === "iyzico" || pm === "tosla";
      if (!isOnline) {
        return res.status(400).json({ message: "Bu sipariş online ödeme için uygun değil" });
      }

      const cfg = await getIyzicoConfig(o.source_site || reqStore(req).id);
      if (cfg.payment_iyzico_enabled === "0" || cfg.payment_iyzico_enabled === "false") {
        return res.status(503).json({ message: "İyzico ödeme şu anda kapalı." });
      }
      if (!cfg.iyzico_api_key || !cfg.iyzico_secret_key) {
        return res.status(503).json({ message: "İyzico yapılandırması eksik." });
      }

      const baseUrl =
        process.env.PUBLIC_BASE_URL ||
        (req.headers["x-forwarded-host"]
          ? `https://${req.headers["x-forwarded-host"]}`
          : `${req.protocol}://${req.get("host")}`);
      const callbackUrl = `${baseUrl}/api/iyzico/callback`;

      const conversationId = `JG${o.id}T${Date.now().toString(36)}`.slice(0, 50);
      const grandTotal = Number(o.grand_total) || 0;
      const priceStr = grandTotal.toFixed(2);

      const { name: bName, surname: bSurname } = splitName(o.customer_name || "");
      const gsm = normalizeGsm(o.customer_phone || "");
      const address = String(o.customer_address || "Samsun").slice(0, 500) || "Samsun";

      const buyer = {
        id: `cust-${customerId || o.id}`,
        name: bName.slice(0, 40) || "Müşteri",
        surname: bSurname.slice(0, 40) || "-",
        gsmNumber: gsm,
        email: `customer+${o.id}@jetgomarket.com`,
        identityNumber: "11111111111",
        registrationAddress: address,
        ip: (req.ip || req.headers["x-forwarded-for"]?.toString() || "127.0.0.1").split(",")[0].trim(),
        city: "Samsun",
        country: "Turkey",
        zipCode: "55200",
      };

      const addressBlock = {
        contactName: `${bName} ${bSurname}`.trim().slice(0, 100) || "Müşteri",
        city: "Samsun",
        country: "Turkey",
        address: address,
        zipCode: "55200",
      };

      const basketItems = [
        {
          id: `order-${o.id}`,
          name: `JetGo Sipariş #${o.id}`.slice(0, 100),
          category1: "Pet Shop",
          itemType: "PHYSICAL",
          price: priceStr,
        },
      ];

      const request = {
        locale: "tr",
        conversationId,
        price: priceStr,
        paidPrice: priceStr,
        currency: "TRY",
        basketId: `order-${o.id}`,
        paymentGroup: "PRODUCT",
        callbackUrl,
        enabledInstallments: [1, 2, 3, 6, 9],
        buyer,
        shippingAddress: addressBlock,
        billingAddress: addressBlock,
        basketItems,
      };

      const client = buildIyzicoClient(cfg);

      const result: any = await new Promise((resolve, reject) => {
        try {
          client.checkoutFormInitialize.create(request, (err: any, r: any) => {
            if (err) return reject(err);
            resolve(r);
          });
        } catch (e) {
          reject(e);
        }
      }).catch((err: any) => ({ status: "failure", errorMessage: err?.message || String(err) }));

      if (result.status !== "success" || !result.token || !result.paymentPageUrl) {
        console.error("[iyzico-init-failed]", JSON.stringify(result).slice(0, 500));
        await cancelOrderAndRestoreStock(o.id, "iyzico-init-failed");
        return res.status(400).json({
          message: result.errorMessage || result.errorCode || "İyzico ödeme başlatılamadı.",
          cancelled: true,
        });
      }

      await sharedPool.query(
        `INSERT INTO iyzico_payment_tokens (token, order_id, conversation_id, payment_id, amount, status, raw_response, updated_at)
         VALUES ($1, $2, $3, NULL, $4, 'pending', $5::jsonb, NOW())
         ON CONFLICT (token) DO UPDATE SET order_id = $2, conversation_id = $3, amount = $4, status = 'pending', raw_response = $5::jsonb, updated_at = NOW()`,
        [result.token, o.id, conversationId, grandTotal, JSON.stringify(result)]
      );

      await sharedPool.query(
        "UPDATE orders SET payment_status = 'awaiting' WHERE id = $1",
        [o.id]
      );

      return res.json({
        paymentPageUrl: result.paymentPageUrl,
        token: result.token,
        conversationId,
      });
    } catch (err: any) {
      console.error("[iyzico-init] error:", err?.message || err);
      return res.status(500).json({ message: "İyzico başlatma hatası" });
    }
  });

  app.all("/api/iyzico/callback", async (req: Request, res: Response) => {
    const baseUrl =
      process.env.PUBLIC_BASE_URL ||
      (req.headers["x-forwarded-host"]
        ? `https://${req.headers["x-forwarded-host"]}`
        : `${req.protocol}://${req.get("host")}`);
    const buildResultUrl = (params: Record<string, string>) => {
      const qp = new URLSearchParams(params);
      return `${baseUrl}/odeme-sonuc?${qp.toString()}`;
    };

    try {
      const payload: any = req.method === "GET" ? req.query : (req.body || {});
      const token = String(payload.token || payload.Token || "").trim();
      console.log("[iyzico-callback]", new Date().toISOString(), { token: token.slice(0, 20), keys: Object.keys(payload) });

      if (!token) {
        return res.redirect(303, buildResultUrl({ status: "failed", msg: "no-token" }));
      }

      const tokRow = await sharedPool.query(
        "SELECT order_id, status, conversation_id FROM iyzico_payment_tokens WHERE token = $1",
        [token]
      );
      const tokenRow = tokRow.rows[0];
      if (!tokenRow) {
        return res.redirect(303, buildResultUrl({ status: "failed", msg: "token-not-found" }));
      }

      // Idempotent: already processed
      if (tokenRow.status === "completed") {
        return res.redirect(303, buildResultUrl({ status: "success", order: String(tokenRow.order_id), t: token }));
      }
      if (tokenRow.status === "failed") {
        return res.redirect(303, buildResultUrl({ status: "failed", order: String(tokenRow.order_id), t: token, msg: "already-failed" }));
      }

      const cfg = await getIyzicoConfig();
      if (!cfg.iyzico_api_key || !cfg.iyzico_secret_key) {
        return res.redirect(303, buildResultUrl({ status: "failed", order: String(tokenRow.order_id), t: token, msg: "config-missing" }));
      }

      const client = buildIyzicoClient(cfg);
      const retrieveResult: any = await new Promise((resolve) => {
        try {
          client.checkoutForm.retrieve(
            { locale: "tr", conversationId: tokenRow.conversation_id || "", token },
            (err: any, r: any) => resolve(err ? { status: "failure", errorMessage: err?.message || String(err) } : r)
          );
        } catch (e: any) {
          resolve({ status: "failure", errorMessage: e?.message || String(e) });
        }
      });

      const success = retrieveResult?.status === "success" && retrieveResult?.paymentStatus === "SUCCESS";
      const paymentId = String(retrieveResult?.paymentId || "").slice(0, 64) || null;
      const errorMessage = retrieveResult?.errorMessage || retrieveResult?.errorCode || retrieveResult?.mdStatus || "";

      const claim = await sharedPool.query(
        "UPDATE iyzico_payment_tokens SET status = $1, payment_id = COALESCE($2, payment_id), raw_response = $3::jsonb, updated_at = NOW() WHERE token = $4 AND status = 'pending' RETURNING token",
        [success ? "completed" : "failed", paymentId, JSON.stringify(retrieveResult || {}), token]
      );
      if (claim.rowCount === 0) {
        // someone else processed
        return res.redirect(303, buildResultUrl({ status: success ? "success" : "failed", order: String(tokenRow.order_id), t: token }));
      }

      if (success) {
        await sharedPool.query(
          "UPDATE orders SET payment_status = 'completed' WHERE id = $1 AND status <> 'iptal'",
          [tokenRow.order_id]
        );
        notifyAdminNewOrder(tokenRow.order_id, true).catch(() => {});
        notifyCustomerNewOrder(tokenRow.order_id, true).catch(() => {});
        return res.redirect(303, buildResultUrl({ status: "success", order: String(tokenRow.order_id), t: token }));
      }

      // failure — atomically transition order; only restore stock if this call performed the cancel
      const cancelRes = await sharedPool.query(
        "UPDATE orders SET payment_status = 'failed', status = 'iptal' WHERE id = $1 AND status <> 'iptal' RETURNING id",
        [tokenRow.order_id]
      );
      if ((cancelRes.rowCount ?? 0) > 0) {
        try {
          const itemsRow = await sharedPool.query("SELECT items FROM orders WHERE id = $1", [tokenRow.order_id]);
          const items = itemsRow.rows[0]?.items || [];
          for (const it of items) {
            const pid = parseInt(String(it.productId));
            const qty = it.deductedQty != null ? (parseInt(String(it.deductedQty)) || 0) : (it.isPreorder ? 0 : (parseInt(String(it.quantity)) || 0));
            if (!isNaN(pid) && qty > 0) {
              await restoreStockWithMovement(pid, qty, tokenRow.order_id);
            }
          }
        } catch (e) {
          console.error("Stock restore error after failed iyzico:", e);
        }
      }
      return res.redirect(303, buildResultUrl({
        status: "failed",
        order: String(tokenRow.order_id),
        t: token,
        msg: String(errorMessage).slice(0, 100) || "payment-failed",
      }));
    } catch (err: any) {
      console.error("[iyzico-callback] error:", err?.message || err);
      return res.redirect(303, buildResultUrl({ status: "failed", msg: "callback-error" }));
    }
  });

  app.get("/api/bank-info", async (req, res) => {
    try {
      // Banka IBAN bilgileri ortak; payment_eft_enabled domaine özeldir.
      const out = await resolveSettings(
        ['bank_account_name', 'bank_iban', 'bank_name', 'payment_eft_enabled'],
        publicStoreId(req)
      );
      res.json(out);
    } catch {
      res.json({});
    }
  });

  app.post("/api/bank-transfer-notifications", async (req, res) => {
    try {
      const customerId = (req.session as any)?.customerId;
      if (!customerId) return res.status(401).json({ message: "Giriş gerekli" });

      const custRow = await sharedPool.query("SELECT name, phone FROM customers WHERE id = $1", [customerId]);
      const cust = custRow.rows[0];
      if (!cust) return res.status(401).json({ message: "Müşteri bulunamadı" });

      const { orderId, senderName, senderBank, amount, transferDate, note } = req.body || {};
      if (!senderName || amount == null || !transferDate) {
        return res.status(400).json({ message: "Eksik alanlar var" });
      }

      const amtStr = String(amount).replace(",", ".").trim();
      const amt = Number(amtStr);
      if (!isFinite(amt) || amt <= 0 || amt > 1000000) return res.status(400).json({ message: "Tutar geçersiz" });

      const dateStr = String(transferDate).trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return res.status(400).json({ message: "Tarih formatı geçersiz (YYYY-AA-GG)" });
      const dateMs = Date.parse(dateStr + "T00:00:00Z");
      if (!isFinite(dateMs) || dateMs > Date.now() + 86400000 || dateMs < Date.now() - 90 * 86400000) {
        return res.status(400).json({ message: "Tarih makul aralıkta değil" });
      }

      let validOrderId: number | null = null;
      if (orderId) {
        const oid = parseInt(String(orderId));
        if (!isNaN(oid)) {
          const ord = await sharedPool.query("SELECT customer_id FROM orders WHERE id = $1", [oid]);
          if (ord.rows[0] && Number(ord.rows[0].customer_id) === Number(customerId)) {
            validOrderId = oid;
          }
        }
      }

      const sName = String(senderName).trim().slice(0, 100);
      const sBank = senderBank ? String(senderBank).trim().slice(0, 80) : null;
      if (sName.length < 2) return res.status(400).json({ message: "Gönderen adı geçersiz" });

      const dedup = await sharedPool.query(
        `SELECT id FROM bank_transfer_notifications
         WHERE customer_id = $1 AND amount = $2 AND transfer_date = $3 AND sender_name = $4
         AND created_at > NOW() - INTERVAL '10 minutes' LIMIT 1`,
        [customerId, amt, dateStr, sName]
      );
      if (dedup.rows[0]) {
        return res.status(200).json({ success: true, id: dedup.rows[0].id, deduplicated: true });
      }

      const result = await sharedPool.query(
        `INSERT INTO bank_transfer_notifications
         (order_id, customer_id, customer_name, customer_phone, sender_name, sender_bank, amount, transfer_date, note, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending') RETURNING id`,
        [validOrderId, customerId, cust.name || "", cust.phone || "",
         sName, sBank, amt, dateStr,
         note ? String(note).trim().slice(0, 500) : null]
      );
      const customerName = cust.name || "";
      const transferDateLog = dateStr;
      try {
        const adminPhoneResult = await sharedPool.query("SELECT value FROM app_settings WHERE key = 'admin_phone'");
        const adminPhone = adminPhoneResult.rows[0]?.value;
        if (adminPhone) {
          sendSmsViaNetgsm(adminPhone, `HAVALE BILDIRIMI\nSiparis: ${validOrderId || "-"}\n${customerName}\nGonderen: ${sName}\nTutar: ${amt} TL\nTarih: ${transferDateLog}`).catch(() => {});
        }
      } catch {}
      res.status(201).json({ success: true, id: result.rows[0].id });
    } catch (err: any) {
      console.error("Bank transfer notification error:", err);
      res.status(500).json({ message: err?.message || "Bildirim kaydedilemedi" });
    }
  });

  app.get("/api/my-bank-transfer-notifications", async (req, res) => {
    try {
      const customerId = (req.session as any)?.customerId;
      if (!customerId) return res.status(401).json({ message: "Giriş gerekli" });
      const r = await sharedPool.query(
        "SELECT * FROM bank_transfer_notifications WHERE customer_id = $1 ORDER BY id DESC",
        [customerId]
      );
      res.json(r.rows);
    } catch {
      res.json([]);
    }
  });

  app.get("/api/admin/bank-transfer-notifications", requireAdmin, async (_req, res) => {
    try {
      const r = await sharedPool.query("SELECT * FROM bank_transfer_notifications ORDER BY id DESC LIMIT 500");
      res.json(r.rows);
    } catch {
      res.json([]);
    }
  });

  app.patch("/api/admin/bank-transfer-notifications/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) return res.status(400).json({ message: "Geçersiz ID" });
      const { status } = req.body || {};
      const allowed = ["pending", "confirmed", "rejected"];
      if (!allowed.includes(String(status))) return res.status(400).json({ message: "Geçersiz durum" });
      await sharedPool.query("UPDATE bank_transfer_notifications SET status = $1 WHERE id = $2", [status, id]);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err?.message || "Güncellenemedi" });
    }
  });

  app.delete("/api/admin/bank-transfer-notifications/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) return res.status(400).json({ message: "Geçersiz ID" });
      await sharedPool.query("DELETE FROM bank_transfer_notifications WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err?.message || "Silinemedi" });
    }
  });

  app.get("/api/admin/new-order-check", requireAdmin, async (_req, res) => {
    try {
      const result = await sharedPool.query(
        "SELECT id, customer_name, grand_total, payment_method, created_at FROM orders WHERE payment_status <> 'pending' AND payment_status <> 'awaiting' ORDER BY id DESC LIMIT 1"
      );
      const latestOrder = result.rows[0];
      if (!latestOrder) return res.json({ hasNew: false, lastId: 0 });
      const totalPending = await sharedPool.query("SELECT COUNT(*) as cnt FROM orders WHERE status = 'yeni' AND payment_status <> 'pending' AND payment_status <> 'awaiting'");
      res.json({
        hasNew: true,
        lastId: latestOrder.id,
        pendingCount: parseInt(totalPending.rows[0].cnt),
        latest: {
          id: latestOrder.id,
          customerName: latestOrder.customer_name,
          grandTotal: parseFloat(latestOrder.grand_total),
          paymentMethod: latestOrder.payment_method,
          createdAt: latestOrder.created_at,
        }
      });
    } catch {
      res.json({ hasNew: false, lastId: 0 });
    }
  });

  app.get("/api/public/daily-cargo-count", async (_req, res) => {
    try {
      const r = await sharedPool.query(
        "SELECT COUNT(*)::int AS c FROM orders WHERE created_at >= CURRENT_DATE AND created_at < (CURRENT_DATE + INTERVAL '1 day') AND status <> 'iptal'"
      );
      const count = Number(r.rows[0]?.c || 0);
      res.set("Cache-Control", "public, max-age=60");
      res.json({ count });
    } catch {
      res.set("Cache-Control", "no-store");
      res.json({ count: 0 });
    }
  });

  app.get("/api/public-settings", async (req, res) => {
    try {
      const keys = [
        "payment_eft_enabled", "payment_nakit_enabled", "payment_qr_enabled",
        "payment_pos_enabled", "payment_installments_enabled", "payment_tosla_enabled", "payment_iyzico_enabled",
        "campaign_hero_title", "campaign_hero_subtitle", "campaign_end_date",
        "bank_account_name", "bank_iban", "bank_name",
        "daily_cargo_widget_enabled",
        "sokak_banner_enabled", "veteriner_banner_enabled",
        "sokak_banner_image", "sokak_banner_link", "veteriner_banner_image", "veteriner_banner_link",
        "cross_sell_enabled",
        "cargo_fee", "cargo_free_limit", "cargo_min_order",
        "card_surcharge_percent",
        "konum_link", "whatsapp_number",
        "product_surcharge_overrides",
      ];
      const settings = await resolveSettings(keys, publicStoreId(req));
      res.set("Cache-Control", "no-store");
      res.json(settings);
    } catch {
      res.set("Cache-Control", "no-store");
      res.json({});
    }
  });

  // ===== jetgomarket'e özel: ürün bazlı nakit-dışı ödeme farkı (%) =====
  // Sadece jetgo mağazasında geçerli. app_settings `jetgo:product_surcharge_overrides`
  // JSON haritası { "<productId>": <yuzde> } olarak saklanır. Diğer 8 mağaza bu
  // özelliğe hiç dokunmaz; tek oranlı card_surcharge_percent modelinde kalır.
  app.get("/api/admin/product-surcharge-overrides", requireAdmin, async (req, res) => {
    try {
      if (adminStoreId(req) !== "jetgo") return res.json({});
      const s = await resolveSettings(["product_surcharge_overrides"], "jetgo");
      const map: Record<string, number> = {};
      try {
        const obj = s.product_surcharge_overrides ? JSON.parse(s.product_surcharge_overrides) : {};
        if (obj && typeof obj === "object") {
          for (const [k, v] of Object.entries(obj)) {
            const id = Number(k); const pct = Number(v);
            if (Number.isFinite(id) && Number.isFinite(pct) && pct >= 0 && pct <= 100) map[String(id)] = pct;
          }
        }
      } catch { /* malformed -> empty */ }
      res.json(map);
    } catch {
      res.json({});
    }
  });

  app.patch("/api/admin/product-surcharge-overrides", requireAdmin, async (req, res) => {
    try {
      if (adminStoreId(req) !== "jetgo") {
        return res.status(400).json({ message: "Ürün bazlı ödeme farkı yalnızca jetgomarket için ayarlanabilir." });
      }
      const pid = parseInt(String(req.body?.productId));
      if (!Number.isFinite(pid) || pid <= 0) {
        return res.status(400).json({ message: "Geçersiz ürün." });
      }
      const raw = req.body?.percent;
      const clear = raw === "" || raw === null || raw === undefined;
      let pct = 0;
      if (!clear) {
        pct = Number(raw);
        if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
          return res.status(400).json({ message: "Yüzde 0 ile 100 arasında olmalı." });
        }
      }
      // Read-merge-write ONE entry so a stale client can't clobber the whole map.
      const key = settingsPrefix("jetgo") + "product_surcharge_overrides";
      const existing = await sharedPool.query("SELECT value FROM app_settings WHERE key = $1", [key]);
      const map: Record<string, number> = {};
      if (existing.rows[0]?.value) {
        try {
          const obj = JSON.parse(existing.rows[0].value);
          if (obj && typeof obj === "object") {
            for (const [k, v] of Object.entries(obj)) {
              const id = Number(k); const p = Number(v);
              if (Number.isFinite(id) && Number.isFinite(p) && p >= 0 && p <= 100) map[String(id)] = p;
            }
          }
        } catch { /* malformed -> start fresh */ }
      }
      if (clear) delete map[String(pid)];
      else map[String(pid)] = pct;
      await sharedPool.query(
        "INSERT INTO app_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()",
        [key, JSON.stringify(map)]
      );
      res.json({ ok: true, overrides: map });
    } catch (e) {
      console.error("product-surcharge-overrides patch error:", e);
      res.status(500).json({ message: "Kayıt başarısız" });
    }
  });

  // ===== Domain'e özel Google etiketleri (DB-backed, redeploy gerektirmez) =====
  app.get("/api/admin/google-tags", requireAdmin, async (_req, res) => {
    try {
      res.json(await getAllStoreGoogleConfigs());
    } catch {
      res.status(500).json({ message: "Google etiketleri yüklenemedi" });
    }
  });
  app.put("/api/admin/google-tags/:storeId", requireAdmin, async (req, res) => {
    try {
      const cfg = await setStoreGoogleConfig(String(req.params.storeId), req.body || {});
      res.json({ ok: true, config: cfg });
    } catch (err: any) {
      const invalid = err?.message === "invalid store";
      res.status(invalid ? 400 : 500).json({ message: invalid ? "Geçersiz mağaza" : "Kayıt başarısız" });
    }
  });
  app.delete("/api/admin/google-tags/:storeId", requireAdmin, async (req, res) => {
    try {
      await deleteStoreGoogleConfig(String(req.params.storeId));
      res.json({ ok: true });
    } catch (err: any) {
      const invalid = err?.message === "invalid store";
      res.status(invalid ? 400 : 500).json({ message: invalid ? "Geçersiz mağaza" : "Silme başarısız" });
    }
  });

  // Google Merchant Center — her domain için feed adresi, ürün sayısı ve
  // domaine özel Merchant hesap kimliği / kargo override yönetimi.
  app.get("/api/admin/merchant", requireAdmin, async (_req, res) => {
    try {
      const stores = await getAllStoreMerchantConfigs();
      const { rows } = await sharedPool.query(
        `SELECT COUNT(*)::int AS c FROM products WHERE is_active = true AND price > 0 AND img IS NOT NULL AND img <> ''`,
      );
      res.json({ productCount: rows[0]?.c ?? 0, stores });
    } catch {
      res.status(500).json({ message: "Merchant ayarları yüklenemedi" });
    }
  });
  app.put("/api/admin/merchant/:storeId", requireAdmin, async (req, res) => {
    try {
      const cfg = await setStoreMerchantConfig(String(req.params.storeId), req.body || {});
      res.json({ ok: true, config: cfg });
    } catch (err: any) {
      const invalid = err?.message === "invalid store";
      res.status(invalid ? 400 : 500).json({ message: invalid ? "Geçersiz mağaza" : "Kayıt başarısız" });
    }
  });
  app.delete("/api/admin/merchant/:storeId", requireAdmin, async (req, res) => {
    try {
      await deleteStoreMerchantConfig(String(req.params.storeId));
      res.json({ ok: true });
    } catch (err: any) {
      const invalid = err?.message === "invalid store";
      res.status(invalid ? 400 : 500).json({ message: invalid ? "Geçersiz mağaza" : "Silme başarısız" });
    }
  });

  // Google Local Feed admin paneli istatistikleri. Ürün kataloğu tüm domainlerde
  // ortaktır, bu yüzden sayımlar globaldir; mağaza bazlı tek fark feed adresi ve
  // store_code'dur. Feed canlı üretildiği için generatedAt = anlık zamandır.
  app.get("/api/admin/local-feed-stats", requireAdmin, async (_req, res) => {
    try {
      const { rows } = await sharedPool.query(
        `SELECT COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE stock > 0)::int AS in_stock
         FROM products
         WHERE is_active = true AND price > 0 AND img IS NOT NULL AND img <> ''`,
      );
      const total = rows[0]?.total ?? 0;
      const inStock = rows[0]?.in_stock ?? 0;
      const stores = (await getAllStoreMerchantConfigs()).map((s) => ({
        id: s.id,
        name: s.name,
        domain: s.domain,
        localFeedUrl: s.localFeedUrl,
        storeCode: s.effectiveStoreCode,
        hasStoreCode: !!s.effectiveStoreCode,
      }));
      res.json({
        total,
        inStock,
        outOfStock: Math.max(0, total - inStock),
        generatedAt: new Date().toISOString(),
        stores,
      });
    } catch {
      res.status(500).json({ message: "Local feed istatistikleri yüklenemedi" });
    }
  });

  app.get("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const settings = await resolveAllSettings(adminStoreId(req));
      res.json(settings);
    } catch {
      res.json({});
    }
  });

  app.patch("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const updates = req.body;
      const numericKeys = ["pet_base_points", "pet_streak_divisor", "pet_max_points", "pet_base_exp", "pet_streak_exp_bonus", "card_surcharge_percent"];
      const textKeys = [
        "admin_phone", "order_notification_sms", "sms_msgheader",
        "payment_eft_enabled", "payment_nakit_enabled", "payment_qr_enabled",
        "payment_pos_enabled", "payment_installments_enabled", "payment_tosla_enabled", "payment_iyzico_enabled",
        "tosla_client_id", "tosla_api_user", "tosla_api_pass", "tosla_base_url",
        "iyzico_api_key", "iyzico_secret_key", "iyzico_base_url",
        "campaign_hero_title", "campaign_hero_subtitle", "campaign_end_date",
        "bank_account_name", "bank_iban", "bank_name",
        "daily_cargo_widget_enabled",
        "sokak_banner_enabled", "veteriner_banner_enabled",
        "sokak_banner_image", "sokak_banner_link", "veteriner_banner_image", "veteriner_banner_link",
        "cross_sell_enabled",
        "cargo_fee", "cargo_free_limit", "cargo_min_order",
        "konum_link", "whatsapp_number",
      ];

      const toslaFlag = updates.payment_tosla_enabled;
      if (toslaFlag === "true" || toslaFlag === true) {
        const existing = await sharedPool.query(
          "SELECT key, value FROM app_settings WHERE key IN ('tosla_client_id','tosla_api_user','tosla_api_pass')"
        );
        const cur: Record<string, string> = {};
        for (const r of existing.rows) cur[r.key] = r.value || "";
        const finalClientId = (updates.tosla_client_id !== undefined ? String(updates.tosla_client_id).trim() : cur.tosla_client_id);
        const finalApiUser = (updates.tosla_api_user !== undefined ? String(updates.tosla_api_user).trim() : cur.tosla_api_user);
        const finalApiPass = (updates.tosla_api_pass !== undefined ? String(updates.tosla_api_pass).trim() : cur.tosla_api_pass);
        if (!finalClientId || !finalApiUser || !finalApiPass) {
          return res.status(400).json({
            message: "Online Kredi Kartı'nı aktif etmek için Tosla ClientId, ApiUser ve ApiPass zorunludur.",
          });
        }
      }

      const iyzicoFlag = updates.payment_iyzico_enabled;
      const iyzicoEnabling = iyzicoFlag === "true" || iyzicoFlag === true || iyzicoFlag === "1";
      if (iyzicoEnabling) {
        const existing = await sharedPool.query(
          "SELECT key, value FROM app_settings WHERE key IN ('iyzico_api_key','iyzico_secret_key')"
        );
        const cur: Record<string, string> = {};
        for (const r of existing.rows) cur[r.key] = r.value || "";
        const finalApiKey = (updates.iyzico_api_key !== undefined ? String(updates.iyzico_api_key).trim() : cur.iyzico_api_key);
        const finalSecret = (updates.iyzico_secret_key !== undefined ? String(updates.iyzico_secret_key).trim() : cur.iyzico_secret_key);
        if (!finalApiKey || !finalSecret) {
          return res.status(400).json({
            message: "İyzico'yu aktif etmek için API Key ve Secret Key zorunludur.",
          });
        }
      }

      const store = adminStoreId(req);
      // Store-scoped anahtarlar için önekli anahtara yaz; diğerleri ortak (temel) kalır.
      const keyFor = (k: string) => (STORE_SCOPED_SETTING_KEYS.has(k) ? settingsPrefix(store) + k : k);
      for (const [key, value] of Object.entries(updates)) {
        if (key === "store") continue;
        if (numericKeys.includes(key)) {
          const numVal = Number(value);
          if (isNaN(numVal) || numVal < 0 || numVal > 100) continue;
          await sharedPool.query(
            "INSERT INTO app_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()",
            [keyFor(key), String(numVal)]
          );
        } else if (textKeys.includes(key)) {
          let strVal = String(value).trim();
          const imageKeys = ["sokak_banner_image", "veteriner_banner_image"];
          const linkKeys = ["sokak_banner_link", "veteriner_banner_link"];
          if (imageKeys.includes(key)) {
            // Boş = varsayılana dön. Dolu ise ~2MB base64 sınırı (doğrudan API çağrısı korumasını da kapsar).
            if (strVal && strVal.length > 3_000_000) {
              return res.status(400).json({ message: "Banner görseli çok büyük (max ~2MB)" });
            }
          } else if (linkKeys.includes(key)) {
            if (strVal.length > 500) strVal = strVal.slice(0, 500);
            if (strVal && !/^https?:\/\//i.test(strVal) && !strVal.startsWith("/")) {
              strVal = "/" + strVal;
            }
          } else if (key === "konum_link") {
            if (strVal.length > 1000) strVal = strVal.slice(0, 1000);
            // Sadece http(s) linkine izin ver; aksi halde boş = client varsayılana döner (javascript: vb. engellenir).
            if (strVal && !/^https?:\/\//i.test(strVal)) strVal = "";
          } else if (key === "whatsapp_number") {
            strVal = strVal.replace(/[^\d+]/g, "").slice(0, 20);
          }
          await sharedPool.query(
            "INSERT INTO app_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()",
            [keyFor(key), strVal]
          );
        }
      }
      const settings = await resolveAllSettings(store);
      res.json(settings);
    } catch {
      res.status(500).json({ message: "Ayarlar güncellenemedi" });
    }
  });

  app.get("/api/admin/orders", requireAdmin, async (_req, res) => {
    const rawOrders = await storage.getAllOrders();
    // Online ödeme siparişleri ödeme tamamlanmadan önce "pending"/"awaiting" olarak
    // oluşturulur (iyzico/Tosla sayfası açıkken). Ödeme alınmadığı için bunları admin
    // sipariş listesinde gösterme — bildirim sorgularıyla aynı davranış.
    const allOrders = rawOrders.filter(o => {
      const ps = (o as any).paymentStatus;
      return ps !== "pending" && ps !== "awaiting";
    });
    const campaignRows = await sharedPool.query("SELECT product_id FROM campaign_items WHERE is_active = true");
    const campaignProductIds = new Set<number>(campaignRows.rows.map((r: any) => r.product_id));
    const productIds = new Set<number>();
    for (const o of allOrders) {
      const items = Array.isArray(o.items) ? (o.items as any[]) : [];
      for (const it of items) {
        const pid = Number(it.productId);
        if (pid) productIds.add(pid);
      }
    }
    const productMap = new Map<number, { img: string | null }>();
    if (productIds.size > 0) {
      const bulkProducts = await storage.getProductsByIds([...productIds]);
      for (const p of bulkProducts) productMap.set(p.id, { img: p.img });
    }
    const enriched = allOrders.map(o => {
      const items = Array.isArray(o.items) ? (o.items as any[]) : [];
      const isCampaign = (o as any).isCampaign === true
        || (items.length > 0 && items.some((it: any) => campaignProductIds.has(Number(it.productId))));
      const itemsWithImg = items.map((it: any) => ({ ...it, img: productMap.get(Number(it.productId))?.img || null }));
      return { ...o, items: itemsWithImg, isCampaign };
    });
    res.json(enriched);
  });

  app.delete("/api/admin/orders/clear-all", requireAdmin, async (_req, res) => {
    try {
      await sharedPool.query(`DELETE FROM orders`);
      await sharedPool.query(`ALTER SEQUENCE orders_id_seq RESTART WITH 1`);
      res.json({ ok: true });
    } catch (err: any) {
      console.error("[clear-all orders] error:", err?.message);
      res.status(500).json({ message: "Siparişler silinemedi", detail: err?.message });
    }
  });

  const SHIPPED_STATUSES = new Set(["kargoda", "kargoya", "kargoya_verildi", "kargoya-verildi", "shipped", "in_transit", "in-transit"]);

  async function notifyShipmentIfNeeded(order: any): Promise<boolean> {
    if (!order) return false;
    if (order.shippingSmsSent) return false;
    const cargoCompany = order.cargoCompany;
    const trackingNumber = order.trackingNumber;
    if (!cargoCompany || !trackingNumber || !order.customerPhone) return false;
    try {
      const stCfg = storeById(order.sourceSite);
      const stHeader = await resolveSmsHeader(stCfg.id);
      const lines = [
        `Siparisiniz kargoya verildi.`,
        `Kargo: ${cargoCompany}`,
        `Takip No: ${trackingNumber}`,
      ];
      if (order.trackingUrl) lines.push(`Takip: ${order.trackingUrl}`);
      sendSmsViaNetgsm(order.customerPhone, lines.join("\n"), stHeader).catch(() => {});
      await storage.markShippingSmsSent(order.id, true);
      return true;
    } catch {
      return false;
    }
  }

  app.patch("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    const id = parseInt(String(req.params.id));
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "Status required" });
    const prevRow = await sharedPool.query("SELECT status FROM orders WHERE id = $1", [id]);
    const prevStatus = prevRow.rows[0]?.status;
    const order = await storage.updateOrderStatus(id, status);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (SHIPPED_STATUSES.has(String(status).toLowerCase())) {
      await notifyShipmentIfNeeded(order);
    }

    if (status === "tamamlandi" && order.customerPhone) {
      const stCfg = storeById((order as any).sourceSite);
      const apexHost = canonicalHost(stCfg).replace(/^www\./, "");
      const smsMessage = `Siparissiniz teslim edildi. ${stCfg.shortName} ile alisveris yaptiginiz icin tesekkurler! ${apexHost} adresinden tekrar siparis verebilirsiniz.`;
      const stHeader = await resolveSmsHeader(stCfg.id);
      sendSmsViaNetgsm(order.customerPhone, smsMessage, stHeader).catch(err => {
        console.error("Post-delivery SMS error:", err);
      });
    }

    if (status === "iptal" && prevStatus !== "iptal" && order.customerPhone) {
      const stCfg = storeById((order as any).sourceSite);
      const apexHost = canonicalHost(stCfg).replace(/^www\./, "");
      const brand = stCfg.shortName;
      const smsMessage = `${brand} - ${order.id} numarali siparissiniz iptal edilmistir. Sorulariniz icin bizimle iletisime gecebilirsiniz. ${apexHost}`;
      const stHeader = await resolveSmsHeader(stCfg.id);
      sendSmsViaNetgsm(order.customerPhone, smsMessage, stHeader).catch(err => {
        console.error("Order-cancel SMS error:", err);
      });
    }

    res.json(order);
  });

  app.patch("/api/admin/orders/:id/tracking", requireAdmin, async (req, res) => {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) return res.status(400).json({ message: "Geçersiz sipariş" });
    const cargoCompany = req.body?.cargoCompany ? String(req.body.cargoCompany).trim() : "";
    const trackingNumber = req.body?.trackingNumber ? String(req.body.trackingNumber).trim() : "";
    const CARGO_TRACK_TEMPLATES: Record<string, string> = {
      "Yurtiçi Kargo": "https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code={code}",
      "Aras Kargo": "https://kargotakip.araskargo.com.tr/mainpage.aspx?code={code}",
      "MNG Kargo": "https://kargotakip.mngkargo.com.tr/?takipNo={code}",
      "PTT Kargo": "https://gonderitakip.ptt.gov.tr/Track/Verify?q={code}",
      "Sürat Kargo": "https://www.suratkargo.com.tr/KargoTakip/?kargotakipno={code}",
      "UPS Kargo": "https://www.ups.com/track?trackingNumber={code}",
    };
    if (cargoCompany && !CARGO_TRACK_TEMPLATES[cargoCompany]) {
      return res.status(400).json({ message: "Geçersiz kargo firması" });
    }
    let trackingUrl = "";
    if (cargoCompany && trackingNumber) {
      const tpl = CARGO_TRACK_TEMPLATES[cargoCompany];
      if (tpl) trackingUrl = tpl.replace("{code}", encodeURIComponent(trackingNumber));
    }
    const order = await storage.updateOrderTracking(id, {
      cargoCompany: cargoCompany || null,
      trackingNumber: trackingNumber || null,
      trackingUrl: trackingUrl || null,
    });
    if (!order) return res.status(404).json({ message: "Sipariş bulunamadı" });
    await notifyShipmentIfNeeded(order);
    res.json(order);
  });

  app.post("/api/otp/send", async (req, res) => {
    const ip = req.ip || "unknown";
    if (rateLimit(`otp:${ip}`, 10, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
    }
    const { phone, deviceToken } = req.body;
    if (!phone) return res.status(400).json({ message: "Telefon numarası gerekli" });
    const normalized = phone.replace(/\D/g, "");
    if (normalized.length < 10) return res.status(400).json({ message: "Geçerli bir telefon numarası girin" });

    // Yasaklı numara kontrolü: admin panelinden engellenen numaralara OTP SMS gönderilmez.
    if (await storage.isNumberBanned(canonicalTrPhone(normalized))) {
      return res.status(403).json({ message: "Bu numara engellenmiştir. Lütfen müşteri hizmetleri ile iletişime geçin.", banned: true });
    }

    if (isTestOtpBypass()) {
      otpStore.set(normalized, { code: TEST_OTP_CODE, expiresAt: Date.now() + 180000, attempts: 0 });
      const customerExists = !!(await storage.getCustomerByPhone(normalized));
      return res.json({ message: "Doğrulama kodu gönderildi (test)", isExisting: customerExists });
    }

    if (deviceToken && typeof deviceToken === "string" && deviceToken.length > 20) {
      try {
        const result = await sharedPool.query(
          "SELECT td.customer_id, td.id FROM trusted_devices td WHERE td.phone = $1 AND td.device_token = $2 AND td.expires_at > NOW()",
          [normalized, deviceToken]
        );
        if (result.rows.length > 0) {
          const customerId = result.rows[0].customer_id;
          const customer = await storage.getCustomer(customerId);
          if (customer && customer.phone === normalized) {
            (req.session as any).customerId = customer.id;
            await sharedPool.query(
              "UPDATE trusted_devices SET created_at = NOW(), expires_at = NOW() + INTERVAL '30 days' WHERE id = $1",
              [result.rows[0].id]
            );
            return req.session.save((err) => {
              if (err) {
                console.error("Session save error:", err);
                return res.status(500).json({ message: "Oturum kaydedilemedi" });
              }
              res.json({
                message: "Güvenilir cihaz ile giriş yapıldı",
                trustedLogin: true,
                customer: { id: customer.id, phone: customer.phone, name: customer.name, address: customer.address }
              });
            });
          }
        }
      } catch (e) {}
    }

    const sendTrack = otpSendCount.get(normalized);
    if (sendTrack && sendTrack.resetAt > Date.now() && sendTrack.count >= 5) {
      return res.status(429).json({ message: "Günlük SMS limiti aşıldı, lütfen yarın tekrar deneyin" });
    }

    const existing = otpStore.get(normalized);
    if (existing && existing.expiresAt > Date.now() && (existing.expiresAt - Date.now()) > 150000) {
      return res.status(429).json({ message: "Lütfen biraz bekleyin, kısa süre önce kod gönderildi" });
    }

    const code = generateOTP();
    otpStore.set(normalized, { code, expiresAt: Date.now() + 180000, attempts: 0 });

    const hostHeader = (req.headers["x-forwarded-host"] as string) || req.headers.host || "jetgomarket.com";
    const otpHost = String(hostHeader).split(":")[0];
    const otpStoreCfg = getStoreByHost(hostHeader);
    const message = `${code} dogrulama kodu ile ${otpStoreCfg.brandWord} hesabina giris yapabilirsiniz. Kodunu kimseyle paylasma.\n\n@${otpHost} #${code}`;
    const sent = await sendSmsViaNetgsm(normalized, message, await resolveSmsHeader(otpStoreCfg.id));
    if (!sent) {
      otpStore.delete(normalized);
      return res.status(500).json({ message: "SMS gönderilemedi, lütfen tekrar deneyin" });
    }

    const currentTrack = otpSendCount.get(normalized);
    const dayMs = 24 * 60 * 60 * 1000;
    if (currentTrack && currentTrack.resetAt > Date.now()) {
      currentTrack.count++;
    } else {
      otpSendCount.set(normalized, { count: 1, resetAt: Date.now() + dayMs });
    }

    const customerExists = !!(await storage.getCustomerByPhone(normalized));
    res.json({ message: "Doğrulama kodu gönderildi", isExisting: customerExists });
  });

  app.post("/api/otp/verify", async (req, res) => {
    const { phone, code, name, address } = req.body;
    if (!phone || !code) return res.status(400).json({ message: "Telefon ve doğrulama kodu gerekli" });
    const normalized = phone.replace(/\D/g, "");

    const entry = otpStore.get(normalized);
    if (!entry) return res.status(400).json({ message: "Doğrulama kodu bulunamadı, yeni kod isteyin" });
    if (entry.expiresAt < Date.now()) {
      otpStore.delete(normalized);
      return res.status(400).json({ message: "Doğrulama kodunun süresi doldu, yeni kod isteyin" });
    }
    if (entry.attempts >= 5) {
      otpStore.delete(normalized);
      return res.status(429).json({ message: "Çok fazla hatalı deneme, yeni kod isteyin" });
    }
    if (entry.code !== code) {
      entry.attempts++;
      return res.status(400).json({ message: "Doğrulama kodu hatalı" });
    }

    let customer = await storage.getCustomerByPhone(normalized);
    let isNewUser = false;
    if (!customer && !(name && String(name).trim())) {
      return res.json({ verified: true, isNewUser: true, requiresRegistration: true });
    }
    otpStore.delete(normalized);
    if (!customer) {
      isNewUser = true;
      const dummyPass = await bcrypt.hash(Math.random().toString(36), 10);
      customer = await storage.createCustomer({
        phone: normalized,
        password: dummyPass,
        name: (name || "").trim() || "Müşteri",
        address: (address || "").trim() || null,
      });
    }

    (req.session as any).customerId = customer.id;

    let newDeviceToken: string | undefined;
    try {
      const token = crypto.randomBytes(48).toString("hex");
      const ua = req.headers["user-agent"] || "";
      await sharedPool.query(
        "INSERT INTO trusted_devices (customer_id, phone, device_token, user_agent, expires_at) VALUES ($1, $2, $3, $4, NOW() + INTERVAL '30 days')",
        [customer.id, normalized, token, ua]
      );
      newDeviceToken = token;
      await sharedPool.query("DELETE FROM trusted_devices WHERE expires_at < NOW()");
    } catch (e) {}

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Oturum kaydedilemedi" });
      }
      res.json({ id: customer.id, phone: customer.phone, name: customer.name, address: customer.address, deviceToken: newDeviceToken, isNewUser });
    });
  });

  app.post("/api/customer/register", async (req, res) => {
    const ip = req.ip || "unknown";
    if (rateLimit(`register:${ip}`, 5, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla kayıt denemesi. Lütfen daha sonra tekrar deneyin." });
    }
    const { phone, password, name, address } = req.body;
    if (!phone || !password || !name) {
      return res.status(400).json({ message: "Telefon, şifre ve ad soyad gerekli" });
    }
    if (typeof phone !== "string" || typeof password !== "string" || typeof name !== "string") {
      return res.status(400).json({ message: "Geçersiz veri tipi" });
    }
    const normalized = phone.replace(/\D/g, "");
    if (normalized.length < 10 || normalized.length > 15) {
      return res.status(400).json({ message: "Geçerli bir telefon numarası girin" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Şifre en az 6 karakter olmalı" });
    }
    if (password.length > 128) {
      return res.status(400).json({ message: "Şifre çok uzun" });
    }
    if (name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ message: "Ad soyad 2-100 karakter arasında olmalı" });
    }
    if (address && (typeof address !== "string" || address.length > 500)) {
      return res.status(400).json({ message: "Adres çok uzun (max 500 karakter)" });
    }
    const existing = await storage.getCustomerByPhone(normalized);
    if (existing) {
      return res.status(409).json({ message: "Bu telefon numarası zaten kayıtlı" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const customer = await storage.createCustomer({ phone: normalized, password: hashed, name: name.trim(), address: address?.trim() || null });
    (req.session as any).customerId = customer.id;
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Oturum kaydedilemedi" });
      }
      res.status(201).json({ id: customer.id, phone: customer.phone, name: customer.name, address: customer.address });
    });
  });

  app.post("/api/customer/login", async (req, res) => {
    const ip = req.ip || "unknown";
    if (rateLimit(`custlogin:${ip}`, 10, 15 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla giriş denemesi. 15 dakika bekleyin." });
    }
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: "Telefon ve şifre gerekli" });
    }
    const normalized = phone.replace(/\D/g, "");
    if (rateLimit(`custlogin:phone:${normalized}`, 5, 15 * 60 * 1000)) {
      return res.status(429).json({ message: "Bu numara için çok fazla deneme. 15 dakika bekleyin." });
    }
    const customer = await storage.getCustomerByPhone(normalized);
    if (!customer) return res.status(401).json({ message: "Telefon numarası veya şifre hatalı" });
    const valid = await bcrypt.compare(password, customer.password);
    if (!valid) return res.status(401).json({ message: "Telefon numarası veya şifre hatalı" });
    (req.session as any).customerId = customer.id;
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Oturum kaydedilemedi" });
      }
      res.json({ id: customer.id, phone: customer.phone, name: customer.name, address: customer.address });
    });
  });

  app.post("/api/customer/logout", (req, res) => {
    delete (req.session as any).customerId;
    req.session.save(() => {
      res.json({ message: "Çıkış yapıldı" });
    });
  });

  function requireCustomer(req: Request, res: Response, next: NextFunction) {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapılmamış" });
    (req as any).customerId = customerId;
    next();
  }

  app.get("/api/customer/me", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapılmamış" });
    const customer = await storage.getCustomer(customerId);
    if (!customer) return res.status(401).json({ message: "Giriş yapılmamış" });
    res.json({ id: customer.id, phone: customer.phone, name: customer.name, address: customer.address, email: customer.email, tcNo: customer.tcNo, notifyStock: customer.notifyStock, notifyCampaign: customer.notifyCampaign });
  });

  app.patch("/api/customer/profile", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const ip = req.ip || "unknown";
    if (rateLimit(`profile:${ip}`, 15, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
    }
    const { name, address, email, tcNo } = req.body;
    const updateData: Record<string, any> = {};
    if (name) {
      if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
        return res.status(400).json({ message: "Ad soyad 2-100 karakter arasında olmalı" });
      }
      updateData.name = name.trim();
    }
    if (address !== undefined) {
      if (address && (typeof address !== "string" || address.length > 500)) {
        return res.status(400).json({ message: "Adres çok uzun (max 500 karakter)" });
      }
      updateData.address = typeof address === "string" ? address.trim() : null;
    }
    if (email !== undefined) {
      if (email && (typeof email !== "string" || email.length > 200 || (email.trim() && !email.includes("@")))) {
        return res.status(400).json({ message: "Geçerli bir e-posta adresi girin" });
      }
      updateData.email = email ? email.trim() : null;
    }
    if (tcNo !== undefined) {
      if (tcNo && (typeof tcNo !== "string" || !/^\d{11}$/.test(tcNo.trim()))) {
        return res.status(400).json({ message: "TC Kimlik No 11 haneli olmalıdır" });
      }
      updateData.tcNo = tcNo ? tcNo.trim() : null;
    }
    const customer = await storage.updateCustomer(customerId, updateData);
    if (!customer) return res.status(404).json({ message: "Müşteri bulunamadı" });

    if (updateData.address) {
      try {
        const normalizeAddr = (s: string) =>
          s
            .toLocaleLowerCase("tr-TR")
            .replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g")
            .replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c")
            .replace(/[^a-z0-9]+/g, "")
            .trim();
        const myNorm = normalizeAddr(updateData.address);
        if (myNorm.length >= 12) {
          const dupCheck = await sharedPool.query(
            `SELECT 1 FROM customers
             WHERE id <> $1
               AND address IS NOT NULL
               AND regexp_replace(
                     translate(lower(address), 'ışğüöç', 'isguoc'),
                     '[^a-z0-9]+', '', 'g'
                   ) = $2
             LIMIT 1`,
            [customerId, myNorm]
          );
          if (dupCheck.rows.length > 0) {
            await sharedPool.query(
              "UPDATE coupons SET is_active = false WHERE customer_id = $1 AND code LIKE 'HG%' AND is_active = true",
              [customerId]
            );
            console.log(`[fraud-check] Duplicate address detected for customer ${customerId}, welcome coupon deactivated`);
          }
        }
      } catch (e) {
        console.error("[fraud-check] address dedupe failed:", e);
      }
    }

    res.json({ id: customer.id, phone: customer.phone, name: customer.name, address: customer.address, email: customer.email, tcNo: customer.tcNo, notifyStock: customer.notifyStock, notifyCampaign: customer.notifyCampaign });
  });

  app.patch("/api/customer/password", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const ip = req.ip || "unknown";
    if (rateLimit(`passwd:${ip}`, 5, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla şifre değiştirme denemesi. Lütfen daha sonra tekrar deneyin." });
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "Mevcut ve yeni şifre gerekli" });
    if (typeof newPassword !== "string" || newPassword.length < 6) return res.status(400).json({ message: "Yeni şifre en az 6 karakter olmalı" });
    if (newPassword.length > 128) return res.status(400).json({ message: "Şifre çok uzun" });
    const customer = await storage.getCustomer(customerId);
    if (!customer) return res.status(404).json({ message: "Müşteri bulunamadı" });
    const valid = await bcrypt.compare(currentPassword, customer.password);
    if (!valid) return res.status(400).json({ message: "Mevcut şifre hatalı" });
    const hashed = await bcrypt.hash(newPassword, 10);
    await storage.updateCustomer(customerId, { password: hashed });
    res.json({ message: "Şifre başarıyla değiştirildi" });
  });

  app.delete("/api/customer/account", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const ip = req.ip || "unknown";
    if (rateLimit(`accdel:${ip}`, 3, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
    }
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Şifre gerekli" });
    const customer = await storage.getCustomer(customerId);
    if (!customer) return res.status(404).json({ message: "Müşteri bulunamadı" });
    const valid = await bcrypt.compare(password, customer.password);
    if (!valid) return res.status(400).json({ message: "Şifre hatalı" });
    await db.update(orders)
      .set({ customerName: "Silinmiş Kullanıcı", customerAddress: null, customerPhone: "000" })
      .where(eq(orders.customerPhone, customer.phone));
    await storage.deleteCustomerAccount(customerId);
    req.session.destroy(() => {});
    res.json({ message: "Hesabınız başarıyla silindi" });
  });

  app.patch("/api/customer/preferences", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const { notifyStock, notifyCampaign } = req.body;
    const updateData: Record<string, boolean> = {};
    if (typeof notifyStock === "boolean") updateData.notifyStock = notifyStock;
    if (typeof notifyCampaign === "boolean") updateData.notifyCampaign = notifyCampaign;
    const customer = await storage.updateCustomer(customerId, updateData as any);
    if (!customer) return res.status(404).json({ message: "Müşteri bulunamadı" });
    res.json({ notifyStock: customer.notifyStock, notifyCampaign: customer.notifyCampaign });
  });

  const createReminderSchema = z.object({
    customerPhone: z.string().min(7),
    customerName: z.string().optional(),
    productId: z.number().int().positive(),
    productName: z.string().min(1),
    animalType: z.enum(["kedi", "kopek"]),
    dailyGrams: z.number().positive(),
    packageGrams: z.number().positive(),
    estimatedDays: z.number().int().min(1),
  });

  app.post("/api/reorder-reminders", async (req, res) => {
    const ip = req.ip || "unknown";
    if (rateLimit(`reminder:${ip}`, 10, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
    }
    const parsed = createReminderSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Eksik veya hatalı bilgi", errors: parsed.error.errors });
    const { estimatedDays, ...rest } = parsed.data;
    const reorderDate = new Date();
    reorderDate.setDate(reorderDate.getDate() + estimatedDays);
    const reminder = await storage.createReorderReminder({
      ...rest, estimatedDays, reorderDate, status: "pending",
    });
    res.status(201).json(reminder);
  });

  app.get("/api/admin/reorder-reminders", requireAdmin, async (_req, res) => {
    const reminders = await storage.getReorderReminders();
    res.json(reminders);
  });

  app.patch("/api/admin/reorder-reminders/:id/status", requireAdmin, async (req, res) => {
    const id = parseInt(String(req.params.id));
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "Status gerekli" });
    const updated = await storage.updateReorderReminderStatus(id, status);
    if (!updated) return res.status(404).json({ message: "Hatırlatma bulunamadı" });
    res.json(updated);
  });

  app.get("/api/customer/orders", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const customer = await storage.getCustomer(customerId);
    if (!customer) return res.status(404).json({ message: "Müşteri bulunamadı" });
    const customerOrders = await storage.getOrdersByPhone(customer.phone);
    const productIds = new Set<number>();
    for (const o of customerOrders) {
      if (Array.isArray(o.items)) {
        for (const item of o.items as any[]) {
          if (item.productId) productIds.add(item.productId);
        }
      }
    }
    const productMap = new Map<number, { img: string | null; stock: number }>();
    const bulkProducts = await storage.getProductsByIds([...productIds]);
    for (const p of bulkProducts) {
      productMap.set(p.id, { img: p.img, stock: p.stock });
    }
    const campaignRows = await sharedPool.query("SELECT product_id FROM campaign_items WHERE is_active = true");
    const campaignProductIds = new Set<number>(campaignRows.rows.map((r: any) => r.product_id));
    res.json(customerOrders.map(o => {
      const items = Array.isArray(o.items) ? (o.items as any[]) : [];
      const isCampaign = (o as any).isCampaign === true
        || (items.length > 0 && items.some((it: any) => campaignProductIds.has(Number(it.productId))));
      return {
        id: o.id,
        items: items.map((item: any) => {
          const pData = productMap.get(item.productId);
          return { ...item, img: pData?.img || null, currentStock: pData?.stock ?? 0 };
        }),
        subtotal: o.subtotal, shipping: o.shipping, discount: o.discount,
        grandTotal: o.grandTotal, status: o.status, paymentMethod: o.paymentMethod, createdAt: o.createdAt,
        customerNote: o.customerNote, deliverySlot: o.deliverySlot,
        customerAddress: o.customerAddress,
        city: (o as any).city,
        district: (o as any).district,
        cargoCompany: (o as any).cargoCompany,
        trackingNumber: (o as any).trackingNumber,
        trackingUrl: (o as any).trackingUrl,
        installmentMonths: (o as any).installmentMonths,
        installmentMonthly: (o as any).installmentMonthly,
        installmentTotal: (o as any).installmentTotal,
        paymentStatus: (o as any).paymentStatus,
        isCampaign,
      };
    }));
  });

  app.get("/api/customer/favorites", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const favoriteIds = await storage.getCustomerFavoriteIds(customerId);
    res.json(favoriteIds);
  });

  app.get("/api/customer/favorites/details", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const favoriteIds = await storage.getCustomerFavoriteIds(customerId);
    if (favoriteIds.length === 0) return res.json([]);
    const bulkProducts = await storage.getProductsByIds(favoriteIds);
    res.json(
      bulkProducts
        .filter(p => p.isActive)
        .map(p => ({ id: p.id, name: p.name, price: p.price, img: p.img, stock: p.stock }))
    );
  });

  app.post("/api/customer/favorites", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const ip = req.ip || "unknown";
    if (rateLimit(`fav:${ip}`, 30, 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek." });
    }
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: "productId gerekli" });
    await storage.addCustomerFavorite({ customerId, productId: Number(productId) });
    const favoriteIds = await storage.getCustomerFavoriteIds(customerId);
    res.json(favoriteIds);
  });

  app.delete("/api/customer/favorites/:productId", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const productId = parseInt(String(req.params.productId));
    await storage.removeCustomerFavorite(customerId, productId);
    const favoriteIds = await storage.getCustomerFavoriteIds(customerId);
    res.json(favoriteIds);
  });

  app.post("/api/customer/favorites/sync", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const ip = req.ip || "unknown";
    if (rateLimit(`favsync:${ip}`, 20, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek." });
    }
    const { productIds } = req.body;
    if (Array.isArray(productIds)) {
      const safeIds = productIds.filter(pid => typeof pid === "number" || (typeof pid === "string" && /^\d+$/.test(pid))).slice(0, 100);
      for (const pid of safeIds) {
        await storage.addCustomerFavorite({ customerId, productId: Number(pid) });
      }
    }
    const favoriteIds = await storage.getCustomerFavoriteIds(customerId);
    res.json(favoriteIds);
  });

  app.get("/api/customer/addresses", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const addresses = await storage.getCustomerAddresses(customerId);
    res.json(addresses);
  });

  app.post("/api/customer/addresses", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const ip = req.ip || "unknown";
    if (rateLimit(`addr:${ip}`, 10, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
    }
    const existingAddrs = await storage.getCustomerAddresses(customerId);
    if (existingAddrs.length >= 10) {
      return res.status(400).json({ message: "En fazla 10 adres ekleyebilirsiniz." });
    }
    const schema = z.object({ label: z.string().min(1).max(50), address: z.string().min(1).max(500), isDefault: z.boolean().optional(), neighborhoodId: z.number().optional(), district: z.string().max(100).optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Geçersiz veri" });
    if (parsed.data.isDefault) {
      await storage.setDefaultAddress(-1, customerId);
    }
    const addr = await storage.createCustomerAddress({
      customerId,
      label: parsed.data.label,
      address: parsed.data.address,
      isDefault: parsed.data.isDefault || false,
      neighborhoodId: parsed.data.neighborhoodId || null,
      district: parsed.data.district || null,
    });
    if (parsed.data.isDefault) {
      await storage.setDefaultAddress(addr.id, customerId);
    }
    const addresses = await storage.getCustomerAddresses(customerId);
    res.json(addresses);
  });

  app.patch("/api/customer/addresses/:id", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const id = parseInt(String(req.params.id));
    const schema = z.object({ label: z.string().min(1).optional(), address: z.string().min(1).optional(), isDefault: z.boolean().optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Geçersiz veri" });
    if (parsed.data.isDefault) {
      await storage.setDefaultAddress(id, customerId);
    }
    await storage.updateCustomerAddress(id, customerId, parsed.data);
    const addresses = await storage.getCustomerAddresses(customerId);
    res.json(addresses);
  });

  app.delete("/api/customer/addresses/:id", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const id = parseInt(String(req.params.id));
    await storage.deleteCustomerAddress(id, customerId);
    const addresses = await storage.getCustomerAddresses(customerId);
    res.json(addresses);
  });

  app.get("/api/customer/pets", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const pets = await storage.getPetProfiles(customerId);
    res.json(pets);
  });

  app.post("/api/customer/pets", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const ip = req.ip || "unknown";
    if (rateLimit(`pets:${ip}`, 10, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
    }
    const schema = z.object({ name: z.string().min(1).max(50), type: z.string().min(1).max(30), breed: z.string().max(50).optional(), age: z.number().min(0).max(50).optional(), weight: z.number().min(0).max(200).optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Geçersiz veri" });
    await storage.createPetProfile({ customerId, ...parsed.data });
    const pets = await storage.getPetProfiles(customerId);
    res.json(pets);
  });

  app.patch("/api/customer/pets/:id", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const id = parseInt(String(req.params.id));
    const schema = z.object({ name: z.string().min(1).optional(), type: z.string().min(1).optional(), breed: z.string().optional(), age: z.number().optional(), weight: z.number().optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Geçersiz veri" });
    await storage.updatePetProfile(id, customerId, parsed.data);
    const pets = await storage.getPetProfiles(customerId);
    res.json(pets);
  });

  app.delete("/api/customer/pets/:id", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const id = parseInt(String(req.params.id));
    await storage.deletePetProfile(id, customerId);
    const pets = await storage.getPetProfiles(customerId);
    res.json(pets);
  });

  app.get("/api/customer-lookup", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const customer = await storage.getCustomer(customerId);
    if (!customer) return res.json(null);
    const matched = await storage.getOrdersByPhone(customer.phone);
    if (matched.length === 0) return res.json(null);
    const latest = matched[0];
    res.json({
      customerName: latest.customerName || "",
      customerAddress: latest.customerAddress || "",
    });
  });

  app.get("/api/orders/track", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const customer = await storage.getCustomer(customerId);
    if (!customer) return res.json([]);
    const matched = await storage.getOrdersByPhone(customer.phone);
    const safeOrders = matched.map(o => ({
      id: o.id,
      items: o.items,
      grandTotal: o.grandTotal,
      status: o.status,
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt,
    }));
    res.json(safeOrders);
  });

  app.get("/api/breed-stats/:productId", async (req, res) => {
    const productId = parseInt(String(req.params.productId));
    const stats = await storage.getBreedStatsByProduct(productId);
    res.json(stats.sort((a, b) => a.sortOrder - b.sortOrder));
  });

  app.post("/api/admin/breed-stats", requireAdmin, async (req, res) => {
    const parsed = insertBreedStatSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    const stat = await storage.createBreedStat(parsed.data);
    res.status(201).json(stat);
  });

  app.delete("/api/admin/breed-stats/:id", requireAdmin, async (req, res) => {
    const id = parseInt(String(req.params.id));
    await storage.deleteBreedStat(id);
    res.json({ message: "Deleted" });
  });

  app.post("/api/stock-alerts", async (req, res) => {
    const ip = req.ip || "unknown";
    if (rateLimit(`stockalert:${ip}`, 10, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
    }
    const schema = z.object({
      productId: z.number(),
      customerName: z.string().min(1).max(100),
      phone: z.string().min(7).max(20),
      productName: z.string().max(300),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    const alert = await storage.createStockAlert(parsed.data);
    res.status(201).json(alert);
  });

  app.get("/api/admin/stock-alerts", requireAdmin, async (_req, res) => {
    const alerts = await storage.getAllStockAlerts();
    res.json(alerts);
  });

  app.post("/api/admin/stock-alerts/:productId/notify", requireAdmin, async (req, res) => {
    const productId = parseInt(String(req.params.productId));
    const pending = await storage.getUnnotifiedStockAlerts(productId);
    if (pending.length === 0) return res.json({ message: "Bildirilecek kişi yok", notified: 0, contacts: [] });
    await storage.markStockAlertsNotified(productId);
    const contacts = pending.map(a => ({ name: a.customerName, phone: a.phone, productName: a.productName }));
    res.json({ message: `${contacts.length} kişi bildirildi`, notified: contacts.length, contacts });
  });

  app.get("/api/installment-rates", async (_req, res) => {
    const rates = await storage.getActiveInstallmentRates();
    res.json(rates);
  });

  app.get("/api/admin/installment-rates", requireAdmin, async (_req, res) => {
    const rates = await storage.getAllInstallmentRates();
    res.json(rates);
  });

  app.post("/api/admin/installment-rates", requireAdmin, async (req, res) => {
    const schema = z.object({
      months: z.number().min(1).max(36),
      rate: z.number().min(0).max(100),
      isActive: z.boolean().optional(),
      sortOrder: z.number().optional(),
      noInterest: z.boolean().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    const rate = await storage.createInstallmentRate(parsed.data as any);
    res.status(201).json(rate);
  });

  app.patch("/api/admin/installment-rates/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id as string);
    const schema = z.object({
      months: z.number().min(1).max(36).optional(),
      rate: z.number().min(0).max(100).optional(),
      isActive: z.boolean().optional(),
      sortOrder: z.number().optional(),
      noInterest: z.boolean().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    const rate = await storage.updateInstallmentRate(id, parsed.data as any);
    if (!rate) return res.status(404).json({ message: "Not found" });
    res.json(rate);
  });

  app.delete("/api/admin/installment-rates/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id as string);
    await storage.deleteInstallmentRate(id);
    res.json({ message: "Deleted" });
  });


  app.post("/api/admin/migrate-disk-images", requireAdmin, async (req, res) => {
    res.json({ message: "Disk resimlerinin DB'ye aktarımı başlatıldı" });
    
    const fs = await import("fs");
    const pathMod = await import("path");
    
    const imageDirs = [
      pathMod.default.join(process.cwd(), "dist", "public", "product-images"),
      pathMod.default.join(process.cwd(), "client", "public", "product-images"),
    ].filter(d => fs.existsSync(d));
    
    const products = await storage.getAllProducts();
    let migrated = 0;
    let skipped = 0;
    let failed = 0;
    
    for (const product of products) {
      if (product.img?.startsWith("/api/product-image/")) {
        const hasImg = await (await import("./image-service")).hasProductImage(product.id);
        if (hasImg) { skipped++; continue; }
      }
      
      let buffer: Buffer | null = null;
      const filename = `product-${product.id}.webp`;
      for (const dir of imageDirs) {
        const filePath = pathMod.default.join(dir, filename);
        if (fs.existsSync(filePath)) {
          buffer = fs.readFileSync(filePath);
          break;
        }
      }
      
      if (buffer) {
        try {
          const imgPath = await (await import("./image-service")).saveProductImage(buffer, product.id);
          await storage.updateProduct(product.id, { img: imgPath });
          migrated++;
        } catch (err: any) {
          console.log(`[migrate] Failed for product ${product.id}: ${err.message}`);
          failed++;
        }
      } else if (product.img?.startsWith("http") || product.originalImg) {
        const url = product.originalImg || product.img;
        if (url) {
          const imgPath = await (await import("./image-service")).downloadAndSaveImage(url, product.id);
          if (imgPath) {
            await storage.updateProduct(product.id, { img: imgPath });
            migrated++;
          } else {
            failed++;
          }
          await new Promise(r => setTimeout(r, 200));
        }
      } else {
        skipped++;
      }
    }
    
    console.log(`[migrate] Complete: ${migrated} migrated, ${skipped} skipped, ${failed} failed`);
  });

  app.get("/api/campaign-items", async (req, res) => {
    try {
      // scope=all: admin paneli için tüm store'ların kampanyalarını döndür (host filtresi yok).
      const allScope = req.query.scope === "all";
      const store = publicStoreId(req);
      const storeFilter = allScope ? "" : "AND (ci.store = 'all' OR ci.store = $1)";
      const params = allScope ? [] : [store];
      const { rows } = await sharedPool.query(`
        SELECT ci.*, p.name, p.price, p.original_price, p.img, p.stock, p.is_active, p.skt, p.preorder_enabled,
          bc.animal,
          CASE WHEN ci.campaign_price IS NOT NULL THEN ci.campaign_price ELSE p.price END AS display_price
        FROM campaign_items ci
        JOIN products p ON p.id = ci.product_id
        LEFT JOIN brand_categories bc ON bc.id = p.brand_category_id
        WHERE ci.is_active = true AND p.is_active = true ${storeFilter}
        ORDER BY ci.item_type, ci.sort_order
      `, params);
      const mapped = rows.map(r => ({
        ...r,
        original_price: r.campaign_price ? r.price : r.original_price,
        price: r.campaign_price ? parseFloat(r.campaign_price) : r.price,
      }));
      res.json(mapped);
    } catch (err) {
      res.status(500).json({ message: "Campaign items fetch error" });
    }
  });

  app.get("/api/campaign-check/:productId", async (req, res) => {
    try {
      const pid = parseInt(String(req.params.productId));
      const store = publicStoreId(req);
      const { rows } = await sharedPool.query(
        `SELECT item_type, campaign_price FROM campaign_items WHERE product_id = $1 AND is_active = true AND (store = 'all' OR store = $2) LIMIT 1`,
        [pid, store]
      );
      if (rows.length > 0) {
        res.json({ isCampaign: true, itemType: rows[0].item_type, campaignPrice: rows[0].campaign_price ? parseFloat(rows[0].campaign_price) : null });
      } else {
        res.json({ isCampaign: false });
      }
    } catch {
      res.json({ isCampaign: false });
    }
  });

  app.post("/api/admin/campaign-items", requireAdmin, async (req, res) => {
    try {
      const { productId, itemType, sortOrder, parentProductId, campaignPrice } = req.body;
      if (!productId || !itemType) return res.status(400).json({ message: "productId and itemType required" });
      const store = adminStoreId(req);
      const existing = await sharedPool.query(
        `SELECT id FROM campaign_items WHERE product_id = $1 AND store = $2`, [productId, store]
      );
      if (existing.rows.length > 0) {
        return res.status(400).json({ message: "Bu ürün zaten kampanyada" });
      }
      const { rows } = await sharedPool.query(
        `INSERT INTO campaign_items (product_id, item_type, sort_order, parent_product_id, campaign_price, store) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [productId, itemType, sortOrder || 0, parentProductId || null, campaignPrice || null, store]
      );
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ message: "Campaign item create error" });
    }
  });

  app.get("/api/reviews/:productId", async (req, res) => {
    const productId = parseInt(String(req.params.productId));
    if (isNaN(productId)) return res.status(400).json({ message: "Geçersiz ID" });
    const reviews = await db.select().from(productReviews).where(and(eq(productReviews.productId, productId), eq(productReviews.isPublished, true))).orderBy(desc(productReviews.helpfulCount));
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json(reviews);
  });

  app.post("/api/reviews/:productId", async (req, res) => {
    const productId = parseInt(String(req.params.productId));
    if (isNaN(productId)) return res.status(400).json({ message: "Geçersiz ID" });
    const schema = z.object({
      reviewerName: z.string().min(1).max(100),
      rating: z.number().int().min(1).max(5),
      comment: z.string().min(10).max(2000),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Geçersiz veri", errors: parsed.error.errors });
    const reviewDate = new Date().toLocaleDateString("tr-TR");
    const [review] = await db.insert(productReviews).values({
      productId,
      reviewerName: parsed.data.reviewerName,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      helpfulCount: 0,
      reviewDate,
      isPublished: false,
    }).returning();
    res.status(201).json({ ok: true, id: review.id });
  });

  app.get("/api/admin/reviews", requireAdmin, async (req, res) => {
    const reviews = await db.select().from(productReviews).orderBy(desc(productReviews.createdAt));
    res.json(reviews);
  });

  app.post("/api/admin/reviews", requireAdmin, async (req, res) => {
    const schema = z.object({
      productId: z.number().int(),
      reviewerName: z.string().min(1).max(100),
      rating: z.number().int().min(1).max(5),
      comment: z.string().min(1).max(2000),
      helpfulCount: z.number().int().min(0).default(0),
      reviewDate: z.string().min(1).max(50),
      isPublished: z.boolean().default(true),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Geçersiz veri", errors: parsed.error.errors });
    const [review] = await db.insert(productReviews).values(parsed.data).returning();
    res.status(201).json(review);
  });

  app.patch("/api/admin/reviews/:id", requireAdmin, async (req, res) => {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) return res.status(400).json({ message: "Geçersiz ID" });
    const patchSchema = z.object({
      productId: z.number().int().optional(),
      reviewerName: z.string().min(1).max(100).optional(),
      rating: z.number().int().min(1).max(5).optional(),
      comment: z.string().min(1).max(2000).optional(),
      helpfulCount: z.number().int().min(0).optional(),
      reviewDate: z.string().min(1).max(50).optional(),
      isPublished: z.boolean().optional(),
    });
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Geçersiz veri", errors: parsed.error.errors });
    const safeBody = parsed.data;
    if (Object.keys(safeBody).length === 0) return res.status(400).json({ message: "Güncellenecek alan yok" });
    const [updated] = await db.update(productReviews).set(safeBody).where(eq(productReviews.id, id)).returning();
    if (!updated) return res.status(404).json({ message: "Yorum bulunamadı" });
    res.json(updated);
  });

  app.delete("/api/admin/reviews/:id", requireAdmin, async (req, res) => {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) return res.status(400).json({ message: "Geçersiz ID" });
    await db.delete(productReviews).where(eq(productReviews.id, id));
    res.json({ message: "Silindi" });
  });

  app.get("/api/admin/campaign-items", requireAdmin, async (req, res) => {
    try {
      const { rows } = await sharedPool.query(`
        SELECT ci.*, ci.campaign_price, p.name, p.price, p.original_price, p.img, p.stock, p.is_active AS product_active, p.skt
        FROM campaign_items ci
        JOIN products p ON p.id = ci.product_id
        ORDER BY ci.item_type, ci.sort_order
      `);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ message: "Admin campaign items fetch error" });
    }
  });

  app.patch("/api/admin/campaign-items/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(String(req.params.id));
      if (await blockedByStoreContext(req, res, "campaign_items", id)) return;
      const { isActive, sortOrder, itemType, campaignPrice } = req.body;
      const sets: string[] = [];
      const vals: any[] = [];
      let idx = 1;
      if (typeof isActive === "boolean") { sets.push(`is_active = $${idx++}`); vals.push(isActive); }
      if (typeof sortOrder === "number") { sets.push(`sort_order = $${idx++}`); vals.push(sortOrder); }
      if (typeof itemType === "string") { sets.push(`item_type = $${idx++}`); vals.push(itemType); }
      if (campaignPrice !== undefined) { sets.push(`campaign_price = $${idx++}`); vals.push(campaignPrice === "" || campaignPrice === null ? null : campaignPrice); }
      if (req.body.store !== undefined && isValidStore(req.body.store)) { sets.push(`store = $${idx++}`); vals.push(String(req.body.store)); }
      if (sets.length === 0) return res.status(400).json({ message: "No fields to update" });
      vals.push(id);
      const { rows } = await sharedPool.query(
        `UPDATE campaign_items SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`,
        vals
      );
      if (rows.length === 0) return res.status(404).json({ message: "Not found" });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ message: "Campaign item update error" });
    }
  });

  app.delete("/api/admin/campaign-items/:id", requireAdmin, async (req, res) => {
    try {
      if (await blockedByStoreContext(req, res, "campaign_items", parseInt(String(req.params.id)))) return;
      const r = await sharedPool.query(
        `SELECT product_id, item_type FROM campaign_items WHERE id = $1`,
        [req.params.id]
      );
      const row = r.rows[0];
      await sharedPool.query(`DELETE FROM campaign_items WHERE id = $1`, [req.params.id]);
      let cascadedExtras = 0;
      if (row && row.item_type === "main") {
        const del = await sharedPool.query(
          `DELETE FROM campaign_items WHERE item_type = 'extra' AND parent_product_id = $1`,
          [row.product_id]
        );
        cascadedExtras = del.rowCount || 0;
      }
      res.json({ ok: true, cascadedExtras });
    } catch (err) {
      res.status(500).json({ message: "Campaign item delete error" });
    }
  });

  app.post("/api/admin/campaign-items/quick-create", requireAdmin, upload.single("image"), async (req, res) => {
    try {
      const name = String(req.body.name || "").trim();
      const campaignPrice = parseFloat(req.body.campaignPrice);
      const originalPriceRaw = req.body.originalPrice ? parseFloat(req.body.originalPrice) : null;
      const skt = req.body.skt ? String(req.body.skt).trim() : null;
      const stock = req.body.stock !== undefined ? parseInt(String(req.body.stock)) : 0;
      const barcode = req.body.barcode ? String(req.body.barcode).trim() : null;
      const itemType = (req.body.itemType === "extra" ? "extra" : "main") as "main" | "extra";
      const sortOrder = req.body.sortOrder ? parseInt(String(req.body.sortOrder)) : 1;
      const parentProductId = req.body.parentProductId ? parseInt(String(req.body.parentProductId)) : null;

      if (!name) return res.status(400).json({ message: "Ürün adı gerekli" });
      if (!campaignPrice || campaignPrice <= 0) return res.status(400).json({ message: "Geçerli kampanya fiyatı gerekli" });

      let kampCat = (await storage.getAllBrandCategories()).find(
        c => c.animal === "kampanya" && c.subcategory === "kampanya"
      );
      if (!kampCat) {
        const [created] = await db.insert(brandCategories).values({
          brandName: "Kampanya",
          brandSlug: "kampanya",
          animal: "kampanya",
          subcategory: "kampanya",
        }).returning();
        kampCat = created;
      }

      const product = await storage.createProduct({
        name,
        price: campaignPrice,
        originalPrice: originalPriceRaw && originalPriceRaw > campaignPrice ? originalPriceRaw : null,
        skt,
        img: null,
        originalImg: null,
        brandCategoryId: kampCat!.id,
        isActive: true,
        stock: isNaN(stock) ? 0 : stock,
        barcode,
        costPrice: null,
        mamaType: null,
        preorderEnabled: false,
      });

      if (req.file && req.file.mimetype.startsWith("image/")) {
        try {
          const imgPath = await saveProductImage(req.file.buffer, product.id);
          await storage.updateProduct(product.id, { img: imgPath });
        } catch (e: any) {
          console.error("[campaign quick-create] image save failed:", e?.message);
        }
      }

      const { rows } = await sharedPool.query(
        `INSERT INTO campaign_items (product_id, item_type, sort_order, parent_product_id, campaign_price, store)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [product.id, itemType, sortOrder, itemType === "extra" ? parentProductId : null, campaignPrice, adminStoreId(req)]
      );

      res.status(201).json({ product, campaignItem: rows[0] });
    } catch (err: any) {
      console.error("[/api/admin/campaign-items/quick-create] error:", err?.message, err?.stack);
      res.status(500).json({ message: "Hızlı kampanya ürünü oluşturulamadı", detail: err?.message });
    }
  });

  app.post("/api/admin/campaign-items/cleanup-orphans", requireAdmin, async (_req, res) => {
    try {
      const del = await sharedPool.query(`
        DELETE FROM campaign_items ci
        WHERE ci.item_type = 'extra'
          AND (
            ci.parent_product_id IS NULL
            OR NOT EXISTS (
              SELECT 1 FROM campaign_items m
              WHERE m.item_type = 'main'
                AND m.is_active = true
                AND m.product_id = ci.parent_product_id
            )
          )
      `);
      res.json({ ok: true, deleted: del.rowCount || 0 });
    } catch (err) {
      res.status(500).json({ message: "Cleanup error" });
    }
  });

  app.get("/api/delivery-neighborhoods", async (req, res) => {
    try {
      const store = publicStoreId(req);
      const neighborhoods = await storage.getActiveDeliveryNeighborhoods();
      res.json(neighborhoods.filter((n: any) => (n.store || "all") === "all" || n.store === store));
    } catch (err) {
      res.status(500).json({ message: "Delivery neighborhoods fetch error" });
    }
  });

  app.get("/api/admin/delivery-neighborhoods", requireAdmin, async (_req, res) => {
    try {
      const neighborhoods = await storage.getAllDeliveryNeighborhoods();
      res.json(neighborhoods);
    } catch (err) {
      res.status(500).json({ message: "Delivery neighborhoods fetch error" });
    }
  });

  app.post("/api/admin/delivery-neighborhoods", requireAdmin, async (req, res) => {
    try {
      const { district, name, distance, minOrder, shippingFee, freeShippingLimit, isActive, sortOrder } = req.body;
      if (!name || typeof name !== "string") {
        return res.status(400).json({ message: "Mahalle adı gerekli" });
      }
      const nh = await storage.createDeliveryNeighborhood({
        district: (district || "Atakum").trim(),
        name: name.trim(),
        distance: distance ? parseFloat(distance) : null,
        minOrder: parseFloat(minOrder) || 700,
        shippingFee: parseFloat(shippingFee) || 89,
        freeShippingLimit: parseFloat(freeShippingLimit) || 2000,
        isActive: isActive !== false,
        sortOrder: parseInt(sortOrder) || 0,
        store: adminStoreId(req),
      });
      res.json(nh);
    } catch (err) {
      res.status(500).json({ message: "Delivery neighborhood create error" });
    }
  });

  app.patch("/api/admin/delivery-neighborhoods/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(String(req.params.id));
      if (await blockedByStoreContext(req, res, "delivery_neighborhoods", id)) return;
      const updates: Record<string, any> = {};
      if (req.body.district !== undefined) updates.district = req.body.district.trim();
      if (req.body.name !== undefined) updates.name = req.body.name.trim();
      if (req.body.distance !== undefined) updates.distance = req.body.distance !== null ? parseFloat(req.body.distance) : null;
      if (req.body.minOrder !== undefined) updates.minOrder = parseFloat(req.body.minOrder);
      if (req.body.shippingFee !== undefined) updates.shippingFee = parseFloat(req.body.shippingFee);
      if (req.body.freeShippingLimit !== undefined) updates.freeShippingLimit = parseFloat(req.body.freeShippingLimit);
      if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;
      if (req.body.sortOrder !== undefined) updates.sortOrder = parseInt(req.body.sortOrder);
      if (req.body.store !== undefined && isValidStore(req.body.store)) updates.store = String(req.body.store);
      const updated = await storage.updateDeliveryNeighborhood(id, updates);
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Delivery neighborhood update error" });
    }
  });

  app.delete("/api/admin/delivery-neighborhoods/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(String(req.params.id));
      if (await blockedByStoreContext(req, res, "delivery_neighborhoods", id)) return;
      await storage.deleteDeliveryNeighborhood(id);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ message: "Delivery neighborhood delete error" });
    }
  });

  app.get("/api/admin/dashboard-stats", requireAdmin, async (_req, res) => {
    try {
      const allOrders = await storage.getAllOrders();
      const allProducts = await storage.getAllProducts();
      const allCustomers = await storage.getAllCustomers();
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - 7);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= todayStart);
      const weekOrders = allOrders.filter(o => new Date(o.createdAt) >= weekStart);
      const monthOrders = allOrders.filter(o => new Date(o.createdAt) >= monthStart);

      const sum = (arr: typeof allOrders) => arr.reduce((s, o) => s + (o.grandTotal || 0), 0);
      const completed = (arr: typeof allOrders) => arr.filter(o => o.status === "tamamlandi");
      const pending = (arr: typeof allOrders) => arr.filter(o => o.status === "yeni" || o.status === "onaylandi" || o.status === "hazirlaniyor");

      const lowStockProducts = allProducts.filter(p => p.stock <= 3 && p.isActive);

      const productSales: Record<number, { name: string; qty: number; revenue: number }> = {};
      for (const order of allOrders) {
        if (order.status === "iptal") continue;
        for (const item of order.items as any[]) {
          const pid = Number(item.productId);
          if (!productSales[pid]) productSales[pid] = { name: item.name, qty: 0, revenue: 0 };
          productSales[pid].qty += item.quantity;
          productSales[pid].revenue += item.price * item.quantity;
        }
      }
      const topProducts = Object.entries(productSales)
        .map(([id, d]) => ({ id: Number(id), ...d }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      const last30 = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(todayStart);
        d.setDate(d.getDate() - (29 - i));
        return d;
      });
      const dailyRevenue = last30.map(day => {
        const nextDay = new Date(day);
        nextDay.setDate(nextDay.getDate() + 1);
        const dayOrders = allOrders.filter(o => {
          const t = new Date(o.createdAt);
          return t >= day && t < nextDay && o.status !== "iptal";
        });
        return { date: day.toISOString().split("T")[0], revenue: sum(dayOrders), count: dayOrders.length };
      });

      const avg = (arr: typeof allOrders) => arr.length > 0 ? sum(arr) / arr.length : 0;

      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      const yesterdayOrders = allOrders.filter(o => { const t = new Date(o.createdAt); return t >= yesterdayStart && t < todayStart; });
      const prevWeekStart = new Date(weekStart);
      prevWeekStart.setDate(prevWeekStart.getDate() - 7);
      const prevWeekOrders = allOrders.filter(o => { const t = new Date(o.createdAt); return t >= prevWeekStart && t < weekStart; });

      const customerOrderMap: Record<string, { phone: string; name: string; id: number; total: number; count: number; lastDate: Date | null }> = {};
      for (const c of allCustomers) {
        customerOrderMap[c.phone] = { phone: c.phone, name: c.name, id: c.id, total: 0, count: 0, lastDate: null };
      }
      for (const o of allOrders) {
        if (o.status === "iptal") continue;
        if (!o.customerPhone) continue;
        const entry = customerOrderMap[o.customerPhone];
        if (entry) {
          entry.total += o.grandTotal || 0;
          entry.count += 1;
          const d = new Date(o.createdAt);
          if (!entry.lastDate || d > entry.lastDate) entry.lastDate = d;
        }
      }
      const custEntries = Object.values(customerOrderMap);
      const vipThreshold = 3000;
      const dormantDays = 30;
      const nowMs = now.getTime();
      const vipCustomers = custEntries.filter(c => c.total >= vipThreshold).sort((a, b) => b.total - a.total);
      const dormantCustomers = custEntries.filter(c => {
        if (!c.lastDate) return c.count === 0;
        return (nowMs - c.lastDate.getTime()) / (1000 * 60 * 60 * 24) > dormantDays;
      }).sort((a, b) => {
        const aD = a.lastDate ? (nowMs - a.lastDate.getTime()) : Infinity;
        const bD = b.lastDate ? (nowMs - b.lastDate.getTime()) : Infinity;
        return bD - aD;
      });
      const riskyCustomers = (() => {
        const cancelMap: Record<string, number> = {};
        for (const o of allOrders) {
          if (o.status === "iptal" && o.customerPhone) cancelMap[o.customerPhone] = (cancelMap[o.customerPhone] || 0) + 1;
        }
        return custEntries.filter(c => (cancelMap[c.phone] || 0) >= 2).map(c => ({ ...c, cancellations: cancelMap[c.phone] || 0 }));
      })();

      res.json({
        today: { orders: todayOrders.length, revenue: Math.round(sum(todayOrders) * 100) / 100, avgBasket: Math.round(avg(todayOrders) * 100) / 100 },
        yesterday: { orders: yesterdayOrders.length, revenue: Math.round(sum(yesterdayOrders) * 100) / 100 },
        week: { orders: weekOrders.length, revenue: Math.round(sum(weekOrders) * 100) / 100, avgBasket: Math.round(avg(weekOrders) * 100) / 100 },
        prevWeek: { orders: prevWeekOrders.length, revenue: Math.round(sum(prevWeekOrders) * 100) / 100 },
        month: { orders: monthOrders.length, revenue: Math.round(sum(monthOrders) * 100) / 100, avgBasket: Math.round(avg(monthOrders) * 100) / 100 },
        total: { orders: allOrders.length, revenue: Math.round(sum(allOrders) * 100) / 100, customers: allCustomers.length, products: allProducts.filter(p => p.isActive).length },
        pending: pending(allOrders).length,
        completed: completed(allOrders).length,
        lowStockProducts,
        topProducts,
        dailyRevenue,
        segments: {
          vip: vipCustomers.slice(0, 30).map(c => ({ id: c.id, name: c.name, phone: c.phone, total: Math.round(c.total), count: c.count, lastDate: c.lastDate })),
          dormant: dormantCustomers.slice(0, 30).map(c => ({ id: c.id, name: c.name, phone: c.phone, total: Math.round(c.total), count: c.count, lastDate: c.lastDate, daysSince: c.lastDate ? Math.floor((nowMs - c.lastDate.getTime()) / (1000 * 60 * 60 * 24)) : null })),
          risky: riskyCustomers.slice(0, 30).map(c => ({ id: c.id, name: c.name, phone: c.phone, total: Math.round(c.total), count: c.count, cancellations: c.cancellations })),
          vipCount: vipCustomers.length,
          dormantCount: dormantCustomers.length,
          riskyCount: riskyCustomers.length,
        },
      });
    } catch (err) {
      res.status(500).json({ message: "Dashboard stats error" });
    }
  });

  app.get("/api/admin/customers", requireAdmin, async (_req, res) => {
    try {
      const allCustomers = await storage.getAllCustomers();
      const allOrders = await storage.getAllOrders();
      const allAddresses = await sharedPool.query("SELECT * FROM customer_addresses ORDER BY id DESC");
      const addressMap = new Map<number, any[]>();
      for (const a of allAddresses.rows) {
        const list = addressMap.get(a.customer_id) || [];
        list.push(a);
        addressMap.set(a.customer_id, list);
      }
      const result = allCustomers.map(c => {
        const customerOrders = allOrders.filter(o => o.customerPhone === c.phone);
        const totalSpent = customerOrders.reduce((s, o) => s + (o.grandTotal || 0), 0);
        return {
          id: c.id, phone: c.phone, name: c.name, address: c.address,
          email: c.email,
          createdAt: c.createdAt,
          isBlacklisted: c.isBlacklisted,
          blacklistReason: c.blacklistReason,
          orderCount: customerOrders.length,
          totalSpent: Math.round(totalSpent * 100) / 100,
          lastOrder: customerOrders.length > 0 ? customerOrders[0].createdAt : null,
          addresses: (addressMap.get(c.id) || []).map(a => ({ id: a.id, label: a.label, address: a.address, district: a.district })),
          orders: customerOrders.slice(0, 20).map(o => ({
            id: o.id,
            createdAt: o.createdAt,
            grandTotal: o.grandTotal,
            status: o.status,
            itemCount: Array.isArray(o.items) ? o.items.length : 0,
            paymentMethod: o.paymentMethod,
          })),
        };
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Customers fetch error" });
    }
  });

  app.patch("/api/admin/customers/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(String(req.params.id));
      const { name, address } = req.body;
      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (address !== undefined) updates.address = address;
      const updated = await storage.updateCustomer(id, updates);
      if (!updated) return res.status(404).json({ message: "Müşteri bulunamadı" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Customer update error" });
    }
  });

  app.post("/api/admin/impersonate/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) return res.status(400).json({ message: "Geçersiz müşteri ID" });
      const customer = await storage.getCustomer(id);
      if (!customer) return res.status(404).json({ message: "Müşteri bulunamadı" });
      (req.session as any).customerId = customer.id;
      (req.session as any).adminImpersonating = true;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Oturum kaydedilemedi" });
        }
        res.json({ success: true, phone: customer.phone, name: customer.name });
      });
    } catch (err) {
      res.status(500).json({ message: "Impersonation error" });
    }
  });

  app.delete("/api/admin/customers/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) return res.status(400).json({ message: "Geçersiz müşteri ID" });
      await storage.deleteCustomerAccount(id);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Customer delete error:", err);
      res.status(500).json({ message: err?.message || "Müşteri silme hatası" });
    }
  });

  app.post("/api/admin/send-sms", requireAdmin, async (req, res) => {
    try {
      const { phones, message } = req.body;
      if (!phones || !Array.isArray(phones) || phones.length === 0 || !message || typeof message !== "string") {
        return res.status(400).json({ message: "Telefon listesi ve mesaj gerekli" });
      }
      if (message.length > 300) {
        return res.status(400).json({ message: "Mesaj en fazla 300 karakter olabilir" });
      }
      const validPhones = phones
        .filter((p: any) => typeof p === "string" && /^\d{10,15}$/.test(p.replace(/\D/g, "")))
        .slice(0, 100);
      if (validPhones.length === 0) return res.status(400).json({ message: "Geçerli telefon numarası bulunamadı" });
      const smsHeader = await resolveSmsHeader(adminStoreId(req));
      let sent = 0, failed = 0;
      for (const phone of validPhones) {
        const ok = await sendSmsViaNetgsm(phone, message, smsHeader);
        if (ok) sent++;
        else failed++;
        await new Promise(r => setTimeout(r, 200));
      }
      res.json({ sent, failed, total: validPhones.length });
    } catch (err) {
      res.status(500).json({ message: "SMS gönderim hatası" });
    }
  });

  // ===== Yasaklı Numaralar (tüm siteler için global) =====
  app.get("/api/admin/banned-numbers", requireAdmin, async (_req, res) => {
    try {
      const list = await storage.getBannedNumbers();
      res.json(list);
    } catch {
      res.status(500).json({ message: "Listeleme hatası" });
    }
  });

  app.post("/api/admin/banned-numbers", requireAdmin, async (req, res) => {
    try {
      const phone = canonicalTrPhone(String(req.body?.phone || ""));
      if (!/^5\d{9}$/.test(phone)) {
        return res.status(400).json({ message: "Geçerli bir cep numarası giriniz (5XX XXX XX XX)." });
      }
      const reason = req.body?.reason ? String(req.body.reason).slice(0, 200) : null;
      const row = await storage.addBannedNumber({ phone, reason });
      res.json(row);
    } catch {
      res.status(500).json({ message: "Yasaklı numara eklenemedi" });
    }
  });

  app.delete("/api/admin/banned-numbers/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) return res.status(400).json({ message: "Geçersiz ID" });
      await storage.deleteBannedNumber(id);
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "Silme hatası" });
    }
  });

  app.get("/api/admin/banners", requireAdmin, async (_req, res) => {
    try {
      const all = await storage.getAllBanners();
      res.json(all);
    } catch (err) {
      res.status(500).json({ message: "Banners fetch error" });
    }
  });

  app.post("/api/abone", async (req, res) => {
    try {
      const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown";
      if (rateLimit(`abone:${ip}`, 5, 60 * 60 * 1000)) {
        return res.status(429).json({ message: "Çok fazla deneme. Lütfen daha sonra tekrar deneyin." });
      }
      const phoneRaw = String(req.body?.phone || "").replace(/\D/g, "");
      const phone = phoneRaw.startsWith("90") ? phoneRaw.slice(2) : phoneRaw;
      if (!/^5\d{9}$/.test(phone)) {
        return res.status(400).json({ message: "Geçerli bir cep numarası giriniz (5XX XXX XX XX)." });
      }
      const petType = String(req.body?.petType || "").toLowerCase();
      if (petType !== "kedi" && petType !== "kopek") {
        return res.status(400).json({ message: "Evcil hayvan seçimi gerekli." });
      }
      const sub = await storage.createSubscription({ phone, petType });
      res.json({ ok: true, id: sub.id });
    } catch (err) {
      console.error("Subscription create error:", err);
      res.status(500).json({ message: "Kayıt oluşturulamadı" });
    }
  });

  app.get("/api/admin/subscriptions", requireAdmin, async (_req, res) => {
    try {
      const list = await storage.getAllSubscriptions();
      res.json(list);
    } catch {
      res.status(500).json({ message: "Listeleme hatası" });
    }
  });

  app.patch("/api/admin/subscriptions/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(String(req.params.id));
      const status = String(req.body?.status || "");
      if (!["new", "contacted", "converted"].includes(status)) {
        return res.status(400).json({ message: "Geçersiz durum" });
      }
      await storage.updateSubscriptionStatus(id, status);
      res.json({ ok: true });
    } catch {
      res.status(500).json({ message: "Güncelleme hatası" });
    }
  });

  app.delete("/api/admin/subscriptions/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteSubscription(parseInt(String(req.params.id)));
      res.json({ ok: true });
    } catch {
      res.status(500).json({ message: "Silme hatası" });
    }
  });

  app.post("/api/admin/banners", requireAdmin, upload.single("image"), async (req, res) => {
    try {
      const { title, linkUrl, sortOrder, position, device } = req.body;
      if (!title) return res.status(400).json({ message: "Başlık gerekli" });
      const allowed = ["home_top", "home_below_category", "home_bottom_carousel", "campaign_top"];
      const pos = allowed.includes(position) ? position : "home_top";
      const allowedDevices = ["both", "mobile", "desktop"];
      const dev = allowedDevices.includes(device) ? device : "both";
      let imageData: string | undefined;
      if (req.file) {
        const sharp = (await import("sharp")).default;
        const dims = pos === "campaign_top" ? { w: 1000, h: 650 } : { w: 1600, h: 900 };
        const webp = await sharp(req.file.buffer)
          .resize(dims.w, dims.h, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();
        imageData = `data:image/webp;base64,${webp.toString("base64")}`;
      }
      const store = adminStoreId(req);
      const banner = await storage.createBanner({ title, linkUrl: linkUrl || null, imageData: imageData || null, sortOrder: parseInt(sortOrder || "0"), isActive: true, position: pos, device: dev, store });
      res.json(banner);
    } catch (err) {
      res.status(500).json({ message: "Banner oluşturma hatası" });
    }
  });

  app.get("/api/banners", async (req, res) => {
    try {
      const all = await storage.getAllBanners();
      const position = typeof req.query.position === "string" ? req.query.position : null;
      const store = publicStoreId(req);
      const active = all
        .filter((b: any) => b.isActive)
        .filter((b: any) => (b.store || "all") === "all" || b.store === store)
        .filter((b: any) => !position || (b.position || "home_top") === position)
        .sort((a: any, b: any) => a.sortOrder - b.sortOrder);
      res.set("Cache-Control", "no-store");
      res.json(active);
    } catch (err) {
      res.status(500).json({ message: "Banners fetch error" });
    }
  });

  app.patch("/api/admin/banners/:id", requireAdmin, upload.single("image"), async (req, res) => {
    try {
      const id = parseInt(String(req.params.id));
      if (await blockedByStoreContext(req, res, "banners", id)) return;
      const updates: any = {};
      if (req.body.title !== undefined) updates.title = req.body.title;
      if (req.body.linkUrl !== undefined) updates.linkUrl = req.body.linkUrl;
      if (req.body.isActive !== undefined) updates.isActive = req.body.isActive === true || req.body.isActive === "true";
      if (req.body.sortOrder !== undefined) updates.sortOrder = parseInt(req.body.sortOrder);
      const allowed = ["home_top", "home_below_category", "home_bottom_carousel", "campaign_top"];
      if (req.body.position !== undefined) {
        if (allowed.includes(req.body.position)) updates.position = req.body.position;
      }
      const allowedDevices = ["both", "mobile", "desktop"];
      if (req.body.device !== undefined && allowedDevices.includes(req.body.device)) {
        updates.device = req.body.device;
      }
      if (req.body.store !== undefined && isValidStore(req.body.store)) {
        updates.store = String(req.body.store);
      }
      if (req.file) {
        const sharp = (await import("sharp")).default;
        const effectivePos = updates.position || (await storage.getAllBanners()).find((b: any) => b.id === id)?.position || "home_top";
        const dims = effectivePos === "campaign_top" ? { w: 1000, h: 650 } : { w: 1600, h: 900 };
        const webp = await sharp(req.file.buffer)
          .resize(dims.w, dims.h, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();
        updates.imageData = `data:image/webp;base64,${webp.toString("base64")}`;
      }
      const updated = await storage.updateBanner(id, updates);
      if (!updated) return res.status(404).json({ message: "Banner bulunamadı" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Banner güncelleme hatası" });
    }
  });

  app.delete("/api/admin/banners/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(String(req.params.id));
      if (await blockedByStoreContext(req, res, "banners", id)) return;
      await storage.deleteBanner(id);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ message: "Banner silme hatası" });
    }
  });


  app.post("/api/admin/blacklist/:customerId", requireAdmin, async (req, res) => {
    const customerId = parseInt(String(req.params.customerId));
    const { reason } = req.body;
    await sharedPool.query("UPDATE customers SET is_blacklisted = true, blacklist_reason = $1 WHERE id = $2", [reason || "Belirtilmemiş", customerId]);
    res.json({ success: true });
  });

  app.post("/api/admin/unblacklist/:customerId", requireAdmin, async (req, res) => {
    const customerId = parseInt(String(req.params.customerId));
    await sharedPool.query("UPDATE customers SET is_blacklisted = false, blacklist_reason = NULL WHERE id = $1", [customerId]);
    res.json({ success: true });
  });

  app.get("/api/admin/blacklisted-customers", requireAdmin, async (_req, res) => {
    const result = await sharedPool.query("SELECT * FROM customers WHERE is_blacklisted = true ORDER BY name");
    res.json(result.rows);
  });

  app.get("/api/admin/reports", requireAdmin, async (_req, res) => {
    try {
      const allOrders = await storage.getAllOrders();
      const allProducts = await storage.getAllProducts();
      const allCustomers = await storage.getAllCustomers();
      const categories = await storage.getAllBrandCategories();
      const catMap = new Map(categories.map(c => [c.id, c]));

      const paymentMethods: Record<string, { count: number; total: number }> = {};
      const customerRanking: Record<string, { phone: string; name: string; total: number; count: number; cancelCount: number }> = {};

      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const dailyCiro: Record<string, number> = {};
      const weeklyCiroByMethod: Record<string, number> = {};
      let dailyTotal = 0;
      let weeklyTotal = 0;

      const productSales: Record<number, { name: string; quantity: number; revenue: number; cost: number }> = {};

      for (const order of allOrders) {
        if (order.customerPhone) {
          const key = order.customerPhone;
          if (!customerRanking[key]) customerRanking[key] = { phone: key, name: order.customerName || "", total: 0, count: 0, cancelCount: 0 };
          if (order.status === "iptal") {
            customerRanking[key].cancelCount++;
          }
        }

        if (order.status === "iptal") continue;

        const method = order.paymentMethod || "Bilinmiyor";
        if (!paymentMethods[method]) paymentMethods[method] = { count: 0, total: 0 };
        paymentMethods[method].count++;
        paymentMethods[method].total += order.grandTotal || 0;

        if (order.customerPhone) {
          const key = order.customerPhone;
          customerRanking[key].total += order.grandTotal || 0;
          customerRanking[key].count++;
        }

        const orderDate = new Date(order.createdAt);
        const orderDateStr = orderDate.toISOString().slice(0, 10);
        if (orderDateStr === todayStr) {
          dailyTotal += order.grandTotal || 0;
          dailyCiro[method] = (dailyCiro[method] || 0) + (order.grandTotal || 0);
        }
        if (orderDate >= weekAgo) {
          weeklyTotal += order.grandTotal || 0;
          weeklyCiroByMethod[method] = (weeklyCiroByMethod[method] || 0) + (order.grandTotal || 0);
        }

        const items = order.items as any[];
        if (items) {
          for (const item of items) {
            const pid = parseInt(String(item.productId));
            if (!productSales[pid]) productSales[pid] = { name: item.name || "", quantity: 0, revenue: 0, cost: 0 };
            productSales[pid].quantity += item.quantity || 1;
            productSales[pid].revenue += (item.price || 0) * (item.quantity || 1);
          }
        }
      }

      for (const [pid, ps] of Object.entries(productSales)) {
        const product = allProducts.find(p => p.id === parseInt(pid));
        if (product && product.originalPrice) {
          ps.cost = product.originalPrice * ps.quantity;
        } else if (product) {
          ps.cost = product.price * 0.7 * ps.quantity;
        }
      }

      const bestSellers = Object.entries(productSales)
        .map(([pid, data]) => ({
          productId: parseInt(pid),
          name: data.name,
          quantity: data.quantity,
          revenue: Math.round(data.revenue * 100) / 100,
          profit: Math.round((data.revenue - data.cost) * 100) / 100,
          marginPercent: data.revenue > 0 ? Math.round(((data.revenue - data.cost) / data.revenue) * 100) : 0,
        }))
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 20);

      const topCustomers = Object.values(customerRanking)
        .sort((a, b) => b.total - a.total)
        .slice(0, 15)
        .map(c => ({ ...c, total: Math.round(c.total * 100) / 100 }));

      const problemCustomers = Object.values(customerRanking)
        .filter(c => c.cancelCount >= 2)
        .sort((a, b) => b.cancelCount - a.cancelCount)
        .slice(0, 10);

      const statusCounts: Record<string, number> = {};
      for (const order of allOrders) {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      }

      const monthlyData: Record<string, { revenue: number; orders: number }> = {};
      const neighborhoodStats: Record<string, { count: number; total: number }> = {};
      for (const order of allOrders) {
        if (order.status === "iptal") continue;
        const month = new Date(order.createdAt).toISOString().slice(0, 7);
        if (!monthlyData[month]) monthlyData[month] = { revenue: 0, orders: 0 };
        monthlyData[month].revenue += order.grandTotal || 0;
        monthlyData[month].orders++;

        if (order.customerAddress) {
          const addr = order.customerAddress;
          const mahalleParts = addr.split(",");
          let mahalle = mahalleParts[0]?.trim();
          if (mahalle && mahalle.toLowerCase().includes("mah")) {
            if (!neighborhoodStats[mahalle]) neighborhoodStats[mahalle] = { count: 0, total: 0 };
            neighborhoodStats[mahalle].count++;
            neighborhoodStats[mahalle].total += order.grandTotal || 0;
          }
        }
      }

      const heatmapData = Object.entries(neighborhoodStats)
        .map(([name, data]) => {
          const maxCount = Math.max(...Object.values(neighborhoodStats).map(n => n.count), 1);
          return {
            name,
            count: data.count,
            total: Math.round(data.total * 100) / 100,
            intensity: Math.round((data.count / maxCount) * 100),
          };
        })
        .sort((a, b) => b.count - a.count);

      res.json({
        paymentMethods: Object.entries(paymentMethods).map(([method, data]) => ({
          method, ...data, total: Math.round(data.total * 100) / 100,
        })),
        topCustomers,
        problemCustomers,
        bestSellers,
        statusCounts,
        dailyCiro: {
          total: Math.round(dailyTotal * 100) / 100,
          byMethod: Object.entries(dailyCiro).map(([method, total]) => ({ method, total: Math.round(total * 100) / 100 })),
        },
        weeklyCiro: {
          total: Math.round(weeklyTotal * 100) / 100,
          byMethod: Object.entries(weeklyCiroByMethod).map(([method, total]) => ({ method, total: Math.round(total * 100) / 100 })),
        },
        monthlyData: Object.entries(monthlyData).map(([month, data]) => ({
          month, revenue: Math.round(data.revenue * 100) / 100, orders: data.orders,
        })).sort((a, b) => a.month.localeCompare(b.month)),
        totalCustomers: allCustomers.length,
        totalProducts: allProducts.filter(p => p.isActive).length,
        totalOrders: allOrders.length,
        neighborhoodStats: Object.entries(neighborhoodStats)
          .map(([name, data]) => ({ name, count: data.count, total: Math.round(data.total * 100) / 100 }))
          .sort((a, b) => b.total - a.total),
        heatmapData,
      });
    } catch (err: any) {
      console.error("[/api/admin/reports] error:", err?.message, err?.stack);
      res.status(500).json({ message: "Reports error", detail: err?.message });
    }
  });

  const petAI = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });

  app.post("/api/pet-ask", async (req: Request, res: Response) => {
    const ip = req.ip || "unknown";
    if (rateLimit(`petask:${ip}`, 5, 60 * 1000)) {
      return res.status(429).json({ error: "Çok fazla soru. Lütfen biraz bekleyin." });
    }
    if (rateLimit(`petask:global`, 100, 60 * 60 * 1000)) {
      return res.status(429).json({ error: "Sistem yoğun. Lütfen daha sonra tekrar deneyin." });
    }
    try {
      const { question } = req.body;
      if (!question || typeof question !== "string" || question.trim().length < 2 || question.trim().length > 500) {
        return res.status(400).json({ error: "Lütfen 2-500 karakter arası bir soru yazın" });
      }

      const completion = await petAI.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Sen Türkiye'de bir pet shop'un yapay zeka asistanısın. Sadece evcil hayvanlar (kedi, köpek, kuş, kemirgen, balık) hakkında sorulara cevap ver. Konular: beslenme, mama seçimi, sağlık, bakım, davranış, eğitim, veteriner tavsiyeleri. Cevapları Türkçe ver, kısa ve öz tut (max 3-4 cümle). Evcil hayvanla ilgili olmayan sorulara "Bu konuda yardımcı olamıyorum, sadece evcil hayvan bakımı hakkında sorular sorabilirsiniz." de. Asla ilaç dozu veya tedavi reçetesi verme, veterinere yönlendir.`
          },
          { role: "user", content: question.trim() }
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const answer = completion.choices[0]?.message?.content || "Üzgünüm, şu an cevap veremiyorum.";
      res.json({ answer });
    } catch (error: any) {
      console.error("Pet AI error:", error?.message || error);
      res.status(500).json({ error: "Yapay zeka şu an meşgul, lütfen tekrar deneyin." });
    }
  });

  app.post("/api/coupons/validate", async (req, res) => {
    const ip = req.ip || "unknown";
    if (rateLimit(`coupon:${ip}`, 15, 60 * 1000)) {
      return res.status(429).json({ valid: false, message: "Çok fazla deneme. Lütfen bekleyin." });
    }
    const { code, subtotal } = req.body;
    if (!code || typeof code !== "string" || code.length > 50) return res.status(400).json({ valid: false, message: "Kupon kodu gerekli" });
    const coupon = await storage.getCouponByCode(code, publicStoreId(req));
    if (!coupon || !coupon.isActive) return res.json({ valid: false, message: "Geçersiz kupon kodu" });
    const now = new Date();
    if (coupon.expiresAt && new Date(coupon.expiresAt) < now) return res.json({ valid: false, message: "Kupon kodunun süresi dolmuş" });
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return res.json({ valid: false, message: "Kupon kullanım limiti dolmuş" });
    if (coupon.customerId) {
      const customerId = (req.session as any)?.customerId;
      if (!customerId || customerId !== coupon.customerId) {
        return res.json({ valid: false, message: "Bu kupon size ait değil" });
      }
    }
    if (subtotal && subtotal < coupon.minOrderAmount) return res.json({ valid: false, message: `Minimum sipariş tutarı: ${coupon.minOrderAmount} TL` });
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = Math.round((subtotal || 0) * (coupon.discountValue / 100) * 100) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }
    res.json({
      valid: true,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      minOrderAmount: coupon.minOrderAmount,
      message: coupon.discountType === "percentage" ? `%${coupon.discountValue} indirim uygulandı` : `${coupon.discountValue} TL indirim uygulandı`,
    });
  });

  app.get("/api/admin/coupons", requireAdmin, async (_req, res) => {
    const all = await storage.getAllCoupons();
    res.json(all);
  });

  // ===== Ziyaretçi Takip Sistemi =====
  function detectVisitSource(referrer: string | null | undefined, utmSource: string | null | undefined): string {
    const u = (utmSource || "").toLowerCase().trim();
    const mapToken = (s: string): string | null => {
      if (s.includes("google")) return "Google";
      if (s.includes("youtube") || s.includes("youtu.be")) return "YouTube";
      if (s.includes("instagram") || s === "ig") return "Instagram";
      if (s.includes("facebook") || s.includes("fb.com") || s === "fb") return "Facebook";
      if (s.includes("tiktok")) return "TikTok";
      if (s.includes("twitter") || s === "t.co" || s === "x.com" || s === "x") return "Twitter/X";
      if (s.includes("whatsapp") || s.includes("wa.me")) return "WhatsApp";
      if (s.includes("bing")) return "Bing";
      if (s.includes("yandex")) return "Yandex";
      if (s.includes("linkedin")) return "LinkedIn";
      if (s.includes("pinterest")) return "Pinterest";
      if (s.includes("telegram") || s === "t.me") return "Telegram";
      if (s.includes("reddit")) return "Reddit";
      return null;
    };
    if (u) return mapToken(u) || (u.charAt(0).toUpperCase() + u.slice(1));
    const r = (referrer || "").trim();
    if (!r) return "Direkt";
    try {
      const host = new URL(r).hostname.replace(/^www\./, "").toLowerCase();
      if (host.includes("jetgomarket") || host.includes("enuygunpet") || host.includes("localhost") || host.includes("replit")) return "Direkt";
      return mapToken(host) || host;
    } catch {
      return "Direkt";
    }
  }

  function isPrivateIp(ip: string): boolean {
    return /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|127\.|169\.254\.|::1$|::ffff:127\.|fc|fd|fe80:)/i.test(ip);
  }

  // ISP/org adı bir veri merkezi / bulut sağlayıcısına işaret ediyorsa = bot/otomatik trafik.
  const CLOUD_ORG_RE = /\b(google|amazon|aws|microsoft|azure|facebook|meta|cloudflare|ovh|digitalocean|hetzner|linode|akamai|fastly|oracle|alibaba|tencent|leaseweb|vultr|m247|contabo|datacamp|scaleway|hosting|datacenter)\b/i;
  const UA_BOT_RE = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|crawler|headless|lighthouse|googlebot|applebot|yandex|baidu|semrush|ahrefs|petalbot|python-requests|axios|curl|wget|go-http|java\//i;

  function clientIpFrom(req: Request): string {
    // En soldaki public IP = gerçek ziyaretçi. Replit/GCP altyapısı X-Forwarded-For'a
    // sağdan proxy adımları ekler; req.ip (trust proxy=1) bir veri merkezi adımına
    // çözülebilir, bu yüzden zinciri soldan tarayıp ilk public IP'yi alıyoruz.
    const xff = (req.headers["x-forwarded-for"] as string) || "";
    const parts = xff.split(",").map((s) => s.trim().replace(/^::ffff:/, "")).filter(Boolean);
    for (const ip of parts) {
      if (ip && !isPrivateIp(ip)) return ip;
    }
    const fallback = (req.ip || "").replace(/^::ffff:/, "");
    return fallback || parts[0] || "unknown";
  }

  async function resolveVisitGeo(ip: string): Promise<{ city: string | null; region: string | null; country: string | null; isp: string | null; hosting: boolean } | null> {
    if (!ip || ip === "unknown") return null;
    if (isPrivateIp(ip)) {
      return { city: "Yerel Ağ", region: null, country: null, isp: null, hosting: false };
    }
    try {
      const cached = await sharedPool.query("SELECT city, region, country, isp, is_hosting FROM ip_geo_cache WHERE ip = $1", [ip]);
      if (cached.rows.length > 0) {
        const r = cached.rows[0];
        return { city: r.city, region: r.region, country: r.country, isp: r.isp, hosting: !!r.is_hosting };
      }
    } catch {}
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 4000);
      const resp = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city,isp,org,as,hosting,proxy&lang=tr`, { signal: controller.signal });
      clearTimeout(t);
      const d: any = await resp.json();
      if (d && d.status === "success") {
        const orgStr = `${d.isp || ""} ${d.org || ""} ${d.as || ""}`;
        const hosting = !!d.hosting || !!d.proxy || CLOUD_ORG_RE.test(orgStr);
        const geo = { city: d.city || null, region: d.regionName || null, country: d.country || null, isp: d.isp || d.org || null, hosting };
        try {
          await sharedPool.query(
            "INSERT INTO ip_geo_cache (ip, city, region, country, isp, is_hosting, resolved_at) VALUES ($1,$2,$3,$4,$5,$6,NOW()) ON CONFLICT (ip) DO UPDATE SET city=$2, region=$3, country=$4, isp=$5, is_hosting=$6, resolved_at=NOW()",
            [ip, geo.city, geo.region, geo.country, geo.isp, geo.hosting]
          );
        } catch {}
        return geo;
      }
    } catch {}
    return null;
  }

  // Ziyaret kaydı (public, sayfa açılışında çağrılır)
  app.post("/api/track/visit", async (req: Request, res: Response) => {
    res.status(204).end();
    try {
      const ua = String(req.headers["user-agent"] || "");
      const ip = clientIpFrom(req);
      const referrer = typeof req.body?.referrer === "string" ? req.body.referrer.slice(0, 500) : null;
      const utmSource = typeof req.body?.utmSource === "string" ? req.body.utmSource.slice(0, 100) : null;
      const path = typeof req.body?.path === "string" ? req.body.path.slice(0, 300) : null;
      if (path && /^\/admin/i.test(path)) return;
      const source = detectVisitSource(referrer, utmSource);
      const geo = await resolveVisitGeo(ip);
      // Bot/otomatik: bot user-agent VEYA veri merkezi/bulut IP'si (gerçek kullanıcı değil).
      const isBot = UA_BOT_RE.test(ua) || !!geo?.hosting;
      await sharedPool.query(
        "INSERT INTO site_visits (ip, source, referrer, path, city, region, country, isp, user_agent, is_bot) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
        [ip, source, referrer, path, geo?.city ?? null, geo?.region ?? null, geo?.country ?? null, geo?.isp ?? null, ua.slice(0, 300), isBot]
      );
    } catch (e) {
      console.error("track/visit error:", e);
    }
  });

  // Ziyaretçi raporu (admin) — günlük tarih seçimli
  app.get("/api/admin/visitors", requireAdmin, async (req: Request, res: Response) => {
    try {
      const isDate = (s: any): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
      const today = new Date().toISOString().slice(0, 10);
      let fromStr = isDate(req.query.from) ? (req.query.from as string) : isDate(req.query.date) ? (req.query.date as string) : today;
      let toStr = isDate(req.query.to) ? (req.query.to as string) : isDate(req.query.date) ? (req.query.date as string) : fromStr;
      if (fromStr > toStr) { const t = fromStr; fromStr = toStr; toStr = t; }
      // Range-based (sargable) so idx_site_visits_created is used. Istanbul-local
      // [from 00:00, to+1 00:00) converted to UTC instants for comparison.
      const dayFilter = "created_at >= ($1::date::timestamp AT TIME ZONE 'Europe/Istanbul') AND created_at < (($2::date + 1)::timestamp AT TIME ZONE 'Europe/Istanbul')";
      // Gerçek ziyaretçiler bot/veri merkezi trafiğinden ayrılır.
      const realFilter = `${dayFilter} AND is_bot = false`;
      const botFilter = `${dayFilter} AND is_bot = true`;
      const params = [fromStr, toStr];

      const summaryQ = await sharedPool.query(
        `SELECT COUNT(*)::int AS total_visits, COUNT(DISTINCT ip)::int AS unique_visitors FROM site_visits WHERE ${realFilter}`,
        params
      );
      const bySourceQ = await sharedPool.query(
        `SELECT source, COUNT(*)::int AS visits, COUNT(DISTINCT ip)::int AS uniques FROM site_visits WHERE ${realFilter} GROUP BY source ORDER BY visits DESC`,
        params
      );
      const byCityQ = await sharedPool.query(
        `SELECT COALESCE(NULLIF(city, ''), 'Bilinmiyor') AS city, region, COUNT(*)::int AS visits, COUNT(DISTINCT ip)::int AS uniques FROM site_visits WHERE ${realFilter} GROUP BY COALESCE(NULLIF(city, ''), 'Bilinmiyor'), region ORDER BY visits DESC LIMIT 50`,
        params
      );
      const recentQ = await sharedPool.query(
        `SELECT id, ip, source, city, region, country, isp, path, referrer, created_at FROM site_visits WHERE ${realFilter} ORDER BY created_at DESC LIMIT 200`,
        params
      );
      const hourlyQ = await sharedPool.query(
        `SELECT EXTRACT(HOUR FROM (created_at AT TIME ZONE 'Europe/Istanbul'))::int AS hour, COUNT(*)::int AS visits FROM site_visits WHERE ${realFilter} GROUP BY hour ORDER BY hour`,
        params
      );
      const botSummaryQ = await sharedPool.query(
        `SELECT COUNT(*)::int AS total_visits, COUNT(DISTINCT ip)::int AS unique_visitors FROM site_visits WHERE ${botFilter}`,
        params
      );
      const botByNameQ = await sharedPool.query(
        `SELECT COALESCE(NULLIF(isp, ''), source) AS name, COUNT(*)::int AS visits, COUNT(DISTINCT ip)::int AS uniques FROM site_visits WHERE ${botFilter} GROUP BY COALESCE(NULLIF(isp, ''), source) ORDER BY visits DESC LIMIT 50`,
        params
      );
      const botRecentQ = await sharedPool.query(
        `SELECT id, ip, source, isp, city, country, path, created_at FROM site_visits WHERE ${botFilter} ORDER BY created_at DESC LIMIT 100`,
        params
      );
      // Gerçek + bot birlikte, tek tek detay (is_bot ile işaretli).
      const allRecentQ = await sharedPool.query(
        `SELECT id, ip, source, city, region, country, isp, is_bot, path, referrer, created_at FROM site_visits WHERE ${dayFilter} ORDER BY created_at DESC LIMIT 300`,
        params
      );

      res.json({
        from: fromStr,
        to: toStr,
        summary: {
          totalVisits: summaryQ.rows[0]?.total_visits || 0,
          uniqueVisitors: summaryQ.rows[0]?.unique_visitors || 0,
          topSource: bySourceQ.rows[0]?.source || "-",
          topCity: byCityQ.rows[0]?.city || "-",
          botVisits: botSummaryQ.rows[0]?.total_visits || 0,
        },
        bySource: bySourceQ.rows,
        byCity: byCityQ.rows,
        hourly: hourlyQ.rows,
        recent: recentQ.rows,
        recentAll: allRecentQ.rows,
        bots: {
          total: botSummaryQ.rows[0]?.total_visits || 0,
          uniques: botSummaryQ.rows[0]?.unique_visitors || 0,
          byName: botByNameQ.rows,
          recent: botRecentQ.rows,
        },
      });
    } catch (e) {
      console.error("admin/visitors error:", e);
      res.status(500).json({ message: "Ziyaretçi verileri alınamadı" });
    }
  });

  // Ziyaretçi IP dışa aktarma (admin) — tarih aralıklı, sadece IP adresleri.
  // type=real|bot, format=xlsx|txt
  app.get("/api/admin/visitors/export", requireAdmin, async (req: Request, res: Response) => {
    try {
      const isDate = (s: any): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
      const today = new Date().toISOString().slice(0, 10);
      let fromStr = isDate(req.query.from) ? (req.query.from as string) : isDate(req.query.date) ? (req.query.date as string) : today;
      let toStr = isDate(req.query.to) ? (req.query.to as string) : isDate(req.query.date) ? (req.query.date as string) : fromStr;
      if (fromStr > toStr) { const t = fromStr; fromStr = toStr; toStr = t; }
      const type = req.query.type === "bot" ? "bot" : "real";
      const format = req.query.format === "txt" ? "txt" : "xlsx";

      const dayFilter = "created_at >= ($1::date::timestamp AT TIME ZONE 'Europe/Istanbul') AND created_at < (($2::date + 1)::timestamp AT TIME ZONE 'Europe/Istanbul')";
      const botCond = type === "bot" ? "is_bot = true" : "is_bot = false";
      const { rows } = await sharedPool.query(
        `SELECT ip, COUNT(*)::int AS visits FROM site_visits
         WHERE ${dayFilter} AND ${botCond} AND ip IS NOT NULL AND ip <> ''
         GROUP BY ip ORDER BY visits DESC, ip`,
        [fromStr, toStr]
      );
      const ips: string[] = (rows as any[]).map((r) => String(r.ip));
      const label = type === "bot" ? "bot" : "gercek";
      const base = `enuygun_${label}_ip_${fromStr}_${toStr}`;

      if (format === "txt") {
        res.setHeader("Content-Disposition", `attachment; filename=${base}.txt`);
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.send(ips.join("\n"));
        return;
      }

      const ExcelJS = (await import("exceljs")).default;
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet(type === "bot" ? "Bot IP" : "Gercek IP");
      ws.columns = [{ header: "IP", key: "ip", width: 24 }];
      for (const ip of ips) ws.addRow({ ip });
      const buf = await wb.xlsx.writeBuffer();
      res.setHeader("Content-Disposition", `attachment; filename=${base}.xlsx`);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.send(Buffer.from(buf));
    } catch (e) {
      console.error("admin/visitors export error:", e);
      res.status(500).json({ message: "Dışa aktarma başarısız" });
    }
  });

  app.post("/api/admin/coupons", requireAdmin, async (req, res) => {
    const schema = z.object({
      code: z.string().min(3),
      discountType: z.enum(["percentage", "fixed"]),
      discountValue: z.number().positive(),
      minOrderAmount: z.number().min(0).optional(),
      maxUses: z.number().positive().optional().nullable(),
      isActive: z.boolean().optional(),
      expiresAt: z.string().optional().nullable(),
      store: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Geçersiz veri" });
    const data: any = { ...parsed.data };
    if (data.expiresAt) data.expiresAt = new Date(data.expiresAt);
    else data.expiresAt = null;
    data.store = isValidStore(data.store) ? data.store : "all";
    const dup = await sharedPool.query(
      `SELECT id FROM coupons WHERE store = $1 AND upper(code) = upper($2) LIMIT 1`,
      [data.store, data.code]
    );
    if (dup.rows.length > 0) {
      return res.status(409).json({ message: "Bu kupon kodu bu mağaza için zaten mevcut" });
    }
    try {
      const coupon = await storage.createCoupon(data);
      res.status(201).json(coupon);
    } catch (e: any) {
      if (e?.code === "23505") return res.status(409).json({ message: "Bu kupon kodu bu mağaza için zaten mevcut" });
      throw e;
    }
  });

  app.patch("/api/admin/coupons/:id", requireAdmin, async (req, res) => {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) return res.status(400).json({ message: "Geçersiz ID" });
    if (await blockedByStoreContext(req, res, "coupons", id)) return;
    const allowedKeys = ["code", "discountType", "discountValue", "minOrderAmount", "maxUses", "isActive", "expiresAt", "customerId", "store"];
    const data: any = {};
    for (const key of allowedKeys) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }
    if (data.store !== undefined && !isValidStore(data.store)) delete data.store;
    if (data.expiresAt) data.expiresAt = new Date(data.expiresAt);
    else if (data.expiresAt === null) data.expiresAt = null;
    if (data.code !== undefined || data.store !== undefined) {
      const cur = await sharedPool.query(`SELECT code, store FROM coupons WHERE id = $1`, [id]);
      if (cur.rows.length === 0) return res.status(404).json({ message: "Kupon bulunamadı" });
      const newCode = data.code !== undefined ? String(data.code) : cur.rows[0].code;
      const newStore = data.store !== undefined ? String(data.store) : cur.rows[0].store;
      const dup = await sharedPool.query(
        `SELECT id FROM coupons WHERE store = $1 AND upper(code) = upper($2) AND id <> $3 LIMIT 1`,
        [newStore, newCode, id]
      );
      if (dup.rows.length > 0) {
        return res.status(409).json({ message: "Bu kupon kodu bu mağaza için zaten mevcut" });
      }
    }
    try {
      const updated = await storage.updateCoupon(id, data);
      if (!updated) return res.status(404).json({ message: "Kupon bulunamadı" });
      res.json(updated);
    } catch (e: any) {
      if (e?.code === "23505") return res.status(409).json({ message: "Bu kupon kodu bu mağaza için zaten mevcut" });
      throw e;
    }
  });

  app.delete("/api/admin/coupons/:id", requireAdmin, async (req, res) => {
    const id = parseInt(String(req.params.id));
    if (await blockedByStoreContext(req, res, "coupons", id)) return;
    await storage.deleteCoupon(id);
    res.json({ message: "Silindi" });
  });

  app.post("/api/contact-messages", async (req, res) => {
    try {
      const data = insertContactMessageSchema.parse(req.body);
      if (data.message.length > 2000 || data.name.length > 100 || data.phone.length > 30) {
        return res.status(400).json({ message: "Geçersiz veri uzunluğu" });
      }
      const created = await storage.createContactMessage(data);
      res.json(created);
    } catch (e: any) {
      res.status(400).json({ message: e?.message || "Geçersiz veri" });
    }
  });

  app.get("/api/admin/contact-messages", requireAdmin, async (_req, res) => {
    const list = await storage.getAllContactMessages();
    res.json(list);
  });

  app.get("/api/admin/contact-messages/unread-count", requireAdmin, async (_req, res) => {
    const count = await storage.getUnreadContactMessageCount();
    res.json({ count });
  });

  app.patch("/api/admin/contact-messages/:id", requireAdmin, async (req, res) => {
    const id = parseInt(String(req.params.id));
    const isRead = req.body?.isRead === true;
    const updated = await storage.markContactMessageRead(id, isRead);
    if (!updated) return res.status(404).json({ message: "Bulunamadı" });
    res.json(updated);
  });

  app.delete("/api/admin/contact-messages/:id", requireAdmin, async (req, res) => {
    const id = parseInt(String(req.params.id));
    await storage.deleteContactMessage(id);
    res.json({ message: "Silindi" });
  });

  app.get("/api/customer/virtual-pet", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const [pet] = await db.select().from(virtualPets).where(eq(virtualPets.customerId, customerId));
    if (!pet) return res.json(null);
    res.json(pet);
  });

  app.post("/api/customer/virtual-pet", requireCustomer, async (req, res) => {
    try {
      const customerId = (req as any).customerId;
      const { petType, petName } = req.body;
      const validTypes = ["kedi", "kopek", "kus"];
      const safePetType = validTypes.includes(petType) ? petType : "kedi";
      const safePetName = (petName || "Minnoş").toString().trim().slice(0, 20) || "Minnoş";
      const [existing] = await db.select().from(virtualPets).where(eq(virtualPets.customerId, customerId));
      if (existing) return res.json(existing);
      const [pet] = await db.insert(virtualPets).values({
        customerId,
        petType: safePetType,
        petName: safePetName,
      }).returning();
      res.json(pet);
    } catch (e) {
      res.status(500).json({ message: "Sanal hayvan oluşturulamadı" });
    }
  });

  app.post("/api/customer/virtual-pet/feed", requireCustomer, async (req, res) => {
    try {
      const customerId = (req as any).customerId;
      const ip = req.ip || "unknown";
      if (rateLimit(`petfeed:${ip}`, 10, 60 * 60 * 1000)) {
        return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
      }
      const [pet] = await db.select().from(virtualPets).where(eq(virtualPets.customerId, customerId));
      if (!pet) return res.status(404).json({ message: "Önce bir sanal hayvan sahiplen!" });

      const today = new Date().toISOString().split("T")[0];
      if (pet.lastFeedDate === today) {
        return res.status(400).json({ message: "Bugün zaten besledin! Yarın tekrar gel.", pet });
      }

      const settingsResult = await sharedPool.query("SELECT key, value FROM app_settings WHERE key IN ('pet_base_points', 'pet_streak_divisor', 'pet_max_points', 'pet_base_exp', 'pet_streak_exp_bonus')");
      const s: Record<string, number> = {};
      for (const row of settingsResult.rows) s[row.key] = Number(row.value);
      const basePoints = s.pet_base_points ?? 1;
      const streakDiv = s.pet_streak_divisor ?? 3;
      const maxPoints = s.pet_max_points ?? 5;
      const baseExp = s.pet_base_exp ?? 10;
      const streakExpBonus = s.pet_streak_exp_bonus ?? 2;

      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      const newStreak = pet.lastFeedDate === yesterday ? pet.streak + 1 : 1;
      const feedPoints = Math.min(basePoints + Math.floor(newStreak / Math.max(streakDiv, 1)), maxPoints);
      const newExp = pet.experience + baseExp + (newStreak * streakExpBonus);
      const newLevel = Math.floor(newExp / 100) + 1;

      const [updated] = await db.update(virtualPets)
        .set({
          lastFeedDate: today,
          streak: newStreak,
          totalFeedings: pet.totalFeedings + 1,
          experience: newExp,
          level: newLevel,
          earnedPoints: pet.earnedPoints + feedPoints,
        })
        .where(eq(virtualPets.id, pet.id))
        .returning();

      res.json({ pet: updated, pointsEarned: feedPoints, message: `+${feedPoints} puan kazandın!` });
    } catch (e) {
      res.status(500).json({ message: "Besleme sırasında bir hata oluştu" });
    }
  });

  app.get("/api/firsat-urunleri", async (_req, res) => {
    const allProducts = await storage.getAllProducts();
    const now = new Date();
    const threeMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
    const firsatProducts = allProducts.filter(p => {
      if (!p.skt || !p.isActive || p.stock <= 0) return false;
      const sktDate = parseSkt(p.skt);
      if (!sktDate) return false;
      return sktDate > now && sktDate <= threeMonthsLater;
    });
    res.json(firsatProducts);
  });

  app.get("/api/skt-alerts", requireAdmin, async (_req, res) => {
    const allProducts = await storage.getAllProducts();
    const now = new Date();
    const threeMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
    const expired: any[] = [];
    const expiringSoon: any[] = [];
    for (const p of allProducts) {
      if (!p.skt || !p.isActive) continue;
      const sktDate = parseSkt(p.skt);
      if (!sktDate) continue;
      if (sktDate < now) {
        expired.push({ ...p, sktDate: sktDate.toISOString(), status: "expired" });
      } else if (sktDate <= threeMonthsLater) {
        expiringSoon.push({ ...p, sktDate: sktDate.toISOString(), status: "expiring" });
      }
    }
    res.json({ expired, expiringSoon });
  });

  app.get("/api/admin/product-by-barcode/:barcode", requireAdmin, async (req, res) => {
    const barcode = req.params.barcode;
    const result = await sharedPool.query("SELECT * FROM products WHERE barcode = $1 LIMIT 1", [barcode]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Barkod bulunamadı" });
    res.json(result.rows[0]);
  });

  app.patch("/api/admin/product-quick-update/:id", requireAdmin, async (req, res) => {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) return res.status(400).json({ message: "Geçersiz ürün ID" });
    const { stock, skt, barcode, mode } = req.body;
    if (stock !== undefined && (typeof stock !== "number" || stock < 0 || stock > 99999)) return res.status(400).json({ message: "Geçersiz stok değeri" });
    if (skt !== undefined && skt !== null && typeof skt !== "string") return res.status(400).json({ message: "Geçersiz SKT" });
    if (barcode !== undefined && barcode !== null && typeof barcode !== "string") return res.status(400).json({ message: "Geçersiz barkod" });
    if (skt && skt.length > 20) return res.status(400).json({ message: "SKT çok uzun" });
    if (barcode && barcode.length > 50) return res.status(400).json({ message: "Barkod çok uzun" });
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;
    if (stock !== undefined) {
      updates.push(`stock = $${idx++}`); values.push(stock);
      updates.push(`preorder_enabled = $${idx++}`); values.push(stock <= 0);
    }
    if (skt !== undefined) { updates.push(`skt = $${idx++}`); values.push(skt); }
    if (barcode !== undefined) { updates.push(`barcode = $${idx++}`); values.push(barcode); }
    if (updates.length === 0) return res.status(400).json({ message: "Güncellenecek alan yok" });
    const client = await sharedPool.connect();
    try {
      await client.query("BEGIN");
      const before = await client.query("SELECT stock, name, barcode FROM products WHERE id = $1 FOR UPDATE", [id]);
      if (before.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Ürün bulunamadı" });
      }
      const oldStock: number = before.rows[0].stock ?? 0;
      const upVals = [...values, id];
      await client.query(`UPDATE products SET ${updates.join(", ")} WHERE id = $${idx}`, upVals);
      if (stock !== undefined && stock !== oldStock) {
        const delta = stock - oldStock;
        const movMode = (mode === "add" || mode === "sub" || mode === "manual") ? mode : (delta > 0 ? "add" : "sub");
        await client.query(
          "INSERT INTO stock_movements (product_id, product_name, barcode, delta, mode, new_stock) VALUES ($1,$2,$3,$4,$5,$6)",
          [id, before.rows[0].name, before.rows[0].barcode, delta, movMode, stock]
        );
      }
      const result = await client.query("SELECT * FROM products WHERE id = $1", [id]);
      await client.query("COMMIT");
      res.json(result.rows[0]);
    } catch (e) {
      await client.query("ROLLBACK").catch(() => {});
      console.error("quick-update transaction failed", e);
      res.status(500).json({ message: "Güncelleme hatası" });
    } finally {
      client.release();
    }
  });

  app.get("/api/public/top-banner", async (req, res) => {
    try {
      const map = await resolveSettings(
        ["top_banner_enabled", "top_banner_image", "top_banner_link"],
        isValidStore(String(req.query.store)) ? String(req.query.store) : publicStoreId(req)
      );
      res.json({
        enabled: map.top_banner_enabled === "1",
        image: map.top_banner_image || "",
        link: map.top_banner_link || "/giris",
      });
    } catch {
      res.json({ enabled: false, image: "", link: "/giris" });
    }
  });

  app.get("/api/public/breed-banners", async (req, res) => {
    const defaults: Record<string, { link: string; alt: string }> = {
      b1: { link: "/kategori/kopek/maltese-mamalari", alt: "Maltese Özel Mamaları" },
      b2: { link: "/kategori/kopek/toy-poodle-mamalari", alt: "Toy Poodle Özel Mamaları" },
      b3: { link: "/kategori/kopek/cavalier-king-charles-mamalari", alt: "Cavalier King Charles Özel Mamaları" },
      b4: { link: "/kategori/kopek/shih-tzu-mamalari", alt: "Shih Tzu Özel Mamaları" },
      b5: { link: "/kategori/kopek/chihuahua-mamalari", alt: "Chihuahua Özel Mamaları" },
      b6: { link: "/kategori/kopek/pekinese-mamalari", alt: "Pekinese Özel Mamaları" },
      b7: { link: "/kategori/kopek/pug-mamalari", alt: "Pug Özel Mamaları" },
      b8: { link: "/kategori/kopek/yorkshire-terrier-mamalari", alt: "Yorkshire Terrier Özel Mamaları" },
      b9: { link: "/kategori/kopek/cocker-spaniel-mamalari", alt: "Cocker Spaniel Özel Mamaları" },
      b10: { link: "/kategori/kopek/pomeranian-mamalari", alt: "Pomeranian Özel Mamaları" },
    };
    try {
      const m = await resolveSettingsLike("breed_banner%", isValidStore(String(req.query.store)) ? String(req.query.store) : publicStoreId(req));
      const build = (i: number) => ({
        image: m[`breed_banner${i}_image`] || "",
        link: m[`breed_banner${i}_link`] || defaults[`b${i}`].link,
        alt: m[`breed_banner${i}_alt`] || defaults[`b${i}`].alt,
        enabled: m[`breed_banner${i}_enabled`] !== "0",
        order: Number(m[`breed_banner${i}_order`]) || i,
      });
      res.json({
        enabled: m.breed_banner_enabled === "1",
        b1: build(1), b2: build(2), b3: build(3), b4: build(4), b5: build(5),
        b6: build(6), b7: build(7), b8: build(8), b9: build(9), b10: build(10),
      });
    } catch {
      res.json({
        enabled: true,
        b1: { image: "", enabled: true, order: 1, ...defaults.b1 }, b2: { image: "", enabled: true, order: 2, ...defaults.b2 },
        b3: { image: "", enabled: true, order: 3, ...defaults.b3 }, b4: { image: "", enabled: true, order: 4, ...defaults.b4 },
        b5: { image: "", enabled: true, order: 5, ...defaults.b5 }, b6: { image: "", enabled: true, order: 6, ...defaults.b6 },
        b7: { image: "", enabled: true, order: 7, ...defaults.b7 }, b8: { image: "", enabled: true, order: 8, ...defaults.b8 },
        b9: { image: "", enabled: true, order: 9, ...defaults.b9 }, b10: { image: "", enabled: true, order: 10, ...defaults.b10 },
      });
    }
  });

  app.patch("/api/admin/breed-banners", requireAdmin, async (req, res) => {
    const body = req.body || {};
    const updates: Array<[string, string]> = [];
    if (body.enabled !== undefined) updates.push(["breed_banner_enabled", body.enabled ? "1" : "0"]);
    for (const idx of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const) {
      const b = body[`b${idx}`];
      if (b && typeof b === "object") {
        if (typeof b.image === "string") {
          if (b.image.length > 3 * 1024 * 1024) return res.status(400).json({ message: "Görsel çok büyük (max 2MB)" });
          updates.push([`breed_banner${idx}_image`, b.image]);
        }
        if (typeof b.link === "string" && b.link.length <= 500) updates.push([`breed_banner${idx}_link`, b.link]);
        if (typeof b.alt === "string" && b.alt.length <= 200) updates.push([`breed_banner${idx}_alt`, b.alt]);
        if (b.enabled !== undefined) updates.push([`breed_banner${idx}_enabled`, b.enabled ? "1" : "0"]);
        if (b.order !== undefined && Number.isFinite(Number(b.order))) updates.push([`breed_banner${idx}_order`, String(Math.max(1, Math.min(999, Math.floor(Number(b.order)))))]);
      }
    }
    await writeStoreSettings(updates, adminStoreId(req));
    res.json({ ok: true });
  });

  // ===== Ana Sayfa Kategori Banner'ları (20 adet, dikey stack) =====
  app.get("/api/public/category-banners", async (req, res) => {
    try {
      const m = await resolveSettingsLike("cat_banner%", isValidStore(String(req.query.store)) ? String(req.query.store) : publicStoreId(req));
      const banners = [];
      for (let i = 1; i <= 20; i++) {
        banners.push({
          idx: i,
          image: m[`cat_banner${i}_image`] || "",
          link: m[`cat_banner${i}_link`] || "",
          alt: m[`cat_banner${i}_alt`] || "",
          enabled: m[`cat_banner${i}_enabled`] === "1",
          order: Number(m[`cat_banner${i}_order`]) || i,
        });
      }
      res.json({ enabled: m.cat_banner_enabled !== "0", banners });
    } catch {
      const banners = Array.from({ length: 20 }, (_, i) => ({
        idx: i + 1, image: "", link: "", alt: "", enabled: false, order: i + 1,
      }));
      res.json({ enabled: true, banners });
    }
  });

  app.patch("/api/admin/category-banners", requireAdmin, async (req, res) => {
    try {
      const body = req.body || {};
      const list = Array.isArray(body.banners) ? body.banners : [];
      console.log(`[cat-banners PATCH] enabled=${body.enabled} bannersLen=${list.length} firstImageLen=${list[0]?.image?.length || 0}`);
      const updates: Array<[string, string]> = [];
      if (body.enabled !== undefined) updates.push(["cat_banner_enabled", body.enabled ? "1" : "0"]);
      for (const b of list) {
        const i = Number(b?.idx);
        if (!Number.isInteger(i) || i < 1 || i > 20) continue;
        const hasImage = typeof b.image === "string" && b.image.length > 0;
        if (typeof b.image === "string") {
          if (b.image.length > 6 * 1024 * 1024) return res.status(400).json({ message: "Görsel çok büyük (max 4MB)" });
          updates.push([`cat_banner${i}_image`, b.image]);
        }
        if (typeof b.link === "string" && b.link.length <= 500) {
          let link = b.link.trim();
          if (link && !link.startsWith("/") && !link.startsWith("http")) link = "/" + link;
          updates.push([`cat_banner${i}_link`, link]);
        }
        if (typeof b.alt === "string" && b.alt.length <= 200) updates.push([`cat_banner${i}_alt`, b.alt]);
        // Otomatik: görsel varsa aktif, yoksa kullanıcının seçimi
        const finalEnabled = hasImage ? (b.enabled !== false) : !!b.enabled;
        updates.push([`cat_banner${i}_enabled`, finalEnabled ? "1" : "0"]);
        if (b.order !== undefined && Number.isFinite(Number(b.order))) {
          updates.push([`cat_banner${i}_order`, String(Math.max(1, Math.min(999, Math.floor(Number(b.order)))))]);
        }
      }
      if (updates.length > 0) {
        const prefix = settingsPrefix(adminStoreId(req));
        const params: any[] = [];
        const values: string[] = [];
        updates.forEach(([k, v], idx) => {
          values.push(`($${idx * 2 + 1},$${idx * 2 + 2},NOW())`);
          params.push(prefix + k, v);
        });
        const sql = `INSERT INTO app_settings (key, value, updated_at) VALUES ${values.join(",")} ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`;
        const t0 = Date.now();
        await sharedPool.query(sql, params);
        console.log(`[cat-banners PATCH] wrote ${updates.length} keys in ${Date.now() - t0}ms`);
      }
      res.json({ ok: true, written: updates.length });
    } catch (err: any) {
      console.error("[cat-banners PATCH] error:", err?.message, err?.stack);
      res.status(500).json({ message: "Kayıt hatası: " + (err?.message || "bilinmeyen") });
    }
  });

  app.patch("/api/admin/top-banner", requireAdmin, async (req, res) => {
    const { enabled, image, link } = req.body || {};
    if (image !== undefined && typeof image !== "string") return res.status(400).json({ message: "Geçersiz görsel" });
    if (image && image.length > 3 * 1024 * 1024) return res.status(400).json({ message: "Görsel çok büyük (max 2MB)" });
    if (link !== undefined && (typeof link !== "string" || link.length > 500)) return res.status(400).json({ message: "Geçersiz link" });
    const updates: Array<[string, string]> = [];
    if (enabled !== undefined) updates.push(["top_banner_enabled", enabled ? "1" : "0"]);
    if (image !== undefined) updates.push(["top_banner_image", image]);
    if (link !== undefined) updates.push(["top_banner_link", link]);
    await writeStoreSettings(updates, adminStoreId(req));
    res.json({ ok: true });
  });

  app.get("/api/admin/stock-movements", requireAdmin, async (req, res) => {
    const month = String(req.query.month || "");
    const from = String(req.query.from || "");
    const to = String(req.query.to || "");
    const mode = String(req.query.mode || "");
    const conds: string[] = [];
    const vals: any[] = [];
    let i = 1;
    if (/^\d{4}-\d{2}-\d{2}$/.test(from) && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
      conds.push(`to_char(created_at AT TIME ZONE 'Europe/Istanbul', 'YYYY-MM-DD') BETWEEN $${i++} AND $${i++}`);
      vals.push(from); vals.push(to);
    } else if (/^\d{4}-\d{2}$/.test(month)) {
      conds.push(`to_char(created_at AT TIME ZONE 'Europe/Istanbul', 'YYYY-MM') = $${i++}`);
      vals.push(month);
    }
    if (mode === "add" || mode === "sub" || mode === "manual") {
      conds.push(`mode = $${i++}`);
      vals.push(mode);
    }
    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
    const rows = await sharedPool.query(
      `SELECT * FROM stock_movements ${where} ORDER BY created_at DESC LIMIT 5000`,
      vals
    );
    const summary = await sharedPool.query(
      `SELECT to_char(created_at AT TIME ZONE 'Europe/Istanbul', 'YYYY-MM') AS month,
              SUM(CASE WHEN delta < 0 THEN -delta ELSE 0 END)::int AS total_out,
              SUM(CASE WHEN delta > 0 THEN delta ELSE 0 END)::int AS total_in,
              COUNT(*)::int AS count
         FROM stock_movements
         GROUP BY month ORDER BY month DESC LIMIT 24`
    );
    res.json({ movements: rows.rows, monthly: summary.rows });
  });

  app.get("/api/customer/pet-profiles", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const result = await sharedPool.query("SELECT * FROM pet_profiles WHERE customer_id = $1 ORDER BY created_at", [customerId]);
    res.json(result.rows);
  });

  app.post("/api/customer/pet-profiles", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const ip = req.ip || "unknown";
    if (rateLimit(`petprof:${ip}`, 10, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
    }
    const { name, type, breed, birthday, weight, photoData, notes } = req.body;
    if (!name || !type) return res.status(400).json({ message: "İsim ve tür gerekli" });
    if (typeof name !== "string" || name.length > 50) return res.status(400).json({ message: "İsim çok uzun" });
    if (typeof type !== "string" || type.length > 30) return res.status(400).json({ message: "Geçersiz tür" });
    if (breed && (typeof breed !== "string" || breed.length > 100)) return res.status(400).json({ message: "Cins adı çok uzun" });
    if (notes && (typeof notes !== "string" || notes.length > 500)) return res.status(400).json({ message: "Not çok uzun" });
    if (photoData && (typeof photoData !== "string" || photoData.length > 4 * 1024 * 1024)) return res.status(400).json({ message: "Fotoğraf çok büyük (max 3MB)" });
    const result = await sharedPool.query(
      "INSERT INTO pet_profiles (customer_id, name, type, breed, birthday, weight, photo_data, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
      [customerId, name, type, breed || null, birthday || null, weight || null, photoData || null, notes || null]
    );
    res.json(result.rows[0]);
  });

  app.patch("/api/customer/pet-profiles/:id", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const ip = req.ip || "unknown";
    if (rateLimit(`petprofup:${ip}`, 15, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
    }
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) return res.status(400).json({ message: "Geçersiz ID" });
    const { name, breed, birthday, weight, photoData, notes, favoriteFoodId } = req.body;
    if (name && (typeof name !== "string" || name.length > 50)) return res.status(400).json({ message: "İsim çok uzun" });
    if (breed && (typeof breed !== "string" || breed.length > 100)) return res.status(400).json({ message: "Cins çok uzun" });
    if (notes && (typeof notes !== "string" || notes.length > 500)) return res.status(400).json({ message: "Not çok uzun" });
    if (photoData && (typeof photoData !== "string" || photoData.length > 4 * 1024 * 1024)) return res.status(400).json({ message: "Fotoğraf çok büyük" });
    await sharedPool.query(
      "UPDATE pet_profiles SET name=COALESCE($1,name), breed=COALESCE($2,breed), birthday=COALESCE($3,birthday), weight=COALESCE($4,weight), photo_data=COALESCE($5,photo_data), notes=COALESCE($6,notes), favorite_food_id=COALESCE($7,favorite_food_id) WHERE id=$8 AND customer_id=$9",
      [name, breed, birthday, weight, photoData, notes, favoriteFoodId, id, customerId]
    );
    const result = await sharedPool.query("SELECT * FROM pet_profiles WHERE id=$1 AND customer_id=$2", [id, customerId]);
    res.json(result.rows[0]);
  });

  app.delete("/api/customer/pet-profiles/:id", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const id = parseInt(String(req.params.id));
    await sharedPool.query("DELETE FROM pet_photos WHERE pet_profile_id=$1", [id]);
    await sharedPool.query("DELETE FROM pet_weight_log WHERE pet_profile_id=$1", [id]);
    await sharedPool.query("DELETE FROM pet_health_records WHERE pet_profile_id=$1", [id]);
    await sharedPool.query("DELETE FROM pet_profiles WHERE id=$1 AND customer_id=$2", [id, customerId]);
    res.json({ success: true });
  });

  app.get("/api/customer/pet-profiles/:id/health", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const id = parseInt(String(req.params.id));
    const pet = await sharedPool.query("SELECT id FROM pet_profiles WHERE id=$1 AND customer_id=$2", [id, customerId]);
    if (pet.rows.length === 0) return res.status(404).json({ message: "Pet bulunamadı" });
    const result = await sharedPool.query("SELECT * FROM pet_health_records WHERE pet_profile_id=$1 ORDER BY date DESC", [id]);
    res.json(result.rows);
  });

  async function verifyPetOwnership(petId: number, customerId: number): Promise<boolean> {
    const pet = await sharedPool.query("SELECT id FROM pet_profiles WHERE id=$1 AND customer_id=$2", [petId, customerId]);
    return pet.rows.length > 0;
  }

  app.post("/api/customer/pet-profiles/:id/health", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const ip = req.ip || "unknown";
    if (rateLimit(`pethealth:${ip}`, 20, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
    }
    const petId = parseInt(String(req.params.id));
    if (!(await verifyPetOwnership(petId, customerId))) return res.status(403).json({ message: "Erişim reddedildi" });
    const { recordType, title, date, notes, nextDate } = req.body;
    if (!recordType || !title || !date) return res.status(400).json({ message: "Tür, başlık ve tarih gerekli" });
    if (typeof title !== "string" || title.length > 200) return res.status(400).json({ message: "Başlık çok uzun" });
    if (notes && (typeof notes !== "string" || notes.length > 500)) return res.status(400).json({ message: "Not çok uzun" });
    const result = await sharedPool.query(
      "INSERT INTO pet_health_records (pet_profile_id, record_type, title, date, notes, next_date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [petId, recordType, title, date, notes || null, nextDate || null]
    );
    res.json(result.rows[0]);
  });

  app.delete("/api/customer/pet-health/:id", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const recordId = parseInt(String(req.params.id));
    const check = await sharedPool.query(
      "SELECT phr.id FROM pet_health_records phr JOIN pet_profiles pp ON pp.id = phr.pet_profile_id WHERE phr.id=$1 AND pp.customer_id=$2",
      [recordId, customerId]
    );
    if (check.rows.length === 0) return res.status(403).json({ message: "Erişim reddedildi" });
    await sharedPool.query("DELETE FROM pet_health_records WHERE id=$1", [recordId]);
    res.json({ success: true });
  });

  app.get("/api/customer/pet-profiles/:id/weight", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const petId = parseInt(String(req.params.id));
    if (!(await verifyPetOwnership(petId, customerId))) return res.status(403).json({ message: "Erişim reddedildi" });
    const result = await sharedPool.query("SELECT * FROM pet_weight_log WHERE pet_profile_id=$1 ORDER BY date DESC", [petId]);
    res.json(result.rows);
  });

  app.post("/api/customer/pet-profiles/:id/weight", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const ip = req.ip || "unknown";
    if (rateLimit(`petweight:${ip}`, 20, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
    }
    const petId = parseInt(String(req.params.id));
    if (!(await verifyPetOwnership(petId, customerId))) return res.status(403).json({ message: "Erişim reddedildi" });
    const { weight, date } = req.body;
    if (!weight || !date) return res.status(400).json({ message: "Kilo ve tarih gerekli" });
    if (typeof weight !== "number" || weight <= 0 || weight > 200) return res.status(400).json({ message: "Geçersiz kilo değeri" });
    const result = await sharedPool.query(
      "INSERT INTO pet_weight_log (pet_profile_id, weight, date) VALUES ($1,$2,$3) RETURNING *",
      [petId, weight, date]
    );
    res.json(result.rows[0]);
  });

  app.get("/api/customer/pet-profiles/:id/photos", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const petId = parseInt(String(req.params.id));
    if (!(await verifyPetOwnership(petId, customerId))) return res.status(403).json({ message: "Erişim reddedildi" });
    const result = await sharedPool.query("SELECT * FROM pet_photos WHERE pet_profile_id=$1 ORDER BY created_at DESC", [petId]);
    res.json(result.rows);
  });

  app.post("/api/customer/pet-profiles/:id/photos", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const ip = req.ip || "unknown";
    if (rateLimit(`petphoto:${ip}`, 20, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla fotoğraf yükleme. Lütfen daha sonra tekrar deneyin." });
    }
    const petId = parseInt(String(req.params.id));
    if (!(await verifyPetOwnership(petId, customerId))) return res.status(403).json({ message: "Erişim reddedildi" });
    const { photoData, caption } = req.body;
    if (!photoData) return res.status(400).json({ message: "Fotoğraf gerekli" });
    if (caption && (typeof caption !== "string" || caption.length > 200)) return res.status(400).json({ message: "Açıklama çok uzun" });
    if (photoData.length > 4 * 1024 * 1024) return res.status(400).json({ message: "Dosya çok büyük (maks 3MB)" });
    const result = await sharedPool.query(
      "INSERT INTO pet_photos (pet_profile_id, photo_data, caption) VALUES ($1,$2,$3) RETURNING *",
      [petId, photoData, caption || null]
    );
    res.json(result.rows[0]);
  });

  app.delete("/api/customer/pet-photos/:id", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const photoId = parseInt(String(req.params.id));
    const check = await sharedPool.query(
      "SELECT pp2.id FROM pet_photos pp2 JOIN pet_profiles pp ON pp.id = pp2.pet_profile_id WHERE pp2.id=$1 AND pp.customer_id=$2",
      [photoId, customerId]
    );
    if (check.rows.length === 0) return res.status(403).json({ message: "Erişim reddedildi" });
    await sharedPool.query("DELETE FROM pet_photos WHERE id=$1", [photoId]);
    res.json({ success: true });
  });

  app.get("/api/lost-found", async (_req, res) => {
    const result = await sharedPool.query("SELECT * FROM lost_found_posts WHERE is_resolved = false ORDER BY created_at DESC LIMIT 50");
    res.json(result.rows);
  });

  app.post("/api/lost-found", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const ip = req.ip || "unknown";
    if (rateLimit(`lostfound:${ip}`, 5, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla ilan. Lütfen daha sonra tekrar deneyin." });
    }
    const { postType, petName, petType, breed, color, lastSeenLocation, description, contactPhone, photoData } = req.body;
    if (!postType || !petName || !petType || !description || !contactPhone) {
      return res.status(400).json({ message: "Zorunlu alanları doldurun" });
    }
    if (!["lost", "found", "adoption"].includes(postType)) return res.status(400).json({ message: "Geçersiz ilan tipi" });
    if (typeof petName !== "string" || petName.length > 100) return res.status(400).json({ message: "Pet adı çok uzun" });
    if (typeof petType !== "string" || petType.length > 50) return res.status(400).json({ message: "Geçersiz pet türü" });
    if (typeof contactPhone !== "string" || contactPhone.length < 7 || contactPhone.length > 20) return res.status(400).json({ message: "Geçersiz telefon numarası" });
    if (breed && (typeof breed !== "string" || breed.length > 100)) return res.status(400).json({ message: "Cins bilgisi çok uzun" });
    if (color && (typeof color !== "string" || color.length > 50)) return res.status(400).json({ message: "Renk bilgisi çok uzun" });
    if (lastSeenLocation && (typeof lastSeenLocation !== "string" || lastSeenLocation.length > 200)) return res.status(400).json({ message: "Konum bilgisi çok uzun" });
    if (photoData && (typeof photoData !== "string" || photoData.length > 5 * 1024 * 1024)) {
      return res.status(400).json({ message: "Fotoğraf boyutu çok büyük (max 4MB)" });
    }
    if (typeof description !== "string" || description.length > 1000) {
      return res.status(400).json({ message: "Açıklama çok uzun" });
    }
    const customer = await sharedPool.query("SELECT name FROM customers WHERE id=$1", [customerId]);
    const result = await sharedPool.query(
      "INSERT INTO lost_found_posts (customer_id, post_type, pet_name, pet_type, breed, color, last_seen_location, description, contact_phone, photo_data, customer_name) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *",
      [customerId, postType, petName, petType, breed || null, color || null, lastSeenLocation || null, description, contactPhone, photoData || null, customer.rows[0]?.name || ""]
    );
    res.json(result.rows[0]);
  });

  app.patch("/api/lost-found/:id/resolve", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const ip = req.ip || "unknown";
    if (rateLimit(`lfresolve:${ip}`, 10, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek." });
    }
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) return res.status(400).json({ message: "Geçersiz ID" });
    await sharedPool.query("UPDATE lost_found_posts SET is_resolved = true WHERE id=$1 AND customer_id=$2", [id, customerId]);
    res.json({ success: true });
  });

  app.get("/api/customer/purchase-history", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const customer = await sharedPool.query("SELECT phone FROM customers WHERE id=$1", [customerId]);
    if (customer.rows.length === 0) return res.json([]);
    const orders = await sharedPool.query("SELECT items, created_at FROM orders WHERE customer_phone=$1 AND status != 'iptal' ORDER BY created_at DESC", [customer.rows[0].phone]);
    const purchasedProducts: Record<number, { name: string; lastDate: string; count: number }> = {};
    for (const order of orders.rows) {
      const items = order.items as any[];
      if (!items) continue;
      for (const item of items) {
        const pid = parseInt(String(item.productId));
        if (!purchasedProducts[pid]) {
          purchasedProducts[pid] = { name: item.name, lastDate: order.created_at, count: 0 };
        }
        purchasedProducts[pid].count += item.quantity || 1;
      }
    }
    res.json(Object.entries(purchasedProducts).map(([id, data]) => ({ productId: parseInt(id), ...data })));
  });

  app.post("/api/voice-order", async (req, res) => {
    const ip = req.ip || "unknown";
    if (rateLimit(`voiceorder:${ip}`, 3, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
    }
    const { name, phone, note } = req.body;
    if (!phone || typeof phone !== "string" || phone.length < 7 || phone.length > 20) return res.status(400).json({ message: "Telefon numarası gerekli" });
    if (name && typeof name === "string" && name.length > 100) return res.status(400).json({ message: "İsim çok uzun" });
    if (note && typeof note === "string" && note.length > 500) return res.status(400).json({ message: "Not çok uzun" });
    res.json({ message: "Sesli sipariş talebiniz alındı. En kısa sürede sizi arayacağız!" });
  });

  function getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const week = Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${String(week).padStart(2, "0")}`;
  }

  app.get("/api/pet-contest", async (_req, res) => {
    const currentWeek = getCurrentWeek();
    const entries = await db.select().from(petContestEntries)
      .where(eq(petContestEntries.weekNumber, currentWeek))
      .orderBy(desc(petContestEntries.votes));
    res.json({ week: currentWeek, entries: entries.map(e => ({ ...e, photoData: e.photoData.substring(0, 100) + "..." })) });
  });

  app.get("/api/pet-contest/photo/:id", async (req, res) => {
    const id = parseInt(String(req.params.id));
    const [entry] = await db.select().from(petContestEntries).where(eq(petContestEntries.id, id));
    if (!entry) return res.status(404).json({ message: "Bulunamadı" });
    const match = entry.photoData.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      res.setHeader("Content-Type", match[1]);
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.send(Buffer.from(match[2], "base64"));
    } else {
      res.status(400).json({ message: "Geçersiz fotoğraf" });
    }
  });

  app.get("/api/pet-contest/winner", async (_req, res) => {
    const currentWeek = getCurrentWeek();
    const now = new Date();
    const lastWeekDate = new Date(now.getTime() - 7 * 86400000);
    const lastStart = new Date(lastWeekDate.getFullYear(), 0, 1);
    const lastDiff = lastWeekDate.getTime() - lastStart.getTime();
    const lastWeekNum = Math.ceil((lastDiff / 86400000 + lastStart.getDay() + 1) / 7);
    const lastWeek = `${lastWeekDate.getFullYear()}-W${String(lastWeekNum).padStart(2, "0")}`;

    const winners = await db.select().from(petContestEntries)
      .where(and(eq(petContestEntries.weekNumber, lastWeek), eq(petContestEntries.isWinner, true)));
    
    if (winners.length === 0) {
      const topEntries = await db.select().from(petContestEntries)
        .where(eq(petContestEntries.weekNumber, lastWeek))
        .orderBy(desc(petContestEntries.votes))
        .limit(1);
      if (topEntries.length > 0 && topEntries[0].votes > 0) {
        await db.update(petContestEntries)
          .set({ isWinner: true })
          .where(eq(petContestEntries.id, topEntries[0].id));
        return res.json({ winner: { ...topEntries[0], isWinner: true, photoData: undefined }, week: lastWeek });
      }
    }

    if (winners.length > 0) {
      return res.json({ winner: { ...winners[0], photoData: undefined }, week: lastWeek });
    }
    res.json({ winner: null, week: lastWeek });
  });

  app.post("/api/pet-contest", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const ip = req.ip || "unknown";
    if (rateLimit(`contest:${ip}`, 5, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
    }
    const { petName, petType, photo, description } = req.body;
    if (!petName || !photo) return res.status(400).json({ message: "Pet adı ve fotoğraf gerekli" });
    if (typeof photo !== "string" || photo.length > 5 * 1024 * 1024) return res.status(400).json({ message: "Fotoğraf boyutu çok büyük (max 4MB)" });
    if (typeof petName !== "string" || petName.length > 100) return res.status(400).json({ message: "Pet adı çok uzun" });
    if (description && typeof description === "string" && description.length > 500) return res.status(400).json({ message: "Açıklama çok uzun" });

    const currentWeek = getCurrentWeek();
    const existing = await db.select().from(petContestEntries)
      .where(and(eq(petContestEntries.customerId, customerId), eq(petContestEntries.weekNumber, currentWeek)));
    if (existing.length > 0) return res.status(400).json({ message: "Bu hafta zaten katıldınız!" });

    const customer = await storage.getCustomer(customerId);
    const [entry] = await db.insert(petContestEntries).values({
      customerId,
      petName,
      petType: petType || "kedi",
      photoData: photo,
      description: description || null,
      weekNumber: currentWeek,
      customerName: customer?.name || null,
    }).returning();

    res.json({ ...entry, photoData: undefined });
  });

  app.post("/api/pet-contest/:id/vote", async (req, res) => {
    const ip = req.ip || "unknown";
    if (rateLimit(`vote:${ip}`, 30, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla oy. Lütfen daha sonra tekrar deneyin." });
    }
    const entryId = parseInt(String(req.params.id));
    const voterIp = req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown";
    const customerId = (req as any).session?.customerId || null;

    const currentWeek = getCurrentWeek();
    const [entry] = await db.select().from(petContestEntries).where(eq(petContestEntries.id, entryId));
    if (!entry || entry.weekNumber !== currentWeek) return res.status(400).json({ message: "Bu yarışma sona erdi" });

    const existingVotes = await db.select().from(petContestVotes)
      .where(and(eq(petContestVotes.entryId, entryId), eq(petContestVotes.voterIp, voterIp)));
    if (existingVotes.length > 0) return res.status(400).json({ message: "Bu pet için zaten oy verdiniz!" });

    await db.insert(petContestVotes).values({ entryId, voterIp, customerId });
    await db.update(petContestEntries)
      .set({ votes: sql`${petContestEntries.votes} + 1` })
      .where(eq(petContestEntries.id, entryId));

    res.json({ message: "Oyunuz kaydedildi!" });
  });

  return httpServer;
}
