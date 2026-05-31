import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import defaultBanner from "@assets/girisbanner_1780220225762.avif";

interface TopBannerData {
  enabled: boolean;
  image: string;
  link: string;
}

export default function TopBanner() {
  const { data } = useQuery<TopBannerData>({ queryKey: ["/api/public/top-banner"] });

  if (!data || !data.enabled) return null;

  const img = data.image || defaultBanner;
  const link = data.link || "/giris";
  const isExternal = /^https?:\/\//i.test(link);

  const imgEl = (
    <img
      src={img}
      alt="Promosyon"
      className="w-full h-auto rounded-xl"
      loading="eager"
      data-testid="img-top-banner"
    />
  );

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
