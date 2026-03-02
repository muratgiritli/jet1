import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  jsonLd?: object;
}

export const SITE_DOMAIN = "https://jetgo.shop";

export default function SEO({ title, description, canonical, ogImage, jsonLd }: SEOProps) {
  useEffect(() => {
    document.title = title;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.content = content;
    };

    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("name", "geo.region", "TR-55");
    setMeta("name", "geo.placename", "Samsun");

    if (ogImage) {
      setMeta("property", "og:image", ogImage);
    }

    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) {
      if (!canonicalEl) { canonicalEl = document.createElement("link"); canonicalEl.rel = "canonical"; document.head.appendChild(canonicalEl); }
      canonicalEl.href = canonical;
    }

    let ldScript = document.getElementById("json-ld-seo") as HTMLScriptElement | null;
    if (jsonLd) {
      if (!ldScript) { ldScript = document.createElement("script"); ldScript.id = "json-ld-seo"; ldScript.type = "application/ld+json"; document.head.appendChild(ldScript); }
      ldScript.textContent = JSON.stringify(jsonLd);
    }

    return () => {
      document.title = "JETGO Pet Shop Samsun - Kedi Köpek Maması | Online Sipariş & Kapıda Ödeme";
      if (canonicalEl) canonicalEl.remove();
      if (ldScript) ldScript.remove();
    };
  }, [title, description, canonical, ogImage, jsonLd]);

  return null;
}

export const LOCAL_BUSINESS_JSONLD = {
  "@context": "https://schema.org",
  "@type": "PetStore",
  "name": "JETGO Pet Shop Samsun",
  "alternateName": "JETGO Samsun Pet Shop",
  "url": SITE_DOMAIN,
  "telephone": "+908508403959",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Samsun",
    "addressLocality": "Samsun",
    "addressRegion": "Samsun",
    "postalCode": "55000",
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
  "areaServed": {
    "@type": "City",
    "name": "Samsun",
    "containedInPlace": {
      "@type": "Country",
      "name": "Türkiye",
    },
  },
  "description": "Samsun pet shop - Kedi maması, köpek maması, kedi kumu, ödül maması ve tüm evcil hayvan ürünleri. Samsun içi aynı gün teslimat, kapıda ödeme. En uygun fiyatlarla online sipariş verin.",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Samsun Pet Shop Ürünleri",
    "itemListElement": [
      { "@type": "OfferCatalog", "name": "Kedi Maması Samsun" },
      { "@type": "OfferCatalog", "name": "Köpek Maması Samsun" },
      { "@type": "OfferCatalog", "name": "Kedi Kumu Samsun" },
      { "@type": "OfferCatalog", "name": "Evcil Hayvan Ürünleri Samsun" },
    ],
  },
  "sameAs": [],
};
