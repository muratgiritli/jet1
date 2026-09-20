import { lazy, Suspense } from "react";
import { useRoute } from "wouter";
import { useSocialAuth } from "@/contexts/SocialAuthContext";
import CommunityUserPage from "@/pages/community-user";

const SeoPage = lazy(() => import("@/pages/seo-pages"));

export default function CommunityDogOrSeoPage() {
  const { profileSlugs, slugsReady } = useSocialAuth();
  const [, params] = useRoute("/:dogSlug");
  const slug = decodeURIComponent(params?.dogSlug || "").toLowerCase();

  if (!slugsReady) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-[#8E7CC3] rounded-full animate-spin" />
      </div>
    );
  }

  if (profileSlugs.includes(slug)) {
    return <CommunityUserPage dogSlug={slug} />;
  }

  return (
    <Suspense fallback={<div className="py-20" />}>
      <SeoPage />
    </Suspense>
  );
}
