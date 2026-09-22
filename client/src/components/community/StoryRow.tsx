import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { StoryDto } from "@shared/social";
import { useAuthPrompt } from "@/components/community/AuthPrompt";
import { socialSend } from "@/lib/social-api";
import { queryClient } from "@/lib/queryClient";
import { useSocialAuth } from "@/contexts/SocialAuthContext";
import { useCommunityI18n } from "@/lib/community-i18n";

export default function StoryRow({ stories }: { stories: StoryDto[] }) {
  const [active, setActive] = useState<StoryDto | null>(null);
  const { requireAuth } = useAuthPrompt();
  const { me } = useSocialAuth();
  const { t, timeAgo } = useCommunityI18n();
  const scroller = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const activeIndex = active ? stories.findIndex((story) => story.id === active.id) : -1;
  const hasPrevStory = activeIndex > 0;
  const hasNextStory = activeIndex >= 0 && activeIndex < stories.length - 1;

  const updateScrollButtons = () => {
    const el = scroller.current;
    if (!el) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }
    setCanScrollPrev(el.scrollLeft > 8);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useLayoutEffect(() => {
    const el = scroller.current;
    updateScrollButtons();
    if (!el) return;
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateScrollButtons) : null;
    observer?.observe(el);
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      observer?.disconnect();
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [stories.length]);

  const scrollStories = (dir: -1 | 1) => {
    scroller.current?.scrollBy({ left: dir * 80, behavior: "smooth" });
  };

  const goStory = (dir: -1 | 1) => {
    if (activeIndex < 0) return;
    const next = stories[activeIndex + dir];
    if (next) setActive(next);
  };

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goStory(-1);
      if (event.key === "ArrowRight") goStory(1);
      if (event.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, activeIndex, stories]);

  const follow = async (story: StoryDto) => {
    if (!requireAuth()) return;
    if (me?.username === story.username) return;
    await socialSend("POST", `/api/social/members/${story.username}/follow`);
    await queryClient.invalidateQueries({ queryKey: ["/api/social/feed"] });
    await queryClient.invalidateQueries({ queryKey: ["/api/social/stories"] });
  };

  return (
    <>
      <section
        className="relative bg-white border-b border-[#F1EDF6]"
        data-testid="story-row"
      >
        <div
          ref={scroller}
          className="flex gap-3 overflow-x-auto px-3 md:px-10 py-3 scrollbar-hide"
        >
          {stories.map((story) => (
            <button
              key={story.id}
              type="button"
              onClick={() => setActive(story)}
              className="flex flex-col items-center gap-1 shrink-0 w-[68px]"
              data-testid={`story-${story.id}`}
            >
              <span className="w-[62px] h-[62px] rounded-full p-[2px] bg-gradient-to-br from-[#C4B5E8] to-[#8E7CC3]">
                <span className="block w-full h-full rounded-full p-[2px] bg-white">
                  <img
                    src={story.avatar}
                    alt={`${story.dogName} ${t("storyAria")}`}
                    className="w-full h-full rounded-full object-cover"
                  />
                </span>
              </span>
              <span className="text-[11px] font-medium text-[#3F3A4A] truncate w-full text-center">
                {story.dogName}
              </span>
            </button>
          ))}
        </div>
        {canScrollPrev && (
          <button
            type="button"
            onClick={() => scrollStories(-1)}
            className="hidden md:flex absolute left-1 top-[34px] z-10 h-8 w-8 rounded-full bg-white text-[#8E7CC3] shadow-[0_1px_6px_rgba(44,36,64,0.16)] ring-1 ring-[#E6E0F0] items-center justify-center"
            aria-label={t("storyPrev")}
            data-testid="btn-story-row-prev"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {canScrollNext && (
          <button
            type="button"
            onClick={() => scrollStories(1)}
            className="hidden md:flex absolute right-1 top-[34px] z-10 h-8 w-8 rounded-full bg-white text-[#8E7CC3] shadow-[0_1px_6px_rgba(44,36,64,0.16)] ring-1 ring-[#E6E0F0] items-center justify-center"
            aria-label={t("storyNext")}
            data-testid="btn-story-row-next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </section>

      {active && (
        <div
          className="fixed inset-0 z-[80] bg-black flex flex-col"
          data-testid="story-viewer"
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${active.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(28px) brightness(0.45)",
              transform: "scale(1.1)",
            }}
          />
          <div
            className="relative z-10 flex items-center justify-between px-3 pt-3"
            style={{ paddingTop: "calc(12px + env(safe-area-inset-top, 0px))" }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <img src={active.avatar} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-white/70" />
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">{active.dogName}</p>
                <p className="text-white/70 text-[11px] truncate">{active.name} · {active.city} · {timeAgo(active.createdAt)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActive(null)}
              className="h-9 w-9 rounded-full bg-white/15 text-white flex items-center justify-center"
              aria-label={t("close")}
              data-testid="btn-close-story"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="relative z-10 flex-1 flex items-center justify-center px-2 md:px-11">
            {hasPrevStory && (
              <button
                type="button"
                onClick={() => goStory(-1)}
                className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 text-[#8E7CC3] shadow-[0_2px_10px_rgba(0,0,0,0.28)] items-center justify-center"
                aria-label={t("storyPrev")}
                data-testid="btn-story-viewer-prev"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <img
              src={active.image}
              alt={active.dogName}
              className="max-h-full max-w-full object-contain rounded-2xl"
            />
            {hasNextStory && (
              <button
                type="button"
                onClick={() => goStory(1)}
                className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 text-[#8E7CC3] shadow-[0_2px_10px_rgba(0,0,0,0.28)] items-center justify-center"
                aria-label={t("storyNext")}
                data-testid="btn-story-viewer-next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
          <div
            className="relative z-10 px-4 pb-4"
            style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}
          >
            {me?.username !== active.username && (
              <button
                type="button"
                onClick={() => void follow(active)}
                className="w-full h-11 rounded-full bg-white text-[#5B4B86] text-sm font-semibold"
                data-testid="btn-follow-story"
              >
                {active.isFollowing ? t("followingLong") : t("follow")}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
