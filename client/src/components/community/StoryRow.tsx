import { useState } from "react";
import { X } from "lucide-react";
import type { StoryDto } from "@shared/social";
import { useAuthPrompt } from "@/components/community/AuthPrompt";
import { socialSend } from "@/lib/social-api";
import { queryClient } from "@/lib/queryClient";
import { useSocialAuth } from "@/contexts/SocialAuthContext";

export default function StoryRow({ stories }: { stories: StoryDto[] }) {
  const [active, setActive] = useState<StoryDto | null>(null);
  const { requireAuth } = useAuthPrompt();
  const { me } = useSocialAuth();

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
        className="bg-white border-b border-[#F1EDF6]"
        data-testid="story-row"
      >
        <div className="flex gap-3 overflow-x-auto px-3 py-3 scrollbar-hide">
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
                    alt={`${story.dogName} hikâyesi`}
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
                <p className="text-white/70 text-[11px] truncate">{active.name} · {active.city} · {active.time}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActive(null)}
              className="h-9 w-9 rounded-full bg-white/15 text-white flex items-center justify-center"
              aria-label="Kapat"
              data-testid="btn-close-story"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="relative z-10 flex-1 flex items-center justify-center px-2">
            <img
              src={active.image}
              alt={active.dogName}
              className="max-h-full max-w-full object-contain rounded-2xl"
            />
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
                {active.isFollowing ? "Takip ediliyor" : "Takip et"}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
