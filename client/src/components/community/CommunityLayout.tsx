import type { ReactNode } from "react";
import TopBar from "@/components/community/TopBar";
import BottomNavigation from "@/components/community/BottomNavigation";

export default function CommunityLayout({
  children,
  hideTopBar = false,
}: {
  children: ReactNode;
  hideTopBar?: boolean;
}) {
  return (
    <div className="min-h-screen bg-white text-[#1C1B1F] max-w-lg mx-auto">
      {!hideTopBar && <TopBar />}
      <div
        style={{
            paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {children}
      </div>
      <BottomNavigation />
    </div>
  );
}
