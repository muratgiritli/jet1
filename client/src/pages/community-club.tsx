import { Link, useRoute } from "wouter";
import { ArrowLeft } from "lucide-react";
import SEO, { SITE_DOMAIN } from "@/components/SEO";
import CommunityLayout from "@/components/community/CommunityLayout";
import { useQuery } from "@tanstack/react-query";
import type { ClubDto, PublicMember } from "@shared/social";
import { socialGet, socialSend } from "@/lib/social-api";
import { useAuthPrompt } from "@/components/community/AuthPrompt";
import { queryClient } from "@/lib/queryClient";
import { useCommunityI18n } from "@/lib/community-i18n";
import { profilePath } from "@shared/social";

export default function CommunityClubPage() {
  const [, params] = useRoute("/kulupler/:id");
  const id = params?.id || "";
  const { requireAuth } = useAuthPrompt();
  const { t } = useCommunityI18n();
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

  return (
    <CommunityLayout>
      <SEO
        title={`${club?.name || t("navClubs")} — YourPoodle`}
        description={club?.description || t("clubsLead")}
        canonical={`${SITE_DOMAIN}/kulupler/${id}`}
      />
      <div className="px-3 pt-3">
        <Link href="/kulupler" className="inline-flex items-center gap-1 text-[13px] font-medium text-[#6A5A96]">
          <ArrowLeft className="w-4 h-4" />
          {t("backClubs")}
        </Link>
      </div>
      {club && (
        <>
          <img src={club.cover} alt="" className="mt-3 w-full h-40 object-cover" />
          <div className="px-3 pt-3">
            <h1 className="text-lg font-extrabold text-[#1C1B1F]" data-testid="text-club-name">{club.name}</h1>
            <p className="text-[12px] text-[#6B6573] mt-0.5">{club.city} · {club.members} {t("members")}</p>
            <p className="mt-2 text-[14px] leading-relaxed text-[#2B2833]">{club.description}</p>
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
            <h2 className="text-[13px] font-bold text-[#1C1B1F] mb-2">{t("clubMembers")}</h2>
            <ul className="space-y-2">
              {(data?.members || []).map((member) => (
                <li key={member.id}>
                  <Link href={profilePath(member)} className="flex items-center gap-2.5 rounded-xl border border-[#F1EDF6] p-2">
                    <img src={member.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold truncate">{member.name}</p>
                      <p className="text-[11px] text-[#6B6573]">{member.dogName} · {member.city}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </CommunityLayout>
  );
}
