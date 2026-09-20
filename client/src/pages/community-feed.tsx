import SEO, { SITE_DOMAIN } from "@/components/SEO";
import CommunityLayout from "@/components/community/CommunityLayout";
import StoryRow from "@/components/community/StoryRow";
import FeedPost from "@/components/community/FeedPost";
import ForumPreview from "@/components/community/ForumPreview";
import { buildFeed } from "@/lib/community-feed";

const FEED = buildFeed();

export default function CommunityFeedPage() {
  return (
    <CommunityLayout>
      <SEO
        title="YourPoodle — Poodle sahipleri için sosyal akış"
        description="Türkiye’deki poodle sahiplerinin paylaşım akışı, hikâyeleri ve forum konuları. Giriş yapmadan bakabilirsiniz."
        keywords="poodle, toy poodle, poodle sahipleri, köpek forumu, YourPoodle"
        canonical={`${SITE_DOMAIN}/`}
      />
      <StoryRow />
      <div className="divide-y divide-[#F1EDF6]" data-testid="community-feed">
        {FEED.map((item) =>
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
