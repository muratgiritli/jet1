import { useRoute } from "wouter";
import Landing from "@/pages/landing";
import { SITE_DOMAIN } from "@/components/SEO";
import { SEO_PAGES } from "@/lib/seo-data";

export default function AdLanding() {
  const [, params] = useRoute("/:slug");
  const slug = params?.slug || "";
  const page = SEO_PAGES.find((p) => p.slug === slug);

  return (
    <Landing
      seoOverride={
        page
          ? {
              title: page.metaTitle,
              description: page.metaDescription,
              keywords: page.keywords,
              canonical: `${SITE_DOMAIN}/${page.slug}`,
            }
          : undefined
      }
    />
  );
}
