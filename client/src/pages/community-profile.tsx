import { useState } from "react";
import { Link } from "wouter";
import SEO, { SITE_DOMAIN } from "@/components/SEO";
import CommunityLayout from "@/components/community/CommunityLayout";
import { useSocialAuth } from "@/contexts/SocialAuthContext";
import { useAuthPrompt } from "@/components/community/AuthPrompt";
import { useQuery } from "@tanstack/react-query";
import { profilePath, SOCIAL_PHOTOS, type FeedPostDto, type PublicMember, type SocialLocale } from "@shared/social";
import { socialGet, socialSend } from "@/lib/social-api";
import { queryClient } from "@/lib/queryClient";
import { useCommunityI18n } from "@/lib/community-i18n";

type Tab = "posts" | "saved" | "followers" | "following";

export default function CommunityProfilePage() {
  const { me, isLoggedIn, logout, refresh } = useSocialAuth();
  const { openAuthPrompt } = useAuthPrompt();
  const { t } = useCommunityI18n();
  const [tab, setTab] = useState<Tab>("posts");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", dogName: "", bio: "", avatar: "", locale: "tr" as SocialLocale });

  const profileQuery = useQuery({
    queryKey: ["/api/social/members", me?.username],
    queryFn: () =>
      socialGet<{ member: PublicMember; posts: FeedPostDto[]; followers: PublicMember[]; following: PublicMember[] }>(
        `/api/social/members/${me?.username}`,
      ),
    enabled: !!me?.username,
    staleTime: 5_000,
  });

  const savedQuery = useQuery({
    queryKey: ["/api/social/me/saved"],
    queryFn: () => socialGet<{ posts: FeedPostDto[] }>("/api/social/me/saved"),
    enabled: isLoggedIn,
    staleTime: 5_000,
  });

  const startEdit = () => {
    if (!me) return;
    setForm({ name: me.name, city: me.city, dogName: me.dogName, bio: me.bio, avatar: me.avatar, locale: me.locale === "en" ? "en" : "tr" });
    setEditing(true);
  };

  const saveProfile = async () => {
    await socialSend("PATCH", "/api/social/me", form);
    setEditing(false);
    await refresh();
    await queryClient.invalidateQueries({ queryKey: ["/api/social/members", me?.username] });
  };

  const setLocale = async (locale: SocialLocale) => {
    await socialSend("PATCH", "/api/social/me", { locale });
    await refresh();
  };

  return (
    <CommunityLayout>
      <SEO title={t("seoTitleProfile")} description={t("seoDescProfile")} canonical={`${SITE_DOMAIN}/profil`} />
      <div className="px-4 pt-6 text-center" data-testid="user-panel">
        <div className="mx-auto w-20 h-20 rounded-full overflow-hidden ring-2 ring-[#D9D0EC] bg-[#F3EFFA]">
          <img src={me?.avatar || "/assets/poodle-face.jpg"} alt="" className="w-full h-full object-cover" />
        </div>
        <h1 className="mt-3 text-lg font-extrabold text-[#1C1B1F]" data-testid="text-profile-name">
          {isLoggedIn ? me?.name : t("guest")}
        </h1>
        <p className="text-[13px] text-[#6B6573] mt-1">
          {isLoggedIn
            ? `${me?.dogName || "Poodle"} · ${me?.city || t("defaultCity")} · @${me?.username}`
            : t("guestProfileHint")}
        </p>
        {isLoggedIn && me?.bio && <p className="mt-2 text-[13px] text-[#2B2833]">{me.bio}</p>}
        {isLoggedIn && profileQuery.data && (
          <p className="mt-2 text-[12px] text-[#6B6573]">
            {t("postsCount", { n: profileQuery.data.member.postCount })} · {t("followersCount", { n: profileQuery.data.member.followers })} · {t("followingCount", { n: profileQuery.data.member.following })}
          </p>
        )}
        {isLoggedIn ? (
          <div className="mt-4 flex justify-center gap-2 flex-wrap">
            <button type="button" onClick={startEdit} className="h-10 px-4 rounded-full border border-[#D9D0EC] text-sm font-semibold text-[#5B4B86]" data-testid="btn-edit-profile">
              {t("editProfile")}
            </button>
            {me?.isAdmin && (
              <Link href="/yp-admin" className="h-10 px-4 rounded-full bg-[#8E7CC3] text-white text-sm font-semibold inline-flex items-center" data-testid="link-admin-panel">
                {t("admin")}
              </Link>
            )}
            <button type="button" onClick={() => void logout()} className="h-10 px-4 rounded-full text-sm font-semibold text-[#8A8494]" data-testid="btn-logout">
              {t("logout")}
            </button>
          </div>
        ) : (
          <div className="mt-4 flex justify-center gap-2">
            <button type="button" onClick={openAuthPrompt} className="h-10 px-4 rounded-full bg-[#8E7CC3] text-white text-sm font-semibold" data-testid="btn-profile-login">
              {t("loginAction")}
            </button>
            <Link href="/yp-giris?tab=register&redirect=/profil" className="h-10 px-4 rounded-full border border-[#D9D0EC] bg-[#F6F3FB] text-[#5B4B86] text-sm font-semibold inline-flex items-center" data-testid="btn-profile-register">
              {t("register")}
            </Link>
          </div>
        )}
      </div>

      {isLoggedIn && (
        <div className="mx-3 mt-4" data-testid="panel-language-picker">
          <p className="text-[12px] font-semibold text-[#5B4B86] mb-1.5">{t("language")}</p>
          <div className="grid grid-cols-2 gap-1 rounded-full bg-[#F6F3FB] p-1">
            <button type="button" onClick={() => void setLocale("tr")} className={`h-9 rounded-full text-sm font-semibold ${me?.locale !== "en" ? "bg-white text-[#1C1B1F] shadow-sm" : "text-[#6B6573]"}`}>
              Türkçe
            </button>
            <button type="button" onClick={() => void setLocale("en")} className={`h-9 rounded-full text-sm font-semibold ${me?.locale === "en" ? "bg-white text-[#1C1B1F] shadow-sm" : "text-[#6B6573]"}`}>
              English
            </button>
          </div>
        </div>
      )}

      {editing && (
        <div className="mx-3 mt-4 rounded-2xl border border-[#E4DCF3] bg-[#FAF8FD] p-3 space-y-2" data-testid="form-edit-profile">
          <div className="grid grid-cols-5 gap-1.5">
            {SOCIAL_PHOTOS.map((photo) => (
              <button key={photo} type="button" onClick={() => setForm((f) => ({ ...f, avatar: photo }))} className={`rounded-lg overflow-hidden ring-2 ${form.avatar === photo ? "ring-[#8E7CC3]" : "ring-transparent"}`}>
                <img src={photo} alt="" className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder={t("name")} className="w-full h-10 rounded-xl border border-[#E4DCF3] bg-white px-3 text-sm" />
          <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder={t("city")} className="w-full h-10 rounded-xl border border-[#E4DCF3] bg-white px-3 text-sm" />
          <input value={form.dogName} onChange={(e) => setForm((f) => ({ ...f, dogName: e.target.value }))} placeholder={t("dogName")} className="w-full h-10 rounded-xl border border-[#E4DCF3] bg-white px-3 text-sm" />
          <textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder={t("bio")} rows={3} className="w-full rounded-xl border border-[#E4DCF3] bg-white p-3 text-sm" />
          <button type="button" onClick={() => void saveProfile()} className="h-10 w-full rounded-full bg-[#8E7CC3] text-white text-sm font-semibold">
            {t("saveChanges")}
          </button>
        </div>
      )}

      {isLoggedIn && (
        <>
          <div className="mt-5 px-3 grid grid-cols-4 gap-1">
            {([
              ["posts", t("posts")],
              ["saved", t("saved")],
              ["followers", t("followers")],
              ["following", t("followingTab")],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`h-9 rounded-full text-[11px] font-semibold ${tab === key ? "bg-[#8E7CC3] text-white" : "bg-[#F6F3FB] text-[#5B4B86]"}`}
                data-testid={`tab-${key}`}
              >
                {label}
              </button>
            ))}
          </div>
          <section className="mt-3 px-3">
            {tab === "posts" && (
              <div className="grid grid-cols-3 gap-1">
                {(profileQuery.data?.posts || []).map((post) => (
                  <Link key={post.id} href={`/gonderi/${post.id}`}>
                    <img src={post.image} alt={post.dogName} className="aspect-square w-full object-cover bg-[#F3EFFA]" />
                  </Link>
                ))}
              </div>
            )}
            {tab === "saved" && (
              <div className="grid grid-cols-3 gap-1">
                {(savedQuery.data?.posts || []).map((post) => (
                  <Link key={post.id} href={`/gonderi/${post.id}`}>
                    <img src={post.image} alt={post.dogName} className="aspect-square w-full object-cover bg-[#F3EFFA]" />
                  </Link>
                ))}
                {savedQuery.data?.posts.length === 0 && (
                  <p className="col-span-3 text-[13px] text-[#6B6573] py-4">{t("noSaved")}</p>
                )}
              </div>
            )}
            {tab === "followers" && <MemberList members={profileQuery.data?.followers || []} empty={t("noFollowers")} />}
            {tab === "following" && <MemberList members={profileQuery.data?.following || []} empty={t("noFollowing")} />}
          </section>
        </>
      )}
    </CommunityLayout>
  );
}

function MemberList({ members, empty }: { members: PublicMember[]; empty: string }) {
  if (members.length === 0) return <p className="text-[13px] text-[#6B6573] py-4">{empty}</p>;
  return (
    <ul className="space-y-2">
      {members.map((member) => (
        <li key={member.id}>
          <Link href={profilePath(member)} className="flex items-center gap-2.5 rounded-xl border border-[#F1EDF6] p-2">
            <img src={member.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <p className="text-[13px] font-semibold">{member.name}</p>
              <p className="text-[11px] text-[#6B6573]">{member.dogName} · {member.city}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
