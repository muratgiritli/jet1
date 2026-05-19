import { SEO_PAGES, type SeoPageData } from "../client/src/lib/seo-data";
import { pool as sharedPool } from "./storage";

const SITE = "https://www.jetgomarket.com";

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

/**
 * Inject SEO meta tags (title, description, canonical, OG, Twitter) into the
 * static index.html for known SEO landing pages. This ensures every landing
 * page returns unique server-rendered metadata so Google can index it
 * without waiting on JavaScript rendering.
 */
export function injectSeoMeta(html: string, urlPath: string): string {
  const data = findSeoData(urlPath);
  if (!data) return html;

  const title = escapeHtml(data.metaTitle || data.title);
  const description = escapeHtml(data.metaDescription || "");
  const canonical = `${SITE}/${data.slug}`;
  const keywords = data.keywords ? escapeHtml(data.keywords) : "";

  let out = html;

  // Replace <title>
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);

  // Replace meta description (content wrapped in double quotes in index.html)
  out = out.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${description}" />`,
  );

  // Replace OG title / description / url
  out = out.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${title}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${description}" />`,
  );
  if (/<meta\s+property="og:url"/i.test(out)) {
    out = out.replace(
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:url" content="${canonical}" />`,
    );
  }

  // Replace or insert canonical
  if (/<link\s+rel="canonical"/i.test(out)) {
    out = out.replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
      `<link rel="canonical" href="${canonical}" />`,
    );
  } else {
    out = out.replace(
      /<\/head>/i,
      `  <link rel="canonical" href="${canonical}" />\n  </head>`,
    );
  }

  // Inject keywords + Twitter card if not present (one-time append before </head>)
  const extras: string[] = [];
  if (keywords && !/<meta\s+name=["']keywords["']/i.test(out)) {
    extras.push(`<meta name="keywords" content="${keywords}" />`);
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

  // Inject a server-rendered H1 + first intro paragraph fallback inside the
  // root div so crawlers that don't execute JS still see unique content per
  // page. React will hydrate over this and replace it.
  if (data.h1 && data.intro && data.intro.length > 0) {
    const h1 = escapeHtml(data.h1);
    const introHtml = data.intro
      .map((p) => `<p>${escapeHtml(p)}</p>`)
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

function replaceTag(html: string, regex: RegExp, replacement: string): string {
  if (regex.test(html)) return html.replace(regex, replacement);
  return html.replace(/<\/head>/i, `  ${replacement}\n  </head>`);
}

function injectProductMeta(html: string, p: ProductMeta, urlPath: string): string {
  const cleanPath = urlPath.split("?")[0].split("#")[0];
  const slug = slugify(p.name);
  const canonical = `${SITE}/urun/${p.id}/${slug}`;
  const title = escapeHtml(p.metaTitle || `${p.name} - Samsun Petshop | JETGO`);
  const description = escapeHtml(
    p.metaDescription ||
      `${p.name} en uygun fiyatla Samsun JETGO Pet Shop'ta. Aynı gün teslimat, kapıda ödeme. ${p.price} TL.`,
  );
  const keywords = p.metaKeywords ? escapeHtml(p.metaKeywords) : "";
  const image = p.img && /^https?:\/\//.test(p.img) ? p.img : `${SITE}/og-image.webp`;

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

  // Product JSON-LD for richer SERP
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    image,
    description: p.metaDescription || p.longDescription?.replace(/<[^>]+>/g, "").slice(0, 300) || p.name,
    sku: String(p.id),
    brand: { "@type": "Brand", name: "JETGO" },
    offers: {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "TRY",
      price: p.price,
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "JETGO Pet Shop Samsun" },
    },
  };
  const ldScript = `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>`;
  out = out.replace(/<\/head>/i, `  ${ldScript}\n  </head>`);

  // Crawler-visible content fallback
  const noscript = `<noscript>\n<h1>${escapeHtml(p.name)}</h1>\n<p>${description}</p>\n<p>Fiyat: ${p.price} TL</p>\n</noscript>`;
  out = out.replace(/<div id="root"><\/div>/i, `<div id="root"></div>\n${noscript}`);

  // If user is on the non-canonical (no slug) URL, the canonical above still
  // points to slug version — Google will consolidate. cleanPath unused but
  // kept available for future redirect logic.
  void cleanPath;
  return out;
}

const PRODUCT_PATH_RE = /^\/urun\/(\d+)(?:\/[^/?#]*)?\/?$/;

/**
 * Apply per-route SEO metadata for both static SEO landing pages and
 * dynamic product pages. Async because it may hit the DB for product data.
 */
export async function injectAllMeta(html: string, urlPath: string): Promise<string> {
  const cleanPath = urlPath.split("?")[0].split("#")[0];
  const m = cleanPath.match(PRODUCT_PATH_RE);
  if (m) {
    const id = Number(m[1]);
    if (Number.isFinite(id)) {
      const prod = await getProductMeta(id);
      if (prod) return injectProductMeta(html, prod, cleanPath);
    }
    return html;
  }
  return injectSeoMeta(html, urlPath);
}
