import { Link } from "wouter";
import SEO, { SITE_DOMAIN } from "@/components/SEO";
import CommunityLayout from "@/components/community/CommunityLayout";
import { useQuery } from "@tanstack/react-query";
import type { ClubDto } from "@shared/social";
import { socialGet, socialSend } from "@/lib/social-api";
import { useAuthPrompt } from "@/components/community/AuthPrompt";
import { queryClient } from "@/lib/queryClient";
import { useCommunityI18n } from "@/lib/community-i18n";

export default function CommunityClubsPage() {
  const { requireAuth } = useAuthPrompt();
  const { t } = useCommunityI18n();
  const { data } = useQuery({
    queryKey: ["/api/social/clubs"],
    queryFn: () => socialGet<{ clubs: ClubDto[] }>("/api/social/clubs"),
    staleTime: 10_000,
  });

  const join = async (id: string) => {
    if (!requireAuth()) return;
    await socialSend("POST", `/api/social/clubs/${id}/join`);
    await queryClient.invalidateQueries({ queryKey: ["/api/social/clubs"] });
  };

  return (
    <CommunityLayout>
      <SEO
        title={t("seoTitleClubs")}
        description={t("seoDescClubs")}
        canonical={`${SITE_DOMAIN}/kulupler`}
      />
      <div className="px-3 pt-4 pb-2">
        <h1 className="text-lg font-extrabold text-[#1C1B1F]" data-testid="text-clubs-title">{t("clubsTitle")}</h1>
        <p className="text-[13px] text-[#6B6573] mt-1">{t("clubsLead")}</p>
      </div>
      <ul className="px-3 space-y-3">
        {(data?.clubs || []).map((club) => (
          <li
            key={club.id}
            className="rounded-2xl overflow-hidden border border-[#E4DCF3] bg-white"
            data-testid={`club-card-${club.id}`}
          >
            <Link href={`/kulupler/${club.id}`}>
              <img src={club.cover} alt="" className="w-full h-28 object-cover" />
            </Link>
            <div className="p-3.5">
              <Link href={`/kulupler/${club.id}`}>
                <h2 className="text-[15px] font-bold text-[#1C1B1F]">{club.name}</h2>
              </Link>
              <p className="text-[12px] text-[#6B6573] mt-0.5">
                {club.city} · {club.members} {t("members")}
              </p>
              <p className="mt-1.5 text-[13px] text-[#2B2833] leading-relaxed">{club.description}</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => void join(club.id)}
                  className={`h-9 px-4 rounded-full text-sm font-semibold ${
                    club.joined
                      ? "bg-[#F6F3FB] text-[#5B4B86] border border-[#D9D0EC]"
                      : "bg-[#8E7CC3] text-white"
                  }`}
                  data-testid={`btn-join-club-${club.id}`}
                >
                  {club.joined ? t("joined") : t("join")}
                </button>
                <Link
                  href={`/kulupler/${club.id}`}
                  className="h-9 px-4 rounded-full border border-[#D9D0EC] text-sm font-semibold text-[#5B4B86] inline-flex items-center"
                >
                  {t("details")}
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </CommunityLayout>
  );
}
