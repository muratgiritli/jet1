import { SEO_PAGES, type SeoPageData } from "../client/src/lib/seo-data";

const SITE = "https://www.jetgo.pet";

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
