import { useState } from "react";
import { Link, useSearch } from "wouter";
import SEO, { SITE_DOMAIN } from "@/components/SEO";
import CommunityLayout from "@/components/community/CommunityLayout";
import { useQuery } from "@tanstack/react-query";
import { profilePath, type FeedPostDto, type ForumTopicDto, type PublicMember } from "@shared/social";
import { socialGet } from "@/lib/social-api";
import { useCommunityI18n } from "@/lib/community-i18n";

export default function CommunitySearchPage() {
  const searchString = useSearch();
  const initial = new URLSearchParams(searchString).get("q") || "";
  const [query, setQuery] = useState(initial);
  const { t } = useCommunityI18n();
  const { data } = useQuery({
    queryKey: ["/api/social/search", query],
    queryFn: () =>
      socialGet<{ posts: FeedPostDto[]; topics: ForumTopicDto[]; members: PublicMember[] }>(
        `/api/social/search?q=${encodeURIComponent(query)}`,
      ),
    staleTime: 5_000,
  });

  return (
    <CommunityLayout>
      <SEO
        title={t("seoTitleSearch")}
        description={t("seoDescSearch")}
        canonical={`${SITE_DOMAIN}/ara`}
      />
      <div className="px-3 pt-3">
        <label className="sr-only" htmlFor="community-search">{t("search")}</label>
        <input
          id="community-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          autoFocus
          className="w-full h-11 rounded-full border border-[#E4DCF3] bg-[#FAF8FD] px-4 text-sm text-[#1C1B1F] placeholder:text-[#8A8494] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4B5E8]"
          data-testid="input-community-search"
        />
      </div>

      <section className="px-3 pt-4">
        <h2 className="text-[13px] font-bold text-[#1C1B1F] mb-2">{t("people")}</h2>
        {(data?.members || []).length === 0 ? (
          <p className="text-[13px] text-[#6B6573]">{t("noPeople")}</p>
        ) : (
          <ul className="space-y-2">
            {(data?.members || []).slice(0, 8).map((member) => (
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
        )}
      </section>

      <section className="px-3 pt-4">
        <h2 className="text-[13px] font-bold text-[#1C1B1F] mb-2">{t("posts")}</h2>
        {(data?.posts || []).length === 0 ? (
          <p className="text-[13px] text-[#6B6573]">{t("noPosts")}</p>
        ) : (
          <ul className="space-y-2">
            {(data?.posts || []).map((post) => (
              <li key={post.id}>
                <Link href={`/gonderi/${post.id}`} className="flex gap-2.5 rounded-xl border border-[#F1EDF6] p-2">
                  <img src={post.image} alt="" className="w-14 h-14 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold truncate">{post.author} · {post.dogName}</p>
                    <p className="text-[12px] text-[#5F5B66] line-clamp-2">{post.caption}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="px-3 pt-5">
        <h2 className="text-[13px] font-bold text-[#1C1B1F] mb-2">{t("navForum")}</h2>
        {(data?.topics || []).length === 0 ? (
          <p className="text-[13px] text-[#6B6573]">{t("noTopics")}</p>
        ) : (
          <ul className="space-y-2">
            {(data?.topics || []).map((topic) => (
              <li key={topic.id}>
                <Link
                  href={`/forum/${topic.id}`}
                  className="block rounded-xl border border-[#E4DCF3] p-3"
                  data-testid={`search-topic-${topic.id}`}
                >
                  <p className="text-[13px] font-semibold text-[#1C1B1F]">{topic.title}</p>
                  <p className="text-[12px] text-[#5F5B66] line-clamp-2 mt-0.5">{topic.excerpt}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </CommunityLayout>
  );
}
