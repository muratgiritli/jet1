import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  jsonLd?: object;
}

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
      document.title = "JETGO Pet Shop - Kedi ve Köpek Maması | Hızlı Sipariş";
      if (canonicalEl) canonicalEl.remove();
      if (ldScript) ldScript.remove();
    };
  }, [title, description, canonical, ogImage, jsonLd]);

  return null;
}

export const LOCAL_BUSINESS_JSONLD = {
  "@context": "https://schema.org",
  "@type": "PetStore",
  "name": "JETGO Pet Shop",
  "url": "https://jet55.app",
  "telephone": "+908508403959",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Samsun",
    "addressCountry": "TR",
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 41.2867,
    "longitude": 36.33,
  },
  "priceRange": "₺₺",
  "paymentAccepted": "Cash, Credit Card, Bank Transfer",
  "areaServed": {
    "@type": "City",
    "name": "Samsun",
  },
  "description": "Samsun'da kedi ve köpek maması, kum, ödül maması ve bakım ürünleri. Kapıda ödeme ve hızlı teslimat.",
  "sameAs": [],
};
