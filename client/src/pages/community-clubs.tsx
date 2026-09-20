import { Link } from "wouter";
import { MapPin, Users } from "lucide-react";
import SEO, { SITE_DOMAIN } from "@/components/SEO";
import CommunityLayout from "@/components/community/CommunityLayout";
import { useQuery } from "@tanstack/react-query";
import { clubDescription, clubName, type ClubDto } from "@shared/social";
import { socialGet, socialSend } from "@/lib/social-api";
import { useAuthPrompt } from "@/components/community/AuthPrompt";
import { queryClient } from "@/lib/queryClient";
import { clubKindLabel, useCommunityI18n } from "@/lib/community-i18n";

export default function CommunityClubsPage() {
  const { requireAuth } = useAuthPrompt();
  const { t, locale } = useCommunityI18n();
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

  const clubs = data?.clubs || [];

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
        <p className="mt-2 text-[12px] font-semibold text-[#8E7CC3]">{t("clubsCount", { n: clubs.length })}</p>
      </div>
      <ul className="px-3 space-y-4 pb-2" data-testid="club-directory">
        {clubs.map((club) => {
          const next = club.events?.[0];
          return (
            <li
              key={club.id}
              className="rounded-2xl overflow-hidden border border-[#E4DCF3] bg-white"
              data-testid={`club-card-${club.id}`}
            >
              <Link href={`/kulupler/${club.id}`} className="block">
                <img src={club.cover} alt="" className="w-full h-44 object-cover bg-[#F3EFFA]" />
              </Link>
              <div className="p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-6 px-2 rounded-full bg-[#F3EFFA] text-[#6A5A96] text-[10px] font-semibold uppercase tracking-wide inline-flex items-center">
                    {clubKindLabel(locale, club.kind)}
                  </span>
                  <span className="text-[12px] text-[#6B6573] inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {club.city}
                  </span>
                </div>
                <Link href={`/kulupler/${club.id}`}>
                  <h2 className="text-[16px] font-extrabold text-[#1C1B1F] leading-snug">{clubName(locale, club)}</h2>
                </Link>
                <p className="text-[12px] text-[#6B6573] mt-0.5 inline-flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {club.members} {t("members")}
                </p>
                <p className="mt-1.5 text-[13px] text-[#2B2833] leading-relaxed line-clamp-2">{clubDescription(locale, club)}</p>
                {next && (
                  <p className="mt-2 text-[12px] text-[#5B4B86]">
                    {t("upcomingMeetups")} · {locale === "en" ? next.titleEn : next.titleTr} · {new Date(next.at).toLocaleDateString(locale === "en" ? "en-US" : "tr-TR", { weekday: "short", day: "numeric", month: "short" })}
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => void join(club.id)}
                    className={`h-10 px-4 rounded-full text-sm font-semibold ${
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
                    className="h-10 px-4 rounded-full border border-[#D9D0EC] text-sm font-semibold text-[#5B4B86] inline-flex items-center"
                    data-testid={`link-view-club-${club.id}`}
                  >
                    {t("viewClub")}
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </CommunityLayout>
  );
}
