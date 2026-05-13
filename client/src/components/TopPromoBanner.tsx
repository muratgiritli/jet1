import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import defaultBanner from "@assets/ust_banner_1778677072320.png";

type TopBanner = { enabled: boolean; image: string; link: string };

export default function TopPromoBanner() {
  const { data } = useQuery<TopBanner>({ queryKey: ["/api/public/top-banner"] });
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("topBannerClosed") === "1") setClosed(true);
  }, []);

  if (!data || !data.enabled || closed) return null;

  const img = data.image || defaultBanner;
  const link = data.link || "/giris";

  return (
    <div className="relative w-full bg-black" data-testid="banner-top-promo">
      <Link href={link}>
        <a className="block w-full max-w-7xl mx-auto">
          <img
            src={img}
            alt="Yeni üye olana 100 TL bonus"
            className="w-full h-auto block cursor-pointer"
            loading="eager"
          />
        </a>
      </Link>
      <button
        type="button"
        onClick={() => { setClosed(true); sessionStorage.setItem("topBannerClosed", "1"); }}
        className="absolute top-1 right-1 md:top-2 md:right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
        aria-label="Kapat"
        data-testid="button-close-top-banner"
      >
        <X className="w-3 h-3 md:w-4 md:h-4" />
      </button>
    </div>
  );
}
