import { useEffect, type ReactNode } from "react";
import TopBar from "@/components/community/TopBar";
import BottomNavigation from "@/components/community/BottomNavigation";
import { useCommunityI18n } from "@/lib/community-i18n";

export default function CommunityLayout({
  children,
  hideTopBar = false,
}: {
  children: ReactNode;
  hideTopBar?: boolean;
}) {
  const { locale } = useCommunityI18n();

  useEffect(() => {
    const html = document.documentElement;
    const previous = html.lang;
    html.lang = locale;
    return () => {
      html.lang = previous || "tr";
    };
  }, [locale]);

  return (
    <div lang={locale} className="min-h-screen bg-white text-[#1C1B1F] max-w-lg mx-auto">
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
