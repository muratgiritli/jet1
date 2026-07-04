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
  JETGO_EXCLUSIVE_PAGES,
} from "../../client/src/lib/seo-data";
import { ROYALCANIN_KEYWORD_PAGES } from "../../client/src/lib/keyword-pages-jetgo-royalcanin";
import { MARKALAR_KEYWORD_PAGES, MARKALAR_SKIPPED_NOISE } from "../../client/src/lib/keyword-pages-jetgo-markalar";
import { DIGER_KEYWORD_PAGES, DIGER_SKIPPED_NOISE } from "../../client/src/lib/keyword-pages-jetgo-diger";
import { getStoreByHost, brandifyFor, STORES, DEFAULT_STORE } from "../../shared/stores";
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
// Second branded LOCAL same-day store. Shares the samsun local same-day /
// door-payment model but is its OWN store (id "samsunpet", domain samsunpet.com)
// — it must never collide with the existing "samsun" store bound to atakumpet.com.
// Third branded LOCAL same-day store (id "karadeniz", domain karadenizpetshop.com).
// Second domain for the flagship JETGO brand (id "jetgopet", domain jetgo.pet).
// Same JETGO brand + LOCAL same-day model as jetgomarket.com, but a SEPARATE
// self-canonical store on its own URL. Its domain contains the substring "jetgo",
// which exercises the brandifyFor placeholder pass (must NOT become "JETGO.pet").
// Third domain for the flagship JETGO brand (id "jetgoshop", domain jetgo.shop).
// Same JETGO brand + LOCAL same-day model as jetgomarket.com, but a SEPARATE
// self-canonical store on its own URL. Its domain also contains the substring
// "jetgo", so it exercises the brandifyFor placeholder pass (NOT "JETGO.shop").
// FOURTH branded LOCAL same-day store (id "markapet", domain marka.pet). Per the
// owner's request the customer-facing brand IS the domain string "marka.pet".

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


// ---- Returning customer: log in (no re-registration) and reuse saved address ----
//
// The new-customer test above proves the registration branch (fresh phone ->
// OTP -> name + Mahalle). This is the OTHER half of the auth flow: an EXISTING
// customer who already has an account + saved address. For them /api/otp/verify
// must log them straight in WITHOUT requiresRegistration, return their saved
// address, and let them place an order immediately. This is the persistent,
// server-side complement to the returning-customer browser smoke (testing skill).

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




// Persistent, server-side complement to the browser smoke (testing skill runTest)
// for the samsun storefront: a brand-new customer registers via the OTP bypass on
// the samsun host and places a LOCAL same-day order end to end. Mirrors the Atakum
// end-to-end test above and asserts the LOCAL contract: door payment is accepted
// and the order attributes to the samsun storefront. The browser smoke
// additionally verifies the visual contract (Mahalle picker, "Getirmesi" label,
// in-person payment UI) which cannot be asserted at the API layer.


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

// atakum.biz shares the "Atakum Pet" brand word with the `samsun` store
// (atakumpet.com) BY DESIGN (separate id + domain); both are LOCAL same-day
// storefronts.
// jetgo.pet shares the JETGO brand name/word with the default `jetgo` store BY
// DESIGN (separate id + domain); it is a LOCAL same-day storefront.
// jetgo.shop also shares the JETGO brand name/word with the default `jetgo` store
// BY DESIGN (separate id + domain); it is a LOCAL same-day storefront too.
// marka.pet (markapet) LOCAL same-day brand: per the owner's request the
// customer-facing brand IS the domain string itself.
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

// The static template the server brandifies per request host. Read once from the
// repo so this stays in lockstep with what production serves.
const SYNTHETIC_CARGO_STORE: ReturnType<typeof getStoreByHost> = {
    ...getStoreByHost(JETGO_HOST),
    id: "synthetic-cargo",
    commerce: {
      ...getStoreByHost(JETGO_HOST).commerce,
      fulfillment: "cargo" as const,
      onlinePaymentOnly: true,
      shippingLabel: "Kargo Ücreti",
      preorderEnabled: false,
    },
  };

  const INDEX_HTML = readFileSync(new URL("../../client/index.html", import.meta.url), "utf8");



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






// API-level end-to-end on the NEW domain: a fresh customer registers via the OTP
// bypass on samsunpet.com and the LOCAL contract is enforced server-side — door
// (cash) payment is ACCEPTED and the order is attributed to source_site
// 'samsunpet' (NOT 'samsun'). This is the strongest regression that the new host
// is wired through reqStore end to end.

// ---- karadeniz (a neighborly LOCAL same-day brand) storefront identity + behavior ----
//
// karadeniz (karadenizpetshop.com) is a neighborly LOCAL same-day brand,
// sharing the samsun/samsunpet commerce model (local, door payment,
// preorder on) but with its own domain, name and logo. These checks pin the
// distinct identity (no collision with samsun/samsunpet), the local contract,
// the door payment surface and the brandified homepage meta.







// ---- marka.pet (markapet, a PRATIK LOCAL same-day brand) storefront identity + behavior --
//
// marka.pet is a PRATIK LOCAL same-day brand sharing the
// samsun/samsunpet/karadeniz commerce model (local, door payment, preorder
// on) on its OWN domain. Per the owner's request the customer-facing brand IS
// the domain string "marka.pet" (name/shortName/brandWord). These checks pin the
// distinct identity (no collision with the other sibling stores), the local
// contract, the door payment surface, brandify and homepage meta.








// ---- atakum.biz (atakumbiz): a SECOND local same-day storefront ------------
//
// Same LOCAL commerce model as the `atakum` store (Mahalle checkout + door
// payment + preorder) but its OWN domain / theme / logo. It intentionally
// shares the "Atakum Pet" brand word with the `samsun` store
// (atakumpet.com); these tests pin that the two stay SEPARATE (distinct id +
// domain), the LOCAL commerce contract, brandify, the door-payment-allowed
// checkout surface, the same-day homepage meta and source_site attribution.







// ---- jetgo.pet (jetgopet): a SECOND domain for the flagship JETGO brand -------
//
// Works the same way as jetgomarket.com: same JETGO branding, theme, logo and the
// LOCAL same-day commerce model, but a SEPARATE self-canonicalising store on its
// OWN domain (jetgo.pet) so it stays on its own URL instead of redirecting to
// jetgomarket.com. It INTENTIONALLY shares the "JETGO" brand word with the default
// `jetgo` store; the two stay SEPARATE via distinct id + domain. CRITICAL: the
// domain itself contains the substring "jetgo", so brandifyFor must rewrite
// jetgomarket.com -> jetgo.pet WITHOUT mangling it into "JETGO.pet".








// ---------------------------------------------------------------------------
// jetgo.shop — a THIRD JETGO-branded LOCAL storefront, same model as jetgo.pet
// and jetgomarket.com but on its OWN self-canonical domain. Its domain also
// contains "jetgo", so it re-exercises the brandifyFor placeholder pass that must
// rewrite jetgomarket.com -> jetgo.shop WITHOUT mangling it into "JETGO.shop".
// ---------------------------------------------------------------------------







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






// ---- atakum.biz "1 saatte teslimat Atakum" SEO coverage --------------------







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
  assert.match(title, /Atakum/i, "flagship homepage title must lead with Atakum");
  assert.match(title, /Enuygun/, "flagship homepage title must carry the Enuygun brand");
  assert.ok(!/JETGO/i.test(title), "flagship homepage title must NOT leak the retired JETGO brand");
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

test("SEO landing page on the flagship host brandifies the shared corpus to Enuygun", async () => {
  // The flagship was rebranded off JETGO: brandify is now ACTIVE for the default
  // store too, rewriting the shared JETGO/jetgomarket corpus to Enuygun and its
  // own domain. The retired JETGO brand must not appear on the flagship's surfaces.
  const store = getStoreByHost(JETGO_HOST);
  const html = await injectAllMeta(INDEX_HTML, `/${SEO_TEST_SLUG}`, JETGO_HOST);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? "";
  assert.match(title, /Enuygun/, "flagship SEO title must carry the Enuygun brand");
  assert.ok(!/JETGO/i.test(title), "flagship SEO title must NOT leak the retired JETGO brand");
  assert.equal(canonical, `${store.domain}/${SEO_TEST_SLUG}`, "flagship SEO canonical binds to the enuygunpet domain");
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


// ---- Per-domain sitemap partition (the 3 independent JETGO domains) ----
//
// jetgomarket.com / jetgo.pet / jetgo.shop serve the SAME shared local corpus.
// Each must publish a DISTINCT sitemap: a disjoint, even slice of that corpus.
// The pages themselves stay reachable on every domain — only the sitemap listing
// is partitioned.


// The 4 sibling LOCAL domains (atakumpet.com → "samsun", samsunpet.com →
// "samsunpet", karadenizpetshop.com → "karadeniz", marka.pet → "markapet") share
// the SAME local corpus and must likewise each publish a DISTINCT sitemap. This is
// an INDEPENDENT partition group from the JETGO trio. ALL four sibling domains
// (atakumpet.com, samsunpet.com, karadenizpetshop.com, marka.pet) own a
// store-EXCLUSIVE corpus, so — exactly like the JETGO trio — the shared corpus is
// hash-partitioned across the group while each domain also lists ALL of its own
// exclusives (which bypass the partition). No sibling member is clean anymore.

// The JETGO trio and the sibling group are independent: a JETGO store is still
// partitioned by its own 3-member group (mod 3), NOT by the 4-member sibling group,
// so adding the sibling group never reassigns a JETGO slug.

// Guard the multi-group invariants: a store in two groups would silently take the
// first group's partition; an empty group would divide by zero in ownsSitemapSlug.


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
  const base = { ...getStoreByHost(JETGO_HOST), google: {} } as ReturnType<typeof getStoreByHost>;
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





test("Google: admin overview lists every store with source flags + normalizes ids", async () => {
  // unknown store id is rejected
  await assert.rejects(() => setStoreGoogleConfig("not-a-store", { gtmId: "x" }));
  // comma/newline-split lists are trimmed + deduped on write
  await setStoreGoogleConfig("jetgo", { ga4Ids: " G-AAA , G-AAA \n G-BBB ", adsIds: "AW-1" });
  try {
    const rows = await getAllStoreGoogleConfigs();
    assert.equal(rows.length, STORES.length, "every store listed");
    const ata = rows.find((r) => r.id === "jetgo")!;
    assert.equal(ata.source, "db");
    assert.equal(ata.hasOverride, true);
    assert.deepEqual(ata.effective.ga4Ids, ["G-AAA", "G-BBB"], "ga4 ids split/trimmed/deduped");
    assert.deepEqual(ata.effective.adsIds, ["AW-1"]);
  } finally {
    await deleteStoreGoogleConfig("jetgo");
  }
});

test("Google: admin google-tags routes reject unauthenticated callers", async () => {
  const getRes = await fetch(`${baseUrl}/api/admin/google-tags`, {
    headers: { "X-Forwarded-Host": JETGO_HOST },
  });
  assert.equal(getRes.status, 401, "GET requires admin");
  const putRes = await fetch(`${baseUrl}/api/admin/google-tags/jetgo`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Forwarded-Host": JETGO_HOST },
    body: JSON.stringify({ gtmId: "GTM-HACK" }),
  });
  assert.equal(putRes.status, 401, "PUT requires admin");
  // the rejected write must not have persisted
  const rows = await getAllStoreGoogleConfigs();
  assert.notEqual(rows.find((r) => r.id === "jetgo")!.effective.gtmId, "GTM-HACK");
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
  await setStoreMerchantConfig("jetgo", { merchantId: "9988776655", shippingAmount: "39.90" });
  try {
    const rows = await getAllStoreMerchantConfigs();
    assert.equal(rows.length, STORES.length, "every store listed");
    const sam = rows.find((r) => r.id === "jetgo")!;
    assert.equal(sam.fulfillment, "local");
    assert.equal(sam.hasConfig, true);
    assert.equal(sam.config.merchantId, "9988776655");
    assert.equal(sam.config.shippingAmount, "39.90");
    assert.ok(sam.feedUrl.endsWith("/google-merchant.xml"), "feed url points at the xml feed");
    assert.ok(sam.feedUrl.includes("enuygunpet.com"), "feed url uses the store's OWN domain");
  } finally {
    await deleteStoreMerchantConfig("jetgo");
  }
});

// Scope shipping assertions to the <g:shipping> block: the item's own <g:price>
// (product price) shares the same tag, so a raw feed.includes("<g:price>X TRY")
// collides with any product that happens to cost X. Only the shipping sub-block
// reflects the commerce model.
const shippingBlocks = (feed: string) =>
  [...feed.matchAll(/<g:shipping>([\s\S]*?)<\/g:shipping>/g)].map((m) => m[1]);





test("Merchant: admin routes reject unauthenticated callers", async () => {
  const getRes = await fetch(`${baseUrl}/api/admin/merchant`, { headers: { "X-Forwarded-Host": JETGO_HOST } });
  assert.equal(getRes.status, 401, "GET requires admin");
  const putRes = await fetch(`${baseUrl}/api/admin/merchant/jetgo`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Forwarded-Host": JETGO_HOST },
    body: JSON.stringify({ merchantId: "666" }),
  });
  assert.equal(putRes.status, 401, "PUT requires admin");
  const rows = await getAllStoreMerchantConfigs();
  assert.equal(rows.find((r) => r.id === "jetgo")!.hasConfig, false, "rejected write did not persist");
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




// ---- Changing the tracking number lets the tracking SMS go out again ----
//
// The admin tracking-update route (PATCH /api/admin/orders/:id/tracking) writes
// the cargo company + tracking number, then calls notifyShipmentIfNeeded. To send
// the tracking SMS again after a correction, updateOrderTracking (server/storage.ts)
// resets orders.shipping_sms_sent to false ONLY when the new tracking number
// differs from the stored one (the `IS DISTINCT FROM` CASE). These tests pin both
// halves of that contract: a DIFFERENT number re-sends, the SAME number does not.



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



// ---- atakum-EXCLUSIVE keyword landing pages (per-domain independent corpus) -
//
// atakumpetshop.com publishes its OWN bespoke version of every keyword landing
// page (storeId "atakum"), OVERRIDING the SHARED keyword page at the same slug
// ONLY on atakum. Sibling local domains keep the shared page; a cargo-model store
// (the synthetic fixture) sees neither (local-only). These tests pin that
// exclusivity + non-leakage so a future edit can't re-share/leak atakum's pages.

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
// No real store is cargo anymore; the dormant cargo branch (local overrides hidden
// on a cargo store) is verified against the synthetic cargo fixture.









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

// slug-form food-SKU signal — pages we deliberately classify as food, not live.
// Representative real client app routes a generated SEO slug must never shadow.
const RESERVED_APP_SLUGS = new Set([
  "acik-mama","kampanya","veteriner","magaza","blog","petshop","kategori","urun",
  "siparis","odeme","admin","giris","hesabim","favoriler","kayip-ilan","yarisma",
  "sss","kvkk","gizlilik","iletisim","hakkimizda","ozel-patiler","sokak-canlari",
]);














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
// Retailer-intent pages are identified by their (exclusive) metaTitle marker.

















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
// Intent pages are identified by their (exclusive) metaTitle markers — chosen to
// differ from the sibling local corpora (jetgoshop "Sorumlu Sahiplenme"/"Yerel
// Seçenek"/"Bilgilendirme", atakum "Sahiplenme Rehberi"/"Yerel Alternatif"/
// "Bilgilendirme").


















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
// Intent pages are identified by their (exclusive) metaTitle markers — chosen to
// differ from BOTH sibling corpora (atakum "Sahiplenme Rehberi"/"Yerel
// Alternatif"/"Bilgilendirme", jetgoshop "Sorumlu Sahiplenme"/"Yerel
// Seçenek"/"Bilgilendirme").


















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
// Intent pages are identified by their (exclusive) metaTitle markers — chosen to
// differ from the local sibling corpora (atakumbiz "Sahiplenme Çağrısı"/"Yerel
// Esnaf"/"Bilgi Notu", jetgoshop/atakum variants) AND to read in a PRATIK
// convenience voice.
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
// Intent pages are identified by their (exclusive) metaTitle markers — chosen to
// differ from every sibling corpus (markapet "Sahiplenme Önerisi"/"Yerel
// Alternatif"/"Hizmet Notu", atakumbiz/jetgoshop variants) AND to read in a
// KÖKLÜ / neighborly TRUST voice.
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
// Intent pages are identified by their (exclusive) metaTitle markers — chosen to
// differ from every sibling corpus (markapet "Sahiplenme Önerisi"/"Yerel
// Alternatif"/"Hizmet Notu", karadeniz "Sahiplendirme Rehberi"/"Bağımsız Yerel
// Adres"/"Yönlendirme Notu") AND to read in an ATAKUM-FIRST 1-saatte voice.
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






















// Google Yerel Envanter (Local Inventory) feed'inin store_code kuralı: jetgo
// (DEFAULT_STORE) varsayılan olarak Atakum fiziksel mağaza kodu ATAKUM001'e düşer;
// diğer 8 mağaza kod girilmediği sürece BOŞ kalır → feed boş üretilir (davranış
// değişmez). Açıkça girilen kod her mağaza için (jetgo dahil) geçerlidir.
test("local feed store_code: jetgo defaults to ATAKUM001, other stores stay empty (behavior-identical)", () => {
  assert.equal(DEFAULT_STORE.id, "jetgo", "default store must be jetgo");
  assert.equal(effectiveStoreCode(DEFAULT_STORE.id), DEFAULT_LOCAL_STORE_CODE, "jetgo falls back to ATAKUM001");
  assert.equal(effectiveStoreCode(DEFAULT_STORE.id, {}), DEFAULT_LOCAL_STORE_CODE, "jetgo empty cfg still ATAKUM001");

  // Explicit configured code wins for any store, including jetgo.
  assert.equal(effectiveStoreCode(DEFAULT_STORE.id, { storeCode: "CUSTOM01" }), "CUSTOM01", "explicit code overrides jetgo default");
});
