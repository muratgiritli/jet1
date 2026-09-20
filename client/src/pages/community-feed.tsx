import SEO, { SITE_DOMAIN } from "@/components/SEO";
import CommunityLayout from "@/components/community/CommunityLayout";
import StoryRow from "@/components/community/StoryRow";
import FeedPost from "@/components/community/FeedPost";
import ForumPreview from "@/components/community/ForumPreview";
import { useQuery } from "@tanstack/react-query";
import type { FeedPostDto, ForumTopicDto, StoryDto } from "@shared/social";
import { socialGet } from "@/lib/social-api";

function buildFeed(posts: FeedPostDto[], topics: ForumTopicDto[]) {
  const items: Array<{ type: "post"; post: FeedPostDto } | { type: "forum"; topic: ForumTopicDto }> = [];
  let topicIndex = 0;
  posts.forEach((post, index) => {
    items.push({ type: "post", post });
    if ((index + 1) % 2 === 0 && topicIndex < topics.length) {
      items.push({ type: "forum", topic: topics[topicIndex] });
      topicIndex += 1;
    }
  });
  while (topicIndex < topics.length) {
    items.push({ type: "forum", topic: topics[topicIndex] });
    topicIndex += 1;
  }
  return items;
}

export default function CommunityFeedPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/social/feed"],
    queryFn: () => socialGet<{ posts: FeedPostDto[]; stories: StoryDto[]; topics: ForumTopicDto[] }>("/api/social/feed"),
    staleTime: 10_000,
  });

  const items = buildFeed(data?.posts || [], data?.topics || []);

  return (
    <CommunityLayout>
      <SEO
        title="YourPoodle — Poodle sahipleri için sosyal akış"
        description="Türkiye’deki poodle sahiplerinin paylaşım akışı, hikâyeleri ve forum konuları. Giriş yapmadan bakabilirsiniz."
        keywords="poodle, toy poodle, poodle sahipleri, köpek forumu, YourPoodle"
        canonical={`${SITE_DOMAIN}/`}
      />
      <StoryRow stories={data?.stories || []} />
      {isLoading && (
        <p className="px-4 py-8 text-center text-sm text-[#6B6573]">Akış yükleniyor…</p>
      )}
      <div className="divide-y divide-[#F1EDF6]" data-testid="community-feed">
        {items.map((item) =>
          item.type === "post" ? (
            <FeedPost key={item.post.id} post={item.post} />
          ) : (
            <ForumPreview key={item.topic.id} topic={item.topic} />
          ),
        )}
      </div>
    </CommunityLayout>
  );
}
