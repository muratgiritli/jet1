import { Link, useRoute } from "wouter";
import { ArrowLeft, MessageCircle } from "lucide-react";
import SEO, { SITE_DOMAIN } from "@/components/SEO";
import CommunityLayout from "@/components/community/CommunityLayout";
import { getForumTopic } from "@/lib/community-feed";
import { useAuthPrompt } from "@/components/community/AuthPrompt";

export default function CommunityForumTopicPage() {
  const [, params] = useRoute("/forum/:id");
  const topic = params?.id ? getForumTopic(params.id) : undefined;
  const { requireAuth } = useAuthPrompt();

  if (!topic) {
    return (
      <CommunityLayout>
        <div className="px-4 py-12 text-center">
          <p className="text-sm text-[#6B6573]">Konu bulunamadı.</p>
          <Link href="/forum" className="mt-3 inline-block text-sm font-semibold text-[#8E7CC3]">
            Foruma dön
          </Link>
        </div>
      </CommunityLayout>
    );
  }

  return (
    <CommunityLayout>
      <SEO
        title={`${topic.title} — YourPoodle Forum`}
        description={topic.excerpt}
        canonical={`${SITE_DOMAIN}/forum/${topic.id}`}
      />
      <div className="px-3 pt-3">
        <Link
          href="/forum"
          className="inline-flex items-center gap-1 text-[13px] font-medium text-[#6A5A96]"
          data-testid="link-back-forum"
        >
          <ArrowLeft className="w-4 h-4" />
          Forum
        </Link>
      </div>
      <article className="px-3 pt-3 pb-4" data-testid={`forum-topic-${topic.id}`}>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#8E7CC3]">{topic.tag}</span>
        <h1 className="mt-1 text-[20px] font-extrabold leading-snug text-[#1C1B1F]">{topic.title}</h1>
        <p className="mt-1 text-[12px] text-[#6B6573]">
          {topic.author} · {topic.city} · {topic.time} · {topic.views} görüntülenme
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-[#2B2833]">{topic.body}</p>
        <button
          type="button"
          onClick={() => requireAuth()}
          className="mt-4 h-10 px-4 rounded-full bg-[#8E7CC3] text-white text-sm font-semibold inline-flex items-center gap-1.5"
          data-testid="btn-reply-topic"
        >
          <MessageCircle className="w-4 h-4" />
          Yanıtla
        </button>
      </article>
      <section className="border-t border-[#F1EDF6] px-3 py-3">
        <h2 className="text-[13px] font-bold text-[#1C1B1F] mb-2">{topic.comments.length} yanıt</h2>
        <ul className="space-y-3">
          {topic.comments.map((reply) => (
            <li key={reply.id} className="rounded-2xl bg-[#FAF8FD] p-3" data-testid={`forum-reply-${reply.id}`}>
              <p className="text-[12px] font-semibold text-[#1C1B1F]">
                {reply.author} <span className="font-normal text-[#6B6573]">· {reply.city} · {reply.time}</span>
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-[#2B2833]">{reply.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </CommunityLayout>
  );
}
