import { Link } from "wouter";
import { ChevronRight, MessagesSquare } from "lucide-react";
import SEO, { SITE_DOMAIN } from "@/components/SEO";
import CommunityLayout from "@/components/community/CommunityLayout";
import { FORUM_TOPICS } from "@/lib/community-feed";

export default function CommunityForumPage() {
  return (
    <CommunityLayout>
      <SEO
        title="Forum — YourPoodle"
        description="Poodle bakımı, sağlık ve kulüp sohbetleri."
        canonical={`${SITE_DOMAIN}/forum`}
      />
      <div className="px-3 pt-4 pb-2">
        <h1 className="text-lg font-extrabold text-[#1C1B1F]" data-testid="text-forum-title">Forum</h1>
        <p className="text-[13px] text-[#6B6573] mt-1">Bakım, sağlık ve yürüyüş konuları.</p>
      </div>
      <ul className="px-3 space-y-2.5">
        {FORUM_TOPICS.map((topic) => (
          <li key={topic.id}>
            <Link
              href={`/forum/${topic.id}`}
              className="block rounded-2xl border border-[#E4DCF3] bg-white p-3.5"
              data-testid={`forum-topic-card-${topic.id}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#6A5A96]">
                  <MessagesSquare className="w-3 h-3" />
                  {topic.tag}
                </span>
                <span className="text-[11px] text-[#8A8494]">{topic.time}</span>
              </div>
              <h2 className="text-[15px] font-bold leading-snug text-[#1C1B1F]">{topic.title}</h2>
              <p className="mt-1 text-[12px] text-[#5F5B66] line-clamp-2">{topic.excerpt}</p>
              <div className="mt-2 flex items-center text-[11px] text-[#6B6573]">
                <span className="truncate">{topic.author} · {topic.city}</span>
                <span className="ml-auto">{topic.replies} yanıt</span>
                <ChevronRight className="w-4 h-4 text-[#8E7CC3]" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </CommunityLayout>
  );
}
