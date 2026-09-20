import { useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft } from "lucide-react";
import SEO, { SITE_DOMAIN } from "@/components/SEO";
import CommunityLayout from "@/components/community/CommunityLayout";
import FeedPost from "@/components/community/FeedPost";
import { useQuery } from "@tanstack/react-query";
import type { CommentDto, FeedPostDto } from "@shared/social";
import { socialGet, socialSend } from "@/lib/social-api";
import { useAuthPrompt } from "@/components/community/AuthPrompt";
import { queryClient } from "@/lib/queryClient";
import { useCommunityI18n } from "@/lib/community-i18n";
import { profilePath } from "@shared/social";

export default function CommunityPostPage() {
  const [, params] = useRoute("/gonderi/:id");
  const id = params?.id || "";
  const { requireAuth } = useAuthPrompt();
  const { t, timeAgo } = useCommunityI18n();
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["/api/social/posts", id],
    queryFn: () => socialGet<{ post: FeedPostDto; comments: CommentDto[] }>(`/api/social/posts/${id}`),
    enabled: !!id,
    staleTime: 3_000,
  });

  const send = async () => {
    if (!requireAuth()) return;
    setError("");
    try {
      await socialSend("POST", `/api/social/posts/${id}/comments`, { body });
      setBody("");
      await queryClient.invalidateQueries({ queryKey: ["/api/social/posts", id] });
      await queryClient.invalidateQueries({ queryKey: ["/api/social/feed"] });
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t("commentFailed"));
    }
  };

  const report = async () => {
    if (!requireAuth()) return;
    await socialSend("POST", `/api/social/posts/${id}/report`, { reason: t("reportReason") });
    setError(t("reported"));
  };

  if (!isLoading && !data) {
    return (
      <CommunityLayout>
        <div className="px-4 py-12 text-center text-sm text-[#6B6573]">{t("postMissing")}</div>
      </CommunityLayout>
    );
  }

  return (
    <CommunityLayout>
      <SEO
        title={data ? t("postShareTitle", { name: data.post.author }) : t("postPageTitle")}
        description={data?.post.caption || ""}
        canonical={`${SITE_DOMAIN}/gonderi/${id}`}
      />
      <div className="px-3 pt-3">
        <Link href="/" className="inline-flex items-center gap-1 text-[13px] font-medium text-[#6A5A96]">
          <ArrowLeft className="w-4 h-4" />
          {t("backFeed")}
        </Link>
      </div>
      {data && <FeedPost post={data.post} />}
      <section className="px-3 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-bold">{data?.comments.length || 0} {t("comments")}</h2>
          <button type="button" onClick={() => void report()} className="text-[12px] font-semibold text-[#8A8494]">
            {t("report")}
          </button>
        </div>
        <ul className="mt-2 space-y-2">
          {(data?.comments || []).map((comment) => (
            <li key={comment.id} className="rounded-2xl bg-[#FAF8FD] p-3">
              <Link href={profilePath(comment)} className="text-[12px] font-semibold">
                {comment.author} <span className="font-normal text-[#6B6573]">· {timeAgo(comment.createdAt)}</span>
              </Link>
              <p className="mt-1 text-[13px] text-[#2B2833]">{comment.body}</p>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder={t("writeComment")}
            className="w-full rounded-xl border border-[#E4DCF3] bg-white p-3 text-sm"
            data-testid="input-post-comment"
          />
          {error && <p className="text-[12px] text-red-600">{error}</p>}
          <button
            type="button"
            onClick={() => void send()}
            className="h-10 px-4 rounded-full bg-[#8E7CC3] text-white text-sm font-semibold"
            data-testid="btn-send-comment"
          >
            {t("sendComment")}
          </button>
        </div>
      </section>
    </CommunityLayout>
  );
}
