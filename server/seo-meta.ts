import { SEO_PAGES, type SeoPageData } from "../client/src/lib/seo-data";
import { pool as sharedPool } from "./storage";
import { getStoreByHost, brandifyFor, type StoreConfig } from "@shared/stores";

type ProductMeta = {
  id: number;
  name: string;
  price: number;
  img: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  longDescription: string | null;
};

const productCache = new Map<number, { data: ProductMeta | null; ts: number }>();
const PROD_TTL_MS = 5 * 60 * 1000;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u")
    .replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getProductMeta(id: number): Promise<ProductMeta | null> {
  const cached = productCache.get(id);
  if (cached && Date.now() - cached.ts < PROD_TTL_MS) return cached.data;
  try {
    const r = await sharedPool.query(
      `SELECT id, name, price, img, meta_title, meta_description, meta_keywords, long_description
         FROM products WHERE id = $1 AND is_active = true LIMIT 1`,
      [id],
    );
    if (r.rows.length === 0) {
      productCache.set(id, { data: null, ts: Date.now() });
      return null;
    }
    const row = r.rows[0];
    const data: ProductMeta = {
      id: row.id,
      name: row.name,
      price: row.price,
      img: row.img,
      metaTitle: row.meta_title,
      metaDescription: row.meta_description,
      metaKeywords: row.meta_keywords,
      longDescription: row.long_description,
    };
    productCache.set(id, { data, ts: Date.now() });
    return data;
  } catch {
    return null;
  }
}

const slugMap: Map<string, SeoPageData> = new Map(
  SEO_PAGES.map((p) => [p.slug, p]),
);

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function findSeoData(urlPath: string): SeoPageData | undefined {
  const cleanPath = urlPath.split("?")[0].split("#")[0];
  const slug = cleanPath.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!slug) return undefined;
  return slugMap.get(slug);
}

function replaceTag(html: string, regex: RegExp, replacement: string): string {
  if (regex.test(html)) return html.replace(regex, replacement);
  return html.replace(/<\/head>/i, `  ${replacement}\n  </head>`);
}

/**
 * Per-domain identity tags applied to EVERY served page so each custom domain
 * presents its own brand: og:site_name, theme-color, app title and share image.
 */
function applyGlobalBranding(html: string, store: StoreConfig): string {
  let out = html;
  const ogImage = `${store.domain}${store.seo.ogImage}`;
  out = replaceTag(out, /<meta\s+property="og:site_name"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:site_name" content="${escapeHtml(store.name)}" />`);
  out = replaceTag(out, /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${escapeHtml(ogImage)}" />`);
  out = replaceTag(out, /<meta\s+name="theme-color"\s+content="[^"]*"\s*\/?>/i, `<meta name="theme-color" content="${store.theme.topBar}" />`);
  out = replaceTag(out, /<meta\s+name="apple-mobile-web-app-title"\s+content="[^"]*"\s*\/?>/i, `<meta name="apple-mobile-web-app-title" content="${escapeHtml(store.shortName)}" />`);

  // Brandify the static crawler-visible SEO block (hidden seo-static div) so each
  // domain shows its own brand name in pre-render/no-JS markup. No-op for default store.
  out = out.replace(/<div id="seo-static"[^>]*>[\s\S]*?<\/div>/i, (block) => brandifyFor(store, block));

  // Brandify the static JSON-LD fallback block: brand name and self-referential
  // URLs (url/image/logo) follow the request domain, but contact identifiers
  // (email + sameAs social handles) are preserved as-is — they point to the single
  // real business shared across every brand ("tek mutfak, çok tabela"), so they must
  // NOT be domain-rewritten. No-op for the default store.
  out = out.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, (block) => {
    const origEmail = block.match(/"email":\s*"[^"]*"/i)?.[0];
    const origSameAs = block.match(/"sameAs":\s*\[[\s\S]*?\]/i)?.[0];
    let b = brandifyFor(store, block);
    if (origEmail) b = b.replace(/"email":\s*"[^"]*"/i, origEmail);
    if (origSameAs) b = b.replace(/"sameAs":\s*\[[\s\S]*?\]/i, origSameAs);
    return b;
  });

  return out;
}

/**
 * Inject SEO meta tags for known SEO landing pages. Title/description/keywords
 * come from the shared SEO content table; canonical & og:url are bound to the
 * REQUEST domain so each site self-canonicalizes and ranks independently.
 */
function injectSeoMeta(html: string, urlPath: string, store: StoreConfig): string {
  const data = findSeoData(urlPath);
  if (!data) return html;

  const title = escapeHtml(brandifyFor(store, data.metaTitle || data.title));
  const description = escapeHtml(brandifyFor(store, data.metaDescription || ""));
  const canonical = `${store.domain}/${data.slug}`;
  const keywords = data.keywords ? escapeHtml(brandifyFor(store, data.keywords)) : "";

  let out = html;

  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  out = out.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${description}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${title}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${description}" />`,
  );
  out = replaceTag(out, /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonical}" />`);
  out = replaceTag(out, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${canonical}" />`);

  const extras: string[] = [];
  if (keywords && !/<meta\s+name=["']keywords["']/i.test(out)) {
    extras.push(`<meta name="keywords" content="${keywords}" />`);
  } else if (keywords) {
    out = out.replace(
      /<meta\s+name=["']keywords["']\s+content=["'][^"']*["']\s*\/?>/i,
      `<meta name="keywords" content="${keywords}" />`,
    );
  }
  if (!/<meta\s+name=["']twitter:title["']/i.test(out)) {
    extras.push(`<meta name="twitter:card" content="summary_large_image" />`);
    extras.push(`<meta name="twitter:title" content="${title}" />`);
    extras.push(`<meta name="twitter:description" content="${description}" />`);
  } else {
    out = out.replace(
      /<meta\s+name=["']twitter:title["']\s+content=["'][^"']*["']\s*\/?>/i,
      `<meta name="twitter:title" content="${title}" />`,
    );
    out = out.replace(
      /<meta\s+name=["']twitter:description["']\s+content=["'][^"']*["']\s*\/?>/i,
      `<meta name="twitter:description" content="${description}" />`,
    );
  }

  if (data.h1 && data.intro && data.intro.length > 0) {
    const h1 = escapeHtml(brandifyFor(store, data.h1));
    const introHtml = data.intro
      .map((p) => `<p>${escapeHtml(brandifyFor(store, p))}</p>`)
      .join("\n");
    const noscriptBlock =
      `<noscript>\n` +
      `<h1>${h1}</h1>\n` +
      `${introHtml}\n` +
      `</noscript>`;
    out = out.replace(
      /<div id="root"><\/div>/i,
      `<div id="root"></div>\n${noscriptBlock}`,
    );
  }

  if (extras.length) {
    out = out.replace(
      /<\/head>/i,
      `  ${extras.join("\n  ")}\n  </head>`,
    );
  }

  return out;
}

function injectProductMeta(html: string, p: ProductMeta, urlPath: string, store: StoreConfig): string {
  const cleanPath = urlPath.split("?")[0].split("#")[0];
  const slug = slugify(p.name);
  const canonical = `${store.domain}/urun/${p.id}/${slug}`;
  const title = escapeHtml(p.metaTitle || `${p.name} - Samsun Petshop | ${store.shortName}`);
  const description = escapeHtml(
    p.metaDescription ||
      `${p.name} en uygun fiyatla ${store.name}'ta. Aynı gün teslimat, kapıda ödeme. ${p.price} TL.`,
  );
  const keywords = p.metaKeywords ? escapeHtml(p.metaKeywords) : "";
  const image = p.img && /^https?:\/\//.test(p.img) ? p.img : `${store.domain}${store.seo.ogImage}`;

  let out = html;
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  out = replaceTag(out, /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${description}" />`);
  out = replaceTag(out, /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
  out = replaceTag(out, /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${description}" />`);
  out = replaceTag(out, /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonical}" />`);
  out = replaceTag(out, /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${escapeHtml(image)}" />`);
  out = replaceTag(out, /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:type" content="product" />`);
  out = replaceTag(out, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${canonical}" />`);
  if (keywords) {
    out = replaceTag(out, /<meta\s+name=["']keywords["']\s+content=["'][^"']*["']\s*\/?>/i, `<meta name="keywords" content="${keywords}" />`);
  }
  out = replaceTag(out, /<meta\s+name=["']twitter:title["']\s+content=["'][^"']*["']\s*\/?>/i, `<meta name="twitter:title" content="${title}" />`);
  out = replaceTag(out, /<meta\s+name=["']twitter:description["']\s+content=["'][^"']*["']\s*\/?>/i, `<meta name="twitter:description" content="${description}" />`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    image,
    description: p.metaDescription || p.longDescription?.replace(/<[^>]+>/g, "").slice(0, 300) || p.name,
    sku: String(p.id),
    brand: { "@type": "Brand", name: store.shortName },
    offers: {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "TRY",
      price: p.price,
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: store.name },
    },
  };
  const ldScript = `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>`;
  out = out.replace(/<\/head>/i, `  ${ldScript}\n  </head>`);

  const noscript = `<noscript>\n<h1>${escapeHtml(p.name)}</h1>\n<p>${description}</p>\n<p>Fiyat: ${p.price} TL</p>\n</noscript>`;
  out = out.replace(/<div id="root"><\/div>/i, `<div id="root"></div>\n${noscript}`);

  void cleanPath;
  return out;
}

/**
 * Homepage and any non-SEO/non-product route: apply the store's homepage
 * defaults and bind canonical/og:url to this domain + path.
 */
function injectHomeMeta(html: string, urlPath: string, store: StoreConfig): string {
  const cleanPath = urlPath.split("?")[0].split("#")[0] || "/";
  const canonical = `${store.domain}${cleanPath}`;
  const title = escapeHtml(store.seo.title);
  const description = escapeHtml(store.seo.description);
  const keywords = escapeHtml(store.seo.keywords);

  let out = html;
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  out = replaceTag(out, /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${description}" />`);
  out = replaceTag(out, /<meta\s+name=["']keywords["']\s+content=["'][^"']*["']\s*\/?>/i, `<meta name="keywords" content="${keywords}" />`);
  out = replaceTag(out, /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
  out = replaceTag(out, /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${description}" />`);
  out = replaceTag(out, /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonical}" />`);
  out = replaceTag(out, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${canonical}" />`);
  return out;
}

const PRODUCT_PATH_RE = /^\/urun\/(\d+)(?:\/[^/?#]*)?\/?$/;

/**
 * Apply per-route, per-domain SEO metadata. `host` selects the active store so
 * every custom domain serves its own brand identity and self-canonicalizes.
 */
export async function injectAllMeta(html: string, urlPath: string, host?: string): Promise<string> {
  const store = getStoreByHost(host);
  let out = applyGlobalBranding(html, store);

  const cleanPath = urlPath.split("?")[0].split("#")[0];
  const m = cleanPath.match(PRODUCT_PATH_RE);
  if (m) {
    const id = Number(m[1]);
    if (Number.isFinite(id)) {
      const prod = await getProductMeta(id);
      if (prod) return injectProductMeta(out, prod, cleanPath, store);
    }
    return injectHomeMeta(out, urlPath, store);
  }

  if (findSeoData(urlPath)) {
    return injectSeoMeta(out, urlPath, store);
  }

  return injectHomeMeta(out, urlPath, store);
}
