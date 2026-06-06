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
import { registerRoutes } from "../routes";
import { pool } from "../storage";

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
} = { banners: [], coupons: [], campaignItems: [], neighborhoods: [], products: [], brandCategories: [] };

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

  // ---- Seed campaign items (one per scope) ----
  for (const store of ["all", "jetgo", "atakum"]) {
    const r = await pool.query(
      "INSERT INTO campaign_items (product_id, item_type, sort_order, is_active, store) VALUES ($1, 'main', 0, true, $2) RETURNING id",
      [productId, store]
    );
    ids.campaignItems.push(r.rows[0].id);
  }
});

after(async () => {
  // Remove seeded rows.
  if (ids.campaignItems.length) await pool.query("DELETE FROM campaign_items WHERE id = ANY($1)", [ids.campaignItems]);
  if (ids.products.length) await pool.query("DELETE FROM products WHERE id = ANY($1)", [ids.products]);
  if (ids.brandCategories.length) await pool.query("DELETE FROM brand_categories WHERE id = ANY($1)", [ids.brandCategories]);
  if (ids.banners.length) await pool.query("DELETE FROM banners WHERE id = ANY($1)", [ids.banners]);
  if (ids.coupons.length) await pool.query("DELETE FROM coupons WHERE id = ANY($1)", [ids.coupons]);
  if (ids.neighborhoods.length) await pool.query("DELETE FROM delivery_neighborhoods WHERE id = ANY($1)", [ids.neighborhoods]);

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
