import { useState } from "react";
import SEO, { SITE_DOMAIN } from "@/components/SEO";
import CommunityLayout from "@/components/community/CommunityLayout";
import { CLUBS } from "@/lib/community-feed";
import { useAuthPrompt } from "@/components/community/AuthPrompt";

export default function CommunityClubsPage() {
  const { requireAuth } = useAuthPrompt();
  const [joined, setJoined] = useState<Record<string, boolean>>({});

  return (
    <CommunityLayout>
      <SEO
        title="Kulüpler — YourPoodle"
        description="Şehir bazlı poodle kulüpleri ve yürüyüş grupları."
        canonical={`${SITE_DOMAIN}/kulupler`}
      />
      <div className="px-3 pt-4 pb-2">
        <h1 className="text-lg font-extrabold text-[#1C1B1F]" data-testid="text-clubs-title">Kulüpler</h1>
        <p className="text-[13px] text-[#6B6573] mt-1">Şehrindeki poodle sahipleriyle tanış ve yürüyüşlere katıl.</p>
      </div>
      <ul className="px-3 space-y-3">
        {CLUBS.map((club) => (
          <li
            key={club.id}
            className="rounded-2xl overflow-hidden border border-[#E4DCF3] bg-white"
            data-testid={`club-card-${club.id}`}
          >
            <img src={club.cover} alt="" className="w-full h-28 object-cover" />
            <div className="p-3.5">
              <h2 className="text-[15px] font-bold text-[#1C1B1F]">{club.name}</h2>
              <p className="text-[12px] text-[#6B6573] mt-0.5">
                {club.city} · {club.members} üye
              </p>
              <p className="mt-1.5 text-[13px] text-[#2B2833] leading-relaxed">{club.description}</p>
              <button
                type="button"
                onClick={() => {
                  if (requireAuth()) setJoined((prev) => ({ ...prev, [club.id]: !prev[club.id] }));
                }}
                className={`mt-3 h-9 px-4 rounded-full text-sm font-semibold ${
                  joined[club.id]
                    ? "bg-[#F6F3FB] text-[#5B4B86] border border-[#D9D0EC]"
                    : "bg-[#8E7CC3] text-white"
                }`}
                data-testid={`btn-join-club-${club.id}`}
              >
                {joined[club.id] ? "Üyesin" : "Katıl"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </CommunityLayout>
  );
}
