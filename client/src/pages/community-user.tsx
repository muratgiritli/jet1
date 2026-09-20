import { Link, useRoute } from "wouter";
import { ArrowLeft } from "lucide-react";
import SEO, { SITE_DOMAIN } from "@/components/SEO";
import CommunityLayout from "@/components/community/CommunityLayout";
import { useQuery } from "@tanstack/react-query";
import type { FeedPostDto, PublicMember } from "@shared/social";
import { socialGet, socialSend } from "@/lib/social-api";
import { useAuthPrompt } from "@/components/community/AuthPrompt";
import { useSocialAuth } from "@/contexts/SocialAuthContext";
import { queryClient } from "@/lib/queryClient";

export default function CommunityUserPage() {
  const [, params] = useRoute("/uye/:username");
  const username = params?.username || "";
  const { requireAuth } = useAuthPrompt();
  const { me } = useSocialAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["/api/social/members", username],
    queryFn: () =>
      socialGet<{ member: PublicMember; posts: FeedPostDto[]; followers: PublicMember[]; following: PublicMember[] }>(
        `/api/social/members/${username}`,
      ),
    enabled: !!username,
    staleTime: 5_000,
  });

  const follow = async () => {
    if (!requireAuth()) return;
    await socialSend("POST", `/api/social/members/${username}/follow`);
    await queryClient.invalidateQueries({ queryKey: ["/api/social/members", username] });
    await queryClient.invalidateQueries({ queryKey: ["/api/social/feed"] });
  };

  if (!isLoading && !data) {
    return (
      <CommunityLayout>
        <div className="px-4 py-12 text-center text-sm text-[#6B6573]">Üye bulunamadı.</div>
      </CommunityLayout>
    );
  }

  const member = data?.member;

  return (
    <CommunityLayout>
      <SEO
        title={`${member?.name || username} — YourPoodle`}
        description={member?.bio || "Poodle sahibi profili"}
        canonical={`${SITE_DOMAIN}/uye/${username}`}
      />
      <div className="px-3 pt-3">
        <Link href="/" className="inline-flex items-center gap-1 text-[13px] font-medium text-[#6A5A96]">
          <ArrowLeft className="w-4 h-4" />
          Akış
        </Link>
      </div>
      {member && (
        <div className="px-4 pt-4 text-center">
          <img src={member.avatar} alt="" className="mx-auto w-20 h-20 rounded-full object-cover ring-2 ring-[#D9D0EC]" />
          <h1 className="mt-3 text-lg font-extrabold">{member.name}</h1>
          <p className="text-[13px] text-[#6B6573]">{member.dogName} · {member.city} · @{member.username}</p>
          {member.bio && <p className="mt-2 text-[13px] text-[#2B2833]">{member.bio}</p>}
          <p className="mt-2 text-[12px] text-[#6B6573]">
            {member.postCount} gönderi · {member.followers} takipçi · {member.following} takip
          </p>
          {me?.username === member.username ? (
            <Link href="/profil" className="mt-3 inline-flex h-10 px-4 items-center rounded-full border border-[#D9D0EC] text-sm font-semibold text-[#5B4B86]">
              Panele git
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => void follow()}
              className={`mt-3 h-10 px-4 rounded-full text-sm font-semibold ${
                member.isFollowing ? "bg-[#F6F3FB] text-[#5B4B86] border border-[#D9D0EC]" : "bg-[#8E7CC3] text-white"
              }`}
              data-testid="btn-follow-profile"
            >
              {member.isFollowing ? "Takiptesin" : "Takip et"}
            </button>
          )}
        </div>
      )}
      <div className="mt-5 grid grid-cols-3 gap-1 px-3">
        {(data?.posts || []).map((post) => (
          <Link key={post.id} href={`/gonderi/${post.id}`}>
            <img src={post.image} alt="" className="aspect-square w-full object-cover" />
          </Link>
        ))}
      </div>
    </CommunityLayout>
  );
}
