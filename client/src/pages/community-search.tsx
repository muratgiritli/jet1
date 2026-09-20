import { useMemo, useState } from "react";
import { Link, useSearch } from "wouter";
import SEO, { SITE_DOMAIN } from "@/components/SEO";
import CommunityLayout from "@/components/community/CommunityLayout";
import { searchCommunity } from "@/lib/community-feed";

export default function CommunitySearchPage() {
  const searchString = useSearch();
  const initial = new URLSearchParams(searchString).get("q") || "";
  const [query, setQuery] = useState(initial);
  const results = useMemo(() => searchCommunity(query), [query]);

  return (
    <CommunityLayout>
      <SEO
        title="Ara — YourPoodle"
        description="Gönderi ve forum konularında ara."
        canonical={`${SITE_DOMAIN}/ara`}
      />
      <div className="px-3 pt-3">
        <label className="sr-only" htmlFor="community-search">Ara</label>
        <input
          id="community-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Poodle, şehir veya konu ara"
          autoFocus
          className="w-full h-11 rounded-full border border-[#E4DCF3] bg-[#FAF8FD] px-4 text-sm text-[#1C1B1F] placeholder:text-[#8A8494] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4B5E8]"
          data-testid="input-community-search"
        />
      </div>

      <section className="px-3 pt-4">
        <h2 className="text-[13px] font-bold text-[#1C1B1F] mb-2">Gönderiler</h2>
        {results.posts.length === 0 ? (
          <p className="text-[13px] text-[#6B6573]">Eşleşen gönderi yok.</p>
        ) : (
          <ul className="space-y-2">
            {results.posts.map((post) => (
              <li key={post.id} className="flex gap-2.5 rounded-xl border border-[#F1EDF6] p-2">
                <img src={post.image} alt="" className="w-14 h-14 rounded-lg object-cover" />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold truncate">{post.author} · {post.dogName}</p>
                  <p className="text-[12px] text-[#5F5B66] line-clamp-2">{post.caption}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="px-3 pt-5">
        <h2 className="text-[13px] font-bold text-[#1C1B1F] mb-2">Forum</h2>
        {results.topics.length === 0 ? (
          <p className="text-[13px] text-[#6B6573]">Eşleşen konu yok.</p>
        ) : (
          <ul className="space-y-2">
            {results.topics.map((topic) => (
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
