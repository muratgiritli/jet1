import { useState } from "react";
import { Link } from "wouter";
import { ChevronRight, MessagesSquare } from "lucide-react";
import SEO, { SITE_DOMAIN } from "@/components/SEO";
import CommunityLayout from "@/components/community/CommunityLayout";
import { useQuery } from "@tanstack/react-query";
import type { ForumTopicDto } from "@shared/social";
import { socialGet, socialSend } from "@/lib/social-api";
import { useAuthPrompt } from "@/components/community/AuthPrompt";
import { queryClient } from "@/lib/queryClient";
import { forumTagLabel, useCommunityI18n } from "@/lib/community-i18n";

export default function CommunityForumPage() {
  const { requireAuth } = useAuthPrompt();
  const { t, locale, timeAgo } = useCommunityI18n();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("Sohbet");
  const [error, setError] = useState("");
  const { data } = useQuery({
    queryKey: ["/api/social/forum"],
    queryFn: () => socialGet<{ topics: ForumTopicDto[] }>("/api/social/forum"),
    staleTime: 10_000,
  });

  const create = async () => {
    if (!requireAuth()) return;
    setError("");
    try {
      const res = await socialSend<{ topic: ForumTopicDto }>("POST", "/api/social/forum", { title, body, tag });
      setTitle("");
      setBody("");
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["/api/social/forum"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/social/feed"] });
      if (res.topic) window.location.assign(`/forum/${res.topic.id}`);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t("topicFailed"));
    }
  };

  return (
    <CommunityLayout>
      <SEO
        title={t("seoTitleForum")}
        description={t("seoDescForum")}
        canonical={`${SITE_DOMAIN}/forum`}
      />
      <div className="px-3 pt-4 pb-2 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold text-[#1C1B1F]" data-testid="text-forum-title">{t("forumTitle")}</h1>
        <p className="text-[13px] text-[#6B6573] mt-1">{t("forumLead")}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (requireAuth()) setOpen((v) => !v);
          }}
          className="h-9 px-3 rounded-full bg-[#8E7CC3] text-white text-[12px] font-semibold shrink-0"
          data-testid="btn-new-topic"
        >
          {t("newTopic")}
        </button>
      </div>
      {open && (
        <div className="mx-3 mb-3 rounded-2xl border border-[#E4DCF3] bg-[#FAF8FD] p-3 space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("topicTitle")}
            className="w-full h-10 rounded-xl border border-[#E4DCF3] bg-white px-3 text-sm"
            data-testid="input-topic-title"
          />
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full h-10 rounded-xl border border-[#E4DCF3] bg-white px-3 text-sm"
          >
            <option value="Sohbet">{t("tagChat")}</option>
            <option value="Bakım">{t("tagCare")}</option>
            <option value="Sağlık">{t("tagHealth")}</option>
            <option value="Kulüp">{t("tagClub")}</option>
          </select>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder={t("topicBody")}
            className="w-full rounded-xl border border-[#E4DCF3] bg-white p-3 text-sm"
            data-testid="input-topic-body"
          />
          {error && <p className="text-[12px] text-red-600">{error}</p>}
          <button
            type="button"
            onClick={() => void create()}
            className="h-10 w-full rounded-full bg-[#8E7CC3] text-white text-sm font-semibold"
            data-testid="btn-submit-topic"
          >
            {t("openTopic")}
          </button>
        </div>
      )}
      <ul className="px-3 space-y-2.5">
        {(data?.topics || []).map((topic) => (
          <li key={topic.id}>
            <Link
              href={`/forum/${topic.id}`}
              className="block rounded-2xl border border-[#E4DCF3] bg-white p-3.5"
              data-testid={`forum-topic-card-${topic.id}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#6A5A96]">
                  <MessagesSquare className="w-3 h-3" />
                  {forumTagLabel(locale, topic.tag)}
                </span>
                <span className="text-[11px] text-[#8A8494]">{timeAgo(topic.createdAt)}</span>
              </div>
              <h2 className="text-[15px] font-bold leading-snug text-[#1C1B1F]">{topic.title}</h2>
              <p className="mt-1 text-[12px] text-[#5F5B66] line-clamp-2">{topic.excerpt}</p>
              <div className="mt-2 flex items-center text-[11px] text-[#6B6573]">
                <span className="truncate">{topic.author} · {topic.city}</span>
                <span className="ml-auto">{topic.replies} {t("replies")}</span>
                <ChevronRight className="w-4 h-4 text-[#8E7CC3]" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </CommunityLayout>
  );
}
