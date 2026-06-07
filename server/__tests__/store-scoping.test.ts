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
import { registerRoutes } from "../routes";
import { pool } from "../storage";
// The shared-edit protection helpers live in the client lib so they can be unit
// tested here without booting the React app. STORE_SCOPED_SETTING_KEYS must stay
// in sync with the server-side copy in routes.ts (asserted by a drift test below).
import {
  confirmSharedSettingsSave,
  STORE_SCOPED_SETTING_KEYS as CLIENT_STORE_SCOPED_SETTING_KEYS,
} from "../../client/src/lib/storeScope";

const MARK = "__SCOPE_TEST__";
const JETGO_HOST = "www.jetgomarket.com";
const ATAKUM_HOST = "www.atakumpetshop.com";

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
