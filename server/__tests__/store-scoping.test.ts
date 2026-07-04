// Integration tests for per-domain content scoping (multi-store "tek mutfak,
// çok tabela"). They assert that the public API endpoints only ever expose
// rows tagged store='all' plus rows tagged for the requesting host's store,
// for both jetgomarket.com (jetgo) and atakumpetshop.com (atakum). They also
// cover the backward-compat rule that the default (jetgo) host falls back to
// unprefixed app_settings when no jetgo-prefixed override exists.
//
// Run with:  npx tsx --test --test-force-exit server/__tests__/store-scoping.test.ts
//
// The tests seed throwaway rows (marked with a unique sentinel) into the dev
// database and remove them again in the cleanup hook. app_settings keys cannot
// be sentinel-namespaced (the endpoints read a fixed key list), so their prior
// values are snapshotted and restored exactly.

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { randomBytes, createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import * as cookieSignature from "cookie-signature";
import { registerRoutes, isTestOtpBypass } from "../routes";
import { injectAllMeta, injectGoogleTags } from "../seo-meta";
import {
  SEO_PAGES,
  findSeoPage,
  getSeoPagesForStore,
  getSitemapPagesForStore,
  SITEMAP_PARTITION_GROUPS,
  stableSlugHash,
  availableSlugSet,
  ALL_SEO_SLUGS,
  isCargoStore,
  ATAKUM_EXCLUSIVE_PAGES,
  ATAKUM_ALL_EXCLUSIVE_PAGES,
  JETGO_EXCLUSIVE_PAGES,
  JETGOSHOP_ALL_EXCLUSIVE_PAGES,
  ATAKUMBIZ_ALL_EXCLUSIVE_PAGES,
  MARKAPET_ALL_EXCLUSIVE_PAGES,
  KARADENIZ_ALL_EXCLUSIVE_PAGES,
  SAMSUN_ALL_EXCLUSIVE_PAGES,
  JETGOPET_ALL_EXCLUSIVE_PAGES,
  SAMSUNPET_ALL_EXCLUSIVE_PAGES,
} from "../../client/src/lib/seo-data";
import { JETGOSHOP_ALL_KEYWORD_PAGES, JETGOSHOP_ALL_SKIPPED_NOISE } from "../../client/src/lib/keyword-pages-jetgoshop-all";
import { ATAKUMBIZ_ALL_KEYWORD_PAGES, ATAKUMBIZ_ALL_SKIPPED_NOISE } from "../../client/src/lib/keyword-pages-atakumbiz-all";
import { MARKAPET_ALL_KEYWORD_PAGES, MARKAPET_ALL_SKIPPED_NOISE } from "../../client/src/lib/keyword-pages-markapet-all";
import { KARADENIZ_ALL_KEYWORD_PAGES, KARADENIZ_ALL_SKIPPED_NOISE } from "../../client/src/lib/keyword-pages-karadeniz-all";
import { SAMSUN_ALL_KEYWORD_PAGES, SAMSUN_ALL_SKIPPED_NOISE } from "../../client/src/lib/keyword-pages-samsun-all";
import { JETGOPET_ALL_KEYWORD_PAGES, JETGOPET_ALL_SKIPPED_NOISE } from "../../client/src/lib/keyword-pages-jetgopet-all";
import { SAMSUNPET_ALL_KEYWORD_PAGES, SAMSUNPET_ALL_SKIPPED_NOISE } from "../../client/src/lib/keyword-pages-samsunpet-all";
import { ROYALCANIN_KEYWORD_PAGES } from "../../client/src/lib/keyword-pages-jetgo-royalcanin";
import { MARKALAR_KEYWORD_PAGES, MARKALAR_SKIPPED_NOISE } from "../../client/src/lib/keyword-pages-jetgo-markalar";
import { DIGER_KEYWORD_PAGES, DIGER_SKIPPED_NOISE } from "../../client/src/lib/keyword-pages-jetgo-diger";
import { getStoreByHost, brandifyFor, STORES, DEFAULT_STORE } from "../../shared/stores";
import { ATAKUM_POPULAR_SEARCHES } from "../../client/src/lib/atakum-popular-searches";
import { setStoreGoogleConfig, deleteStoreGoogleConfig, getAllStoreGoogleConfigs } from "../google-tags";
import { setStoreMerchantConfig, deleteStoreMerchantConfig, getAllStoreMerchantConfigs, normalizeMerchantConfig, effectiveStoreCode, DEFAULT_LOCAL_STORE_CODE } from "../merchant";
import { pool } from "../storage";
// The shared-edit protection helpers live in the client lib so they can be unit
// tested here without booting the React app. STORE_SCOPED_SETTING_KEYS must stay
// in sync with the server-side copy in routes.ts (asserted by a drift test below).
import {
  confirmSharedSettingsSave,
  confirmSharedEdit,
  isSharedRowInStoreView,
  STORE_SCOPED_SETTING_KEYS as CLIENT_STORE_SCOPED_SETTING_KEYS,
} from "../../client/src/lib/storeScope";
// Pure checkout payment-visibility helpers (the exact logic the checkout page
// renders with). Tested here so an online-only store can never leak in-person
// payment surfaces without booting React.
import {
  visiblePaymentOptions,
  showDoorPosInstallments,
} from "../../client/src/lib/paymentVisibility";

const MARK = "__SCOPE_TEST__";
const JETGO_HOST = "www.jetgomarket.com";
const ATAKUM_HOST = "www.atakumpetshop.com";
const SAMSUN_HOST = "www.atakumpet.com";
// Second branded LOCAL same-day store. Shares the samsun local same-day /
// door-payment model but is its OWN store (id "samsunpet", domain samsunpet.com)
// — it must never collide with the existing "samsun" store bound to atakumpet.com.
const SAMSUNPET_HOST = "www.samsunpet.com";
// Third branded LOCAL same-day store (id "karadeniz", domain karadenizpetshop.com).
const KARADENIZ_HOST = "www.karadenizpetshop.com";
const ATAKUMBIZ_HOST = "www.atakum.biz";
// Second domain for the flagship JETGO brand (id "jetgopet", domain jetgo.pet).
// Same JETGO brand + LOCAL same-day model as jetgomarket.com, but a SEPARATE
// self-canonical store on its own URL. Its domain contains the substring "jetgo",
// which exercises the brandifyFor placeholder pass (must NOT become "JETGO.pet").
const JETGOPET_HOST = "www.jetgo.pet";
// Third domain for the flagship JETGO brand (id "jetgoshop", domain jetgo.shop).
// Same JETGO brand + LOCAL same-day model as jetgomarket.com, but a SEPARATE
// self-canonical store on its own URL. Its domain also contains the substring
// "jetgo", so it exercises the brandifyFor placeholder pass (NOT "JETGO.shop").
const JETGOSHOP_HOST = "www.jetgo.shop";
// FOURTH branded LOCAL same-day store (id "markapet", domain marka.pet). Per the
// owner's request the customer-facing brand IS the domain string "marka.pet".
const MARKAPET_HOST = "www.marka.pet";

// app_settings keys touched by the tests; snapshotted and restored.
const SETTING_KEYS = [
  // public-settings (override + backward-compat)
  "campaign_hero_title", "jetgo:campaign_hero_title", "atakum:campaign_hero_title",
  "campaign_hero_subtitle",
  // top-banner (override + link fallback / backward-compat)
  "top_banner_enabled", "top_banner_image", "top_banner_link",
  "jetgo:top_banner_image", "atakum:top_banner_image", "atakum:top_banner_link",
  // breed-banners
  "breed_banner_enabled", "breed_banner1_link",
  "jetgo:breed_banner1_link", "atakum:breed_banner1_link",
  // category-banners
  "cat_banner_enabled", "cat_banner1_image", "cat_banner1_enabled",
  "jetgo:cat_banner1_image", "atakum:cat_banner1_image",
  // payment method gate (the order endpoint refuses unknown/disabled methods)
  "payment_nakit_enabled",
  // online card gate (Tosla) — needed so online orders pass the payment gate
  "payment_tosla_enabled", "tosla_client_id", "tosla_api_user", "tosla_api_pass",
  // per-store online-card toggle override (payment-init store-policy test)
  "jetgo:payment_tosla_enabled",
  // per-domain DB-backed Google tags (override) touched by the Google tests
  "atakum:google_tags", "samsun:google_tags", "jetgopet:google_tags",
  // per-domain DB-backed Google Merchant config touched by the Merchant tests
  "samsun:merchant", "atakum:merchant", "markapet:merchant",
  // card/non-cash surcharge: store-wide base rate + jetgo-only per-product overrides
  "card_surcharge_percent", "jetgo:product_surcharge_overrides",
];

let server: ReturnType<typeof createServer>;
let baseUrl = "";
const settingBackup = new Map<string, string | null>();
const ids: {
  banners: number[];
  coupons: number[];
  campaignItems: number[];
  neighborhoods: number[];
  products: number[];
  brandCategories: number[];
  orders: number[];
  customers: number[];
  users: string[];
} = { banners: [], coupons: [], campaignItems: [], neighborhoods: [], products: [], brandCategories: [], orders: [], customers: [], users: [] };

// The order endpoint requires an authenticated, non-blacklisted customer.
// We seed a throwaway customer, forge a PgSession row carrying its id, and sign
// the matching connect.sid cookie with SESSION_SECRET so requests authenticate
// exactly as a real logged-in customer would.
let orderProductId = 0;
let sessionCookie = "";
// Forged admin session cookie (requireAdmin only checks session.userId).
let adminCookie = "";
// A SAMSUN (local same-day, door-payment) customer + its forged session. Used by
// the samsun storefront tests, including the admin->customer tracking round-trip
// (/api/customer/orders looks orders up by the customer's phone, so the order's
// customerPhone must equal this seeded customer's phone).
let samsunCustomerCookie = "";
let samsunCustomerPhone = "";

async function setSetting(key: string, value: string) {
  await pool.query(
    "INSERT INTO app_settings (key, value, updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=NOW()",
    [key, value]
  );
}

// The host is conveyed via X-Forwarded-Host because undici (Node fetch) refuses
// to let callers set the Host header. The test app enables `trust proxy` so
// Express resolves req.hostname from X-Forwarded-Host, mirroring production
// (which sits behind Replit's proxy).
async function get(path: string, host: string) {
  const res = await fetch(`${baseUrl}${path}`, { headers: { "X-Forwarded-Host": host } });
  return { status: res.status, body: await res.json() as any };
}

async function post(path: string, host: string, payload: any, xff?: string) {
  // Optional X-Forwarded-For lets a test run under its OWN client IP so the
  // per-IP rate limiters (otp/order/global) don't accumulate across the shared
  // localhost bucket. The app has `trust proxy` on, so req.ip == this XFF.
  const headers: Record<string, string> = { "X-Forwarded-Host": host, "Content-Type": "application/json" };
  if (xff) headers["X-Forwarded-For"] = xff;
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  return { status: res.status, body: await res.json() as any };
}

// POST as the authenticated test customer (sends the forged session cookie).
async function postAsCustomer(path: string, host: string, payload: any) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "X-Forwarded-Host": host,
      "Content-Type": "application/json",
      Cookie: sessionCookie,
    },
    body: JSON.stringify(payload),
  });
  return { status: res.status, body: await res.json() as any };
}

// PATCH/DELETE as the forged admin (sends the admin session cookie). The body
// (if any) is sent as JSON; the banner PATCH route also tolerates JSON despite
// its multer middleware because multer only consumes multipart requests.
async function patchAdmin(path: string, host: string, payload: any) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "PATCH",
    headers: { "X-Forwarded-Host": host, "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify(payload),
  });
  return { status: res.status, body: await res.json().catch(() => ({})) as any };
}

async function deleteAdmin(path: string, host: string) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "DELETE",
    headers: { "X-Forwarded-Host": host, Cookie: adminCookie },
  });
  return { status: res.status, body: await res.json().catch(() => ({})) as any };
}

// GET as the forged admin (sends the admin session cookie). Needed for
// admin-only read endpoints that also read their store from ?store=.
async function getAdmin(path: string, host: string) {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { "X-Forwarded-Host": host, Cookie: adminCookie },
  });
  return { status: res.status, body: await res.json().catch(() => ({})) as any };
}

// POST as the authenticated test customer under an explicit client IP so the
// per-IP order rate limiter never spills into the shared localhost bucket.
async function postAsCustomerXff(path: string, host: string, payload: any, xff: string) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "X-Forwarded-Host": host,
      "X-Forwarded-For": xff,
      "Content-Type": "application/json",
      Cookie: sessionCookie,
    },
    body: JSON.stringify(payload),
  });
  return { status: res.status, body: await res.json() as any };
}

// Forge a signed connect.sid cookie for a PgSession row carrying the given
// session payload (customerId for buyers, userId for admins).
async function forgeSessionCookie(sessPayload: Record<string, unknown>): Promise<string> {
  const sid = randomBytes(24).toString("hex");
  const maxAge = 30 * 24 * 60 * 60 * 1000;
  const expire = new Date(Date.now() + maxAge);
  const sess = {
    cookie: {
      originalMaxAge: maxAge,
      expires: expire.toISOString(),
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false,
    },
    ...sessPayload,
  };
  await pool.query(
    'INSERT INTO "session" (sid, sess, expire) VALUES ($1, $2, $3)',
    [sid, JSON.stringify(sess), expire]
  );
  return `connect.sid=${encodeURIComponent("s:" + cookieSignature.sign(sid, process.env.SESSION_SECRET!))}`;
}

// Minimal valid order body; server recomputes prices/totals from the DB, so the
// numbers here only need to satisfy the request schema.
const orderPayload = () => ({
  items: [{ productId: orderProductId, name: `${MARK}_PRODUCT`, price: 100, quantity: 1 }],
  subtotal: 100,
  shipping: 0,
  discount: 0,
  grandTotal: 100,
  paymentMethod: "Kapıda Nakit",
  customerName: `${MARK}_BUYER`,
  customerPhone: "5550000000",
  customerAddress: `${MARK} no-match address`,
});

before(async () => {
  // ---- Idempotent pre-clean of any sentinel rows leaked by an interrupted or
  // concurrent prior run. after() only deletes by tracked id, so a crash (or two
  // runs racing against the shared dev DB) leaves orphans behind. The unique
  // (store, upper(code)) coupon and the unique customers.phone then make every
  // re-run's INSERT collide. Coupons are seeded before customers, so the suite
  // currently dies on the coupon dup-key; clean both here so re-runs self-heal.
  {
    const orphCust = await pool.query(
      "SELECT id FROM customers WHERE phone = $1 OR name IN ($2, $3)",
      [`${MARK}_5550000`, `${MARK}_BUYER`, `${MARK}_SAMSUN_BUYER`]
    );
    const orphCustIds = orphCust.rows.map((r: any) => r.id);
    if (orphCustIds.length) {
      // customers is referenced by loyalty_points and the per-customer welcome
      // coupon (coupons.customer_id); orders link only by phone (no FK).
      await pool.query("DELETE FROM loyalty_points WHERE customer_id = ANY($1)", [orphCustIds]);
      await pool.query("DELETE FROM coupons WHERE customer_id = ANY($1)", [orphCustIds]);
      await pool.query("DELETE FROM customers WHERE id = ANY($1)", [orphCustIds]);
    }
    // the admin scope coupons (no customer_id, nothing references them)
    await pool.query("DELETE FROM coupons WHERE code = $1", [`${MARK}COUPON`]);

    // Same crash/timeout orphan problem for the per-scope content rows: a run
    // killed mid-suite (e.g. by the 2-min test runner cap) never reaches after(),
    // leaving MARK-tagged banners / delivery_neighborhoods / campaign_items behind.
    // MARK is a fixed constant, so the next run's onlyTest() then counts both the
    // fresh and the orphaned rows and the deepEqual scope assertions fail. Match on
    // a literal substring (strpos), mirroring onlyTest()'s `.includes(MARK)`.
    // campaign_items reference the MARK product; delete them before the product.
    await pool.query(
      "DELETE FROM campaign_items WHERE product_id IN (SELECT id FROM products WHERE strpos(name, $1) > 0)",
      [MARK]
    );
    await pool.query("DELETE FROM banners WHERE strpos(title, $1) > 0", [MARK]);
    await pool.query("DELETE FROM delivery_neighborhoods WHERE strpos(name, $1) > 0", [MARK]);
  }

  // ---- Boot a fresh app instance against the real (dev) DB ----
  const app = express();
  app.set("trust proxy", true);
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: false, limit: "10mb" }));
  const httpServer = createServer(app);
  // Disable the server's idle keep-alive timeout. undici (node's global fetch)
  // pools a keep-alive socket to baseUrl; during a long run of pure non-fetch
  // unit tests the default ~5s idle timeout closes that socket server-side, and
  // the next test that reuses it fails with a connection-reset "fetch failed".
  // Keeping idle sockets open removes that test-only race (real HTTP clients
  // simply reconnect on reset, so this only affects the in-test client).
  httpServer.keepAliveTimeout = 0;
  httpServer.headersTimeout = 0;
  await registerRoutes(httpServer, app);
  await new Promise<void>((resolve) => {
    server = httpServer.listen(0, "127.0.0.1", () => resolve());
  });
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}`;

  // ---- Snapshot app_settings keys we will overwrite ----
  const snap = await pool.query("SELECT key, value FROM app_settings WHERE key = ANY($1)", [SETTING_KEYS]);
  const existing = new Map<string, string | null>(snap.rows.map((r: any) => [r.key, r.value]));
  for (const k of SETTING_KEYS) settingBackup.set(k, existing.has(k) ? existing.get(k)! : null);

  // ---- Seed app_settings (base + per-store overrides) ----
  await setSetting("campaign_hero_title", "BASE_TITLE");
  await setSetting("jetgo:campaign_hero_title", "JETGO_TITLE");
  await setSetting("atakum:campaign_hero_title", "ATAKUM_TITLE");
  // backward-compat: base-only, no per-store override
  await setSetting("campaign_hero_subtitle", "BASE_SUB");

  await setSetting("top_banner_enabled", "1");
  await setSetting("top_banner_image", "BASE_TOP");
  await setSetting("top_banner_link", "/base-link");
  await setSetting("jetgo:top_banner_image", "JETGO_TOP");
  await setSetting("atakum:top_banner_image", "ATAKUM_TOP");
  await setSetting("atakum:top_banner_link", "/atakum-link");

  await setSetting("breed_banner_enabled", "1");
  await setSetting("breed_banner1_link", "/base-breed");
  await setSetting("jetgo:breed_banner1_link", "/jetgo-breed");
  await setSetting("atakum:breed_banner1_link", "/atakum-breed");

  await setSetting("cat_banner_enabled", "1");
  await setSetting("cat_banner1_enabled", "1");
  await setSetting("cat_banner1_image", "BASE_CAT");
  await setSetting("jetgo:cat_banner1_image", "JETGO_CAT");
  await setSetting("atakum:cat_banner1_image", "ATAKUM_CAT");

  // ---- Seed banners (one per scope) ----
  for (const store of ["all", "jetgo", "atakum"]) {
    const r = await pool.query(
      "INSERT INTO banners (title, is_active, sort_order, position, store) VALUES ($1, true, 0, 'home_top', $2) RETURNING id",
      [`${MARK}_BANNER_${store}`, store]
    );
    ids.banners.push(r.rows[0].id);
  }

  // ---- Seed coupons (one per scope), same code so scoping picks the right one ----
  for (const store of ["all", "jetgo", "atakum"]) {
    const r = await pool.query(
      "INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, is_active, store) VALUES ($1, 'fixed', $2, 0, true, $3) RETURNING id",
      [`${MARK}COUPON`, store === "all" ? 10 : store === "jetgo" ? 20 : 30, store]
    );
    ids.coupons.push(r.rows[0].id);
  }

  // ---- Seed delivery neighborhoods (one per scope) ----
  for (const store of ["all", "jetgo", "atakum"]) {
    const r = await pool.query(
      "INSERT INTO delivery_neighborhoods (district, name, is_active, sort_order, store) VALUES ('TestDistrict', $1, true, 0, $2) RETURNING id",
      [`${MARK}_NH_${store}`, store]
    );
    ids.neighborhoods.push(r.rows[0].id);
  }

  // ---- Seed product + brand_category for campaign-items join ----
  const bc = await pool.query(
    "INSERT INTO brand_categories (brand_name, brand_slug, animal, subcategory) VALUES ($1, $2, 'kedi', 'mama') RETURNING id",
    [`${MARK}_BRAND`, `${MARK}-brand`]
  );
  const brandCategoryId = bc.rows[0].id;
  ids.brandCategories.push(brandCategoryId);
  const prod = await pool.query(
    "INSERT INTO products (name, price, brand_category_id, is_active, stock) VALUES ($1, 100, $2, true, 50) RETURNING id",
    [`${MARK}_PRODUCT`, brandCategoryId]
  );
  const productId = prod.rows[0].id;
  ids.products.push(productId);
  orderProductId = productId;

  // ---- Seed campaign items (one per scope) ----
  for (const store of ["all", "jetgo", "atakum"]) {
    const r = await pool.query(
      "INSERT INTO campaign_items (product_id, item_type, sort_order, is_active, store) VALUES ($1, 'main', 0, true, $2) RETURNING id",
      [productId, store]
    );
    ids.campaignItems.push(r.rows[0].id);
  }

  // ---- Enable cash-on-delivery so the order endpoint accepts the method ----
  await setSetting("payment_nakit_enabled", "1");

  // ---- Enable Tosla online card so the order endpoint accepts "online" ----
  // The order gate requires the method to be enabled AND configured. We never
  // hit the real Tosla API in these tests (we drive the callback directly), so
  // the credentials are throwaway placeholders.
  await setSetting("payment_tosla_enabled", "1");
  await setSetting("tosla_client_id", `${MARK}_CLIENT`);
  await setSetting("tosla_api_user", `${MARK}_USER`);
  await setSetting("tosla_api_pass", `${MARK}_PASS`);

  // ---- Seed a customer and forge its authenticated session ----
  const cust = await pool.query(
    "INSERT INTO customers (phone, password, name, is_blacklisted) VALUES ($1, $2, $3, false) RETURNING id",
    [`${MARK}_5550000`, `${MARK}_PWD`, `${MARK}_BUYER`]
  );
  const customerId = cust.rows[0].id;
  ids.customers.push(customerId);
  sessionCookie = await forgeSessionCookie({ customerId });

  // ---- Forge an admin session (requireAdmin only checks session.userId) ----
  // Reuse an existing admin user if present; otherwise seed a throwaway one.
  const existingUser = await pool.query("SELECT id FROM users LIMIT 1");
  let adminUserId: string = existingUser.rows[0]?.id;
  if (!adminUserId) {
    const u = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
      [`${MARK}_admin`, `${MARK}_pw`]
    );
    adminUserId = u.rows[0].id;
    ids.users.push(adminUserId);
  }
  adminCookie = await forgeSessionCookie({ userId: adminUserId });

  // ---- Seed a SAMSUN customer with a valid numeric phone + forge its session ----
  // The phone must be numeric (the order schema validates it) and is reused as the
  // order's customerPhone so /api/customer/orders can find the order back by phone.
  samsunCustomerPhone = "555" + String(randomBytes(4).readUInt32BE(0)).padStart(7, "0").slice(-7);
  const samCust = await pool.query(
    "INSERT INTO customers (phone, password, name, is_blacklisted) VALUES ($1, $2, $3, false) RETURNING id",
    [samsunCustomerPhone, `${MARK}_PWD`, `${MARK}_SAMSUN_BUYER`]
  );
  ids.customers.push(samCust.rows[0].id);
  samsunCustomerCookie = await forgeSessionCookie({ customerId: samCust.rows[0].id });
});

after(async () => {
  // Remove seeded rows. Order-derived rows (stock movements, loyalty points)
  // are cleared before the orders/customer they reference.
  if (ids.orders.length) {
    await pool.query("DELETE FROM tosla_payment_tokens WHERE order_id = ANY($1)", [ids.orders]);
    await pool.query("DELETE FROM stock_movements WHERE order_id = ANY($1)", [ids.orders]);
    await pool.query("DELETE FROM loyalty_points WHERE order_id = ANY($1)", [ids.orders]);
    await pool.query("DELETE FROM orders WHERE id = ANY($1)", [ids.orders]);
  }
  if (ids.customers.length) {
    await pool.query("DELETE FROM loyalty_points WHERE customer_id = ANY($1)", [ids.customers]);
    // Registration via the OTP bypass also creates a per-customer welcome coupon
    // (coupons.customer_id FK); remove it before deleting the customer.
    await pool.query("DELETE FROM coupons WHERE customer_id = ANY($1)", [ids.customers]);
    await pool.query("DELETE FROM customers WHERE id = ANY($1)", [ids.customers]);
  }
  if (ids.campaignItems.length) await pool.query("DELETE FROM campaign_items WHERE id = ANY($1)", [ids.campaignItems]);
  if (ids.products.length) await pool.query("DELETE FROM products WHERE id = ANY($1)", [ids.products]);
  if (ids.brandCategories.length) await pool.query("DELETE FROM brand_categories WHERE id = ANY($1)", [ids.brandCategories]);
  if (ids.banners.length) await pool.query("DELETE FROM banners WHERE id = ANY($1)", [ids.banners]);
  if (ids.coupons.length) await pool.query("DELETE FROM coupons WHERE id = ANY($1)", [ids.coupons]);
  if (ids.neighborhoods.length) await pool.query("DELETE FROM delivery_neighborhoods WHERE id = ANY($1)", [ids.neighborhoods]);
  if (ids.users.length) await pool.query("DELETE FROM users WHERE id = ANY($1)", [ids.users]);

  // Restore app_settings to their pre-test state.
  for (const [key, value] of settingBackup) {
    if (value === null) {
      await pool.query("DELETE FROM app_settings WHERE key = $1", [key]);
    } else {
      await setSetting(key, value);
    }
  }

  await new Promise<void>((resolve) => server.close(() => resolve()));
  await pool.end();
});

// Helper: from a list of banner-like rows, keep only our seeded test rows.
const onlyTest = (rows: any[], field = "title") =>
  rows.filter((r) => typeof r?.[field] === "string" && r[field].includes(MARK));

test("/api/banners returns only all + host-store banners", async () => {
  const jet = await get("/api/banners", JETGO_HOST);
  const ata = await get("/api/banners", ATAKUM_HOST);

  const jetStores = onlyTest(jet.body).map((b: any) => b.store).sort();
  const ataStores = onlyTest(ata.body).map((b: any) => b.store).sort();

  assert.deepEqual(jetStores, ["all", "jetgo"]);
  assert.deepEqual(ataStores, ["all", "atakum"]);
});

test("/api/delivery-neighborhoods returns only all + host-store zones", async () => {
  const jet = await get("/api/delivery-neighborhoods", JETGO_HOST);
  const ata = await get("/api/delivery-neighborhoods", ATAKUM_HOST);

  const jetStores = onlyTest(jet.body, "name").map((n: any) => n.store).sort();
  const ataStores = onlyTest(ata.body, "name").map((n: any) => n.store).sort();

  assert.deepEqual(jetStores, ["all", "jetgo"]);
  assert.deepEqual(ataStores, ["all", "atakum"]);
});

test("/api/campaign-items returns only all + host-store items", async () => {
  const jet = await get("/api/campaign-items", JETGO_HOST);
  const ata = await get("/api/campaign-items", ATAKUM_HOST);

  const jetStores = onlyTest(jet.body, "name").map((c: any) => c.store).sort();
  const ataStores = onlyTest(ata.body, "name").map((c: any) => c.store).sort();

  assert.deepEqual(jetStores, ["all", "jetgo"]);
  assert.deepEqual(ataStores, ["all", "atakum"]);
});

test("/api/coupons/validate resolves the host-store coupon over the shared one", async () => {
  const jet = await post("/api/coupons/validate", JETGO_HOST, { code: `${MARK}COUPON`, subtotal: 1000 });
  const ata = await post("/api/coupons/validate", ATAKUM_HOST, { code: `${MARK}COUPON`, subtotal: 1000 });

  assert.equal(jet.body.valid, true);
  assert.equal(ata.body.valid, true);
  // jetgo-scoped coupon discount=20, atakum-scoped=30 (shared 'all' would be 10).
  assert.equal(jet.body.discountValue, 20);
  assert.equal(ata.body.discountValue, 30);
});

test("/api/public-settings applies per-store override and base fallback", async () => {
  const jet = await get("/api/public-settings", JETGO_HOST);
  const ata = await get("/api/public-settings", ATAKUM_HOST);

  // Per-store override wins.
  assert.equal(jet.body.campaign_hero_title, "JETGO_TITLE");
  assert.equal(ata.body.campaign_hero_title, "ATAKUM_TITLE");
  // Backward-compat: base value used when no per-store override exists.
  assert.equal(jet.body.campaign_hero_subtitle, "BASE_SUB");
  assert.equal(ata.body.campaign_hero_subtitle, "BASE_SUB");
});

test("/api/public/top-banner overrides image per store, falls back on link", async () => {
  const jet = await get("/api/public/top-banner", JETGO_HOST);
  const ata = await get("/api/public/top-banner", ATAKUM_HOST);

  assert.equal(jet.body.image, "JETGO_TOP");
  assert.equal(ata.body.image, "ATAKUM_TOP");
  // jetgo has no top_banner_link override -> falls back to base (backward-compat).
  assert.equal(jet.body.link, "/base-link");
  // atakum has its own link override.
  assert.equal(ata.body.link, "/atakum-link");
});

test("/api/public/breed-banners scopes link per store", async () => {
  const jet = await get("/api/public/breed-banners", JETGO_HOST);
  const ata = await get("/api/public/breed-banners", ATAKUM_HOST);

  assert.equal(jet.body.b1.link, "/jetgo-breed");
  assert.equal(ata.body.b1.link, "/atakum-breed");
});

test("/api/public/category-banners scopes image per store", async () => {
  const jet = await get("/api/public/category-banners", JETGO_HOST);
  const ata = await get("/api/public/category-banners", ATAKUM_HOST);

  const jetB1 = jet.body.banners.find((b: any) => b.idx === 1);
  const ataB1 = ata.body.banners.find((b: any) => b.idx === 1);

  assert.equal(jetB1.image, "JETGO_CAT");
  assert.equal(ataB1.image, "ATAKUM_CAT");
});

test("default/unknown host resolves base (unprefixed) jetgo settings", async () => {
  // An unknown dev host (e.g. replit preview) falls back to DEFAULT_STORE (jetgo).
  const dev = await get("/api/public-settings", "some-preview.replit.dev");
  // jetgo override exists for campaign_hero_title, so default resolves it too.
  assert.equal(dev.body.campaign_hero_title, "JETGO_TITLE");
  // base fallback for keys without a jetgo override.
  assert.equal(dev.body.campaign_hero_subtitle, "BASE_SUB");
});

// ---- Order source-site attribution (revenue must land on the right store) ----

// Place an order and return the persisted source_site straight from the DB.
async function placeOrderAndReadSource(host: string): Promise<string | null> {
  const res = await postAsCustomer("/api/orders", host, orderPayload());
  assert.equal(res.status, 201, `order POST failed: ${JSON.stringify(res.body)}`);
  const orderId = res.body.id as number;
  assert.ok(orderId, "order id missing in response");
  ids.orders.push(orderId);
  const row = await pool.query("SELECT source_site FROM orders WHERE id = $1", [orderId]);
  return row.rows[0]?.source_site ?? null;
}

test("order on jetgomarket.com is tagged source_site=jetgo", async () => {
  assert.equal(await placeOrderAndReadSource(JETGO_HOST), "jetgo");
});

test("order on atakumpetshop.com is tagged source_site=atakum", async () => {
  assert.equal(await placeOrderAndReadSource(ATAKUM_HOST), "atakum");
});

test("order on an unknown host falls back to source_site=jetgo (default store)", async () => {
  assert.equal(await placeOrderAndReadSource("some-preview.replit.dev"), "jetgo");
});

// ---- jetgomarket-only per-product non-cash surcharge overrides ----
//
// jetgomarket.com (store "jetgo") may set the non-cash surcharge percentage
// PER PRODUCT; the store-wide single rate (card_surcharge_percent) still applies
// to every other product and to all 8 other stores. The HARD RULE is that the
// other stores stay byte-identical: they never see the override key and their
// order totals keep using the single rate even when jetgo has overrides set.

test("product-surcharge-overrides admin API is jetgo-gated, merges, and clears", async () => {
  const pid = orderProductId;
  const otherPid = 987654; // a throwaway id; the endpoint stores the map wholesale
  const PATH = "/api/admin/product-surcharge-overrides";

  // A non-jetgo store must be refused (feature does not exist for the other 8).
  const refused = await patchAdmin(PATH, ATAKUM_HOST, { productId: pid, percent: 8, store: "atakum" });
  assert.equal(refused.status, 400, "non-jetgo PATCH must be refused");
  const ataGet = await getAdmin(`${PATH}?store=atakum`, ATAKUM_HOST);
  assert.deepEqual(ataGet.body, {}, "non-jetgo GET must be empty");

  // Out-of-range percentages are rejected.
  const bad = await patchAdmin(PATH, JETGO_HOST, { productId: pid, percent: 101, store: "jetgo" });
  assert.equal(bad.status, 400, "percent > 100 must be rejected");

  // jetgo can set an override (rate is stored as a whole-number percent).
  const set1 = await patchAdmin(PATH, JETGO_HOST, { productId: pid, percent: 8, store: "jetgo" });
  assert.equal(set1.status, 200, `jetgo PATCH failed: ${JSON.stringify(set1.body)}`);
  let g = await getAdmin(`${PATH}?store=jetgo`, JETGO_HOST);
  assert.equal(g.body[String(pid)], 8, "override must be readable back");

  // A second product merges in without clobbering the first (read-merge-write).
  const set2 = await patchAdmin(PATH, JETGO_HOST, { productId: otherPid, percent: 3, store: "jetgo" });
  assert.equal(set2.status, 200);
  g = await getAdmin(`${PATH}?store=jetgo`, JETGO_HOST);
  assert.equal(g.body[String(pid)], 8, "first override preserved on merge");
  assert.equal(g.body[String(otherPid)], 3, "second override merged in");

  // 0% is a valid, explicit "no surcharge on this product" value (not a clear).
  const setZero = await patchAdmin(PATH, JETGO_HOST, { productId: otherPid, percent: 0, store: "jetgo" });
  assert.equal(setZero.status, 200);
  g = await getAdmin(`${PATH}?store=jetgo`, JETGO_HOST);
  assert.equal(g.body[String(otherPid)], 0, "0% is stored, not treated as a clear");

  // An empty percent clears just that one entry.
  const clearOne = await patchAdmin(PATH, JETGO_HOST, { productId: otherPid, percent: "", store: "jetgo" });
  assert.equal(clearOne.status, 200);
  g = await getAdmin(`${PATH}?store=jetgo`, JETGO_HOST);
  assert.equal(g.body[String(otherPid)], undefined, "cleared entry is gone");
  assert.equal(g.body[String(pid)], 8, "the other entry survives a single clear");

  // Clearing the last entry leaves an empty map.
  const clearLast = await patchAdmin(PATH, JETGO_HOST, { productId: pid, percent: "", store: "jetgo" });
  assert.equal(clearLast.status, 200);
  g = await getAdmin(`${PATH}?store=jetgo`, JETGO_HOST);
  assert.deepEqual(g.body, {}, "map is empty after clearing every entry");
});

test("product_surcharge_overrides surfaces on jetgo public-settings only", async () => {
  const pid = orderProductId;
  await patchAdmin("/api/admin/product-surcharge-overrides", JETGO_HOST, { productId: pid, percent: 8, store: "jetgo" });

  const jet = await get("/api/public-settings", JETGO_HOST);
  assert.ok(jet.body.product_surcharge_overrides, "jetgo public-settings must expose the overrides");
  const map = JSON.parse(jet.body.product_surcharge_overrides);
  assert.equal(map[String(pid)], 8, "jetgo public-settings carries the override percent");

  // Every other store must be byte-identical: no override key at all.
  const ata = await get("/api/public-settings", ATAKUM_HOST);
  assert.equal(ata.body.product_surcharge_overrides, undefined, "other stores must NOT see the override key");
});

test("order surcharge: jetgo applies the per-product override; other stores stay single-rate", async () => {
  const pid = orderProductId;
  // Deterministic store-wide base rate for this test (default is also 5%).
  await setSetting("card_surcharge_percent", "5");
  // jetgo overrides THIS product to 8%.
  await patchAdmin("/api/admin/product-surcharge-overrides", JETGO_HOST, { productId: pid, percent: 8, store: "jetgo" });

  // The non-cash surcharge is added to the subtotal only (not shipping/discount),
  // so isolate it as grand_total - subtotal - shipping (discount is 0 here). This
  // stays correct regardless of each store's shipping / free-shipping rules.
  const surchargeOf = (row: any) =>
    Math.round((Number(row.grand_total) - Number(row.subtotal) - Number(row.shipping)) * 100) / 100;

  // jetgo POS (non-cash) order: subtotal 100, this product overridden to 8% -> 8.
  const jetRes = await postAsCustomerXff(
    "/api/orders", JETGO_HOST,
    { ...orderPayload(), paymentMethod: "Kapıda Kredi Kartı" },
    "10.91.0.11",
  );
  assert.equal(jetRes.status, 201, `jetgo order failed: ${JSON.stringify(jetRes.body)}`);
  ids.orders.push(jetRes.body.id);
  const jetRow = (await pool.query("SELECT subtotal, shipping, grand_total FROM orders WHERE id = $1", [jetRes.body.id])).rows[0];
  assert.equal(Number(jetRow.subtotal), 100, "subtotal recomputed from the seeded product");
  assert.equal(surchargeOf(jetRow), 8, "jetgo uses the per-product 8% override");

  // atakum POS order with the SAME jetgo override live: it never sees it, so it
  // stays on the store-wide 5% -> surcharge 5 (byte-identical behavior).
  const ataRes = await postAsCustomerXff(
    "/api/orders", ATAKUM_HOST,
    { ...orderPayload(), paymentMethod: "Kapıda Kredi Kartı" },
    "10.91.0.12",
  );
  assert.equal(ataRes.status, 201, `atakum order failed: ${JSON.stringify(ataRes.body)}`);
  ids.orders.push(ataRes.body.id);
  const ataRow = (await pool.query("SELECT subtotal, shipping, grand_total FROM orders WHERE id = $1", [ataRes.body.id])).rows[0];
  assert.equal(Number(ataRow.subtotal), 100, "subtotal recomputed from the seeded product");
  assert.equal(surchargeOf(ataRow), 5, "atakum stays on the store-wide single rate");
});

// ---- Test-only OTP bypass: full SMS-gated registration + Atakum checkout ----
//
// Customer registration is gated behind a real SMS OTP (phone -> OTP -> name +
// Mahalle/address), which automated tests cannot satisfy. server/routes.ts adds
// a guarded bypass (isTestOtpBypass): when NODE_ENV !== "production" AND
// TEST_OTP_BYPASS=1, /api/otp/send skips the SMS and stores a fixed code
// (TEST_OTP_CODE="0000") that /api/otp/verify accepts. These tests prove the
// bypass is correctly dual-guarded and that it lets a brand-new customer
// register and place a real local (Atakum) order end to end — no forged
// session, no real SMS. This is the server-side complement to the browser smoke.

test("isTestOtpBypass is double-guarded (dev+flag only, never production)", () => {
  const prevEnv = process.env.NODE_ENV;
  const prevFlag = process.env.TEST_OTP_BYPASS;
  try {
    process.env.NODE_ENV = "development";
    process.env.TEST_OTP_BYPASS = "1";
    assert.equal(isTestOtpBypass(), true, "enabled in dev with the flag set");

    process.env.NODE_ENV = "production";
    process.env.TEST_OTP_BYPASS = "1";
    assert.equal(isTestOtpBypass(), false, "MUST stay off in production even with the flag");

    process.env.NODE_ENV = "development";
    delete process.env.TEST_OTP_BYPASS;
    assert.equal(isTestOtpBypass(), false, "off in dev when the flag is absent");

    process.env.TEST_OTP_BYPASS = "0";
    assert.equal(isTestOtpBypass(), false, "off in dev when the flag is not exactly '1'");
  } finally {
    if (prevEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = prevEnv;
    if (prevFlag === undefined) delete process.env.TEST_OTP_BYPASS; else process.env.TEST_OTP_BYPASS = prevFlag;
  }
});

test("test-OTP bypass lets a NEW customer register and place an Atakum order end to end", async () => {
  const prevEnv = process.env.NODE_ENV;
  const prevFlag = process.env.TEST_OTP_BYPASS;
  process.env.NODE_ENV = "development";
  process.env.TEST_OTP_BYPASS = "1";

  // A fresh, never-seen numeric phone so the verify flow takes the registration
  // branch (existing customers would log straight in without registering).
  const phone = "555" + String(randomBytes(4).readUInt32BE(0)).padStart(7, "0").slice(-7);
  let createdCustomerId: number | undefined;
  try {
    // 1) Request the OTP. The bypass must skip SMS and report this is a new phone.
    const send = await post("/api/otp/send", ATAKUM_HOST, { phone });
    assert.equal(send.status, 200, `otp/send failed: ${JSON.stringify(send.body)}`);
    assert.equal(send.body.isExisting, false, "fresh phone must be reported as new");

    // 2) Verify with just the code (no name) -> server asks for registration.
    const step1 = await post("/api/otp/verify", ATAKUM_HOST, { phone, code: "0000" });
    assert.equal(step1.status, 200, `otp/verify step1 failed: ${JSON.stringify(step1.body)}`);
    assert.equal(step1.body.requiresRegistration, true, "new phone must require registration");

    // 3) Complete registration (name + Mahalle-style address). This creates the
    //    customer and returns a REAL signed session cookie (no forging).
    const regRes = await fetch(`${baseUrl}/api/otp/verify`, {
      method: "POST",
      headers: { "X-Forwarded-Host": ATAKUM_HOST, "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        code: "0000",
        name: `${MARK}_OTP_BUYER`,
        address: `${MARK} Atakum Mah., Test Cad. No 5`,
      }),
    });
    const regBody = await regRes.json() as any;
    assert.equal(regRes.status, 200, `registration failed: ${JSON.stringify(regBody)}`);
    assert.ok(regBody.id, "registration must return the new customer id");
    assert.equal(regBody.isNewUser, true, "registration must create a new customer");
    createdCustomerId = regBody.id as number;
    ids.customers.push(createdCustomerId);

    const setCookie = regRes.headers.get("set-cookie");
    assert.ok(setCookie && setCookie.includes("connect.sid"), "registration must set a session cookie");
    const realCookie = setCookie!.split(";")[0];

    // 4) Place a local Atakum order as the freshly-registered customer, using the
    //    real session cookie from registration. Proves the full SMS-gated path
    //    is now traversable end to end by an automated test.
    const order = await postWithCookie(
      "/api/orders",
      ATAKUM_HOST,
      { ...orderPayload(), customerName: `${MARK}_OTP_BUYER`, customerPhone: phone },
      realCookie,
    );
    assert.equal(order.status, 201, `order POST failed: ${JSON.stringify(order.body)}`);
    const orderId = order.body.id as number;
    assert.ok(orderId, "order id missing in response");
    ids.orders.push(orderId);
    const row = await pool.query("SELECT source_site FROM orders WHERE id = $1", [orderId]);
    assert.equal(row.rows[0]?.source_site, "atakum", "order must attribute to the Atakum storefront");
  } finally {
    if (prevEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = prevEnv;
    if (prevFlag === undefined) delete process.env.TEST_OTP_BYPASS; else process.env.TEST_OTP_BYPASS = prevFlag;
  }
});

// ---- Returning customer: log in (no re-registration) and reuse saved address ----
//
// The new-customer test above proves the registration branch (fresh phone ->
// OTP -> name + Mahalle). This is the OTHER half of the auth flow: an EXISTING
// customer who already has an account + saved address. For them /api/otp/verify
// must log them straight in WITHOUT requiresRegistration, return their saved
// address, and let them place an order immediately. This is the persistent,
// server-side complement to the returning-customer browser smoke (testing skill).
test("test-OTP bypass logs a RETURNING customer in without re-registration and reuses the saved address", async () => {
  const prevEnv = process.env.NODE_ENV;
  const prevFlag = process.env.TEST_OTP_BYPASS;
  process.env.NODE_ENV = "development";
  process.env.TEST_OTP_BYPASS = "1";

  const phone = "555" + String(randomBytes(4).readUInt32BE(0)).padStart(7, "0").slice(-7);
  const savedAddress = `${MARK} Atakum Mah., Kayıtlı Cad. No 7`;
  try {
    // ---- Setup: register the customer once (the "first visit") so they exist
    //      with a saved address. This mirrors a customer who signed up earlier. ----
    const setupSend = await post("/api/otp/send", ATAKUM_HOST, { phone });
    assert.equal(setupSend.status, 200, `setup otp/send failed: ${JSON.stringify(setupSend.body)}`);
    assert.equal(setupSend.body.isExisting, false, "phone must be new before registration");

    const regRes = await fetch(`${baseUrl}/api/otp/verify`, {
      method: "POST",
      headers: { "X-Forwarded-Host": ATAKUM_HOST, "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        code: "0000",
        name: `${MARK}_RETURNING_BUYER`,
        address: savedAddress,
      }),
    });
    const regBody = await regRes.json() as any;
    assert.equal(regRes.status, 200, `setup registration failed: ${JSON.stringify(regBody)}`);
    assert.ok(regBody.id, "setup registration must return the new customer id");
    assert.equal(regBody.isNewUser, true, "first visit must create the customer");
    ids.customers.push(regBody.id as number);

    // ---- Returning visit (a fresh context: NO cookie carried over) ----
    // 1) otp/send must now recognise the phone as an existing customer. This is
    //    what flips the checkout UI from "register" to "login" mode.
    const send = await post("/api/otp/send", ATAKUM_HOST, { phone });
    assert.equal(send.status, 200, `otp/send failed: ${JSON.stringify(send.body)}`);
    assert.equal(send.body.isExisting, true, "returning phone must be reported as existing");

    // 2) Verify with JUST the code (no name/address). The server must log the
    //    customer straight in — NO requiresRegistration — because they already
    //    have an account. This is the step the checkout's doAuthVerify relies on
    //    to close the modal instead of showing the registration form.
    const verifyRes = await fetch(`${baseUrl}/api/otp/verify`, {
      method: "POST",
      headers: { "X-Forwarded-Host": ATAKUM_HOST, "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code: "0000" }),
    });
    const verifyBody = await verifyRes.json() as any;
    assert.equal(verifyRes.status, 200, `otp/verify failed: ${JSON.stringify(verifyBody)}`);
    assert.ok(!verifyBody.requiresRegistration, "returning customer must NOT be asked to register again");
    assert.equal(verifyBody.isNewUser, false, "returning login must not create a new customer");
    assert.equal(verifyBody.id, regBody.id, "returning login must resolve the SAME customer");
    // The saved address comes back on login so checkout can pre-fill it.
    assert.equal(verifyBody.address, savedAddress, "returning login must return the saved address");

    const setCookie = verifyRes.headers.get("set-cookie");
    assert.ok(setCookie && setCookie.includes("connect.sid"), "returning login must set a session cookie");
    const realCookie = setCookie!.split(";")[0];

    // 3) The saved address is reused: /api/customer/me (read by the checkout to
    //    pre-fill the address field) returns it for the logged-in session.
    const me = await getWithCookie("/api/customer/me", ATAKUM_HOST, realCookie);
    assert.equal(me.status, 200, `customer/me failed: ${JSON.stringify(me.body)}`);
    assert.equal(me.body.address, savedAddress, "saved address must be reused for the returning customer");

    // 4) The returning customer can place an order immediately, without ever
    //    re-registering. Uses the real session cookie from the login above.
    const order = await postWithCookie(
      "/api/orders",
      ATAKUM_HOST,
      { ...orderPayload(), customerName: `${MARK}_RETURNING_BUYER`, customerPhone: phone },
      realCookie,
    );
    assert.equal(order.status, 201, `returning-customer order POST failed: ${JSON.stringify(order.body)}`);
    const orderId = order.body.id as number;
    assert.ok(orderId, "order id missing in response");
    ids.orders.push(orderId);
    const row = await pool.query("SELECT source_site FROM orders WHERE id = $1", [orderId]);
    assert.equal(row.rows[0]?.source_site, "atakum", "order must attribute to the Atakum storefront");
  } finally {
    if (prevEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = prevEnv;
    if (prevFlag === undefined) delete process.env.TEST_OTP_BYPASS; else process.env.TEST_OTP_BYPASS = prevFlag;
  }
});

// ---- samsun (local same-day, door-payment) storefront behavior + tracking ----
//
// samsun (atakumpet.com) is a LOCAL same-day store: fulfillment "local",
// onlinePaymentOnly false, preorderEnabled true (shared/stores.ts). These tests
// exercise the server-enforced store behavior end-to-end and the admin -> customer
// order-tracking round-trip, complementing the client-side UI smoke (home/PDP/
// checkout branding) run via the testing skill.

// POST as a specific (cookie-identified) customer.
async function postWithCookie(path: string, host: string, payload: any, cookie: string, xff?: string) {
  // See post(): optional XFF isolates this request under its own per-IP bucket.
  const headers: Record<string, string> = { "X-Forwarded-Host": host, "Content-Type": "application/json", Cookie: cookie };
  if (xff) headers["X-Forwarded-For"] = xff;
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  return { status: res.status, body: await res.json() as any };
}

// GET as a specific (cookie-identified) customer.
async function getWithCookie(path: string, host: string, cookie: string) {
  const res = await fetch(`${baseUrl}${path}`, { headers: { "X-Forwarded-Host": host, Cookie: cookie } });
  return { status: res.status, body: await res.json() as any };
}

// A valid samsun online order for the seeded samsun customer. The local store now
// accepts BOTH door and online payment; this helper exercises the online-card path
// (which still starts pending). The customerPhone must match for the read-back.
const samsunOnlineOrder = () => ({
  ...orderPayload(),
  paymentMethod: "online",
  customerPhone: samsunCustomerPhone,
});

test("samsun accepts door payment — local same-day store (201)", async () => {
  const res = await postWithCookie(
    "/api/orders",
    SAMSUN_HOST,
    { ...samsunOnlineOrder(), paymentMethod: "Kapıda Nakit" },
    samsunCustomerCookie,
  );
  assert.equal(res.status, 201, `door payment must be accepted on the local store: ${JSON.stringify(res.body)}`);
  ids.orders.push(res.body.id as number);
});

// ---- Client-render counterpart: local checkout OFFERS in-person payment ----
//
// samsun is a LOCAL same-day store, so its checkout must OFFER the in-person
// ("Kapıda") payment surfaces (and the door-POS installment block when POS is
// enabled). These tests assert the pure render helpers (the exact logic
// checkout.tsx renders with) so the door surfaces can never silently disappear
// on a local storefront. They are driven by the real shared/stores.ts config
// (samsun + atakum: onlinePaymentOnly false) so they stay honest if it changes.

// Default-enabled gateway state: every method configured & enabled. The store's
// onlinePaymentOnly flag (not these) is what must suppress the door options.
const allMethodsEnabled = {
  onlineCardEnabled: true,
  nakitEnabled: true,
  eftEnabled: true,
  qrEnabled: true,
  donationDelivery: false,
  hasPreorder: false,
  hiddenPaymentMethods: [] as string[],
};

test("checkout on samsun (local store) DOES offer in-person payment surfaces", () => {
  const samsun = getStoreByHost(SAMSUN_HOST);
  assert.equal(samsun.id, "samsun");
  assert.equal(samsun.commerce.onlinePaymentOnly, false, "samsun must allow in-person payment");

  const opts = visiblePaymentOptions({
    ...allMethodsEnabled,
    onlinePaymentOnly: samsun.commerce.onlinePaymentOnly,
  });
  const ids = opts.map((o) => o.id);

  // In-person door options + online card are all available on the local store.
  for (const allowed of ["nakit", "eft", "qr", "online"]) {
    assert.ok(ids.includes(allowed), `local store should offer "${allowed}"`);
  }
  // The door-POS installment block is allowed when POS is enabled.
  assert.equal(
    showDoorPosInstallments({
      onlinePaymentOnly: samsun.commerce.onlinePaymentOnly,
      hasCampaignItems: false,
      hasPreorderItems: false,
      posEnabled: true,
    }),
    true,
    "door-POS installment block should render on the local store",
  );
});

test("checkout on atakum (local store) DOES offer in-person payment surfaces", () => {
  const atakum = getStoreByHost(ATAKUM_HOST);
  assert.equal(atakum.id, "atakum");
  assert.equal(atakum.commerce.onlinePaymentOnly, false, "atakum must allow in-person payment");

  const opts = visiblePaymentOptions({
    ...allMethodsEnabled,
    onlinePaymentOnly: atakum.commerce.onlinePaymentOnly,
  });
  const ids = opts.map((o) => o.id);

  // In-person door options + online card are all available on the local store.
  for (const allowed of ["nakit", "eft", "qr", "online"]) {
    assert.ok(ids.includes(allowed), `local store should offer "${allowed}"`);
  }
  // The door-POS installment block is allowed when POS is enabled.
  assert.equal(
    showDoorPosInstallments({
      onlinePaymentOnly: atakum.commerce.onlinePaymentOnly,
      hasCampaignItems: false,
      hasPreorderItems: false,
      posEnabled: true,
    }),
    true,
    "door-POS installment block should render on the local store",
  );
});

test("online order on atakumpet.com is tagged source_site=samsun and starts pending", async () => {
  const res = await postWithCookie("/api/orders", SAMSUN_HOST, samsunOnlineOrder(), samsunCustomerCookie);
  assert.equal(res.status, 201, `samsun order POST failed: ${JSON.stringify(res.body)}`);
  const orderId = res.body.id as number;
  assert.ok(orderId, "order id missing in response");
  ids.orders.push(orderId);
  const row = await pool.query("SELECT source_site, payment_status FROM orders WHERE id = $1", [orderId]);
  assert.equal(row.rows[0].source_site, "samsun");
  assert.equal(row.rows[0].payment_status, "pending", "online orders must start pending");
});

// Persistent, server-side complement to the browser smoke (testing skill runTest)
// for the samsun storefront: a brand-new customer registers via the OTP bypass on
// the samsun host and places a LOCAL same-day order end to end. Mirrors the Atakum
// end-to-end test above and asserts the LOCAL contract: door payment is accepted
// and the order attributes to the samsun storefront. The browser smoke
// additionally verifies the visual contract (Mahalle picker, "Getirmesi" label,
// in-person payment UI) which cannot be asserted at the API layer.
test("test-OTP bypass lets a NEW customer register and place a SAMSUN local order end to end", async () => {
  const prevEnv = process.env.NODE_ENV;
  const prevFlag = process.env.TEST_OTP_BYPASS;
  process.env.NODE_ENV = "development";
  process.env.TEST_OTP_BYPASS = "1";

  // Fresh, never-seen phone so verify takes the registration branch.
  const phone = "555" + String(randomBytes(4).readUInt32BE(0)).padStart(7, "0").slice(-7);
  let createdCustomerId: number | undefined;
  try {
    // 1) Request the OTP on the samsun host. Bypass skips SMS, reports new phone.
    const send = await post("/api/otp/send", SAMSUN_HOST, { phone });
    assert.equal(send.status, 200, `otp/send failed: ${JSON.stringify(send.body)}`);
    assert.equal(send.body.isExisting, false, "fresh phone must be reported as new");

    // 2) Verify with just the code -> server asks for registration.
    const step1 = await post("/api/otp/verify", SAMSUN_HOST, { phone, code: "0000" });
    assert.equal(step1.status, 200, `otp/verify step1 failed: ${JSON.stringify(step1.body)}`);
    assert.equal(step1.body.requiresRegistration, true, "new phone must require registration");

    // 3) Complete registration with name + address. Returns a real signed session
    //    cookie.
    const regRes = await fetch(`${baseUrl}/api/otp/verify`, {
      method: "POST",
      headers: { "X-Forwarded-Host": SAMSUN_HOST, "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        code: "0000",
        name: `${MARK}_LOCAL_BUYER`,
        address: `${MARK} Atakum Mah., Deneme Cad. No 10`,
      }),
    });
    const regBody = await regRes.json() as any;
    assert.equal(regRes.status, 200, `registration failed: ${JSON.stringify(regBody)}`);
    assert.ok(regBody.id, "registration must return the new customer id");
    assert.equal(regBody.isNewUser, true, "registration must create a new customer");
    createdCustomerId = regBody.id as number;
    ids.customers.push(createdCustomerId);

    const setCookie = regRes.headers.get("set-cookie");
    assert.ok(setCookie && setCookie.includes("connect.sid"), "registration must set a session cookie");
    const realCookie = setCookie!.split(";")[0];

    // 4) Place a local same-day order (door payment accepted) as the freshly-
    //    registered customer, using the real session cookie from registration.
    const order = await postWithCookie(
      "/api/orders",
      SAMSUN_HOST,
      { ...orderPayload(), customerName: `${MARK}_LOCAL_BUYER`, customerPhone: phone },
      realCookie,
    );
    assert.equal(order.status, 201, `samsun order POST failed: ${JSON.stringify(order.body)}`);
    const orderId = order.body.id as number;
    assert.ok(orderId, "order id missing in response");
    ids.orders.push(orderId);

    // 5) Order attributes to the samsun storefront.
    const row = await pool.query("SELECT source_site FROM orders WHERE id = $1", [orderId]);
    assert.equal(row.rows[0].source_site, "samsun", "order must attribute to the samsun storefront");
  } finally {
    if (prevEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = prevEnv;
    if (prevFlag === undefined) delete process.env.TEST_OTP_BYPASS; else process.env.TEST_OTP_BYPASS = prevFlag;
  }
});

test("admin-entered shipment tracking becomes visible to the customer", async () => {
  // 1) Customer places an online order on the samsun storefront.
  const created = await postWithCookie("/api/orders", SAMSUN_HOST, samsunOnlineOrder(), samsunCustomerCookie);
  assert.equal(created.status, 201, `samsun order POST failed: ${JSON.stringify(created.body)}`);
  const orderId = created.body.id as number;
  assert.ok(orderId, "order id missing in response");
  ids.orders.push(orderId);

  // 2) Admin enters the cargo company + tracking number for that order.
  const patched = await patchAdmin(`/api/admin/orders/${orderId}/tracking`, SAMSUN_HOST, {
    cargoCompany: "Yurtiçi Kargo",
    trackingNumber: `${MARK}TRACK`,
  });
  assert.equal(patched.status, 200, `tracking PATCH failed: ${JSON.stringify(patched.body)}`);
  assert.equal(patched.body.trackingNumber, `${MARK}TRACK`);
  assert.ok(
    String(patched.body.trackingUrl).includes("yurticikargo"),
    "server should build the tracking URL from the cargo-company template",
  );

  // 3) The customer reads their own orders and sees the tracking the admin entered.
  const mine = await getWithCookie("/api/customer/orders", SAMSUN_HOST, samsunCustomerCookie);
  assert.equal(mine.status, 200);
  const order = (mine.body as any[]).find((o) => o.id === orderId);
  assert.ok(order, "customer should see their tracked order");
  assert.equal(order.cargoCompany, "Yurtiçi Kargo");
  assert.equal(order.trackingNumber, `${MARK}TRACK`);
  assert.ok(
    String(order.trackingUrl).includes(`${MARK}TRACK`),
    "customer-facing order must carry the tracking URL",
  );
});

// ---- Online card source-site attribution across the payment-completion path ----
//
// Online card orders (Tosla / iyzico / "online") take a different path than
// cash/door orders: they are created with payment_status='pending' (stock
// already decremented) and only become visible/counted once the payment
// callback flips them to 'completed'. A regression in that completion path
// could move confirmed revenue to the wrong storefront. These tests drive a
// real order through creation -> Tosla callback success and assert source_site
// (set at creation) survives intact after the order leaves pending/awaiting.

// Online-payment order body (paymentMethod "online" triggers payment_status
// 'pending' and routes through the online-card gate, which we enabled above).
const onlineOrderPayload = () => ({ ...orderPayload(), paymentMethod: "online" });

// Compute the Tosla callback Hash exactly like the server (toslaCallbackHash):
// sha512(api_pass + client_id + api_user + OrderId + MdStatus + BankResponseCode
// + BankResponseMessage + RequestStatus) in base64. Reads the (global) merchant
// creds from app_settings so the simulated callback is signed like a real one.
async function toslaCallbackHash(p: {
  orderId: string; mdStatus: string; bankResponseCode: string;
  bankResponseMessage: string; requestStatus: string;
}): Promise<string> {
  const r = await pool.query(
    "SELECT key, value FROM app_settings WHERE key IN ('tosla_client_id','tosla_api_user','tosla_api_pass')"
  );
  const cfg: Record<string, string> = {};
  for (const row of r.rows) cfg[row.key] = row.value;
  const data = `${cfg.tosla_api_pass || ""}${cfg.tosla_client_id || ""}${cfg.tosla_api_user || ""}` +
    `${p.orderId}${p.mdStatus}${p.bankResponseCode}${p.bankResponseMessage}${p.requestStatus}`;
  return createHash("sha512").update(data, "utf8").digest("base64");
}

// Drive an online order through the full completion path for a given host and
// return its source_site read straight from the DB *after* it is marked paid.
async function completeOnlineOrderAndReadSource(host: string): Promise<{
  sourceAtCreation: string | null;
  statusAtCreation: string | null;
  sourceAfterComplete: string | null;
  statusAfterComplete: string | null;
}> {
  // 1) Create the order — should land as payment_status='pending'.
  const res = await postAsCustomer("/api/orders", host, onlineOrderPayload());
  assert.equal(res.status, 201, `online order POST failed: ${JSON.stringify(res.body)}`);
  const orderId = res.body.id as number;
  assert.ok(orderId, "order id missing in response");
  ids.orders.push(orderId);

  const created = await pool.query(
    "SELECT source_site, payment_status FROM orders WHERE id = $1",
    [orderId]
  );
  const sourceAtCreation = created.rows[0]?.source_site ?? null;
  const statusAtCreation = created.rows[0]?.payment_status ?? null;

  // 2) Simulate init-payment: register a Tosla payment token (status 'pending')
  //    for this order. We never hit the real Tosla API; we just create the
  //    token the callback looks up by merchant order id.
  const merchantOrderId = `${MARK}TOK${orderId}`;
  await pool.query(
    `INSERT INTO tosla_payment_tokens (token, order_id, amount, status, updated_at)
     VALUES ($1, $2, $3, 'pending', NOW())`,
    [merchantOrderId, orderId, 100]
  );
  // Order moves to 'awaiting' once the hosted-payment page is opened.
  await pool.query("UPDATE orders SET payment_status = 'awaiting' WHERE id = $1", [orderId]);

  // 3) Drive the bank callback with a success payload (BankResponseCode '00').
  //    The callback flips both the token and the order to 'completed'. We use
  //    GET with query params and disable redirect-following (the callback 303s
  //    to the result page).
  const cbHash = await toslaCallbackHash({
    orderId: merchantOrderId, mdStatus: "1", bankResponseCode: "00",
    bankResponseMessage: "", requestStatus: "1",
  });
  const cbUrl = `${baseUrl}/api/tosla/callback?OrderId=${encodeURIComponent(merchantOrderId)}` +
    `&Code=0&BankResponseCode=00&MdStatus=1&RequestStatus=1&Hash=${encodeURIComponent(cbHash)}`;
  const cbRes = await fetch(cbUrl, { headers: { "X-Forwarded-Host": host }, redirect: "manual" });
  assert.ok(cbRes.status >= 300 && cbRes.status < 400, `callback expected redirect, got ${cbRes.status}`);

  const completed = await pool.query(
    "SELECT source_site, payment_status FROM orders WHERE id = $1",
    [orderId]
  );
  return {
    sourceAtCreation,
    statusAtCreation,
    sourceAfterComplete: completed.rows[0]?.source_site ?? null,
    statusAfterComplete: completed.rows[0]?.payment_status ?? null,
  };
}

test("online order on jetgomarket.com stays source_site=jetgo through payment completion", async () => {
  const r = await completeOnlineOrderAndReadSource(JETGO_HOST);
  assert.equal(r.statusAtCreation, "pending", "online orders must start pending");
  assert.equal(r.sourceAtCreation, "jetgo");
  assert.equal(r.statusAfterComplete, "completed", "callback must mark the order paid");
  assert.equal(r.sourceAfterComplete, "jetgo", "source_site must survive completion");
});

test("online order on atakumpetshop.com stays source_site=atakum through payment completion", async () => {
  const r = await completeOnlineOrderAndReadSource(ATAKUM_HOST);
  assert.equal(r.statusAtCreation, "pending");
  assert.equal(r.sourceAtCreation, "atakum");
  assert.equal(r.statusAfterComplete, "completed");
  assert.equal(r.sourceAfterComplete, "atakum", "source_site must survive completion");
});

test("online order on an unknown host stays source_site=jetgo (default store) through completion", async () => {
  const r = await completeOnlineOrderAndReadSource("some-preview.replit.dev");
  assert.equal(r.statusAtCreation, "pending");
  assert.equal(r.sourceAtCreation, "jetgo");
  assert.equal(r.statusAfterComplete, "completed");
  assert.equal(r.sourceAfterComplete, "jetgo", "source_site must survive completion");
});

// ---- SECURITY: Tosla callback must NOT complete without a valid signature ----
//
// /api/tosla/callback is public and its success fields (Code/BankResponseCode/
// MdStatus/RequestStatus) are attacker-controllable; the buyer also knows their
// own merchantOrderId token. The Tosla Hash (only producible with merchant secret
// keys) is the sole proof of a genuine payment. A success-looking callback with no
// hash (or a wrong hash) must leave the order in 'awaiting' — never 'completed'.
test("tosla callback rejects success payload without a valid hash (no fraud completion)", async () => {
  const res = await postAsCustomer("/api/orders", JETGO_HOST, onlineOrderPayload());
  assert.equal(res.status, 201, `online order POST failed: ${JSON.stringify(res.body)}`);
  const orderId = res.body.id as number;
  ids.orders.push(orderId);

  const merchantOrderId = `${MARK}NOHASH${orderId}`;
  await pool.query(
    `INSERT INTO tosla_payment_tokens (token, order_id, amount, status, updated_at)
     VALUES ($1, $2, $3, 'pending', NOW())`,
    [merchantOrderId, orderId, 100],
  );
  await pool.query("UPDATE orders SET payment_status = 'awaiting' WHERE id = $1", [orderId]);

  const successQs = `OrderId=${encodeURIComponent(merchantOrderId)}&Code=0&BankResponseCode=00&MdStatus=1&RequestStatus=1`;

  // (a) No Hash at all → must be rejected.
  const noHash = await fetch(`${baseUrl}/api/tosla/callback?${successQs}`, {
    headers: { "X-Forwarded-Host": JETGO_HOST }, redirect: "manual",
  });
  assert.ok(noHash.status >= 300 && noHash.status < 400, `expected redirect, got ${noHash.status}`);
  let row = await pool.query("SELECT payment_status FROM orders WHERE id = $1", [orderId]);
  assert.equal(row.rows[0]?.payment_status, "awaiting", "no-hash callback must NOT complete the order");
  let tok = await pool.query("SELECT status FROM tosla_payment_tokens WHERE token = $1", [merchantOrderId]);
  assert.equal(tok.rows[0]?.status, "pending", "no-hash callback must leave the token pending");

  // (b) Wrong Hash → must be rejected.
  const wrongHash = await fetch(`${baseUrl}/api/tosla/callback?${successQs}&Hash=${encodeURIComponent("not-a-real-hash")}`, {
    headers: { "X-Forwarded-Host": JETGO_HOST }, redirect: "manual",
  });
  assert.ok(wrongHash.status >= 300 && wrongHash.status < 400, `expected redirect, got ${wrongHash.status}`);
  row = await pool.query("SELECT payment_status FROM orders WHERE id = $1", [orderId]);
  assert.equal(row.rows[0]?.payment_status, "awaiting", "wrong-hash callback must NOT complete the order");
  tok = await pool.query("SELECT status FROM tosla_payment_tokens WHERE token = $1", [merchantOrderId]);
  assert.equal(tok.rows[0]?.status, "pending", "wrong-hash callback must leave the token pending");

  // (c) Valid Hash → now it completes (proves legitimate callbacks still work).
  const goodHash = await toslaCallbackHash({
    orderId: merchantOrderId, mdStatus: "1", bankResponseCode: "00",
    bankResponseMessage: "", requestStatus: "1",
  });
  const ok = await fetch(`${baseUrl}/api/tosla/callback?${successQs}&Hash=${encodeURIComponent(goodHash)}`, {
    headers: { "X-Forwarded-Host": JETGO_HOST }, redirect: "manual",
  });
  assert.ok(ok.status >= 300 && ok.status < 400, `expected redirect, got ${ok.status}`);
  row = await pool.query("SELECT payment_status FROM orders WHERE id = $1", [orderId]);
  assert.equal(row.rows[0]?.payment_status, "completed", "valid-hash callback must complete the order");
});

// The Tosla webhook (server-to-server channel) shares the same signature
// requirement: an unsigned success notification must not complete the order, but
// a properly signed one must. (Webhook always answers 200, so we assert DB state.)
test("tosla webhook rejects success payload without a valid hash, accepts a signed one", async () => {
  const res = await postAsCustomer("/api/orders", JETGO_HOST, onlineOrderPayload());
  assert.equal(res.status, 201, `online order POST failed: ${JSON.stringify(res.body)}`);
  const orderId = res.body.id as number;
  ids.orders.push(orderId);

  const merchantOrderId = `${MARK}WH${orderId}`;
  await pool.query(
    `INSERT INTO tosla_payment_tokens (token, order_id, amount, status, updated_at)
     VALUES ($1, $2, $3, 'pending', NOW())`,
    [merchantOrderId, orderId, 100],
  );
  await pool.query("UPDATE orders SET payment_status = 'awaiting' WHERE id = $1", [orderId]);

  const successQs = `OrderId=${encodeURIComponent(merchantOrderId)}&Code=0&BankResponseCode=00&MdStatus=1&RequestStatus=1`;

  // No Hash → must not complete.
  await fetch(`${baseUrl}/api/tosla/webhook?${successQs}`, {
    headers: { "X-Forwarded-Host": JETGO_HOST },
  });
  let row = await pool.query("SELECT payment_status FROM orders WHERE id = $1", [orderId]);
  assert.equal(row.rows[0]?.payment_status, "awaiting", "no-hash webhook must NOT complete the order");

  // Valid Hash → completes.
  const goodHash = await toslaCallbackHash({
    orderId: merchantOrderId, mdStatus: "1", bankResponseCode: "00",
    bankResponseMessage: "", requestStatus: "1",
  });
  await fetch(`${baseUrl}/api/tosla/webhook?${successQs}&Hash=${encodeURIComponent(goodHash)}`, {
    headers: { "X-Forwarded-Host": JETGO_HOST },
  });
  row = await pool.query("SELECT payment_status FROM orders WHERE id = $1", [orderId]);
  assert.equal(row.rows[0]?.payment_status, "completed", "valid-hash webhook must complete the order");
});

// ---- Payment-init enforces the ORDER's store policy, not the request host ----
//
// Payment toggles (payment_*_enabled) are now per-store. For an EXISTING order
// the enable check must key off the order's own store (source_site), never the
// mutable request host — otherwise a buyer could open the hosted-payment page
// via a different branded domain whose toggle is on and bypass the owning
// store's "online card off" policy. We disable Tosla for JETGO only (base stays
// on, so Atakum is still on), create a JETGO order, then call init-payment via
// the ATAKUM host: it must still be blocked because the order belongs to jetgo.
test("payment-init enforces the order's store toggle, not the request host", async () => {
  const xff = "203.0.113." + (10 + Math.floor(Math.random() * 240));
  const phone = "555" + String(randomBytes(4).readUInt32BE(0)).padStart(7, "0").slice(-7);
  const c = await pool.query(
    "INSERT INTO customers (phone, password, name, is_blacklisted) VALUES ($1,$2,$3,false) RETURNING id",
    [phone, `${MARK}_PWD`, `${MARK}_PAYSCOPE_BUYER`],
  );
  ids.customers.push(c.rows[0].id);
  const cookie = await forgeSessionCookie({ customerId: c.rows[0].id });

  // Create an online order on the JETGO storefront (Tosla still on for jetgo).
  const placeRes = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers: { "X-Forwarded-Host": JETGO_HOST, "X-Forwarded-For": xff, "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ ...onlineOrderPayload(), customerPhone: phone }),
  });
  const placeBody = await placeRes.json() as any;
  assert.equal(placeRes.status, 201, `online order POST failed: ${JSON.stringify(placeBody)}`);
  const orderId = placeBody.id as number;
  ids.orders.push(orderId);
  const created = await pool.query("SELECT source_site, payment_status FROM orders WHERE id = $1", [orderId]);
  assert.equal(created.rows[0].source_site, "jetgo");
  assert.equal(created.rows[0].payment_status, "pending");

  // Turn Tosla OFF for jetgo only; base (and therefore atakum) stays ON.
  await setSetting("jetgo:payment_tosla_enabled", "0");
  try {
    // Call init-payment via the ATAKUM host (Tosla on there) for the JETGO order.
    const initRes = await fetch(`${baseUrl}/api/tosla/init-payment`, {
      method: "POST",
      headers: { "X-Forwarded-Host": ATAKUM_HOST, "X-Forwarded-For": xff, "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ orderId }),
    });
    const initBody = await initRes.json() as any;
    // Order belongs to jetgo (Tosla off) → must be blocked despite the atakum host.
    assert.equal(initRes.status, 400, `expected block, got ${initRes.status}: ${JSON.stringify(initBody)}`);
    assert.equal(initBody.cancelled, true, "the order's own store policy (jetgo: off) must govern, not the request host");
    const after = await pool.query("SELECT status, payment_status FROM orders WHERE id = $1", [orderId]);
    assert.equal(after.rows[0].status, "iptal", "blocked online order is cancelled and stock restored");
  } finally {
    await pool.query("DELETE FROM app_settings WHERE key = 'jetgo:payment_tosla_enabled'");
  }
});

// ---- Shared-edit protection: server-side blockedByStoreContext (403 guard) ----
//
// Seeded rows are pushed in store order ["all", "jetgo", "atakum"], so index 0
// is the shared row, index 2 is the atakum-owned row. A PATCH/DELETE issued with
// ?storeContext=jetgo must be blocked (403) when it targets the atakum row, and
// allowed when it targets the shared ("all") row.

test("blockedByStoreContext: jetgo context cannot PATCH an atakum-owned banner (403)", async () => {
  const atakumBannerId = ids.banners[2];
  const res = await patchAdmin(`/api/admin/banners/${atakumBannerId}?storeContext=jetgo`, JETGO_HOST, { sortOrder: 99 });
  assert.equal(res.status, 403);
  // The row must be untouched by the blocked request.
  const row = await pool.query("SELECT sort_order FROM banners WHERE id = $1", [atakumBannerId]);
  assert.notEqual(row.rows[0].sort_order, 99);
});

test("blockedByStoreContext: jetgo context CAN PATCH a shared (all) banner (allowed)", async () => {
  const sharedBannerId = ids.banners[0];
  const res = await patchAdmin(`/api/admin/banners/${sharedBannerId}?storeContext=jetgo`, JETGO_HOST, { sortOrder: 7 });
  assert.equal(res.status, 200);
  const row = await pool.query("SELECT sort_order FROM banners WHERE id = $1", [sharedBannerId]);
  assert.equal(row.rows[0].sort_order, 7);
});

test("blockedByStoreContext: jetgo context cannot DELETE an atakum-owned coupon (403)", async () => {
  const atakumCouponId = ids.coupons[2];
  const res = await deleteAdmin(`/api/admin/coupons/${atakumCouponId}?storeContext=jetgo`, JETGO_HOST);
  assert.equal(res.status, 403);
  // The blocked delete must not remove the row.
  const row = await pool.query("SELECT id FROM coupons WHERE id = $1", [atakumCouponId]);
  assert.equal(row.rows.length, 1);
});

test("blockedByStoreContext: jetgo context CAN DELETE a shared (all) coupon (allowed)", async () => {
  const sharedCouponId = ids.coupons[0];
  const res = await deleteAdmin(`/api/admin/coupons/${sharedCouponId}?storeContext=jetgo`, JETGO_HOST);
  assert.equal(res.status, 200);
  const row = await pool.query("SELECT id FROM coupons WHERE id = $1", [sharedCouponId]);
  assert.equal(row.rows.length, 0);
  // Already gone; drop it from cleanup tracking so the after hook is a no-op for it.
  ids.coupons = ids.coupons.filter((id) => id !== sharedCouponId);
});

// ---- Shared-edit protection: client confirmSharedSettingsSave warning logic ----
//
// In a specific-store view, changing a GLOBAL (non store-scoped) setting writes
// the shared base and affects every site, so the save must prompt for explicit
// confirmation. Changing only store-scoped keys (e.g. the campaign hero) writes
// a per-store override and must NOT prompt. The "Tümü" (all) view never prompts.

// confirmSharedSettingsSave calls the browser confirm(); stub it per-test.
function withConfirm<T>(impl: () => boolean, fn: () => T): { result: T; calls: number } {
  let calls = 0;
  const prev = (globalThis as any).confirm;
  (globalThis as any).confirm = () => { calls++; return impl(); };
  try {
    return { result: fn(), calls };
  } finally {
    (globalThis as any).confirm = prev;
  }
}

test("confirmSharedSettingsSave prompts when a GLOBAL setting changed in a store view", () => {
  const { result, calls } = withConfirm(() => true, () =>
    confirmSharedSettingsSave(
      { bank_iban: "TR01" }, // global key (not store-scoped) — bank info stays shared
      { bank_iban: "TR00" },
      "jetgo",
    ),
  );
  assert.equal(calls, 1, "expected a confirmation prompt for a changed global setting");
  assert.equal(result, true, "returns the user's confirm() answer");
});

test("confirmSharedSettingsSave returns false when the user cancels the prompt", () => {
  const { result, calls } = withConfirm(() => false, () =>
    confirmSharedSettingsSave(
      { bank_iban: "TR01" },
      { bank_iban: "TR00" },
      "jetgo",
    ),
  );
  assert.equal(calls, 1);
  assert.equal(result, false, "a cancelled prompt blocks the save");
});

test("confirmSharedSettingsSave does NOT prompt when only store-scoped keys changed", () => {
  const { result, calls } = withConfirm(() => false, () =>
    confirmSharedSettingsSave(
      { campaign_hero_title: "Yeni Başlık" }, // store-scoped key
      { campaign_hero_title: "Eski Başlık" },
      "jetgo",
    ),
  );
  assert.equal(calls, 0, "store-scoped-only changes must not prompt");
  assert.equal(result, true, "proceeds without confirmation");
});

test("confirmSharedSettingsSave never prompts in the 'Tümü' (all) view", () => {
  const { result, calls } = withConfirm(() => false, () =>
    confirmSharedSettingsSave(
      { payment_nakit_enabled: "0" },
      { payment_nakit_enabled: "1" },
      "all",
    ),
  );
  assert.equal(calls, 0, "the all view edits the shared base directly, no warning needed");
  assert.equal(result, true);
});

// ---- Shared-edit protection: client confirmSharedEdit / isSharedRowInStoreView ----
//
// The row-level guard fires when a shared ("all") banner/coupon/campaign/delivery
// row is edited/toggled/deleted from a SPECIFIC-store view, because that single
// shared row backs every site. A row owned by the current store, or any row in
// the "Tümü" (all) view, is safe and must not prompt.

test("isSharedRowInStoreView: shared 'all' row in a specific-store view is shared", () => {
  assert.equal(isSharedRowInStoreView("all", "atakum"), true);
  // A missing/undefined row store defaults to the shared base.
  assert.equal(isSharedRowInStoreView(null, "atakum"), true);
  assert.equal(isSharedRowInStoreView(undefined, "atakum"), true);
});

test("isSharedRowInStoreView: store-owned row or the 'all' view is NOT shared", () => {
  // Row owned by the current store -> editing only affects this store.
  assert.equal(isSharedRowInStoreView("atakum", "atakum"), false);
  // In the 'all' view every edit is intentionally global -> no special case.
  assert.equal(isSharedRowInStoreView("all", "all"), false);
  assert.equal(isSharedRowInStoreView(null, "all"), false);
});

test("confirmSharedEdit prompts when editing a shared row from a store view", () => {
  const { result, calls } = withConfirm(() => true, () =>
    confirmSharedEdit("all", "atakum"),
  );
  assert.equal(calls, 1, "expected a confirmation prompt for a shared row in a store view");
  assert.equal(result, true, "returns the user's confirm() answer");
});

test("confirmSharedEdit returns false when the user cancels the prompt", () => {
  const { result, calls } = withConfirm(() => false, () =>
    confirmSharedEdit(null, "atakum"),
  );
  assert.equal(calls, 1);
  assert.equal(result, false, "a cancelled prompt blocks the edit");
});

test("confirmSharedEdit does NOT prompt for a row owned by the current store", () => {
  const { result, calls } = withConfirm(() => false, () =>
    confirmSharedEdit("atakum", "atakum"),
  );
  assert.equal(calls, 0, "editing your own store's row needs no warning");
  assert.equal(result, true, "proceeds without confirmation");
});

test("confirmSharedEdit never prompts in the 'Tümü' (all) view", () => {
  const { result, calls } = withConfirm(() => false, () =>
    confirmSharedEdit("all", "all"),
  );
  assert.equal(calls, 0, "the all view edits shared content on purpose, no warning needed");
  assert.equal(result, true);
});

// ---- Drift guard: client STORE_SCOPED_SETTING_KEYS == server set ----
//
// The warning above relies on the client set matching the server's
// STORE_SCOPED_SETTING_KEYS. If they drift, the client would warn (or stay
// silent) for keys the server treats differently, misfiring the protection.
// The server copy is an inline const inside registerRoutes, so we extract it
// straight from the source text rather than importing it.

function extractServerStoreScopedKeys(): string[] {
  const src = readFileSync(new URL("../routes.ts", import.meta.url), "utf8");
  const block = src.match(/STORE_SCOPED_SETTING_KEYS\s*=\s*new Set<string>\(\[([\s\S]*?)\]\)/);
  assert.ok(block, "could not locate server STORE_SCOPED_SETTING_KEYS in routes.ts");
  return [...block![1].matchAll(/["'`]([^"'`]+)["'`]/g)].map((m) => m[1]);
}

test("client STORE_SCOPED_SETTING_KEYS matches the server set (no drift)", () => {
  const clientKeys = [...CLIENT_STORE_SCOPED_SETTING_KEYS].sort();
  const serverKeys = extractServerStoreScopedKeys().sort();
  // No duplicates slipped into the server source.
  assert.equal(new Set(serverKeys).size, serverKeys.length, "server set has duplicate keys");
  assert.deepEqual(clientKeys, serverKeys);
});

// ---- eager-bundle guard: store.ts must NOT import the SEO corpus ----
//
// client/src/lib/store.ts is loaded EAGERLY: main.tsx resolves CURRENT_STORE
// before React mounts, and the always-rendered chrome (Header/Footer/SEO) all
// import from it. The huge ./seo-data corpus (tens of thousands of SEO pages
// built at module-load with several dedup loops) must therefore stay OUT of
// store.ts, or every page open synchronously loads+executes the whole corpus
// before first paint — the exact regression that made all storefronts slow to
// open. The seo-data-dependent helpers live in ./store-seo (imported only by
// lazy SEO routes). This guard fails if seo-data leaks back into the eager file.
test("store.ts does not statically import the seo-data corpus (eager-bundle guard)", () => {
  const src = readFileSync(
    new URL("../../client/src/lib/store.ts", import.meta.url),
    "utf8",
  );
  assert.ok(
    !/from\s+["']\.\/seo-data["']/.test(src),
    "client/src/lib/store.ts must not import ./seo-data — it is eagerly loaded; " +
      "put seo-data-dependent helpers in ./store-seo (lazy SEO routes only).",
  );
});

// ---- atakum (local same-day) storefront branding smoke ----
//
// atakum (atakumpetshop.com) is the third branded store: like jetgo it is a
// LOCAL same-day store (fulfillment "local", "Getirmesi" delivery, door payment
// allowed, preorder on) but it carries its OWN brand name/logo. Because it shares
// jetgo's local-delivery copy path, a branding regression here would otherwise go
// unnoticed. These checks pin the per-store identity (server-injected homepage
// meta + the store config that drives the client UI) so the wordmark, the local
// same-day delivery copy (not cargo copy) and the Mahalle checkout flow can't
// silently revert to jetgo's brand or to the samsun cargo behavior.
//
// They complement the live `?__store=atakum` browser smoke (homepage wordmark,
// delivery copy, Mahalle checkout) run via the testing skill — see
// client/src/lib/store.ts for the override these checks mirror at the data layer.

const ATAKUM_BRAND = "Atakum Pet Shop";
const SAMSUN_BRAND = "Atakum Pet";
const SAMSUNPET_BRAND = "Samsun Pet Shop";
const KARADENIZ_BRAND = "Karadeniz Pet Shop";
// atakum.biz shares the "Atakum Pet" brand word with the `samsun` store
// (atakumpet.com) BY DESIGN (separate id + domain); both are LOCAL same-day
// storefronts.
const ATAKUMBIZ_BRAND = "Atakum Pet";
// jetgo.pet shares the JETGO brand name/word with the default `jetgo` store BY
// DESIGN (separate id + domain); it is a LOCAL same-day storefront.
const JETGOPET_BRAND = "JETGO Pet Shop Samsun";
// jetgo.shop also shares the JETGO brand name/word with the default `jetgo` store
// BY DESIGN (separate id + domain); it is a LOCAL same-day storefront too.
const JETGOSHOP_BRAND = "JETGO Pet Shop Samsun";
// marka.pet (markapet) LOCAL same-day brand: per the owner's request the
// customer-facing brand IS the domain string itself.
const MARKAPET_BRAND = "marka.pet";
// National-cargo positioning that NO store may advertise anymore: every store is
// LOCAL same-day now, so a match here is the signal that local copy regressed to
// the retired cargo copy.
const CARGO_SIGNATURE = /türkiye(?:'nin| geneli)/i;
// Broader cargo-claim scanner (türkiye geneli + kargo + anlaşmalı + 81 il + tüm
// türkiye) — the converted local corpora must carry NONE of these.
const CARGO_CLAIM_RE = /türkiye(?:'nin| geneli)|\bkargo\b|anlaşmalı|81 il|tüm türkiye/i;
const SAME_DAY_SIGNATURE = /aynı gün/i;
// Door-payment ("kapıda ödeme") is a LOCAL-model claim the converted corpora must
// carry and the dormant cargo corpus must never show.
const DOOR_PAYMENT_SIGNATURE = /kapıda ödeme/i;

// No real store is cargo anymore (all 9 are LOCAL same-day). The dormant cargo
// commerce code path (getSeoPagesForStore / findSeoPage / isCargoStore branching
// on commerce.fulfillment) is still exercised at the DATA layer through this
// synthetic cargo StoreConfig: a real local store cloned with its commerce model
// forced back to cargo. It is NEVER bound to a host, so it drives no live SSR.
const SYNTHETIC_CARGO_STORE: ReturnType<typeof getStoreByHost> = {
  ...getStoreByHost(KARADENIZ_HOST),
  id: "synthetic-cargo",
  commerce: {
    ...getStoreByHost(KARADENIZ_HOST).commerce,
    fulfillment: "cargo" as const,
    onlinePaymentOnly: true,
    shippingLabel: "Kargo Ücreti",
    preorderEnabled: false,
  },
};

// The static template the server brandifies per request host. Read once from the
// repo so this stays in lockstep with what production serves.
const INDEX_HTML = readFileSync(new URL("../../client/index.html", import.meta.url), "utf8");

test("atakum host resolves the Atakum Pet Shop brand", () => {
  const store = getStoreByHost(ATAKUM_HOST);
  assert.equal(store.id, "atakum");
  assert.equal(store.name, ATAKUM_BRAND, "homepage wordmark/title brand name");
  assert.equal(store.shortName, ATAKUM_BRAND);
});

test("atakum is a LOCAL same-day store (drives Mahalle checkout, not cargo)", () => {
  const atakum = getStoreByHost(ATAKUM_HOST);
  // checkout.tsx gates the address flow on `commerce.fulfillment === "cargo"`:
  // local -> Mahalle picker + door payment; cargo -> il/ilçe + online-only.
  assert.equal(atakum.commerce.fulfillment, "local", "atakum must use the local (Mahalle) flow");
  assert.equal(atakum.commerce.shippingLabel, "Getirmesi", "local delivery fee label");
  assert.equal(atakum.commerce.onlinePaymentOnly, false, "local store accepts door payment");
  assert.equal(atakum.commerce.preorderEnabled, true);
  // No store ships the cargo model anymore; the dormant cargo branch is exercised
  // only via the synthetic fixture, which must stay the distinct contrast case.
  assert.equal(SYNTHETIC_CARGO_STORE.commerce.fulfillment, "cargo", "synthetic store is the cargo contrast case");
  assert.notEqual(atakum.commerce.fulfillment, SYNTHETIC_CARGO_STORE.commerce.fulfillment);
});

test("guestCheckout (frictionless misafir sipariş) is enabled ONLY on jetgomarket.com", () => {
  // checkout.tsx gates the membership-free guest flow on `commerce.guestCheckout`:
  // when true the login/register wall is suppressed, an inline name+phone+address
  // contact section appears, and the order is confirmed with a single SMS code
  // (silent account under the hood). Only jetgo opts in; the other 8 keep the wall.
  const jetgo = getStoreByHost(JETGO_HOST);
  assert.equal(jetgo.commerce.guestCheckout, true, "jetgomarket.com must allow guest (no-membership) checkout");

  for (const store of STORES) {
    if (store.id === "jetgo") continue;
    assert.notEqual(
      store.commerce.guestCheckout,
      true,
      `${store.id} must NOT enable guest checkout (membership wall must stay)`,
    );
  }
});

test("modernCatalogUI (redesigned listing + product detail) is enabled ONLY on jetgomarket.com", () => {
  // brand-products.tsx / category.tsx render ModernProductRow single-column lists
  // and product-detail.tsx renders the modern top block + feature badges + tabbed
  // description, all gated on `commerce.modernCatalogUI`. Only jetgo opts in; the
  // other 8 stores must keep the legacy grid cards and the old detail layout.
  const jetgo = getStoreByHost(JETGO_HOST);
  assert.equal(jetgo.commerce.modernCatalogUI, true, "jetgomarket.com must use the modern catalog UI");

  for (const store of STORES) {
    if (store.id === "jetgo") continue;
    assert.notEqual(
      store.commerce.modernCatalogUI,
      true,
      `${store.id} must NOT enable the modern catalog UI (legacy grid + detail must stay)`,
    );
  }
});

test("brandify swaps shared JETGO body copy to the Atakum brand word", () => {
  const atakum = getStoreByHost(ATAKUM_HOST);
  assert.equal(brandifyFor(atakum, "Neden JETGO?"), "Neden Atakum?");
  assert.match(brandifyFor(atakum, "jetgomarket.com"), /atakumpetshop\.com/);
});

test("served homepage HTML carries the Atakum brand + local same-day copy (not cargo)", async () => {
  const html = await injectAllMeta(INDEX_HTML, "/", ATAKUM_HOST);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const ogSiteName = html.match(/<meta\s+property="og:site_name"\s+content="([^"]*)"/i)?.[1] ?? "";

  // Wordmark / brand identity.
  assert.match(title, /Atakum Pet Shop/i, "homepage <title> must brand as Atakum Pet Shop");
  assert.equal(ogSiteName, ATAKUM_BRAND, "og:site_name must be the Atakum brand");
  // Must not leak the default jetgo brand into atakum's served meta.
  assert.ok(!/JETGO/i.test(title), "atakum homepage title must not contain JETGO");
  // Local same-day delivery copy present, cargo copy absent.
  assert.match(title, SAME_DAY_SIGNATURE, "local same-day delivery copy expected");
  assert.ok(!CARGO_SIGNATURE.test(title), "atakum must not show samsun cargo copy");
});

test("served homepage HTML for the samsun host carries the Atakum Pet brand + local same-day copy", async () => {
  // samsun (atakumpet.com) is now a LOCAL same-day store like atakum: its served
  // homepage must brand as Atakum Pet and carry same-day copy, never the retired
  // national-cargo positioning.
  const html = await injectAllMeta(INDEX_HTML, "/", SAMSUN_HOST);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  assert.match(title, /Atakum Pet/i);
  assert.match(title, SAME_DAY_SIGNATURE, "samsun homepage title must carry local same-day copy");
  assert.ok(!CARGO_SIGNATURE.test(title), "samsun homepage title must not carry the retired cargo copy");
});

// ---- atakum storefront UI smoke via the ?__store=atakum client override ----
//
// The checks above assert the data/meta layer. This block exercises the actual
// CLIENT override path the storefront uses in the browser: it drives
// client/src/lib/store.ts through `?__store=atakum` (the same override a live
// smoke uses) and server-renders the real <Logo> component to assert the VISIBLE
// header wordmark, then reads the resolved store the homepage (landing.tsx) and
// checkout (checkout.tsx) consume to confirm the local same-day branch.
//
// Why server-render instead of a browser: the project ships no browser test
// runner, and a live browser smoke hits two dev-host limitations — the hidden
// #seo-static crawler block / <title> stay JETGO on the preview host by design,
// and the checkout Mahalle field is gated behind a real SMS OTP. Rendering the
// real client components with react-dom/server avoids both while still
// exercising the genuine client override + wordmark + checkout branch source.
test("?__store=atakum drives the client UI: wordmark, same-day copy, Mahalle (local) flow", async () => {
  // 1. Simulate the browser environment the override reads, BEFORE importing the
  //    client store module (CURRENT_STORE is resolved once at module load).
  const sessionStore: Record<string, string> = {};
  (globalThis as any).window = {
    location: { hostname: "localhost", search: "?__store=atakum" },
  };
  (globalThis as any).sessionStorage = {
    getItem: (k: string) => (k in sessionStore ? sessionStore[k] : null),
    setItem: (k: string, v: string) => { sessionStore[k] = String(v); },
    removeItem: (k: string) => { delete sessionStore[k]; },
    clear: () => { for (const k of Object.keys(sessionStore)) delete sessionStore[k]; },
  };

  try {
    const React = (await import("react")).default;
    // Logo.tsx relies on the automatic JSX runtime; under the test transform the
    // emitted React.createElement resolves `React` from the global scope.
    (globalThis as any).React = React;
    const { renderToStaticMarkup } = await import("react-dom/server");

    // The real client modules the storefront uses (alias @ -> client/src).
    const storeMod = await import("../../client/src/lib/store");
    const Logo = (await import("../../client/src/components/Logo")).default;

    // The override must win over the (jetgo) preview host.
    assert.equal(storeMod.CURRENT_STORE.id, "atakum", "?__store=atakum override must resolve atakum");

    // 2. Visible header wordmark: render the real <Logo> (linkTo:"" skips the
    //    wouter <Link> wrapper). atakum has a logo, so the brand surfaces as the
    //    image alt text; a textless store would surface CURRENT_STORE.shortName.
    const wordmarkHtml = renderToStaticMarkup(React.createElement(Logo, { linkTo: "" }));
    assert.match(wordmarkHtml, /Atakum Pet Shop/, "visible wordmark must read Atakum Pet Shop");
    assert.ok(!/JETGO/i.test(wordmarkHtml), "wordmark must not show the default JETGO brand");
    assert.ok(!/Samsun Pet Shop/i.test(wordmarkHtml), "wordmark must not show the Samsun brand");

    // 3. Same-day copy: the homepage hero is brandified through the same module.
    //    Shared JETGO copy must surface the atakum brand, never JETGO/jetgo.
    const hero = storeMod.brandify("Jetgo'dan Aynı Gün Gelsin");
    assert.match(hero, /Atakum/, "brandified hero must carry the Atakum brand");
    assert.match(hero, /Aynı Gün/, "homepage must keep local same-day delivery copy");
    assert.ok(!/Jetgo/i.test(hero), "brandified copy must not leak the JETGO brand");

    // 4. Checkout branch: checkout.tsx derives isCargo from this same resolved
    //    store. local => Mahalle (neighborhood) flow + "Getirmesi" fee label and
    //    NO il/ilçe cargo selectors / "Kargo Ücreti".
    const commerce = storeMod.CURRENT_STORE.commerce;
    const isCargo = commerce.fulfillment === "cargo";
    assert.equal(isCargo, false, "atakum checkout must use the local Mahalle flow, not cargo");
    assert.equal(commerce.shippingLabel, "Getirmesi", "local delivery fee label expected at checkout");
    assert.ok(!CARGO_SIGNATURE.test(commerce.shippingLabel), "checkout must not show cargo fee label");
  } finally {
    delete (globalThis as any).window;
    delete (globalThis as any).sessionStorage;
    delete (globalThis as any).React;
  }
});

// ---- Product detail page (/urun/:id) per-store branding ----
//
// The homepage checks above prove the brand follows the host on "/". Product
// pages take a DIFFERENT server path: injectAllMeta matches /urun/:id, loads the
// product, and calls injectProductMeta, which mints its OWN <title>, og tags and
// a Product JSON-LD block (brand + offers.seller). A regression there would let
// a product share preview / structured data leak the default JETGO brand on a
// non-default host even while the homepage stays correctly branded. These tests
// exercise that exact path for the atakum and samsun hosts using the throwaway
// product seeded in before() (orderProductId).

// Pull the Product (@type:"Product") JSON-LD block out of served HTML. The
// homepage/global JSON-LD is also present, so we must select the product one.
function extractProductJsonLd(html: string): any {
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1].replace(/\\u003c/g, "<"));
      if (parsed && parsed["@type"] === "Product") return parsed;
    } catch {
      // skip blocks that aren't valid JSON
    }
  }
  return null;
}

test("product page (/urun/:id) brands <title>, og:site_name and JSON-LD per host (atakum)", async () => {
  const html = await injectAllMeta(INDEX_HTML, `/urun/${orderProductId}`, ATAKUM_HOST);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const ogSiteName = html.match(/<meta\s+property="og:site_name"\s+content="([^"]*)"/i)?.[1] ?? "";
  const ld = extractProductJsonLd(html);

  // Title carries the atakum brand and never the default JETGO brand.
  assert.match(title, /Atakum Pet Shop/i, "product <title> must brand as Atakum Pet Shop");
  assert.ok(!/JETGO/i.test(title), "atakum product title must not leak the JETGO brand");
  // Global og:site_name follows the requesting store.
  assert.equal(ogSiteName, ATAKUM_BRAND, "og:site_name must be the Atakum brand");
  // JSON-LD brand + seller follow the store and never default to JETGO.
  assert.ok(ld, "a Product JSON-LD block must be present on the product page");
  assert.equal(ld.brand?.name, ATAKUM_BRAND, "JSON-LD brand.name must be the Atakum brand");
  assert.equal(ld.offers?.seller?.name, ATAKUM_BRAND, "JSON-LD seller.name must be the Atakum brand");
  assert.ok(!/JETGO/i.test(JSON.stringify(ld)), "atakum product JSON-LD must not leak the JETGO brand");
});

test("product page (/urun/:id) brands <title>, og:site_name and JSON-LD per host (samsun)", async () => {
  const html = await injectAllMeta(INDEX_HTML, `/urun/${orderProductId}`, SAMSUN_HOST);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const ogSiteName = html.match(/<meta\s+property="og:site_name"\s+content="([^"]*)"/i)?.[1] ?? "";
  const ld = extractProductJsonLd(html);

  assert.match(title, /Atakum Pet/i, "product <title> must brand as Atakum Pet");
  assert.ok(!/JETGO/i.test(title), "samsun product title must not leak the JETGO brand");
  assert.equal(ogSiteName, SAMSUN_BRAND, "og:site_name must be the Samsun brand");
  assert.ok(ld, "a Product JSON-LD block must be present on the product page");
  assert.equal(ld.brand?.name, SAMSUN_BRAND, "JSON-LD brand.name must be the Samsun brand");
  assert.equal(ld.offers?.seller?.name, SAMSUN_BRAND, "JSON-LD seller.name must be the Samsun brand");
  assert.ok(!/JETGO/i.test(JSON.stringify(ld)), "samsun product JSON-LD must not leak the JETGO brand");
});

test("product page canonical/og:url bind to the requesting domain (no cross-brand leak)", async () => {
  // Self-canonicalization: each brand's product page must point back to its OWN
  // domain so the stores rank independently and never canonicalize to JETGO.
  const atakumStore = getStoreByHost(ATAKUM_HOST);
  const samsunStore = getStoreByHost(SAMSUN_HOST);

  const ataHtml = await injectAllMeta(INDEX_HTML, `/urun/${orderProductId}`, ATAKUM_HOST);
  const samHtml = await injectAllMeta(INDEX_HTML, `/urun/${orderProductId}`, SAMSUN_HOST);

  const ataCanonical = ataHtml.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? "";
  const samCanonical = samHtml.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? "";

  assert.ok(ataCanonical.startsWith(`${atakumStore.domain}/urun/${orderProductId}`), "atakum product canonical must bind to the atakum domain");
  assert.ok(samCanonical.startsWith(`${samsunStore.domain}/urun/${orderProductId}`), "samsun product canonical must bind to the samsun domain");
  assert.ok(!/jetgomarket\.com/i.test(ataCanonical), "atakum canonical must not point at the jetgo domain");
  assert.ok(!/jetgomarket\.com/i.test(samCanonical), "samsun canonical must not point at the jetgo domain");
});

// ---- samsunpet (a Samsun-wide LOCAL same-day brand) storefront identity + behavior ----
//
// samsunpet (samsunpet.com) is a Samsun-wide LOCAL same-day brand. It shares
// the exact commerce model of `samsun` (atakumpet.com) — fulfillment "local",
// door payment on, preorder on — but is its own store with its own
// domain, name and logo. The critical invariant: it must NOT collide with the
// existing "samsun" store even though both serve the Samsun region. These checks
// pin the distinct identity, the local same-day commerce contract, the door
// payment surface and the brandified homepage meta so the new domain can never
// silently resolve to the wrong store or leak the default JETGO brand.

test("samsunpet host resolves the Samsun Pet Shop brand, distinct from the existing samsun store", () => {
  const samsunpet = getStoreByHost(SAMSUNPET_HOST);
  const samsun = getStoreByHost(SAMSUN_HOST);
  // New store resolves to its own identity.
  assert.equal(samsunpet.id, "samsunpet");
  assert.equal(samsunpet.name, SAMSUNPET_BRAND, "homepage wordmark/title brand name");
  assert.equal(samsunpet.shortName, SAMSUNPET_BRAND);
  assert.equal(samsunpet.domain, "https://www.samsunpet.com");
  // No collision with the pre-existing samsun (atakumpet.com) store.
  assert.equal(samsun.id, "samsun", "atakumpet.com must still resolve the original samsun store");
  assert.notEqual(samsunpet.id, samsun.id, "samsunpet must be a SEPARATE store from samsun");
  assert.notEqual(samsunpet.domain, samsun.domain, "the two stores must keep distinct domains");
  // The apex host also resolves (not just the www form).
  assert.equal(getStoreByHost("samsunpet.com").id, "samsunpet");
});

test("samsunpet is a LOCAL same-day store (same model as samsun)", () => {
  const samsunpet = getStoreByHost(SAMSUNPET_HOST);
  assert.equal(samsunpet.commerce.fulfillment, "local", "samsunpet must use the local (Mahalle) flow");
  assert.equal(samsunpet.commerce.shippingLabel, "Getirmesi", "local delivery fee label");
  assert.equal(samsunpet.commerce.onlinePaymentOnly, false, "local store also accepts door payment");
  assert.equal(samsunpet.commerce.preorderEnabled, true, "preorder is enabled on the local store");
});

test("brandify swaps shared JETGO body copy to the Samsun Pet Shop brand + domain", () => {
  const samsunpet = getStoreByHost(SAMSUNPET_HOST);
  assert.equal(brandifyFor(samsunpet, "Neden JETGO?"), "Neden Samsun Pet Shop?");
  assert.match(brandifyFor(samsunpet, "jetgomarket.com"), /samsunpet\.com/);
  assert.ok(!/jetgomarket\.com/i.test(brandifyFor(samsunpet, "www.jetgomarket.com")), "must not leak the jetgo domain");
});

test("checkout on samsunpet (local store) DOES offer in-person payment surfaces", () => {
  const samsunpet = getStoreByHost(SAMSUNPET_HOST);
  const opts = visiblePaymentOptions({
    ...allMethodsEnabled,
    onlinePaymentOnly: samsunpet.commerce.onlinePaymentOnly,
  });
  const optIds = opts.map((o) => o.id);
  // In-person door options + online card are all available on the local store.
  for (const allowed of ["nakit", "eft", "qr", "online"]) {
    assert.ok(optIds.includes(allowed), `local store should offer "${allowed}", got: ${JSON.stringify(optIds)}`);
  }
  assert.equal(
    showDoorPosInstallments({
      onlinePaymentOnly: samsunpet.commerce.onlinePaymentOnly,
      hasCampaignItems: false,
      hasPreorderItems: false,
      posEnabled: true,
    }),
    true,
    "door-POS installment block should render on the local store",
  );
});

test("served homepage HTML carries the Samsun Pet Shop brand + local same-day copy (not cargo)", async () => {
  const html = await injectAllMeta(INDEX_HTML, "/", SAMSUNPET_HOST);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const ogSiteName = html.match(/<meta\s+property="og:site_name"\s+content="([^"]*)"/i)?.[1] ?? "";

  assert.match(title, /Samsun Pet Shop/i, "homepage <title> must brand as Samsun Pet Shop");
  assert.equal(ogSiteName, SAMSUNPET_BRAND, "og:site_name must be the Samsun Pet Shop brand");
  assert.ok(!/JETGO/i.test(title), "samsunpet homepage title must not contain JETGO");
  // Local same-day copy present, cargo copy absent.
  assert.match(title, SAME_DAY_SIGNATURE, "samsunpet homepage title must carry local same-day copy");
  assert.ok(!CARGO_SIGNATURE.test(title), "samsunpet must not show cargo copy");
});

// API-level end-to-end on the NEW domain: a fresh customer registers via the OTP
// bypass on samsunpet.com and the LOCAL contract is enforced server-side — door
// (cash) payment is ACCEPTED and the order is attributed to source_site
// 'samsunpet' (NOT 'samsun'). This is the strongest regression that the new host
// is wired through reqStore end to end.
test("test-OTP bypass lets a NEW customer place a samsunpet local order (source_site=samsunpet, door payment)", async () => {
  const prevEnv = process.env.NODE_ENV;
  const prevFlag = process.env.TEST_OTP_BYPASS;
  process.env.NODE_ENV = "development";
  process.env.TEST_OTP_BYPASS = "1";

  const phone = "555" + String(randomBytes(4).readUInt32BE(0)).padStart(7, "0").slice(-7);
  try {
    // 1) Register a fresh customer on the samsunpet host. Returns a real signed
    //    session cookie.
    const send = await post("/api/otp/send", SAMSUNPET_HOST, { phone });
    assert.equal(send.status, 200, `otp/send failed: ${JSON.stringify(send.body)}`);
    assert.equal(send.body.isExisting, false, "fresh phone must be reported as new");

    const regRes = await fetch(`${baseUrl}/api/otp/verify`, {
      method: "POST",
      headers: { "X-Forwarded-Host": SAMSUNPET_HOST, "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code: "0000", name: `${MARK}_SP_BUYER`, address: `${MARK} Test Mah., Deneme Cad. No 12` }),
    });
    const regBody = await regRes.json() as any;
    assert.equal(regRes.status, 200, `registration failed: ${JSON.stringify(regBody)}`);
    assert.ok(regBody.id, "registration must return the new customer id");
    ids.customers.push(regBody.id as number);
    const realCookie = (regRes.headers.get("set-cookie") ?? "").split(";")[0];
    assert.ok(realCookie.includes("connect.sid"), "registration must set a session cookie");

    // 2) Local store: door (cash) payment is ACCEPTED, unlike the old cargo model.
    const order = await postWithCookie(
      "/api/orders",
      SAMSUNPET_HOST,
      { ...orderPayload(), customerName: `${MARK}_SP_BUYER`, customerPhone: phone, paymentMethod: "Kapıda Nakit" },
      realCookie,
    );
    assert.equal(order.status, 201, `local door-payment order POST failed: ${JSON.stringify(order.body)}`);
    const orderId = order.body.id as number;
    assert.ok(orderId, "order id missing in response");
    ids.orders.push(orderId);

    // 3) Attribution: must tag the NEW store, never 'samsun'.
    const row = await pool.query("SELECT source_site FROM orders WHERE id = $1", [orderId]);
    assert.equal(row.rows[0]?.source_site, "samsunpet", "order must attribute to the samsunpet storefront, not samsun");
  } finally {
    if (prevEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = prevEnv;
    if (prevFlag === undefined) delete process.env.TEST_OTP_BYPASS; else process.env.TEST_OTP_BYPASS = prevFlag;
  }
});

// ---- karadeniz (a neighborly LOCAL same-day brand) storefront identity + behavior ----
//
// karadeniz (karadenizpetshop.com) is a neighborly LOCAL same-day brand,
// sharing the samsun/samsunpet commerce model (local, door payment,
// preorder on) but with its own domain, name and logo. These checks pin the
// distinct identity (no collision with samsun/samsunpet), the local contract,
// the door payment surface and the brandified homepage meta.

test("karadeniz host resolves the Karadeniz Pet Shop brand, distinct from the other sibling stores", () => {
  const karadeniz = getStoreByHost(KARADENIZ_HOST);
  const samsun = getStoreByHost(SAMSUN_HOST);
  const samsunpet = getStoreByHost(SAMSUNPET_HOST);
  assert.equal(karadeniz.id, "karadeniz");
  assert.equal(karadeniz.name, KARADENIZ_BRAND, "homepage wordmark/title brand name");
  assert.equal(karadeniz.shortName, KARADENIZ_BRAND);
  assert.equal(karadeniz.domain, "https://www.karadenizpetshop.com");
  // No collision with the other two sibling stores.
  assert.notEqual(karadeniz.id, samsun.id, "karadeniz must be a SEPARATE store from samsun");
  assert.notEqual(karadeniz.id, samsunpet.id, "karadeniz must be a SEPARATE store from samsunpet");
  assert.notEqual(karadeniz.domain, samsun.domain);
  assert.notEqual(karadeniz.domain, samsunpet.domain);
  // The apex host also resolves (not just the www form).
  assert.equal(getStoreByHost("karadenizpetshop.com").id, "karadeniz");
});

test("karadeniz is a LOCAL same-day store (same model as samsun/samsunpet)", () => {
  const karadeniz = getStoreByHost(KARADENIZ_HOST);
  assert.equal(karadeniz.commerce.fulfillment, "local", "karadeniz must use the local (Mahalle) flow");
  assert.equal(karadeniz.commerce.shippingLabel, "Getirmesi", "local delivery fee label");
  assert.equal(karadeniz.commerce.onlinePaymentOnly, false, "local store also accepts door payment");
  assert.equal(karadeniz.commerce.preorderEnabled, true, "preorder is enabled on the local store");
});

test("brandify swaps shared JETGO body copy to the Karadeniz Pet Shop brand + domain", () => {
  const karadeniz = getStoreByHost(KARADENIZ_HOST);
  assert.equal(brandifyFor(karadeniz, "Neden JETGO?"), "Neden Karadeniz Pet Shop?");
  assert.match(brandifyFor(karadeniz, "jetgomarket.com"), /karadenizpetshop\.com/);
  assert.ok(!/jetgomarket\.com/i.test(brandifyFor(karadeniz, "www.jetgomarket.com")), "must not leak the jetgo domain");
});

test("checkout on karadeniz (local store) DOES offer in-person payment surfaces", () => {
  const karadeniz = getStoreByHost(KARADENIZ_HOST);
  const opts = visiblePaymentOptions({
    ...allMethodsEnabled,
    onlinePaymentOnly: karadeniz.commerce.onlinePaymentOnly,
  });
  const optIds = opts.map((o) => o.id);
  // In-person door options + online card are all available on the local store.
  for (const allowed of ["nakit", "eft", "qr", "online"]) {
    assert.ok(optIds.includes(allowed), `local store should offer "${allowed}", got: ${JSON.stringify(optIds)}`);
  }
  assert.equal(
    showDoorPosInstallments({
      onlinePaymentOnly: karadeniz.commerce.onlinePaymentOnly,
      hasCampaignItems: false,
      hasPreorderItems: false,
      posEnabled: true,
    }),
    true,
    "door-POS installment block should render on the local store",
  );
});

test("served homepage HTML carries the Karadeniz Pet Shop brand + local same-day copy (not cargo)", async () => {
  const html = await injectAllMeta(INDEX_HTML, "/", KARADENIZ_HOST);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const ogSiteName = html.match(/<meta\s+property="og:site_name"\s+content="([^"]*)"/i)?.[1] ?? "";

  assert.match(title, /Karadeniz Pet Shop/i, "homepage <title> must brand as Karadeniz Pet Shop");
  assert.equal(ogSiteName, KARADENIZ_BRAND, "og:site_name must be the Karadeniz Pet Shop brand");
  assert.ok(!/JETGO/i.test(title), "karadeniz homepage title must not contain JETGO");
  assert.match(title, SAME_DAY_SIGNATURE, "karadeniz homepage title must carry local same-day copy");
  assert.ok(!CARGO_SIGNATURE.test(title), "karadeniz must not show cargo copy");
});

test("test-OTP bypass lets a NEW customer place a karadeniz local order (source_site=karadeniz, door payment)", async () => {
  const prevEnv = process.env.NODE_ENV;
  const prevFlag = process.env.TEST_OTP_BYPASS;
  process.env.NODE_ENV = "development";
  process.env.TEST_OTP_BYPASS = "1";

  const phone = "555" + String(randomBytes(4).readUInt32BE(0)).padStart(7, "0").slice(-7);
  try {
    const send = await post("/api/otp/send", KARADENIZ_HOST, { phone });
    assert.equal(send.status, 200, `otp/send failed: ${JSON.stringify(send.body)}`);
    assert.equal(send.body.isExisting, false, "fresh phone must be reported as new");

    const regRes = await fetch(`${baseUrl}/api/otp/verify`, {
      method: "POST",
      headers: { "X-Forwarded-Host": KARADENIZ_HOST, "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code: "0000", name: `${MARK}_KD_BUYER`, address: `${MARK} Test Mah., Deneme Cad. No 14` }),
    });
    const regBody = await regRes.json() as any;
    assert.equal(regRes.status, 200, `registration failed: ${JSON.stringify(regBody)}`);
    assert.ok(regBody.id, "registration must return the new customer id");
    ids.customers.push(regBody.id as number);
    const realCookie = (regRes.headers.get("set-cookie") ?? "").split(";")[0];
    assert.ok(realCookie.includes("connect.sid"), "registration must set a session cookie");

    // Local store: door (cash) payment is ACCEPTED, unlike the old cargo model.
    const order = await postWithCookie(
      "/api/orders",
      KARADENIZ_HOST,
      { ...orderPayload(), customerName: `${MARK}_KD_BUYER`, customerPhone: phone, paymentMethod: "Kapıda Nakit" },
      realCookie,
    );
    assert.equal(order.status, 201, `local door-payment order POST failed: ${JSON.stringify(order.body)}`);
    const orderId = order.body.id as number;
    assert.ok(orderId, "order id missing in response");
    ids.orders.push(orderId);

    const row = await pool.query("SELECT source_site FROM orders WHERE id = $1", [orderId]);
    assert.equal(row.rows[0]?.source_site, "karadeniz", "order must attribute to the karadeniz storefront");
  } finally {
    if (prevEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = prevEnv;
    if (prevFlag === undefined) delete process.env.TEST_OTP_BYPASS; else process.env.TEST_OTP_BYPASS = prevFlag;
  }
});

// ---- marka.pet (markapet, a PRATIK LOCAL same-day brand) storefront identity + behavior --
//
// marka.pet is a PRATIK LOCAL same-day brand sharing the
// samsun/samsunpet/karadeniz commerce model (local, door payment, preorder
// on) on its OWN domain. Per the owner's request the customer-facing brand IS
// the domain string "marka.pet" (name/shortName/brandWord). These checks pin the
// distinct identity (no collision with the other sibling stores), the local
// contract, the door payment surface, brandify and homepage meta.

test("marka.pet host resolves the marka.pet brand, distinct from the other sibling stores", () => {
  const markapet = getStoreByHost(MARKAPET_HOST);
  const samsunpet = getStoreByHost(SAMSUNPET_HOST);
  const karadeniz = getStoreByHost(KARADENIZ_HOST);
  assert.equal(markapet.id, "markapet");
  assert.equal(markapet.name, MARKAPET_BRAND, "homepage wordmark/title brand name");
  assert.equal(markapet.shortName, MARKAPET_BRAND);
  assert.equal(markapet.brandWord, MARKAPET_BRAND, "brand word is the domain string per the owner's request");
  assert.equal(markapet.domain, "https://www.marka.pet");
  // No collision with the other sibling stores.
  assert.notEqual(markapet.id, samsunpet.id, "markapet must be a SEPARATE store from samsunpet");
  assert.notEqual(markapet.id, karadeniz.id, "markapet must be a SEPARATE store from karadeniz");
  assert.notEqual(markapet.domain, samsunpet.domain);
  assert.notEqual(markapet.domain, karadeniz.domain);
  // The apex host also resolves (not just the www form).
  assert.equal(getStoreByHost("marka.pet").id, "markapet");
});

test("markapet is a LOCAL same-day store (same model as samsun/samsunpet/karadeniz)", () => {
  const markapet = getStoreByHost(MARKAPET_HOST);
  assert.equal(markapet.commerce.fulfillment, "local", "markapet must use the local (Mahalle) flow");
  assert.equal(markapet.commerce.shippingLabel, "Getirmesi", "local delivery fee label");
  assert.equal(markapet.commerce.onlinePaymentOnly, false, "local store also accepts door payment");
  assert.equal(markapet.commerce.preorderEnabled, true, "preorder is enabled on the local store");
});

test("brandify swaps shared JETGO body copy to the marka.pet brand + domain (no jetgo substring to mangle)", () => {
  const markapet = getStoreByHost(MARKAPET_HOST);
  assert.equal(brandifyFor(markapet, "Neden JETGO?"), "Neden marka.pet?");
  assert.match(brandifyFor(markapet, "jetgomarket.com"), /marka\.pet/);
  assert.ok(!/jetgomarket\.com/i.test(brandifyFor(markapet, "www.jetgomarket.com")), "must not leak the jetgo domain");
});

test("checkout on marka.pet (local store) DOES offer in-person payment surfaces", () => {
  const markapet = getStoreByHost(MARKAPET_HOST);
  const opts = visiblePaymentOptions({
    ...allMethodsEnabled,
    onlinePaymentOnly: markapet.commerce.onlinePaymentOnly,
  });
  const optIds = opts.map((o) => o.id);
  // In-person door options + online card are all available on the local store.
  for (const allowed of ["nakit", "eft", "qr", "online"]) {
    assert.ok(optIds.includes(allowed), `local store should offer "${allowed}", got: ${JSON.stringify(optIds)}`);
  }
  assert.equal(
    showDoorPosInstallments({
      onlinePaymentOnly: markapet.commerce.onlinePaymentOnly,
      hasCampaignItems: false,
      hasPreorderItems: false,
      posEnabled: true,
    }),
    true,
    "door-POS installment block should render on the local store",
  );
});

test("served homepage HTML carries the marka.pet brand + local same-day copy (not cargo)", async () => {
  const html = await injectAllMeta(INDEX_HTML, "/", MARKAPET_HOST);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const ogSiteName = html.match(/<meta\s+property="og:site_name"\s+content="([^"]*)"/i)?.[1] ?? "";

  assert.match(title, /marka\.pet/i, "homepage <title> must brand as marka.pet");
  assert.equal(ogSiteName, MARKAPET_BRAND, "og:site_name must be the marka.pet brand");
  assert.ok(!/JETGO/i.test(title), "markapet homepage title must not contain JETGO");
  assert.match(title, SAME_DAY_SIGNATURE, "markapet homepage title must carry local same-day copy");
  assert.ok(!CARGO_SIGNATURE.test(title), "markapet must not show cargo copy");
});

test("marka.pet serves its expanded local keyword pages (localOnly, same-day/door voice)", async () => {
  const markapet = getStoreByHost(MARKAPET_HOST);

  // Every sampled markapet slug is a localOnly, markapet-tagged page.
  for (const sp of MARKAPET_ALL_EXCLUSIVE_PAGES.slice(0, 5)) {
    const page = findSeoPage(sp.slug, markapet);
    assert.ok(page, `marka.pet must serve local keyword "${sp.slug}"`);
    assert.equal(page!.availability, "localOnly", `"${sp.slug}" must be a localOnly page`);
    assert.equal(page!.storeId, "markapet", `"${sp.slug}" must be markapet-tagged`);
  }

  const ssrSlug = MARKAPET_ALL_EXCLUSIVE_PAGES[0].slug;
  const html = await injectAllMeta(INDEX_HTML, `/${ssrSlug}`, MARKAPET_HOST);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] ?? "";
  assert.match(title, /marka\.pet/i, "local keyword page must brand as marka.pet");
  assert.ok(!/JETGO/i.test(`${title} ${description}`), "no JETGO leak on the marka.pet local page");
  assert.match(description, SAME_DAY_SIGNATURE, "local keyword page must carry same-day copy");
  assert.ok(!CARGO_SIGNATURE.test(`${title} ${description}`), "local page must not show cargo copy");

  // SEO-surface parity: the local keyword page must expose an H1 and FAQPage
  // JSON-LD (for Google/AI rich results), brandified with no JETGO/cargo leak.
  assert.match(html, /<h1>[\s\S]*?<\/h1>/i, "local keyword page must render an H1 for crawlers");
  const ldBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  const faqLd = ldBlocks.find((b) => b.includes('"FAQPage"'));
  assert.ok(faqLd, "local keyword page must emit FAQPage JSON-LD");
  assert.ok(!/JETGO/i.test(faqLd!), "FAQPage JSON-LD must brandify (no JETGO leak)");
  assert.ok(!CARGO_SIGNATURE.test(faqLd!), "FAQPage JSON-LD must not carry cargo copy");
});

test("test-OTP bypass lets a NEW customer place a marka.pet local order (source_site=markapet, door payment)", async () => {
  const prevEnv = process.env.NODE_ENV;
  const prevFlag = process.env.TEST_OTP_BYPASS;
  process.env.NODE_ENV = "development";
  process.env.TEST_OTP_BYPASS = "1";

  const phone = "555" + String(randomBytes(4).readUInt32BE(0)).padStart(7, "0").slice(-7);
  // Run this whole flow under its OWN client IP so its otp/order requests get a
  // fresh per-IP bucket and never accumulate into the shared localhost bucket the
  // other e2e tests use (keeps the cumulative order:<ip> 20/h limit honest).
  const mpIp = "203.0.113.77";
  try {
    const send = await post("/api/otp/send", MARKAPET_HOST, { phone }, mpIp);
    assert.equal(send.status, 200, `otp/send failed: ${JSON.stringify(send.body)}`);
    assert.equal(send.body.isExisting, false, "fresh phone must be reported as new");

    const regRes = await fetch(`${baseUrl}/api/otp/verify`, {
      method: "POST",
      headers: { "X-Forwarded-Host": MARKAPET_HOST, "X-Forwarded-For": mpIp, "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code: "0000", name: `${MARK}_MP_BUYER`, address: `${MARK} Test Mah., Deneme Cad. No 7` }),
    });
    const regBody = await regRes.json() as any;
    assert.equal(regRes.status, 200, `registration failed: ${JSON.stringify(regBody)}`);
    assert.ok(regBody.id, "registration must return the new customer id");
    ids.customers.push(regBody.id as number);
    const realCookie = (regRes.headers.get("set-cookie") ?? "").split(";")[0];
    assert.ok(realCookie.includes("connect.sid"), "registration must set a session cookie");

    // Local store: door (cash) payment is ACCEPTED, unlike the old cargo model.
    const order = await postWithCookie(
      "/api/orders",
      MARKAPET_HOST,
      { ...orderPayload(), customerName: `${MARK}_MP_BUYER`, customerPhone: phone, paymentMethod: "Kapıda Nakit" },
      realCookie,
      mpIp,
    );
    assert.equal(order.status, 201, `local door-payment order POST failed: ${JSON.stringify(order.body)}`);
    const orderId = order.body.id as number;
    assert.ok(orderId, "order id missing in response");
    ids.orders.push(orderId);

    const row = await pool.query("SELECT source_site FROM orders WHERE id = $1", [orderId]);
    assert.equal(row.rows[0]?.source_site, "markapet", "order must attribute to the marka.pet storefront");
  } finally {
    if (prevEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = prevEnv;
    if (prevFlag === undefined) delete process.env.TEST_OTP_BYPASS; else process.env.TEST_OTP_BYPASS = prevFlag;
  }
});

// ---- atakum.biz (atakumbiz): a SECOND local same-day storefront ------------
//
// Same LOCAL commerce model as the `atakum` store (Mahalle checkout + door
// payment + preorder) but its OWN domain / theme / logo. It intentionally
// shares the "Atakum Pet" brand word with the `samsun` store
// (atakumpet.com); these tests pin that the two stay SEPARATE (distinct id +
// domain), the LOCAL commerce contract, brandify, the door-payment-allowed
// checkout surface, the same-day homepage meta and source_site attribution.

test("atakum.biz resolves the Atakum Pet brand as a SEPARATE store from samsun/atakum", () => {
  const atakumbiz = getStoreByHost(ATAKUMBIZ_HOST);
  const samsun = getStoreByHost(SAMSUN_HOST);
  const atakum = getStoreByHost(ATAKUM_HOST);
  assert.equal(atakumbiz.id, "atakumbiz");
  assert.equal(atakumbiz.name, ATAKUMBIZ_BRAND, "homepage wordmark/title brand name");
  assert.equal(atakumbiz.shortName, ATAKUMBIZ_BRAND);
  assert.equal(atakumbiz.domain, "https://www.atakum.biz");
  // Shares the "Atakum Pet" brand word with samsun BY DESIGN, but must stay a
  // separate store: distinct id + domain (host resolution is by hostname).
  assert.equal(atakumbiz.brandWord, samsun.brandWord, "intentionally shares the Atakum Pet brand word with samsun");
  assert.notEqual(atakumbiz.id, samsun.id, "atakumbiz must be a SEPARATE store from samsun");
  assert.notEqual(atakumbiz.id, atakum.id, "atakumbiz must be a SEPARATE store from atakum");
  assert.notEqual(atakumbiz.domain, samsun.domain, "the two Atakum Pet stores must keep distinct domains");
  // Its OWN logo + a theme distinct from the samsun store (visual identity).
  assert.equal(atakumbiz.logo, "/logo-atakumbiz.webp", "atakumbiz must use its own white wordmark on the colored topBar");
  assert.notEqual(atakumbiz.theme.topBar, samsun.theme.topBar, "atakumbiz must look visually distinct from samsun");
  assert.notEqual(atakumbiz.theme.primary, samsun.theme.primary, "atakumbiz must have its own primary color");
  // The apex host also resolves (not just the www form).
  assert.equal(getStoreByHost("atakum.biz").id, "atakumbiz");
});

test("atakumbiz is a LOCAL same-day store (Mahalle checkout + door payment), not cargo", () => {
  const atakumbiz = getStoreByHost(ATAKUMBIZ_HOST);
  assert.equal(atakumbiz.commerce.fulfillment, "local", "atakumbiz must use the local (Mahalle) flow");
  assert.equal(atakumbiz.commerce.shippingLabel, "Getirmesi", "local delivery fee label");
  assert.equal(atakumbiz.commerce.onlinePaymentOnly, false, "local store accepts door payment");
  assert.equal(atakumbiz.commerce.preorderEnabled, true, "preorder stays on for the local store");
});

test("brandify swaps shared JETGO body copy to the Atakum Pet brand + atakum.biz domain", () => {
  const atakumbiz = getStoreByHost(ATAKUMBIZ_HOST);
  assert.equal(brandifyFor(atakumbiz, "Neden JETGO?"), "Neden Atakum Pet?");
  assert.match(brandifyFor(atakumbiz, "jetgomarket.com"), /atakum\.biz/);
  assert.ok(!/jetgomarket\.com/i.test(brandifyFor(atakumbiz, "www.jetgomarket.com")), "must not leak the jetgo domain");
});

test("checkout on atakumbiz (local) offers door payment AND the online card (not online-only)", () => {
  const atakumbiz = getStoreByHost(ATAKUMBIZ_HOST);
  const opts = visiblePaymentOptions({
    ...allMethodsEnabled,
    onlinePaymentOnly: atakumbiz.commerce.onlinePaymentOnly,
  });
  const optIds = opts.map((o) => o.id);
  assert.ok(optIds.includes("online"), "online card must be available on the local store");
  assert.ok(optIds.includes("nakit"), "local store must keep the door cash option");
  assert.ok(optIds.length > 1, `local checkout must offer more than just the online card, got: ${JSON.stringify(optIds)}`);
});

test("served homepage HTML carries the Atakum Pet brand + local same-day copy (not cargo)", async () => {
  const html = await injectAllMeta(INDEX_HTML, "/", ATAKUMBIZ_HOST);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const ogSiteName = html.match(/<meta\s+property="og:site_name"\s+content="([^"]*)"/i)?.[1] ?? "";

  assert.match(title, /Atakum Pet/i, "homepage <title> must brand as Atakum Pet");
  assert.equal(ogSiteName, ATAKUMBIZ_BRAND, "og:site_name must be the Atakum Pet brand");
  assert.ok(!/JETGO/i.test(title), "atakumbiz homepage title must not contain JETGO");
  assert.match(title, SAME_DAY_SIGNATURE, "local same-day delivery copy expected");
  assert.ok(!CARGO_SIGNATURE.test(title), "atakumbiz must not show cargo copy");
});

test("test-OTP bypass lets a NEW customer place a local atakum.biz order (source_site=atakumbiz, door payment OK)", async () => {
  const prevEnv = process.env.NODE_ENV;
  const prevFlag = process.env.TEST_OTP_BYPASS;
  process.env.NODE_ENV = "development";
  process.env.TEST_OTP_BYPASS = "1";

  const phone = "555" + String(randomBytes(4).readUInt32BE(0)).padStart(7, "0").slice(-7);
  try {
    const send = await post("/api/otp/send", ATAKUMBIZ_HOST, { phone });
    assert.equal(send.status, 200, `otp/send failed: ${JSON.stringify(send.body)}`);
    assert.equal(send.body.isExisting, false, "fresh phone must be reported as new");

    const regRes = await fetch(`${baseUrl}/api/otp/verify`, {
      method: "POST",
      headers: { "X-Forwarded-Host": ATAKUMBIZ_HOST, "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code: "0000", name: `${MARK}_AB_BUYER`, address: `${MARK} Atakum Mah., Test Cad. No 7` }),
    });
    const regBody = await regRes.json() as any;
    assert.equal(regRes.status, 200, `registration failed: ${JSON.stringify(regBody)}`);
    assert.ok(regBody.id, "registration must return the new customer id");
    ids.customers.push(regBody.id as number);
    const realCookie = (regRes.headers.get("set-cookie") ?? "").split(";")[0];
    assert.ok(realCookie.includes("connect.sid"), "registration must set a session cookie");

    // Local store: door (cash) payment is ACCEPTED, unlike the cargo online-only stores.
    const order = await postWithCookie(
      "/api/orders",
      ATAKUMBIZ_HOST,
      { ...orderPayload(), customerName: `${MARK}_AB_BUYER`, customerPhone: phone, paymentMethod: "Kapıda Nakit" },
      realCookie,
    );
    assert.equal(order.status, 201, `local door-payment order POST failed: ${JSON.stringify(order.body)}`);
    const orderId = order.body.id as number;
    assert.ok(orderId, "order id missing in response");
    ids.orders.push(orderId);

    const row = await pool.query("SELECT source_site FROM orders WHERE id = $1", [orderId]);
    assert.equal(row.rows[0]?.source_site, "atakumbiz", "order must attribute to the atakum.biz storefront");
  } finally {
    if (prevEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = prevEnv;
    if (prevFlag === undefined) delete process.env.TEST_OTP_BYPASS; else process.env.TEST_OTP_BYPASS = prevFlag;
  }
});

// ---- jetgo.pet (jetgopet): a SECOND domain for the flagship JETGO brand -------
//
// Works the same way as jetgomarket.com: same JETGO branding, theme, logo and the
// LOCAL same-day commerce model, but a SEPARATE self-canonicalising store on its
// OWN domain (jetgo.pet) so it stays on its own URL instead of redirecting to
// jetgomarket.com. It INTENTIONALLY shares the "JETGO" brand word with the default
// `jetgo` store; the two stay SEPARATE via distinct id + domain. CRITICAL: the
// domain itself contains the substring "jetgo", so brandifyFor must rewrite
// jetgomarket.com -> jetgo.pet WITHOUT mangling it into "JETGO.pet".

test("jetgo.pet resolves the JETGO brand as a SEPARATE self-canonical store from the default jetgo", () => {
  const jetgopet = getStoreByHost(JETGOPET_HOST);
  const jetgo = getStoreByHost(JETGO_HOST);
  assert.equal(jetgopet.id, "jetgopet");
  assert.equal(jetgopet.name, JETGOPET_BRAND, "homepage wordmark/title brand name");
  assert.equal(jetgopet.brandWord, "JETGO");
  // Shares the JETGO brand word with the default store BY DESIGN, but must stay a
  // separate store: distinct id + domain (host resolution is by hostname).
  assert.equal(jetgopet.brandWord, jetgo.brandWord, "intentionally shares the JETGO brand word with the default store");
  assert.equal(jetgopet.domain, "https://www.jetgo.pet");
  assert.notEqual(jetgopet.id, jetgo.id, "jetgo.pet must be a SEPARATE store from the default jetgo");
  assert.notEqual(jetgopet.domain, jetgo.domain, "the two JETGO stores must keep distinct domains");
  // "jetgomarket.com gibi": same look (theme + logo) as the flagship.
  assert.deepEqual(jetgopet.theme, jetgo.theme, "jetgo.pet must look like jetgomarket.com");
  assert.equal(jetgopet.logo, jetgo.logo, "jetgo.pet reuses the JETGO logo");
  // The apex host also resolves (not just the www form).
  assert.equal(getStoreByHost("jetgo.pet").id, "jetgopet");
  // Canonical-redirect contract: the apex host resolves to the SAME store, whose
  // canonical host (derived from .domain) is the www form. So server/index.ts's
  // canonical-host middleware 301s jetgo.pet -> https://www.jetgo.pet and MUST NOT
  // redirect away to jetgomarket.com.
  const canonicalHost = new URL(jetgopet.domain).host;
  assert.equal(canonicalHost, "www.jetgo.pet", "301 target host for the apex must be the www form of jetgo.pet");
  assert.notEqual(canonicalHost, "jetgo.pet", "apex differs from canonical, so the middleware redirects to www");
  assert.ok(!/jetgomarket/i.test(canonicalHost), "jetgo.pet must self-canonicalise, never redirect to jetgomarket.com");
});

test("jetgopet is a LOCAL same-day store (like jetgomarket.com), not cargo", () => {
  const jetgopet = getStoreByHost(JETGOPET_HOST);
  assert.equal(jetgopet.commerce.fulfillment, "local", "jetgo.pet must use the local (Mahalle) flow");
  assert.equal(jetgopet.commerce.shippingLabel, "Getirmesi", "local delivery fee label");
  assert.equal(jetgopet.commerce.onlinePaymentOnly, false, "local store accepts door payment");
  assert.equal(jetgopet.commerce.preorderEnabled, true, "preorder stays on for the local store");
});

test("brandify rewrites the jetgomarket domain to jetgo.pet WITHOUT mangling the 'jetgo' substring", () => {
  const jetgopet = getStoreByHost(JETGOPET_HOST);
  // brandWord is also "JETGO" so brand-name swaps are no-ops; the domain swap is
  // what must survive intact: jetgomarket.com -> jetgo.pet, never "JETGO.pet".
  assert.equal(brandifyFor(jetgopet, "jetgomarket.com"), "jetgo.pet");
  assert.equal(brandifyFor(jetgopet, "www.jetgomarket.com"), "www.jetgo.pet");
  assert.equal(
    brandifyFor(jetgopet, "Sipariş için www.jetgomarket.com adresine gidin"),
    "Sipariş için www.jetgo.pet adresine gidin",
  );
  assert.ok(!/JETGO\.pet/.test(brandifyFor(jetgopet, "jetgomarket.com")), "domain must NOT be corrupted to JETGO.pet");
  assert.ok(!/jetgomarket\.com/i.test(brandifyFor(jetgopet, "www.jetgomarket.com")), "must not leak the jetgomarket domain");
});

test("brandify placeholder pass leaves other brands' domains unchanged (regression)", () => {
  // The placeholder pass must not change behavior for stores whose domain does
  // NOT contain the substring "jetgo".
  const atakum = getStoreByHost(ATAKUM_HOST);
  const samsun = getStoreByHost(SAMSUN_HOST);
  assert.equal(brandifyFor(atakum, "Neden JETGO? jetgomarket.com"), `Neden ${atakum.brandWord}? atakumpetshop.com`);
  assert.equal(brandifyFor(samsun, "www.jetgomarket.com"), "www.atakumpet.com");
});

test("checkout on jetgo.pet (local) offers door payment AND the online card (not online-only)", () => {
  const jetgopet = getStoreByHost(JETGOPET_HOST);
  const opts = visiblePaymentOptions({
    ...allMethodsEnabled,
    onlinePaymentOnly: jetgopet.commerce.onlinePaymentOnly,
  });
  const optIds = opts.map((o) => o.id);
  assert.ok(optIds.includes("online"), "online card must be available on the local store");
  assert.ok(optIds.includes("nakit"), "local store must keep the door cash option");
  assert.ok(optIds.length > 1, `local checkout must offer more than just the online card, got: ${JSON.stringify(optIds)}`);
});

test("served homepage HTML on jetgo.pet carries the JETGO brand + local same-day copy (not cargo)", async () => {
  const html = await injectAllMeta(INDEX_HTML, "/", JETGOPET_HOST);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const ogSiteName = html.match(/<meta\s+property="og:site_name"\s+content="([^"]*)"/i)?.[1] ?? "";

  assert.match(title, /JETGO/, "homepage <title> must brand as JETGO");
  assert.equal(ogSiteName, JETGOPET_BRAND, "og:site_name must be the JETGO brand name");
  assert.match(title, SAME_DAY_SIGNATURE, "local same-day delivery copy expected");
  assert.ok(!CARGO_SIGNATURE.test(title), "jetgo.pet must not show cargo copy");
  // jetgo.pet is Atakum-led like jetgomarket.com, but differentiated by DISTINCT
  // neighborhood copy so the two JETGO domains are not duplicate-content of each other.
  assert.match(title, /Atakum/i, "jetgo.pet homepage title must lead with Atakum");
  const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] ?? "";
  assert.match(
    description,
    /Esenevler|Balaç|Büyükoyumca|Çamlıyazı|OMÜ/i,
    "jetgo.pet homepage description must name its OWN Atakum neighborhoods (distinct from jetgomarket.com)",
  );
  // The brandify domain-swap must not corrupt the served markup into "JETGO.pet"
  // (case-sensitive: the correct lowercase "jetgo.pet" is expected to appear).
  assert.ok(!/JETGO\.pet/.test(html), "served HTML must not contain a corrupted JETGO.pet domain");
});

test("test-OTP bypass lets a NEW customer place a local jetgo.pet order (source_site=jetgopet, door payment OK)", async () => {
  const prevEnv = process.env.NODE_ENV;
  const prevFlag = process.env.TEST_OTP_BYPASS;
  process.env.NODE_ENV = "development";
  process.env.TEST_OTP_BYPASS = "1";

  const phone = "555" + String(randomBytes(4).readUInt32BE(0)).padStart(7, "0").slice(-7);
  try {
    const send = await post("/api/otp/send", JETGOPET_HOST, { phone });
    assert.equal(send.status, 200, `otp/send failed: ${JSON.stringify(send.body)}`);
    assert.equal(send.body.isExisting, false, "fresh phone must be reported as new");

    const regRes = await fetch(`${baseUrl}/api/otp/verify`, {
      method: "POST",
      headers: { "X-Forwarded-Host": JETGOPET_HOST, "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code: "0000", name: `${MARK}_JP_BUYER`, address: `${MARK} Atakum Mah., Test Cad. No 9` }),
    });
    const regBody = await regRes.json() as any;
    assert.equal(regRes.status, 200, `registration failed: ${JSON.stringify(regBody)}`);
    assert.ok(regBody.id, "registration must return the new customer id");
    ids.customers.push(regBody.id as number);
    const realCookie = (regRes.headers.get("set-cookie") ?? "").split(";")[0];
    assert.ok(realCookie.includes("connect.sid"), "registration must set a session cookie");

    // Local store: door (cash) payment is ACCEPTED, unlike the cargo online-only stores.
    const order = await postWithCookie(
      "/api/orders",
      JETGOPET_HOST,
      { ...orderPayload(), customerName: `${MARK}_JP_BUYER`, customerPhone: phone, paymentMethod: "Kapıda Nakit" },
      realCookie,
    );
    assert.equal(order.status, 201, `local door-payment order POST failed: ${JSON.stringify(order.body)}`);
    const orderId = order.body.id as number;
    assert.ok(orderId, "order id missing in response");
    ids.orders.push(orderId);

    const row = await pool.query("SELECT source_site FROM orders WHERE id = $1", [orderId]);
    assert.equal(row.rows[0]?.source_site, "jetgopet", "order must attribute to the jetgo.pet storefront");
  } finally {
    if (prevEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = prevEnv;
    if (prevFlag === undefined) delete process.env.TEST_OTP_BYPASS; else process.env.TEST_OTP_BYPASS = prevFlag;
  }
});

// ---------------------------------------------------------------------------
// jetgo.shop — a THIRD JETGO-branded LOCAL storefront, same model as jetgo.pet
// and jetgomarket.com but on its OWN self-canonical domain. Its domain also
// contains "jetgo", so it re-exercises the brandifyFor placeholder pass that must
// rewrite jetgomarket.com -> jetgo.shop WITHOUT mangling it into "JETGO.shop".
// ---------------------------------------------------------------------------

test("jetgo.shop resolves the JETGO brand as a SEPARATE self-canonical store from the default jetgo", () => {
  const jetgoshop = getStoreByHost(JETGOSHOP_HOST);
  const jetgo = getStoreByHost(JETGO_HOST);
  assert.equal(jetgoshop.id, "jetgoshop");
  assert.equal(jetgoshop.name, JETGOSHOP_BRAND, "homepage wordmark/title brand name");
  assert.equal(jetgoshop.brandWord, "JETGO");
  assert.equal(jetgoshop.brandWord, jetgo.brandWord, "intentionally shares the JETGO brand word with the default store");
  assert.equal(jetgoshop.domain, "https://www.jetgo.shop");
  assert.notEqual(jetgoshop.id, jetgo.id, "jetgo.shop must be a SEPARATE store from the default jetgo");
  assert.notEqual(jetgoshop.domain, jetgo.domain, "the two JETGO stores must keep distinct domains");
  assert.deepEqual(jetgoshop.theme, jetgo.theme, "jetgo.shop must look like jetgomarket.com");
  assert.equal(jetgoshop.logo, jetgo.logo, "jetgo.shop reuses the JETGO logo");
  // The apex host also resolves (not just the www form).
  assert.equal(getStoreByHost("jetgo.shop").id, "jetgoshop");
  // Canonical-redirect contract: apex resolves to the SAME store; canonical host
  // is the www form, so server/index.ts's canonical-host middleware 301s
  // jetgo.shop -> https://www.jetgo.shop and never redirects to jetgomarket.com.
  const canonicalHost = new URL(jetgoshop.domain).host;
  assert.equal(canonicalHost, "www.jetgo.shop", "301 target host for the apex must be the www form of jetgo.shop");
  assert.notEqual(canonicalHost, "jetgo.shop", "apex differs from canonical, so the middleware redirects to www");
  assert.ok(!/jetgomarket/i.test(canonicalHost), "jetgo.shop must self-canonicalise, never redirect to jetgomarket.com");
  // The two SECONDARY JETGO storefronts must also stay distinct from each other.
  const jetgopet = getStoreByHost(JETGOPET_HOST);
  assert.notEqual(jetgoshop.id, jetgopet.id, "jetgo.shop and jetgo.pet must be SEPARATE stores");
  assert.notEqual(jetgoshop.domain, jetgopet.domain, "jetgo.shop and jetgo.pet must keep distinct domains");
});

test("jetgoshop is a LOCAL same-day store (like jetgomarket.com), not cargo", () => {
  const jetgoshop = getStoreByHost(JETGOSHOP_HOST);
  assert.equal(jetgoshop.commerce.fulfillment, "local", "jetgo.shop must use the local (Mahalle) flow");
  assert.equal(jetgoshop.commerce.shippingLabel, "Getirmesi", "local delivery fee label");
  assert.equal(jetgoshop.commerce.onlinePaymentOnly, false, "local store accepts door payment");
  assert.equal(jetgoshop.commerce.preorderEnabled, true, "preorder stays on for the local store");
});

test("brandify rewrites the jetgomarket domain to jetgo.shop WITHOUT mangling the 'jetgo' substring", () => {
  const jetgoshop = getStoreByHost(JETGOSHOP_HOST);
  assert.equal(brandifyFor(jetgoshop, "jetgomarket.com"), "jetgo.shop");
  assert.equal(brandifyFor(jetgoshop, "www.jetgomarket.com"), "www.jetgo.shop");
  assert.equal(
    brandifyFor(jetgoshop, "Sipariş için www.jetgomarket.com adresine gidin"),
    "Sipariş için www.jetgo.shop adresine gidin",
  );
  assert.ok(!/JETGO\.shop/.test(brandifyFor(jetgoshop, "jetgomarket.com")), "domain must NOT be corrupted to JETGO.shop");
  assert.ok(!/jetgomarket\.com/i.test(brandifyFor(jetgoshop, "www.jetgomarket.com")), "must not leak the jetgomarket domain");
});

test("checkout on jetgo.shop (local) offers door payment AND the online card (not online-only)", () => {
  const jetgoshop = getStoreByHost(JETGOSHOP_HOST);
  const opts = visiblePaymentOptions({
    ...allMethodsEnabled,
    onlinePaymentOnly: jetgoshop.commerce.onlinePaymentOnly,
  });
  const optIds = opts.map((o) => o.id);
  assert.ok(optIds.includes("online"), "online card must be available on the local store");
  assert.ok(optIds.includes("nakit"), "local store must keep the door cash option");
  assert.ok(optIds.length > 1, `local checkout must offer more than just the online card, got: ${JSON.stringify(optIds)}`);
});

test("served homepage HTML on jetgo.shop carries the JETGO brand + local same-day copy (not cargo)", async () => {
  const html = await injectAllMeta(INDEX_HTML, "/", JETGOSHOP_HOST);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const ogSiteName = html.match(/<meta\s+property="og:site_name"\s+content="([^"]*)"/i)?.[1] ?? "";

  assert.match(title, /JETGO/, "homepage <title> must brand as JETGO");
  assert.equal(ogSiteName, JETGOSHOP_BRAND, "og:site_name must be the JETGO brand name");
  assert.match(title, SAME_DAY_SIGNATURE, "local same-day delivery copy expected");
  assert.ok(!CARGO_SIGNATURE.test(title), "jetgo.shop must not show cargo copy");
  assert.ok(!/JETGO\.shop/.test(html), "served HTML must not contain a corrupted JETGO.shop domain");
});

test("test-OTP bypass lets a NEW customer place a local jetgo.shop order (source_site=jetgoshop, door payment OK)", async () => {
  const prevEnv = process.env.NODE_ENV;
  const prevFlag = process.env.TEST_OTP_BYPASS;
  process.env.NODE_ENV = "development";
  process.env.TEST_OTP_BYPASS = "1";

  const phone = "555" + String(randomBytes(4).readUInt32BE(0)).padStart(7, "0").slice(-7);
  try {
    const send = await post("/api/otp/send", JETGOSHOP_HOST, { phone });
    assert.equal(send.status, 200, `otp/send failed: ${JSON.stringify(send.body)}`);
    assert.equal(send.body.isExisting, false, "fresh phone must be reported as new");

    const regRes = await fetch(`${baseUrl}/api/otp/verify`, {
      method: "POST",
      headers: { "X-Forwarded-Host": JETGOSHOP_HOST, "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code: "0000", name: `${MARK}_JS_BUYER`, address: `${MARK} Atakum Mah., Test Cad. No 9` }),
    });
    const regBody = await regRes.json() as any;
    assert.equal(regRes.status, 200, `registration failed: ${JSON.stringify(regBody)}`);
    assert.ok(regBody.id, "registration must return the new customer id");
    ids.customers.push(regBody.id as number);
    const realCookie = (regRes.headers.get("set-cookie") ?? "").split(";")[0];
    assert.ok(realCookie.includes("connect.sid"), "registration must set a session cookie");

    // Local store: door (cash) payment is ACCEPTED, unlike the cargo online-only stores.
    const order = await postWithCookie(
      "/api/orders",
      JETGOSHOP_HOST,
      { ...orderPayload(), customerName: `${MARK}_JS_BUYER`, customerPhone: phone, paymentMethod: "Kapıda Nakit" },
      realCookie,
    );
    assert.equal(order.status, 201, `local door-payment order POST failed: ${JSON.stringify(order.body)}`);
    const orderId = order.body.id as number;
    assert.ok(orderId, "order id missing in response");
    ids.orders.push(orderId);

    const row = await pool.query("SELECT source_site FROM orders WHERE id = $1", [orderId]);
    assert.equal(row.rows[0]?.source_site, "jetgoshop", "order must attribute to the jetgo.shop storefront");
  } finally {
    if (prevEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = prevEnv;
    if (prevFlag === undefined) delete process.env.TEST_OTP_BYPASS; else process.env.TEST_OTP_BYPASS = prevFlag;
  }
});

// ---- Programmatic SEO landing pages (third server-rendered surface) ----
//
// injectAllMeta routes known SEO slugs (client/src/lib/seo-data) through
// injectSeoMeta: the shared title/description/keywords are brandified to the
// requesting domain and canonical/og:url are bound to that domain. A regression
// there would let an SEO landing page on a non-default host leak the default
// JETGO brand into the exact surfaces that drive organic ranking and share
// previews (title, meta description, og:title/description, canonical). These
// tests exercise that path for the atakum and samsun hosts using a real slug
// whose source metaTitle/metaDescription contain BOTH "JETGO" and
// "jetgomarket.com" — so a working brandify must rewrite the brand word AND the
// domain, and a broken one would leave a detectable leak.

// Per-commerce-model SEO fixtures. The same slug can carry BOTH a localOnly and
// a cargoOnly entry, so each fixture is resolved against a store of the matching
// model via findSeoPage (which returns the served variant).
const SEO_TEST_SLUG = "jetgo-petshop";            // localOnly (local hosts)
const CARGO_SEO_TEST_SLUG = "kedi-mamasi-siparis"; // cargoOnly (cargo hosts)
const seoTestPage = findSeoPage(SEO_TEST_SLUG, getStoreByHost(JETGO_HOST));
// Resolve the cargo fixture from the SHARED, storeless cargoOnly page directly:
// no cargo store is "clean" anymore (samsunpet, samsun, karadeniz and markapet ALL
// own an exclusive corpus that overrides this slug with an already-brandified
// page, which would defeat the brandify guard below). The storeless cargo twin
// still carries the raw "JETGO" placeholder that the per-host brandify must swap.
const cargoSeoTestPage = SEO_PAGES.find(
  (p) => p.slug === CARGO_SEO_TEST_SLUG && !p.storeId && (p.availability ?? "all") === "cargoOnly",
);

// Mirror of seo-meta.ts escapeHtml so the exact-match assertions below stay
// correct even if the brandified copy ever contains HTML-special characters.
const escapeHtmlForTest = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

test("SEO test fixtures exist with brandifiable source content (per commerce model)", () => {
  // Guards the tests below against silently passing if seo-data is edited so a
  // fixture slug disappears or no longer carries the JETGO brand to swap.
  assert.ok(seoTestPage, `seo-data must still define a localOnly "${SEO_TEST_SLUG}" page`);
  assert.equal(seoTestPage!.availability, "localOnly", "local fixture must be localOnly");
  assert.match(seoTestPage!.metaTitle, /JETGO/, "local fixture metaTitle must contain JETGO to brandify");
  assert.match(seoTestPage!.metaTitle, /jetgomarket\.com/i, "local fixture metaTitle must contain the jetgo domain to brandify");

  assert.ok(cargoSeoTestPage, `seo-data must still define a cargoOnly "${CARGO_SEO_TEST_SLUG}" page`);
  assert.equal(cargoSeoTestPage!.availability, "cargoOnly", "cargo fixture must be cargoOnly");
  assert.match(cargoSeoTestPage!.metaTitle, /JETGO/, "cargo fixture metaTitle must contain JETGO to brandify");
});

// Assert an SEO landing page served on `host` carries `store`'s brand across
// title / description / og:title / og:description and self-canonicalizes to the
// store domain, never leaking the default JETGO brand or domain.
async function assertSeoLandingBranding(host: string, store: ReturnType<typeof getStoreByHost>) {
  // Pick the fixture for this store's commerce model (the same slug can have a
  // localOnly and a cargoOnly variant; only one is served per store).
  const slug = isCargoStore(store) ? CARGO_SEO_TEST_SLUG : SEO_TEST_SLUG;
  const page = findSeoPage(slug, store);
  assert.ok(page, `${host}: fixture "${slug}" must be served on the ${store.id} commerce model`);
  const html = await injectAllMeta(INDEX_HTML, `/${slug}`, host);

  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] ?? "";
  const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i)?.[1] ?? "";
  const ogDescription = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i)?.[1] ?? "";
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? "";
  const ogUrl = html.match(/<meta\s+property="og:url"\s+content="([^"]*)"/i)?.[1] ?? "";

  // Title/description must equal the brandified source verbatim (proves the
  // SEO content was taken from the shared table AND brandified for this host).
  assert.equal(title, escapeHtmlForTest(brandifyFor(store, page!.metaTitle)), `${host} SEO <title> must be the brandified metaTitle`);
  assert.equal(description, escapeHtmlForTest(brandifyFor(store, page!.metaDescription)), `${host} SEO description must be the brandified metaDescription`);
  // og:title / og:description mirror the brandified title/description.
  assert.equal(ogTitle, title, `${host} og:title must mirror the brandified <title>`);
  assert.equal(ogDescription, description, `${host} og:description must mirror the brandified description`);

  // Brand word present; default brand + domain absent from every text surface.
  assert.ok(title.includes(store.brandWord), `${host} SEO <title> must carry the ${store.brandWord} brand`);
  for (const [label, val] of [["title", title], ["description", description], ["og:title", ogTitle], ["og:description", ogDescription]] as const) {
    assert.ok(!/JETGO/i.test(val), `${host} SEO ${label} must not leak the JETGO brand`);
    assert.ok(!/jetgomarket\.com/i.test(val), `${host} SEO ${label} must not leak the jetgo domain`);
  }

  // Self-canonicalization: canonical + og:url bind to THIS store's domain/slug.
  const expectedCanonical = `${store.domain}/${slug}`;
  assert.equal(canonical, expectedCanonical, `${host} SEO canonical must bind to the ${store.id} domain`);
  assert.equal(ogUrl, expectedCanonical, `${host} SEO og:url must bind to the ${store.id} domain`);
  assert.ok(!/jetgomarket\.com/i.test(canonical), `${host} SEO canonical must not point at the jetgo domain`);
}

test("SEO landing page brands title/description/og + canonical per host (atakum)", async () => {
  await assertSeoLandingBranding(ATAKUM_HOST, getStoreByHost(ATAKUM_HOST));
});

test("SEO landing page brands title/description/og + canonical per host (samsun)", async () => {
  await assertSeoLandingBranding(SAMSUN_HOST, getStoreByHost(SAMSUN_HOST));
});

test("SEO landing page brands title/description/og + canonical per host (samsunpet)", async () => {
  await assertSeoLandingBranding(SAMSUNPET_HOST, getStoreByHost(SAMSUNPET_HOST));
});

test("SEO landing page brands title/description/og + canonical per host (karadeniz)", async () => {
  await assertSeoLandingBranding(KARADENIZ_HOST, getStoreByHost(KARADENIZ_HOST));
});

test("SEO landing page brands title/description/og + canonical per host (atakumbiz)", async () => {
  await assertSeoLandingBranding(ATAKUMBIZ_HOST, getStoreByHost(ATAKUMBIZ_HOST));
});

// ---- atakum.biz "1 saatte teslimat Atakum" SEO coverage --------------------
test("atakum.biz homepage title leads with the 1-saatte Atakum angle (keeps same-day, no cargo)", async () => {
  const html = await injectAllMeta(INDEX_HTML, "/", ATAKUMBIZ_HOST);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  assert.match(title, /1 saat/i, "atakumbiz home title must feature the 1-hour Atakum delivery angle");
  assert.match(title, SAME_DAY_SIGNATURE, "atakumbiz home title must still carry same-day copy");
  assert.ok(!CARGO_SIGNATURE.test(title), "atakumbiz home title must not show cargo copy");
});

test("atakum.biz serves the expanded attached keyword corpus (newly added slugs resolve)", () => {
  const store = getStoreByHost(ATAKUMBIZ_HOST);
  const newSlugs = [
    "1-saatte-mama",
    "1-saatte-kedi-mamasi",
    "kapiya-mama-getir",
    "evime-kedi-mamasi-getir",
    "kedi-mamasi-satin-al",
    "akvaryum-malzemeleri",
    "kopek-tasmasi-siparis",
    "online-petshop-atakum",
  ];
  for (const slug of newSlugs) {
    assert.ok(findSeoPage(slug, store), `atakumbiz must serve the newly added keyword page "${slug}"`);
  }
});

test("a local 1-saatte keyword page serves the 1-hour Atakum copy on atakum.biz and stays off cargo", async () => {
  const localStore = getStoreByHost(ATAKUMBIZ_HOST);
  const cargoStore = SYNTHETIC_CARGO_STORE;
  const slug = "1-saatte-mama";

  assert.ok(findSeoPage(slug, localStore), `atakumbiz must serve "${slug}"`);

  const html = await injectAllMeta(INDEX_HTML, `/${slug}`, ATAKUMBIZ_HOST);
  const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] ?? "";
  assert.match(description, /1 saat/i, "local 1-saatte page must serve the 1-hour delivery copy");
  assert.ok(!CARGO_SIGNATURE.test(description), "local page must not leak cargo copy");

  const ldBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  const faqLd = ldBlocks.find((b) => b.includes("FAQPage"));
  assert.ok(faqLd, "local keyword page must emit FAQPage JSON-LD");
  assert.match(faqLd!, /1 saat/i, "FAQPage JSON-LD must carry the 1-hour delivery answer");

  // Proximity / immediacy keywords are local-only: present locally, absent on cargo.
  for (const localIntentSlug of ["petshop-mahallemde", "petshop-navigasyon", "petshop-adres"]) {
    assert.ok(findSeoPage(localIntentSlug, localStore), `atakumbiz must serve local-intent "${localIntentSlug}"`);
    assert.ok(!findSeoPage(localIntentSlug, cargoStore), `cargo must not serve local-intent "${localIntentSlug}"`);
  }

  assert.ok(!findSeoPage(slug, cargoStore), `cargo store must not serve the local-intent "${slug}"`);
});

test("SEO landing page brands title/description/og + canonical per host (markapet)", async () => {
  await assertSeoLandingBranding(MARKAPET_HOST, getStoreByHost(MARKAPET_HOST));
});

test("SEO landing page on jetgo.pet keeps the JETGO brand but self-canonicalizes to jetgo.pet (domain not mangled)", async () => {
  // jetgopet shares the JETGO brand word, so unlike the other branded hosts the
  // brand word is EXPECTED to remain; the DOMAIN, however, must be rewritten from
  // jetgomarket.com to jetgo.pet WITHOUT being corrupted into "JETGO.pet". The
  // shared assertSeoLandingBranding helper asserts JETGO is absent, so jetgopet
  // needs its own assertions here.
  const store = getStoreByHost(JETGOPET_HOST);
  const html = await injectAllMeta(INDEX_HTML, `/${SEO_TEST_SLUG}`, JETGOPET_HOST);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] ?? "";
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? "";
  const ogUrl = html.match(/<meta\s+property="og:url"\s+content="([^"]*)"/i)?.[1] ?? "";

  // Title/description equal the brandified source verbatim (brand word kept,
  // domain rewritten to jetgo.pet).
  assert.equal(title, escapeHtmlForTest(brandifyFor(store, seoTestPage!.metaTitle)), "jetgo.pet SEO <title> must be the brandified metaTitle");
  assert.equal(description, escapeHtmlForTest(brandifyFor(store, seoTestPage!.metaDescription)), "jetgo.pet SEO description must be the brandified metaDescription");
  assert.match(title, /JETGO/, "jetgo.pet keeps the shared JETGO brand word");
  assert.ok(!/jetgomarket\.com/i.test(title), "jetgo.pet SEO title must not leak the jetgomarket domain");
  assert.ok(!/JETGO\.pet/.test(title), "jetgo.pet SEO title domain must not be corrupted to JETGO.pet");

  // Self-canonicalization: canonical + og:url bind to the jetgo.pet domain/slug.
  const expectedCanonical = `${store.domain}/${SEO_TEST_SLUG}`;
  assert.equal(canonical, expectedCanonical, "jetgo.pet SEO canonical must bind to the jetgo.pet domain");
  assert.equal(ogUrl, expectedCanonical, "jetgo.pet SEO og:url must bind to the jetgo.pet domain");
  assert.ok(!/jetgomarket\.com/i.test(canonical), "jetgo.pet SEO canonical must not point at the jetgomarket domain");
});

test("SEO landing page on jetgo.shop keeps the JETGO brand but self-canonicalizes to jetgo.shop (domain not mangled)", async () => {
  // jetgoshop shares the JETGO brand word, so the brand word is EXPECTED to remain;
  // the DOMAIN must be rewritten from jetgomarket.com to jetgo.shop WITHOUT being
  // corrupted into "JETGO.shop". The shared assertSeoLandingBranding helper asserts
  // JETGO is absent, so jetgoshop needs its own assertions here.
  const store = getStoreByHost(JETGOSHOP_HOST);
  const html = await injectAllMeta(INDEX_HTML, `/${SEO_TEST_SLUG}`, JETGOSHOP_HOST);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] ?? "";
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? "";
  const ogUrl = html.match(/<meta\s+property="og:url"\s+content="([^"]*)"/i)?.[1] ?? "";

  assert.equal(title, escapeHtmlForTest(brandifyFor(store, seoTestPage!.metaTitle)), "jetgo.shop SEO <title> must be the brandified metaTitle");
  assert.equal(description, escapeHtmlForTest(brandifyFor(store, seoTestPage!.metaDescription)), "jetgo.shop SEO description must be the brandified metaDescription");
  assert.match(title, /JETGO/, "jetgo.shop keeps the shared JETGO brand word");
  assert.ok(!/jetgomarket\.com/i.test(title), "jetgo.shop SEO title must not leak the jetgomarket domain");
  assert.ok(!/JETGO\.shop/.test(title), "jetgo.shop SEO title domain must not be corrupted to JETGO.shop");

  const expectedCanonical = `${store.domain}/${SEO_TEST_SLUG}`;
  assert.equal(canonical, expectedCanonical, "jetgo.shop SEO canonical must bind to the jetgo.shop domain");
  assert.equal(ogUrl, expectedCanonical, "jetgo.shop SEO og:url must bind to the jetgo.shop domain");
  assert.ok(!/jetgomarket\.com/i.test(canonical), "jetgo.shop SEO canonical must not point at the jetgomarket domain");
});

test("Samsun/Atakum neighborhood keyword pages are LOCAL-only, serve on jetgo.shop, and never leak into cargo", async () => {
  // jetgo.shop is the Samsun-focused LOCAL same-day JETGO storefront. The attached
  // keyword file adds hyper-local mahalle long-tail (Denizevleri, Atakent, Mimar
  // Sinan, Kurupelit...). A bare "atakent kedi maması" has no intent token, so the
  // LOCAL_INTENT_RE neighborhood group is what keeps it OUT of the dormant
  // cargo-model pages (a cargo-model store must never claim neighborhood service).
  const NEIGHBORHOOD_SLUGS = [
    "denizevleri-petshop",
    "atakent-kedi-mamasi",
    "mimar-sinan-petshop",
    "kurupelit-petshop",
  ];
  const jetgoshop = getStoreByHost(JETGOSHOP_HOST);
  const cargoStore = SYNTHETIC_CARGO_STORE;
  assert.ok(isCargoStore(cargoStore), "guard: synthetic cargo fixture must be a cargo store");
  assert.ok(!isCargoStore(jetgoshop), "guard: jetgo.shop must be a local store");

  for (const slug of NEIGHBORHOOD_SLUGS) {
    const localPage = findSeoPage(slug, jetgoshop);
    assert.ok(localPage, `neighborhood page "${slug}" must be served on jetgo.shop (local)`);
    assert.equal(localPage!.availability, "localOnly", `"${slug}" must be localOnly`);
    assert.equal(
      findSeoPage(slug, cargoStore),
      undefined,
      `"${slug}" must NOT be reachable on a cargo-model store`,
    );
  }

  // The served HTML must brandify to JETGO and stay on the local (non-cargo) model.
  const html = await injectAllMeta(INDEX_HTML, "/denizevleri-petshop", JETGOSHOP_HOST);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] ?? "";
  assert.match(title, /JETGO/, "neighborhood SEO title must carry the JETGO brand");
  assert.ok(!CARGO_SIGNATURE.test(`${title} ${description}`), "local neighborhood page must not show cargo (türkiye geneli) copy");
  assert.ok(!/jetgomarket\.com/i.test(`${title} ${description}`), "neighborhood page must not leak the jetgomarket domain");
});

test("jetgomarket.com homepage SEO is Atakum-led with neighborhood reach, local same-day, not cargo", async () => {
  // jetgomarket.com (default jetgo, LOCAL same-day) physically sits in Atakum, so its
  // homepage SEO leads with Atakum + mahalle reach while keeping Samsun-wide same-day.
  // It must NOT read like a Türkiye-geneli cargo store, and as a LOCAL store it must
  // also serve the shared neighborhood keyword pages.
  const jetgo = getStoreByHost(JETGO_HOST);
  assert.ok(!isCargoStore(jetgo), "guard: jetgomarket.com must be a local store");

  const html = await injectAllMeta(INDEX_HTML, "/", JETGO_HOST);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] ?? "";
  const blob = `${title} ${description}`;
  assert.match(title, /Atakum/i, "jetgomarket homepage title must lead with Atakum");
  assert.match(title, /JETGO/, "jetgomarket homepage title must keep the JETGO brand");
  assert.match(blob, SAME_DAY_SIGNATURE, "jetgomarket homepage must keep local same-day copy");
  assert.ok(!CARGO_SIGNATURE.test(blob), "jetgomarket homepage must not carry cargo (türkiye geneli) copy");
  assert.match(
    description,
    /Denizevleri|Atakent|Mimar Sinan|Yenimahalle|Kurupelit/,
    "jetgomarket homepage description must name Atakum neighborhoods",
  );

  // As a LOCAL store it serves the shared neighborhood keyword pages.
  const page = findSeoPage("denizevleri-petshop", jetgo);
  assert.ok(page, "neighborhood keyword page must serve on jetgomarket.com");
  assert.equal(page!.availability, "localOnly", "neighborhood page must be localOnly");
});

test("SEO landing page on the default (jetgo) host keeps the JETGO brand (contrast)", async () => {
  // Proves the per-host checks above actually discriminate: on the default store
  // brandify is a no-op, so the JETGO brand and domain are expected to remain.
  const store = getStoreByHost(JETGO_HOST);
  const html = await injectAllMeta(INDEX_HTML, `/${SEO_TEST_SLUG}`, JETGO_HOST);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? "";
  assert.match(title, /JETGO/, "default-host SEO title keeps the JETGO brand (brandify is a no-op)");
  assert.equal(canonical, `${store.domain}/${SEO_TEST_SLUG}`, "default-host SEO canonical binds to the jetgo domain");
});

// ---- Dormant cargo commerce path stays truthful + self-consistent (data layer) ----
//
// Every real store is LOCAL same-day now, so no host serves the cargo model. The
// cargo branch (isCargoStore / getSeoPagesForStore / findSeoPage on a cargo
// fulfillment) is still reachable in code, so it is exercised at the DATA layer
// through SYNTHETIC_CARGO_STORE — never via a live host SSR. These tests prove
// (a) per-model eligibility (localOnly hidden on a cargo store, cargoOnly hidden
// on a local store), (b) the dormant cargoOnly corpus leaks no local claim, and
// (c) no internal/buy link is orphaned within either commerce model.

// A localOnly keyword page carrying BOTH the door-payment claim and the Samsun
// neighborhood list — the strongest "local" fixture to prove cargo hides it.
const seoLocalKeywordPage = SEO_PAGES.find(
  (p) =>
    p.type === "keyword" &&
    p.availability === "localOnly" &&
    /Kapıda nakit, kredi kartı \(POS\) ve QR/.test(p.intro.join(" ")) &&
    /Atakum, İlkadım, Canik ve Tekkeköy/.test(p.intro.join(" ")),
);

const noscriptOf = (html: string) => html.match(/<noscript>([\s\S]*?)<\/noscript>/i)?.[1] ?? "";
const titleOf = (html: string) => html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";

// Commerce-model claims that are TRUE for the local same-day-courier model but
// FALSE on a cargo / online-payment store. Brand words (which can themselves
// contain a city name, e.g. "Samsun Pet") are deliberately excluded so the
// scanner never false-positives on a store's own brand.
const FORBIDDEN_LOCAL: { re: RegExp; label: string }[] = [
  { re: /\bkapıda\b/i, label: "door (kapıda) claim" },
  { re: /aynı gün|ayni gun/i, label: "same-day" },
  { re: /ortalama 1-3 saat|1-3 saatte/i, label: "1-3 hour courier" },
  { re: /60 dakika|1 saat içinde|1 saatte/i, label: "≤1 hour delivery" },
  { re: /\bkurye\b/i, label: "courier" },
  { re: /whatsapp/i, label: "whatsapp order" },
  { re: /\bgetir\b/i, label: "getir" },
  { re: /nöbetçi|nobetci/i, label: "night-open" },
  { re: /Atakum, İlkadım, Canik/i, label: "neighborhood delivery list" },
  // In-person-only payment options: on a cargo / online-payment store these are
  // false. Brand words never contain them, so they are safe to forbid outright.
  { re: /\bnakit\b/i, label: "cash payment" },
  { re: /\bPOS\b/, label: "POS terminal" },
  { re: /\bQR\b/, label: "QR payment" },
];

test("local keyword fixture exists and carries the local same-day/door-payment claims", () => {
  // Guards the eligibility test below: if seo-data stops emitting localOnly
  // keyword pages with the local claims, the cargo assertions pass vacuously.
  assert.ok(seoLocalKeywordPage, "seo-data must still define a localOnly keyword page carrying the local claims");
  const intro = seoLocalKeywordPage!.intro.join(" ");
  assert.match(intro, /Kapıda nakit, kredi kartı \(POS\) ve QR/, "fixture intro must carry the door-payment claim");
  assert.match(intro, /Atakum, İlkadım, Canik ve Tekkeköy/, "fixture intro must carry the neighborhood delivery list");
});

test("per-model eligibility (data layer): localOnly hidden on cargo, cargoOnly hidden on local", () => {
  // No live cargo host exists anymore; the dormant cargo branch is exercised at
  // the resolver layer only, through the synthetic cargo fixture.
  const cargoStore = SYNTHETIC_CARGO_STORE;
  const localStore = getStoreByHost(ATAKUM_HOST);
  const localSlug = seoLocalKeywordPage!.slug;

  // A cargo-native slug = cargoOnly with NO localOnly twin (so resolving it on a
  // local store can only return undefined, never a same-slug local variant).
  const localSlugs = new Set(SEO_PAGES.filter((p) => p.availability === "localOnly").map((p) => p.slug));
  const cargoNativeSlug = SEO_PAGES.find((p) => p.availability === "cargoOnly" && !localSlugs.has(p.slug))?.slug;
  assert.ok(cargoNativeSlug, "seo-data must still define at least one cargo-native keyword (cargoOnly, no local twin)");

  // Resolver layer: each model only resolves its own variant.
  assert.ok(!findSeoPage(localSlug, cargoStore), `localOnly "${localSlug}" must not resolve on a cargo store`);
  assert.ok(!findSeoPage(cargoNativeSlug!, localStore), `cargo-native "${cargoNativeSlug}" must not resolve on a local store`);
});

test("forbidden-claim scanner: the dormant cargo SEO corpus carries no local claim (source)", () => {
  // No store serves the cargo model anymore, but the dormant cargoOnly corpus must
  // stay truthful by construction so the code path is safe if it is ever revived.
  // Pure data-layer scan over every cargoOnly page's text fields (no host SSR).
  const cargoPages = SEO_PAGES.filter((p) => p.availability === "cargoOnly");
  assert.ok(cargoPages.length > 0, "the dormant cargo SEO corpus must still exist");

  for (const p of cargoPages) {
    const hay = [
      p.metaTitle,
      p.metaDescription,
      p.keywords,
      p.h1,
      ...p.intro,
      ...(p.sections ?? []).flatMap((s) => [s.h2, ...s.paragraphs, ...(s.list ?? [])]),
      ...(p.features ?? []),
      ...p.faq.flatMap((f) => [f.q, f.a]),
      ...p.internalLinks.map((l) => l.text),
      ...(p.buyLinks ?? []).map((l) => l.text),
    ].join("  ");
    for (const { re, label } of FORBIDDEN_LOCAL) {
      assert.ok(!re.test(hay), `cargo page "${p.slug}" source leaks local claim (${label}): ${hay.match(re)?.[0]}`);
    }
  }
});

test("local host serves the same-day / neighborhood static crawler block + areaServed list", async () => {
  // SSR check on a LOCAL host: the static #seo-static crawler block and the
  // LocalBusiness JSON-LD must carry the same-day claim and the neighborhood
  // areaServed list. (The cargo full-HTML scan was retired with the cargo hosts;
  // every host is local now.)
  const html = await injectAllMeta(INDEX_HTML, `/${SEO_TEST_SLUG}`, ATAKUM_HOST);
  const seoStatic = html.match(/<div id="seo-static"[^>]*>[\s\S]*?<\/div>/i)?.[0] ?? "";
  assert.match(seoStatic, /aynı gün|Aynı gün/i, "local host keeps the same-day claim in its static crawler block");
  assert.match(html, /"areaServed":\s*\[/, "local host keeps its neighborhood areaServed list");
});

test("dormant cargo SEO landing copy speaks the cargo model and brandifies to the store (data layer)", () => {
  // The dormant cargoOnly corpus resolves only via the synthetic cargo fixture.
  // Verify the page still speaks the cargo delivery model and that brandifyFor
  // injects the store's brand word into its copy.
  const page = findSeoPage(CARGO_SEO_TEST_SLUG, SYNTHETIC_CARGO_STORE);
  assert.ok(page, `synthetic cargo store must resolve the dormant cargoOnly "${CARGO_SEO_TEST_SLUG}" page`);
  const source = [
    page!.metaTitle,
    page!.metaDescription,
    page!.h1,
    ...page!.intro,
    ...(page!.sections ?? []).flatMap((s) => [s.h2, ...s.paragraphs]),
    ...page!.faq.flatMap((f) => [f.q, f.a]),
  ].join("  ");
  assert.match(source, /kargo/i, "dormant cargo SEO copy must speak the cargo delivery model");
  const branded = brandifyFor(SYNTHETIC_CARGO_STORE, source);
  assert.ok(
    branded.includes(SYNTHETIC_CARGO_STORE.brandWord),
    "brandifyFor must inject the synthetic store brand word into the cargo copy",
  );
});

test("no SEO internal/buy link is orphaned within its commerce model", () => {
  const localStore = getStoreByHost(ATAKUM_HOST);
  for (const [label, store] of [["local", localStore], ["cargo", SYNTHETIC_CARGO_STORE]] as const) {
    const avail = availableSlugSet(store);
    const orphans: string[] = [];
    for (const p of getSeoPagesForStore(store)) {
      const links = [...p.internalLinks, ...(p.buyLinks ?? [])];
      for (const l of links) {
        const m = (l.href || "").match(/^\/([^/?#]+)$/);
        if (!m) continue;
        const s = m[1];
        if (!ALL_SEO_SLUGS.has(s)) continue; // app route, not an SEO page
        if (!avail.has(s)) orphans.push(`${p.slug} -> ${l.href}`);
      }
    }
    assert.equal(orphans.length, 0, `${label} model has orphaned SEO links: ${orphans.slice(0, 10).join(", ")}`);
  }
});

// ---- Per-domain sitemap partition (the 3 independent JETGO domains) ----
//
// jetgomarket.com / jetgo.pet / jetgo.shop serve the SAME shared local corpus.
// Each must publish a DISTINCT sitemap: a disjoint, even slice of that corpus.
// The pages themselves stay reachable on every domain — only the sitemap listing
// is partitioned.

test("sitemap partition: the 3 JETGO domains list disjoint, complete shared slices + own exclusives", () => {
  const jetgo = getStoreByHost("www.jetgomarket.com");
  const jetgopet = getStoreByHost("www.jetgo.pet");
  const jetgoshop = getStoreByHost("www.jetgo.shop");
  assert.deepEqual(
    [jetgo.id, jetgopet.id, jetgoshop.id],
    ["jetgo", "jetgopet", "jetgoshop"],
    "partition test must target the three JETGO local stores",
  );

  const stores = [jetgo, jetgopet, jetgoshop];
  const sitemaps = stores.map((s) => getSitemapPagesForStore(s));

  // Every store's sitemap lists each slug at most once.
  for (const [i, sm] of sitemaps.entries()) {
    const slugs = sm.map((p) => p.slug);
    assert.equal(new Set(slugs).size, slugs.length, `store ${i} sitemap has duplicate slugs`);
  }

  // ---- SHARED corpus (storeless pages) is split by the mod-3 hash partition. ----
  const sharedSlices = sitemaps.map(
    (sm) => new Set(sm.filter((p) => !p.storeId).map((p) => p.slug)),
  );

  // The full shared universe the group partitions: the RAW storeless LOCAL corpus,
  // MINUS any slug claimed by a group-exclusive override — those are listed only by
  // their exclusive owner and are dropped from the hash partition on every member.
  // No member is clean anymore (jetgo, jetgopet AND jetgoshop each own a corpus).
  const exclusiveSlugs = new Set<string>([
    ...sitemaps[0].filter((p) => p.storeId).map((p) => p.slug), // jetgo exclusives
    ...sitemaps[1].filter((p) => p.storeId).map((p) => p.slug), // jetgopet exclusives
    ...sitemaps[2].filter((p) => p.storeId).map((p) => p.slug), // jetgoshop exclusives
  ]);
  // Base the shared universe on the RAW storeless local-eligible corpus, MINUS any
  // slug claimed by a group exclusive. Every member of this group now owns an
  // exclusive corpus, so getSeoPagesForStore(<member>) can no longer expose the
  // full storeless set (it hides the twins that member overrides).
  const sharedFull = new Set(
    [...CLEAN_LOCAL_SLUGS].filter((s) => !exclusiveSlugs.has(s)),
  );

  // Each shared slice is non-empty and a strict subset of the shared universe.
  for (const [i, set] of sharedSlices.entries()) {
    assert.ok(set.size > 0, `shared slice ${i} is empty`);
    assert.ok(set.size < sharedFull.size, `shared slice ${i} is not a strict subset`);
  }

  // Pairwise disjoint — the three shared slices share no slug.
  for (let i = 0; i < sharedSlices.length; i++) {
    for (let j = i + 1; j < sharedSlices.length; j++) {
      const overlap = [...sharedSlices[i]].filter((s) => sharedSlices[j].has(s));
      assert.equal(overlap.length, 0, `shared slices ${i} and ${j} overlap: ${overlap.slice(0, 5).join(", ")}`);
    }
  }

  // Union covers the whole shared corpus — no shared slug is dropped everywhere.
  const sharedUnion = new Set<string>();
  for (const set of sharedSlices) for (const s of set) sharedUnion.add(s);
  assert.equal(sharedUnion.size, sharedFull.size, "shared partition slices must cover the full shared corpus");
  for (const s of sharedFull) assert.ok(sharedUnion.has(s), `shared slug missing from every sitemap: ${s}`);

  // ---- OWN store-exclusive pages bypass the partition: each domain lists ALL of
  // its own. jetgoshop legitimately reuses some jetgo slugs for its own
  // store-scoped pages, so exclusives are matched per storeId, never by slug. ----
  const jetgoEx = new Set(sitemaps[0].filter((p) => p.storeId === "jetgo").map((p) => p.slug));
  for (const p of JETGO_EXCLUSIVE_PAGES) {
    assert.ok(jetgoEx.has(p.slug), `${p.slug}: jetgo sitemap must list its own exclusive`);
  }
  const shopEx = new Set(sitemaps[2].filter((p) => p.storeId === "jetgoshop").map((p) => p.slug));
  for (const p of JETGOSHOP_ALL_EXCLUSIVE_PAGES) {
    assert.ok(shopEx.has(p.slug), `${p.slug}: jetgoshop sitemap must list its own exclusive`);
  }
  const petEx = new Set(sitemaps[1].filter((p) => p.storeId === "jetgopet").map((p) => p.slug));
  for (const p of JETGOPET_ALL_EXCLUSIVE_PAGES) {
    assert.ok(petEx.has(p.slug), `${p.slug}: jetgopet sitemap must list its own exclusive`);
  }
  // No FOREIGN store-exclusive leaks into any member's sitemap.
  assert.equal(
    sitemaps[0].filter((p) => p.storeId && p.storeId !== "jetgo").length,
    0,
    "jetgo sitemap must not list a foreign exclusive",
  );
  assert.equal(
    sitemaps[1].filter((p) => p.storeId && p.storeId !== "jetgopet").length,
    0,
    "jetgopet sitemap must not list a foreign exclusive",
  );
  assert.equal(
    sitemaps[2].filter((p) => p.storeId && p.storeId !== "jetgoshop").length,
    0,
    "jetgoshop sitemap must not list a foreign exclusive",
  );

  // Deterministic across calls (stable hash, no churn between deploys).
  const again = new Set(
    getSitemapPagesForStore(jetgopet).filter((p) => !p.storeId).map((p) => p.slug),
  );
  assert.deepEqual([...again].sort(), [...sharedSlices[1]].sort(), "shared partition must be deterministic");
});

// The 4 sibling LOCAL domains (atakumpet.com → "samsun", samsunpet.com →
// "samsunpet", karadenizpetshop.com → "karadeniz", marka.pet → "markapet") share
// the SAME local corpus and must likewise each publish a DISTINCT sitemap. This is
// an INDEPENDENT partition group from the JETGO trio. ALL four sibling domains
// (atakumpet.com, samsunpet.com, karadenizpetshop.com, marka.pet) own a
// store-EXCLUSIVE corpus, so — exactly like the JETGO trio — the shared corpus is
// hash-partitioned across the group while each domain also lists ALL of its own
// exclusives (which bypass the partition). No sibling member is clean anymore.
test("sitemap partition: the 4 sibling domains list disjoint, complete shared slices + own exclusives", () => {
  const samsun = getStoreByHost("www.atakumpet.com");
  const samsunpet = getStoreByHost("www.samsunpet.com");
  const karadeniz = getStoreByHost("www.karadenizpetshop.com");
  const markapet = getStoreByHost("www.marka.pet");
  assert.deepEqual(
    [samsun.id, samsunpet.id, karadeniz.id, markapet.id],
    ["samsun", "samsunpet", "karadeniz", "markapet"],
    "partition test must target the four sibling stores",
  );

  const stores = [samsun, samsunpet, karadeniz, markapet];
  const sitemaps = stores.map((s) => getSitemapPagesForStore(s));

  // Every store's sitemap lists each slug at most once.
  for (const [i, sm] of sitemaps.entries()) {
    const slugs = sm.map((p) => p.slug);
    assert.equal(new Set(slugs).size, slugs.length, `sibling store ${i} sitemap has duplicate slugs`);
  }

  // ---- SHARED local corpus (storeless pages) is split by the mod-4 hash partition. ----
  const sharedSlices = sitemaps.map(
    (sm) => new Set(sm.filter((p) => !p.storeId).map((p) => p.slug)),
  );

  // The full shared universe the group partitions: storeless local pages, MINUS any
  // slug claimed by a group-exclusive override (samsun OR samsunpet OR karadeniz OR
  // markapet) — those are listed only by their exclusive owner and are dropped from
  // the hash partition on every member. No member is clean anymore (all four own an
  // exclusive corpus), so the base MUST be the RAW storeless local corpus;
  // getSeoPagesForStore(<member>) would hide the twins that member overrides.
  const exclusiveSlugs = new Set<string>([
    ...sitemaps[0].filter((p) => p.storeId).map((p) => p.slug), // samsun exclusives
    ...sitemaps[1].filter((p) => p.storeId).map((p) => p.slug), // samsunpet exclusives
    ...sitemaps[2].filter((p) => p.storeId).map((p) => p.slug), // karadeniz exclusives
    ...sitemaps[3].filter((p) => p.storeId).map((p) => p.slug), // markapet exclusives
  ]);
  const sharedFull = new Set(
    [...CLEAN_LOCAL_SLUGS].filter((s) => !exclusiveSlugs.has(s)),
  );

  // Each shared slice is non-empty and a strict subset of the shared universe.
  for (const [i, set] of sharedSlices.entries()) {
    assert.ok(set.size > 0, `shared slice ${i} is empty`);
    assert.ok(set.size < sharedFull.size, `shared slice ${i} is not a strict subset`);
  }

  // Pairwise disjoint — the four shared slices share no slug.
  for (let i = 0; i < sharedSlices.length; i++) {
    for (let j = i + 1; j < sharedSlices.length; j++) {
      const overlap = [...sharedSlices[i]].filter((s) => sharedSlices[j].has(s));
      assert.equal(overlap.length, 0, `shared slices ${i} and ${j} overlap: ${overlap.slice(0, 5).join(", ")}`);
    }
  }

  // Union covers the whole shared local corpus — no shared slug dropped everywhere.
  const sharedUnion = new Set<string>();
  for (const set of sharedSlices) for (const s of set) sharedUnion.add(s);
  assert.equal(sharedUnion.size, sharedFull.size, "shared partition slices must cover the full shared corpus");
  for (const s of sharedFull) assert.ok(sharedUnion.has(s), `shared slug missing from every sitemap: ${s}`);

  // ---- OWN store-exclusive pages bypass the partition: atakumpet.com,
  // samsunpet.com, karadenizpetshop.com and marka.pet each list ALL of their own. ----
  const samsunEx = new Set(sitemaps[0].filter((p) => p.storeId === "samsun").map((p) => p.slug));
  for (const p of SAMSUN_ALL_EXCLUSIVE_PAGES) {
    assert.ok(samsunEx.has(p.slug), `${p.slug}: atakumpet.com sitemap must list its own exclusive`);
  }
  const samsunpetEx = new Set(sitemaps[1].filter((p) => p.storeId === "samsunpet").map((p) => p.slug));
  for (const p of SAMSUNPET_ALL_EXCLUSIVE_PAGES) {
    assert.ok(samsunpetEx.has(p.slug), `${p.slug}: samsunpet.com sitemap must list its own exclusive`);
  }
  const karadenizEx = new Set(sitemaps[2].filter((p) => p.storeId === "karadeniz").map((p) => p.slug));
  for (const p of KARADENIZ_ALL_EXCLUSIVE_PAGES) {
    assert.ok(karadenizEx.has(p.slug), `${p.slug}: karadenizpetshop.com sitemap must list its own exclusive`);
  }
  const markapetEx = new Set(sitemaps[3].filter((p) => p.storeId === "markapet").map((p) => p.slug));
  for (const p of MARKAPET_ALL_EXCLUSIVE_PAGES) {
    assert.ok(markapetEx.has(p.slug), `${p.slug}: marka.pet sitemap must list its own exclusive`);
  }
  // No FOREIGN store-exclusive leaks into any sitemap.
  assert.equal(
    sitemaps[0].filter((p) => p.storeId && p.storeId !== "samsun").length,
    0,
    "atakumpet.com sitemap must not list a foreign exclusive",
  );
  assert.equal(
    sitemaps[1].filter((p) => p.storeId && p.storeId !== "samsunpet").length,
    0,
    "samsunpet.com sitemap must not list a foreign exclusive",
  );
  assert.equal(
    sitemaps[2].filter((p) => p.storeId && p.storeId !== "karadeniz").length,
    0,
    "karadenizpetshop.com sitemap must not list a foreign exclusive",
  );
  assert.equal(
    sitemaps[3].filter((p) => p.storeId && p.storeId !== "markapet").length,
    0,
    "marka.pet sitemap must not list a foreign exclusive",
  );

  // Deterministic across calls (stable hash, no churn between deploys).
  const again = new Set(
    getSitemapPagesForStore(karadeniz).filter((p) => !p.storeId).map((p) => p.slug),
  );
  assert.deepEqual([...again].sort(), [...sharedSlices[2]].sort(), "sibling shared partition must be deterministic");
});

// The JETGO trio and the sibling group are independent: a JETGO store is still
// partitioned by its own 3-member group (mod 3), NOT by the 4-member sibling group,
// so adding the sibling group never reassigns a JETGO slug.
test("sitemap partition: JETGO and sibling groups are independent (jetgopet stays mod-3)", () => {
  const jetgopet = getStoreByHost("www.jetgo.pet"); // index 1 of ["jetgo","jetgopet","jetgoshop"]
  // Only the SHARED (storeless) slugs are governed by the hash partition; jetgopet's
  // own store-exclusive pages bypass it and need not hash to its index.
  const slice = getSitemapPagesForStore(jetgopet).filter((p) => !p.storeId).map((p) => p.slug);
  assert.ok(slice.length > 0, "jetgopet must still own a non-empty shared slice");
  for (const slug of slice) {
    assert.equal(stableSlugHash(slug) % 3, 1, `jetgopet slug not owned under mod-3: ${slug}`);
  }
});

// Guard the multi-group invariants: a store in two groups would silently take the
// first group's partition; an empty group would divide by zero in ownsSitemapSlug.
test("sitemap partition: groups are well-formed (no empty groups, no shared store id)", () => {
  const seen = new Set<string>();
  for (const g of SITEMAP_PARTITION_GROUPS) {
    assert.ok(g.length > 0, "a partition group must not be empty");
    for (const id of g) {
      assert.ok(!seen.has(id), `store id "${id}" appears in more than one partition group`);
      seen.add(id);
    }
  }
});

test("sitemap partition: stores outside every group still list their full corpus", () => {
  const atakum = getStoreByHost(ATAKUM_HOST);
  assert.equal(atakum.id, "atakum", "ATAKUM_HOST must resolve to the atakum local store");
  assert.deepEqual(
    getSitemapPagesForStore(atakum).map((p) => p.slug).sort(),
    getSeoPagesForStore(atakum).map((p) => p.slug).sort(),
    "atakum (outside every partition group) must list the full eligible corpus",
  );
});

// ---- Per-domain Google independence (GSC / GTM / GA4 / Ads) ----
//
// Each of the 9 domains must be its own Google property. There must be NO shared,
// hardcoded Google snippet baked into the served HTML template; instead Google
// tags are injected per-store from StoreConfig.google (only jetgo.pet currently
// declares a tag — a Google Ads id; all other stores are empty), and the HTML-file
// Search Console verification is served only on the domain whose store declares
// that file id.

test("Google: index.html template carries NO hardcoded shared Google snippet", () => {
  for (const needle of [
    "GTM-5LW8HVSQ",
    "G-PKN1VB7PDP",
    "G-TVXEX6PM5J",
    "AW-18172136744",
    "AW-18225395395",
    "BnShDgutkrnaLluBAybKrpRub",
    "google-site-verification",
    "googletagmanager.com/gtag/js",
    "googletagmanager.com/gtm.js",
    "googletagmanager.com/ns.html",
  ]) {
    assert.ok(!INDEX_HTML.includes(needle), `index.html must not hardcode ${needle}`);
  }
});

test("Google: only jetgo.pet injects Google tags (Ads); other domains inject ZERO", async () => {
  // Every domain except jetgo.pet is still an empty, independent Google property.
  const ZERO_HOSTS = [
    JETGO_HOST, ATAKUM_HOST, SAMSUN_HOST, SAMSUNPET_HOST, KARADENIZ_HOST,
    ATAKUMBIZ_HOST, JETGOSHOP_HOST, MARKAPET_HOST,
  ];
  for (const host of ZERO_HOSTS) {
    const html = await injectAllMeta(INDEX_HTML, "/", host);
    assert.ok(!html.includes("google-site-verification"), `${host}: no GSC meta until configured`);
    assert.ok(!html.includes("googletagmanager.com/gtm.js"), `${host}: no GTM until configured`);
    assert.ok(!html.includes("googletagmanager.com/gtag/js"), `${host}: no gtag until configured`);
    assert.ok(!html.includes("googletagmanager.com/ns.html"), `${host}: no GTM noscript until configured`);
  }
  // jetgo.pet has its OWN Google Ads tag (AW-18243800307) configured — and only Ads,
  // no GTM/GSC — and that tag must NOT leak onto any other domain (asserted above).
  const petHtml = await injectAllMeta(INDEX_HTML, "/", JETGOPET_HOST);
  assert.ok(petHtml.includes("googletagmanager.com/gtag/js?id=AW-18243800307"), "jetgo.pet loads its Ads gtag");
  assert.ok(petHtml.includes("gtag('config','AW-18243800307')"), "jetgo.pet configures its Ads id");
  assert.ok(!petHtml.includes("google-site-verification"), "jetgo.pet: no GSC meta (only Ads configured)");
  assert.ok(!petHtml.includes("googletagmanager.com/gtm.js"), "jetgo.pet: no GTM (only Ads configured)");
});

test("Google: injectGoogleTags wires a store's OWN GSC + GTM + GA4 + Ads", () => {
  const fakeStore = {
    ...getStoreByHost(JETGO_HOST),
    google: {
      gtmId: "GTM-TEST123",
      ga4Ids: ["G-AAA111", "G-BBB222"],
      adsIds: ["AW-CCC333"],
      siteVerification: "verif-token-xyz",
    },
  } as any;
  const out = injectGoogleTags(INDEX_HTML, fakeStore);
  assert.ok(out.includes(`content="verif-token-xyz"`), "GSC meta injected");
  assert.ok(out.includes("'dataLayer','GTM-TEST123'"), "GTM loader injected");
  assert.ok(out.includes("ns.html?id=GTM-TEST123"), "GTM noscript injected");
  assert.ok(out.includes("gtag/js?id=G-AAA111"), "gtag loader uses first id");
  assert.ok(out.includes("gtag('config','G-AAA111')"), "GA4 id #1 configured");
  assert.ok(out.includes("gtag('config','G-BBB222')"), "GA4 id #2 configured");
  assert.ok(out.includes("gtag('config','AW-CCC333')"), "Ads id configured");
});

test("Google: injectGoogleTags strips unsafe characters from ids (no script breakout)", () => {
  const fakeStore = {
    ...getStoreByHost(JETGO_HOST),
    google: { gtmId: "GTM-X'};alert(1)//", ga4Ids: ["G-OK1<script>"] },
  } as any;
  const out = injectGoogleTags(INDEX_HTML, fakeStore);
  assert.ok(!out.includes("alert(1)"), "unsafe gtm chars stripped");
  assert.ok(!out.includes("<script>id"), "no breakout");
  assert.ok(out.includes("'dataLayer','GTM-Xalert1'"), "gtm id sanitized to safe chars");
  assert.ok(out.includes("gtag('config','G-OK1script')"), "ga4 id sanitized to safe chars");
});

test("Google: injectGoogleTags is a no-op for a store with empty google config", () => {
  const base = getStoreByHost(JETGO_HOST);
  assert.equal(injectGoogleTags(INDEX_HTML, base), INDEX_HTML);
});

test("Google: HTML-file verification 404s on a domain that hasn't declared that file", async () => {
  const res = await fetch(`${baseUrl}/googleb16b707b9ac148c4.html`, {
    headers: { "X-Forwarded-Host": JETGO_HOST },
  });
  assert.equal(res.status, 404);
});

// ---- DB-backed per-domain Google tags (admin-editable, no redeploy) ----
//
// Google config moved from hardcoded StoreConfig.google to app_settings
// "<storeId>:google_tags" (JSON), read with a short-lived cache that
// setStoreGoogleConfig/deleteStoreGoogleConfig invalidate. A DB override fully
// replaces the static config (even when empty); absence falls back to static.

test("Google: a DB override beats the static config and emits that store's tags", async () => {
  await setStoreGoogleConfig("atakum", {
    gtmId: "GTM-DBONLY1", ga4Ids: ["G-DBGA4ONE"], adsIds: [], siteVerification: "db-verif-1",
  });
  try {
    const html = await injectAllMeta(INDEX_HTML, "/", ATAKUM_HOST);
    assert.ok(html.includes("'dataLayer','GTM-DBONLY1'"), "DB GTM injected");
    assert.ok(html.includes("gtag/js?id=G-DBGA4ONE"), "DB GA4 injected");
    assert.ok(html.includes(`content="db-verif-1"`), "DB GSC meta injected");
  } finally {
    await deleteStoreGoogleConfig("atakum");
  }
});

test("Google: an empty DB override blanks a store's STATIC tags (no redeploy)", async () => {
  // jetgopet ships a static Ads tag; an explicit empty DB override must remove it.
  await setStoreGoogleConfig("jetgopet", {});
  try {
    const html = await injectAllMeta(INDEX_HTML, "/", JETGOPET_HOST);
    assert.ok(!html.includes("googletagmanager.com/gtag/js"), "empty override removes the static Ads gtag");
    assert.ok(!html.includes("AW-18243800307"), "static Ads id no longer emitted");
  } finally {
    await deleteStoreGoogleConfig("jetgopet");
  }
});

test("Google: a DB override on one domain does NOT leak onto another", async () => {
  await setStoreGoogleConfig("atakum", { gtmId: "GTM-LEAKTEST" });
  try {
    const ata = await injectAllMeta(INDEX_HTML, "/", ATAKUM_HOST);
    const sam = await injectAllMeta(INDEX_HTML, "/", SAMSUN_HOST);
    assert.ok(ata.includes("GTM-LEAKTEST"), "atakum gets its own DB GTM");
    assert.ok(!sam.includes("GTM-LEAKTEST"), "samsun must NOT see atakum's DB GTM");
  } finally {
    await deleteStoreGoogleConfig("atakum");
  }
});

test("Google: deleting a DB override restores the static config", async () => {
  await setStoreGoogleConfig("jetgopet", { gtmId: "GTM-TEMP9" });
  let html = await injectAllMeta(INDEX_HTML, "/", JETGOPET_HOST);
  assert.ok(html.includes("GTM-TEMP9"), "temp DB override active");
  await deleteStoreGoogleConfig("jetgopet");
  html = await injectAllMeta(INDEX_HTML, "/", JETGOPET_HOST);
  assert.ok(!html.includes("GTM-TEMP9"), "DB override removed");
  assert.ok(html.includes("AW-18243800307"), "static Ads restored after delete");
});

test("Google: admin overview lists every store with source flags + normalizes ids", async () => {
  // unknown store id is rejected
  await assert.rejects(() => setStoreGoogleConfig("not-a-store", { gtmId: "x" }));
  // comma/newline-split lists are trimmed + deduped on write
  await setStoreGoogleConfig("atakum", { ga4Ids: " G-AAA , G-AAA \n G-BBB ", adsIds: "AW-1" });
  try {
    const rows = await getAllStoreGoogleConfigs();
    assert.equal(rows.length, STORES.length, "every store listed");
    const ata = rows.find((r) => r.id === "atakum")!;
    assert.equal(ata.source, "db");
    assert.equal(ata.hasOverride, true);
    assert.deepEqual(ata.effective.ga4Ids, ["G-AAA", "G-BBB"], "ga4 ids split/trimmed/deduped");
    assert.deepEqual(ata.effective.adsIds, ["AW-1"]);
    const pet = rows.find((r) => r.id === "jetgopet")!;
    assert.equal(pet.source, "static", "jetgopet still served from static config");
  } finally {
    await deleteStoreGoogleConfig("atakum");
  }
});

test("Google: admin google-tags routes reject unauthenticated callers", async () => {
  const getRes = await fetch(`${baseUrl}/api/admin/google-tags`, {
    headers: { "X-Forwarded-Host": JETGO_HOST },
  });
  assert.equal(getRes.status, 401, "GET requires admin");
  const putRes = await fetch(`${baseUrl}/api/admin/google-tags/atakum`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Forwarded-Host": JETGO_HOST },
    body: JSON.stringify({ gtmId: "GTM-HACK" }),
  });
  assert.equal(putRes.status, 401, "PUT requires admin");
  // the rejected write must not have persisted
  const rows = await getAllStoreGoogleConfigs();
  assert.notEqual(rows.find((r) => r.id === "atakum")!.effective.gtmId, "GTM-HACK");
});

// ---- Per-domain Google Merchant feed + admin config ----

test("Merchant: config module normalizes ids + rejects unknown store", async () => {
  await assert.rejects(() => setStoreMerchantConfig("not-a-store", { merchantId: "1" }));
  // merchantId keeps digits only; shippingAmount normalized to X.XX
  assert.deepEqual(
    normalizeMerchantConfig({ merchantId: " MC-123 456 ", shippingAmount: "49,9" }),
    { merchantId: "123456", shippingAmount: "49.90" },
  );
  // non-numeric id and negative amount drop out entirely
  assert.deepEqual(normalizeMerchantConfig({ merchantId: "abc", shippingAmount: "-5" }), {});
});

test("Merchant: admin overview lists every store with feed url + fulfillment", async () => {
  await setStoreMerchantConfig("samsun", { merchantId: "9988776655", shippingAmount: "39.90" });
  try {
    const rows = await getAllStoreMerchantConfigs();
    assert.equal(rows.length, STORES.length, "every store listed");
    const sam = rows.find((r) => r.id === "samsun")!;
    assert.equal(sam.fulfillment, "local");
    assert.equal(sam.hasConfig, true);
    assert.equal(sam.config.merchantId, "9988776655");
    assert.equal(sam.config.shippingAmount, "39.90");
    assert.ok(sam.feedUrl.endsWith("/google-merchant.xml"), "feed url points at the xml feed");
    assert.ok(sam.feedUrl.includes("atakumpet.com"), "feed url uses the store's OWN domain");
    const ata = rows.find((r) => r.id === "atakum")!;
    assert.equal(ata.fulfillment, "local");
    assert.equal(ata.hasConfig, false, "untouched store has no config");
  } finally {
    await deleteStoreMerchantConfig("samsun");
  }
});

// Scope shipping assertions to the <g:shipping> block: the item's own <g:price>
// (product price) shares the same tag, so a raw feed.includes("<g:price>X TRY")
// collides with any product that happens to cost X. Only the shipping sub-block
// reflects the commerce model.
const shippingBlocks = (feed: string) =>
  [...feed.matchAll(/<g:shipping>([\s\S]*?)<\/g:shipping>/g)].map((m) => m[1]);

test("Merchant feed: every store advertises same-day local delivery, never kargo", async () => {
  // All domains are LOCAL same-day now (no cargo host remains). Even a configured
  // shippingAmount override is IGNORED for a local store (same-day is free): every
  // <g:shipping> block advertises "Aynı Gün Teslimat" at 0.00 TRY — never a kargo
  // service nor the override amount.
  await setStoreMerchantConfig("samsun", { shippingAmount: "29.90" });
  try {
    const atakumFeed = await (await fetch(`${baseUrl}/google-merchant.xml`, { headers: { "X-Forwarded-Host": ATAKUM_HOST } })).text();
    const samsunFeed = await (await fetch(`${baseUrl}/google-merchant.xml`, { headers: { "X-Forwarded-Host": SAMSUN_HOST } })).text();
    for (const feed of [atakumFeed, samsunFeed]) {
      // channel description is same-day, never the Samsun-only mahalle text
      assert.match(feed, /aynı gün/i, "local channel mentions same-day delivery");
      assert.ok(!feed.includes("İlkadım") && !feed.includes("Canik"), "no hardcoded Samsun mahalle text");
      const blocks = shippingBlocks(feed);
      if (feed.includes("<item>")) {
        assert.ok(blocks.length > 0, "local items must carry a shipping block");
      }
      for (const block of blocks) {
        assert.match(block, /<g:service>Aynı Gün Teslimat<\/g:service>/, "local items ship same-day");
        assert.match(block, /<g:price>0\.00 TRY<\/g:price>/, "local same-day shipping is free");
        assert.ok(!block.includes("Kargo"), "local feed must not ship via kargo");
        assert.ok(!block.includes("29.90"), "local feed must ignore the shippingAmount override");
      }
    }
  } finally {
    await deleteStoreMerchantConfig("samsun");
  }
});

test("Merchant feed: local store with no configured shipping still advertises same-day free", async () => {
  // A local same-day store needs no merchant shipping override: same-day delivery
  // is free, so each item's shipping block is "Aynı Gün Teslimat" at 0.00 TRY.
  await deleteStoreMerchantConfig("samsun");
  const feed = await (await fetch(`${baseUrl}/google-merchant.xml`, { headers: { "X-Forwarded-Host": SAMSUN_HOST } })).text();
  const blocks = shippingBlocks(feed);
  if (feed.includes("<item>")) {
    assert.ok(blocks.length > 0, "local items must carry a shipping block");
  }
  for (const block of blocks) {
    assert.match(block, /<g:service>Aynı Gün Teslimat<\/g:service>/, "local items ship same-day");
    assert.match(block, /<g:price>0\.00 TRY<\/g:price>/, "local same-day shipping is free");
    assert.ok(!block.includes("Kargo"), "local feed must never advertise a kargo channel");
  }
});

test("Merchant feed: admin shippingAmount override is IGNORED for a local same-day store", async () => {
  // samsun is LOCAL now: same-day delivery is free, so a configured shipping
  // override never reaches the <g:shipping> block (it stays 0.00 same-day). The
  // override amount may still coincide with a product price, so scope to shipping.
  await setStoreMerchantConfig("samsun", { shippingAmount: "55.00" });
  try {
    const feed = await (await fetch(`${baseUrl}/google-merchant.xml`, { headers: { "X-Forwarded-Host": SAMSUN_HOST } })).text();
    for (const block of shippingBlocks(feed)) {
      assert.ok(!block.includes("55.00"), "local feed must ignore the shippingAmount override");
      assert.match(block, /<g:price>0\.00 TRY<\/g:price>/, "local same-day shipping stays free");
    }
  } finally {
    await deleteStoreMerchantConfig("samsun");
  }
});

test("Merchant feed: non-JETGO domain never leaks the JETGO brand word in MPN", async () => {
  const feed = await (await fetch(`${baseUrl}/google-merchant.xml`, { headers: { "X-Forwarded-Host": MARKAPET_HOST } })).text();
  // the MPN fallback used to hardcode "JETGO-<id>"; it must now be brandified per store
  assert.ok(!feed.includes("JETGO-"), "no JETGO- MPN leak on marka.pet feed");
});

test("Merchant: admin routes reject unauthenticated callers", async () => {
  const getRes = await fetch(`${baseUrl}/api/admin/merchant`, { headers: { "X-Forwarded-Host": JETGO_HOST } });
  assert.equal(getRes.status, 401, "GET requires admin");
  const putRes = await fetch(`${baseUrl}/api/admin/merchant/samsun`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Forwarded-Host": JETGO_HOST },
    body: JSON.stringify({ merchantId: "666" }),
  });
  assert.equal(putRes.status, 401, "PUT requires admin");
  const rows = await getAllStoreMerchantConfigs();
  assert.equal(rows.find((r) => r.id === "samsun")!.hasConfig, false, "rejected write did not persist");
});

// ---- Shipped-order tracking SMS auto-send + de-duplication ----
//
// Admins set an order to "Kargoda" (Shipped) via PATCH /api/admin/orders/:id/status.
// When the order already has cargoCompany + trackingNumber + customerPhone, that
// status change must fire the "Siparisiniz kargoya verildi" tracking SMS exactly
// ONCE (server/routes.ts: SHIPPED_STATUSES -> notifyShipmentIfNeeded), then set
// orders.shipping_sms_sent so a repeated status change never re-sends. If tracking
// info is missing, no SMS may be attempted at all.
//
// The send goes through sendSmsViaNetgsm, which POSTs to api.netgsm.com.tr. That
// helper is module-private, so instead of stubbing it we install temporary NetGSM
// credentials (so the cred guard passes) and wrap global fetch to COUNT (and short
// -circuit) outbound NetGSM calls — the real network is never touched. Everything
// else (the harness's own requests to the local server) passes through unchanged.

// Insert a throwaway order that is eligible (or, when tracking is null, ineligible)
// for the shipment SMS. source_site=samsun so resolveSmsHeader resolves a real store.
async function seedShippableOrder(opts?: {
  cargoCompany?: string | null;
  trackingNumber?: string | null;
  shippingSmsSent?: boolean;
}): Promise<number> {
  const cargoCompany = opts?.cargoCompany === undefined ? "Yurtici Kargo" : opts.cargoCompany;
  const trackingNumber = opts?.trackingNumber === undefined ? `${MARK}_TRK_123` : opts.trackingNumber;
  const shippingSmsSent = opts?.shippingSmsSent ?? false;
  const items = JSON.stringify([{ productId: orderProductId, name: `${MARK}_PRODUCT`, price: 100, quantity: 1 }]);
  const r = await pool.query(
    `INSERT INTO orders
       (items, subtotal, shipping, grand_total, payment_method, status,
        customer_phone, customer_name, cargo_company, tracking_number,
        source_site, shipping_sms_sent, payment_status)
     VALUES ($1::jsonb, 100, 0, 100, 'Kapıda Nakit', 'hazirlaniyor',
        '5559990000', $2, $3, $4, 'samsun', $5, 'completed')
     RETURNING id`,
    [items, `${MARK}_SHIP_BUYER`, cargoCompany, trackingNumber, shippingSmsSent]
  );
  const id = r.rows[0].id as number;
  ids.orders.push(id);
  return id;
}

// Count + short-circuit outbound NetGSM SMS calls, with throwaway credentials so
// the sendSmsViaNetgsm cred guard passes. restore() puts global fetch + env back.
function captureNetgsmSms() {
  const calls: { url: string; body: string }[] = [];
  const origFetch = globalThis.fetch;
  const prev = {
    NETGSM_USERCODE: process.env.NETGSM_USERCODE,
    NETGSM_PASSWORD: process.env.NETGSM_PASSWORD,
    NETGSM_MSGHEADER: process.env.NETGSM_MSGHEADER,
    TEST_SMS_CAPTURE: process.env.TEST_SMS_CAPTURE,
  };
  process.env.NETGSM_USERCODE = `${MARK}_UC`;
  process.env.NETGSM_PASSWORD = `${MARK}_PW`;
  process.env.NETGSM_MSGHEADER = `${MARK}_HDR`;
  // Opt this captured context out of the production-side TEST_OTP_BYPASS SMS guard:
  // global fetch is mocked below, so running the real sendSmsViaNetgsm logic here
  // never touches the network — we WANT it to run so we can count/inspect payloads.
  process.env.TEST_SMS_CAPTURE = "1";
  globalThis.fetch = ((input: any, init?: any) => {
    const url = typeof input === "string" ? input : (input?.url ?? String(input));
    if (url.includes("netgsm.com.tr")) {
      calls.push({ url, body: String(init?.body ?? "") });
      return Promise.resolve(new Response("00", { status: 200 }));
    }
    return origFetch(input, init);
  }) as typeof fetch;
  return {
    calls,
    restore() {
      globalThis.fetch = origFetch;
      for (const k of ["NETGSM_USERCODE", "NETGSM_PASSWORD", "NETGSM_MSGHEADER", "TEST_SMS_CAPTURE"] as const) {
        if (prev[k] === undefined) delete process.env[k];
        else process.env[k] = prev[k]!;
      }
    },
  };
}

// sendSmsViaNetgsm is fire-and-forget inside the handler; yield one macrotask so
// the (synchronously-initiated) fetch call is recorded before we assert on it.
const settle = () => new Promise((r) => setTimeout(r, 0));

test("setting an order to 'kargoda' fires the tracking SMS exactly once (cargo+tracking+phone present)", async () => {
  const orderId = await seedShippableOrder();
  const sms = captureNetgsmSms();
  try {
    const res = await patchAdmin(`/api/admin/orders/${orderId}/status`, SAMSUN_HOST, { status: "kargoda" });
    assert.equal(res.status, 200, `status PATCH failed: ${JSON.stringify(res.body)}`);
    await settle();

    assert.equal(sms.calls.length, 1, "exactly one shipment SMS must be sent");
    // The sent body must be the tracking SMS and carry the tracking number.
    assert.match(sms.calls[0].body, /kargoya verildi/i, "SMS body must be the tracking message");
    assert.match(sms.calls[0].body, new RegExp(`${MARK}_TRK_123`), "SMS body must include the tracking number");

    // De-dup flag persisted so a future status change won't re-send.
    const row = await pool.query("SELECT shipping_sms_sent FROM orders WHERE id = $1", [orderId]);
    assert.equal(row.rows[0].shipping_sms_sent, true, "shipping_sms_sent must be set after sending");
  } finally {
    sms.restore();
  }
});

test("a second status change does NOT re-send the tracking SMS (deduped by shipping_sms_sent)", async () => {
  const orderId = await seedShippableOrder();
  const sms = captureNetgsmSms();
  try {
    const first = await patchAdmin(`/api/admin/orders/${orderId}/status`, SAMSUN_HOST, { status: "kargoda" });
    assert.equal(first.status, 200, `first status PATCH failed: ${JSON.stringify(first.body)}`);
    await settle();
    assert.equal(sms.calls.length, 1, "first shipped transition sends one SMS");

    const second = await patchAdmin(`/api/admin/orders/${orderId}/status`, SAMSUN_HOST, { status: "kargoda" });
    assert.equal(second.status, 200, `second status PATCH failed: ${JSON.stringify(second.body)}`);
    await settle();
    assert.equal(sms.calls.length, 1, "repeat shipped transition must NOT re-send (deduped)");
  } finally {
    sms.restore();
  }
});

test("no tracking SMS is attempted when cargo/tracking info is missing", async () => {
  const orderId = await seedShippableOrder({ cargoCompany: null, trackingNumber: null });
  const sms = captureNetgsmSms();
  try {
    const res = await patchAdmin(`/api/admin/orders/${orderId}/status`, SAMSUN_HOST, { status: "kargoda" });
    assert.equal(res.status, 200, `status PATCH failed: ${JSON.stringify(res.body)}`);
    await settle();

    assert.equal(sms.calls.length, 0, "no SMS may be sent without cargo + tracking number");
    const row = await pool.query("SELECT shipping_sms_sent FROM orders WHERE id = $1", [orderId]);
    assert.equal(row.rows[0].shipping_sms_sent, false, "shipping_sms_sent must stay false when nothing was sent");
  } finally {
    sms.restore();
  }
});

// ---- Changing the tracking number lets the tracking SMS go out again ----
//
// The admin tracking-update route (PATCH /api/admin/orders/:id/tracking) writes
// the cargo company + tracking number, then calls notifyShipmentIfNeeded. To send
// the tracking SMS again after a correction, updateOrderTracking (server/storage.ts)
// resets orders.shipping_sms_sent to false ONLY when the new tracking number
// differs from the stored one (the `IS DISTINCT FROM` CASE). These tests pin both
// halves of that contract: a DIFFERENT number re-sends, the SAME number does not.

test("changing an order's tracking number re-sends the tracking SMS (shipping_sms_sent reset)", async () => {
  // Start clean: no cargo/tracking yet, flag false.
  const orderId = await seedShippableOrder({ cargoCompany: null, trackingNumber: null });
  const sms = captureNetgsmSms();
  try {
    // 1) Admin enters cargo + first tracking number -> ships once (SMS #1).
    const first = await patchAdmin(`/api/admin/orders/${orderId}/tracking`, SAMSUN_HOST, {
      cargoCompany: "Yurtiçi Kargo",
      trackingNumber: `${MARK}_TRK_A`,
    });
    assert.equal(first.status, 200, `first tracking PATCH failed: ${JSON.stringify(first.body)}`);
    await settle();
    assert.equal(sms.calls.length, 1, "entering tracking the first time sends one SMS");
    assert.match(sms.calls[0].body, new RegExp(`${MARK}_TRK_A`), "first SMS must carry the first tracking number");

    const afterFirst = await pool.query("SELECT shipping_sms_sent FROM orders WHERE id = $1", [orderId]);
    assert.equal(afterFirst.rows[0].shipping_sms_sent, true, "flag must be set after the first send");

    // 2) Admin corrects the tracking number -> flag resets, ships again (SMS #2).
    const second = await patchAdmin(`/api/admin/orders/${orderId}/tracking`, SAMSUN_HOST, {
      cargoCompany: "Yurtiçi Kargo",
      trackingNumber: `${MARK}_TRK_B`,
    });
    assert.equal(second.status, 200, `second tracking PATCH failed: ${JSON.stringify(second.body)}`);
    await settle();
    assert.equal(sms.calls.length, 2, "a changed tracking number must re-send the tracking SMS");
    assert.match(sms.calls[1].body, new RegExp(`${MARK}_TRK_B`), "the re-sent SMS must carry the corrected tracking number");

    const afterSecond = await pool.query("SELECT shipping_sms_sent, tracking_number FROM orders WHERE id = $1", [orderId]);
    assert.equal(afterSecond.rows[0].tracking_number, `${MARK}_TRK_B`, "stored tracking number must be the corrected one");
    assert.equal(afterSecond.rows[0].shipping_sms_sent, true, "flag must be set again after the re-send");
  } finally {
    sms.restore();
  }
});

test("re-saving the SAME tracking number does NOT reset the flag (no duplicate SMS)", async () => {
  const orderId = await seedShippableOrder({ cargoCompany: null, trackingNumber: null });
  const sms = captureNetgsmSms();
  try {
    // 1) Enter cargo + tracking -> ships once (SMS #1), flag set.
    const first = await patchAdmin(`/api/admin/orders/${orderId}/tracking`, SAMSUN_HOST, {
      cargoCompany: "Yurtiçi Kargo",
      trackingNumber: `${MARK}_TRK_SAME`,
    });
    assert.equal(first.status, 200, `first tracking PATCH failed: ${JSON.stringify(first.body)}`);
    await settle();
    assert.equal(sms.calls.length, 1, "entering tracking the first time sends one SMS");

    // 2) Re-save the EXACT SAME cargo + tracking number -> IS DISTINCT FROM is
    //    false, so shipping_sms_sent stays true and no new SMS goes out.
    const second = await patchAdmin(`/api/admin/orders/${orderId}/tracking`, SAMSUN_HOST, {
      cargoCompany: "Yurtiçi Kargo",
      trackingNumber: `${MARK}_TRK_SAME`,
    });
    assert.equal(second.status, 200, `second tracking PATCH failed: ${JSON.stringify(second.body)}`);
    await settle();
    assert.equal(sms.calls.length, 1, "re-saving the same tracking number must NOT re-send (flag not reset)");

    const row = await pool.query("SELECT shipping_sms_sent FROM orders WHERE id = $1", [orderId]);
    assert.equal(row.rows[0].shipping_sms_sent, true, "flag must remain set when the tracking number is unchanged");
  } finally {
    sms.restore();
  }
});

// ---- Admin "İptal" (cancel) fires a customer SMS, guarded against re-send ----
//
// When an admin sets an order to "iptal" via PATCH /api/admin/orders/:id/status,
// the buyer must get a branded cancellation SMS (server/routes.ts: the status ===
// "iptal" branch). A transition guard (prevStatus !== "iptal") means re-selecting
// "iptal" on an already-cancelled order must NOT re-send. source_site=samsun so
// resolveSmsHeader resolves a real store and the brand word is the Samsun brand.

async function seedCancellableOrder(opts?: { status?: string; customerPhone?: string | null }): Promise<number> {
  const status = opts?.status ?? "hazirlaniyor";
  const customerPhone = opts?.customerPhone === undefined ? "5559990000" : opts.customerPhone;
  const items = JSON.stringify([{ productId: orderProductId, name: `${MARK}_PRODUCT`, price: 100, quantity: 1 }]);
  const r = await pool.query(
    `INSERT INTO orders
       (items, subtotal, shipping, grand_total, payment_method, status,
        customer_phone, customer_name, source_site, payment_status)
     VALUES ($1::jsonb, 100, 0, 100, 'Kapıda Nakit', $2,
        $3, $4, 'samsun', 'completed')
     RETURNING id`,
    [items, status, customerPhone, `${MARK}_CANCEL_BUYER`]
  );
  const id = r.rows[0].id as number;
  ids.orders.push(id);
  return id;
}

test("setting an order to 'iptal' fires the cancellation SMS exactly once (customer phone present)", async () => {
  const orderId = await seedCancellableOrder();
  const sms = captureNetgsmSms();
  try {
    const res = await patchAdmin(`/api/admin/orders/${orderId}/status`, SAMSUN_HOST, { status: "iptal" });
    assert.equal(res.status, 200, `status PATCH failed: ${JSON.stringify(res.body)}`);
    await settle();

    assert.equal(sms.calls.length, 1, "exactly one cancellation SMS must be sent");
    assert.match(sms.calls[0].body, /iptal edilmistir/i, "SMS body must be the cancellation message");
    assert.match(sms.calls[0].body, new RegExp(`${orderId}\\s+numarali`), "SMS body must reference the order number");
  } finally {
    sms.restore();
  }
});

test("re-selecting 'iptal' on an already-cancelled order does NOT re-send the SMS (transition guard)", async () => {
  const orderId = await seedCancellableOrder({ status: "iptal" });
  const sms = captureNetgsmSms();
  try {
    const res = await patchAdmin(`/api/admin/orders/${orderId}/status`, SAMSUN_HOST, { status: "iptal" });
    assert.equal(res.status, 200, `status PATCH failed: ${JSON.stringify(res.body)}`);
    await settle();
    assert.equal(sms.calls.length, 0, "no SMS may be sent when the order was already cancelled");
  } finally {
    sms.restore();
  }
});

test("cancelling an order with no customer phone attempts no SMS", async () => {
  const orderId = await seedCancellableOrder({ customerPhone: null });
  const sms = captureNetgsmSms();
  try {
    const res = await patchAdmin(`/api/admin/orders/${orderId}/status`, SAMSUN_HOST, { status: "iptal" });
    assert.equal(res.status, 200, `status PATCH failed: ${JSON.stringify(res.body)}`);
    await settle();
    assert.equal(sms.calls.length, 0, "no SMS may be sent without a customer phone");
  } finally {
    sms.restore();
  }
});

// ---- New-order buyer SMS: "siparişiniz alındı" confirmation -------------------
//
// When an order is created on a door-payment (local) store, OR when an online
// card payment is confirmed, the BUYER must get a branded "siparişiniz alındı"
// SMS exactly once (server/routes.ts: notifyCustomerNewOrder, deduped by
// orders.customer_sms_sent, fired from the SAME paths as the admin new-order SMS).
// Havale/EFT is excluded because that buyer already gets the IBAN instructions
// SMS. The admin "YENI SIPARIS" SMS may also fire here, so we filter the captured
// NetGSM calls by the buyer message body instead of asserting a total count.

// Register a brand-new buyer on a local storefront via the test-OTP bypass and
// return its session cookie + phone. Runs under its OWN client IP so the per-IP
// rate limiters don't bleed into other tests (see e2e rate-limit isolation).
async function registerLocalBuyer(host: string, ip: string, name: string): Promise<{ cookie: string; phone: string }> {
  const phone = "555" + String(randomBytes(4).readUInt32BE(0)).padStart(7, "0").slice(-7);
  const send = await post("/api/otp/send", host, { phone }, ip);
  assert.equal(send.status, 200, `otp/send failed: ${JSON.stringify(send.body)}`);
  const regRes = await fetch(`${baseUrl}/api/otp/verify`, {
    method: "POST",
    headers: { "X-Forwarded-Host": host, "X-Forwarded-For": ip, "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code: "0000", name, address: `${MARK} Atakum Mah., Test Cad. No 9` }),
  });
  const regBody = await regRes.json() as any;
  assert.equal(regRes.status, 200, `registration failed: ${JSON.stringify(regBody)}`);
  ids.customers.push(regBody.id as number);
  const cookie = (regRes.headers.get("set-cookie") ?? "").split(";")[0];
  assert.ok(cookie.includes("connect.sid"), "registration must set a session cookie");
  return { cookie, phone };
}

test("placing a local door-payment order sends the buyer a branded 'siparisiniz alindi' SMS once (customer_sms_sent set)", async () => {
  const prevEnv = process.env.NODE_ENV;
  const prevFlag = process.env.TEST_OTP_BYPASS;
  process.env.NODE_ENV = "development";
  process.env.TEST_OTP_BYPASS = "1";
  const sms = captureNetgsmSms();
  try {
    const { cookie, phone } = await registerLocalBuyer(ATAKUMBIZ_HOST, "203.0.113.78", `${MARK}_NEWORDER_BUYER`);
    const order = await postWithCookie(
      "/api/orders",
      ATAKUMBIZ_HOST,
      { ...orderPayload(), customerName: `${MARK}_NEWORDER_BUYER`, customerPhone: phone, paymentMethod: "Kapıda Nakit" },
      cookie,
      "203.0.113.78",
    );
    assert.equal(order.status, 201, `door-payment order POST failed: ${JSON.stringify(order.body)}`);
    const orderId = order.body.id as number;
    ids.orders.push(orderId);
    await settle();

    const buyerSms = sms.calls.filter((c) => /siparisiniz alindi/i.test(c.body));
    assert.equal(buyerSms.length, 1, `exactly one buyer 'siparisiniz alindi' SMS expected (got ${sms.calls.length} total NetGSM calls)`);
    assert.match(buyerSms[0].body, new RegExp(`#${orderId}\\s+numarali`), "buyer SMS must reference the order number");

    const row = await pool.query("SELECT customer_sms_sent FROM orders WHERE id = $1", [orderId]);
    assert.equal(row.rows[0].customer_sms_sent, true, "customer_sms_sent must be set after sending");
  } finally {
    sms.restore();
    if (prevEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = prevEnv;
    if (prevFlag === undefined) delete process.env.TEST_OTP_BYPASS; else process.env.TEST_OTP_BYPASS = prevFlag;
  }
});

test("a havale/EFT order does NOT send the generic buyer 'siparisiniz alindi' SMS (buyer gets IBAN instructions instead)", async () => {
  const prevEnv = process.env.NODE_ENV;
  const prevFlag = process.env.TEST_OTP_BYPASS;
  process.env.NODE_ENV = "development";
  process.env.TEST_OTP_BYPASS = "1";
  const prevEft = (await pool.query("SELECT value FROM app_settings WHERE key = 'payment_eft_enabled'")).rows[0]?.value;
  await setSetting("payment_eft_enabled", "1");
  const sms = captureNetgsmSms();
  try {
    const { cookie, phone } = await registerLocalBuyer(ATAKUMBIZ_HOST, "203.0.113.79", `${MARK}_HAVALE_BUYER`);
    const order = await postWithCookie(
      "/api/orders",
      ATAKUMBIZ_HOST,
      { ...orderPayload(), customerName: `${MARK}_HAVALE_BUYER`, customerPhone: phone, paymentMethod: "Banka Havalesi/EFT" },
      cookie,
      "203.0.113.79",
    );
    assert.equal(order.status, 201, `havale order POST failed: ${JSON.stringify(order.body)}`);
    const orderId = order.body.id as number;
    ids.orders.push(orderId);
    await settle();

    const buyerSms = sms.calls.filter((c) => /siparisiniz alindi/i.test(c.body));
    assert.equal(buyerSms.length, 0, "havale buyer must NOT get the generic order-received SMS");
    const row = await pool.query("SELECT customer_sms_sent FROM orders WHERE id = $1", [orderId]);
    assert.equal(row.rows[0].customer_sms_sent, false, "customer_sms_sent must stay false for havale orders");
  } finally {
    sms.restore();
    if (prevEft === undefined) await pool.query("DELETE FROM app_settings WHERE key = 'payment_eft_enabled'");
    else await setSetting("payment_eft_enabled", prevEft);
    if (prevEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = prevEnv;
    if (prevFlag === undefined) delete process.env.TEST_OTP_BYPASS; else process.env.TEST_OTP_BYPASS = prevFlag;
  }
});

// ---- atakum-EXCLUSIVE keyword landing pages (per-domain independent corpus) -
//
// atakumpetshop.com publishes its OWN bespoke version of every keyword landing
// page (storeId "atakum"), OVERRIDING the SHARED keyword page at the same slug
// ONLY on atakum. Sibling local domains keep the shared page; a cargo-model store
// (the synthetic fixture) sees neither (local-only). These tests pin that
// exclusivity + non-leakage so a future edit can't re-share/leak atakum's pages.

const ATAKUM_STORE = getStoreByHost(ATAKUM_HOST);
const SIBLING_LOCAL_STORE = getStoreByHost(JETGO_HOST);
// No local store is "clean" anymore: all four JETGO-local domains (jetgo,
// jetgoshop, atakumbiz, jetgopet) now own an exclusive corpus, so none can stand
// in for "the shared local corpus a store with no exclusives would serve". The
// clean local SLUG SET is therefore computed DIRECTLY from the shared, storeless
// corpus, independent of any store's overrides/additions; the clean local PAGE
// COUNT is the number of storeless local-eligible entries.
const CLEAN_LOCAL_SLUGS = new Set(
  SEO_PAGES.filter((p) => !p.storeId && (p.availability ?? "all") !== "cargoOnly").map((p) => p.slug),
);
const CLEAN_LOCAL_PAGE_COUNT = SEO_PAGES.filter(
  (p) => !p.storeId && (p.availability ?? "all") !== "cargoOnly",
).length;
// A representative OTHER local store for foreign-exclusive leak checks. Its own
// exclusives are irrelevant here — these checks only look for a FOREIGN storeId.
const OTHER_LOCAL_STORE = getStoreByHost(JETGOPET_HOST);
// No real store is cargo anymore; the dormant cargo branch (local overrides hidden
// on a cargo store) is verified against the synthetic cargo fixture.
const CARGO_STORE_FOR_ATAKUM = SYNTHETIC_CARGO_STORE;
const ATAKUM_SAMPLE_SLUGS = ATAKUM_EXCLUSIVE_PAGES.slice(0, 6).map((p) => p.slug);

test("atakum-exclusive: a sizable bespoke keyword corpus is registered", () => {
  assert.ok(
    ATAKUM_EXCLUSIVE_PAGES.length > 700,
    `expected >700 atakum-exclusive pages, got ${ATAKUM_EXCLUSIVE_PAGES.length}`,
  );
  for (const p of ATAKUM_EXCLUSIVE_PAGES) {
    assert.equal(p.storeId, "atakum", `${p.slug}: must be tagged storeId atakum`);
    assert.equal(p.availability, "localOnly", `${p.slug}: must be localOnly`);
    assert.equal(p.type, "keyword", `${p.slug}: must be a keyword page`);
    assert.ok(
      p.intro?.length && p.sections?.length && p.faq?.length,
      `${p.slug}: must carry intro/sections/faq for a substantive page`,
    );
    assert.ok(p.internalLinks && p.internalLinks.length > 0, `${p.slug}: must carry internal links`);
    // Genuine Atakum first-party content (real NAP phone) — not a brand swap.
    assert.match(JSON.stringify(p), /0850 840 39 59/, `${p.slug}: must carry the Atakum NAP phone`);
  }
});

test("atakum-exclusive: atakum serves its own variant; siblings serve the shared one", () => {
  for (const slug of ATAKUM_SAMPLE_SLUGS) {
    const ata = findSeoPage(slug, ATAKUM_STORE);
    const sib = findSeoPage(slug, SIBLING_LOCAL_STORE);
    assert.ok(ata && sib, `${slug}: must resolve on both atakum and a sibling`);
    assert.equal(ata!.storeId, "atakum", `${slug}: atakum must get its storeId=atakum override`);
    assert.equal(sib!.storeId, undefined, `${slug}: sibling must get the shared page (no storeId)`);
    assert.notEqual(
      ata!.metaTitle,
      sib!.metaTitle,
      `${slug}: atakum & sibling metaTitle must differ (independent content)`,
    );
    assert.match(ata!.metaTitle, /Atakum Pet Shop/, `${slug}: atakum metaTitle must carry the Atakum brand`);
  }
});

test("atakum-exclusive: overrides never leak onto sibling local or cargo stores", () => {
  for (const store of [
    SIBLING_LOCAL_STORE,
    getStoreByHost(JETGOPET_HOST),
    getStoreByHost(JETGOSHOP_HOST),
    CARGO_STORE_FOR_ATAKUM,
  ]) {
    // A store may carry its OWN exclusives (jetgo does); what must never happen is
    // a FOREIGN store's exclusive (e.g. atakum's) leaking onto another domain.
    const leaked = getSeoPagesForStore(store).filter((p) => p.storeId && p.storeId !== store.id);
    assert.equal(leaked.length, 0, `${store.id}: must not see any FOREIGN store-exclusive page`);
  }
  const ataStorePages = getSeoPagesForStore(ATAKUM_STORE).filter((p) => p.storeId);
  assert.ok(ataStorePages.length > 700, "atakum corpus must include its exclusive pages");
  for (const p of ataStorePages) assert.equal(p.storeId, "atakum");
  // local-only atakum overrides must be hidden on a cargo store.
  for (const slug of ATAKUM_SAMPLE_SLUGS) {
    assert.equal(
      findSeoPage(slug, CARGO_STORE_FOR_ATAKUM),
      undefined,
      `${slug}: local-only override must be hidden on a cargo store`,
    );
  }
});

test("atakum-exclusive: legacy overrides REPLACE shared slugs; the new corpus ADDS brand-new slugs on top", () => {
  // Two distinct atakum corpora now coexist:
  //  • ATAKUM_EXCLUSIVE_PAGES  — legacy OVERRIDES of shared keyword slugs (the page
  //    count is unchanged vs a clean sibling, content differs);
  //  • ATAKUM_ALL_EXCLUSIVE_PAGES — a BRAND-NEW slug corpus that ADDS pages a clean
  //    sibling never had.
  // So atakum is no longer 1:1 with a clean sibling; it is the sibling's slug set
  // PLUS the new corpus. Pin exactly that, plus global slug uniqueness.
  const ata = getSeoPagesForStore(ATAKUM_STORE);
  const slugs = ata.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, "atakum corpus must have unique slugs (no double-registration)");

  assert.equal(
    ata.length,
    CLEAN_LOCAL_PAGE_COUNT + ATAKUM_ALL_EXCLUSIVE_PAGES.length,
    "atakum size must equal the shared local corpus + the brand-new ATAKUM_ALL corpus (legacy overrides replace, new corpus adds)",
  );

  const ataSet = availableSlugSet(ATAKUM_STORE);
  const cleanSet = CLEAN_LOCAL_SLUGS;
  // The clean sibling's entire slug set is a SUBSET of atakum's (atakum overrides
  // those same slugs but never drops one).
  for (const s of cleanSet) {
    assert.ok(ataSet.has(s), `clean-sibling slug ${s} must also exist on atakum`);
  }
  // Every brand-new slug is genuinely NEW: present on atakum, absent from the clean
  // sibling — i.e. these are additions, not overrides of an existing shared slug.
  for (const p of ATAKUM_ALL_EXCLUSIVE_PAGES) {
    assert.ok(ataSet.has(p.slug), `new atakum slug ${p.slug} must resolve on atakum`);
    assert.ok(!cleanSet.has(p.slug), `new atakum slug ${p.slug} must be absent from a clean sibling (it is an addition)`);
  }
});

test("atakum-exclusive: curated core/district pages are NOT overridden", () => {
  const core = findSeoPage("atakum-petshop", ATAKUM_STORE);
  assert.ok(core, "atakum-petshop must resolve on atakum");
  assert.equal(core!.storeId, undefined, "curated atakum-petshop must stay shared (no storeId override)");
  assert.notEqual(core!.type, "keyword", "atakum-petshop must remain a curated (non-keyword) page");
});

test("atakum-exclusive: SSR meta serves atakum's bespoke content + self-canonical (differs from sibling)", async () => {
  const slug = ATAKUM_SAMPLE_SLUGS[0];
  const page = findSeoPage(slug, ATAKUM_STORE)!;
  const html = await injectAllMeta(INDEX_HTML, `/${slug}`, ATAKUM_HOST);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? "";
  assert.equal(
    title,
    escapeHtmlForTest(brandifyFor(ATAKUM_STORE, page.metaTitle)),
    "atakum SSR <title> must be the brandified override metaTitle",
  );
  assert.match(title, /Atakum Pet Shop/, "atakum SSR <title> must carry the Atakum brand");
  assert.ok(!/JETGO/i.test(title), "atakum SSR <title> must not leak the JETGO brand");
  assert.equal(canonical, `${ATAKUM_STORE.domain}/${slug}`, "atakum SSR canonical must bind to the atakum domain");

  // Same slug on a sibling host renders DIFFERENT (shared) title => independence.
  const sibHtml = await injectAllMeta(INDEX_HTML, `/${slug}`, JETGOPET_HOST);
  const sibTitle = sibHtml.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  assert.notEqual(title, sibTitle, "atakum & sibling SSR titles for the same slug must differ");
});

test("atakum-exclusive: sitemap lists the override pages with unique slugs, no foreign exclusives", () => {
  const sm = getSitemapPagesForStore(ATAKUM_STORE);
  const slugs = sm.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, "atakum sitemap must have unique slugs");
  const ownExclusive = sm.filter((p) => p.storeId === "atakum").length;
  assert.ok(ownExclusive > 700, `atakum sitemap must list its exclusive pages, got ${ownExclusive}`);
  assert.equal(
    sm.filter((p) => p.storeId && p.storeId !== "atakum").length,
    0,
    "atakum sitemap must not list any foreign store-exclusive page",
  );
});

test("atakum-exclusive: 24h/night/always-open keyword pages state truthful 09:00-21:00 hours", () => {
  const alwaysOpen = ATAKUM_EXCLUSIVE_PAGES.filter((p) =>
    /24\s*saat|7\s*\/?\s*24|gece|nöbet|kesintisiz/i.test(p.slug + " " + p.title),
  );
  assert.ok(alwaysOpen.length > 0, "expected some 24h/night-intent atakum keyword pages");
  for (const p of alwaysOpen) {
    const blob = JSON.stringify(p);
    assert.match(blob, /09:00–21:00/, `${p.slug}: must state the truthful 09:00-21:00 hours`);
    assert.match(blob, /24 saat açık değildir/, `${p.slug}: must explicitly clarify it is not 24h`);
  }
});

// ---- JETGO-EXCLUSIVE Pro Plan / pet-food keyword landing pages --------------
//
// jetgomarket.com (store "jetgo") publishes its OWN dedicated landing page for
// every Pro Plan / pet-food keyword. Unlike atakum's OVERRIDES of shared keyword
// slugs, these are BRAND-NEW product/brand slugs (not in the shared corpus). They
// must be served ONLY on jetgomarket.com and — because jetgo is in a sitemap
// partition group — must STILL be listed in FULL in jetgo's own sitemap (that is
// exactly what the storeId bypass in getSitemapPagesForStore guarantees).

const JETGO_STORE = getStoreByHost(JETGO_HOST);
const JETGO_SAMPLE_SLUGS = JETGO_EXCLUSIVE_PAGES.slice(0, 8).map((p) => p.slug);

test("jetgo-exclusive: a large bespoke Pro Plan keyword corpus is registered", () => {
  assert.ok(
    JETGO_EXCLUSIVE_PAGES.length > 800,
    `expected >800 jetgo-exclusive pages, got ${JETGO_EXCLUSIVE_PAGES.length}`,
  );
  const slugs = JETGO_EXCLUSIVE_PAGES.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, "jetgo corpus must have unique slugs");
  const metaTitles = JETGO_EXCLUSIVE_PAGES.map((p) => p.metaTitle);
  assert.ok(
    new Set(metaTitles).size > metaTitles.length * 0.9,
    "jetgo metaTitles must be overwhelmingly unique (not a thin duplicate corpus)",
  );
  for (const p of JETGO_EXCLUSIVE_PAGES) {
    assert.equal(p.storeId, "jetgo", `${p.slug}: must be tagged storeId jetgo`);
    assert.equal(p.availability, "localOnly", `${p.slug}: must be localOnly`);
    assert.equal(p.type, "keyword", `${p.slug}: must be a keyword page`);
    assert.ok(p.metaTitle && p.metaDescription && p.h1, `${p.slug}: must carry title/meta/h1`);
    assert.ok(
      p.intro?.length && p.sections?.length && p.faq?.length,
      `${p.slug}: must carry intro/sections/faq for a substantive long-form page`,
    );
    assert.ok(p.internalLinks && p.internalLinks.length > 0, `${p.slug}: must carry internal links`);
    // Genuine JETGO first-party content (real NAP phone) — not a brand swap.
    assert.match(JSON.stringify(p), /0850 840 39 59/, `${p.slug}: must carry the JETGO NAP phone`);
  }
});

test("jetgo-exclusive: pages are served ONLY on jetgomarket.com (no leak to siblings/cargo)", () => {
  const own = getSeoPagesForStore(JETGO_STORE).filter((p) => p.storeId === "jetgo");
  assert.equal(own.length, JETGO_EXCLUSIVE_PAGES.length, "jetgo must serve ALL of its exclusive pages");
  for (const host of [JETGOPET_HOST, JETGOSHOP_HOST, ATAKUM_HOST, SAMSUN_HOST]) {
    const store = getStoreByHost(host);
    const leaked = getSeoPagesForStore(store).filter((p) => p.storeId === "jetgo");
    assert.equal(leaked.length, 0, `${store.id}: must NOT see any jetgo-exclusive page`);
  }
  for (const slug of JETGO_SAMPLE_SLUGS) {
    assert.ok(findSeoPage(slug, JETGO_STORE), `${slug}: must resolve on jetgo`);
    // Every sibling now owns an exclusive corpus, so a shared slug may resolve to
    // the SIBLING's own store-scoped override — but NEVER to jetgo's exclusive page.
    const onSiblingLocal = findSeoPage(slug, getStoreByHost(JETGOPET_HOST));
    assert.ok(
      !onSiblingLocal || onSiblingLocal.storeId !== "jetgo",
      `${slug}: jetgo-exclusive must NOT leak to a sibling local store (only the sibling's own override may resolve)`,
    );
    // samsunpet is LOCAL now too: it may serve its OWN localOnly override but never
    // jetgo's exclusive bespoke page.
    const onSamsunpet = findSeoPage(slug, getStoreByHost(SAMSUNPET_HOST));
    assert.ok(
      !onSamsunpet || onSamsunpet.storeId !== "jetgo",
      `${slug}: jetgo-exclusive must NOT leak to samsunpet (only samsunpet's own override may resolve)`,
    );
  }
});

test("jetgo-exclusive: jetgo sitemap lists EVERY exclusive (storeId bypasses the hash partition); siblings never list a JETGO-tagged page", () => {
  const jetgoSitemap = new Set(getSitemapPagesForStore(JETGO_STORE).map((p) => p.slug));
  for (const p of JETGO_EXCLUSIVE_PAGES) {
    assert.ok(jetgoSitemap.has(p.slug), `${p.slug}: jetgo sitemap must list its own exclusive page`);
  }
  // jetgo is in a partition group; siblings must NOT list any page TAGGED storeId
  // "jetgo". The match is by storeId, NOT by slug: jetgoshop legitimately reuses
  // some jetgo slugs for its OWN store-scoped pages, so a shared slug appearing on
  // a sibling is its own page, not a leak of jetgo's bespoke content.
  for (const host of [JETGOPET_HOST, JETGOSHOP_HOST]) {
    const sib = getSitemapPagesForStore(getStoreByHost(host));
    assert.equal(
      sib.filter((p) => p.storeId === "jetgo").length,
      0,
      `${host}: sibling sitemap must not list any jetgo-tagged exclusive page`,
    );
  }
  // no FOREIGN store-exclusive in jetgo's own sitemap.
  assert.equal(
    getSitemapPagesForStore(JETGO_STORE).filter((p) => p.storeId && p.storeId !== "jetgo").length,
    0,
    "jetgo sitemap must not list any foreign store-exclusive page",
  );
});

test("jetgo-exclusive: NEW slugs never clobber a curated NON-keyword shared page", () => {
  // Every jetgo page is either a brand-new slug or a benign override of a SHARED
  // keyword page; it must never replace a hand-authored core/category/district page.
  for (const p of JETGO_EXCLUSIVE_PAGES) {
    const shared = SEO_PAGES.find((q) => q.slug === p.slug && !q.storeId);
    if (shared) {
      assert.equal(
        shared.type,
        "keyword",
        `${p.slug}: a jetgo exclusive may only collide with a shared KEYWORD page, not a curated page`,
      );
    }
  }
});

test("jetgo-exclusive: retailer-intent keywords are framed as a local ALTERNATIVE (no marketplace affiliation)", () => {
  const retailerPages = JETGO_EXCLUSIVE_PAGES.filter((p) => /Yerel Alternatif/.test(p.metaTitle));
  assert.ok(retailerPages.length > 0, "expected some retailer-intent jetgo pages");
  for (const p of retailerPages.slice(0, 25)) {
    const blob = JSON.stringify(p);
    assert.match(blob, /bağımsız|alternatif/i, `${p.slug}: retailer page must position JETGO as an independent local alternative`);
    assert.match(blob, /bağlantımız yoktur/i, `${p.slug}: retailer page must carry the no-affiliation disclaimer`);
    assert.ok(
      !/resmi (bayi|satıcı|distribütör)|yetkili (bayi|satıcı)/i.test(blob),
      `${p.slug}: retailer page must not imply official marketplace affiliation`,
    );
  }
});

test("jetgo-exclusive: SSR meta serves jetgo's bespoke content on jetgomarket.com, not on a sibling", async () => {
  const slug = JETGO_SAMPLE_SLUGS[0];
  const page = findSeoPage(slug, JETGO_STORE)!;
  const html = await injectAllMeta(INDEX_HTML, `/${slug}`, JETGO_HOST);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? "";
  assert.equal(
    title,
    escapeHtmlForTest(brandifyFor(JETGO_STORE, page.metaTitle)),
    "jetgo SSR <title> must be the brandified jetgo metaTitle",
  );
  assert.equal(canonical, `${JETGO_STORE.domain}/${slug}`, "jetgo SSR canonical must bind to the jetgomarket.com domain");
  // The same slug does NOT exist on a sibling host => a different (non-product) title.
  const sibHtml = await injectAllMeta(INDEX_HTML, `/${slug}`, JETGOPET_HOST);
  const sibTitle = sibHtml.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  assert.notEqual(title, sibTitle, "jetgo product SSR title must not appear on a sibling host");
});

// ---------------------------------------------------------------------------
// Royal Canin jetgo-exclusive corpus.
//
// jetgomarket.com also publishes a dedicated landing page for every Royal Canin
// keyword. This corpus shares storeId "jetgo" with the Pro Plan corpus, so the
// combined-corpus invariants above (served only on jetgo, unique slugs, sitemap,
// retailer framing) already cover it. The tests below lock the Royal Canin-SPECIFIC
// behaviour: a sizable RC corpus exists, breed/size-line pages carry the bespoke
// "Irk ve Boyuta" section, and veterinary-diet pages stay truthful (nutritional
// support under veterinary guidance, never a cure claim).
// ---------------------------------------------------------------------------

test("royal-canin: a large bespoke Royal Canin keyword corpus is registered and folded into jetgo", () => {
  assert.ok(
    ROYALCANIN_KEYWORD_PAGES.length > 2000,
    `expected >2000 Royal Canin pages, got ${ROYALCANIN_KEYWORD_PAGES.length}`,
  );
  const slugs = ROYALCANIN_KEYWORD_PAGES.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, "Royal Canin corpus must have unique slugs");
  for (const p of ROYALCANIN_KEYWORD_PAGES) {
    assert.equal(p.storeId, "jetgo", `${p.slug}: RC page must be storeId jetgo`);
    assert.equal(p.availability, "localOnly", `${p.slug}: RC page must be localOnly`);
    assert.equal(p.type, "keyword", `${p.slug}: RC page must be a keyword page`);
  }
  // The integrated jetgo corpus must absorb the RC pages (minus cross-corpus slug
  // collisions with Pro Plan, which Pro Plan wins) on top of the Pro Plan pages.
  const jetgoSlugs = new Set(JETGO_EXCLUSIVE_PAGES.map((p) => p.slug));
  const absorbed = ROYALCANIN_KEYWORD_PAGES.filter((p) => jetgoSlugs.has(p.slug)).length;
  assert.ok(
    absorbed > 2000,
    `most RC pages must be folded into JETGO_EXCLUSIVE_PAGES (got ${absorbed})`,
  );
});

test("royal-canin: breed/size-line keywords carry the bespoke 'Irk ve Boyuta' section", () => {
  const withBreedSection = ROYALCANIN_KEYWORD_PAGES.filter((p) =>
    (p.sections ?? []).some((s) => /Irk ve Boyuta Özel Beslenme/.test(s.h2)),
  );
  assert.ok(
    withBreedSection.length > 50,
    `expected many RC breed/size-line pages with the Irk/Boyut section, got ${withBreedSection.length}`,
  );
  // A clear breed page (Labrador) must resolve on jetgo and carry breed-aware prose.
  const labrador = findSeoPage("royal-canin-labrador", JETGO_STORE);
  assert.ok(labrador, "royal-canin-labrador must resolve on jetgo");
  const blob = JSON.stringify(labrador);
  assert.match(blob, /Labrador/, "breed page must name the breed");
  assert.match(blob, /köpek/i, "Labrador page must be framed as a dog product");
  // ...and jetgo's RC breed page must NOT leak onto a sibling local store — the
  // sibling now owns the same-universe slug and serves its OWN store-scoped page.
  const labradorOnSibling = findSeoPage("royal-canin-labrador", getStoreByHost(JETGOPET_HOST));
  assert.ok(
    !labradorOnSibling || labradorOnSibling.storeId !== "jetgo",
    "RC breed page must not leak to a sibling local store (sibling serves only its own override)",
  );
});

test("royal-canin: veterinary-diet pages give nutritional support under vet guidance, never a cure claim", () => {
  const vetPages = ROYALCANIN_KEYWORD_PAGES.filter((p) =>
    /\b(renal|hepatic|urinary|gastro|gastrointestinal|cardiac|anallergenic|annalergenic|diabetic|recovery|mobility|satiety)\b/.test(p.slug),
  );
  assert.ok(vetPages.length > 20, `expected a body of RC veterinary-diet pages, got ${vetPages.length}`);
  const FORBIDDEN_CURE = /iyileştirir|tedavi eder|kesin (çözüm|tedavi)|hastalığı (yok eder|geçirir)|garanti(li)? (tedavi|iyileşme)/i;
  for (const p of vetPages.slice(0, 60)) {
    const blob = JSON.stringify(p);
    assert.match(blob, /veteriner/i, `${p.slug}: vet-diet page must direct the buyer to veterinary guidance`);
    assert.ok(!FORBIDDEN_CURE.test(blob), `${p.slug}: vet-diet page must not claim to cure/treat`);
  }
});

test("royal-canin: retailer-intent keywords (Amazon/Petlebi/...) are framed as a local ALTERNATIVE", () => {
  const rcRetailer = ROYALCANIN_KEYWORD_PAGES.filter((p) => /Yerel Alternatif/.test(p.metaTitle));
  assert.ok(rcRetailer.length > 0, "expected some RC retailer-intent pages");
  for (const p of rcRetailer.slice(0, 25)) {
    const blob = JSON.stringify(p);
    assert.match(blob, /bağımsız|alternatif/i, `${p.slug}: RC retailer page must position JETGO as an independent local alternative`);
    assert.match(blob, /bağlantımız yoktur/i, `${p.slug}: RC retailer page must carry the no-affiliation disclaimer`);
    assert.ok(
      !/resmi (bayi|satıcı|distribütör)|yetkili (bayi|satıcı)/i.test(blob),
      `${p.slug}: RC retailer page must not imply official marketplace affiliation`,
    );
  }
});

test("royal-canin: competitor-only keywords are NEVER presented as Royal Canin products (truthfulness)", () => {
  // The source keyword list carries a little noise: keywords naming a DIFFERENT
  // brand (no Royal Canin mention) must not be dressed up as Royal Canin products.
  const COMPETITOR_SAMPLES = [
    "felicia köpek maması 6 kg",
    "felicia kısırlaştırılmış kedi maması 2 kg",
    "dentabites whiskas",
    "monge starter mini",
    "brit care superfruits",
    "brit care tavşanlı köpek maması",
    "n&d kinoa kedi maması",
    "n&d tahılsız yavru kedi maması",
    "hills maxi puppy",
    "proplan fit 32",
  ];
  const byTitle = new Map(
    ROYALCANIN_KEYWORD_PAGES.map((p) => [p.title.toLocaleLowerCase("tr-TR"), p] as const),
  );
  let checked = 0;
  for (const s of COMPETITOR_SAMPLES) {
    const p = byTitle.get(s.toLocaleLowerCase("tr-TR"));
    if (!p) continue; // slug may have collided/deduped; skip if absent
    checked++;
    // Only the PAGE COPY is asserted truthful. internalLinks legitimately point to
    // real Royal Canin product pages the shop sells (reasonable cross-sell) and are
    // not a claim that this keyword itself is a Royal Canin product.
    const copy = [
      p.title,
      p.metaTitle,
      p.metaDescription,
      p.h1,
      ...(p.intro ?? []),
      ...(p.sections ?? []).flatMap((sec) => [sec.h2, ...(sec.paragraphs ?? []), ...(sec.list ?? [])]),
      ...(p.features ?? []),
      ...((p.faq ?? []).flatMap((f) => [f.q, f.a])),
    ].join(" ");
    assert.ok(
      !/Royal Canin/i.test(copy),
      `${p.slug}: competitor keyword must NOT be framed as a Royal Canin product`,
    );
    // It should still be a useful, store-scoped JETGO page.
    assert.equal(p.storeId, "jetgo", `${p.slug}: competitor page must stay jetgo-scoped`);
    assert.match(copy, /JETGO/i, `${p.slug}: competitor page must still surface JETGO framing`);
  }
  assert.ok(checked >= 6, `expected to verify several competitor-only pages, got ${checked}`);
});

// ---------------------------------------------------------------------------
// "Diğer markalar" (other brands) jetgo-exclusive corpus.
//
// jetgomarket.com publishes a landing page for every "other brand" keyword too.
// Unlike Pro Plan / Royal Canin this corpus is MULTI-BRAND (Hill's, N&D/Farmina,
// GimCat, Reflex, Enjoy, Pronature, LaVital, ProChoice, ProPerformance, GranCarno,
// Cibau, plus product barcodes). It shares storeId "jetgo", so the combined-corpus
// invariants above (served only on jetgo, unique slugs, sitemap, retailer framing)
// already cover it. The tests below lock the markalar-SPECIFIC behaviour: the
// corpus exists & is folded in, telecom noise is skipped, each keyword's brand is
// attributed truthfully (never dressed up as a different brand), Hill's letter-code
// vet diets stay support-not-cure, GimCat keywords are framed as treats/supplements
// (not staple kibble), and barcodes stay brand-neutral.
// ---------------------------------------------------------------------------

// Page COPY only (NOT internalLinks): internalLinks legitimately cross-sell real
// products the shop stocks and are not a claim about the keyword's own brand.
function markalarCopy(p: SeoPageData): string {
  return [
    p.title,
    p.metaTitle,
    p.metaDescription,
    p.h1,
    ...(p.intro ?? []),
    ...(p.sections ?? []).flatMap((sec) => [sec.h2, ...(sec.paragraphs ?? []), ...(sec.list ?? [])]),
    ...(p.features ?? []),
    ...((p.faq ?? []).flatMap((f) => [f.q, f.a])),
  ].join(" ");
}
const markalarBySlug = new Map(MARKALAR_KEYWORD_PAGES.map((p) => [p.slug, p] as const));

test("markalar: a large multi-brand keyword corpus is registered and folded into jetgo", () => {
  assert.ok(
    MARKALAR_KEYWORD_PAGES.length > 1000,
    `expected >1000 markalar pages, got ${MARKALAR_KEYWORD_PAGES.length}`,
  );
  const slugs = MARKALAR_KEYWORD_PAGES.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, "markalar corpus must have unique slugs");
  for (const p of MARKALAR_KEYWORD_PAGES) {
    assert.equal(p.storeId, "jetgo", `${p.slug}: markalar page must be storeId jetgo`);
    assert.equal(p.availability, "localOnly", `${p.slug}: markalar page must be localOnly`);
    assert.equal(p.type, "keyword", `${p.slug}: markalar page must be a keyword page`);
    assert.ok(p.metaTitle && p.metaDescription && p.h1, `${p.slug}: must carry title/meta/h1`);
  }
  // The integrated jetgo corpus must absorb the markalar pages on top of Pro Plan
  // + Royal Canin (markalar loses any cross-corpus slug collision, earlier wins).
  const jetgoSlugs = new Set(JETGO_EXCLUSIVE_PAGES.map((p) => p.slug));
  const absorbed = MARKALAR_KEYWORD_PAGES.filter((p) => jetgoSlugs.has(p.slug)).length;
  assert.ok(
    absorbed > 1000,
    `most markalar pages must be folded into JETGO_EXCLUSIVE_PAGES (got ${absorbed})`,
  );
});

test("markalar: telecom/Spanish noise (Spectrum, paquetes, promociones) is skipped, never published", () => {
  assert.ok(
    MARKALAR_SKIPPED_NOISE > 0,
    `expected the generator to report skipped noise keywords, got ${MARKALAR_SKIPPED_NOISE}`,
  );
  const NOISE = /spectrum|paquetes|promociones|sin contrato|com calificado/i;
  const leaked = MARKALAR_KEYWORD_PAGES.filter((p) => NOISE.test(`${p.slug} ${markalarCopy(p)}`));
  assert.equal(leaked.length, 0, `telecom noise must never become a page (leaked: ${leaked.map((p) => p.slug).join(", ")})`);
});

test("markalar: each keyword's brand is attributed truthfully, never dressed up as another brand", () => {
  // Single-brand keywords (no cross-brand comparison): the page copy must name the
  // CORRECT brand and must NOT claim to be Royal Canin / Pro Plan (separate corpora)
  // nor any other unrelated brand from the known list.
  const SAMPLES: Array<{ slug: string; brand: RegExp; foreign: RegExp }> = [
    { slug: "gimcat-malt-soft-paste", brand: /GimCat/i, foreign: /Royal Canin|Pro ?Plan|Hill's|Reflex|Farmina/i },
    { slug: "hills-zd", brand: /Hill's/i, foreign: /Royal Canin|Pro ?Plan|Farmina|GimCat|Reflex/i },
    { slug: "nd-kedi-mamasi", brand: /N&D \(Farmina\)|Farmina/i, foreign: /Royal Canin|Pro ?Plan|Hill's|GimCat|Reflex/i },
    { slug: "farmina-pumpkin", brand: /Farmina/i, foreign: /Royal Canin|Pro ?Plan|Hill's|GimCat|Reflex/i },
    { slug: "grancarno", brand: /GranCarno/i, foreign: /Royal Canin|Pro ?Plan|Hill's|GimCat/i },
    { slug: "cibau-fish-sensitive", brand: /Cibau/i, foreign: /Royal Canin|Pro ?Plan|Hill's|GimCat/i },
    { slug: "enjoy-cambridge", brand: /Enjoy/i, foreign: /Royal Canin|Pro ?Plan|Hill's|GimCat/i },
    { slug: "pronature-daily-growth", brand: /Pronature/i, foreign: /Royal Canin|Pro ?Plan|Hill's|GimCat/i },
    { slug: "lavital-12-kg", brand: /LaVital/i, foreign: /Royal Canin|Pro ?Plan|Hill's|GimCat/i },
    { slug: "prochoice-15-kg", brand: /ProChoice/i, foreign: /Royal Canin|Pro ?Plan|Hill's|GimCat/i },
    { slug: "reflex-plus-somonlu-kopek-mamasi", brand: /Reflex/i, foreign: /Royal Canin|Pro ?Plan|Hill's|GimCat/i },
  ];
  let checked = 0;
  for (const s of SAMPLES) {
    const p = markalarBySlug.get(s.slug);
    if (!p) continue; // slug may have deduped/collided across corpora; skip if absent
    checked++;
    const copy = markalarCopy(p);
    assert.match(copy, s.brand, `${s.slug}: page must name its true brand`);
    assert.ok(!s.foreign.test(copy), `${s.slug}: page must NOT be framed as a different brand`);
    assert.equal(p.storeId, "jetgo", `${s.slug}: must stay jetgo-scoped`);
    assert.match(copy, /JETGO/i, `${s.slug}: must still surface JETGO framing`);
  }
  assert.ok(checked >= 8, `expected to verify several single-brand pages, got ${checked}`);
});

test("markalar: Hill's letter-code veterinary diets give support under vet guidance, never a cure", () => {
  // A "vet diet" is one the generator actually classified as a letter-code/therapeutic
  // diet — it emits the explicit support-not-cure line. (Title tokens like "zd" are
  // NOT enough: e.g. "hills sensitive zd" is framed as a generic sensitive diet and
  // is correctly NOT given mandatory veterinary framing.) We key off that marker so
  // the filter tracks the generator's real classification, and breaks if it regresses.
  const SUPPORT_NOT_CURE = /Veteriner diyetleri tek başına tedavi değil, beslenme desteğidir/;
  const vetPages = MARKALAR_KEYWORD_PAGES.filter(
    (p) => /hill/i.test(p.title) && SUPPORT_NOT_CURE.test(markalarCopy(p)),
  );
  assert.ok(vetPages.length > 10, `expected a body of Hill's letter-code vet-diet pages, got ${vetPages.length}`);
  const FORBIDDEN_CURE = /iyileştirir|tedavi eder|kesin (çözüm|tedavi)|hastalığı (yok eder|geçirir)|garanti(li)? (tedavi|iyileşme)/i;
  for (const p of vetPages) {
    const copy = markalarCopy(p);
    assert.match(copy, /veteriner/i, `${p.slug}: Hill's vet-diet page must direct the buyer to veterinary guidance`);
    assert.ok(!FORBIDDEN_CURE.test(copy), `${p.slug}: Hill's vet-diet page must not claim to cure/treat`);
  }
});

test("markalar: GimCat keywords are framed as treats/supplements (macun/ödül/takviye), not staple kibble", () => {
  const gimcat = MARKALAR_KEYWORD_PAGES.filter((p) => /gimcat/i.test(p.title));
  assert.ok(gimcat.length > 3, `expected several GimCat pages, got ${gimcat.length}`);
  let treatFramed = 0;
  for (const p of gimcat.slice(0, 40)) {
    const copy = markalarCopy(p);
    if (/macun|ödül|takviye|vitamin|malt/i.test(copy)) treatFramed++;
  }
  assert.ok(
    treatFramed >= Math.ceil(Math.min(gimcat.length, 40) * 0.5),
    `most GimCat pages must use treat/supplement framing, got ${treatFramed}`,
  );
  // A clear treat keyword carries treat vocabulary.
  const malt = markalarBySlug.get("gimcat-malt-soft-paste");
  if (malt) assert.match(markalarCopy(malt), /macun/i, "gimcat malt paste must be framed as a macun (treat)");
});

test("markalar: barcode/product-code keywords stay brand-neutral (no invented brand)", () => {
  const barcodes = MARKALAR_KEYWORD_PAGES.filter((p) => /^\d{6,}$/.test(p.slug));
  assert.ok(barcodes.length > 100, `expected the barcode keyword set, got ${barcodes.length}`);
  for (const p of barcodes.slice(0, 40)) {
    const copy = markalarCopy(p);
    assert.match(p.metaTitle, /Ürün Kodu/i, `${p.slug}: barcode page must be framed by product code`);
    assert.ok(
      !/Royal Canin|Pro ?Plan|Hill's|GimCat|Farmina/i.test(copy),
      `${p.slug}: barcode page must not invent a specific brand`,
    );
  }
});

test("markalar: a representative page is served only on jetgomarket.com and listed in its sitemap", () => {
  const slug = "grancarno";
  const p = markalarBySlug.get(slug);
  assert.ok(p, `${slug} must exist in the markalar corpus`);
  assert.ok(findSeoPage(slug, JETGO_STORE), `${slug}: must resolve on jetgo`);
  // Siblings now own exclusive corpora over the same markalar universe. Every sibling
  // is LOCAL now, so each resolves to its OWN store-scoped localOnly override — and
  // NEVER to jetgo's page.
  const onSiblingLocal = findSeoPage(slug, getStoreByHost(JETGOPET_HOST));
  assert.ok(onSiblingLocal, `${slug}: a sibling local store sharing the ATAKUM universe must serve its own override`);
  assert.equal(onSiblingLocal!.storeId, "jetgopet", `${slug}: a sibling local store must serve ONLY its own page, never jetgo's`);
  assert.equal(onSiblingLocal!.availability, "localOnly", `${slug}: the sibling local override stays localOnly`);
  const onSamsunpet = findSeoPage(slug, getStoreByHost(SAMSUNPET_HOST));
  assert.ok(onSamsunpet, `${slug}: a sibling local store sharing the markalar universe must serve its own override`);
  assert.equal(onSamsunpet!.storeId, "samsunpet", `${slug}: a sibling must serve ONLY its own page, never jetgo's`);
  assert.equal(onSamsunpet!.availability, "localOnly", `${slug}: samsunpet's markalar override stays localOnly`);
  const jetgoSitemap = new Set(getSitemapPagesForStore(JETGO_STORE).map((q) => q.slug));
  assert.ok(jetgoSitemap.has(slug), `${slug}: jetgo sitemap must list the markalar page`);
});

// ---------------------------------------------------------------------------
// "Diğer anahtar kelimeler" (broad multi-category) jetgo-exclusive corpus.
//
// The 4th and broadest jetgo corpus: a landing page per long-tail keyword
// spanning retailers (Trendyol/Migros/Akakçe...), live-animal & adoption intent,
// service intent (eğitim, kuaför, pansiyon, veteriner), litter, birds/small pets,
// accessories (collar/bed/carrier/bowl/grooming/toy/clothing), health/supplement
// and food/treat. It shares storeId "jetgo", so the combined-corpus invariants
// above (served only on jetgo, unique slugs, sitemap framing) already cover it.
// The tests below lock the diger-SPECIFIC, truthfulness-sensitive behaviour:
//   - the corpus exists & is folded in (all jetgo/localOnly/keyword/unique, faq),
//   - category copy is correct (accessories are NOT framed as feeding, litter as
//     litter, birds as bird food),
//   - live-animal keywords never claim to SELL animals (pet shops legally can't),
//   - service keywords never claim JETGO PROVIDES the service (it is a pet shop),
//   - retailer keywords never claim to BE / be affiliated with the marketplace,
//   - no page fabricates a concrete price.
// Truthfulness is scoped to page COPY (markalarCopy) — internalLinks legitimately
// cross-sell real stocked products and are not a claim about the keyword itself.
// ---------------------------------------------------------------------------

const digerBySlug = new Map(DIGER_KEYWORD_PAGES.map((p) => [p.slug, p] as const));

// Body text EXCLUDING faq questions: a live-intent FAQ legitimately ASKS "can I
// buy a live animal here?" (answer: "Hayır"), so the question must not be mistaken
// for an affirmative sale claim. Lower-cased for tr-aware matching.
function digerBody(p: SeoPageData): string {
  return [
    p.metaDescription,
    p.h1,
    ...(p.intro ?? []),
    ...(p.sections ?? []).flatMap((s) => [s.h2, ...(s.paragraphs ?? []), ...(s.list ?? [])]),
    ...(p.features ?? []),
    ...((p.faq ?? []).map((f) => f.a)),
  ].join(" ").toLocaleLowerCase("tr-TR");
}

test("diger: a large multi-category keyword corpus is registered and folded into jetgo", () => {
  assert.ok(
    DIGER_KEYWORD_PAGES.length > 3000,
    `expected >3000 diger pages, got ${DIGER_KEYWORD_PAGES.length}`,
  );
  assert.ok(
    Number.isFinite(DIGER_SKIPPED_NOISE) && DIGER_SKIPPED_NOISE >= 0,
    `DIGER_SKIPPED_NOISE must be a count, got ${DIGER_SKIPPED_NOISE}`,
  );
  const slugs = DIGER_KEYWORD_PAGES.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, "diger corpus must have unique slugs");
  for (const p of DIGER_KEYWORD_PAGES) {
    assert.equal(p.storeId, "jetgo", `${p.slug}: diger page must be storeId jetgo`);
    assert.equal(p.availability, "localOnly", `${p.slug}: diger page must be localOnly`);
    assert.equal(p.type, "keyword", `${p.slug}: diger page must be a keyword page`);
    assert.ok(p.metaTitle && p.metaDescription && p.h1, `${p.slug}: must carry title/meta/h1`);
    assert.ok((p.faq ?? []).length > 0, `${p.slug}: must carry an faq for mobile/AI search`);
  }
  // No diger slug may shadow a real client app route (e.g. /acik-mama).
  for (const r of ["acik-mama", "kampanya", "veteriner", "magaza", "blog"]) {
    assert.ok(!digerBySlug.has(r), `diger must not generate a reserved app-route slug (${r})`);
  }
  // The integrated jetgo corpus must absorb the diger pages on top of the first
  // three corpora (diger loses any cross-corpus slug collision — earlier wins).
  const jetgoSlugs = new Set(JETGO_EXCLUSIVE_PAGES.map((p) => p.slug));
  const absorbed = DIGER_KEYWORD_PAGES.filter((p) => jetgoSlugs.has(p.slug)).length;
  assert.ok(
    absorbed > 3000,
    `most diger pages must be folded into JETGO_EXCLUSIVE_PAGES (got ${absorbed})`,
  );
});

test("diger: accessory keywords are framed as accessories, never as food/feeding (tasma ≠ mama)", () => {
  const FEEDING = /(günlük|öğün) porsiyon|porsiyon (tablo|miktar)|mama (porsiyon|geçiş)|kaç (gram|öğün) mama|beslenme tablosu/i;
  const COLLAR_VOCAB = /tasma|koşum|gezdirme|breakaway|boyun/i;
  const samples = ["kopek-tasmasi", "kedi-tasmasi", "kopek-yatagi"];
  let checked = 0;
  for (const slug of samples) {
    const p = digerBySlug.get(slug);
    if (!p) continue; // slug may have deduped across corpora; skip if absent
    checked++;
    assert.ok(
      !FEEDING.test(markalarCopy(p)),
      `${slug}: accessory page must not carry feeding-portion instructions`,
    );
  }
  assert.ok(checked >= 2, `expected to verify accessory pages, got ${checked}`);
  const collar = digerBySlug.get("kopek-tasmasi");
  if (collar) {
    assert.match(markalarCopy(collar), COLLAR_VOCAB, "köpek tasması must be framed as a collar/leash accessory");
  }
});

test("diger: litter and bird keywords get their correct category copy", () => {
  const litter = digerBySlug.get("kedi-kumu");
  assert.ok(litter, "kedi-kumu must exist in the diger corpus");
  assert.match(
    markalarCopy(litter!),
    /kedi kumu|topaklan|bentonit|silika|tuvalet/i,
    "kedi kumu must be framed as cat litter",
  );
  const bird = digerBySlug.get("muhabbet-kusu-yemi");
  assert.ok(bird, "muhabbet-kusu-yemi must exist in the diger corpus");
  assert.match(
    markalarCopy(bird!),
    /kuş|yem|tohum|gaga taşı|mineral/i,
    "bird food must be framed for birds",
  );
});

test("diger: live-animal / adoption keywords never claim to sell animals", () => {
  const live = DIGER_KEYWORD_PAGES.filter((p) => /Sorumlu Sahiplenme/i.test(p.metaTitle));
  assert.ok(live.length > 50, `expected a body of live-animal pages, got ${live.length}`);
  // "canlı hayvan satışı yapmaz" / "canlı hayvan satmaz" — explicit no-sale line.
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const AFFIRM = /sat[ıi]yoruz|satar[ıi]z|satışı yap[ıi]yoruz|satışı yapar[ıi]z|satın alabilirsiniz|canlı hayvan (satıyoruz|satarız|mevcut|stok)/;
  for (const p of live) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: live page must state JETGO does not sell live animals`);
    assert.ok(!AFFIRM.test(digerBody(p)), `${p.slug}: live page must not affirmatively offer animals for sale`);
  }
});

test("diger: every live-animal acquisition KEYWORD is truth-safe (broad slug-derived recall)", () => {
  // Recall guard: derive the live-candidate set from the SLUG tokens, NOT from the
  // emitted metaTitle. The metaTitle test above only inspects pages the generator
  // already decided were live; a MISCLASSIFIED live keyword (e.g. a bird/rabbit
  // treated as a product, or "eğitimli ... satılık" swallowed as a service) would
  // silently escape it. Here we independently flag any keyword whose slug pairs an
  // acquisition cue with a live animal — and no tangible product / service subject —
  // then assert each carries the no-sale disclaimer and never affirms a sale.
  // Token-based (slugs are ASCII, hyphen-delimited) so suffixes/plurals are exact.
  const ANIMAL_STEM = ["kedi","kopek","yavru","kitten","puppy","muhabbet","kanarya","papagan","sultan","paraket","finch","ispinoz","saka","kus","tavsan","hamster","ginepig","gine","kemirgen","sinsilla","gerbil","fare","sican","balik","lepistes","moli","melek","japon","kaplumbaga","iguana","gekko","yilan","surungen"];
  // Unambiguous acquisition cues (price-only "fiyat"/"ucuz" is ambiguous over
  // products and is pinned by name in the next test, not swept here).
  const CUE = new Set(["canli","satilik","satlik","satis","satisi","satan","satanlar","satilan","satma","sat","satin","sahiplen","sahiplendirme","almak","alma","alinir","alan","alanlar","alici","alicisi","bedava","ucretsiz","sahibinden"]);
  // Tangible product / service tokens (exact match) → the subject is the product or
  // service, not a live animal. Includes look-alikes of the buyer cue "alan" that are
  // actually areas/taming/shopping ("alanı" area, "alıştırma" taming, "alışveriş").
  const PROD_SVC = new Set(["ev","evi","kum","kumu","yag","yagi","otu","kab","kabi","yem","yemi","kafes","kafesi","mama","mamasi","tasma","tuvalet","kemik","gaga","tuy","catnip","nane","zehir","kapan","damla","minder","yatak","suluk","oyuncak","oyun","alani","alanlari","vitamin","vitaminler","sampuan","tarak","firca","kiyafet","canta","tasima","kulube","kulubesi","kumes","mineral","file","aksesuar","malzeme","urun","isimlik","egitim","egitimi","kuafor","pansiyon","otel","veteriner","merkez","merkezi","gezdirme","kosum","macun","malt","altligi","alisveris","alisverisi","alistirma","aliskin"]);
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const AFFIRM = /sat[ıi]yoruz|satar[ıi]z|satışı yap[ıi]yoruz|satışı yapar[ıi]z|satın alabilirsiniz|canlı hayvan (satıyoruz|satarız|mevcut|stok)/;
  const candidates = DIGER_KEYWORD_PAGES.filter((p) => {
    const t = p.slug.split("-");
    const hasAnimal = t.some((x) => ANIMAL_STEM.some((a) => x.startsWith(a)));
    const hasCue = t.some((x) => CUE.has(x));
    const hasProdSvc = t.some((x) => PROD_SVC.has(x));
    return hasAnimal && hasCue && !hasProdSvc;
  });
  assert.ok(candidates.length > 150, `expected a large live-sale candidate body, got ${candidates.length}`);
  for (const p of candidates) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: live-sale keyword must state JETGO does not sell live animals`);
    assert.ok(!AFFIRM.test(digerBody(p)), `${p.slug}: live-sale keyword must not affirmatively offer animals for sale`);
  }
});

test("diger: ambiguous price/where-to-buy cues are classified by SUBJECT, not surface cue", () => {
  // The hardest cases: a price/where-to-buy/free cue whose SUBJECT decides the
  // category. A living animal must carry the no-sale disclaimer; a product or
  // service with the SAME cue must NOT (the disclaimer would be off-topic/misleading).
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  // MUST be live — bird/rabbit/parrot subjects behind a price cue ("fiyatları"),
  // a "where to buy/sell" phrasing ("satan/alan petshoplar/yerler", "satanlar"),
  // a bare sell verb ("sat"/"satma"/"satma sitesi"), a free cue ("bedava"/"ücretsiz"),
  // an acquisition verb ("almak"), or a trained-animal attribute ("eğitimli ...").
  // These are the cues earlier passes missed.
  const LIVE = [
    "muhabbet-kusu-fiyatlari","1-aylik-muhabbet-kusu-fiyatlari","kanarya-fiyatlari-sahibinden",
    "tavsan-satisi","jako-papagan-satis","papagan-satis","muhabbet-kusu-satan-petshoplar",
    "muhabbet-kusu-satan-yerler","sahibinden-papagan-satanlar","muhabbet-kusu-almak",
    "erkek-muhabbet-kusuna-disi-almak","bedava-muhabbet-kusu","jumbo-muhabbet-kusu-sahibinden",
    "muhabbet-kusu-ucretsiz","egitimli-muhabbet-kusu-fiyatlari",
    "muhabbet-kusu-sat","muhabbet-kusu-satma","muhabbet-kusu-satma-sitesi",
    "muhabbet-kusu-alan-petshoplar","muhabbet-kusu-alan-yerler","tavsan-alan-yerler",
  ];
  // MUST NOT be live — the SAME cues over a product (ev/kulübe/yağ/kafes/yem/mama)
  // or a service (eğitim/merkez). Guards the classifier against over-triggering.
  const NOT_LIVE = [
    "kedi-evi-fiyatlari","kopek-kulubesi-fiyatlari","kopek-egitim-fiyatlari",
    "kopek-egitim-merkezi-fiyatlari","muhabbet-kusu-yemi","kedi-balik-yagi","kopek-kafesi",
    "ucretsiz-kedi-mamasi","bedava-kopek-kulubesi","hamster-kafesi-fiyatlari",
    // buyer-cue look-alikes that are actually taming guides / shopping-generic, not
    // a live transaction ("alıştırma" tame, "alışveriş" shopping) — must stay off.
    "muhabbet-kusu-alistirma","papagan-alistirma","muhabbet-kusu-alisveris",
  ];
  for (const slug of LIVE) {
    const p = digerBySlug.get(slug);
    assert.ok(p, `expected live keyword "${slug}" in the diger corpus`);
    assert.match(markalarCopy(p!), NO_SALE, `${slug}: live-animal subject must carry the no-sale disclaimer`);
  }
  for (const slug of NOT_LIVE) {
    const p = digerBySlug.get(slug);
    assert.ok(p, `expected keyword "${slug}" in the diger corpus`);
    assert.ok(!NO_SALE.test(markalarCopy(p!)), `${slug}: product/service subject must NOT be framed as a live-animal sale`);
  }
});

test("diger: every bird/rabbit PRICE keyword is truth-safe (broad slug-derived recall)", () => {
  // Companion to the strong-cue recall sweep above, but for the noisier PRICE cue.
  // "fiyat"/"ucuz" over a cat/dog is ambiguous (food brands: "royal canin kitten
  // en ucuz"), so we sweep only BIRDS + RABBITS — species JETGO never stocks live,
  // where a bare price query resolves to the live animal. Any such keyword with no
  // product/service subject and that is not a retailer page must carry the no-sale
  // disclaimer; this catches modifier-heavy live PRICE pages an ASCII-boundary bug
  // (e.g. "anaç"/"çift"/"renkli"/"maltese"/"sov") previously let slip through.
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const RETAILER = /Yerel Alternatif/;
  const BIRD_RABBIT = ["muhabbet","papagan","sultan","kanarya","paraket","finch","ispinoz","saka","kus","kakadu","kakariki","jako","forpus","sevda","cennet","tavsan"];
  const PRICE = new Set(["fiyat","fiyati","fiyatlari","ucuz"]);
  // Product / service / accessory nouns (incl. bird/rabbit equipment: yemlik/folluk/
  // suluk/kümes/kuluçka) → the subject is the object, not the animal.
  const PROD_SVC = new Set(["yem","yemi","yemlik","kafes","kafesi","kafesli","folluk","yumurtalik","suluk","sulugu","kumes","kumesi","kulube","kulubesi","tasma","tasmasi","oyuncak","oyun","vitamin","takviye","takim","mama","mamasi","mamalari","gaga","tuy","isimlik","aksesuar","malzeme","urun","mineral","file","kum","kumu","tuvalet","tuvaleti","kulucka","korse","agizlik","ev","evi","koruyucu","yara","sok","akilli","alani","alanlari","alistirma","alisveris","alisverisi","egitim","egitimi","kuafor","pansiyon","veteriner","merkez","merkezi","gezdirme","tras","yikama","altligi"]);
  const candidates = DIGER_KEYWORD_PAGES.filter((p) => {
    const t = p.slug.split("-");
    const hasAnimal = t.some((x) => BIRD_RABBIT.some((a) => x.startsWith(a)));
    const hasPrice = t.some((x) => PRICE.has(x)) || p.slug.includes("ne-kadar");
    const hasProdSvc = t.some((x) => PROD_SVC.has(x));
    return hasAnimal && hasPrice && !hasProdSvc && !RETAILER.test(markalarCopy(p));
  });
  assert.ok(candidates.length > 100, `expected a large bird/rabbit price candidate body, got ${candidates.length}`);
  for (const p of candidates) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: bird/rabbit price keyword must state JETGO does not sell live animals`);
  }
});

test("diger: every breed PRICE keyword is truth-safe (cat/dog breed recall)", () => {
  // A breed name is itself a live animal, so a breed + price cue ("kangal fiyatı",
  // "pug fiyatı", "british kedi fiyat") is a live-animal price query and must carry
  // the no-sale disclaimer. Regression guard for two prior bugs: (1) the Turkish
  // k→ğ consonant mutation made "köpeği" (X's dog) never match the literal "köpek",
  // so "kangal köpeği fiyatları" escaped; (2) a bare breed with no generic head
  // ("kangal fiyatı") was not treated as a live subject at all.
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const RETAILER = /Yerel Alternatif/;
  // ASCII slug forms of the cat/dog breeds. Ambiguous city-ish stems (ankara/van)
  // are omitted so the sweep never picks up a non-breed location page.
  const BREED = ["persian","persan","british","scottish","sphynx","maine","coon","ragdoll","tekir","sarman","bengal","labrador","golden","rottweiler","chihuahua","yorkshire","shih","cocker","bulldog","cane","teckel","dachshund","poodle","pomeranian","boxer","german","beagle","husky","retriever","terrier","kangal","akbas","pug"];
  const PRICE = new Set(["fiyat","fiyati","fiyatlari","ucuz"]);
  const PROD_SVC = new Set(["mama","mamasi","mamalari","kumu","kafes","kafesi","kafesli","tasma","tasmasi","yatak","yatagi","minder","oyuncak","sampuan","vitamin","takviye","tarak","firca","kiyafet","canta","kulube","kulubesi","ev","evi","tuvalet","suluk","kab","kabi","macun","malt","catnip","kemik","damla","mineral","aksesuar","malzeme","urun","egitim","egitimi","kuafor","pansiyon","otel","veteriner","merkez","merkezi","gezdirme","tras","yikama","altligi","alisveris","alistirma"]);
  const candidates = DIGER_KEYWORD_PAGES.filter((p) => {
    const t = p.slug.split("-");
    const hasBreed = t.some((x) => BREED.includes(x));
    const hasPrice = t.some((x) => PRICE.has(x)) || p.slug.includes("ne-kadar");
    const hasProdSvc = t.some((x) => PROD_SVC.has(x));
    return hasBreed && hasPrice && !hasProdSvc && !RETAILER.test(markalarCopy(p));
  });
  assert.ok(candidates.length >= 5, `expected a body of breed price candidates, got ${candidates.length}`);
  for (const p of candidates) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: breed price keyword must state JETGO does not sell live animals`);
  }
  // Curated guards for the exact slugs a prior review flagged as leaking.
  for (const slug of ["kangal-fiyati", "kangal-kopegi-fiyatlari", "pug-fiyati"]) {
    const p = digerBySlug.get(slug);
    assert.ok(p, `expected breed keyword "${slug}" in the diger corpus`);
    assert.match(markalarCopy(p!), NO_SALE, `${slug}: breed price query must carry the no-sale disclaimer`);
  }
});

test("diger: service keywords never claim JETGO provides the service", () => {
  // Service pages share the "Pet Shop" metaTitle with info-guides, so key off the
  // explicit assurance the generator emits only for true service keywords.
  const NOT_PROVIDED = /hizmet(i)? (vermez|vermeyiz)|hizmet değil/i;
  const servicePages = DIGER_KEYWORD_PAGES.filter(
    (p) => /JETGO Samsun Pet Shop/.test(p.metaTitle) && NOT_PROVIDED.test(markalarCopy(p)),
  );
  assert.ok(servicePages.length > 20, `expected a body of service pages, got ${servicePages.length}`);
  const PROVIDES = /hizmet(i)? (veriyoruz|sağlıyoruz|sunuyoruz)|eğitim veriyoruz|pansiyonumuz/i;
  for (const p of servicePages) {
    assert.ok(!PROVIDES.test(markalarCopy(p)), `${p.slug}: service page must not claim JETGO provides the service`);
  }
  // A clear service keyword is classified as a service, not a sellable product.
  const egitim = digerBySlug.get("kopek-egitimi");
  if (egitim) assert.match(markalarCopy(egitim), NOT_PROVIDED, "köpek eğitimi must be framed as a service JETGO does not provide");
});

test("diger: retailer keywords position JETGO as a local alternative, never as the marketplace", () => {
  const retail = DIGER_KEYWORD_PAGES.filter((p) => /Yerel Alternatif/i.test(p.metaTitle));
  assert.ok(retail.length > 50, `expected a body of retailer pages, got ${retail.length}`);
  const INDEPENDENT = /bağımsız bir işletme|resmi bir bağlantımız yok/i;
  const AFFILIATED = /resmi (bayi|satıcı|distribütör)|yetkili (bayi|satıcı)/i;
  for (const p of retail.slice(0, 60)) {
    const copy = markalarCopy(p);
    assert.match(copy, INDEPENDENT, `${p.slug}: retailer page must disclaim affiliation with the marketplace`);
    assert.ok(!AFFILIATED.test(copy), `${p.slug}: retailer page must not imply official marketplace affiliation`);
  }
});

test("diger: no page fabricates a concrete price", () => {
  // A fabricated price is a number adjacent to a currency token. Year/size tokens
  // echoed from the keyword (e.g. "fiyat 2020", "15 kg") are NOT prices.
  const PRICE = /\d[\d.,]*\s*(₺|tl\b|lira\b)|₺\s*\d/i;
  const bad = DIGER_KEYWORD_PAGES.filter((p) => PRICE.test(markalarCopy(p)));
  assert.equal(
    bad.length,
    0,
    `pages must not state a concrete price (offenders: ${bad.slice(0, 5).map((p) => p.slug).join(", ")})`,
  );
});

test("diger: a representative page is served only on jetgomarket.com and listed in its sitemap", () => {
  const slug = "kopek-tasmasi";
  const p = digerBySlug.get(slug);
  assert.ok(p, `${slug} must exist in the diger corpus`);
  assert.ok(findSeoPage(slug, JETGO_STORE), `${slug}: must resolve on jetgo`);
  // Siblings now own exclusive corpora over the same diger universe. Every sibling
  // is LOCAL now, so each resolves to its OWN store-scoped localOnly override — and
  // NEVER to jetgo's page.
  const onSiblingLocal = findSeoPage(slug, getStoreByHost(JETGOPET_HOST));
  assert.ok(onSiblingLocal, `${slug}: a sibling local store sharing the ATAKUM universe must serve its own override`);
  assert.equal(onSiblingLocal!.storeId, "jetgopet", `${slug}: a sibling local store must serve ONLY its own page, never jetgo's`);
  assert.equal(onSiblingLocal!.availability, "localOnly", `${slug}: the sibling local override stays localOnly`);
  const onSamsunpet = findSeoPage(slug, getStoreByHost(SAMSUNPET_HOST));
  assert.ok(onSamsunpet, `${slug}: a sibling local store sharing the diger universe must serve its own override`);
  assert.equal(onSamsunpet!.storeId, "samsunpet", `${slug}: a sibling must serve ONLY its own page, never jetgo's`);
  assert.equal(onSamsunpet!.availability, "localOnly", `${slug}: samsunpet's diger override stays localOnly`);
  const jetgoSitemap = new Set(getSitemapPagesForStore(JETGO_STORE).map((q) => q.slug));
  assert.ok(jetgoSitemap.has(slug), `${slug}: jetgo sitemap must list the diger page`);
});

// ---- ATAKUM-ALL brand-new keyword corpus (atakumpetshop.com) ---------------
//
// atakumpetshop.com (store "atakum") additionally publishes a BRAND-NEW slug page
// for every keyword in its own corpus — distinct from the legacy ATAKUM overrides
// (which replace shared slugs) and written to be UNIQUE vs jetgomarket. These are
// LOCAL same-day Atakum/Samsun pages. They must be exclusive to atakum, complete
// for SEO/AI-search, internally consistent, and — critically — truth-safe: live
// animals carry a no-sale disclaimer, services are never claimed as provided,
// retailer queries disclaim affiliation, and no page fabricates a concrete price.
//
// A breed name normally implies a live animal, but a breed-NAMED FOOD SKU
// ("royal canin british shorthair 10 kg") is a product, not a live query, so the
// recall sweeps below subtract a tight food-SKU signal (weight unit or explicit
// food brand) the same way they subtract product/service subjects.

const atakumAllBySlug = new Map(ATAKUM_ALL_EXCLUSIVE_PAGES.map((p) => [p.slug, p] as const));
void atakumAllBySlug;
// slug-form food-SKU signal — pages we deliberately classify as food, not live.
const ATAKUM_ALL_FOOD_SKU = /(^|-)\d+-?(kg|gr|gram|kilo)(-|$)|royal-?can[iı]n|pro-?plan|proplan|hills|farmina|acana|or[iı]jen/;
// Representative real client app routes a generated SEO slug must never shadow.
const RESERVED_APP_SLUGS = new Set([
  "acik-mama","kampanya","veteriner","magaza","blog","petshop","kategori","urun",
  "siparis","odeme","admin","giris","hesabim","favoriler","kayip-ilan","yarisma",
  "sss","kvkk","gizlilik","iletisim","hakkimizda","ozel-patiler","sokak-canlari",
]);

test("atakum-all: a large brand-new keyword corpus is registered, exclusive, and complete", () => {
  assert.ok(
    ATAKUM_ALL_EXCLUSIVE_PAGES.length > 5000,
    `expected a large atakum-all corpus, got ${ATAKUM_ALL_EXCLUSIVE_PAGES.length}`,
  );
  const slugs = ATAKUM_ALL_EXCLUSIVE_PAGES.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, "atakum-all corpus must have unique slugs");
  for (const p of ATAKUM_ALL_EXCLUSIVE_PAGES) {
    assert.equal(p.storeId, "atakum", `${p.slug}: atakum-all page must be storeId atakum`);
    assert.equal(p.availability, "localOnly", `${p.slug}: atakum-all page must be localOnly`);
    assert.equal(p.type, "keyword", `${p.slug}: atakum-all page must be a keyword page`);
    assert.ok(
      p.metaTitle && p.metaDescription && p.h1 &&
      (p.intro ?? []).length && (p.sections ?? []).length &&
      (p.faq ?? []).length && (p.internalLinks ?? []).length,
      `${p.slug}: must carry title/meta/h1 + intro/sections/faq/internalLinks for a substantive AI-search page`,
    );
    // Genuine Atakum first-party content (real NAP phone) — not a brand swap.
    assert.match(markalarCopy(p), /0850 840 39 59/, `${p.slug}: must carry the Atakum NAP phone`);
    // No slug may shadow a real client app route.
    assert.ok(!RESERVED_APP_SLUGS.has(p.slug), `${p.slug}: must not shadow a reserved app route`);
  }
});

test("atakum-all: every internal link resolves within atakum's own slug space", () => {
  const ataSet = availableSlugSet(ATAKUM_STORE);
  let checked = 0;
  for (const p of ATAKUM_ALL_EXCLUSIVE_PAGES) {
    for (const l of p.internalLinks ?? []) {
      const target = (l.href ?? "").replace(/^\//, "");
      if (!target || target.includes("/")) continue; // skip non-flat (parametric) routes
      checked++;
      assert.ok(ataSet.has(target), `${p.slug}: internal link "/${target}" must resolve on atakum`);
    }
  }
  assert.ok(checked > 1000, `expected many internal links to verify, got ${checked}`);
});

test("atakum-all: homepage 'Popüler Atakum Aramaları' links all resolve on atakum", () => {
  const ataSet = availableSlugSet(ATAKUM_STORE);
  assert.ok(ATAKUM_POPULAR_SEARCHES.length > 0, "expected some popular searches");
  for (const l of ATAKUM_POPULAR_SEARCHES) {
    const target = l.href.replace(/^\//, "");
    assert.ok(
      ataSet.has(target),
      `homepage link "${l.href}" (${l.name}) must resolve on atakum`,
    );
  }
});

test("atakum-all: atakum-tagged pages never leak to any other store; overrides stay store-scoped", () => {
  // The atakum corpus is "unique vs jetgomarket" by CONTENT, not by slug: almost
  // every new page reuses a keyword slug jetgo already publishes, but rewrites it
  // with atakum-specific (storeId="atakum") content. The hard invariant is that an
  // atakum-TAGGED page is never served on any other store — the shared slug still
  // resolves elsewhere, but to that store's own (non-atakum) page.
  for (const store of [
    SIBLING_LOCAL_STORE,
    getStoreByHost(JETGOPET_HOST),
    getStoreByHost(JETGOSHOP_HOST),
    JETGO_STORE,
    CARGO_STORE_FOR_ATAKUM,
  ]) {
    const foreign = getSeoPagesForStore(store).filter((p) => p.storeId === "atakum");
    assert.equal(foreign.length, 0, `${store.id}: must not serve any atakum-tagged page`);
  }
  // Override scoping: the SAME slug yields atakum's page on atakum and a DIFFERENT,
  // non-atakum page on jetgo — same URL, store-scoped content, no leak.
  const jetgoSet = availableSlugSet(JETGO_STORE);
  const overridePage = ATAKUM_ALL_EXCLUSIVE_PAGES.find((p) => jetgoSet.has(p.slug));
  assert.ok(overridePage, "expected the atakum corpus to override at least one shared jetgo slug");
  const overrideSlug = overridePage!.slug;
  assert.equal(
    findSeoPage(overrideSlug, ATAKUM_STORE)?.storeId,
    "atakum",
    `${overrideSlug}: atakum must serve its own (atakum-tagged) override`,
  );
  const onJetgo = findSeoPage(overrideSlug, JETGO_STORE);
  assert.ok(onJetgo, `${overrideSlug}: jetgo must still serve its own page at this slug`);
  assert.notEqual(onJetgo!.storeId, "atakum", `${overrideSlug}: jetgo must NOT serve the atakum-tagged page`);
  // Every new atakum slug is an ADDITION vs a clean sibling (jetgopet): absent there.
  const cleanSet = CLEAN_LOCAL_SLUGS;
  for (const p of ATAKUM_ALL_EXCLUSIVE_PAGES) {
    assert.ok(!cleanSet.has(p.slug), `${p.slug}: must be absent from a clean sibling (atakum addition)`);
  }
});

test("atakum-all: the corpus is listed in atakum's sitemap with no foreign exclusives", () => {
  const sm = getSitemapPagesForStore(ATAKUM_STORE);
  const own = sm.filter((p) => p.storeId === "atakum").length;
  assert.ok(own > 5000, `atakum sitemap must list its brand-new exclusives, got ${own}`);
  assert.equal(
    sm.filter((p) => p.storeId && p.storeId !== "atakum").length,
    0,
    "atakum sitemap must not list any foreign store-exclusive page",
  );
});

test("atakum-all: content is independent — metaTitles carry the Atakum brand, never JETGO", () => {
  for (const p of ATAKUM_ALL_EXCLUSIVE_PAGES.slice(0, 200)) {
    assert.match(p.metaTitle, /Atakum Pet Shop/, `${p.slug}: metaTitle must carry the Atakum brand`);
    assert.ok(!/JETGO/i.test(markalarCopy(p)), `${p.slug}: must not leak the JETGO brand`);
  }
  // Distinct metaTitles (human-sounding, not one templated string).
  const titles = new Set(ATAKUM_ALL_EXCLUSIVE_PAGES.map((p) => p.metaTitle));
  assert.ok(titles.size > 5000, `metaTitles must be largely unique, got ${titles.size}`);
});

test("atakum-all: live-animal / breed pages never claim to sell animals", () => {
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const AFFIRM = /sat[ıi]yoruz|satar[ıi]z|satışı yap[ıi]yoruz|satışı yapar[ıi]z|satın alabilirsiniz|canlı hayvan (satıyoruz|satarız|mevcut|stok)/;
  const live = ATAKUM_ALL_EXCLUSIVE_PAGES.filter((p) => /Sahiplenme Rehberi/.test(p.metaTitle));
  assert.ok(live.length > 50, `expected a body of live-animal pages, got ${live.length}`);
  for (const p of live) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: live page must state atakum does not sell live animals`);
    assert.ok(!AFFIRM.test(digerBody(p)), `${p.slug}: live page must not affirmatively offer animals for sale`);
  }
});

test("atakum-all: every live-animal acquisition KEYWORD is truth-safe (broad slug-derived recall)", () => {
  // Independent recall guard derived from slug tokens (not the emitted metaTitle):
  // any keyword pairing a live animal with an acquisition cue — and no tangible
  // product/service subject and no food-SKU signal — must carry the no-sale line.
  const ANIMAL_STEM = ["kedi","kopek","yavru","kitten","puppy","muhabbet","kanarya","papagan","sultan","paraket","finch","ispinoz","saka","kus","tavsan","hamster","ginepig","gine","kemirgen","sinsilla","gerbil","fare","sican","balik","lepistes","moli","melek","japon","kaplumbaga","iguana","gekko","yilan","surungen"];
  const CUE = new Set(["canli","satilik","satlik","satis","satisi","satan","satanlar","satilan","satma","sat","satin","sahiplen","sahiplendirme","almak","alma","alinir","alan","alanlar","alici","alicisi","bedava","ucretsiz","sahibinden"]);
  const PROD_SVC = new Set(["ev","evi","kum","kumu","yag","yagi","otu","kab","kabi","yem","yemi","kafes","kafesi","mama","mamasi","tasma","tuvalet","kemik","gaga","tuy","catnip","nane","zehir","kapan","damla","minder","yatak","suluk","oyuncak","oyun","alani","alanlari","vitamin","vitaminler","sampuan","tarak","firca","kiyafet","canta","tasima","kulube","kulubesi","kumes","mineral","file","aksesuar","malzeme","urun","isimlik","egitim","egitimi","kuafor","pansiyon","otel","veteriner","merkez","merkezi","gezdirme","kosum","macun","malt","altligi","alisveris","alisverisi","alistirma","aliskin"]);
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const AFFIRM = /sat[ıi]yoruz|satar[ıi]z|satışı yap[ıi]yoruz|satışı yapar[ıi]z|satın alabilirsiniz|canlı hayvan (satıyoruz|satarız|mevcut|stok)/;
  const candidates = ATAKUM_ALL_EXCLUSIVE_PAGES.filter((p) => {
    const t = p.slug.split("-");
    const hasAnimal = t.some((x) => ANIMAL_STEM.some((a) => x.startsWith(a)));
    const hasCue = t.some((x) => CUE.has(x));
    const hasProdSvc = t.some((x) => PROD_SVC.has(x));
    return hasAnimal && hasCue && !hasProdSvc && !ATAKUM_ALL_FOOD_SKU.test(p.slug);
  });
  assert.ok(candidates.length > 100, `expected a large live-sale candidate body, got ${candidates.length}`);
  for (const p of candidates) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: live-sale keyword must state atakum does not sell live animals`);
    assert.ok(!AFFIRM.test(digerBody(p)), `${p.slug}: live-sale keyword must not affirmatively offer animals for sale`);
  }
});

test("atakum-all: every bird/rabbit PRICE keyword is truth-safe (broad slug-derived recall)", () => {
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const RETAILER = /Yerel Alternatif/;
  const BIRD_RABBIT = ["muhabbet","papagan","sultan","kanarya","paraket","finch","ispinoz","saka","kus","kakadu","kakariki","jako","forpus","sevda","cennet","tavsan"];
  const PRICE = new Set(["fiyat","fiyati","fiyatlari","ucuz"]);
  const PROD_SVC = new Set(["yem","yemi","yemlik","kafes","kafesi","kafesli","folluk","yumurtalik","suluk","sulugu","kumes","kumesi","kulube","kulubesi","tasma","tasmasi","oyuncak","oyun","vitamin","takviye","takim","mama","mamasi","mamalari","gaga","tuy","isimlik","aksesuar","malzeme","urun","mineral","file","kum","kumu","tuvalet","tuvaleti","kulucka","korse","agizlik","ev","evi","koruyucu","yara","sok","akilli","alani","alanlari","alistirma","alisveris","alisverisi","egitim","egitimi","kuafor","pansiyon","veteriner","merkez","merkezi","gezdirme","tras","yikama","altligi"]);
  const candidates = ATAKUM_ALL_EXCLUSIVE_PAGES.filter((p) => {
    const t = p.slug.split("-");
    const hasAnimal = t.some((x) => BIRD_RABBIT.some((a) => x.startsWith(a)));
    const hasPrice = t.some((x) => PRICE.has(x)) || p.slug.includes("ne-kadar");
    const hasProdSvc = t.some((x) => PROD_SVC.has(x));
    return hasAnimal && hasPrice && !hasProdSvc && !ATAKUM_ALL_FOOD_SKU.test(p.slug) && !RETAILER.test(markalarCopy(p));
  });
  assert.ok(candidates.length > 100, `expected a large bird/rabbit price candidate body, got ${candidates.length}`);
  for (const p of candidates) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: bird/rabbit price keyword must state atakum does not sell live animals`);
  }
});

test("atakum-all: every breed PRICE keyword is truth-safe; breed-named FOOD SKUs stay product", () => {
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const RETAILER = /Yerel Alternatif/;
  const BREED = ["persian","persan","british","scottish","sphynx","maine","coon","ragdoll","tekir","sarman","bengal","labrador","golden","rottweiler","chihuahua","yorkshire","shih","cocker","bulldog","cane","teckel","dachshund","poodle","pomeranian","boxer","german","beagle","husky","retriever","terrier","kangal","akbas","pug"];
  const PRICE = new Set(["fiyat","fiyati","fiyatlari","ucuz"]);
  const PROD_SVC = new Set(["mama","mamasi","mamalari","kumu","kafes","kafesi","kafesli","tasma","tasmasi","yatak","yatagi","minder","oyuncak","sampuan","vitamin","takviye","tarak","firca","kiyafet","canta","kulube","kulubesi","ev","evi","tuvalet","suluk","kab","kabi","macun","malt","catnip","kemik","damla","mineral","aksesuar","malzeme","urun","egitim","egitimi","kuafor","pansiyon","otel","veteriner","merkez","merkezi","gezdirme","tras","yikama","altligi","alisveris","alistirma"]);
  // Live breed-price candidates (food SKUs subtracted) must carry the no-sale line.
  const candidates = ATAKUM_ALL_EXCLUSIVE_PAGES.filter((p) => {
    const t = p.slug.split("-");
    const hasBreed = t.some((x) => BREED.includes(x));
    const hasPrice = t.some((x) => PRICE.has(x)) || p.slug.includes("ne-kadar");
    const hasProdSvc = t.some((x) => PROD_SVC.has(x));
    return hasBreed && hasPrice && !hasProdSvc && !ATAKUM_ALL_FOOD_SKU.test(p.slug) && !RETAILER.test(markalarCopy(p));
  });
  assert.ok(candidates.length >= 5, `expected a body of breed price candidates, got ${candidates.length}`);
  for (const p of candidates) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: breed price keyword must state atakum does not sell live animals`);
  }
  // The inverse: a breed-NAMED food SKU ("royal canin british shorthair …") is a
  // product, so it must NOT carry the (off-topic) live no-sale disclaimer.
  const foodBreed = ATAKUM_ALL_EXCLUSIVE_PAGES.filter(
    (p) => ATAKUM_ALL_FOOD_SKU.test(p.slug) && /(british|scottish|persian|persan|golden|labrador|terrier|retriever|bulldog|shorthair|pug|yorkshire)/.test(p.slug),
  );
  assert.ok(foodBreed.length > 0, "expected some breed-named food SKUs in the corpus");
  for (const p of foodBreed) {
    assert.ok(!NO_SALE.test(markalarCopy(p)), `${p.slug}: breed-named food SKU must NOT be framed as a live-animal no-sale page`);
  }
});

test("atakum-all: service keywords never claim atakum provides the service", () => {
  const NOT_PROVIDED = /hizmet(i)? (vermez|vermeyiz)|hizmet değil/i;
  const PROVIDES = /hizmet(i)? (veriyoruz|sağlıyoruz|sunuyoruz)|eğitim veriyoruz|pansiyonumuz/i;
  const servicePages = ATAKUM_ALL_EXCLUSIVE_PAGES.filter(
    (p) => /Bilgilendirme/.test(p.metaTitle) && NOT_PROVIDED.test(markalarCopy(p)),
  );
  assert.ok(servicePages.length > 20, `expected a body of service pages, got ${servicePages.length}`);
  for (const p of servicePages) {
    assert.ok(!PROVIDES.test(markalarCopy(p)), `${p.slug}: service page must not claim atakum provides the service`);
  }
});

test("atakum-all: retailer keywords position atakum as a local alternative, never as the marketplace", () => {
  const INDEPENDENT = /bağımsız bir işletme|resmi bir bağlantımız yok/i;
  const AFFILIATED = /resmi (bayi|satıcı|distribütör)|yetkili (bayi|satıcı)/i;
  const retail = ATAKUM_ALL_EXCLUSIVE_PAGES.filter((p) => /Yerel Alternatif/i.test(p.metaTitle));
  assert.ok(retail.length > 50, `expected a body of retailer pages, got ${retail.length}`);
  for (const p of retail) {
    const copy = markalarCopy(p);
    assert.match(copy, INDEPENDENT, `${p.slug}: retailer page must disclaim affiliation with the marketplace`);
    assert.ok(!AFFILIATED.test(copy), `${p.slug}: retailer page must not imply official marketplace affiliation`);
  }
});

test("atakum-all: no page fabricates a concrete price", () => {
  const PRICE = /\d[\d.,]*\s*(₺|tl\b|lira\b)|₺\s*\d/i;
  const bad = ATAKUM_ALL_EXCLUSIVE_PAGES.filter((p) => PRICE.test(markalarCopy(p)));
  assert.equal(
    bad.length,
    0,
    `pages must not state a concrete price (offenders: ${bad.slice(0, 5).map((p) => p.slug).join(", ")})`,
  );
});

// ===========================================================================
// jetgo.shop (storeId "jetgoshop") — the 6th SEO keyword corpus.
//
// A LOCAL same-day Samsun pet shop that SHARES the JETGO brand with
// jetgomarket.com. Built from the SAME keyword file as atakum-all, but with
// wholly fresh copy banks: it must be UNIQUE-by-CONTENT (distinct prose,
// structure, FAQ and section order) versus jetgomarket.com AND versus the
// atakum-all corpus — NOT a brand/NAP swap. Because the JETGO brand is shared
// (by design), the uniqueness invariant is on the PROSE, not the brand token.
// ===========================================================================
const JETGOSHOP_STORE = getStoreByHost(JETGOSHOP_HOST);
// Retailer-intent pages are identified by their (exclusive) metaTitle marker.
const JETGOSHOP_RETAILER_MARK = /Yerel Seçenek/;

test("jetgoshop-all: a large keyword corpus is registered, exclusive, and complete", () => {
  assert.ok(
    JETGOSHOP_ALL_EXCLUSIVE_PAGES.length > 5000,
    `expected a large jetgoshop-all corpus, got ${JETGOSHOP_ALL_EXCLUSIVE_PAGES.length}`,
  );
  const slugs = JETGOSHOP_ALL_EXCLUSIVE_PAGES.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, "jetgoshop-all corpus must have unique slugs");
  for (const p of JETGOSHOP_ALL_EXCLUSIVE_PAGES) {
    assert.equal(p.storeId, "jetgoshop", `${p.slug}: jetgoshop-all page must be storeId jetgoshop`);
    assert.equal(p.availability, "localOnly", `${p.slug}: jetgoshop-all page must be localOnly`);
    assert.equal(p.type, "keyword", `${p.slug}: jetgoshop-all page must be a keyword page`);
    assert.ok(
      p.metaTitle && p.metaDescription && p.h1 &&
      (p.intro ?? []).length && (p.sections ?? []).length &&
      (p.faq ?? []).length && (p.internalLinks ?? []).length,
      `${p.slug}: must carry title/meta/h1 + intro/sections/faq/internalLinks for a substantive AI-search page`,
    );
    // Genuine jetgo.shop first-party content (real NAP phone) — not a brand swap.
    assert.match(markalarCopy(p), /0850 840 39 59/, `${p.slug}: must carry the jetgo.shop NAP phone`);
    // No slug may shadow a real client app route.
    assert.ok(!RESERVED_APP_SLUGS.has(p.slug), `${p.slug}: must not shadow a reserved app route`);
  }
});

test("jetgoshop-all: noise keywords are skipped and the rest are registered", () => {
  assert.ok(JETGOSHOP_ALL_SKIPPED_NOISE > 0, "expected some noise keywords (e.g. Spanish 'buscar') to be skipped");
  assert.ok(
    JETGOSHOP_ALL_KEYWORD_PAGES.length >= JETGOSHOP_ALL_EXCLUSIVE_PAGES.length,
    "generated pages must be a superset of the registered exclusive corpus (curated collisions dropped)",
  );
});

test("jetgoshop-all: every internal link resolves within jetgo.shop's own slug space", () => {
  const shopSet = availableSlugSet(JETGOSHOP_STORE);
  let checked = 0;
  for (const p of JETGOSHOP_ALL_EXCLUSIVE_PAGES) {
    for (const l of p.internalLinks ?? []) {
      const target = (l.href ?? "").replace(/^\//, "");
      if (!target || target.includes("/")) continue; // skip non-flat (parametric) routes
      checked++;
      assert.ok(shopSet.has(target), `${p.slug}: internal link "/${target}" must resolve on jetgo.shop`);
    }
  }
  assert.ok(checked > 1000, `expected many internal links to verify, got ${checked}`);
});

test("jetgoshop-all: jetgoshop-tagged pages never leak to any other store; overrides stay store-scoped", () => {
  for (const store of [
    JETGO_STORE,
    SIBLING_LOCAL_STORE,
    getStoreByHost(JETGOPET_HOST),
    ATAKUM_STORE,
    CARGO_STORE_FOR_ATAKUM,
  ]) {
    const foreign = getSeoPagesForStore(store).filter((p) => p.storeId === "jetgoshop");
    assert.equal(foreign.length, 0, `${store.id}: must not serve any jetgoshop-tagged page`);
  }
  // Override scoping: the SAME slug yields jetgoshop's page on jetgo.shop and a
  // DIFFERENT, non-jetgoshop page on jetgomarket — same URL, store-scoped content.
  const jetgoSet = availableSlugSet(JETGO_STORE);
  const overridePage = JETGOSHOP_ALL_EXCLUSIVE_PAGES.find((p) => jetgoSet.has(p.slug));
  assert.ok(overridePage, "expected the jetgoshop corpus to override at least one shared jetgo slug");
  const overrideSlug = overridePage!.slug;
  assert.equal(
    findSeoPage(overrideSlug, JETGOSHOP_STORE)?.storeId,
    "jetgoshop",
    `${overrideSlug}: jetgo.shop must serve its own (jetgoshop-tagged) override`,
  );
  const onJetgo = findSeoPage(overrideSlug, JETGO_STORE);
  assert.ok(onJetgo, `${overrideSlug}: jetgomarket must still serve its own page at this slug`);
  assert.notEqual(onJetgo!.storeId, "jetgoshop", `${overrideSlug}: jetgomarket must NOT serve the jetgoshop-tagged page`);
  // Every BRAND-NEW jetgoshop slug is an addition vs a clean sibling (jetgopet).
  const cleanSet = CLEAN_LOCAL_SLUGS;
  let brandNew = 0;
  for (const p of JETGOSHOP_ALL_EXCLUSIVE_PAGES) {
    if (!jetgoSet.has(p.slug)) {
      assert.ok(!cleanSet.has(p.slug), `${p.slug}: a brand-new jetgoshop slug must be absent from a clean sibling`);
      brandNew++;
    }
  }
  assert.ok(brandNew > 0, "expected at least some brand-new jetgoshop slugs");
});

test("jetgoshop-all: the corpus is listed in jetgo.shop's sitemap with no foreign exclusives", () => {
  const sm = getSitemapPagesForStore(JETGOSHOP_STORE);
  const own = sm.filter((p) => p.storeId === "jetgoshop").length;
  assert.ok(own > 5000, `jetgo.shop sitemap must list its own exclusives, got ${own}`);
  assert.equal(
    sm.filter((p) => p.storeId && p.storeId !== "jetgoshop").length,
    0,
    "jetgo.shop sitemap must not list any foreign store-exclusive page",
  );
});

test("jetgoshop-all: content is UNIQUE-by-CONTENT vs jetgomarket.com (shared brand, distinct prose)", () => {
  // The JETGO brand is shared by design, so the metaTitle carries it.
  for (const p of JETGOSHOP_ALL_EXCLUSIVE_PAGES.slice(0, 200)) {
    assert.match(p.metaTitle, /JETGO Pet Shop/, `${p.slug}: metaTitle must carry the shared JETGO Pet Shop brand`);
  }
  // Distinct metaTitles (human-sounding, not one templated string).
  const titles = new Set(JETGOSHOP_ALL_EXCLUSIVE_PAGES.map((p) => p.metaTitle));
  assert.ok(titles.size > 5000, `metaTitles must be largely unique, got ${titles.size}`);

  // At a SHARED slug, jetgo.shop and jetgomarket serve DIFFERENT pages: distinct
  // metaTitle + h1 + body. Same URL, store-scoped content — never a brand/NAP swap.
  const jetgoSet = availableSlugSet(JETGO_STORE);
  const overrides = JETGOSHOP_ALL_EXCLUSIVE_PAGES.filter((p) => jetgoSet.has(p.slug));
  assert.ok(overrides.length > 100, `expected jetgoshop to override many shared jetgo slugs, got ${overrides.length}`);
  let compared = 0;
  for (const p of overrides.slice(0, 300)) {
    const onJetgo = findSeoPage(p.slug, JETGO_STORE)!;
    assert.notEqual(onJetgo.storeId, "jetgoshop", `${p.slug}: jetgomarket must serve its OWN page, not the jetgoshop one`);
    assert.notEqual(p.metaTitle, onJetgo.metaTitle, `${p.slug}: metaTitle must differ from jetgomarket`);
    assert.notEqual(p.h1, onJetgo.h1, `${p.slug}: h1 must differ from jetgomarket`);
    assert.notEqual(markalarCopy(p), markalarCopy(onJetgo), `${p.slug}: body must differ from jetgomarket`);
    compared++;
  }
  assert.ok(compared > 100, `expected many jetgomarket comparisons, got ${compared}`);
});

test("jetgoshop-all: content is UNIQUE-by-CONTENT vs the atakum-all corpus (distinct copy banks)", () => {
  const ataBySlug = new Map(ATAKUM_ALL_EXCLUSIVE_PAGES.map((p) => [p.slug, p] as const));
  let compared = 0;
  for (const p of JETGOSHOP_ALL_EXCLUSIVE_PAGES) {
    const ata = ataBySlug.get(p.slug);
    if (!ata) continue;
    assert.notEqual(p.metaTitle, ata.metaTitle, `${p.slug}: metaTitle must differ from atakum`);
    assert.notEqual(markalarCopy(p), markalarCopy(ata), `${p.slug}: body must differ from atakum`);
    compared++;
    if (compared >= 300) break;
  }
  assert.ok(compared > 100, `expected many atakum comparisons, got ${compared}`);
});

test("jetgoshop-all: live-animal / breed pages never claim to sell animals", () => {
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const AFFIRM = /sat[ıi]yoruz|satar[ıi]z|satışı yap[ıi]yoruz|satışı yapar[ıi]z|satın alabilirsiniz|canlı hayvan (satıyoruz|satarız|mevcut|stok)/;
  const live = JETGOSHOP_ALL_EXCLUSIVE_PAGES.filter((p) => /Sorumlu Sahiplenme/.test(p.metaTitle));
  assert.ok(live.length > 50, `expected a body of live-animal pages, got ${live.length}`);
  for (const p of live) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: live page must state jetgo.shop does not sell live animals`);
    assert.ok(!AFFIRM.test(digerBody(p)), `${p.slug}: live page must not affirmatively offer animals for sale`);
  }
});

test("jetgoshop-all: every live-animal acquisition KEYWORD is truth-safe (broad slug-derived recall)", () => {
  const ANIMAL_STEM = ["kedi","kopek","yavru","kitten","puppy","muhabbet","kanarya","papagan","sultan","paraket","finch","ispinoz","saka","kus","tavsan","hamster","ginepig","gine","kemirgen","sinsilla","gerbil","fare","sican","balik","lepistes","moli","melek","japon","kaplumbaga","iguana","gekko","yilan","surungen"];
  const CUE = new Set(["canli","satilik","satlik","satis","satisi","satan","satanlar","satilan","satma","sat","satin","sahiplen","sahiplendirme","almak","alma","alinir","alan","alanlar","alici","alicisi","bedava","ucretsiz","sahibinden"]);
  const PROD_SVC = new Set(["ev","evi","kum","kumu","yag","yagi","otu","kab","kabi","yem","yemi","kafes","kafesi","mama","mamasi","tasma","tuvalet","kemik","gaga","tuy","catnip","nane","zehir","kapan","damla","minder","yatak","suluk","oyuncak","oyun","alani","alanlari","vitamin","vitaminler","sampuan","tarak","firca","kiyafet","canta","tasima","kulube","kulubesi","kumes","mineral","file","aksesuar","malzeme","urun","isimlik","egitim","egitimi","kuafor","pansiyon","otel","veteriner","merkez","merkezi","gezdirme","kosum","macun","malt","altligi","alisveris","alisverisi","alistirma","aliskin"]);
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const AFFIRM = /sat[ıi]yoruz|satar[ıi]z|satışı yap[ıi]yoruz|satışı yapar[ıi]z|satın alabilirsiniz|canlı hayvan (satıyoruz|satarız|mevcut|stok)/;
  const candidates = JETGOSHOP_ALL_EXCLUSIVE_PAGES.filter((p) => {
    const t = p.slug.split("-");
    const hasAnimal = t.some((x) => ANIMAL_STEM.some((a) => x.startsWith(a)));
    const hasCue = t.some((x) => CUE.has(x));
    const hasProdSvc = t.some((x) => PROD_SVC.has(x));
    return hasAnimal && hasCue && !hasProdSvc && !ATAKUM_ALL_FOOD_SKU.test(p.slug);
  });
  assert.ok(candidates.length > 100, `expected a large live-sale candidate body, got ${candidates.length}`);
  for (const p of candidates) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: live-sale keyword must state jetgo.shop does not sell live animals`);
    assert.ok(!AFFIRM.test(digerBody(p)), `${p.slug}: live-sale keyword must not affirmatively offer animals for sale`);
  }
});

test("jetgoshop-all: every bird/rabbit PRICE keyword is truth-safe (broad slug-derived recall)", () => {
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const BIRD_RABBIT = ["muhabbet","papagan","sultan","kanarya","paraket","finch","ispinoz","saka","kus","kakadu","kakariki","jako","forpus","sevda","cennet","tavsan"];
  const PRICE = new Set(["fiyat","fiyati","fiyatlari","ucuz"]);
  const PROD_SVC = new Set(["yem","yemi","yemlik","kafes","kafesi","kafesli","folluk","yumurtalik","suluk","sulugu","kumes","kumesi","kulube","kulubesi","tasma","tasmasi","oyuncak","oyun","vitamin","takviye","takim","mama","mamasi","mamalari","gaga","tuy","isimlik","aksesuar","malzeme","urun","mineral","file","kum","kumu","tuvalet","tuvaleti","kulucka","korse","agizlik","ev","evi","koruyucu","yara","sok","akilli","alani","alanlari","alistirma","alisveris","alisverisi","egitim","egitimi","kuafor","pansiyon","veteriner","merkez","merkezi","gezdirme","tras","yikama","altligi"]);
  const candidates = JETGOSHOP_ALL_EXCLUSIVE_PAGES.filter((p) => {
    const t = p.slug.split("-");
    const hasAnimal = t.some((x) => BIRD_RABBIT.some((a) => x.startsWith(a)));
    const hasPrice = t.some((x) => PRICE.has(x)) || p.slug.includes("ne-kadar");
    const hasProdSvc = t.some((x) => PROD_SVC.has(x));
    return hasAnimal && hasPrice && !hasProdSvc && !ATAKUM_ALL_FOOD_SKU.test(p.slug) && !JETGOSHOP_RETAILER_MARK.test(p.metaTitle);
  });
  assert.ok(candidates.length > 100, `expected a large bird/rabbit price candidate body, got ${candidates.length}`);
  for (const p of candidates) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: bird/rabbit price keyword must state jetgo.shop does not sell live animals`);
  }
});

test("jetgoshop-all: every breed PRICE keyword is truth-safe; breed-named FOOD SKUs stay product", () => {
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const BREED = ["persian","persan","british","scottish","sphynx","maine","coon","ragdoll","tekir","sarman","bengal","labrador","golden","rottweiler","chihuahua","yorkshire","shih","cocker","bulldog","cane","teckel","dachshund","poodle","pomeranian","boxer","german","beagle","husky","retriever","terrier","kangal","akbas","pug"];
  const PRICE = new Set(["fiyat","fiyati","fiyatlari","ucuz"]);
  const PROD_SVC = new Set(["mama","mamasi","mamalari","kumu","kafes","kafesi","kafesli","tasma","tasmasi","yatak","yatagi","minder","oyuncak","sampuan","vitamin","takviye","tarak","firca","kiyafet","canta","kulube","kulubesi","ev","evi","tuvalet","suluk","kab","kabi","macun","malt","catnip","kemik","damla","mineral","aksesuar","malzeme","urun","egitim","egitimi","kuafor","pansiyon","otel","veteriner","merkez","merkezi","gezdirme","tras","yikama","altligi","alisveris","alistirma"]);
  const candidates = JETGOSHOP_ALL_EXCLUSIVE_PAGES.filter((p) => {
    const t = p.slug.split("-");
    const hasBreed = t.some((x) => BREED.includes(x));
    const hasPrice = t.some((x) => PRICE.has(x)) || p.slug.includes("ne-kadar");
    const hasProdSvc = t.some((x) => PROD_SVC.has(x));
    return hasBreed && hasPrice && !hasProdSvc && !ATAKUM_ALL_FOOD_SKU.test(p.slug) && !JETGOSHOP_RETAILER_MARK.test(p.metaTitle);
  });
  assert.ok(candidates.length >= 5, `expected a body of breed price candidates, got ${candidates.length}`);
  for (const p of candidates) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: breed price keyword must state jetgo.shop does not sell live animals`);
  }
  // The inverse: a breed-NAMED food SKU is a product, never a live no-sale page.
  const foodBreed = JETGOSHOP_ALL_EXCLUSIVE_PAGES.filter(
    (p) => ATAKUM_ALL_FOOD_SKU.test(p.slug) && /(british|scottish|persian|persan|golden|labrador|terrier|retriever|bulldog|shorthair|pug|yorkshire)/.test(p.slug),
  );
  assert.ok(foodBreed.length > 0, "expected some breed-named food SKUs in the corpus");
  for (const p of foodBreed) {
    assert.ok(!NO_SALE.test(markalarCopy(p)), `${p.slug}: breed-named food SKU must NOT be framed as a live-animal no-sale page`);
  }
});

test("jetgoshop-all: service keywords never claim jetgo.shop provides the service", () => {
  const NOT_PROVIDED = /hizmet(i)? (vermiyoruz|vermez|vermeyiz)|hizmet değil/i;
  const PROVIDES = /hizmet(i)? (veriyoruz|sağlıyoruz|sunuyoruz)|eğitim veriyoruz|pansiyonumuz/i;
  const servicePages = JETGOSHOP_ALL_EXCLUSIVE_PAGES.filter(
    (p) => /Bilgilendirme/.test(p.metaTitle) && NOT_PROVIDED.test(markalarCopy(p)),
  );
  assert.ok(servicePages.length > 20, `expected a body of service pages, got ${servicePages.length}`);
  for (const p of servicePages) {
    assert.ok(!PROVIDES.test(markalarCopy(p)), `${p.slug}: service page must not claim jetgo.shop provides the service`);
  }
});

test("jetgoshop-all: retailer keywords position jetgo.shop as a local alternative, never the marketplace", () => {
  const INDEPENDENT = /bağımsız bir işletme|resmi bir bağlantımız yok/i;
  const AFFILIATED = /resmi (bayi|satıcı|distribütör)|yetkili (bayi|satıcı)/i;
  const retail = JETGOSHOP_ALL_EXCLUSIVE_PAGES.filter((p) => JETGOSHOP_RETAILER_MARK.test(p.metaTitle));
  assert.ok(retail.length > 50, `expected a body of retailer pages, got ${retail.length}`);
  for (const p of retail) {
    const copy = markalarCopy(p);
    assert.match(copy, INDEPENDENT, `${p.slug}: retailer page must disclaim affiliation with the marketplace`);
    assert.ok(!AFFILIATED.test(copy), `${p.slug}: retailer page must not imply official marketplace affiliation`);
  }
});

test("jetgoshop-all: 24-hour / late-night keywords carry a truthful hours disclaimer", () => {
  // The shared keyword file holds very few always-open intents, but whenever a page
  // DOES surface the "7/24 açık mı?" FAQ it must answer truthfully (no 24/7 claim).
  const candidates = JETGOSHOP_ALL_EXCLUSIVE_PAGES.filter(
    (p) => (p.faq ?? []).some((f) => /7\/24 açık mı/.test(f.q)),
  );
  assert.ok(candidates.length >= 1, `expected at least one 24h/late-night keyword page, got ${candidates.length}`);
  for (const p of candidates) {
    const ans = (p.faq ?? []).find((f) => /7\/24 açık mı/.test(f.q))!.a;
    assert.match(ans, /7\/24 ya da gece açık değildir/, `${p.slug}: must not claim to be open 24/7`);
    assert.ok(ans.includes("09:00–21:00"), `${p.slug}: must state the real opening hours`);
  }
});

test("jetgoshop-all: no page fabricates a concrete price", () => {
  const PRICE = /\d[\d.,]*\s*(₺|tl\b|lira\b)|₺\s*\d/i;
  const bad = JETGOSHOP_ALL_EXCLUSIVE_PAGES.filter((p) => PRICE.test(markalarCopy(p)));
  assert.equal(
    bad.length,
    0,
    `pages must not state a concrete price (offenders: ${bad.slice(0, 5).map((p) => p.slug).join(", ")})`,
  );
});

test("jetgoshop-all: SSR serves jetgo.shop's bespoke content, self-canonical, differs from jetgomarket", async () => {
  const jetgoSet = availableSlugSet(JETGO_STORE);
  const overrideSlug = JETGOSHOP_ALL_EXCLUSIVE_PAGES.find((p) => jetgoSet.has(p.slug))!.slug;
  const shopPage = findSeoPage(overrideSlug, JETGOSHOP_STORE)!;
  assert.equal(shopPage.storeId, "jetgoshop", "jetgo.shop must serve its own store-scoped override");

  const shopHtml = await injectAllMeta(INDEX_HTML, `/${overrideSlug}`, JETGOSHOP_HOST);
  const shopTitle = shopHtml.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const shopCanon = shopHtml.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? "";
  assert.equal(
    shopTitle,
    escapeHtmlForTest(brandifyFor(JETGOSHOP_STORE, shopPage.metaTitle)),
    "jetgo.shop SSR <title> must be its own brandified metaTitle",
  );
  assert.equal(shopCanon, `${JETGOSHOP_STORE.domain}/${overrideSlug}`, "jetgo.shop SSR canonical must bind to jetgo.shop");

  // The SAME slug on jetgomarket.com → a DIFFERENT title (jetgo's own page),
  // self-canonical to jetgomarket. No JETGO-domain cross-leak in either direction.
  const jetgoHtml = await injectAllMeta(INDEX_HTML, `/${overrideSlug}`, JETGO_HOST);
  const jetgoTitle = jetgoHtml.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const jetgoCanon = jetgoHtml.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? "";
  assert.notEqual(shopTitle, jetgoTitle, "jetgo.shop title must differ from jetgomarket at the same slug");
  assert.equal(jetgoCanon, `${JETGO_STORE.domain}/${overrideSlug}`, "jetgomarket canonical must bind to jetgomarket");
  assert.ok(!shopCanon.includes(JETGO_STORE.domain), "jetgo.shop canonical must not leak the jetgomarket domain");
});

// ===========================================================================
// JETGO PET broad keyword corpus (jetgo.pet, store id "jetgopet") — the 8th
// corpus and the SECOND of the JETGO trio to own one. jetgo.pet is a LOCAL
// same-day store that shares the "JETGO Pet Shop" brand WORD with jetgomarket.com
// AND consumes the IDENTICAL ATAKUM keyword universe as the jetgoshop-all and
// atakum-all corpora, so it CANNOT differ by facts or slugs. The uniqueness
// invariant is therefore wholly on the PROSE: the corpus must read distinct from
//   • the SHARED jetgomarket.com keyword pages,
//   • the atakum-all corpus (atakumpetshop.com, "Atakum Pet Shop"), AND
//   • the jetgoshop-all corpus (jetgo.shop) — its same-universe local sibling.
// ===========================================================================
const JETGOPET_STORE = getStoreByHost(JETGOPET_HOST);
// Intent pages are identified by their (exclusive) metaTitle markers — chosen to
// differ from the sibling local corpora (jetgoshop "Sorumlu Sahiplenme"/"Yerel
// Seçenek"/"Bilgilendirme", atakum "Sahiplenme Rehberi"/"Yerel Alternatif"/
// "Bilgilendirme").
const JETGOPET_LIVE_MARK = /Bilinçli Sahiplenme/;
const JETGOPET_RETAILER_MARK = /Yerel Adres/;
const JETGOPET_SERVICE_MARK = /Kısa Bilgi Notu/;

test("jetgopet-all: a large keyword corpus is registered, exclusive, and complete", () => {
  assert.ok(
    JETGOPET_ALL_EXCLUSIVE_PAGES.length > 5000,
    `expected a large jetgopet-all corpus, got ${JETGOPET_ALL_EXCLUSIVE_PAGES.length}`,
  );
  const slugs = JETGOPET_ALL_EXCLUSIVE_PAGES.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, "jetgopet-all corpus must have unique slugs");
  for (const p of JETGOPET_ALL_EXCLUSIVE_PAGES) {
    assert.equal(p.storeId, "jetgopet", `${p.slug}: jetgopet-all page must be storeId jetgopet`);
    assert.equal(p.availability, "localOnly", `${p.slug}: jetgopet-all page must be localOnly`);
    assert.equal(p.type, "keyword", `${p.slug}: jetgopet-all page must be a keyword page`);
    assert.ok(
      p.metaTitle && p.metaDescription && p.h1 &&
      (p.intro ?? []).length && (p.sections ?? []).length &&
      (p.faq ?? []).length && (p.internalLinks ?? []).length,
      `${p.slug}: must carry title/meta/h1 + intro/sections/faq/internalLinks for a substantive AI-search page`,
    );
    // Genuine jetgo.pet first-party content (real NAP phone) — not a brand swap.
    assert.match(markalarCopy(p), /0850 840 39 59/, `${p.slug}: must carry the jetgo.pet NAP phone`);
    // No slug may shadow a real client app route.
    assert.ok(!RESERVED_APP_SLUGS.has(p.slug), `${p.slug}: must not shadow a reserved app route`);
  }
});

test("jetgopet-all: noise keywords are skipped and the rest are registered", () => {
  assert.ok(JETGOPET_ALL_SKIPPED_NOISE > 0, "expected some noise keywords (e.g. Spanish 'buscar') to be skipped");
  assert.ok(
    JETGOPET_ALL_KEYWORD_PAGES.length >= JETGOPET_ALL_EXCLUSIVE_PAGES.length,
    "generated pages must be a superset of the registered exclusive corpus (curated collisions dropped)",
  );
});

test("jetgopet-all: every internal link resolves within jetgo.pet's own slug space", () => {
  const petSet = availableSlugSet(JETGOPET_STORE);
  let checked = 0;
  for (const p of JETGOPET_ALL_EXCLUSIVE_PAGES) {
    for (const l of p.internalLinks ?? []) {
      const target = (l.href ?? "").replace(/^\//, "");
      if (!target || target.includes("/")) continue; // skip non-flat (parametric) routes
      checked++;
      assert.ok(petSet.has(target), `${p.slug}: internal link "/${target}" must resolve on jetgo.pet`);
    }
  }
  assert.ok(checked > 1000, `expected many internal links to verify, got ${checked}`);
});

test("jetgopet-all: jetgopet-tagged pages never leak to any other store; overrides stay store-scoped", () => {
  for (const store of [
    getStoreByHost(JETGO_HOST),
    getStoreByHost(JETGOSHOP_HOST),
    getStoreByHost(ATAKUMBIZ_HOST),
    getStoreByHost(ATAKUM_HOST),
    getStoreByHost(SAMSUN_HOST),
    getStoreByHost(SAMSUNPET_HOST),
    getStoreByHost(KARADENIZ_HOST),
    getStoreByHost(MARKAPET_HOST),
  ]) {
    const foreign = getSeoPagesForStore(store).filter((p) => p.storeId === "jetgopet");
    assert.equal(foreign.length, 0, `${store.id}: must not serve any jetgopet-tagged page`);
  }
  // Override scoping: the SAME slug yields jetgopet's page on jetgo.pet and a
  // DIFFERENT, non-jetgopet page on jetgomarket — same URL, store-scoped content.
  const jetgoSet = availableSlugSet(SIBLING_LOCAL_STORE);
  const overridePage = JETGOPET_ALL_EXCLUSIVE_PAGES.find((p) => jetgoSet.has(p.slug));
  assert.ok(overridePage, "expected the jetgopet corpus to override at least one shared jetgo slug");
  const overrideSlug = overridePage!.slug;
  assert.equal(
    findSeoPage(overrideSlug, JETGOPET_STORE)?.storeId,
    "jetgopet",
    `${overrideSlug}: jetgo.pet must serve its own (jetgopet-tagged) override`,
  );
  const onJetgo = findSeoPage(overrideSlug, SIBLING_LOCAL_STORE);
  assert.ok(onJetgo, `${overrideSlug}: jetgomarket must still serve its own page at this slug`);
  assert.notEqual(onJetgo!.storeId, "jetgopet", `${overrideSlug}: jetgomarket must NOT serve the jetgopet-tagged page`);
  // Every BRAND-NEW jetgopet slug is an addition vs the shared local corpus.
  const cleanSet = CLEAN_LOCAL_SLUGS;
  let brandNew = 0;
  for (const p of JETGOPET_ALL_EXCLUSIVE_PAGES) {
    if (!jetgoSet.has(p.slug)) {
      assert.ok(!cleanSet.has(p.slug), `${p.slug}: a brand-new jetgopet slug must be absent from the shared local corpus`);
      brandNew++;
    }
  }
  assert.ok(brandNew > 0, "expected at least some brand-new jetgopet slugs");
});

test("jetgopet-all: the corpus is listed in jetgo.pet's sitemap with no foreign exclusives", () => {
  const sm = getSitemapPagesForStore(JETGOPET_STORE);
  const own = sm.filter((p) => p.storeId === "jetgopet").length;
  assert.ok(own > 5000, `jetgo.pet sitemap must list its own exclusives, got ${own}`);
  assert.equal(
    sm.filter((p) => p.storeId && p.storeId !== "jetgopet").length,
    0,
    "jetgo.pet sitemap must not list any foreign store-exclusive page",
  );
});

test("jetgopet-all: content is UNIQUE-by-CONTENT vs jetgomarket.com (shared brand, distinct prose)", () => {
  // The JETGO brand is shared by design, so the metaTitle carries it.
  for (const p of JETGOPET_ALL_EXCLUSIVE_PAGES.slice(0, 200)) {
    assert.match(p.metaTitle, /JETGO Pet Shop/, `${p.slug}: metaTitle must carry the shared JETGO Pet Shop brand`);
  }
  // Distinct metaTitles (human-sounding, not one templated string).
  const titles = new Set(JETGOPET_ALL_EXCLUSIVE_PAGES.map((p) => p.metaTitle));
  assert.ok(titles.size > 5000, `metaTitles must be largely unique, got ${titles.size}`);

  // At a SHARED slug, jetgo.pet and jetgomarket serve DIFFERENT pages: distinct
  // metaTitle + h1 + body. Same URL, store-scoped content — never a brand/NAP swap.
  const jetgoSet = availableSlugSet(SIBLING_LOCAL_STORE);
  const overrides = JETGOPET_ALL_EXCLUSIVE_PAGES.filter((p) => jetgoSet.has(p.slug));
  assert.ok(overrides.length > 100, `expected jetgopet to override many shared jetgo slugs, got ${overrides.length}`);
  let compared = 0;
  for (const p of overrides.slice(0, 300)) {
    const onJetgo = findSeoPage(p.slug, SIBLING_LOCAL_STORE)!;
    assert.notEqual(onJetgo.storeId, "jetgopet", `${p.slug}: jetgomarket must serve its OWN page, not the jetgopet one`);
    assert.notEqual(p.metaTitle, onJetgo.metaTitle, `${p.slug}: metaTitle must differ from jetgomarket`);
    assert.notEqual(p.h1, onJetgo.h1, `${p.slug}: h1 must differ from jetgomarket`);
    assert.notEqual(markalarCopy(p), markalarCopy(onJetgo), `${p.slug}: body must differ from jetgomarket`);
    compared++;
  }
  assert.ok(compared > 100, `expected many jetgomarket comparisons, got ${compared}`);
});

test("jetgopet-all: content is UNIQUE-by-CONTENT vs the jetgoshop-all corpus (same-universe local sibling, distinct copy)", () => {
  // jetgopet and jetgoshop share the EXACT same slug universe (ATAKUM_ALL) AND the
  // shared JETGO brand, so every slug overlaps — the strongest distinctness check.
  // Distinct hash finalizer + salt + reworded phrase banks must make every shared
  // page read differently in title, h1 AND body.
  const shopBySlug = new Map(JETGOSHOP_ALL_EXCLUSIVE_PAGES.map((p) => [p.slug, p] as const));
  let compared = 0;
  for (const p of JETGOPET_ALL_EXCLUSIVE_PAGES) {
    const shop = shopBySlug.get(p.slug);
    if (!shop) continue;
    assert.notEqual(p.metaTitle, shop.metaTitle, `${p.slug}: metaTitle must differ from jetgoshop-all`);
    assert.notEqual(p.h1, shop.h1, `${p.slug}: h1 must differ from jetgoshop-all`);
    assert.notEqual(markalarCopy(p), markalarCopy(shop), `${p.slug}: body must differ from jetgoshop-all`);
    compared++;
    if (compared >= 400) break;
  }
  assert.ok(compared > 100, `expected many jetgoshop-all comparisons, got ${compared}`);
});

test("jetgopet-all: content is UNIQUE-by-CONTENT vs the atakum-all corpus (distinct copy banks)", () => {
  const ataBySlug = new Map(ATAKUM_ALL_EXCLUSIVE_PAGES.map((p) => [p.slug, p] as const));
  let compared = 0;
  for (const p of JETGOPET_ALL_EXCLUSIVE_PAGES) {
    const ata = ataBySlug.get(p.slug);
    if (!ata) continue;
    assert.notEqual(p.metaTitle, ata.metaTitle, `${p.slug}: metaTitle must differ from atakum`);
    assert.notEqual(markalarCopy(p), markalarCopy(ata), `${p.slug}: body must differ from atakum`);
    compared++;
    if (compared >= 300) break;
  }
  assert.ok(compared > 100, `expected many atakum comparisons, got ${compared}`);
});

test("jetgopet-all: live-animal / breed pages never claim to sell animals", () => {
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const AFFIRM = /sat[ıi]yoruz|satar[ıi]z|satışı yap[ıi]yoruz|satışı yapar[ıi]z|satın alabilirsiniz|canlı hayvan (satıyoruz|satarız|mevcut|stok)/;
  const live = JETGOPET_ALL_EXCLUSIVE_PAGES.filter((p) => JETGOPET_LIVE_MARK.test(p.metaTitle));
  assert.ok(live.length > 50, `expected a body of live-animal pages, got ${live.length}`);
  for (const p of live) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: live page must state jetgo.pet does not sell live animals`);
    assert.ok(!AFFIRM.test(digerBody(p)), `${p.slug}: live page must not affirmatively offer animals for sale`);
  }
});

test("jetgopet-all: every live-animal acquisition KEYWORD is truth-safe (broad slug-derived recall)", () => {
  const ANIMAL_STEM = ["kedi","kopek","yavru","kitten","puppy","muhabbet","kanarya","papagan","sultan","paraket","finch","ispinoz","saka","kus","tavsan","hamster","ginepig","gine","kemirgen","sinsilla","gerbil","fare","sican","balik","lepistes","moli","melek","japon","kaplumbaga","iguana","gekko","yilan","surungen"];
  const CUE = new Set(["canli","satilik","satlik","satis","satisi","satan","satanlar","satilan","satma","sat","satin","sahiplen","sahiplendirme","almak","alma","alinir","alan","alanlar","alici","alicisi","bedava","ucretsiz","sahibinden"]);
  const PROD_SVC = new Set(["ev","evi","kum","kumu","yag","yagi","otu","kab","kabi","yem","yemi","kafes","kafesi","mama","mamasi","tasma","tuvalet","kemik","gaga","tuy","catnip","nane","zehir","kapan","damla","minder","yatak","suluk","oyuncak","oyun","alani","alanlari","vitamin","vitaminler","sampuan","tarak","firca","kiyafet","canta","tasima","kulube","kulubesi","kumes","mineral","file","aksesuar","malzeme","urun","isimlik","egitim","egitimi","kuafor","pansiyon","otel","veteriner","merkez","merkezi","gezdirme","kosum","macun","malt","altligi","alisveris","alisverisi","alistirma","aliskin"]);
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const AFFIRM = /sat[ıi]yoruz|satar[ıi]z|satışı yap[ıi]yoruz|satışı yapar[ıi]z|satın alabilirsiniz|canlı hayvan (satıyoruz|satarız|mevcut|stok)/;
  const candidates = JETGOPET_ALL_EXCLUSIVE_PAGES.filter((p) => {
    const t = p.slug.split("-");
    const hasAnimal = t.some((x) => ANIMAL_STEM.some((a) => x.startsWith(a)));
    const hasCue = t.some((x) => CUE.has(x));
    const hasProdSvc = t.some((x) => PROD_SVC.has(x));
    return hasAnimal && hasCue && !hasProdSvc && !ATAKUM_ALL_FOOD_SKU.test(p.slug);
  });
  assert.ok(candidates.length > 100, `expected a large live-sale candidate body, got ${candidates.length}`);
  for (const p of candidates) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: live-sale keyword must state jetgo.pet does not sell live animals`);
    assert.ok(!AFFIRM.test(digerBody(p)), `${p.slug}: live-sale keyword must not affirmatively offer animals for sale`);
  }
});

test("jetgopet-all: every bird/rabbit PRICE keyword is truth-safe (broad slug-derived recall)", () => {
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const BIRD_RABBIT = ["muhabbet","papagan","sultan","kanarya","paraket","finch","ispinoz","saka","kus","kakadu","kakariki","jako","forpus","sevda","cennet","tavsan"];
  const PRICE = new Set(["fiyat","fiyati","fiyatlari","ucuz"]);
  const PROD_SVC = new Set(["yem","yemi","yemlik","kafes","kafesi","kafesli","folluk","yumurtalik","suluk","sulugu","kumes","kumesi","kulube","kulubesi","tasma","tasmasi","oyuncak","oyun","vitamin","takviye","takim","mama","mamasi","mamalari","gaga","tuy","isimlik","aksesuar","malzeme","urun","mineral","file","kum","kumu","tuvalet","tuvaleti","kulucka","korse","agizlik","ev","evi","koruyucu","yara","sok","akilli","alani","alanlari","alistirma","alisveris","alisverisi","egitim","egitimi","kuafor","pansiyon","veteriner","merkez","merkezi","gezdirme","tras","yikama","altligi"]);
  const candidates = JETGOPET_ALL_EXCLUSIVE_PAGES.filter((p) => {
    const t = p.slug.split("-");
    const hasAnimal = t.some((x) => BIRD_RABBIT.some((a) => x.startsWith(a)));
    const hasPrice = t.some((x) => PRICE.has(x)) || p.slug.includes("ne-kadar");
    const hasProdSvc = t.some((x) => PROD_SVC.has(x));
    return hasAnimal && hasPrice && !hasProdSvc && !ATAKUM_ALL_FOOD_SKU.test(p.slug) && !JETGOPET_RETAILER_MARK.test(p.metaTitle);
  });
  assert.ok(candidates.length > 100, `expected a large bird/rabbit price candidate body, got ${candidates.length}`);
  for (const p of candidates) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: bird/rabbit price keyword must state jetgo.pet does not sell live animals`);
  }
});

test("jetgopet-all: every breed PRICE keyword is truth-safe; breed-named FOOD SKUs stay product", () => {
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const BREED = ["persian","persan","british","scottish","sphynx","maine","coon","ragdoll","tekir","sarman","bengal","labrador","golden","rottweiler","chihuahua","yorkshire","shih","cocker","bulldog","cane","teckel","dachshund","poodle","pomeranian","boxer","german","beagle","husky","retriever","terrier","kangal","akbas","pug"];
  const PRICE = new Set(["fiyat","fiyati","fiyatlari","ucuz"]);
  const PROD_SVC = new Set(["mama","mamasi","mamalari","kumu","kafes","kafesi","kafesli","tasma","tasmasi","yatak","yatagi","minder","oyuncak","sampuan","vitamin","takviye","tarak","firca","kiyafet","canta","kulube","kulubesi","ev","evi","tuvalet","suluk","kab","kabi","macun","malt","catnip","kemik","damla","mineral","aksesuar","malzeme","urun","egitim","egitimi","kuafor","pansiyon","otel","veteriner","merkez","merkezi","gezdirme","tras","yikama","altligi","alisveris","alistirma"]);
  const candidates = JETGOPET_ALL_EXCLUSIVE_PAGES.filter((p) => {
    const t = p.slug.split("-");
    const hasBreed = t.some((x) => BREED.includes(x));
    const hasPrice = t.some((x) => PRICE.has(x)) || p.slug.includes("ne-kadar");
    const hasProdSvc = t.some((x) => PROD_SVC.has(x));
    return hasBreed && hasPrice && !hasProdSvc && !ATAKUM_ALL_FOOD_SKU.test(p.slug) && !JETGOPET_RETAILER_MARK.test(p.metaTitle);
  });
  assert.ok(candidates.length >= 5, `expected a body of breed price candidates, got ${candidates.length}`);
  for (const p of candidates) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: breed price keyword must state jetgo.pet does not sell live animals`);
  }
  // The inverse: a breed-NAMED food SKU is a product, never a live no-sale page.
  const foodBreed = JETGOPET_ALL_EXCLUSIVE_PAGES.filter(
    (p) => ATAKUM_ALL_FOOD_SKU.test(p.slug) && /(british|scottish|persian|persan|golden|labrador|terrier|retriever|bulldog|shorthair|pug|yorkshire)/.test(p.slug),
  );
  assert.ok(foodBreed.length > 0, "expected some breed-named food SKUs in the corpus");
  for (const p of foodBreed) {
    assert.ok(!NO_SALE.test(markalarCopy(p)), `${p.slug}: breed-named food SKU must NOT be framed as a live-animal no-sale page`);
  }
});

test("jetgopet-all: service keywords never claim jetgo.pet provides the service", () => {
  const NOT_PROVIDED = /hizmet(i)? (vermiyoruz|vermez|vermeyiz)|hizmet değil/i;
  const PROVIDES = /hizmet(i)? (veriyoruz|sağlıyoruz|sunuyoruz)|eğitim veriyoruz|pansiyonumuz/i;
  const servicePages = JETGOPET_ALL_EXCLUSIVE_PAGES.filter(
    (p) => JETGOPET_SERVICE_MARK.test(p.metaTitle) && NOT_PROVIDED.test(markalarCopy(p)),
  );
  assert.ok(servicePages.length > 20, `expected a body of service pages, got ${servicePages.length}`);
  for (const p of servicePages) {
    assert.ok(!PROVIDES.test(markalarCopy(p)), `${p.slug}: service page must not claim jetgo.pet provides the service`);
  }
});

test("jetgopet-all: retailer keywords position jetgo.pet as a local alternative, never the marketplace", () => {
  const INDEPENDENT = /bağımsız bir işletme|resmi bir bağlantımız yok/i;
  const AFFILIATED = /resmi (bayi|satıcı|distribütör)|yetkili (bayi|satıcı)/i;
  const retail = JETGOPET_ALL_EXCLUSIVE_PAGES.filter((p) => JETGOPET_RETAILER_MARK.test(p.metaTitle));
  assert.ok(retail.length > 50, `expected a body of retailer pages, got ${retail.length}`);
  for (const p of retail) {
    const copy = markalarCopy(p);
    assert.match(copy, INDEPENDENT, `${p.slug}: retailer page must disclaim affiliation with the marketplace`);
    assert.ok(!AFFILIATED.test(copy), `${p.slug}: retailer page must not imply official marketplace affiliation`);
  }
});

test("jetgopet-all: 24-hour / late-night keywords carry a truthful hours disclaimer", () => {
  // Whenever a page surfaces the "gece / 7/24 hizmet" FAQ it must answer truthfully
  // (no 24/7 claim — a LOCAL store with real opening hours).
  const Q = /gece veya 7\/24 hizmet veriyor mu/;
  const candidates = JETGOPET_ALL_EXCLUSIVE_PAGES.filter(
    (p) => (p.faq ?? []).some((f) => Q.test(f.q)),
  );
  assert.ok(candidates.length >= 1, `expected at least one 24h/late-night keyword page, got ${candidates.length}`);
  for (const p of candidates) {
    const ans = (p.faq ?? []).find((f) => Q.test(f.q))!.a;
    assert.match(ans, /7\/24 ya da gece açık değildir/, `${p.slug}: must not claim to be open 24/7`);
    assert.ok(ans.includes("09:00–21:00"), `${p.slug}: must state the real opening hours`);
  }
});

test("jetgopet-all: no page fabricates a concrete price", () => {
  const PRICE = /\d[\d.,]*\s*(₺|tl\b|lira\b)|₺\s*\d/i;
  const bad = JETGOPET_ALL_EXCLUSIVE_PAGES.filter((p) => PRICE.test(markalarCopy(p)));
  assert.equal(
    bad.length,
    0,
    `pages must not state a concrete price (offenders: ${bad.slice(0, 5).map((p) => p.slug).join(", ")})`,
  );
});

test("jetgopet-all: SSR serves jetgo.pet's bespoke content, self-canonical, differs from jetgomarket", async () => {
  const jetgoSet = availableSlugSet(SIBLING_LOCAL_STORE);
  const overrideSlug = JETGOPET_ALL_EXCLUSIVE_PAGES.find((p) => jetgoSet.has(p.slug))!.slug;
  const petPage = findSeoPage(overrideSlug, JETGOPET_STORE)!;
  assert.equal(petPage.storeId, "jetgopet", "jetgo.pet must serve its own store-scoped override");

  const petHtml = await injectAllMeta(INDEX_HTML, `/${overrideSlug}`, JETGOPET_HOST);
  const petTitle = petHtml.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const petCanon = petHtml.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? "";
  assert.equal(
    petTitle,
    escapeHtmlForTest(brandifyFor(JETGOPET_STORE, petPage.metaTitle)),
    "jetgo.pet SSR <title> must be its own brandified metaTitle",
  );
  assert.equal(petCanon, `${JETGOPET_STORE.domain}/${overrideSlug}`, "jetgo.pet SSR canonical must bind to jetgo.pet");

  // The SAME slug on jetgomarket.com → a DIFFERENT title (jetgo's own page),
  // self-canonical to jetgomarket. No JETGO-domain cross-leak in either direction.
  const jetgoHtml = await injectAllMeta(INDEX_HTML, `/${overrideSlug}`, JETGO_HOST);
  const jetgoTitle = jetgoHtml.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const jetgoCanon = jetgoHtml.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? "";
  assert.notEqual(petTitle, jetgoTitle, "jetgo.pet title must differ from jetgomarket at the same slug");
  assert.equal(jetgoCanon, `${SIBLING_LOCAL_STORE.domain}/${overrideSlug}`, "jetgomarket canonical must bind to jetgomarket");
  assert.ok(!petCanon.includes(SIBLING_LOCAL_STORE.domain), "jetgo.pet canonical must not leak the jetgomarket domain");
});

// ===========================================================================
// ATAKUM PET broad keyword corpus (atakum.biz, store id "atakumbiz") — the 7th
// corpus. atakum.biz is a LOCAL same-day store that shares the "Atakum Pet"
// brand WORD with the cargo `samsun` store AND the very same Atakum 1-saat angle
// as the atakum-all corpus, so it CANNOT differ by facts. The uniqueness
// invariant is therefore on the PROSE: the corpus must read distinct from
//   • the SHARED jetgomarket.com keyword pages,
//   • the atakum-all corpus (atakumpetshop.com, "Atakum Pet Shop"), AND
//   • the jetgoshop-all corpus (jetgo.shop, "JETGO Pet Shop").
// ===========================================================================
const ATAKUMBIZ_STORE = getStoreByHost(ATAKUMBIZ_HOST);
// Intent pages are identified by their (exclusive) metaTitle markers — chosen to
// differ from BOTH sibling corpora (atakum "Sahiplenme Rehberi"/"Yerel
// Alternatif"/"Bilgilendirme", jetgoshop "Sorumlu Sahiplenme"/"Yerel
// Seçenek"/"Bilgilendirme").
const ATAKUMBIZ_LIVE_MARK = /Sahiplenme Çağrısı/;
const ATAKUMBIZ_RETAILER_MARK = /Yerel Esnaf/;
const ATAKUMBIZ_SERVICE_MARK = /Bilgi Notu/;

test("atakumbiz-all: a large keyword corpus is registered, exclusive, and complete", () => {
  assert.ok(
    ATAKUMBIZ_ALL_EXCLUSIVE_PAGES.length > 5000,
    `expected a large atakumbiz-all corpus, got ${ATAKUMBIZ_ALL_EXCLUSIVE_PAGES.length}`,
  );
  const slugs = ATAKUMBIZ_ALL_EXCLUSIVE_PAGES.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, "atakumbiz-all corpus must have unique slugs");
  for (const p of ATAKUMBIZ_ALL_EXCLUSIVE_PAGES) {
    assert.equal(p.storeId, "atakumbiz", `${p.slug}: atakumbiz-all page must be storeId atakumbiz`);
    assert.equal(p.availability, "localOnly", `${p.slug}: atakumbiz-all page must be localOnly`);
    assert.equal(p.type, "keyword", `${p.slug}: atakumbiz-all page must be a keyword page`);
    assert.ok(
      p.metaTitle && p.metaDescription && p.h1 &&
      (p.intro ?? []).length && (p.sections ?? []).length &&
      (p.faq ?? []).length && (p.internalLinks ?? []).length,
      `${p.slug}: must carry title/meta/h1 + intro/sections/faq/internalLinks for a substantive AI-search page`,
    );
    // Genuine atakum.biz first-party content (real NAP phone) — not a brand swap.
    assert.match(markalarCopy(p), /0850 840 39 59/, `${p.slug}: must carry the atakum.biz NAP phone`);
    // No slug may shadow a real client app route.
    assert.ok(!RESERVED_APP_SLUGS.has(p.slug), `${p.slug}: must not shadow a reserved app route`);
  }
});

test("atakumbiz-all: noise keywords are skipped and the rest are registered", () => {
  assert.ok(ATAKUMBIZ_ALL_SKIPPED_NOISE > 0, "expected some noise keywords (e.g. Spanish 'buscar') to be skipped");
  assert.ok(
    ATAKUMBIZ_ALL_KEYWORD_PAGES.length >= ATAKUMBIZ_ALL_EXCLUSIVE_PAGES.length,
    "generated pages must be a superset of the registered exclusive corpus (curated collisions dropped)",
  );
});

test("atakumbiz-all: every internal link resolves within atakum.biz's own slug space", () => {
  const bizSet = availableSlugSet(ATAKUMBIZ_STORE);
  let checked = 0;
  for (const p of ATAKUMBIZ_ALL_EXCLUSIVE_PAGES) {
    for (const l of p.internalLinks ?? []) {
      const target = (l.href ?? "").replace(/^\//, "");
      if (!target || target.includes("/")) continue; // skip non-flat (parametric) routes
      checked++;
      assert.ok(bizSet.has(target), `${p.slug}: internal link "/${target}" must resolve on atakum.biz`);
    }
  }
  assert.ok(checked > 1000, `expected many internal links to verify, got ${checked}`);
});

test("atakumbiz-all: atakumbiz-tagged pages never leak to any other store; overrides stay store-scoped", () => {
  for (const store of [
    JETGO_STORE,
    SIBLING_LOCAL_STORE,
    OTHER_LOCAL_STORE,
    ATAKUM_STORE,
    CARGO_STORE_FOR_ATAKUM,
    JETGOSHOP_STORE,
  ]) {
    const foreign = getSeoPagesForStore(store).filter((p) => p.storeId === "atakumbiz");
    assert.equal(foreign.length, 0, `${store.id}: must not serve any atakumbiz-tagged page`);
  }
  // Override scoping: the SAME slug yields atakumbiz's page on atakum.biz and a
  // DIFFERENT, non-atakumbiz page on jetgomarket — same URL, store-scoped content.
  const jetgoSet = availableSlugSet(JETGO_STORE);
  const overridePage = ATAKUMBIZ_ALL_EXCLUSIVE_PAGES.find((p) => jetgoSet.has(p.slug));
  assert.ok(overridePage, "expected the atakumbiz corpus to override at least one shared jetgo slug");
  const overrideSlug = overridePage!.slug;
  assert.equal(
    findSeoPage(overrideSlug, ATAKUMBIZ_STORE)?.storeId,
    "atakumbiz",
    `${overrideSlug}: atakum.biz must serve its own (atakumbiz-tagged) override`,
  );
  const onJetgo = findSeoPage(overrideSlug, JETGO_STORE);
  assert.ok(onJetgo, `${overrideSlug}: jetgomarket must still serve its own page at this slug`);
  assert.notEqual(onJetgo!.storeId, "atakumbiz", `${overrideSlug}: jetgomarket must NOT serve the atakumbiz-tagged page`);
  // Every BRAND-NEW atakumbiz slug is an addition vs a clean sibling (jetgopet).
  const cleanSet = CLEAN_LOCAL_SLUGS;
  let brandNew = 0;
  for (const p of ATAKUMBIZ_ALL_EXCLUSIVE_PAGES) {
    if (!jetgoSet.has(p.slug)) {
      assert.ok(!cleanSet.has(p.slug), `${p.slug}: a brand-new atakumbiz slug must be absent from a clean sibling`);
      brandNew++;
    }
  }
  assert.ok(brandNew > 0, "expected at least some brand-new atakumbiz slugs");
});

test("atakumbiz-all: the corpus is served on atakum.biz's sitemap with no foreign exclusives", () => {
  const sm = getSitemapPagesForStore(ATAKUMBIZ_STORE);
  const own = sm.filter((p) => p.storeId === "atakumbiz").length;
  assert.ok(own > 5000, `atakum.biz sitemap must list its own exclusives, got ${own}`);
  assert.equal(
    sm.filter((p) => p.storeId && p.storeId !== "atakumbiz").length,
    0,
    "atakum.biz sitemap must not list any foreign store-exclusive page",
  );
});

test("atakumbiz-all: content is UNIQUE-by-CONTENT vs jetgomarket.com (own brand, distinct prose)", () => {
  for (const p of ATAKUMBIZ_ALL_EXCLUSIVE_PAGES.slice(0, 200)) {
    assert.match(p.metaTitle, /Atakum Pet/, `${p.slug}: metaTitle must carry the Atakum Pet brand`);
  }
  // Distinct metaTitles (human-sounding, not one templated string).
  const titles = new Set(ATAKUMBIZ_ALL_EXCLUSIVE_PAGES.map((p) => p.metaTitle));
  assert.ok(titles.size > 5000, `metaTitles must be largely unique, got ${titles.size}`);

  // At a SHARED slug, atakum.biz and jetgomarket serve DIFFERENT pages: distinct
  // metaTitle + h1 + body. Same URL, store-scoped content — never a brand/NAP swap.
  const jetgoSet = availableSlugSet(JETGO_STORE);
  const overrides = ATAKUMBIZ_ALL_EXCLUSIVE_PAGES.filter((p) => jetgoSet.has(p.slug));
  assert.ok(overrides.length > 100, `expected atakumbiz to override many shared jetgo slugs, got ${overrides.length}`);
  let compared = 0;
  for (const p of overrides.slice(0, 300)) {
    const onJetgo = findSeoPage(p.slug, JETGO_STORE)!;
    assert.notEqual(onJetgo.storeId, "atakumbiz", `${p.slug}: jetgomarket must serve its OWN page, not the atakumbiz one`);
    assert.notEqual(p.metaTitle, onJetgo.metaTitle, `${p.slug}: metaTitle must differ from jetgomarket`);
    assert.notEqual(p.h1, onJetgo.h1, `${p.slug}: h1 must differ from jetgomarket`);
    assert.notEqual(markalarCopy(p), markalarCopy(onJetgo), `${p.slug}: body must differ from jetgomarket`);
    compared++;
  }
  assert.ok(compared > 100, `expected many jetgomarket comparisons, got ${compared}`);
});

test("atakumbiz-all: content is UNIQUE-by-CONTENT vs the atakum-all corpus (same brand family, distinct copy)", () => {
  // The HARD case: atakum-all ("Atakum Pet Shop") is the closest sibling — same
  // town, same 1-saat angle, near-same NAP. Distinctness must come from the PROSE.
  const ataBySlug = new Map(ATAKUM_ALL_EXCLUSIVE_PAGES.map((p) => [p.slug, p] as const));
  let compared = 0;
  for (const p of ATAKUMBIZ_ALL_EXCLUSIVE_PAGES) {
    const ata = ataBySlug.get(p.slug);
    if (!ata) continue;
    assert.notEqual(p.metaTitle, ata.metaTitle, `${p.slug}: metaTitle must differ from atakum-all`);
    assert.notEqual(p.h1, ata.h1, `${p.slug}: h1 must differ from atakum-all`);
    assert.notEqual(markalarCopy(p), markalarCopy(ata), `${p.slug}: body must differ from atakum-all`);
    compared++;
    if (compared >= 400) break;
  }
  assert.ok(compared > 100, `expected many atakum-all comparisons, got ${compared}`);
});

test("atakumbiz-all: content is UNIQUE-by-CONTENT vs the jetgoshop-all corpus (distinct copy banks)", () => {
  const shopBySlug = new Map(JETGOSHOP_ALL_EXCLUSIVE_PAGES.map((p) => [p.slug, p] as const));
  let compared = 0;
  for (const p of ATAKUMBIZ_ALL_EXCLUSIVE_PAGES) {
    const shop = shopBySlug.get(p.slug);
    if (!shop) continue;
    assert.notEqual(p.metaTitle, shop.metaTitle, `${p.slug}: metaTitle must differ from jetgoshop-all`);
    assert.notEqual(markalarCopy(p), markalarCopy(shop), `${p.slug}: body must differ from jetgoshop-all`);
    compared++;
    if (compared >= 300) break;
  }
  assert.ok(compared > 100, `expected many jetgoshop-all comparisons, got ${compared}`);
});

test("atakumbiz-all: live-animal / breed pages never claim to sell animals", () => {
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const AFFIRM = /sat[ıi]yoruz|satar[ıi]z|satışı yap[ıi]yoruz|satışı yapar[ıi]z|satın alabilirsiniz|canlı hayvan (satıyoruz|satarız|mevcut|stok)/;
  const live = ATAKUMBIZ_ALL_EXCLUSIVE_PAGES.filter((p) => ATAKUMBIZ_LIVE_MARK.test(p.metaTitle));
  assert.ok(live.length > 50, `expected a body of live-animal pages, got ${live.length}`);
  for (const p of live) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: live page must state atakum.biz does not sell live animals`);
    assert.ok(!AFFIRM.test(digerBody(p)), `${p.slug}: live page must not affirmatively offer animals for sale`);
  }
});

test("atakumbiz-all: every live-animal acquisition KEYWORD is truth-safe (broad slug-derived recall)", () => {
  const ANIMAL_STEM = ["kedi","kopek","yavru","kitten","puppy","muhabbet","kanarya","papagan","sultan","paraket","finch","ispinoz","saka","kus","tavsan","hamster","ginepig","gine","kemirgen","sinsilla","gerbil","fare","sican","balik","lepistes","moli","melek","japon","kaplumbaga","iguana","gekko","yilan","surungen"];
  const CUE = new Set(["canli","satilik","satlik","satis","satisi","satan","satanlar","satilan","satma","sat","satin","sahiplen","sahiplendirme","almak","alma","alinir","alan","alanlar","alici","alicisi","bedava","ucretsiz","sahibinden"]);
  const PROD_SVC = new Set(["ev","evi","kum","kumu","yag","yagi","otu","kab","kabi","yem","yemi","kafes","kafesi","mama","mamasi","tasma","tuvalet","kemik","gaga","tuy","catnip","nane","zehir","kapan","damla","minder","yatak","suluk","oyuncak","oyun","alani","alanlari","vitamin","vitaminler","sampuan","tarak","firca","kiyafet","canta","tasima","kulube","kulubesi","kumes","mineral","file","aksesuar","malzeme","urun","isimlik","egitim","egitimi","kuafor","pansiyon","otel","veteriner","merkez","merkezi","gezdirme","kosum","macun","malt","altligi","alisveris","alisverisi","alistirma","aliskin"]);
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const AFFIRM = /sat[ıi]yoruz|satar[ıi]z|satışı yap[ıi]yoruz|satışı yapar[ıi]z|satın alabilirsiniz|canlı hayvan (satıyoruz|satarız|mevcut|stok)/;
  const candidates = ATAKUMBIZ_ALL_EXCLUSIVE_PAGES.filter((p) => {
    const t = p.slug.split("-");
    const hasAnimal = t.some((x) => ANIMAL_STEM.some((a) => x.startsWith(a)));
    const hasCue = t.some((x) => CUE.has(x));
    const hasProdSvc = t.some((x) => PROD_SVC.has(x));
    return hasAnimal && hasCue && !hasProdSvc && !ATAKUM_ALL_FOOD_SKU.test(p.slug);
  });
  assert.ok(candidates.length > 100, `expected a large live-sale candidate body, got ${candidates.length}`);
  for (const p of candidates) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: live-sale keyword must state atakum.biz does not sell live animals`);
    assert.ok(!AFFIRM.test(digerBody(p)), `${p.slug}: live-sale keyword must not affirmatively offer animals for sale`);
  }
});

test("atakumbiz-all: every bird/rabbit PRICE keyword is truth-safe (broad slug-derived recall)", () => {
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const BIRD_RABBIT = ["muhabbet","papagan","sultan","kanarya","paraket","finch","ispinoz","saka","kus","kakadu","kakariki","jako","forpus","sevda","cennet","tavsan"];
  const PRICE = new Set(["fiyat","fiyati","fiyatlari","ucuz"]);
  const PROD_SVC = new Set(["yem","yemi","yemlik","kafes","kafesi","kafesli","folluk","yumurtalik","suluk","sulugu","kumes","kumesi","kulube","kulubesi","tasma","tasmasi","oyuncak","oyun","vitamin","takviye","takim","mama","mamasi","mamalari","gaga","tuy","isimlik","aksesuar","malzeme","urun","mineral","file","kum","kumu","tuvalet","tuvaleti","kulucka","korse","agizlik","ev","evi","koruyucu","yara","sok","akilli","alani","alanlari","alistirma","alisveris","alisverisi","egitim","egitimi","kuafor","pansiyon","veteriner","merkez","merkezi","gezdirme","tras","yikama","altligi"]);
  const candidates = ATAKUMBIZ_ALL_EXCLUSIVE_PAGES.filter((p) => {
    const t = p.slug.split("-");
    const hasAnimal = t.some((x) => BIRD_RABBIT.some((a) => x.startsWith(a)));
    const hasPrice = t.some((x) => PRICE.has(x)) || p.slug.includes("ne-kadar");
    const hasProdSvc = t.some((x) => PROD_SVC.has(x));
    return hasAnimal && hasPrice && !hasProdSvc && !ATAKUM_ALL_FOOD_SKU.test(p.slug) && !ATAKUMBIZ_RETAILER_MARK.test(p.metaTitle);
  });
  assert.ok(candidates.length > 100, `expected a large bird/rabbit price candidate body, got ${candidates.length}`);
  for (const p of candidates) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: bird/rabbit price keyword must state atakum.biz does not sell live animals`);
  }
});

test("atakumbiz-all: every breed PRICE keyword is truth-safe; breed-named FOOD SKUs stay product", () => {
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const BREED = ["persian","persan","british","scottish","sphynx","maine","coon","ragdoll","tekir","sarman","bengal","labrador","golden","rottweiler","chihuahua","yorkshire","shih","cocker","bulldog","cane","teckel","dachshund","poodle","pomeranian","boxer","german","beagle","husky","retriever","terrier","kangal","akbas","pug"];
  const PRICE = new Set(["fiyat","fiyati","fiyatlari","ucuz"]);
  const PROD_SVC = new Set(["mama","mamasi","mamalari","kumu","kafes","kafesi","kafesli","tasma","tasmasi","yatak","yatagi","minder","oyuncak","sampuan","vitamin","takviye","tarak","firca","kiyafet","canta","kulube","kulubesi","ev","evi","tuvalet","suluk","kab","kabi","macun","malt","catnip","kemik","damla","mineral","aksesuar","malzeme","urun","egitim","egitimi","kuafor","pansiyon","otel","veteriner","merkez","merkezi","gezdirme","tras","yikama","altligi","alisveris","alistirma"]);
  const candidates = ATAKUMBIZ_ALL_EXCLUSIVE_PAGES.filter((p) => {
    const t = p.slug.split("-");
    const hasBreed = t.some((x) => BREED.includes(x));
    const hasPrice = t.some((x) => PRICE.has(x)) || p.slug.includes("ne-kadar");
    const hasProdSvc = t.some((x) => PROD_SVC.has(x));
    return hasBreed && hasPrice && !hasProdSvc && !ATAKUM_ALL_FOOD_SKU.test(p.slug) && !ATAKUMBIZ_RETAILER_MARK.test(p.metaTitle);
  });
  assert.ok(candidates.length >= 5, `expected a body of breed price candidates, got ${candidates.length}`);
  for (const p of candidates) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: breed price keyword must state atakum.biz does not sell live animals`);
  }
  // The inverse: a breed-NAMED food SKU is a product, never a live no-sale page.
  const foodBreed = ATAKUMBIZ_ALL_EXCLUSIVE_PAGES.filter(
    (p) => ATAKUM_ALL_FOOD_SKU.test(p.slug) && /(british|scottish|persian|persan|golden|labrador|terrier|retriever|bulldog|shorthair|pug|yorkshire)/.test(p.slug),
  );
  assert.ok(foodBreed.length > 0, "expected some breed-named food SKUs in the corpus");
  for (const p of foodBreed) {
    assert.ok(!NO_SALE.test(markalarCopy(p)), `${p.slug}: breed-named food SKU must NOT be framed as a live-animal no-sale page`);
  }
});

test("atakumbiz-all: service keywords never claim atakum.biz provides the service", () => {
  const NOT_PROVIDED = /hizmet(i)? (vermiyoruz|vermez|vermeyiz)|hizmet değil/i;
  const PROVIDES = /hizmet(i)? (veriyoruz|sağlıyoruz|sunuyoruz)|eğitim veriyoruz|pansiyonumuz/i;
  // Filter by the service MARKER alone — every service page must then carry the
  // no-service disclaimer (gating on the disclaimer would hide a page missing it).
  const servicePages = ATAKUMBIZ_ALL_EXCLUSIVE_PAGES.filter((p) => ATAKUMBIZ_SERVICE_MARK.test(p.metaTitle));
  assert.ok(servicePages.length > 20, `expected a body of service pages, got ${servicePages.length}`);
  for (const p of servicePages) {
    const copy = markalarCopy(p);
    assert.match(copy, NOT_PROVIDED, `${p.slug}: service page must disclaim that atakum.biz provides the service`);
    assert.ok(!PROVIDES.test(copy), `${p.slug}: service page must not claim atakum.biz provides the service`);
  }
});

test("atakumbiz-all: retailer keywords position atakum.biz as a local alternative, never the marketplace", () => {
  const INDEPENDENT = /bağımsız bir işletme|resmi bir bağlantımız yok/i;
  const AFFILIATED = /resmi (bayi|satıcı|distribütör)|yetkili (bayi|satıcı)/i;
  const retail = ATAKUMBIZ_ALL_EXCLUSIVE_PAGES.filter((p) => ATAKUMBIZ_RETAILER_MARK.test(p.metaTitle));
  assert.ok(retail.length > 50, `expected a body of retailer pages, got ${retail.length}`);
  for (const p of retail) {
    const copy = markalarCopy(p);
    assert.match(copy, INDEPENDENT, `${p.slug}: retailer page must disclaim affiliation with the marketplace`);
    assert.ok(!AFFILIATED.test(copy), `${p.slug}: retailer page must not imply official marketplace affiliation`);
  }
});

test("atakumbiz-all: 24-hour / late-night keywords carry a truthful hours disclaimer", () => {
  const candidates = ATAKUMBIZ_ALL_EXCLUSIVE_PAGES.filter(
    (p) => (p.faq ?? []).some((f) => /7\/24 açık/.test(f.q)),
  );
  assert.ok(candidates.length >= 1, `expected at least one 24h/late-night keyword page, got ${candidates.length}`);
  for (const p of candidates) {
    const ans = (p.faq ?? []).find((f) => /7\/24 açık/.test(f.q))!.a;
    assert.match(ans, /7\/24 ya da gece açık değildir/, `${p.slug}: must not claim to be open 24/7`);
    assert.ok(ans.includes("09:00–21:00"), `${p.slug}: must state the real opening hours`);
  }
});

test("atakumbiz-all: no page fabricates a concrete price", () => {
  const PRICE = /\d[\d.,]*\s*(₺|tl\b|lira\b)|₺\s*\d/i;
  const bad = ATAKUMBIZ_ALL_EXCLUSIVE_PAGES.filter((p) => PRICE.test(markalarCopy(p)));
  assert.equal(
    bad.length,
    0,
    `pages must not state a concrete price (offenders: ${bad.slice(0, 5).map((p) => p.slug).join(", ")})`,
  );
});

test("atakumbiz-all: SSR serves atakum.biz's bespoke content, self-canonical, differs from jetgomarket", async () => {
  const jetgoSet = availableSlugSet(JETGO_STORE);
  const overrideSlug = ATAKUMBIZ_ALL_EXCLUSIVE_PAGES.find((p) => jetgoSet.has(p.slug))!.slug;
  const bizPage = findSeoPage(overrideSlug, ATAKUMBIZ_STORE)!;
  assert.equal(bizPage.storeId, "atakumbiz", "atakum.biz must serve its own store-scoped override");

  const bizHtml = await injectAllMeta(INDEX_HTML, `/${overrideSlug}`, ATAKUMBIZ_HOST);
  const bizTitle = bizHtml.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const bizCanon = bizHtml.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? "";
  assert.equal(
    bizTitle,
    escapeHtmlForTest(brandifyFor(ATAKUMBIZ_STORE, bizPage.metaTitle)),
    "atakum.biz SSR <title> must be its own brandified metaTitle",
  );
  assert.equal(bizCanon, `${ATAKUMBIZ_STORE.domain}/${overrideSlug}`, "atakum.biz SSR canonical must bind to atakum.biz");

  // The SAME slug on jetgomarket.com → a DIFFERENT title (jetgo's own page),
  // self-canonical to jetgomarket. No cross-domain leak in either direction.
  const jetgoHtml = await injectAllMeta(INDEX_HTML, `/${overrideSlug}`, JETGO_HOST);
  const jetgoTitle = jetgoHtml.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const jetgoCanon = jetgoHtml.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? "";
  assert.notEqual(bizTitle, jetgoTitle, "atakum.biz title must differ from jetgomarket at the same slug");
  assert.equal(jetgoCanon, `${JETGO_STORE.domain}/${overrideSlug}`, "jetgomarket canonical must bind to jetgomarket");
  assert.ok(!bizCanon.includes(JETGO_STORE.domain), "atakum.biz canonical must not leak the jetgomarket domain");
});

// ===========================================================================
// MARKA.PET broad keyword corpus (marka.pet, store id "markapet") — the 8th
// corpus, a LOCAL same-day Samsun store with a PRATIK convenience angle: tek
// tıkla sipariş, Samsun içi aynı gün kapıda. It delivers same-day in the Samsun
// area (Atakum, İlkadım, Canik, Tekkeköy) with kapıda ödeme + kurye — NO
// Türkiye-geneli cargo. The corpus must therefore be LOCAL-framed AND truth-safe:
// it must read distinct from
//   • the SHARED jetgomarket.com keyword pages,
//   • the atakumbiz-all corpus (atakum.biz, "Atakum Pet", LOCAL same-day), AND
//   • the jetgoshop-all corpus (jetgo.shop, "JETGO Pet Shop"),
// while AFFIRMING the same-day / door-payment / local-presence trait that is now
// true for every page. Pages carry availability "localOnly".
// ===========================================================================
const MARKAPET_STORE = getStoreByHost(MARKAPET_HOST);
// Intent pages are identified by their (exclusive) metaTitle markers — chosen to
// differ from the local sibling corpora (atakumbiz "Sahiplenme Çağrısı"/"Yerel
// Esnaf"/"Bilgi Notu", jetgoshop/atakum variants) AND to read in a PRATIK
// convenience voice.
const MARKAPET_LIVE_MARK = /Sahiplenme Önerisi/;
const MARKAPET_RETAILER_MARK = /Yerel Alternatif/;
const MARKAPET_SERVICE_MARK = /Hizmet Notu/;
// Local body surfaces — the rendered prose now AFFIRMS the same-day/local trait
// (the keyword K survives raw in slug/title/metaTitle/keywords for SEO too); the
// local-signature scan runs over the rendered prose, never just the SEO meta.
function markapetBody(p: SeoPageData): string {
  return [
    p.metaDescription,
    p.h1,
    ...(p.intro ?? []),
    ...(p.sections ?? []).flatMap((s) => [s.h2, ...(s.paragraphs ?? []), ...(s.list ?? [])]),
    ...(p.features ?? []),
    ...((p.faq ?? []).flatMap((f) => [f.q, f.a])),
  ].join(" ");
}
// Positive LOCAL signature every same-day store's prose MUST affirm.
const LOCAL_SIGNATURE_RE = /aynı gün|kapıda (ödeme|nakit|kredi|kart)|kurye/i;
// Always-open / 24h claims a same-day (but NOT 24h) store must never make.
const NIGHT_CLAIM_RE = /nöbetçi|gece açık|gece acık|7\s*\/\s*24|24 saat açık|kesintisiz açık/i;

test("markapet-all: a large keyword corpus is registered, exclusive, and complete (localOnly)", () => {
  assert.ok(
    MARKAPET_ALL_EXCLUSIVE_PAGES.length > 5000,
    `expected a large markapet-all corpus, got ${MARKAPET_ALL_EXCLUSIVE_PAGES.length}`,
  );
  const slugs = MARKAPET_ALL_EXCLUSIVE_PAGES.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, "markapet-all corpus must have unique slugs");
  for (const p of MARKAPET_ALL_EXCLUSIVE_PAGES) {
    assert.equal(p.storeId, "markapet", `${p.slug}: markapet-all page must be storeId markapet`);
    assert.equal(p.availability, "localOnly", `${p.slug}: markapet-all page must be localOnly`);
    assert.equal(p.type, "keyword", `${p.slug}: markapet-all page must be a keyword page`);
    assert.ok(
      p.metaTitle && p.metaDescription && p.h1 &&
      (p.intro ?? []).length && (p.sections ?? []).length &&
      (p.faq ?? []).length && (p.internalLinks ?? []).length,
      `${p.slug}: must carry title/meta/h1 + intro/sections/faq/internalLinks for a substantive AI-search page`,
    );
    // Genuine marka.pet first-party content (real NAP phone) — not a brand swap.
    assert.match(markalarCopy(p), /0850 840 39 59/, `${p.slug}: must carry the marka.pet NAP phone`);
    // No slug may shadow a real client app route.
    assert.ok(!RESERVED_APP_SLUGS.has(p.slug), `${p.slug}: must not shadow a reserved app route`);
  }
});

test("markapet-all: noise keywords are skipped and the rest are registered", () => {
  assert.ok(MARKAPET_ALL_SKIPPED_NOISE > 0, "expected some noise keywords (e.g. Spanish 'buscar') to be skipped");
  assert.ok(
    MARKAPET_ALL_KEYWORD_PAGES.length >= MARKAPET_ALL_EXCLUSIVE_PAGES.length,
    "generated pages must be a superset of the registered exclusive corpus (curated collisions dropped)",
  );
});

test("markapet-all: EVERY page affirms the local same-day / door-payment trait", () => {
  // The local invariant. Scan the rendered BODY of EVERY page — these are now
  // truthful same-day Samsun stores, so every page must carry the local signal.
  const missing = MARKAPET_ALL_EXCLUSIVE_PAGES.filter((p) => !LOCAL_SIGNATURE_RE.test(markapetBody(p)));
  assert.equal(
    missing.length,
    0,
    `local pages must affirm a same-day/door/kurye trait (offenders: ${missing.slice(0, 5).map((p) => p.slug).join(", ")})`,
  );
});

test("markapet-all: every metaDescription carries the same-day local signature, never a cargo one", () => {
  const missing = MARKAPET_ALL_EXCLUSIVE_PAGES.filter((p) => !SAME_DAY_SIGNATURE.test(p.metaDescription ?? ""));
  assert.equal(missing.length, 0, `metaDescriptions must carry the same-day signature (offenders: ${missing.slice(0, 5).map((p) => p.slug).join(", ")})`);
  const cargo = MARKAPET_ALL_EXCLUSIVE_PAGES.filter((p) => CARGO_SIGNATURE.test(p.metaDescription ?? ""));
  assert.equal(cargo.length, 0, `metaDescriptions must not carry the cargo signature (offenders: ${cargo.slice(0, 5).map((p) => p.slug).join(", ")})`);
});

test("markapet-all: every internal link resolves within marka.pet's own slug space", () => {
  const mpSet = availableSlugSet(MARKAPET_STORE);
  let checked = 0;
  for (const p of MARKAPET_ALL_EXCLUSIVE_PAGES) {
    for (const l of p.internalLinks ?? []) {
      const target = (l.href ?? "").replace(/^\//, "");
      if (!target || target.includes("/")) continue; // skip non-flat (parametric) routes
      checked++;
      assert.ok(mpSet.has(target), `${p.slug}: internal link "/${target}" must resolve on marka.pet`);
    }
  }
  assert.ok(checked > 1000, `expected many internal links to verify, got ${checked}`);
});

test("markapet-all: markapet-tagged pages never leak to any other store; overrides stay store-scoped", () => {
  for (const store of [
    JETGO_STORE,
    SIBLING_LOCAL_STORE,
    OTHER_LOCAL_STORE,
    ATAKUM_STORE,
    CARGO_STORE_FOR_ATAKUM,
    JETGOSHOP_STORE,
    ATAKUMBIZ_STORE,
  ]) {
    const foreign = getSeoPagesForStore(store).filter((p) => p.storeId === "markapet");
    assert.equal(foreign.length, 0, `${store.id}: must not serve any markapet-tagged page`);
  }
  // Override scoping: the SAME slug yields markapet's page on marka.pet and a
  // DIFFERENT, non-markapet page on jetgomarket — same URL, store-scoped content.
  const jetgoSet = availableSlugSet(JETGO_STORE);
  const overridePage = MARKAPET_ALL_EXCLUSIVE_PAGES.find((p) => jetgoSet.has(p.slug));
  assert.ok(overridePage, "expected the markapet corpus to override at least one shared jetgo slug");
  const overrideSlug = overridePage!.slug;
  assert.equal(
    findSeoPage(overrideSlug, MARKAPET_STORE)?.storeId,
    "markapet",
    `${overrideSlug}: marka.pet must serve its own (markapet-tagged) override`,
  );
  const onJetgo = findSeoPage(overrideSlug, JETGO_STORE);
  assert.ok(onJetgo, `${overrideSlug}: jetgomarket must still serve its own page at this slug`);
  assert.notEqual(onJetgo!.storeId, "markapet", `${overrideSlug}: jetgomarket must NOT serve the markapet-tagged page`);
});

test("markapet-all: the corpus is served on marka.pet's sitemap with no foreign exclusives", () => {
  const sm = getSitemapPagesForStore(MARKAPET_STORE);
  const own = sm.filter((p) => p.storeId === "markapet").length;
  assert.ok(own > 5000, `marka.pet sitemap must list its own exclusives, got ${own}`);
  assert.equal(
    sm.filter((p) => p.storeId && p.storeId !== "markapet").length,
    0,
    "marka.pet sitemap must not list any foreign store-exclusive page",
  );
});

test("markapet-all: content is UNIQUE-by-CONTENT vs jetgomarket.com (own brand, distinct prose)", () => {
  for (const p of MARKAPET_ALL_EXCLUSIVE_PAGES.slice(0, 200)) {
    assert.match(p.metaTitle, /marka\.pet/, `${p.slug}: metaTitle must carry the marka.pet brand`);
  }
  // Distinct metaTitles (human-sounding, not one templated string).
  const titles = new Set(MARKAPET_ALL_EXCLUSIVE_PAGES.map((p) => p.metaTitle));
  assert.ok(titles.size > 5000, `metaTitles must be largely unique, got ${titles.size}`);

  // At a SHARED slug, marka.pet and jetgomarket serve DIFFERENT pages.
  const jetgoSet = availableSlugSet(JETGO_STORE);
  const overrides = MARKAPET_ALL_EXCLUSIVE_PAGES.filter((p) => jetgoSet.has(p.slug));
  assert.ok(overrides.length > 100, `expected markapet to override many shared jetgo slugs, got ${overrides.length}`);
  let compared = 0;
  for (const p of overrides.slice(0, 300)) {
    const onJetgo = findSeoPage(p.slug, JETGO_STORE)!;
    assert.notEqual(onJetgo.storeId, "markapet", `${p.slug}: jetgomarket must serve its OWN page, not the markapet one`);
    assert.notEqual(p.metaTitle, onJetgo.metaTitle, `${p.slug}: metaTitle must differ from jetgomarket`);
    assert.notEqual(p.h1, onJetgo.h1, `${p.slug}: h1 must differ from jetgomarket`);
    assert.notEqual(markalarCopy(p), markalarCopy(onJetgo), `${p.slug}: body must differ from jetgomarket`);
    compared++;
  }
  assert.ok(compared > 100, `expected many jetgomarket comparisons, got ${compared}`);
});

test("markapet-all: content is UNIQUE-by-CONTENT vs the atakumbiz-all corpus (local sibling, distinct copy)", () => {
  const bizBySlug = new Map(ATAKUMBIZ_ALL_EXCLUSIVE_PAGES.map((p) => [p.slug, p] as const));
  let compared = 0;
  for (const p of MARKAPET_ALL_EXCLUSIVE_PAGES) {
    const biz = bizBySlug.get(p.slug);
    if (!biz) continue;
    assert.notEqual(p.metaTitle, biz.metaTitle, `${p.slug}: metaTitle must differ from atakumbiz-all`);
    assert.notEqual(p.h1, biz.h1, `${p.slug}: h1 must differ from atakumbiz-all`);
    assert.notEqual(markalarCopy(p), markalarCopy(biz), `${p.slug}: body must differ from atakumbiz-all`);
    compared++;
    if (compared >= 400) break;
  }
  assert.ok(compared > 100, `expected many atakumbiz-all comparisons, got ${compared}`);
});

test("markapet-all: content is UNIQUE-by-CONTENT vs the jetgoshop-all corpus (distinct copy banks)", () => {
  const shopBySlug = new Map(JETGOSHOP_ALL_EXCLUSIVE_PAGES.map((p) => [p.slug, p] as const));
  let compared = 0;
  for (const p of MARKAPET_ALL_EXCLUSIVE_PAGES) {
    const shop = shopBySlug.get(p.slug);
    if (!shop) continue;
    assert.notEqual(p.metaTitle, shop.metaTitle, `${p.slug}: metaTitle must differ from jetgoshop-all`);
    assert.notEqual(markalarCopy(p), markalarCopy(shop), `${p.slug}: body must differ from jetgoshop-all`);
    compared++;
    if (compared >= 300) break;
  }
  assert.ok(compared > 100, `expected many jetgoshop-all comparisons, got ${compared}`);
});

test("markapet-all: live-animal pages never claim to sell animals", () => {
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const AFFIRM = /sat[ıi]yoruz|satar[ıi]z|satışı yap[ıi]yoruz|satışı yapar[ıi]z|satın alabilirsiniz|canlı hayvan (satıyoruz|satarız|mevcut|stok)/;
  const live = MARKAPET_ALL_EXCLUSIVE_PAGES.filter((p) => MARKAPET_LIVE_MARK.test(p.metaTitle));
  assert.ok(live.length > 50, `expected a body of live-animal pages, got ${live.length}`);
  for (const p of live) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: live page must state marka.pet does not sell live animals`);
    assert.ok(!AFFIRM.test(digerBody(p)), `${p.slug}: live page must not affirmatively offer animals for sale`);
  }
});

test("markapet-all: every live-animal acquisition KEYWORD is truth-safe (broad slug-derived recall)", () => {
  const ANIMAL_STEM = ["kedi","kopek","yavru","kitten","puppy","muhabbet","kanarya","papagan","sultan","paraket","finch","ispinoz","saka","kus","tavsan","hamster","ginepig","gine","kemirgen","sinsilla","gerbil","fare","sican","balik","lepistes","moli","melek","japon","kaplumbaga","iguana","gekko","yilan","surungen"];
  const CUE = new Set(["canli","satilik","satlik","satis","satisi","satan","satanlar","satilan","satma","sat","satin","sahiplen","sahiplendirme","almak","alma","alinir","alan","alanlar","alici","alicisi","bedava","ucretsiz","sahibinden"]);
  const PROD_SVC = new Set(["ev","evi","kum","kumu","yag","yagi","otu","kab","kabi","yem","yemi","kafes","kafesi","mama","mamasi","tasma","tuvalet","kemik","gaga","tuy","catnip","nane","zehir","kapan","damla","minder","yatak","suluk","oyuncak","oyun","alani","alanlari","vitamin","vitaminler","sampuan","tarak","firca","kiyafet","canta","tasima","kulube","kulubesi","kumes","mineral","file","aksesuar","malzeme","urun","isimlik","egitim","egitimi","kuafor","pansiyon","otel","veteriner","merkez","merkezi","gezdirme","kosum","macun","malt","altligi","alisveris","alisverisi","alistirma","aliskin"]);
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const AFFIRM = /sat[ıi]yoruz|satar[ıi]z|satışı yap[ıi]yoruz|satışı yapar[ıi]z|satın alabilirsiniz|canlı hayvan (satıyoruz|satarız|mevcut|stok)/;
  const candidates = MARKAPET_ALL_EXCLUSIVE_PAGES.filter((p) => {
    const t = p.slug.split("-");
    const hasAnimal = t.some((x) => ANIMAL_STEM.some((a) => x.startsWith(a)));
    const hasCue = t.some((x) => CUE.has(x));
    const hasProdSvc = t.some((x) => PROD_SVC.has(x));
    return hasAnimal && hasCue && !hasProdSvc && !ATAKUM_ALL_FOOD_SKU.test(p.slug);
  });
  assert.ok(candidates.length > 100, `expected a large live-sale candidate body, got ${candidates.length}`);
  for (const p of candidates) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: live-sale keyword must state marka.pet does not sell live animals`);
    assert.ok(!AFFIRM.test(digerBody(p)), `${p.slug}: live-sale keyword must not affirmatively offer animals for sale`);
  }
});

test("markapet-all: every bird/rabbit PRICE keyword is truth-safe (broad slug-derived recall)", () => {
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const BIRD_RABBIT = ["muhabbet","papagan","sultan","kanarya","paraket","finch","ispinoz","saka","kus","kakadu","kakariki","jako","forpus","sevda","cennet","tavsan"];
  const PRICE = new Set(["fiyat","fiyati","fiyatlari","ucuz"]);
  const PROD_SVC = new Set(["yem","yemi","yemlik","kafes","kafesi","kafesli","folluk","yumurtalik","suluk","sulugu","kumes","kumesi","kulube","kulubesi","tasma","tasmasi","oyuncak","oyun","vitamin","takviye","takim","mama","mamasi","mamalari","gaga","tuy","isimlik","aksesuar","malzeme","urun","mineral","file","kum","kumu","tuvalet","tuvaleti","kulucka","korse","agizlik","ev","evi","koruyucu","yara","sok","akilli","alani","alanlari","alistirma","alisveris","alisverisi","egitim","egitimi","kuafor","pansiyon","veteriner","merkez","merkezi","gezdirme","tras","yikama","altligi"]);
  const candidates = MARKAPET_ALL_EXCLUSIVE_PAGES.filter((p) => {
    const t = p.slug.split("-");
    const hasAnimal = t.some((x) => BIRD_RABBIT.some((a) => x.startsWith(a)));
    const hasPrice = t.some((x) => PRICE.has(x)) || p.slug.includes("ne-kadar");
    const hasProdSvc = t.some((x) => PROD_SVC.has(x));
    return hasAnimal && hasPrice && !hasProdSvc && !ATAKUM_ALL_FOOD_SKU.test(p.slug) && !MARKAPET_RETAILER_MARK.test(p.metaTitle);
  });
  assert.ok(candidates.length > 100, `expected a large bird/rabbit price candidate body, got ${candidates.length}`);
  for (const p of candidates) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: bird/rabbit price keyword must state marka.pet does not sell live animals`);
  }
});

test("markapet-all: every breed PRICE keyword is truth-safe; breed-named FOOD SKUs stay product", () => {
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const BREED = ["persian","persan","british","scottish","sphynx","maine","coon","ragdoll","tekir","sarman","bengal","labrador","golden","rottweiler","chihuahua","yorkshire","shih","cocker","bulldog","cane","teckel","dachshund","poodle","pomeranian","boxer","german","beagle","husky","retriever","terrier","kangal","akbas","pug"];
  const PRICE = new Set(["fiyat","fiyati","fiyatlari","ucuz"]);
  const PROD_SVC = new Set(["mama","mamasi","mamalari","kumu","kafes","kafesi","kafesli","tasma","tasmasi","yatak","yatagi","minder","oyuncak","sampuan","vitamin","takviye","tarak","firca","kiyafet","canta","kulube","kulubesi","ev","evi","tuvalet","suluk","kab","kabi","macun","malt","catnip","kemik","damla","mineral","aksesuar","malzeme","urun","egitim","egitimi","kuafor","pansiyon","otel","veteriner","merkez","merkezi","gezdirme","tras","yikama","altligi","alisveris","alistirma"]);
  const candidates = MARKAPET_ALL_EXCLUSIVE_PAGES.filter((p) => {
    const t = p.slug.split("-");
    const hasBreed = t.some((x) => BREED.includes(x));
    const hasPrice = t.some((x) => PRICE.has(x)) || p.slug.includes("ne-kadar");
    const hasProdSvc = t.some((x) => PROD_SVC.has(x));
    return hasBreed && hasPrice && !hasProdSvc && !ATAKUM_ALL_FOOD_SKU.test(p.slug) && !MARKAPET_RETAILER_MARK.test(p.metaTitle);
  });
  assert.ok(candidates.length >= 5, `expected a body of breed price candidates, got ${candidates.length}`);
  for (const p of candidates) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: breed price keyword must state marka.pet does not sell live animals`);
  }
  // The inverse: a breed-NAMED food SKU is a product, never a live no-sale page.
  const foodBreed = MARKAPET_ALL_EXCLUSIVE_PAGES.filter(
    (p) => ATAKUM_ALL_FOOD_SKU.test(p.slug) && /(british|scottish|persian|persan|golden|labrador|terrier|retriever|bulldog|shorthair|pug|yorkshire)/.test(p.slug),
  );
  assert.ok(foodBreed.length > 0, "expected some breed-named food SKUs in the corpus");
  for (const p of foodBreed) {
    assert.ok(!NO_SALE.test(markalarCopy(p)), `${p.slug}: breed-named food SKU must NOT be framed as a live-animal no-sale page`);
  }
});

test("markapet-all: service keywords never claim marka.pet provides the service", () => {
  const NOT_PROVIDED = /hizmet(i)? (vermiyoruz|vermez|vermeyiz)|hizmet değil/i;
  const PROVIDES = /hizmet(i)? (veriyoruz|sağlıyoruz|sunuyoruz)|eğitim veriyoruz|pansiyonumuz/i;
  const servicePages = MARKAPET_ALL_EXCLUSIVE_PAGES.filter((p) => MARKAPET_SERVICE_MARK.test(p.metaTitle));
  assert.ok(servicePages.length > 20, `expected a body of service pages, got ${servicePages.length}`);
  for (const p of servicePages) {
    const copy = markalarCopy(p);
    assert.match(copy, NOT_PROVIDED, `${p.slug}: service page must disclaim that marka.pet provides the service`);
    assert.ok(!PROVIDES.test(copy), `${p.slug}: service page must not claim marka.pet provides the service`);
  }
});

test("markapet-all: retailer keywords position marka.pet as an independent alternative, never the marketplace", () => {
  const INDEPENDENT = /bağımsız bir işletme|resmi bir bağlantımız yok/i;
  const AFFILIATED = /resmi (bayi|satıcı|distribütör)|yetkili (bayi|satıcı)/i;
  const retail = MARKAPET_ALL_EXCLUSIVE_PAGES.filter((p) => MARKAPET_RETAILER_MARK.test(p.metaTitle));
  assert.ok(retail.length > 50, `expected a body of retailer pages, got ${retail.length}`);
  for (const p of retail) {
    const copy = markalarCopy(p);
    assert.match(copy, INDEPENDENT, `${p.slug}: retailer page must disclaim affiliation with the marketplace`);
    assert.ok(!AFFILIATED.test(copy), `${p.slug}: retailer page must not imply official marketplace affiliation`);
  }
});

test("markapet-all: no page makes a nöbetçi / 24-saat / gece-açık (always-open) claim", () => {
  // A same-day store delivers within working hours — it is NOT a 24h/nöbetçi
  // operation, so no served surface may affirm an always-open trait.
  const offenders = MARKAPET_ALL_EXCLUSIVE_PAGES.filter((p) => NIGHT_CLAIM_RE.test(markapetBody(p)));
  assert.equal(
    offenders.length,
    0,
    `pages must not claim an always-open/24h trait (offenders: ${offenders.slice(0, 5).map((p) => p.slug).join(", ")})`,
  );
});

test("markapet-all: no page fabricates a concrete price", () => {
  const PRICE = /\d[\d.,]*\s*(₺|tl\b|lira\b)|₺\s*\d/i;
  const bad = MARKAPET_ALL_EXCLUSIVE_PAGES.filter((p) => PRICE.test(markalarCopy(p)));
  assert.equal(
    bad.length,
    0,
    `pages must not state a concrete price (offenders: ${bad.slice(0, 5).map((p) => p.slug).join(", ")})`,
  );
});

test("markapet-all: SSR serves marka.pet's bespoke local content, self-canonical, differs from jetgomarket", async () => {
  const jetgoSet = availableSlugSet(JETGO_STORE);
  const overrideSlug = MARKAPET_ALL_EXCLUSIVE_PAGES.find((p) => jetgoSet.has(p.slug))!.slug;
  const mpPage = findSeoPage(overrideSlug, MARKAPET_STORE)!;
  assert.equal(mpPage.storeId, "markapet", "marka.pet must serve its own store-scoped override");

  const mpHtml = await injectAllMeta(INDEX_HTML, `/${overrideSlug}`, MARKAPET_HOST);
  const mpTitle = mpHtml.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const mpCanon = mpHtml.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? "";
  assert.equal(
    mpTitle,
    escapeHtmlForTest(brandifyFor(MARKAPET_STORE, mpPage.metaTitle)),
    "marka.pet SSR <title> must be its own brandified metaTitle",
  );
  assert.equal(mpCanon, `${MARKAPET_STORE.domain}/${overrideSlug}`, "marka.pet SSR canonical must bind to marka.pet");
  assert.ok(!/JETGO/i.test(mpTitle), "marka.pet SSR title must not leak the JETGO brand");

  // The SAME slug on jetgomarket.com → a DIFFERENT title (jetgo's own page),
  // self-canonical to jetgomarket. No cross-domain leak in either direction.
  const jetgoHtml = await injectAllMeta(INDEX_HTML, `/${overrideSlug}`, JETGO_HOST);
  const jetgoTitle = jetgoHtml.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const jetgoCanon = jetgoHtml.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? "";
  assert.notEqual(mpTitle, jetgoTitle, "marka.pet title must differ from jetgomarket at the same slug");
  assert.equal(jetgoCanon, `${JETGO_STORE.domain}/${overrideSlug}`, "jetgomarket canonical must bind to jetgomarket");
  assert.ok(!mpCanon.includes(JETGO_STORE.domain), "marka.pet canonical must not leak the jetgomarket domain");
});

// ===========================================================================
// KARADENIZ PET SHOP broad keyword corpus (karadenizpetshop.com, store id
// "karadeniz") — the 9th corpus, a LOCAL same-day Samsun store in a KÖKLÜ /
// neighborly TRUST voice ("Samsunlu komşunuz"). It delivers same-day in the
// Samsun area (Atakum, İlkadım, Canik, Tekkeköy) with kapıda ödeme + kurye — NO
// Türkiye-geneli cargo. The corpus must therefore be LOCAL-framed AND truth-safe:
// it must read distinct from
//   • the SHARED jetgomarket.com keyword pages,
//   • the markapet-all corpus (marka.pet, a LOCAL same-day sibling), AND
//   • the jetgoshop-all corpus (jetgo.shop, "JETGO Pet Shop"),
// while AFFIRMING the same-day / door-payment / local-presence trait that is now
// true for every page. Pages carry availability "localOnly".
// Thresholds are MEASURED against the markalar+diger universe (~4992 pages),
// which is smaller than markapet's atakum-all universe — so they are tuned down
// from the markapet numbers, never blindly copied.
// ===========================================================================
const KARADENIZ_STORE = getStoreByHost(KARADENIZ_HOST);
// Intent pages are identified by their (exclusive) metaTitle markers — chosen to
// differ from every sibling corpus (markapet "Sahiplenme Önerisi"/"Yerel
// Alternatif"/"Hizmet Notu", atakumbiz/jetgoshop variants) AND to read in a
// KÖKLÜ / neighborly TRUST voice.
const KARADENIZ_LIVE_MARK = /Sahiplendirme Rehberi/;
const KARADENIZ_RETAILER_MARK = /Bağımsız Yerel Adres/;
const KARADENIZ_SERVICE_MARK = /Yönlendirme Notu/;
// Local body surfaces — the rendered prose now AFFIRMS the same-day/local trait
// (the keyword K survives raw in slug/title/metaTitle/keywords for SEO too); the
// local-signature scan runs over the rendered prose, never just the SEO meta.
function karadenizBody(p: SeoPageData): string {
  return [
    p.metaDescription,
    p.h1,
    ...(p.intro ?? []),
    ...(p.sections ?? []).flatMap((s) => [s.h2, ...(s.paragraphs ?? []), ...(s.list ?? [])]),
    ...(p.features ?? []),
    ...((p.faq ?? []).flatMap((f) => [f.q, f.a])),
  ].join(" ");
}

test("karadeniz-all: a large keyword corpus is registered, exclusive, and complete (localOnly)", () => {
  assert.ok(
    KARADENIZ_ALL_EXCLUSIVE_PAGES.length > 4000,
    `expected a large karadeniz-all corpus, got ${KARADENIZ_ALL_EXCLUSIVE_PAGES.length}`,
  );
  const slugs = KARADENIZ_ALL_EXCLUSIVE_PAGES.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, "karadeniz-all corpus must have unique slugs");
  for (const p of KARADENIZ_ALL_EXCLUSIVE_PAGES) {
    assert.equal(p.storeId, "karadeniz", `${p.slug}: karadeniz-all page must be storeId karadeniz`);
    assert.equal(p.availability, "localOnly", `${p.slug}: karadeniz-all page must be localOnly`);
    assert.equal(p.type, "keyword", `${p.slug}: karadeniz-all page must be a keyword page`);
    assert.ok(
      p.metaTitle && p.metaDescription && p.h1 &&
      (p.intro ?? []).length && (p.sections ?? []).length &&
      (p.faq ?? []).length && (p.internalLinks ?? []).length,
      `${p.slug}: must carry title/meta/h1 + intro/sections/faq/internalLinks for a substantive AI-search page`,
    );
    // Genuine Karadeniz Pet Shop first-party content (real NAP phone) — not a brand swap.
    assert.match(markalarCopy(p), /0850 840 39 59/, `${p.slug}: must carry the Karadeniz Pet Shop NAP phone`);
    // No slug may shadow a real client app route.
    assert.ok(!RESERVED_APP_SLUGS.has(p.slug), `${p.slug}: must not shadow a reserved app route`);
  }
});

test("karadeniz-all: noise keywords are skipped and the rest are registered", () => {
  assert.ok(KARADENIZ_ALL_SKIPPED_NOISE > 0, "expected some noise keywords (e.g. Spanish 'buscar') to be skipped");
  assert.ok(
    KARADENIZ_ALL_KEYWORD_PAGES.length >= KARADENIZ_ALL_EXCLUSIVE_PAGES.length,
    "generated pages must be a superset of the registered exclusive corpus (curated collisions dropped)",
  );
});

test("karadeniz-all: EVERY page affirms the local same-day / door-payment trait", () => {
  // The local invariant. Scan the rendered BODY of EVERY page — these are now
  // truthful same-day Samsun stores, so every page must carry the local signal.
  const missing = KARADENIZ_ALL_EXCLUSIVE_PAGES.filter((p) => !LOCAL_SIGNATURE_RE.test(karadenizBody(p)));
  assert.equal(
    missing.length,
    0,
    `local pages must affirm a same-day/door/kurye trait (offenders: ${missing.slice(0, 5).map((p) => p.slug).join(", ")})`,
  );
});

test("karadeniz-all: every metaDescription carries the same-day local signature, never a cargo one", () => {
  const missing = KARADENIZ_ALL_EXCLUSIVE_PAGES.filter((p) => !SAME_DAY_SIGNATURE.test(p.metaDescription ?? ""));
  assert.equal(missing.length, 0, `metaDescriptions must carry the same-day signature (offenders: ${missing.slice(0, 5).map((p) => p.slug).join(", ")})`);
  const cargo = KARADENIZ_ALL_EXCLUSIVE_PAGES.filter((p) => CARGO_SIGNATURE.test(p.metaDescription ?? ""));
  assert.equal(cargo.length, 0, `metaDescriptions must not carry the cargo signature (offenders: ${cargo.slice(0, 5).map((p) => p.slug).join(", ")})`);
});

test("karadeniz-all: every internal link resolves within karadenizpetshop.com's own slug space", () => {
  const kzSet = availableSlugSet(KARADENIZ_STORE);
  let checked = 0;
  for (const p of KARADENIZ_ALL_EXCLUSIVE_PAGES) {
    for (const l of p.internalLinks ?? []) {
      const target = (l.href ?? "").replace(/^\//, "");
      if (!target || target.includes("/")) continue; // skip non-flat (parametric) routes
      checked++;
      assert.ok(kzSet.has(target), `${p.slug}: internal link "/${target}" must resolve on karadenizpetshop.com`);
    }
  }
  assert.ok(checked > 1000, `expected many internal links to verify, got ${checked}`);
});

test("karadeniz-all: karadeniz-tagged pages never leak to any other store; overrides stay store-scoped", () => {
  for (const store of [
    JETGO_STORE,
    SIBLING_LOCAL_STORE,
    OTHER_LOCAL_STORE,
    ATAKUM_STORE,
    CARGO_STORE_FOR_ATAKUM,
    JETGOSHOP_STORE,
    ATAKUMBIZ_STORE,
    MARKAPET_STORE,
  ]) {
    const foreign = getSeoPagesForStore(store).filter((p) => p.storeId === "karadeniz");
    assert.equal(foreign.length, 0, `${store.id}: must not serve any karadeniz-tagged page`);
  }
  // Override scoping: the SAME slug yields karadeniz's page on karadenizpetshop.com
  // and a DIFFERENT, non-karadeniz page on jetgomarket — same URL, store-scoped.
  const jetgoSet = availableSlugSet(JETGO_STORE);
  const overridePage = KARADENIZ_ALL_EXCLUSIVE_PAGES.find((p) => jetgoSet.has(p.slug));
  assert.ok(overridePage, "expected the karadeniz corpus to override at least one shared jetgo slug");
  const overrideSlug = overridePage!.slug;
  assert.equal(
    findSeoPage(overrideSlug, KARADENIZ_STORE)?.storeId,
    "karadeniz",
    `${overrideSlug}: karadenizpetshop.com must serve its own (karadeniz-tagged) override`,
  );
  const onJetgo = findSeoPage(overrideSlug, JETGO_STORE);
  assert.ok(onJetgo, `${overrideSlug}: jetgomarket must still serve its own page at this slug`);
  assert.notEqual(onJetgo!.storeId, "karadeniz", `${overrideSlug}: jetgomarket must NOT serve the karadeniz-tagged page`);
});

test("karadeniz-all: the corpus is served on karadenizpetshop.com's sitemap with no foreign exclusives", () => {
  const sm = getSitemapPagesForStore(KARADENIZ_STORE);
  const own = sm.filter((p) => p.storeId === "karadeniz").length;
  assert.ok(own > 4000, `karadenizpetshop.com sitemap must list its own exclusives, got ${own}`);
  assert.equal(
    sm.filter((p) => p.storeId && p.storeId !== "karadeniz").length,
    0,
    "karadenizpetshop.com sitemap must not list any foreign store-exclusive page",
  );
});

test("karadeniz-all: content is UNIQUE-by-CONTENT vs jetgomarket.com (own brand, distinct prose)", () => {
  for (const p of KARADENIZ_ALL_EXCLUSIVE_PAGES.slice(0, 200)) {
    assert.match(p.metaTitle, /Karadeniz Pet Shop/, `${p.slug}: metaTitle must carry the Karadeniz Pet Shop brand`);
  }
  // Distinct metaTitles (human-sounding, not one templated string).
  const titles = new Set(KARADENIZ_ALL_EXCLUSIVE_PAGES.map((p) => p.metaTitle));
  assert.ok(titles.size > 4000, `metaTitles must be largely unique, got ${titles.size}`);

  // At a SHARED slug, karadenizpetshop.com and jetgomarket serve DIFFERENT pages.
  const jetgoSet = availableSlugSet(JETGO_STORE);
  const overrides = KARADENIZ_ALL_EXCLUSIVE_PAGES.filter((p) => jetgoSet.has(p.slug));
  assert.ok(overrides.length > 100, `expected karadeniz to override many shared jetgo slugs, got ${overrides.length}`);
  let compared = 0;
  for (const p of overrides.slice(0, 300)) {
    const onJetgo = findSeoPage(p.slug, JETGO_STORE)!;
    assert.notEqual(onJetgo.storeId, "karadeniz", `${p.slug}: jetgomarket must serve its OWN page, not the karadeniz one`);
    assert.notEqual(p.metaTitle, onJetgo.metaTitle, `${p.slug}: metaTitle must differ from jetgomarket`);
    assert.notEqual(p.h1, onJetgo.h1, `${p.slug}: h1 must differ from jetgomarket`);
    assert.notEqual(markalarCopy(p), markalarCopy(onJetgo), `${p.slug}: body must differ from jetgomarket`);
    compared++;
  }
  assert.ok(compared > 100, `expected many jetgomarket comparisons, got ${compared}`);
});

test("karadeniz-all: content is UNIQUE-by-CONTENT vs the markapet-all corpus (sibling cargo, distinct copy)", () => {
  const mpBySlug = new Map(MARKAPET_ALL_EXCLUSIVE_PAGES.map((p) => [p.slug, p] as const));
  let compared = 0;
  for (const p of KARADENIZ_ALL_EXCLUSIVE_PAGES) {
    const mp = mpBySlug.get(p.slug);
    if (!mp) continue;
    assert.notEqual(p.metaTitle, mp.metaTitle, `${p.slug}: metaTitle must differ from markapet-all`);
    assert.notEqual(p.h1, mp.h1, `${p.slug}: h1 must differ from markapet-all`);
    assert.notEqual(markalarCopy(p), markalarCopy(mp), `${p.slug}: body must differ from markapet-all`);
    compared++;
    if (compared >= 400) break;
  }
  assert.ok(compared > 100, `expected many markapet-all comparisons, got ${compared}`);
});

test("karadeniz-all: content is UNIQUE-by-CONTENT vs the jetgoshop-all corpus (distinct copy banks)", () => {
  const shopBySlug = new Map(JETGOSHOP_ALL_EXCLUSIVE_PAGES.map((p) => [p.slug, p] as const));
  let compared = 0;
  for (const p of KARADENIZ_ALL_EXCLUSIVE_PAGES) {
    const shop = shopBySlug.get(p.slug);
    if (!shop) continue;
    assert.notEqual(p.metaTitle, shop.metaTitle, `${p.slug}: metaTitle must differ from jetgoshop-all`);
    assert.notEqual(markalarCopy(p), markalarCopy(shop), `${p.slug}: body must differ from jetgoshop-all`);
    compared++;
    if (compared >= 300) break;
  }
  assert.ok(compared > 100, `expected many jetgoshop-all comparisons, got ${compared}`);
});

test("karadeniz-all: live-animal pages never claim to sell animals", () => {
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const AFFIRM = /sat[ıi]yoruz|satar[ıi]z|satışı yap[ıi]yoruz|satışı yapar[ıi]z|satın alabilirsiniz|canlı hayvan (satıyoruz|satarız|mevcut|stok)/;
  const live = KARADENIZ_ALL_EXCLUSIVE_PAGES.filter((p) => KARADENIZ_LIVE_MARK.test(p.metaTitle));
  assert.ok(live.length > 50, `expected a body of live-animal pages, got ${live.length}`);
  for (const p of live) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: live page must state Karadeniz Pet Shop does not sell live animals`);
    assert.ok(!AFFIRM.test(digerBody(p)), `${p.slug}: live page must not affirmatively offer animals for sale`);
  }
});

test("karadeniz-all: every live-animal acquisition KEYWORD is truth-safe (broad slug-derived recall)", () => {
  const ANIMAL_STEM = ["kedi","kopek","yavru","kitten","puppy","muhabbet","kanarya","papagan","sultan","paraket","finch","ispinoz","saka","kus","tavsan","hamster","ginepig","gine","kemirgen","sinsilla","gerbil","fare","sican","balik","lepistes","moli","melek","japon","kaplumbaga","iguana","gekko","yilan","surungen"];
  const CUE = new Set(["canli","satilik","satlik","satis","satisi","satan","satanlar","satilan","satma","sat","satin","sahiplen","sahiplendirme","almak","alma","alinir","alan","alanlar","alici","alicisi","bedava","ucretsiz","sahibinden"]);
  const PROD_SVC = new Set(["ev","evi","kum","kumu","yag","yagi","otu","kab","kabi","yem","yemi","kafes","kafesi","mama","mamasi","tasma","tuvalet","kemik","gaga","tuy","catnip","nane","zehir","kapan","damla","minder","yatak","suluk","oyuncak","oyun","alani","alanlari","vitamin","vitaminler","sampuan","tarak","firca","kiyafet","canta","tasima","kulube","kulubesi","kumes","mineral","file","aksesuar","malzeme","urun","isimlik","egitim","egitimi","kuafor","pansiyon","otel","veteriner","merkez","merkezi","gezdirme","kosum","macun","malt","altligi","alisveris","alisverisi","alistirma","aliskin"]);
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const AFFIRM = /sat[ıi]yoruz|satar[ıi]z|satışı yap[ıi]yoruz|satışı yapar[ıi]z|satın alabilirsiniz|canlı hayvan (satıyoruz|satarız|mevcut|stok)/;
  const candidates = KARADENIZ_ALL_EXCLUSIVE_PAGES.filter((p) => {
    const t = p.slug.split("-");
    const hasAnimal = t.some((x) => ANIMAL_STEM.some((a) => x.startsWith(a)));
    const hasCue = t.some((x) => CUE.has(x));
    const hasProdSvc = t.some((x) => PROD_SVC.has(x));
    return hasAnimal && hasCue && !hasProdSvc && !ATAKUM_ALL_FOOD_SKU.test(p.slug);
  });
  assert.ok(candidates.length > 100, `expected a large live-sale candidate body, got ${candidates.length}`);
  for (const p of candidates) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: live-sale keyword must state Karadeniz Pet Shop does not sell live animals`);
    assert.ok(!AFFIRM.test(digerBody(p)), `${p.slug}: live-sale keyword must not affirmatively offer animals for sale`);
  }
});

test("karadeniz-all: every bird/rabbit PRICE keyword is truth-safe (broad slug-derived recall)", () => {
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const BIRD_RABBIT = ["muhabbet","papagan","sultan","kanarya","paraket","finch","ispinoz","saka","kus","kakadu","kakariki","jako","forpus","sevda","cennet","tavsan"];
  const PRICE = new Set(["fiyat","fiyati","fiyatlari","ucuz"]);
  const PROD_SVC = new Set(["yem","yemi","yemlik","kafes","kafesi","kafesli","folluk","yumurtalik","suluk","sulugu","kumes","kumesi","kulube","kulubesi","tasma","tasmasi","oyuncak","oyun","vitamin","takviye","takim","mama","mamasi","mamalari","gaga","tuy","isimlik","aksesuar","malzeme","urun","mineral","file","kum","kumu","tuvalet","tuvaleti","kulucka","korse","agizlik","ev","evi","koruyucu","yara","sok","akilli","alani","alanlari","alistirma","alisveris","alisverisi","egitim","egitimi","kuafor","pansiyon","veteriner","merkez","merkezi","gezdirme","tras","yikama","altligi"]);
  const candidates = KARADENIZ_ALL_EXCLUSIVE_PAGES.filter((p) => {
    const t = p.slug.split("-");
    const hasAnimal = t.some((x) => BIRD_RABBIT.some((a) => x.startsWith(a)));
    const hasPrice = t.some((x) => PRICE.has(x)) || p.slug.includes("ne-kadar");
    const hasProdSvc = t.some((x) => PROD_SVC.has(x));
    return hasAnimal && hasPrice && !hasProdSvc && !ATAKUM_ALL_FOOD_SKU.test(p.slug) && !KARADENIZ_RETAILER_MARK.test(p.metaTitle);
  });
  assert.ok(candidates.length > 100, `expected a large bird/rabbit price candidate body, got ${candidates.length}`);
  for (const p of candidates) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: bird/rabbit price keyword must state Karadeniz Pet Shop does not sell live animals`);
  }
});

test("karadeniz-all: every breed PRICE keyword is truth-safe; breed-named FOOD SKUs stay product", () => {
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const BREED = ["persian","persan","british","scottish","sphynx","maine","coon","ragdoll","tekir","sarman","bengal","labrador","golden","rottweiler","chihuahua","yorkshire","shih","cocker","bulldog","cane","teckel","dachshund","poodle","pomeranian","boxer","german","beagle","husky","retriever","terrier","kangal","akbas","pug"];
  const PRICE = new Set(["fiyat","fiyati","fiyatlari","ucuz"]);
  const PROD_SVC = new Set(["mama","mamasi","mamalari","kumu","kafes","kafesi","kafesli","tasma","tasmasi","yatak","yatagi","minder","oyuncak","sampuan","vitamin","takviye","tarak","firca","kiyafet","canta","kulube","kulubesi","ev","evi","tuvalet","suluk","kab","kabi","macun","malt","catnip","kemik","damla","mineral","aksesuar","malzeme","urun","egitim","egitimi","kuafor","pansiyon","otel","veteriner","merkez","merkezi","gezdirme","tras","yikama","altligi","alisveris","alistirma"]);
  const candidates = KARADENIZ_ALL_EXCLUSIVE_PAGES.filter((p) => {
    const t = p.slug.split("-");
    const hasBreed = t.some((x) => BREED.includes(x));
    const hasPrice = t.some((x) => PRICE.has(x)) || p.slug.includes("ne-kadar");
    const hasProdSvc = t.some((x) => PROD_SVC.has(x));
    return hasBreed && hasPrice && !hasProdSvc && !ATAKUM_ALL_FOOD_SKU.test(p.slug) && !KARADENIZ_RETAILER_MARK.test(p.metaTitle);
  });
  assert.ok(candidates.length >= 5, `expected a body of breed price candidates, got ${candidates.length}`);
  for (const p of candidates) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: breed price keyword must state Karadeniz Pet Shop does not sell live animals`);
  }
  // The inverse: a breed-NAMED food SKU is a product, never a live no-sale page.
  const foodBreed = KARADENIZ_ALL_EXCLUSIVE_PAGES.filter(
    (p) => ATAKUM_ALL_FOOD_SKU.test(p.slug) && /(british|scottish|persian|persan|golden|labrador|terrier|retriever|bulldog|shorthair|pug|yorkshire)/.test(p.slug),
  );
  assert.ok(foodBreed.length > 0, "expected some breed-named food SKUs in the corpus");
  for (const p of foodBreed) {
    assert.ok(!NO_SALE.test(markalarCopy(p)), `${p.slug}: breed-named food SKU must NOT be framed as a live-animal no-sale page`);
  }
});

test("karadeniz-all: service keywords never claim Karadeniz Pet Shop provides the service", () => {
  const NOT_PROVIDED = /hizmet(i)? (vermiyoruz|vermez|vermeyiz)|hizmet değil/i;
  const PROVIDES = /hizmet(i)? (veriyoruz|sağlıyoruz|sunuyoruz)|eğitim veriyoruz|pansiyonumuz/i;
  const servicePages = KARADENIZ_ALL_EXCLUSIVE_PAGES.filter((p) => KARADENIZ_SERVICE_MARK.test(p.metaTitle));
  assert.ok(servicePages.length > 20, `expected a body of service pages, got ${servicePages.length}`);
  for (const p of servicePages) {
    const copy = markalarCopy(p);
    assert.match(copy, NOT_PROVIDED, `${p.slug}: service page must disclaim that Karadeniz Pet Shop provides the service`);
    assert.ok(!PROVIDES.test(copy), `${p.slug}: service page must not claim Karadeniz Pet Shop provides the service`);
  }
});

test("karadeniz-all: retailer keywords position Karadeniz Pet Shop as an independent alternative, never the marketplace", () => {
  const INDEPENDENT = /bağımsız bir işletme|resmi bir bağlantımız yok/i;
  const AFFILIATED = /resmi (bayi|satıcı|distribütör)|yetkili (bayi|satıcı)/i;
  const retail = KARADENIZ_ALL_EXCLUSIVE_PAGES.filter((p) => KARADENIZ_RETAILER_MARK.test(p.metaTitle));
  assert.ok(retail.length > 50, `expected a body of retailer pages, got ${retail.length}`);
  for (const p of retail) {
    const copy = markalarCopy(p);
    assert.match(copy, INDEPENDENT, `${p.slug}: retailer page must disclaim affiliation with the marketplace`);
    assert.ok(!AFFILIATED.test(copy), `${p.slug}: retailer page must not imply official marketplace affiliation`);
  }
});

test("karadeniz-all: no page makes a nöbetçi / 24-saat / gece-açık (always-open) claim", () => {
  // A same-day store delivers within working hours — it is NOT a 24h/nöbetçi
  // operation, so no served surface may affirm an always-open trait.
  const offenders = KARADENIZ_ALL_EXCLUSIVE_PAGES.filter((p) => NIGHT_CLAIM_RE.test(karadenizBody(p)));
  assert.equal(
    offenders.length,
    0,
    `pages must not claim an always-open/24h trait (offenders: ${offenders.slice(0, 5).map((p) => p.slug).join(", ")})`,
  );
});

test("karadeniz-all: no page fabricates a concrete price", () => {
  const PRICE = /\d[\d.,]*\s*(₺|tl\b|lira\b)|₺\s*\d/i;
  const bad = KARADENIZ_ALL_EXCLUSIVE_PAGES.filter((p) => PRICE.test(markalarCopy(p)));
  assert.equal(
    bad.length,
    0,
    `pages must not state a concrete price (offenders: ${bad.slice(0, 5).map((p) => p.slug).join(", ")})`,
  );
});

test("karadeniz-all: SSR serves karadeniz's bespoke local content, self-canonical, differs from jetgomarket", async () => {
  const jetgoSet = availableSlugSet(JETGO_STORE);
  const overrideSlug = KARADENIZ_ALL_EXCLUSIVE_PAGES.find((p) => jetgoSet.has(p.slug))!.slug;
  const kzPage = findSeoPage(overrideSlug, KARADENIZ_STORE)!;
  assert.equal(kzPage.storeId, "karadeniz", "karadenizpetshop.com must serve its own store-scoped override");

  const kzHtml = await injectAllMeta(INDEX_HTML, `/${overrideSlug}`, KARADENIZ_HOST);
  const kzTitle = kzHtml.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const kzCanon = kzHtml.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? "";
  assert.equal(
    kzTitle,
    escapeHtmlForTest(brandifyFor(KARADENIZ_STORE, kzPage.metaTitle)),
    "karadenizpetshop.com SSR <title> must be its own brandified metaTitle",
  );
  assert.equal(kzCanon, `${KARADENIZ_STORE.domain}/${overrideSlug}`, "karadenizpetshop.com SSR canonical must bind to karadenizpetshop.com");
  assert.ok(!/JETGO/i.test(kzTitle), "karadenizpetshop.com SSR title must not leak the JETGO brand");

  // The SAME slug on jetgomarket.com → a DIFFERENT title (jetgo's own page),
  // self-canonical to jetgomarket. No cross-domain leak in either direction.
  const jetgoHtml = await injectAllMeta(INDEX_HTML, `/${overrideSlug}`, JETGO_HOST);
  const jetgoTitle = jetgoHtml.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const jetgoCanon = jetgoHtml.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? "";
  assert.notEqual(kzTitle, jetgoTitle, "karadenizpetshop.com title must differ from jetgomarket at the same slug");
  assert.equal(jetgoCanon, `${JETGO_STORE.domain}/${overrideSlug}`, "jetgomarket canonical must bind to jetgomarket");
  assert.ok(!kzCanon.includes(JETGO_STORE.domain), "karadenizpetshop.com canonical must not leak the jetgomarket domain");
});

// ===========================================================================
// ATAKUM PET broad keyword corpus (atakumpet.com, store id "samsun") — the 10th
// corpus, a LOCAL same-day Samsun store with an ATAKUM-FIRST, speed-led 1-saatte
// angle: ~1 saat içinde Atakum, aynı gün İlkadım/Canik/Tekkeköy, kapıda ödeme +
// kurye — NO Türkiye-geneli cargo. The corpus must therefore be LOCAL-framed AND
// truth-safe: it must read distinct from
//   • the SHARED jetgomarket.com keyword pages,
//   • the karadeniz-all corpus (karadenizpetshop.com, the SAME-UNIVERSE local
//     sibling — markalar+diger — so EVERY slug overlaps and must read distinct), AND
//   • the jetgoshop-all corpus (jetgo.shop, "JETGO Pet Shop"),
// while AFFIRMING the same-day / door-payment / local-presence trait that is now
// true for every page. Pages carry availability "localOnly".
// The universe is markalar+diger (~4992 pages), identical to karadeniz, so the
// thresholds mirror the karadeniz numbers. samsun and samsunpet.com (id
// "samsunpet") share this universe and must read distinct from each other.
// ===========================================================================
const SAMSUN_STORE = getStoreByHost(SAMSUN_HOST);
const SAMSUNPET_STORE = getStoreByHost(SAMSUNPET_HOST);
// Intent pages are identified by their (exclusive) metaTitle markers — chosen to
// differ from every sibling corpus (markapet "Sahiplenme Önerisi"/"Yerel
// Alternatif"/"Hizmet Notu", karadeniz "Sahiplendirme Rehberi"/"Bağımsız Yerel
// Adres"/"Yönlendirme Notu") AND to read in an ATAKUM-FIRST 1-saatte voice.
const SAMSUN_LIVE_MARK = /Sahiplenme Rehberi/;
const SAMSUN_RETAILER_MARK = /Bağımsız Samsun Adresi/;
const SAMSUN_SERVICE_MARK = /Bilgi Notu/;
// Local body surfaces — the rendered prose now AFFIRMS the same-day/local trait
// (the keyword K survives raw in slug/title/metaTitle/keywords for SEO too); the
// local-signature scan runs over the rendered prose, never just the SEO meta.
function samsunBody(p: SeoPageData): string {
  return [
    p.metaDescription,
    p.h1,
    ...(p.intro ?? []),
    ...(p.sections ?? []).flatMap((s) => [s.h2, ...(s.paragraphs ?? []), ...(s.list ?? [])]),
    ...(p.features ?? []),
    ...((p.faq ?? []).flatMap((f) => [f.q, f.a])),
  ].join(" ");
}

test("samsun-all: a large keyword corpus is registered, exclusive, and complete (localOnly)", () => {
  assert.ok(
    SAMSUN_ALL_EXCLUSIVE_PAGES.length > 4000,
    `expected a large samsun-all corpus, got ${SAMSUN_ALL_EXCLUSIVE_PAGES.length}`,
  );
  const slugs = SAMSUN_ALL_EXCLUSIVE_PAGES.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, "samsun-all corpus must have unique slugs");
  for (const p of SAMSUN_ALL_EXCLUSIVE_PAGES) {
    assert.equal(p.storeId, "samsun", `${p.slug}: samsun-all page must be storeId samsun`);
    assert.equal(p.availability, "localOnly", `${p.slug}: samsun-all page must be localOnly`);
    assert.equal(p.type, "keyword", `${p.slug}: samsun-all page must be a keyword page`);
    assert.ok(
      p.metaTitle && p.metaDescription && p.h1 &&
      (p.intro ?? []).length && (p.sections ?? []).length &&
      (p.faq ?? []).length && (p.internalLinks ?? []).length,
      `${p.slug}: must carry title/meta/h1 + intro/sections/faq/internalLinks for a substantive AI-search page`,
    );
    // Genuine Atakum Pet first-party content (real NAP phone) — not a brand swap.
    assert.match(markalarCopy(p), /0850 840 39 59/, `${p.slug}: must carry the Atakum Pet NAP phone`);
    // No slug may shadow a real client app route.
    assert.ok(!RESERVED_APP_SLUGS.has(p.slug), `${p.slug}: must not shadow a reserved app route`);
  }
});

test("samsun-all: noise keywords are skipped and the rest are registered", () => {
  assert.ok(SAMSUN_ALL_SKIPPED_NOISE > 0, "expected some noise keywords (e.g. Spanish 'buscar') to be skipped");
  assert.ok(
    SAMSUN_ALL_KEYWORD_PAGES.length >= SAMSUN_ALL_EXCLUSIVE_PAGES.length,
    "generated pages must be a superset of the registered exclusive corpus (curated collisions dropped)",
  );
});

test("samsun-all: EVERY page affirms the local same-day / door-payment trait", () => {
  // The local invariant. Scan the rendered BODY of EVERY page — these are now
  // truthful same-day Samsun stores, so every page must carry the local signal.
  const missing = SAMSUN_ALL_EXCLUSIVE_PAGES.filter((p) => !LOCAL_SIGNATURE_RE.test(samsunBody(p)));
  assert.equal(
    missing.length,
    0,
    `local pages must affirm a same-day/door/kurye trait (offenders: ${missing.slice(0, 5).map((p) => p.slug).join(", ")})`,
  );
});

test("samsun-all: every metaDescription carries the same-day local signature, never a cargo one", () => {
  const missing = SAMSUN_ALL_EXCLUSIVE_PAGES.filter((p) => !SAME_DAY_SIGNATURE.test(p.metaDescription ?? ""));
  assert.equal(missing.length, 0, `metaDescriptions must carry the same-day signature (offenders: ${missing.slice(0, 5).map((p) => p.slug).join(", ")})`);
  const cargo = SAMSUN_ALL_EXCLUSIVE_PAGES.filter((p) => CARGO_SIGNATURE.test(p.metaDescription ?? ""));
  assert.equal(cargo.length, 0, `metaDescriptions must not carry the cargo signature (offenders: ${cargo.slice(0, 5).map((p) => p.slug).join(", ")})`);
});

test("samsun-all: every internal link resolves within atakumpet.com's own slug space", () => {
  const samSet = availableSlugSet(SAMSUN_STORE);
  let checked = 0;
  for (const p of SAMSUN_ALL_EXCLUSIVE_PAGES) {
    for (const l of p.internalLinks ?? []) {
      const target = (l.href ?? "").replace(/^\//, "");
      if (!target || target.includes("/")) continue; // skip non-flat (parametric) routes
      checked++;
      assert.ok(samSet.has(target), `${p.slug}: internal link "/${target}" must resolve on atakumpet.com`);
    }
  }
  assert.ok(checked > 1000, `expected many internal links to verify, got ${checked}`);
});

test("samsun-all: samsun-tagged pages never leak to any other store; overrides stay store-scoped", () => {
  for (const store of [
    JETGO_STORE,
    SIBLING_LOCAL_STORE,
    OTHER_LOCAL_STORE,
    ATAKUM_STORE,
    SAMSUNPET_STORE,
    JETGOSHOP_STORE,
    ATAKUMBIZ_STORE,
    MARKAPET_STORE,
    KARADENIZ_STORE,
  ]) {
    const foreign = getSeoPagesForStore(store).filter((p) => p.storeId === "samsun");
    assert.equal(foreign.length, 0, `${store.id}: must not serve any samsun-tagged page`);
  }
  // Override scoping: the SAME slug yields samsun's page on atakumpet.com and a
  // DIFFERENT, non-samsun page on jetgomarket — same URL, store-scoped content.
  const jetgoSet = availableSlugSet(JETGO_STORE);
  const overridePage = SAMSUN_ALL_EXCLUSIVE_PAGES.find((p) => jetgoSet.has(p.slug));
  assert.ok(overridePage, "expected the samsun corpus to override at least one shared jetgo slug");
  const overrideSlug = overridePage!.slug;
  assert.equal(
    findSeoPage(overrideSlug, SAMSUN_STORE)?.storeId,
    "samsun",
    `${overrideSlug}: atakumpet.com must serve its own (samsun-tagged) override`,
  );
  const onJetgo = findSeoPage(overrideSlug, JETGO_STORE);
  assert.ok(onJetgo, `${overrideSlug}: jetgomarket must still serve its own page at this slug`);
  assert.notEqual(onJetgo!.storeId, "samsun", `${overrideSlug}: jetgomarket must NOT serve the samsun-tagged page`);
});

test("samsun-all: the corpus is served on atakumpet.com's sitemap with no foreign exclusives", () => {
  const sm = getSitemapPagesForStore(SAMSUN_STORE);
  const own = sm.filter((p) => p.storeId === "samsun").length;
  assert.ok(own > 4000, `atakumpet.com sitemap must list its own exclusives, got ${own}`);
  assert.equal(
    sm.filter((p) => p.storeId && p.storeId !== "samsun").length,
    0,
    "atakumpet.com sitemap must not list any foreign store-exclusive page",
  );
});

test("samsun-all: content is UNIQUE-by-CONTENT vs jetgomarket.com (own brand, distinct prose)", () => {
  for (const p of SAMSUN_ALL_EXCLUSIVE_PAGES.slice(0, 200)) {
    assert.match(p.metaTitle, /Atakum Pet/, `${p.slug}: metaTitle must carry the Atakum Pet brand`);
  }
  // Distinct metaTitles (human-sounding, not one templated string).
  const titles = new Set(SAMSUN_ALL_EXCLUSIVE_PAGES.map((p) => p.metaTitle));
  assert.ok(titles.size > 4000, `metaTitles must be largely unique, got ${titles.size}`);

  // At a SHARED slug, atakumpet.com and jetgomarket serve DIFFERENT pages.
  const jetgoSet = availableSlugSet(JETGO_STORE);
  const overrides = SAMSUN_ALL_EXCLUSIVE_PAGES.filter((p) => jetgoSet.has(p.slug));
  assert.ok(overrides.length > 100, `expected samsun to override many shared jetgo slugs, got ${overrides.length}`);
  let compared = 0;
  for (const p of overrides.slice(0, 300)) {
    const onJetgo = findSeoPage(p.slug, JETGO_STORE)!;
    assert.notEqual(onJetgo.storeId, "samsun", `${p.slug}: jetgomarket must serve its OWN page, not the samsun one`);
    assert.notEqual(p.metaTitle, onJetgo.metaTitle, `${p.slug}: metaTitle must differ from jetgomarket`);
    assert.notEqual(p.h1, onJetgo.h1, `${p.slug}: h1 must differ from jetgomarket`);
    assert.notEqual(markalarCopy(p), markalarCopy(onJetgo), `${p.slug}: body must differ from jetgomarket`);
    compared++;
  }
  assert.ok(compared > 100, `expected many jetgomarket comparisons, got ${compared}`);
});

test("samsun-all: content is UNIQUE-by-CONTENT vs the karadeniz-all corpus (same-universe cargo sibling, distinct copy)", () => {
  // samsun and karadeniz share the EXACT same slug universe (markalar+diger), so
  // every slug overlaps — the strongest distinctness check. Distinct hash
  // finalizer + salt + reworded phrase banks must make every shared page read
  // differently in title, h1 AND body.
  const kzBySlug = new Map(KARADENIZ_ALL_EXCLUSIVE_PAGES.map((p) => [p.slug, p] as const));
  let compared = 0;
  for (const p of SAMSUN_ALL_EXCLUSIVE_PAGES) {
    const kz = kzBySlug.get(p.slug);
    if (!kz) continue;
    assert.notEqual(p.metaTitle, kz.metaTitle, `${p.slug}: metaTitle must differ from karadeniz-all`);
    assert.notEqual(p.h1, kz.h1, `${p.slug}: h1 must differ from karadeniz-all`);
    assert.notEqual(markalarCopy(p), markalarCopy(kz), `${p.slug}: body must differ from karadeniz-all`);
    compared++;
    if (compared >= 400) break;
  }
  assert.ok(compared > 100, `expected many karadeniz-all comparisons, got ${compared}`);
});

test("samsun-all: content is UNIQUE-by-CONTENT vs the markapet-all corpus (sibling cargo, distinct copy)", () => {
  // marka.pet's universe is atakum-all (a DIFFERENT keyword set), but it overlaps
  // samsun's markalar+diger on the shared slugs; those overlaps must read distinct.
  const mpBySlug = new Map(MARKAPET_ALL_EXCLUSIVE_PAGES.map((p) => [p.slug, p] as const));
  let compared = 0;
  for (const p of SAMSUN_ALL_EXCLUSIVE_PAGES) {
    const mp = mpBySlug.get(p.slug);
    if (!mp) continue;
    assert.notEqual(p.metaTitle, mp.metaTitle, `${p.slug}: metaTitle must differ from markapet-all`);
    assert.notEqual(p.h1, mp.h1, `${p.slug}: h1 must differ from markapet-all`);
    assert.notEqual(markalarCopy(p), markalarCopy(mp), `${p.slug}: body must differ from markapet-all`);
    compared++;
    if (compared >= 400) break;
  }
  assert.ok(compared > 100, `expected many markapet-all comparisons, got ${compared}`);
});

test("samsun-all: content is UNIQUE-by-CONTENT vs the jetgoshop-all corpus (distinct copy banks)", () => {
  const shopBySlug = new Map(JETGOSHOP_ALL_EXCLUSIVE_PAGES.map((p) => [p.slug, p] as const));
  let compared = 0;
  for (const p of SAMSUN_ALL_EXCLUSIVE_PAGES) {
    const shop = shopBySlug.get(p.slug);
    if (!shop) continue;
    assert.notEqual(p.metaTitle, shop.metaTitle, `${p.slug}: metaTitle must differ from jetgoshop-all`);
    assert.notEqual(markalarCopy(p), markalarCopy(shop), `${p.slug}: body must differ from jetgoshop-all`);
    compared++;
    if (compared >= 300) break;
  }
  assert.ok(compared > 100, `expected many jetgoshop-all comparisons, got ${compared}`);
});

test("samsun-all: live-animal pages never claim to sell animals", () => {
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const AFFIRM = /sat[ıi]yoruz|satar[ıi]z|satışı yap[ıi]yoruz|satışı yapar[ıi]z|satın alabilirsiniz|canlı hayvan (satıyoruz|satarız|mevcut|stok)/;
  const live = SAMSUN_ALL_EXCLUSIVE_PAGES.filter((p) => SAMSUN_LIVE_MARK.test(p.metaTitle));
  assert.ok(live.length > 50, `expected a body of live-animal pages, got ${live.length}`);
  for (const p of live) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: live page must state Atakum Pet does not sell live animals`);
    assert.ok(!AFFIRM.test(digerBody(p)), `${p.slug}: live page must not affirmatively offer animals for sale`);
  }
});

test("samsun-all: every live-animal acquisition KEYWORD is truth-safe (broad slug-derived recall)", () => {
  const ANIMAL_STEM = ["kedi","kopek","yavru","kitten","puppy","muhabbet","kanarya","papagan","sultan","paraket","finch","ispinoz","saka","kus","tavsan","hamster","ginepig","gine","kemirgen","sinsilla","gerbil","fare","sican","balik","lepistes","moli","melek","japon","kaplumbaga","iguana","gekko","yilan","surungen"];
  const CUE = new Set(["canli","satilik","satlik","satis","satisi","satan","satanlar","satilan","satma","sat","satin","sahiplen","sahiplendirme","almak","alma","alinir","alan","alanlar","alici","alicisi","bedava","ucretsiz","sahibinden"]);
  const PROD_SVC = new Set(["ev","evi","kum","kumu","yag","yagi","otu","kab","kabi","yem","yemi","kafes","kafesi","mama","mamasi","tasma","tuvalet","kemik","gaga","tuy","catnip","nane","zehir","kapan","damla","minder","yatak","suluk","oyuncak","oyun","alani","alanlari","vitamin","vitaminler","sampuan","tarak","firca","kiyafet","canta","tasima","kulube","kulubesi","kumes","mineral","file","aksesuar","malzeme","urun","isimlik","egitim","egitimi","kuafor","pansiyon","otel","veteriner","merkez","merkezi","gezdirme","kosum","macun","malt","altligi","alisveris","alisverisi","alistirma","aliskin"]);
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const AFFIRM = /sat[ıi]yoruz|satar[ıi]z|satışı yap[ıi]yoruz|satışı yapar[ıi]z|satın alabilirsiniz|canlı hayvan (satıyoruz|satarız|mevcut|stok)/;
  const candidates = SAMSUN_ALL_EXCLUSIVE_PAGES.filter((p) => {
    const t = p.slug.split("-");
    const hasAnimal = t.some((x) => ANIMAL_STEM.some((a) => x.startsWith(a)));
    const hasCue = t.some((x) => CUE.has(x));
    const hasProdSvc = t.some((x) => PROD_SVC.has(x));
    return hasAnimal && hasCue && !hasProdSvc && !ATAKUM_ALL_FOOD_SKU.test(p.slug);
  });
  assert.ok(candidates.length > 100, `expected a large live-sale candidate body, got ${candidates.length}`);
  for (const p of candidates) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: live-sale keyword must state Atakum Pet does not sell live animals`);
    assert.ok(!AFFIRM.test(digerBody(p)), `${p.slug}: live-sale keyword must not affirmatively offer animals for sale`);
  }
});

test("samsun-all: every bird/rabbit PRICE keyword is truth-safe (broad slug-derived recall)", () => {
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const BIRD_RABBIT = ["muhabbet","papagan","sultan","kanarya","paraket","finch","ispinoz","saka","kus","kakadu","kakariki","jako","forpus","sevda","cennet","tavsan"];
  const PRICE = new Set(["fiyat","fiyati","fiyatlari","ucuz"]);
  const PROD_SVC = new Set(["yem","yemi","yemlik","kafes","kafesi","kafesli","folluk","yumurtalik","suluk","sulugu","kumes","kumesi","kulube","kulubesi","tasma","tasmasi","oyuncak","oyun","vitamin","takviye","takim","mama","mamasi","mamalari","gaga","tuy","isimlik","aksesuar","malzeme","urun","mineral","file","kum","kumu","tuvalet","tuvaleti","kulucka","korse","agizlik","ev","evi","koruyucu","yara","sok","akilli","alani","alanlari","alistirma","alisveris","alisverisi","egitim","egitimi","kuafor","pansiyon","veteriner","merkez","merkezi","gezdirme","tras","yikama","altligi"]);
  const candidates = SAMSUN_ALL_EXCLUSIVE_PAGES.filter((p) => {
    const t = p.slug.split("-");
    const hasAnimal = t.some((x) => BIRD_RABBIT.some((a) => x.startsWith(a)));
    const hasPrice = t.some((x) => PRICE.has(x)) || p.slug.includes("ne-kadar");
    const hasProdSvc = t.some((x) => PROD_SVC.has(x));
    return hasAnimal && hasPrice && !hasProdSvc && !ATAKUM_ALL_FOOD_SKU.test(p.slug) && !SAMSUN_RETAILER_MARK.test(p.metaTitle);
  });
  assert.ok(candidates.length > 100, `expected a large bird/rabbit price candidate body, got ${candidates.length}`);
  for (const p of candidates) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: bird/rabbit price keyword must state Atakum Pet does not sell live animals`);
  }
});

test("samsun-all: every breed PRICE keyword is truth-safe; breed-named FOOD SKUs stay product", () => {
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const BREED = ["persian","persan","british","scottish","sphynx","maine","coon","ragdoll","tekir","sarman","bengal","labrador","golden","rottweiler","chihuahua","yorkshire","shih","cocker","bulldog","cane","teckel","dachshund","poodle","pomeranian","boxer","german","beagle","husky","retriever","terrier","kangal","akbas","pug"];
  const PRICE = new Set(["fiyat","fiyati","fiyatlari","ucuz"]);
  const PROD_SVC = new Set(["mama","mamasi","mamalari","kumu","kafes","kafesi","kafesli","tasma","tasmasi","yatak","yatagi","minder","oyuncak","sampuan","vitamin","takviye","tarak","firca","kiyafet","canta","kulube","kulubesi","ev","evi","tuvalet","suluk","kab","kabi","macun","malt","catnip","kemik","damla","mineral","aksesuar","malzeme","urun","egitim","egitimi","kuafor","pansiyon","otel","veteriner","merkez","merkezi","gezdirme","tras","yikama","altligi","alisveris","alistirma"]);
  const candidates = SAMSUN_ALL_EXCLUSIVE_PAGES.filter((p) => {
    const t = p.slug.split("-");
    const hasBreed = t.some((x) => BREED.includes(x));
    const hasPrice = t.some((x) => PRICE.has(x)) || p.slug.includes("ne-kadar");
    const hasProdSvc = t.some((x) => PROD_SVC.has(x));
    return hasBreed && hasPrice && !hasProdSvc && !ATAKUM_ALL_FOOD_SKU.test(p.slug) && !SAMSUN_RETAILER_MARK.test(p.metaTitle);
  });
  assert.ok(candidates.length >= 5, `expected a body of breed price candidates, got ${candidates.length}`);
  for (const p of candidates) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: breed price keyword must state Atakum Pet does not sell live animals`);
  }
  // The inverse: a breed-NAMED food SKU is a product, never a live no-sale page.
  const foodBreed = SAMSUN_ALL_EXCLUSIVE_PAGES.filter(
    (p) => ATAKUM_ALL_FOOD_SKU.test(p.slug) && /(british|scottish|persian|persan|golden|labrador|terrier|retriever|bulldog|shorthair|pug|yorkshire)/.test(p.slug),
  );
  assert.ok(foodBreed.length > 0, "expected some breed-named food SKUs in the corpus");
  for (const p of foodBreed) {
    assert.ok(!NO_SALE.test(markalarCopy(p)), `${p.slug}: breed-named food SKU must NOT be framed as a live-animal no-sale page`);
  }
});

test("samsun-all: service keywords never claim Atakum Pet provides the service", () => {
  const NOT_PROVIDED = /hizmet(i)? (vermiyoruz|vermez|vermeyiz)|hizmet değil/i;
  const PROVIDES = /hizmet(i)? (veriyoruz|sağlıyoruz|sunuyoruz)|eğitim veriyoruz|pansiyonumuz/i;
  const servicePages = SAMSUN_ALL_EXCLUSIVE_PAGES.filter((p) => SAMSUN_SERVICE_MARK.test(p.metaTitle));
  assert.ok(servicePages.length > 20, `expected a body of service pages, got ${servicePages.length}`);
  for (const p of servicePages) {
    const copy = markalarCopy(p);
    assert.match(copy, NOT_PROVIDED, `${p.slug}: service page must disclaim that Atakum Pet provides the service`);
    assert.ok(!PROVIDES.test(copy), `${p.slug}: service page must not claim Atakum Pet provides the service`);
  }
});

test("samsun-all: retailer keywords position Atakum Pet as an independent alternative, never the marketplace", () => {
  const INDEPENDENT = /bağımsız bir işletme|resmi bir bağlantımız yok/i;
  const AFFILIATED = /resmi (bayi|satıcı|distribütör)|yetkili (bayi|satıcı)/i;
  const retail = SAMSUN_ALL_EXCLUSIVE_PAGES.filter((p) => SAMSUN_RETAILER_MARK.test(p.metaTitle));
  assert.ok(retail.length > 50, `expected a body of retailer pages, got ${retail.length}`);
  for (const p of retail) {
    const copy = markalarCopy(p);
    assert.match(copy, INDEPENDENT, `${p.slug}: retailer page must disclaim affiliation with the marketplace`);
    assert.ok(!AFFILIATED.test(copy), `${p.slug}: retailer page must not imply official marketplace affiliation`);
  }
});

test("samsun-all: no page makes a nöbetçi / 24-saat / gece-açık (always-open) claim", () => {
  // A same-day store delivers within working hours — it is NOT a 24h/nöbetçi
  // operation, so no served surface may affirm an always-open trait.
  const offenders = SAMSUN_ALL_EXCLUSIVE_PAGES.filter((p) => NIGHT_CLAIM_RE.test(samsunBody(p)));
  assert.equal(
    offenders.length,
    0,
    `pages must not claim an always-open/24h trait (offenders: ${offenders.slice(0, 5).map((p) => p.slug).join(", ")})`,
  );
});

test("samsun-all: no page fabricates a concrete price", () => {
  const PRICE = /\d[\d.,]*\s*(₺|tl\b|lira\b)|₺\s*\d/i;
  const bad = SAMSUN_ALL_EXCLUSIVE_PAGES.filter((p) => PRICE.test(markalarCopy(p)));
  assert.equal(
    bad.length,
    0,
    `pages must not state a concrete price (offenders: ${bad.slice(0, 5).map((p) => p.slug).join(", ")})`,
  );
});

test("samsun-all: SSR serves samsun's bespoke local content, self-canonical, differs from jetgomarket", async () => {
  const jetgoSet = availableSlugSet(JETGO_STORE);
  const overrideSlug = SAMSUN_ALL_EXCLUSIVE_PAGES.find((p) => jetgoSet.has(p.slug))!.slug;
  const samPage = findSeoPage(overrideSlug, SAMSUN_STORE)!;
  assert.equal(samPage.storeId, "samsun", "atakumpet.com must serve its own store-scoped override");

  const samHtml = await injectAllMeta(INDEX_HTML, `/${overrideSlug}`, SAMSUN_HOST);
  const samTitle = samHtml.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const samCanon = samHtml.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? "";
  assert.equal(
    samTitle,
    escapeHtmlForTest(brandifyFor(SAMSUN_STORE, samPage.metaTitle)),
    "atakumpet.com SSR <title> must be its own brandified metaTitle",
  );
  assert.equal(samCanon, `${SAMSUN_STORE.domain}/${overrideSlug}`, "atakumpet.com SSR canonical must bind to atakumpet.com");
  assert.ok(!/JETGO/i.test(samTitle), "atakumpet.com SSR title must not leak the JETGO brand");

  // The SAME slug on jetgomarket.com → a DIFFERENT title (jetgo's own page),
  // self-canonical to jetgomarket. No cross-domain leak in either direction.
  const jetgoHtml = await injectAllMeta(INDEX_HTML, `/${overrideSlug}`, JETGO_HOST);
  const jetgoTitle = jetgoHtml.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const jetgoCanon = jetgoHtml.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? "";
  assert.notEqual(samTitle, jetgoTitle, "atakumpet.com title must differ from jetgomarket at the same slug");
  assert.equal(jetgoCanon, `${JETGO_STORE.domain}/${overrideSlug}`, "jetgomarket canonical must bind to jetgomarket");
  assert.ok(!samCanon.includes(JETGO_STORE.domain), "atakumpet.com canonical must not leak the jetgomarket domain");
});

// ===========================================================================
// SAMSUN PET broad keyword corpus (samsunpet.com, store id "samsunpet") — the 9th
// and final corpus, a LOCAL same-day "Samsun Pet Shop" brand with a SAMSUN-WIDE
// neighborhood-coverage angle (şehrin her mahallesine aynı gün kurye).
// samsunpet.com consumes the IDENTICAL markalar+diger universe as the samsun-all,
// karadeniz-all and (partially) markapet-all corpora, so it CANNOT differ by facts
// or slugs. The uniqueness invariant is wholly on the PROSE: the corpus must read
// distinct from
//   • the SHARED jetgomarket.com keyword pages,
//   • the samsun-all corpus (atakumpet.com, "Atakum Pet") — same universe,
//   • the karadeniz-all corpus (karadenizpetshop.com) — same universe, AND
//   • the markapet-all / jetgoshop-all corpora on their overlapping slugs.
// As a LOCAL same-day store it AFFIRMS the same-day / door-payment / local-presence
// trait on every served surface. Pages carry availability "localOnly".
// ===========================================================================
// Intent pages are identified by their (exclusive) metaTitle markers — chosen to
// differ from every sibling local corpus (samsun "Sahiplenme Rehberi"/"Bağımsız
// Samsun Adresi"/"Bilgi Notu", karadeniz "Sahiplendirme Rehberi"/"Bağımsız Yerel
// Adres"/"Yönlendirme Notu", markapet "Sahiplenme Önerisi"/"Yerel Alternatif"/
// "Hizmet Notu").
const SAMSUNPET_LIVE_MARK = /Sorumlu Sahiplenme/;
const SAMSUNPET_RETAILER_MARK = /Bağımsız Yerel Mağaza/;
const SAMSUNPET_SERVICE_MARK = /Bilgilendirme/;

test("samsunpet-all: a large keyword corpus is registered, exclusive, and complete (localOnly)", () => {
  assert.ok(
    SAMSUNPET_ALL_EXCLUSIVE_PAGES.length > 4000,
    `expected a large samsunpet-all corpus, got ${SAMSUNPET_ALL_EXCLUSIVE_PAGES.length}`,
  );
  const slugs = SAMSUNPET_ALL_EXCLUSIVE_PAGES.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, "samsunpet-all corpus must have unique slugs");
  for (const p of SAMSUNPET_ALL_EXCLUSIVE_PAGES) {
    assert.equal(p.storeId, "samsunpet", `${p.slug}: samsunpet-all page must be storeId samsunpet`);
    assert.equal(p.availability, "localOnly", `${p.slug}: samsunpet-all page must be localOnly`);
    assert.equal(p.type, "keyword", `${p.slug}: samsunpet-all page must be a keyword page`);
    assert.ok(
      p.metaTitle && p.metaDescription && p.h1 &&
      (p.intro ?? []).length && (p.sections ?? []).length &&
      (p.faq ?? []).length && (p.internalLinks ?? []).length,
      `${p.slug}: must carry title/meta/h1 + intro/sections/faq/internalLinks for a substantive AI-search page`,
    );
    // Genuine Samsun Pet Shop first-party content (real NAP phone) — not a brand swap.
    assert.match(markalarCopy(p), /0850 840 39 59/, `${p.slug}: must carry the Samsun Pet Shop NAP phone`);
    // No slug may shadow a real client app route.
    assert.ok(!RESERVED_APP_SLUGS.has(p.slug), `${p.slug}: must not shadow a reserved app route`);
  }
});

test("samsunpet-all: noise keywords are skipped and the rest are registered", () => {
  assert.ok(SAMSUNPET_ALL_SKIPPED_NOISE > 0, "expected some noise keywords (e.g. Spanish 'buscar') to be skipped");
  assert.ok(
    SAMSUNPET_ALL_KEYWORD_PAGES.length >= SAMSUNPET_ALL_EXCLUSIVE_PAGES.length,
    "generated pages must be a superset of the registered exclusive corpus (curated collisions dropped)",
  );
});

test("samsunpet-all: EVERY page affirms the local same-day / door-payment trait", () => {
  // The local invariant. Scan the rendered BODY of EVERY page — these are now
  // truthful same-day Samsun stores, so every page must carry the local signal.
  const missing = SAMSUNPET_ALL_EXCLUSIVE_PAGES.filter((p) => !LOCAL_SIGNATURE_RE.test(samsunBody(p)));
  assert.equal(
    missing.length,
    0,
    `local pages must affirm a same-day/door/kurye trait (offenders: ${missing.slice(0, 5).map((p) => p.slug).join(", ")})`,
  );
});

test("samsunpet-all: every metaDescription carries the same-day local signature, never a cargo one", () => {
  const missing = SAMSUNPET_ALL_EXCLUSIVE_PAGES.filter((p) => !SAME_DAY_SIGNATURE.test(p.metaDescription ?? ""));
  assert.equal(missing.length, 0, `metaDescriptions must carry the same-day signature (offenders: ${missing.slice(0, 5).map((p) => p.slug).join(", ")})`);
  const cargo = SAMSUNPET_ALL_EXCLUSIVE_PAGES.filter((p) => CARGO_SIGNATURE.test(p.metaDescription ?? ""));
  assert.equal(cargo.length, 0, `metaDescriptions must not carry the cargo signature (offenders: ${cargo.slice(0, 5).map((p) => p.slug).join(", ")})`);
});

test("samsunpet-all: every internal link resolves within samsunpet.com's own slug space", () => {
  const petSet = availableSlugSet(SAMSUNPET_STORE);
  let checked = 0;
  for (const p of SAMSUNPET_ALL_EXCLUSIVE_PAGES) {
    for (const l of p.internalLinks ?? []) {
      const target = (l.href ?? "").replace(/^\//, "");
      if (!target || target.includes("/")) continue; // skip non-flat (parametric) routes
      checked++;
      assert.ok(petSet.has(target), `${p.slug}: internal link "/${target}" must resolve on samsunpet.com`);
    }
  }
  assert.ok(checked > 1000, `expected many internal links to verify, got ${checked}`);
});

test("samsunpet-all: samsunpet-tagged pages never leak to any other store; overrides stay store-scoped", () => {
  for (const store of [
    JETGO_STORE,
    JETGOPET_STORE,
    JETGOSHOP_STORE,
    ATAKUMBIZ_STORE,
    ATAKUM_STORE,
    SAMSUN_STORE,
    KARADENIZ_STORE,
    MARKAPET_STORE,
  ]) {
    const foreign = getSeoPagesForStore(store).filter((p) => p.storeId === "samsunpet");
    assert.equal(foreign.length, 0, `${store.id}: must not serve any samsunpet-tagged page`);
  }
  // Override scoping: the SAME slug yields samsunpet's page on samsunpet.com and a
  // DIFFERENT, non-samsunpet page on jetgomarket — same URL, store-scoped content.
  const jetgoSet = availableSlugSet(JETGO_STORE);
  const overridePage = SAMSUNPET_ALL_EXCLUSIVE_PAGES.find((p) => jetgoSet.has(p.slug));
  assert.ok(overridePage, "expected the samsunpet corpus to override at least one shared jetgo slug");
  const overrideSlug = overridePage!.slug;
  assert.equal(
    findSeoPage(overrideSlug, SAMSUNPET_STORE)?.storeId,
    "samsunpet",
    `${overrideSlug}: samsunpet.com must serve its own (samsunpet-tagged) override`,
  );
  const onJetgo = findSeoPage(overrideSlug, JETGO_STORE);
  assert.ok(onJetgo, `${overrideSlug}: jetgomarket must still serve its own page at this slug`);
  assert.notEqual(onJetgo!.storeId, "samsunpet", `${overrideSlug}: jetgomarket must NOT serve the samsunpet-tagged page`);
});

test("samsunpet-all: the corpus is served on samsunpet.com's sitemap with no foreign exclusives", () => {
  const sm = getSitemapPagesForStore(SAMSUNPET_STORE);
  const own = sm.filter((p) => p.storeId === "samsunpet").length;
  assert.ok(own > 4000, `samsunpet.com sitemap must list its own exclusives, got ${own}`);
  assert.equal(
    sm.filter((p) => p.storeId && p.storeId !== "samsunpet").length,
    0,
    "samsunpet.com sitemap must not list any foreign store-exclusive page",
  );
});

test("samsunpet-all: content is UNIQUE-by-CONTENT vs jetgomarket.com (own brand, distinct prose)", () => {
  for (const p of SAMSUNPET_ALL_EXCLUSIVE_PAGES.slice(0, 200)) {
    assert.match(p.metaTitle, /Samsun Pet Shop/, `${p.slug}: metaTitle must carry the Samsun Pet Shop brand`);
  }
  // Distinct metaTitles (human-sounding, not one templated string).
  const titles = new Set(SAMSUNPET_ALL_EXCLUSIVE_PAGES.map((p) => p.metaTitle));
  assert.ok(titles.size > 4000, `metaTitles must be largely unique, got ${titles.size}`);

  // At a SHARED slug, samsunpet.com and jetgomarket serve DIFFERENT pages.
  const jetgoSet = availableSlugSet(JETGO_STORE);
  const overrides = SAMSUNPET_ALL_EXCLUSIVE_PAGES.filter((p) => jetgoSet.has(p.slug));
  assert.ok(overrides.length > 100, `expected samsunpet to override many shared jetgo slugs, got ${overrides.length}`);
  let compared = 0;
  for (const p of overrides.slice(0, 300)) {
    const onJetgo = findSeoPage(p.slug, JETGO_STORE)!;
    assert.notEqual(onJetgo.storeId, "samsunpet", `${p.slug}: jetgomarket must serve its OWN page, not the samsunpet one`);
    assert.notEqual(p.metaTitle, onJetgo.metaTitle, `${p.slug}: metaTitle must differ from jetgomarket`);
    assert.notEqual(p.h1, onJetgo.h1, `${p.slug}: h1 must differ from jetgomarket`);
    assert.notEqual(markalarCopy(p), markalarCopy(onJetgo), `${p.slug}: body must differ from jetgomarket`);
    compared++;
  }
  assert.ok(compared > 100, `expected many jetgomarket comparisons, got ${compared}`);
});

test("samsunpet-all: content is UNIQUE-by-CONTENT vs the samsun-all corpus (same-universe local sibling, distinct copy)", () => {
  // samsunpet and samsun share the EXACT same slug universe (markalar+diger), so
  // every slug overlaps — the strongest distinctness check. Distinct hash
  // finalizer + salt + reworded phrase banks must make every shared page read
  // differently in title, h1 AND body.
  const samBySlug = new Map(SAMSUN_ALL_EXCLUSIVE_PAGES.map((p) => [p.slug, p] as const));
  let compared = 0;
  for (const p of SAMSUNPET_ALL_EXCLUSIVE_PAGES) {
    const sam = samBySlug.get(p.slug);
    if (!sam) continue;
    assert.notEqual(p.metaTitle, sam.metaTitle, `${p.slug}: metaTitle must differ from samsun-all`);
    assert.notEqual(p.h1, sam.h1, `${p.slug}: h1 must differ from samsun-all`);
    assert.notEqual(markalarCopy(p), markalarCopy(sam), `${p.slug}: body must differ from samsun-all`);
    compared++;
    if (compared >= 400) break;
  }
  assert.ok(compared > 100, `expected many samsun-all comparisons, got ${compared}`);
});

test("samsunpet-all: content is UNIQUE-by-CONTENT vs the karadeniz-all corpus (same-universe local sibling, distinct copy)", () => {
  const kzBySlug = new Map(KARADENIZ_ALL_EXCLUSIVE_PAGES.map((p) => [p.slug, p] as const));
  let compared = 0;
  for (const p of SAMSUNPET_ALL_EXCLUSIVE_PAGES) {
    const kz = kzBySlug.get(p.slug);
    if (!kz) continue;
    assert.notEqual(p.metaTitle, kz.metaTitle, `${p.slug}: metaTitle must differ from karadeniz-all`);
    assert.notEqual(p.h1, kz.h1, `${p.slug}: h1 must differ from karadeniz-all`);
    assert.notEqual(markalarCopy(p), markalarCopy(kz), `${p.slug}: body must differ from karadeniz-all`);
    compared++;
    if (compared >= 400) break;
  }
  assert.ok(compared > 100, `expected many karadeniz-all comparisons, got ${compared}`);
});

test("samsunpet-all: content is UNIQUE-by-CONTENT vs the markapet-all corpus (sibling local, distinct copy)", () => {
  const mpBySlug = new Map(MARKAPET_ALL_EXCLUSIVE_PAGES.map((p) => [p.slug, p] as const));
  let compared = 0;
  for (const p of SAMSUNPET_ALL_EXCLUSIVE_PAGES) {
    const mp = mpBySlug.get(p.slug);
    if (!mp) continue;
    assert.notEqual(p.metaTitle, mp.metaTitle, `${p.slug}: metaTitle must differ from markapet-all`);
    assert.notEqual(markalarCopy(p), markalarCopy(mp), `${p.slug}: body must differ from markapet-all`);
    compared++;
    if (compared >= 300) break;
  }
  assert.ok(compared > 100, `expected many markapet-all comparisons, got ${compared}`);
});

test("samsunpet-all: content is UNIQUE-by-CONTENT vs the jetgoshop-all corpus (distinct copy banks)", () => {
  const shopBySlug = new Map(JETGOSHOP_ALL_EXCLUSIVE_PAGES.map((p) => [p.slug, p] as const));
  let compared = 0;
  for (const p of SAMSUNPET_ALL_EXCLUSIVE_PAGES) {
    const shop = shopBySlug.get(p.slug);
    if (!shop) continue;
    assert.notEqual(p.metaTitle, shop.metaTitle, `${p.slug}: metaTitle must differ from jetgoshop-all`);
    assert.notEqual(markalarCopy(p), markalarCopy(shop), `${p.slug}: body must differ from jetgoshop-all`);
    compared++;
    if (compared >= 300) break;
  }
  assert.ok(compared > 100, `expected many jetgoshop-all comparisons, got ${compared}`);
});

test("samsunpet-all: live-animal pages never claim to sell animals", () => {
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const AFFIRM = /sat[ıi]yoruz|satar[ıi]z|satışı yap[ıi]yoruz|satışı yapar[ıi]z|satın alabilirsiniz|canlı hayvan (satıyoruz|satarız|mevcut|stok)/;
  const live = SAMSUNPET_ALL_EXCLUSIVE_PAGES.filter((p) => SAMSUNPET_LIVE_MARK.test(p.metaTitle));
  assert.ok(live.length > 50, `expected a body of live-animal pages, got ${live.length}`);
  for (const p of live) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: live page must state Samsun Pet Shop does not sell live animals`);
    assert.ok(!AFFIRM.test(digerBody(p)), `${p.slug}: live page must not affirmatively offer animals for sale`);
  }
});

test("samsunpet-all: every live-animal acquisition KEYWORD is truth-safe (broad slug-derived recall)", () => {
  const ANIMAL_STEM = ["kedi","kopek","yavru","kitten","puppy","muhabbet","kanarya","papagan","sultan","paraket","finch","ispinoz","saka","kus","tavsan","hamster","ginepig","gine","kemirgen","sinsilla","gerbil","fare","sican","balik","lepistes","moli","melek","japon","kaplumbaga","iguana","gekko","yilan","surungen"];
  const CUE = new Set(["canli","satilik","satlik","satis","satisi","satan","satanlar","satilan","satma","sat","satin","sahiplen","sahiplendirme","almak","alma","alinir","alan","alanlar","alici","alicisi","bedava","ucretsiz","sahibinden"]);
  const PROD_SVC = new Set(["ev","evi","kum","kumu","yag","yagi","otu","kab","kabi","yem","yemi","kafes","kafesi","mama","mamasi","tasma","tuvalet","kemik","gaga","tuy","catnip","nane","zehir","kapan","damla","minder","yatak","suluk","oyuncak","oyun","alani","alanlari","vitamin","vitaminler","sampuan","tarak","firca","kiyafet","canta","tasima","kulube","kulubesi","kumes","mineral","file","aksesuar","malzeme","urun","isimlik","egitim","egitimi","kuafor","pansiyon","otel","veteriner","merkez","merkezi","gezdirme","kosum","macun","malt","altligi","alisveris","alisverisi","alistirma","aliskin"]);
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const AFFIRM = /sat[ıi]yoruz|satar[ıi]z|satışı yap[ıi]yoruz|satışı yapar[ıi]z|satın alabilirsiniz|canlı hayvan (satıyoruz|satarız|mevcut|stok)/;
  const candidates = SAMSUNPET_ALL_EXCLUSIVE_PAGES.filter((p) => {
    const t = p.slug.split("-");
    const hasAnimal = t.some((x) => ANIMAL_STEM.some((a) => x.startsWith(a)));
    const hasCue = t.some((x) => CUE.has(x));
    const hasProdSvc = t.some((x) => PROD_SVC.has(x));
    return hasAnimal && hasCue && !hasProdSvc && !ATAKUM_ALL_FOOD_SKU.test(p.slug);
  });
  assert.ok(candidates.length > 100, `expected a large live-sale candidate body, got ${candidates.length}`);
  for (const p of candidates) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: live-sale keyword must state Samsun Pet Shop does not sell live animals`);
    assert.ok(!AFFIRM.test(digerBody(p)), `${p.slug}: live-sale keyword must not affirmatively offer animals for sale`);
  }
});

test("samsunpet-all: every bird/rabbit PRICE keyword is truth-safe (broad slug-derived recall)", () => {
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const BIRD_RABBIT = ["muhabbet","papagan","sultan","kanarya","paraket","finch","ispinoz","saka","kus","kakadu","kakariki","jako","forpus","sevda","cennet","tavsan"];
  const PRICE = new Set(["fiyat","fiyati","fiyatlari","ucuz"]);
  const PROD_SVC = new Set(["yem","yemi","yemlik","kafes","kafesi","kafesli","folluk","yumurtalik","suluk","sulugu","kumes","kumesi","kulube","kulubesi","tasma","tasmasi","oyuncak","oyun","vitamin","takviye","takim","mama","mamasi","mamalari","gaga","tuy","isimlik","aksesuar","malzeme","urun","mineral","file","kum","kumu","tuvalet","tuvaleti","kulucka","korse","agizlik","ev","evi","koruyucu","yara","sok","akilli","alani","alanlari","alistirma","alisveris","alisverisi","egitim","egitimi","kuafor","pansiyon","veteriner","merkez","merkezi","gezdirme","tras","yikama","altligi"]);
  const candidates = SAMSUNPET_ALL_EXCLUSIVE_PAGES.filter((p) => {
    const t = p.slug.split("-");
    const hasAnimal = t.some((x) => BIRD_RABBIT.some((a) => x.startsWith(a)));
    const hasPrice = t.some((x) => PRICE.has(x)) || p.slug.includes("ne-kadar");
    const hasProdSvc = t.some((x) => PROD_SVC.has(x));
    return hasAnimal && hasPrice && !hasProdSvc && !ATAKUM_ALL_FOOD_SKU.test(p.slug) && !SAMSUNPET_RETAILER_MARK.test(p.metaTitle);
  });
  assert.ok(candidates.length > 100, `expected a large bird/rabbit price candidate body, got ${candidates.length}`);
  for (const p of candidates) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: bird/rabbit price keyword must state Samsun Pet Shop does not sell live animals`);
  }
});

test("samsunpet-all: every breed PRICE keyword is truth-safe; breed-named FOOD SKUs stay product", () => {
  const NO_SALE = /canlı hayvan (satışı yapma|satma)/i;
  const BREED = ["persian","persan","british","scottish","sphynx","maine","coon","ragdoll","tekir","sarman","bengal","labrador","golden","rottweiler","chihuahua","yorkshire","shih","cocker","bulldog","cane","teckel","dachshund","poodle","pomeranian","boxer","german","beagle","husky","retriever","terrier","kangal","akbas","pug"];
  const PRICE = new Set(["fiyat","fiyati","fiyatlari","ucuz"]);
  const PROD_SVC = new Set(["mama","mamasi","mamalari","kumu","kafes","kafesi","kafesli","tasma","tasmasi","yatak","yatagi","minder","oyuncak","sampuan","vitamin","takviye","tarak","firca","kiyafet","canta","kulube","kulubesi","ev","evi","tuvalet","suluk","kab","kabi","macun","malt","catnip","kemik","damla","mineral","aksesuar","malzeme","urun","egitim","egitimi","kuafor","pansiyon","otel","veteriner","merkez","merkezi","gezdirme","tras","yikama","altligi","alisveris","alistirma"]);
  const candidates = SAMSUNPET_ALL_EXCLUSIVE_PAGES.filter((p) => {
    const t = p.slug.split("-");
    const hasBreed = t.some((x) => BREED.includes(x));
    const hasPrice = t.some((x) => PRICE.has(x)) || p.slug.includes("ne-kadar");
    const hasProdSvc = t.some((x) => PROD_SVC.has(x));
    return hasBreed && hasPrice && !hasProdSvc && !ATAKUM_ALL_FOOD_SKU.test(p.slug) && !SAMSUNPET_RETAILER_MARK.test(p.metaTitle);
  });
  assert.ok(candidates.length >= 5, `expected a body of breed price candidates, got ${candidates.length}`);
  for (const p of candidates) {
    assert.match(markalarCopy(p), NO_SALE, `${p.slug}: breed price keyword must state Samsun Pet Shop does not sell live animals`);
  }
  // The inverse: a breed-NAMED food SKU is a product, never a live no-sale page.
  const foodBreed = SAMSUNPET_ALL_EXCLUSIVE_PAGES.filter(
    (p) => ATAKUM_ALL_FOOD_SKU.test(p.slug) && /(british|scottish|persian|persan|golden|labrador|terrier|retriever|bulldog|shorthair|pug|yorkshire)/.test(p.slug),
  );
  assert.ok(foodBreed.length > 0, "expected some breed-named food SKUs in the corpus");
  for (const p of foodBreed) {
    assert.ok(!NO_SALE.test(markalarCopy(p)), `${p.slug}: breed-named food SKU must NOT be framed as a live-animal no-sale page`);
  }
});

test("samsunpet-all: service keywords never claim Samsun Pet Shop provides the service", () => {
  const NOT_PROVIDED = /hizmet(i)? (vermiyoruz|vermez|vermeyiz)|hizmet değil/i;
  const PROVIDES = /hizmet(i)? (veriyoruz|sağlıyoruz|sunuyoruz)|eğitim veriyoruz|pansiyonumuz/i;
  const servicePages = SAMSUNPET_ALL_EXCLUSIVE_PAGES.filter((p) => SAMSUNPET_SERVICE_MARK.test(p.metaTitle));
  assert.ok(servicePages.length > 20, `expected a body of service pages, got ${servicePages.length}`);
  for (const p of servicePages) {
    const copy = markalarCopy(p);
    assert.match(copy, NOT_PROVIDED, `${p.slug}: service page must disclaim that Samsun Pet Shop provides the service`);
    assert.ok(!PROVIDES.test(copy), `${p.slug}: service page must not claim Samsun Pet Shop provides the service`);
  }
});

test("samsunpet-all: retailer keywords position Samsun Pet Shop as an independent alternative, never the marketplace", () => {
  const INDEPENDENT = /bağımsız bir işletme|resmi bir bağlantımız yok/i;
  const AFFILIATED = /resmi (bayi|satıcı|distribütör)|yetkili (bayi|satıcı)/i;
  const retail = SAMSUNPET_ALL_EXCLUSIVE_PAGES.filter((p) => SAMSUNPET_RETAILER_MARK.test(p.metaTitle));
  assert.ok(retail.length > 50, `expected a body of retailer pages, got ${retail.length}`);
  for (const p of retail) {
    const copy = markalarCopy(p);
    assert.match(copy, INDEPENDENT, `${p.slug}: retailer page must disclaim affiliation with the marketplace`);
    assert.ok(!AFFILIATED.test(copy), `${p.slug}: retailer page must not imply official marketplace affiliation`);
  }
});

test("samsunpet-all: no page makes a nöbetçi / 24-saat / gece-açık (always-open) claim", () => {
  // A same-day store delivers within working hours — it is NOT a 24h/nöbetçi
  // operation, so no served surface may affirm an always-open trait.
  const offenders = SAMSUNPET_ALL_EXCLUSIVE_PAGES.filter((p) => NIGHT_CLAIM_RE.test(samsunBody(p)));
  assert.equal(
    offenders.length,
    0,
    `pages must not claim an always-open/24h trait (offenders: ${offenders.slice(0, 5).map((p) => p.slug).join(", ")})`,
  );
});

test("samsunpet-all: no page fabricates a concrete price", () => {
  const PRICE = /\d[\d.,]*\s*(₺|tl\b|lira\b)|₺\s*\d/i;
  const bad = SAMSUNPET_ALL_EXCLUSIVE_PAGES.filter((p) => PRICE.test(markalarCopy(p)));
  assert.equal(
    bad.length,
    0,
    `pages must not state a concrete price (offenders: ${bad.slice(0, 5).map((p) => p.slug).join(", ")})`,
  );
});

test("samsunpet-all: SSR serves samsunpet's bespoke local content, self-canonical, differs from jetgomarket", async () => {
  const jetgoSet = availableSlugSet(JETGO_STORE);
  const overrideSlug = SAMSUNPET_ALL_EXCLUSIVE_PAGES.find((p) => jetgoSet.has(p.slug))!.slug;
  const petPage = findSeoPage(overrideSlug, SAMSUNPET_STORE)!;
  assert.equal(petPage.storeId, "samsunpet", "samsunpet.com must serve its own store-scoped override");

  const petHtml = await injectAllMeta(INDEX_HTML, `/${overrideSlug}`, SAMSUNPET_HOST);
  const petTitle = petHtml.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const petCanon = petHtml.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? "";
  assert.equal(
    petTitle,
    escapeHtmlForTest(brandifyFor(SAMSUNPET_STORE, petPage.metaTitle)),
    "samsunpet.com SSR <title> must be its own brandified metaTitle",
  );
  assert.equal(petCanon, `${SAMSUNPET_STORE.domain}/${overrideSlug}`, "samsunpet.com SSR canonical must bind to samsunpet.com");
  assert.ok(!/JETGO/i.test(petTitle), "samsunpet.com SSR title must not leak the JETGO brand");

  // The SAME slug on jetgomarket.com → a DIFFERENT title (jetgo's own page),
  // self-canonical to jetgomarket. No cross-domain leak in either direction.
  const jetgoHtml = await injectAllMeta(INDEX_HTML, `/${overrideSlug}`, JETGO_HOST);
  const jetgoTitle = jetgoHtml.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const jetgoCanon = jetgoHtml.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? "";
  assert.notEqual(petTitle, jetgoTitle, "samsunpet.com title must differ from jetgomarket at the same slug");
  assert.equal(jetgoCanon, `${JETGO_STORE.domain}/${overrideSlug}`, "jetgomarket canonical must bind to jetgomarket");
  assert.ok(!petCanon.includes(JETGO_STORE.domain), "samsunpet.com canonical must not leak the jetgomarket domain");
});

// Google Yerel Envanter (Local Inventory) feed'inin store_code kuralı: jetgo
// (DEFAULT_STORE) varsayılan olarak Atakum fiziksel mağaza kodu ATAKUM001'e düşer;
// diğer 8 mağaza kod girilmediği sürece BOŞ kalır → feed boş üretilir (davranış
// değişmez). Açıkça girilen kod her mağaza için (jetgo dahil) geçerlidir.
test("local feed store_code: jetgo defaults to ATAKUM001, other stores stay empty (behavior-identical)", () => {
  assert.equal(DEFAULT_STORE.id, "jetgo", "default store must be jetgo");
  assert.equal(effectiveStoreCode(DEFAULT_STORE.id), DEFAULT_LOCAL_STORE_CODE, "jetgo falls back to ATAKUM001");
  assert.equal(effectiveStoreCode(DEFAULT_STORE.id, {}), DEFAULT_LOCAL_STORE_CODE, "jetgo empty cfg still ATAKUM001");

  for (const s of STORES.filter((x) => x.id !== DEFAULT_STORE.id)) {
    assert.equal(effectiveStoreCode(s.id), "", `${s.id} must have no default local store_code`);
    assert.equal(effectiveStoreCode(s.id, {}), "", `${s.id} empty cfg must stay empty`);
  }

  // Explicit configured code wins for any store, including jetgo.
  assert.equal(effectiveStoreCode(DEFAULT_STORE.id, { storeCode: "CUSTOM01" }), "CUSTOM01", "explicit code overrides jetgo default");
  const other = STORES.find((x) => x.id !== DEFAULT_STORE.id)!;
  assert.equal(effectiveStoreCode(other.id, { storeCode: "OTHER01" }), "OTHER01", "explicit code enables a non-default store");
});
