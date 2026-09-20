import { useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, MessageCircle } from "lucide-react";
import SEO, { SITE_DOMAIN } from "@/components/SEO";
import CommunityLayout from "@/components/community/CommunityLayout";
import { useQuery } from "@tanstack/react-query";
import type { ForumTopicDto } from "@shared/social";
import { socialGet, socialSend } from "@/lib/social-api";
import { useAuthPrompt } from "@/components/community/AuthPrompt";
import { queryClient } from "@/lib/queryClient";
import { forumTagLabel, useCommunityI18n } from "@/lib/community-i18n";
import { profilePath } from "@shared/social";

export default function CommunityForumTopicPage() {
  const [, params] = useRoute("/forum/:id");
  const id = params?.id || "";
  const { requireAuth } = useAuthPrompt();
  const { t, locale, timeAgo } = useCommunityI18n();
  const [reply, setReply] = useState("");
  const [showBox, setShowBox] = useState(false);
  const [error, setError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["/api/social/forum", id],
    queryFn: () => socialGet<{ topic: ForumTopicDto }>(`/api/social/forum/${id}`),
    enabled: !!id,
    staleTime: 5_000,
  });

  const topic = data?.topic;

  const send = async () => {
    if (!requireAuth()) return;
    setError("");
    try {
      await socialSend("POST", `/api/social/forum/${id}/replies`, { body: reply });
      setReply("");
      setShowBox(false);
      await queryClient.invalidateQueries({ queryKey: ["/api/social/forum", id] });
      await queryClient.invalidateQueries({ queryKey: ["/api/social/forum"] });
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t("replyFailed"));
    }
  };

  if (!isLoading && !topic) {
    return (
      <CommunityLayout>
        <div className="px-4 py-12 text-center">
          <p className="text-sm text-[#6B6573]">{t("topicMissing")}</p>
          <Link href="/forum" className="mt-3 inline-block text-sm font-semibold text-[#8E7CC3]">
            {t("backToForum")}
          </Link>
        </div>
      </CommunityLayout>
    );
  }

  if (!topic) {
    return (
      <CommunityLayout>
        <p className="px-4 py-10 text-center text-sm text-[#6B6573]">{t("topicLoading")}</p>
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
          {t("backForum")}
        </Link>
      </div>
      <article className="px-3 pt-3 pb-4" data-testid={`forum-topic-${topic.id}`}>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#8E7CC3]">{forumTagLabel(locale, topic.tag)}</span>
        <h1 className="mt-1 text-[20px] font-extrabold leading-snug text-[#1C1B1F]">{topic.title}</h1>
        <p className="mt-1 text-[12px] text-[#6B6573]">
          {topic.author} · {topic.city} · {timeAgo(topic.createdAt)} · {topic.views} {t("views")}
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-[#2B2833]">{topic.body}</p>
        <button
          type="button"
          onClick={() => {
            if (requireAuth()) setShowBox(true);
          }}
          className="mt-4 h-10 px-4 rounded-full bg-[#8E7CC3] text-white text-sm font-semibold inline-flex items-center gap-1.5"
          data-testid="btn-reply-topic"
        >
          <MessageCircle className="w-4 h-4" />
          {t("reply")}
        </button>
        {showBox && (
          <div className="mt-3 space-y-2">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={3}
              placeholder={t("writeReply")}
              className="w-full rounded-xl border border-[#E4DCF3] bg-[#FAF8FD] p-3 text-sm"
              data-testid="input-forum-reply"
            />
            {error && <p className="text-[12px] text-red-600">{error}</p>}
            <button
              type="button"
              onClick={() => void send()}
              className="h-10 px-4 rounded-full bg-[#8E7CC3] text-white text-sm font-semibold"
              data-testid="btn-send-reply"
            >
              {t("send")}
            </button>
          </div>
        )}
      </article>
      <section className="border-t border-[#F1EDF6] px-3 py-3">
        <h2 className="text-[13px] font-bold text-[#1C1B1F] mb-2">{topic.comments.length} {t("replies")}</h2>
        <ul className="space-y-3">
          {topic.comments.map((item) => (
            <li key={item.id} className="rounded-2xl bg-[#FAF8FD] p-3" data-testid={`forum-reply-${item.id}`}>
              <Link href={profilePath(item)} className="text-[12px] font-semibold text-[#1C1B1F]">
                {item.author} <span className="font-normal text-[#6B6573]">· {item.city} · {timeAgo(item.createdAt)}</span>
              </Link>
              <p className="mt-1 text-[13px] leading-relaxed text-[#2B2833]">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </CommunityLayout>
  );
}
