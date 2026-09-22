import { Link, useRoute } from "wouter";
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import SEO, { SITE_DOMAIN } from "@/components/SEO";
import CommunityLayout from "@/components/community/CommunityLayout";
import { useQuery } from "@tanstack/react-query";
import { clubAbout, clubName, profilePath, type ClubDto, type PublicMember } from "@shared/social";
import { socialGet, socialSend } from "@/lib/social-api";
import { useAuthPrompt } from "@/components/community/AuthPrompt";
import { queryClient } from "@/lib/queryClient";
import { clubKindLabel, useCommunityI18n } from "@/lib/community-i18n";

function meetupWhen(iso: string, locale: "tr" | "en") {
  return new Date(iso).toLocaleString(locale === "en" ? "en-US" : "tr-TR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CommunityClubPage() {
  const [, params] = useRoute("/kulupler/:id");
  const id = params?.id || "";
  const { requireAuth } = useAuthPrompt();
  const { t, locale, timeAgo } = useCommunityI18n();
  const { data, isLoading } = useQuery({
    queryKey: ["/api/social/clubs", id],
    queryFn: () => socialGet<{ club: ClubDto; members: PublicMember[] }>(`/api/social/clubs/${id}`),
    enabled: !!id,
    staleTime: 5_000,
  });

  const join = async () => {
    if (!requireAuth()) return;
    await socialSend("POST", `/api/social/clubs/${id}/join`);
    await queryClient.invalidateQueries({ queryKey: ["/api/social/clubs"] });
  };

  if (!isLoading && !data) {
    return (
      <CommunityLayout>
        <div className="px-4 py-12 text-center text-sm text-[#6B6573]">{t("clubMissing")}</div>
      </CommunityLayout>
    );
  }

  const club = data?.club;
  const members = data?.members || [];

  return (
    <CommunityLayout>
      <SEO
        title={`${club ? clubName(locale, club) : t("navClubs")} — YourPoodle`}
        description={club ? clubAbout(locale, club) : t("clubsLead")}
        canonical={`${SITE_DOMAIN}/kulupler/${id}`}
      />
      <div className="px-3 pt-3">
        <Link href="/kulupler" className="inline-flex items-center gap-1 text-[13px] font-medium text-[#6A5A96]">
          <ArrowLeft className="w-4 h-4" />
          {t("backClubs")}
        </Link>
      </div>
      {club && (
        <div data-testid="club-detail">
          <img src={club.cover} alt="" className="mt-3 w-full h-52 object-cover bg-[#F3EFFA]" />
          <div className="px-3 pt-3">
            <span className="h-6 px-2 rounded-full bg-[#F3EFFA] text-[#6A5A96] text-[10px] font-semibold uppercase tracking-wide inline-flex items-center">
              {clubKindLabel(locale, club.kind)}
            </span>
            <h1 className="mt-2 text-lg font-extrabold text-[#1C1B1F]" data-testid="text-club-name">{clubName(locale, club)}</h1>
            <p className="text-[12px] text-[#6B6573] mt-0.5 inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{club.city}</span>
              <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />{club.members} {t("members")}</span>
            </p>
            <button
              type="button"
              onClick={() => void join()}
              className={`mt-3 h-10 px-4 rounded-full text-sm font-semibold ${
                club.joined ? "bg-[#F6F3FB] text-[#5B4B86] border border-[#D9D0EC]" : "bg-[#8E7CC3] text-white"
              }`}
              data-testid="btn-join-club-page"
            >
              {club.joined ? t("leaveClub") : t("joinClub")}
            </button>
          </div>

          <section className="px-3 pt-5">
            <h2 className="text-[13px] font-bold text-[#1C1B1F] mb-1.5">{t("aboutClub")}</h2>
            <p className="text-[14px] leading-relaxed text-[#2B2833]">{clubAbout(locale, club)}</p>
          </section>

          <section className="px-3 pt-5" data-testid="club-events">
            <h2 className="text-[13px] font-bold text-[#1C1B1F] mb-2">{t("upcomingMeetups")}</h2>
            {(club.events || []).length === 0 ? (
              <p className="text-[13px] text-[#6B6573]">{t("noEvents")}</p>
            ) : (
              <ul className="space-y-2">
                {club.events.map((event) => (
                  <li key={event.id} className="rounded-2xl border border-[#E4DCF3] bg-[#FAF8FD] p-3">
                    <p className="text-[13px] font-semibold text-[#1C1B1F]">{locale === "en" ? event.titleEn : event.titleTr}</p>
                    <p className="mt-1 text-[12px] text-[#6B6573] inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {meetupWhen(event.at, locale)}
                    </p>
                    <p className="text-[12px] text-[#6B6573] inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {locale === "en" ? event.placeEn : event.placeTr}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="px-3 pt-5" data-testid="club-posts">
            <h2 className="text-[13px] font-bold text-[#1C1B1F] mb-2">{t("recentTalk")}</h2>
            {(club.posts || []).length === 0 ? (
              <p className="text-[13px] text-[#6B6573]">{t("noClubPosts")}</p>
            ) : (
              <ul className="space-y-2">
                {club.posts.map((post) => (
                  <li key={post.id} className="rounded-2xl border border-[#F1EDF6] p-3">
                    <div className="flex items-center gap-2">
                      <img src={post.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                      <p className="text-[12px] font-semibold">{post.author} <span className="font-normal text-[#6B6573]">· {timeAgo(post.createdAt)}</span></p>
                    </div>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-[#2B2833]">{locale === "en" ? post.bodyEn : post.bodyTr}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="px-3 pt-5 pb-2">
            <h2 className="text-[13px] font-bold text-[#1C1B1F] mb-2">{t("clubMembers")}</h2>
            <div className="flex items-center gap-2">
              {members.slice(0, 5).map((member) => (
                <Link key={member.id} href={profilePath(member)} title={member.name}>
                  <img src={member.avatar} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-white" />
                </Link>
              ))}
              {members.length > 5 && (
                <span className="text-[12px] text-[#6B6573]">{t("moreMembers", { n: members.length - 5 })}</span>
              )}
            </div>
            <ul className="mt-3 space-y-2">
              {members.slice(0, 3).map((member) => (
                <li key={member.id}>
                  <Link href={profilePath(member)} className="flex items-center gap-2.5 rounded-xl border border-[#F1EDF6] p-2">
                    <img src={member.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold truncate">{member.name}</p>
                      <p className="text-[11px] text-[#6B6573]">{member.dogName} · {member.city}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </CommunityLayout>
  );
}
