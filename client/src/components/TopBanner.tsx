import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import defaultStoreBanner from "@assets/enuygunpet_magaza_1783254122911.webp";

interface TopBannerData {
  enabled: boolean;
  image: string;
  link: string;
}

export default function TopBanner() {
  const { data } = useQuery<TopBannerData>({ queryKey: ["/api/public/top-banner"] });

  // Admin can hide the banner entirely via the "Banner Aktif" toggle.
  if (data && !data.enabled) return null;

  // Fall back to the bundled store photo when admin hasn't uploaded a custom image.
  const img = data?.image || defaultStoreBanner;
  const link = data?.link || "";
  const isExternal = /^https?:\/\//i.test(link);

  const imgEl = (
    <img
      src={img}
      alt="Enuygun Pet Mağazamız"
      className="w-full h-auto rounded-xl"
      loading="eager"
      data-testid="img-top-banner"
    />
  );

  if (!link) {
    return (
      <div className="w-full" data-testid="banner-top-promo">
        {imgEl}
      </div>
    );
  }

  return (
    <div className="w-full" data-testid="banner-top-promo">
      {isExternal ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="block" data-testid="link-top-banner">
          {imgEl}
        </a>
      ) : (
        <Link href={link} className="block" data-testid="link-top-banner">
          {imgEl}
        </Link>
      )}
    </div>
  );
}
