import { useEffect, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { ArrowLeft, ChevronRight } from "lucide-react";
import SEO, { SITE_DOMAIN } from "@/components/SEO";
import CommunityLayout from "@/components/community/CommunityLayout";
import { useQuery } from "@tanstack/react-query";
import {
  categoryDescription,
  categoryLabel,
  forumTopicPath,
  type ForumCategoryDto,
  type ForumTopicDto,
} from "@shared/social";
import { socialGet, socialSend } from "@/lib/social-api";
import { useAuthPrompt } from "@/components/community/AuthPrompt";
import { queryClient } from "@/lib/queryClient";
import { useCommunityI18n } from "@/lib/community-i18n";

export default function CommunityForumCategoryPage() {
  const [, params] = useRoute("/forum/:categorySlug");
  const slug = params?.categorySlug || "";
  const { requireAuth } = useAuthPrompt();
  const { t, locale, timeAgo } = useCommunityI18n();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["/api/social/forum", slug],
    queryFn: () =>
      socialGet<{ category?: ForumCategoryDto; topics?: ForumTopicDto[]; topic?: ForumTopicDto; redirect?: string }>(
        `/api/social/forum/${slug}`,
      ),
    enabled: !!slug,
    staleTime: 5_000,
  });

  useEffect(() => {
    if (data?.redirect) setLocation(data.redirect);
    else if (data?.topic && !data.category) setLocation(forumTopicPath(data.topic));
  }, [data, setLocation]);

  const create = async () => {
    if (!requireAuth()) return;
    setError("");
    try {
      const res = await socialSend<{ topic: ForumTopicDto }>("POST", `/api/social/forum/${slug}`, { title, body });
      setTitle("");
      setBody("");
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["/api/social/forum"] });
      if (res.topic) setLocation(forumTopicPath(res.topic));
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t("topicFailed"));
    }
  };

  if (!isLoading && !data?.category && !data?.topic) {
    return (
      <CommunityLayout>
        <div className="px-4 py-12 text-center">
          <p className="text-sm text-[#6B6573]">{t("categoryMissing")}</p>
          <Link href="/forum" className="mt-3 inline-block text-sm font-semibold text-[#8E7CC3]">{t("backToForum")}</Link>
        </div>
      </CommunityLayout>
    );
  }

  const category = data?.category;
  const topics = data?.topics || [];

  return (
    <CommunityLayout>
      <SEO
        title={`${category ? categoryLabel(locale, category) : t("forumTitle")} — YourPoodle`}
        description={category ? categoryDescription(locale, category) : t("seoDescForum")}
        canonical={`${SITE_DOMAIN}/forum/${slug}`}
      />
      <div className="px-3 pt-3">
        <Link href="/forum" className="inline-flex items-center gap-1 text-[13px] font-medium text-[#6A5A96]" data-testid="link-back-forum">
          <ArrowLeft className="w-4 h-4" />
          {t("backCategory")}
        </Link>
      </div>
      {category && (
        <div className="px-3 pt-3 pb-2 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-extrabold text-[#1C1B1F]" data-testid="text-category-title">{categoryLabel(locale, category)}</h1>
            <p className="text-[13px] text-[#6B6573] mt-1">{categoryDescription(locale, category)}</p>
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
      )}
      {open && (
        <div className="mx-3 mb-3 rounded-2xl border border-[#E4DCF3] bg-[#FAF8FD] p-3 space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("topicTitle")}
            className="w-full h-10 rounded-xl border border-[#E4DCF3] bg-white px-3 text-sm"
            data-testid="input-topic-title"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder={t("topicBody")}
            className="w-full rounded-xl border border-[#E4DCF3] bg-white p-3 text-sm"
            data-testid="input-topic-body"
          />
          {error && <p className="text-[12px] text-red-600">{error}</p>}
          <button type="button" onClick={() => void create()} className="h-10 w-full rounded-full bg-[#8E7CC3] text-white text-sm font-semibold" data-testid="btn-submit-topic">
            {t("openTopic")}
          </button>
        </div>
      )}
      {topics.length === 0 && category && (
        <p className="px-4 py-6 text-[13px] text-[#6B6573]">{t("noTopicsInCategory")}</p>
      )}
      <ul className="px-3 space-y-2.5" data-testid="forum-topic-list">
        {topics.map((topic) => (
          <li key={topic.id}>
            <Link
              href={forumTopicPath(topic)}
              className="block rounded-2xl border border-[#E4DCF3] bg-white p-3.5"
              data-testid={`forum-topic-card-${topic.id}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
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
