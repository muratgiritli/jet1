import { useState } from "react";
import { Bookmark, Heart, MessageCircle } from "lucide-react";
import type { Post } from "@/lib/community-feed";
import { useAuthPrompt } from "@/components/community/AuthPrompt";

export default function FeedPost({ post }: { post: Post }) {
  const { requireAuth } = useAuthPrompt();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);

  const guardToggle = (whenAuthed: () => void) => {
    if (requireAuth()) whenAuthed();
  };

  return (
    <article className="bg-white scroll-mt-16" data-testid={`feed-post-${post.id}`}>
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <img
          src={post.avatar}
          alt=""
          className="w-9 h-9 rounded-full object-cover ring-1 ring-[#E6E0F0]"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-[#1C1B1F] leading-tight truncate">
            {post.author}
          </p>
          <p className="text-[11px] text-[#6B6573] truncate">
            {post.city} · {post.time}
          </p>
        </div>
        <button
          type="button"
          onClick={() => guardToggle(() => setFollowing((v) => !v))}
          className={`h-8 px-3 rounded-full text-[12px] font-semibold border ${
            following
              ? "text-[#6B6573] border-[#E6E0F0] bg-[#FAF8FD]"
              : "text-[#8E7CC3] border-[#D9D0EC]"
          }`}
          data-testid={`btn-follow-${post.id}`}
        >
          {following ? "Takip" : "Takip et"}
        </button>
      </div>

      <img
        src={post.image}
        alt={`${post.dogName} paylaşımı`}
        className="w-full aspect-square object-cover bg-[#F3EFFA]"
        data-testid={`img-post-${post.id}`}
      />

      <div className="px-2.5 pt-2 flex items-center gap-1">
        <button
          type="button"
          onClick={() => guardToggle(() => setLiked((v) => !v))}
          className="h-10 px-2 flex items-center gap-1.5 text-[#1C1B1F]"
          data-testid={`btn-like-${post.id}`}
        >
          <Heart className={`w-6 h-6 ${liked ? "fill-[#8E7CC3] text-[#8E7CC3]" : ""}`} />
          <span className="text-[13px] font-semibold">{post.likes + (liked ? 1 : 0)}</span>
        </button>
        <button
          type="button"
          onClick={() => requireAuth()}
          className="h-10 px-2 flex items-center gap-1.5 text-[#1C1B1F]"
          data-testid={`btn-comment-${post.id}`}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-[13px] font-semibold">{post.comments}</span>
        </button>
        <button
          type="button"
          onClick={() => guardToggle(() => setSaved((v) => !v))}
          className="h-10 w-10 ml-auto flex items-center justify-center text-[#1C1B1F]"
          aria-label="Kaydet"
          data-testid={`btn-save-${post.id}`}
        >
          <Bookmark className={`w-6 h-6 ${saved ? "fill-[#8E7CC3] text-[#8E7CC3]" : ""}`} />
        </button>
      </div>

      <p className="px-3 pb-3 text-[13px] leading-relaxed text-[#1C1B1F]">
        <span className="font-semibold mr-1">{post.author}</span>
        {post.caption}
      </p>
    </article>
  );
}
