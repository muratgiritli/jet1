import { Link, useLocation } from "wouter";
import { Bookmark, Heart, MessageCircle } from "lucide-react";
import { profilePath, type FeedPostDto } from "@shared/social";
import { useCommunityI18n } from "@/lib/community-i18n";
import { useAuthPrompt } from "@/components/community/AuthPrompt";
import { socialSend } from "@/lib/social-api";
import { queryClient } from "@/lib/queryClient";
import { useSocialAuth } from "@/contexts/SocialAuthContext";

export default function FeedPost({ post }: { post: FeedPostDto }) {
  const { requireAuth } = useAuthPrompt();
  const { me } = useSocialAuth();
  const { t, timeAgo } = useCommunityI18n();
  const [, setLocation] = useLocation();
  const href = profilePath(post);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["/api/social/feed"] });
    void queryClient.invalidateQueries({ queryKey: ["/api/social/posts", post.id] });
    void queryClient.invalidateQueries({ queryKey: ["/api/social/me/saved"] });
    if (post.username) {
      void queryClient.invalidateQueries({ queryKey: ["/api/social/members", post.username] });
    }
  };

  const like = async () => {
    if (!requireAuth()) return;
    const data = await socialSend<{ post: FeedPostDto }>("POST", `/api/social/posts/${post.id}/like`);
    queryClient.setQueryData(["/api/social/posts", post.id], (old: { post: FeedPostDto } | undefined) =>
      old ? { ...old, post: data.post } : old,
    );
    refresh();
  };

  const save = async () => {
    if (!requireAuth()) return;
    await socialSend("POST", `/api/social/posts/${post.id}/save`);
    refresh();
  };

  const follow = async () => {
    if (!requireAuth()) return;
    if (me?.username === post.username) return;
    await socialSend("POST", `/api/social/members/${post.username}/follow`);
    refresh();
  };

  return (
    <article className="bg-white scroll-mt-16" data-testid={`feed-post-${post.id}`}>
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <Link href={href}>
          <img
            src={post.avatar}
            alt=""
            className="w-9 h-9 rounded-full object-cover ring-1 ring-[#E6E0F0]"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={href} className="text-[13px] font-semibold text-[#1C1B1F] leading-tight truncate block">
            {post.author}
          </Link>
          <p className="text-[11px] text-[#6B6573] truncate">
            {post.city} · {timeAgo(post.createdAt)}
          </p>
        </div>
        {me?.username !== post.username && (
          <button
            type="button"
            onClick={() => void follow()}
            className={`h-8 px-3 rounded-full text-[12px] font-semibold border ${
              post.isFollowing
                ? "text-[#6B6573] border-[#E6E0F0] bg-[#FAF8FD]"
                : "text-[#8E7CC3] border-[#D9D0EC]"
            }`}
            data-testid={`btn-follow-${post.id}`}
          >
            {post.isFollowing ? t("following") : t("follow")}
          </button>
        )}
      </div>

      <button type="button" className="block w-full" onClick={() => setLocation(`/gonderi/${post.id}`)}>
        <img
          src={post.image}
          alt={t("photoAlt", { name: post.dogName })}
          className="w-full aspect-square object-cover bg-[#F3EFFA]"
          data-testid={`img-post-${post.id}`}
        />
      </button>

      <div className="px-2.5 pt-2 flex items-center gap-1">
        <button
          type="button"
          onClick={() => void like()}
          className="h-10 px-2 flex items-center gap-1.5 text-[#1C1B1F]"
          data-testid={`btn-like-${post.id}`}
        >
          <Heart className={`w-6 h-6 ${post.liked ? "fill-[#8E7CC3] text-[#8E7CC3]" : ""}`} />
          <span className="text-[13px] font-semibold">{post.likes}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (requireAuth()) setLocation(`/gonderi/${post.id}`);
          }}
          className="h-10 px-2 flex items-center gap-1.5 text-[#1C1B1F]"
          data-testid={`btn-comment-${post.id}`}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-[13px] font-semibold">{post.comments}</span>
        </button>
        <button
          type="button"
          onClick={() => void save()}
          className="h-10 w-10 ml-auto flex items-center justify-center text-[#1C1B1F]"
          aria-label={t("save")}
          data-testid={`btn-save-${post.id}`}
        >
          <Bookmark className={`w-6 h-6 ${post.saved ? "fill-[#8E7CC3] text-[#8E7CC3]" : ""}`} />
        </button>
      </div>

      <p className="px-3 pb-3 text-[13px] leading-relaxed text-[#1C1B1F]">
        <Link href={href} className="font-semibold mr-1">
          {post.author}
        </Link>
        {post.caption}
      </p>
    </article>
  );
}
