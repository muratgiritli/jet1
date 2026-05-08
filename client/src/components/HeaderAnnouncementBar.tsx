import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Megaphone } from "lucide-react";

interface Announcement {
  id: number;
  message: string;
  linkUrl?: string | null;
  linkLabel?: string | null;
  sortOrder?: number;
}

export default function HeaderAnnouncementBar() {
  const { data = [] } = useQuery<Announcement[]>({
    queryKey: ["/api/header-announcements"],
    staleTime: 60_000,
  });
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (data.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % data.length), 5000);
    return () => clearInterval(t);
  }, [data.length]);

  if (!data || data.length === 0) return null;
  const cur = data[idx % data.length];
  if (!cur) return null;

  const safeUrl = (() => {
    const u = cur.linkUrl?.trim();
    if (!u) return null;
    if (u.startsWith("/") && !u.startsWith("//")) return u;
    if (/^https?:\/\//i.test(u)) return u;
    return null;
  })();

  const inner = (
    <div className="flex items-center justify-center gap-2 px-3 py-2 text-center" data-testid={`header-announcement-${cur.id}`}>
      <Megaphone className="w-3.5 h-3.5 shrink-0" />
      <span className="text-xs sm:text-sm font-semibold leading-tight">
        {cur.message}
      </span>
      {cur.linkLabel && cur.linkUrl && (
        <span className="ml-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold underline-offset-2 underline">
          {cur.linkLabel}
        </span>
      )}
    </div>
  );

  return (
    <div className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white shadow-md" data-testid="bar-header-announcement">
      {safeUrl ? (
        <a
          href={safeUrl}
          target={/^https?:\/\//.test(safeUrl) ? "_blank" : undefined}
          rel={/^https?:\/\//.test(safeUrl) ? "noopener noreferrer" : undefined}
          className="block hover:bg-black/10 transition-colors"
          data-testid={`link-header-announcement-${cur.id}`}
        >
          {inner}
        </a>
      ) : (
        inner
      )}
    </div>
  );
}
