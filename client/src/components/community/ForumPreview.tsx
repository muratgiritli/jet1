import { ChevronRight, MessagesSquare } from "lucide-react";
import { Link } from "wouter";
import type { ForumTopicDto } from "@shared/social";
import { forumTagLabel, useCommunityI18n } from "@/lib/community-i18n";

export default function ForumPreview({ topic }: { topic: ForumTopicDto }) {
  const { t, locale } = useCommunityI18n();
  return (
    <article className="px-3 py-3 bg-[#F6F3FB] scroll-mt-16" data-testid={`forum-preview-${topic.id}`}>
      <Link
        href={`/forum/${topic.id}`}
        className="block rounded-2xl border border-[#E4DCF3] bg-white p-3.5 shadow-[0_1px_0_rgba(142,124,195,0.08)]"
        data-testid={`link-forum-${topic.id}`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 h-6 px-2 rounded-full bg-[#F3EFFA] text-[#6A5A96] text-[11px] font-semibold">
            <MessagesSquare className="w-3 h-3" />
            {t("navForum")}
          </span>
          <span className="text-[10px] font-semibold text-[#8E7CC3]">{forumTagLabel(locale, topic.tag)}</span>
        </div>
        <h2 className="text-[15px] font-bold text-[#1C1B1F] leading-snug">{topic.title}</h2>
        <p className="mt-1 text-[12px] text-[#5F5B66] leading-relaxed line-clamp-2">{topic.excerpt}</p>
        <div className="mt-2.5 flex items-center text-[11px] text-[#6B6573]">
          <span className="truncate">{topic.author} · {topic.city}</span>
          <span className="mx-1.5">·</span>
          <span>{topic.replies} {t("replies")}</span>
          <ChevronRight className="w-4 h-4 ml-auto text-[#8E7CC3]" />
        </div>
      </Link>
    </article>
  );
}
