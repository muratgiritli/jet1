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
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import * as cookieSignature from "cookie-signature";
import { registerRoutes, isTestOtpBypass } from "../routes";
import { injectAllMeta } from "../seo-meta";
import { SEO_PAGES } from "../../client/src/lib/seo-data";
import { getStoreByHost, brandifyFor } from "../../shared/stores";
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
// Second Türkiye-geneli cargo brand. Shares the samsun cargo / online-card-only
// model but is its OWN store (id "samsunpet", domain samsunpet.com) — it must
// never collide with the existing "samsun" store bound to atakumpet.com.
const SAMSUNPET_HOST = "www.samsunpet.com";
// Third Türkiye-geneli cargo brand (id "karadeniz", domain karadenizpetshop.com).
const KARADENIZ_HOST = "www.karadenizpetshop.com";
const ATAKUMBIZ_HOST = "www.atakum.biz";
// Second domain for the flagship JETGO brand (id "jetgopet", domain jetgo.pet).
// Same JETGO brand + LOCAL same-day model as jetgomarket.com, but a SEPARATE
// self-canonical store on its own URL. Its domain contains the substring "jetgo",
// which exercises the brandifyFor placeholder pass (must NOT become "JETGO.pet").
const JETGOPET_HOST = "www.jetgo.pet";

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
// A SAMSUN (cargo, online-payment-only) customer + its forged session. Used by
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

async function post(path: string, host: string, payload: any) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "X-Forwarded-Host": host, "Content-Type": "application/json" },
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
  // ---- Boot a fresh app instance against the real (dev) DB ----
  const app = express();
  app.set("trust proxy", true);
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: false, limit: "10mb" }));
  const httpServer = createServer(app);
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

// ---- samsun (cargo, online-payment-only) storefront behavior + tracking ----
//
// samsun (atakumpet.com) is the cargo store: fulfillment "cargo",
// onlinePaymentOnly true, preorderEnabled false (shared/stores.ts). These tests
// exercise the server-enforced store behavior end-to-end and the admin -> customer
// cargo-tracking round-trip, complementing the client-side UI smoke (home/PDP/
// checkout branding) run via the testing skill.

// POST as a specific (cookie-identified) customer.
async function postWithCookie(path: string, host: string, payload: any, cookie: string) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "X-Forwarded-Host": host, "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify(payload),
  });
  return { status: res.status, body: await res.json() as any };
}

// GET as a specific (cookie-identified) customer.
async function getWithCookie(path: string, host: string, cookie: string) {
  const res = await fetch(`${baseUrl}${path}`, { headers: { "X-Forwarded-Host": host, Cookie: cookie } });
  return { status: res.status, body: await res.json() as any };
}

// A valid samsun online order for the seeded samsun customer (online card is the
// only method this store accepts; the customerPhone must match for the read-back).
const samsunOnlineOrder = () => ({
  ...orderPayload(),
  paymentMethod: "online",
  customerPhone: samsunCustomerPhone,
  city: "İstanbul",
  district: "Kadıköy",
});

test("samsun rejects door payment — online-payment-only store (400)", async () => {
  const res = await postWithCookie(
    "/api/orders",
    SAMSUN_HOST,
    { ...samsunOnlineOrder(), paymentMethod: "Kapıda Nakit" },
    samsunCustomerCookie,
  );
  assert.equal(res.status, 400);
  assert.match(String(res.body.message ?? ""), /online kredi kartı/i);
});

// ---- Client-render counterpart: checkout never shows in-person payment ----
//
// The server gate above rejects a door payment on the cargo store, but a
// regression once let the checkout UI *render* the door-POS installment block
// on the online-only storefront anyway. These tests assert the pure render
// helpers (the exact logic checkout.tsx renders with) so the UI can never leak
// an in-person payment surface on an online-payment-only store. They are driven
// by the real shared/stores.ts config (samsun: onlinePaymentOnly true; atakum:
// false) so they stay honest if those flags change.

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

test("checkout on samsun (onlinePaymentOnly) renders ONLY the online card — no in-person surfaces", () => {
  const samsun = getStoreByHost(SAMSUN_HOST);
  assert.equal(samsun.id, "samsun");
  assert.equal(samsun.commerce.onlinePaymentOnly, true, "samsun must be the online-payment-only store");

  const opts = visiblePaymentOptions({
    ...allMethodsEnabled,
    onlinePaymentOnly: samsun.commerce.onlinePaymentOnly,
  });
  const ids = opts.map((o) => o.id);

  // ONLY the online card option is offered.
  assert.deepEqual(ids, ["online"], `expected only the online card, got: ${JSON.stringify(ids)}`);
  // No in-person ("Kapıda") radio surfaces and no Banka Havalesi/EFT.
  for (const forbidden of ["nakit", "eft", "qr", "pos"]) {
    assert.ok(!ids.includes(forbidden), `in-person option "${forbidden}" must not render on samsun`);
  }
  // The door-POS installment block is suppressed even with POS enabled.
  assert.equal(
    showDoorPosInstallments({
      onlinePaymentOnly: samsun.commerce.onlinePaymentOnly,
      hasCampaignItems: false,
      hasPreorderItems: false,
      posEnabled: true,
    }),
    false,
    "door-POS installment block must never render on the online-only store",
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
// for the cargo storefront: a brand-new customer registers via the OTP bypass on
// the samsun host and places an online cargo order end to end. Mirrors the Atakum
// end-to-end test above, but asserts the CARGO contract: no Mahalle needed at
// registration, city/district are captured and persisted, and the online-only
// rule is enforced for this fresh customer (door payment rejected). The browser
// smoke additionally verifies the visual contract (İl/İlçe inputs, "Kargo Ücreti"
// label, online-only payment UI) which cannot be asserted at the API layer.
test("test-OTP bypass lets a NEW customer register and place a SAMSUN cargo order end to end", async () => {
  const prevEnv = process.env.NODE_ENV;
  const prevFlag = process.env.TEST_OTP_BYPASS;
  process.env.NODE_ENV = "development";
  process.env.TEST_OTP_BYPASS = "1";

  // Fresh, never-seen phone so verify takes the registration branch.
  const phone = "555" + String(randomBytes(4).readUInt32BE(0)).padStart(7, "0").slice(-7);
  let createdCustomerId: number | undefined;
  try {
    // 1) Request the OTP on the cargo host. Bypass skips SMS, reports new phone.
    const send = await post("/api/otp/send", SAMSUN_HOST, { phone });
    assert.equal(send.status, 200, `otp/send failed: ${JSON.stringify(send.body)}`);
    assert.equal(send.body.isExisting, false, "fresh phone must be reported as new");

    // 2) Verify with just the code -> server asks for registration.
    const step1 = await post("/api/otp/verify", SAMSUN_HOST, { phone, code: "0000" });
    assert.equal(step1.status, 200, `otp/verify step1 failed: ${JSON.stringify(step1.body)}`);
    assert.equal(step1.body.requiresRegistration, true, "new phone must require registration");

    // 3) Complete registration with name + address only (cargo collects city/
    //    district at checkout, NOT a Mahalle at registration). Returns a real
    //    signed session cookie.
    const regRes = await fetch(`${baseUrl}/api/otp/verify`, {
      method: "POST",
      headers: { "X-Forwarded-Host": SAMSUN_HOST, "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        code: "0000",
        name: `${MARK}_CARGO_BUYER`,
        address: `${MARK} Test Mah., Deneme Cad. No 10`,
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

    // 4) Online-only contract: door payment must be rejected for this fresh
    //    customer on the cargo store.
    const door = await postWithCookie(
      "/api/orders",
      SAMSUN_HOST,
      { ...samsunOnlineOrder(), customerName: `${MARK}_CARGO_BUYER`, customerPhone: phone, paymentMethod: "Kapıda Nakit" },
      realCookie,
    );
    assert.equal(door.status, 400, `door payment must be rejected on cargo store: ${JSON.stringify(door.body)}`);
    assert.match(String(door.body.message ?? ""), /online kredi kartı/i);

    // 5) Place the online cargo order with city/district as the freshly-
    //    registered customer, using the real session cookie from registration.
    const order = await postWithCookie(
      "/api/orders",
      SAMSUN_HOST,
      { ...samsunOnlineOrder(), customerName: `${MARK}_CARGO_BUYER`, customerPhone: phone },
      realCookie,
    );
    assert.equal(order.status, 201, `cargo order POST failed: ${JSON.stringify(order.body)}`);
    const orderId = order.body.id as number;
    assert.ok(orderId, "order id missing in response");
    ids.orders.push(orderId);

    // 6) Cargo order attributes to samsun, starts pending (online), and persists
    //    the city/district captured at checkout.
    const row = await pool.query(
      "SELECT source_site, payment_status, city, district FROM orders WHERE id = $1",
      [orderId],
    );
    assert.equal(row.rows[0].source_site, "samsun", "order must attribute to the samsun cargo storefront");
    assert.equal(row.rows[0].payment_status, "pending", "online cargo orders must start pending");
    assert.equal(row.rows[0].city, "İstanbul", "cargo order must persist the selected city (il)");
    assert.equal(row.rows[0].district, "Kadıköy", "cargo order must persist the selected district (ilçe)");
  } finally {
    if (prevEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = prevEnv;
    if (prevFlag === undefined) delete process.env.TEST_OTP_BYPASS; else process.env.TEST_OTP_BYPASS = prevFlag;
  }
});

test("admin-entered cargo tracking becomes visible to the customer", async () => {
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
  const cbUrl = `${baseUrl}/api/tosla/callback?OrderId=${encodeURIComponent(merchantOrderId)}` +
    `&Code=0&BankResponseCode=00&MdStatus=1&RequestStatus=1`;
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
      { payment_nakit_enabled: "0" }, // global key (not store-scoped)
      { payment_nakit_enabled: "1" },
      "jetgo",
    ),
  );
  assert.equal(calls, 1, "expected a confirmation prompt for a changed global setting");
  assert.equal(result, true, "returns the user's confirm() answer");
});

test("confirmSharedSettingsSave returns false when the user cancels the prompt", () => {
  const { result, calls } = withConfirm(() => false, () =>
    confirmSharedSettingsSave(
      { payment_nakit_enabled: "0" },
      { payment_nakit_enabled: "1" },
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
// atakum.biz shares the "Atakum Pet" brand word with the cargo `samsun` store BY
// DESIGN (separate id + domain); it is a LOCAL same-day storefront.
const ATAKUMBIZ_BRAND = "Atakum Pet";
// jetgo.pet shares the JETGO brand name/word with the default `jetgo` store BY
// DESIGN (separate id + domain); it is a LOCAL same-day storefront.
const JETGOPET_BRAND = "JETGO Pet Shop Samsun";
// Distinctive copy of the SAMSUN (cargo) store. atakum must NEVER show this — it
// is the signal that local same-day copy was replaced by cargo copy.
const CARGO_SIGNATURE = /türkiye(?:'nin| geneli)/i;
const SAME_DAY_SIGNATURE = /aynı gün/i;

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
  const samsun = getStoreByHost(SAMSUN_HOST);
  // checkout.tsx gates the address flow on `commerce.fulfillment === "cargo"`:
  // local -> Mahalle picker + door payment; cargo -> il/ilçe + online-only.
  assert.equal(atakum.commerce.fulfillment, "local", "atakum must use the local (Mahalle) flow");
  assert.equal(atakum.commerce.shippingLabel, "Getirmesi", "local delivery fee label");
  assert.equal(atakum.commerce.onlinePaymentOnly, false, "local store accepts door payment");
  assert.equal(atakum.commerce.preorderEnabled, true);
  // Guard against atakum accidentally inheriting the samsun cargo model.
  assert.equal(samsun.commerce.fulfillment, "cargo", "samsun stays the cargo contrast case");
  assert.notEqual(atakum.commerce.fulfillment, samsun.commerce.fulfillment);
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

test("served homepage HTML for the samsun host DOES show cargo copy (contrast)", async () => {
  // Proves the branding check actually discriminates local vs cargo rather than
  // passing for every store.
  const html = await injectAllMeta(INDEX_HTML, "/", SAMSUN_HOST);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  assert.match(title, /Atakum Pet/i);
  assert.match(title, CARGO_SIGNATURE, "samsun homepage title must carry cargo copy");
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

// ---- samsunpet (second cargo brand) storefront identity + behavior ----
//
// samsunpet (samsunpet.com) is a SECOND Türkiye-geneli cargo brand. It shares
// the exact commerce model of `samsun` (atakumpet.com) — fulfillment "cargo",
// onlinePaymentOnly true, preorder off — but is its own store with its own
// domain, name and logo. The critical invariant: it must NOT collide with the
// existing "samsun" store even though both serve the Samsun region. These checks
// pin the distinct identity, the cargo commerce contract, the online-only
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
  assert.notEqual(samsunpet.domain, samsun.domain, "the two cargo stores must keep distinct domains");
  // The apex host also resolves (not just the www form).
  assert.equal(getStoreByHost("samsunpet.com").id, "samsunpet");
});

test("samsunpet is a cargo, online-payment-only store (same model as samsun)", () => {
  const samsunpet = getStoreByHost(SAMSUNPET_HOST);
  assert.equal(samsunpet.commerce.fulfillment, "cargo", "samsunpet must use the il/ilçe cargo flow");
  assert.equal(samsunpet.commerce.shippingLabel, "Kargo Ücreti", "cargo delivery fee label");
  assert.equal(samsunpet.commerce.onlinePaymentOnly, true, "cargo store accepts only online card");
  assert.equal(samsunpet.commerce.preorderEnabled, false, "preorder must stay off on the cargo store");
});

test("brandify swaps shared JETGO body copy to the Samsun Pet Shop brand + domain", () => {
  const samsunpet = getStoreByHost(SAMSUNPET_HOST);
  assert.equal(brandifyFor(samsunpet, "Neden JETGO?"), "Neden Samsun Pet Shop?");
  assert.match(brandifyFor(samsunpet, "jetgomarket.com"), /samsunpet\.com/);
  assert.ok(!/jetgomarket\.com/i.test(brandifyFor(samsunpet, "www.jetgomarket.com")), "must not leak the jetgo domain");
});

test("checkout on samsunpet (onlinePaymentOnly) renders ONLY the online card — no in-person surfaces", () => {
  const samsunpet = getStoreByHost(SAMSUNPET_HOST);
  const opts = visiblePaymentOptions({
    ...allMethodsEnabled,
    onlinePaymentOnly: samsunpet.commerce.onlinePaymentOnly,
  });
  const optIds = opts.map((o) => o.id);
  assert.deepEqual(optIds, ["online"], `expected only the online card, got: ${JSON.stringify(optIds)}`);
  for (const forbidden of ["nakit", "eft", "qr", "pos"]) {
    assert.ok(!optIds.includes(forbidden), `in-person option "${forbidden}" must not render on samsunpet`);
  }
  assert.equal(
    showDoorPosInstallments({
      onlinePaymentOnly: samsunpet.commerce.onlinePaymentOnly,
      hasCampaignItems: false,
      hasPreorderItems: false,
      posEnabled: true,
    }),
    false,
    "door-POS installment block must never render on the online-only store",
  );
});

test("served homepage HTML carries the Samsun Pet Shop brand + cargo copy (not same-day)", async () => {
  const html = await injectAllMeta(INDEX_HTML, "/", SAMSUNPET_HOST);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const ogSiteName = html.match(/<meta\s+property="og:site_name"\s+content="([^"]*)"/i)?.[1] ?? "";

  assert.match(title, /Samsun Pet Shop/i, "homepage <title> must brand as Samsun Pet Shop");
  assert.equal(ogSiteName, SAMSUNPET_BRAND, "og:site_name must be the Samsun Pet Shop brand");
  assert.ok(!/JETGO/i.test(title), "samsunpet homepage title must not contain JETGO");
  // Cargo copy present, local same-day copy absent (it is NOT a same-day store).
  assert.match(title, CARGO_SIGNATURE, "samsunpet homepage title must carry cargo copy");
  assert.ok(!SAME_DAY_SIGNATURE.test(title), "samsunpet must not show local same-day copy");
});

// API-level end-to-end on the NEW domain: a fresh customer registers via the OTP
// bypass on samsunpet.com and the cargo/online-only contract is enforced server
// -side — door payment rejected, online order attributed to source_site
// 'samsunpet' (NOT 'samsun'), starts pending, and persists the il/ilçe. This is
// the strongest regression that the new host is wired through reqStore end to end.
test("test-OTP bypass lets a NEW customer place a samsunpet cargo order (source_site=samsunpet, online-only)", async () => {
  const prevEnv = process.env.NODE_ENV;
  const prevFlag = process.env.TEST_OTP_BYPASS;
  process.env.NODE_ENV = "development";
  process.env.TEST_OTP_BYPASS = "1";

  const phone = "555" + String(randomBytes(4).readUInt32BE(0)).padStart(7, "0").slice(-7);
  try {
    // 1) Register a fresh customer on the samsunpet host (cargo: name + address,
    //    no Mahalle). Returns a real signed session cookie.
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

    // 2) Online-only contract: door payment must be rejected on the cargo store.
    const door = await postWithCookie(
      "/api/orders",
      SAMSUNPET_HOST,
      { ...samsunOnlineOrder(), customerName: `${MARK}_SP_BUYER`, customerPhone: phone, paymentMethod: "Kapıda Nakit" },
      realCookie,
    );
    assert.equal(door.status, 400, `door payment must be rejected on cargo store: ${JSON.stringify(door.body)}`);
    assert.match(String(door.body.message ?? ""), /online kredi kartı/i);

    // 3) Place the online cargo order with il/ilçe.
    const order = await postWithCookie(
      "/api/orders",
      SAMSUNPET_HOST,
      { ...samsunOnlineOrder(), customerName: `${MARK}_SP_BUYER`, customerPhone: phone },
      realCookie,
    );
    assert.equal(order.status, 201, `cargo order POST failed: ${JSON.stringify(order.body)}`);
    const orderId = order.body.id as number;
    assert.ok(orderId, "order id missing in response");
    ids.orders.push(orderId);

    // 4) Attribution + cargo persistence: must tag the NEW store, never 'samsun'.
    const row = await pool.query(
      "SELECT source_site, payment_status, city, district FROM orders WHERE id = $1",
      [orderId],
    );
    assert.equal(row.rows[0].source_site, "samsunpet", "order must attribute to the samsunpet storefront, not samsun");
    assert.equal(row.rows[0].payment_status, "pending", "online cargo orders must start pending");
    assert.equal(row.rows[0].city, "İstanbul", "cargo order must persist the selected city (il)");
    assert.equal(row.rows[0].district, "Kadıköy", "cargo order must persist the selected district (ilçe)");
  } finally {
    if (prevEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = prevEnv;
    if (prevFlag === undefined) delete process.env.TEST_OTP_BYPASS; else process.env.TEST_OTP_BYPASS = prevFlag;
  }
});

// ---- karadeniz (third cargo brand) storefront identity + behavior ----
//
// karadeniz (karadenizpetshop.com) is the THIRD Türkiye-geneli cargo brand,
// sharing the samsun/samsunpet commerce model (cargo, onlinePaymentOnly,
// preorder off) but with its own domain, name and logo. These checks pin the
// distinct identity (no collision with samsun/samsunpet), the cargo contract,
// the online-only payment surface and the brandified homepage meta.

test("karadeniz host resolves the Karadeniz Pet Shop brand, distinct from the other cargo stores", () => {
  const karadeniz = getStoreByHost(KARADENIZ_HOST);
  const samsun = getStoreByHost(SAMSUN_HOST);
  const samsunpet = getStoreByHost(SAMSUNPET_HOST);
  assert.equal(karadeniz.id, "karadeniz");
  assert.equal(karadeniz.name, KARADENIZ_BRAND, "homepage wordmark/title brand name");
  assert.equal(karadeniz.shortName, KARADENIZ_BRAND);
  assert.equal(karadeniz.domain, "https://www.karadenizpetshop.com");
  // No collision with the other two Türkiye-geneli cargo stores.
  assert.notEqual(karadeniz.id, samsun.id, "karadeniz must be a SEPARATE store from samsun");
  assert.notEqual(karadeniz.id, samsunpet.id, "karadeniz must be a SEPARATE store from samsunpet");
  assert.notEqual(karadeniz.domain, samsun.domain);
  assert.notEqual(karadeniz.domain, samsunpet.domain);
  // The apex host also resolves (not just the www form).
  assert.equal(getStoreByHost("karadenizpetshop.com").id, "karadeniz");
});

test("karadeniz is a cargo, online-payment-only store (same model as samsun/samsunpet)", () => {
  const karadeniz = getStoreByHost(KARADENIZ_HOST);
  assert.equal(karadeniz.commerce.fulfillment, "cargo", "karadeniz must use the il/ilçe cargo flow");
  assert.equal(karadeniz.commerce.shippingLabel, "Kargo Ücreti", "cargo delivery fee label");
  assert.equal(karadeniz.commerce.onlinePaymentOnly, true, "cargo store accepts only online card");
  assert.equal(karadeniz.commerce.preorderEnabled, false, "preorder must stay off on the cargo store");
});

test("brandify swaps shared JETGO body copy to the Karadeniz Pet Shop brand + domain", () => {
  const karadeniz = getStoreByHost(KARADENIZ_HOST);
  assert.equal(brandifyFor(karadeniz, "Neden JETGO?"), "Neden Karadeniz Pet Shop?");
  assert.match(brandifyFor(karadeniz, "jetgomarket.com"), /karadenizpetshop\.com/);
  assert.ok(!/jetgomarket\.com/i.test(brandifyFor(karadeniz, "www.jetgomarket.com")), "must not leak the jetgo domain");
});

test("checkout on karadeniz (onlinePaymentOnly) renders ONLY the online card — no in-person surfaces", () => {
  const karadeniz = getStoreByHost(KARADENIZ_HOST);
  const opts = visiblePaymentOptions({
    ...allMethodsEnabled,
    onlinePaymentOnly: karadeniz.commerce.onlinePaymentOnly,
  });
  const optIds = opts.map((o) => o.id);
  assert.deepEqual(optIds, ["online"], `expected only the online card, got: ${JSON.stringify(optIds)}`);
  for (const forbidden of ["nakit", "eft", "qr", "pos"]) {
    assert.ok(!optIds.includes(forbidden), `in-person option "${forbidden}" must not render on karadeniz`);
  }
  assert.equal(
    showDoorPosInstallments({
      onlinePaymentOnly: karadeniz.commerce.onlinePaymentOnly,
      hasCampaignItems: false,
      hasPreorderItems: false,
      posEnabled: true,
    }),
    false,
    "door-POS installment block must never render on the online-only store",
  );
});

test("served homepage HTML carries the Karadeniz Pet Shop brand + cargo copy (not same-day)", async () => {
  const html = await injectAllMeta(INDEX_HTML, "/", KARADENIZ_HOST);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const ogSiteName = html.match(/<meta\s+property="og:site_name"\s+content="([^"]*)"/i)?.[1] ?? "";

  assert.match(title, /Karadeniz Pet Shop/i, "homepage <title> must brand as Karadeniz Pet Shop");
  assert.equal(ogSiteName, KARADENIZ_BRAND, "og:site_name must be the Karadeniz Pet Shop brand");
  assert.ok(!/JETGO/i.test(title), "karadeniz homepage title must not contain JETGO");
  assert.match(title, CARGO_SIGNATURE, "karadeniz homepage title must carry cargo copy");
  assert.ok(!SAME_DAY_SIGNATURE.test(title), "karadeniz must not show local same-day copy");
});

test("test-OTP bypass lets a NEW customer place a karadeniz cargo order (source_site=karadeniz, online-only)", async () => {
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

    // Online-only contract: door payment must be rejected on the cargo store.
    const door = await postWithCookie(
      "/api/orders",
      KARADENIZ_HOST,
      { ...samsunOnlineOrder(), customerName: `${MARK}_KD_BUYER`, customerPhone: phone, paymentMethod: "Kapıda Nakit" },
      realCookie,
    );
    assert.equal(door.status, 400, `door payment must be rejected on cargo store: ${JSON.stringify(door.body)}`);
    assert.match(String(door.body.message ?? ""), /online kredi kartı/i);

    // Place the online cargo order with il/ilçe.
    const order = await postWithCookie(
      "/api/orders",
      KARADENIZ_HOST,
      { ...samsunOnlineOrder(), customerName: `${MARK}_KD_BUYER`, customerPhone: phone },
      realCookie,
    );
    assert.equal(order.status, 201, `cargo order POST failed: ${JSON.stringify(order.body)}`);
    const orderId = order.body.id as number;
    assert.ok(orderId, "order id missing in response");
    ids.orders.push(orderId);

    const row = await pool.query(
      "SELECT source_site, payment_status, city, district FROM orders WHERE id = $1",
      [orderId],
    );
    assert.equal(row.rows[0].source_site, "karadeniz", "order must attribute to the karadeniz storefront");
    assert.equal(row.rows[0].payment_status, "pending", "online cargo orders must start pending");
    assert.equal(row.rows[0].city, "İstanbul", "cargo order must persist the selected city (il)");
    assert.equal(row.rows[0].district, "Kadıköy", "cargo order must persist the selected district (ilçe)");
  } finally {
    if (prevEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = prevEnv;
    if (prevFlag === undefined) delete process.env.TEST_OTP_BYPASS; else process.env.TEST_OTP_BYPASS = prevFlag;
  }
});

// ---- atakum.biz (atakumbiz): a SECOND local same-day storefront ------------
//
// Same LOCAL commerce model as the `atakum` store (Mahalle checkout + door
// payment + preorder) but its OWN domain / theme / logo. It intentionally
// shares the "Atakum Pet" brand word with the cargo `samsun` store
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
  // Its OWN logo + a theme distinct from the cargo samsun store (visual identity).
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

const SEO_TEST_SLUG = "jetgo-petshop";
const seoTestPage = SEO_PAGES.find((p) => p.slug === SEO_TEST_SLUG);

// Mirror of seo-meta.ts escapeHtml so the exact-match assertions below stay
// correct even if the brandified copy ever contains HTML-special characters.
const escapeHtmlForTest = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

test("SEO test fixture slug exists with brandifiable source content", () => {
  // Guards the two tests below against silently passing if seo-data is edited so
  // the chosen slug disappears or no longer carries the JETGO brand to swap.
  assert.ok(seoTestPage, `seo-data must still define the "${SEO_TEST_SLUG}" slug`);
  assert.match(seoTestPage!.metaTitle, /JETGO/, "fixture metaTitle must contain JETGO to brandify");
  assert.match(seoTestPage!.metaTitle, /jetgomarket\.com/i, "fixture metaTitle must contain the jetgo domain to brandify");
});

// Assert an SEO landing page served on `host` carries `store`'s brand across
// title / description / og:title / og:description and self-canonicalizes to the
// store domain, never leaking the default JETGO brand or domain.
async function assertSeoLandingBranding(host: string, store: ReturnType<typeof getStoreByHost>) {
  const html = await injectAllMeta(INDEX_HTML, `/${SEO_TEST_SLUG}`, host);

  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] ?? "";
  const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i)?.[1] ?? "";
  const ogDescription = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i)?.[1] ?? "";
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? "";
  const ogUrl = html.match(/<meta\s+property="og:url"\s+content="([^"]*)"/i)?.[1] ?? "";

  // Title/description must equal the brandified source verbatim (proves the
  // SEO content was taken from the shared table AND brandified for this host).
  assert.equal(title, escapeHtmlForTest(brandifyFor(store, seoTestPage!.metaTitle)), `${host} SEO <title> must be the brandified metaTitle`);
  assert.equal(description, escapeHtmlForTest(brandifyFor(store, seoTestPage!.metaDescription)), `${host} SEO description must be the brandified metaDescription`);
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
  const expectedCanonical = `${store.domain}/${SEO_TEST_SLUG}`;
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
  };
  process.env.NETGSM_USERCODE = `${MARK}_UC`;
  process.env.NETGSM_PASSWORD = `${MARK}_PW`;
  process.env.NETGSM_MSGHEADER = `${MARK}_HDR`;
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
      for (const k of ["NETGSM_USERCODE", "NETGSM_PASSWORD", "NETGSM_MSGHEADER"] as const) {
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
