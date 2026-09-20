import { Link } from "wouter";
import SEO, { SITE_DOMAIN } from "@/components/SEO";
import CommunityLayout from "@/components/community/CommunityLayout";
import { useQuery } from "@tanstack/react-query";
import type { NotificationDto } from "@shared/social";
import { socialGet, socialSend } from "@/lib/social-api";
import { useSocialAuth } from "@/contexts/SocialAuthContext";
import { useEffect } from "react";

export default function CommunityNotificationsPage() {
  const { isLoggedIn, refresh } = useSocialAuth();
  const { data } = useQuery({
    queryKey: ["/api/social/notifications"],
    queryFn: () => socialGet<{ notifications: NotificationDto[] }>("/api/social/notifications"),
    enabled: isLoggedIn,
    staleTime: 3_000,
  });

  useEffect(() => {
    if (!isLoggedIn) return;
    void socialSend("POST", "/api/social/notifications/read").then(() => refresh());
  }, [isLoggedIn, refresh]);

  return (
    <CommunityLayout>
      <SEO title="Bildirimler — YourPoodle" description="Takip ve yorum bildirimlerin." canonical={`${SITE_DOMAIN}/bildirimler`} />
      <div className="px-3 pt-4">
        <h1 className="text-lg font-extrabold text-[#1C1B1F]">Bildirimler</h1>
        {!isLoggedIn && <p className="mt-2 text-[13px] text-[#6B6573]">Bildirimleri görmek için giriş yap.</p>}
        <ul className="mt-3 space-y-2">
          {(data?.notifications || []).map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`block rounded-2xl border p-3 ${item.read ? "border-[#F1EDF6] bg-white" : "border-[#E4DCF3] bg-[#FAF8FD]"}`}
                data-testid={`notification-${item.id}`}
              >
                <p className="text-[13px] text-[#1C1B1F]">{item.text}</p>
                <p className="text-[11px] text-[#8A8494] mt-1">{item.time}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </CommunityLayout>
  );
}
