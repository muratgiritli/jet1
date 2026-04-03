import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  jsonLd?: object | object[];
  noindex?: boolean;
  keywords?: string;
}

export const SITE_DOMAIN = "https://www.jetgo.pet";
export const SITE_NAME = "JETGO Pet Shop Samsun";
export const DEFAULT_OG_IMAGE = `${SITE_DOMAIN}/og-image.webp`;

export default function SEO({ title, description, canonical, ogImage, ogType, jsonLd, noindex, keywords }: SEOProps) {
  useEffect(() => {
    document.title = title;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.content = content;
    };

    setMeta("name", "description", description);
    if (keywords) setMeta("name", "keywords", keywords);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", ogType || "website");
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:locale", "tr_TR");
    setMeta("property", "og:image", ogImage || DEFAULT_OG_IMAGE);
    setMeta("property", "og:image:width", "1200");
    setMeta("property", "og:image:height", "630");
    setMeta("property", "og:image:alt", title);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage || DEFAULT_OG_IMAGE);
    setMeta("name", "geo.region", "TR-55");
    setMeta("name", "geo.placename", "Samsun");

    if (noindex) {
      setMeta("name", "robots", "noindex, nofollow");
    } else {
      setMeta("name", "robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    }

    if (canonical) {
      setMeta("property", "og:url", canonical);
    }

    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) {
      if (!canonicalEl) { canonicalEl = document.createElement("link"); canonicalEl.rel = "canonical"; document.head.appendChild(canonicalEl); }
      canonicalEl.href = canonical;
    }

    let ldScript = document.getElementById("json-ld-seo") as HTMLScriptElement | null;
    if (jsonLd) {
      if (!ldScript) { ldScript = document.createElement("script"); ldScript.id = "json-ld-seo"; ldScript.type = "application/ld+json"; document.head.appendChild(ldScript); }
      ldScript.textContent = Array.isArray(jsonLd) ? JSON.stringify(jsonLd) : JSON.stringify(jsonLd);
    }

    return () => {
      document.title = "JETGO Pet Shop Samsun - Kedi Köpek Maması | Online Sipariş & Kapıda Ödeme";
      if (canonicalEl) canonicalEl.remove();
      if (ldScript) ldScript.remove();
    };
  }, [title, description, canonical, ogImage, ogType, jsonLd, noindex]);

  return null;
}

export const LOCAL_BUSINESS_JSONLD = {
  "@context": "https://schema.org",
  "@type": "PetStore",
  "name": "JETGO Pet Shop Samsun",
  "alternateName": ["JETGO Samsun Pet Shop", "JetGo Pet", "JETGO"],
  "url": SITE_DOMAIN,
  "logo": `${SITE_DOMAIN}/favicon.webp`,
  "image": `${SITE_DOMAIN}/og-image.webp`,
  "telephone": "+908508403959",
  "email": "info@sizpa.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Atakum",
    "addressLocality": "Samsun",
    "addressRegion": "Samsun",
    "postalCode": "55200",
    "addressCountry": "TR",
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 41.2867,
    "longitude": 36.33,
  },
  "priceRange": "₺₺",
  "currenciesAccepted": "TRY",
  "paymentAccepted": "Nakit, Kredi Kartı, Havale/EFT",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "opens": "09:00",
    "closes": "21:00",
  },
  "areaServed": [
    { "@type": "City", "name": "Samsun" },
    { "@type": "AdministrativeArea", "name": "Atakum" },
    { "@type": "AdministrativeArea", "name": "İlkadım" },
    { "@type": "AdministrativeArea", "name": "Canik" },
  ],
  "description": "Samsun pet shop - Kedi maması, köpek maması, kedi kumu, ödül maması ve tüm evcil hayvan ürünleri. Samsun içi aynı gün teslimat, kapıda ödeme. En uygun fiyatlarla online sipariş verin.",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Samsun Pet Shop Ürünleri",
    "itemListElement": [
      { "@type": "OfferCatalog", "name": "Kedi Maması Samsun" },
      { "@type": "OfferCatalog", "name": "Köpek Maması Samsun" },
      { "@type": "OfferCatalog", "name": "Kedi Kumu Samsun" },
      { "@type": "OfferCatalog", "name": "Kuş Yemi Samsun" },
      { "@type": "OfferCatalog", "name": "Kemirgen Yemi Samsun" },
      { "@type": "OfferCatalog", "name": "Evcil Hayvan Ürünleri Samsun" },
    ],
  },
  "sameAs": [
    "https://www.instagram.com/jetgo.pet",
    "https://www.facebook.com/jetgo.pet",
  ],
};

export const WEBSITE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": SITE_NAME,
  "url": SITE_DOMAIN,
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${SITE_DOMAIN}/kategori?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export const BREADCRUMB_JSONLD = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "name": item.name,
    "item": item.url,
  })),
});

export const PRODUCT_JSONLD = (product: {
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  url: string;
  inStock: boolean;
  sku?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "description": product.description || product.name,
  "image": product.image || DEFAULT_OG_IMAGE,
  "url": product.url,
  "sku": product.sku || "",
  "brand": {
    "@type": "Brand",
    "name": "JETGO Pet Shop",
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "TRY",
    "price": product.price,
    ...(product.originalPrice && product.originalPrice > product.price ? {
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    } : {}),
    "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    "seller": {
      "@type": "Organization",
      "name": "JETGO Pet Shop Samsun",
    },
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": {
        "@type": "MonetaryAmount",
        "value": "89",
        "currency": "TRY",
      },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 1, "unitCode": "DAY" },
        "transitTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 0, "unitCode": "DAY" },
      },
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "TR",
        "addressRegion": "Samsun",
      },
    },
  },
});

export const FAQ_JSONLD = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map((faq) => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer,
    },
  })),
});
