import { useRoute } from "wouter";
import Landing from "@/pages/landing";
import { SITE_DOMAIN } from "@/components/SEO";
import { findStorePage } from "@/lib/store-seo";

export default function AdLanding() {
  const [, params] = useRoute("/:slug");
  const slug = params?.slug || "";
  const page = slug ? findStorePage(slug) : undefined;

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
