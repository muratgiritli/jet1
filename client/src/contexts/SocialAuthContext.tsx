import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { PublicMember, SocialLocale } from "@shared/social";
import { socialGet, socialSend } from "@/lib/social-api";
import { queryClient } from "@/lib/queryClient";

type MeResponse = { member: PublicMember | null; unread: number };

type SocialAuthValue = {
  me: PublicMember | null;
  unread: number;
  loading: boolean;
  isLoggedIn: boolean;
  profileSlugs: string[];
  slugsReady: boolean;
  refresh: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  register: (input: {
    username: string;
    email: string;
    password: string;
    name: string;
    city: string;
    dogName: string;
    locale: SocialLocale;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

const SocialAuthContext = createContext<SocialAuthValue | null>(null);

export function useSocialAuth() {
  const ctx = useContext(SocialAuthContext);
  if (!ctx) throw new Error("useSocialAuth must be used within SocialAuthProvider");
  return ctx;
}

export function SocialAuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<PublicMember | null>(null);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profileSlugs, setProfileSlugs] = useState<string[]>([]);
  const [slugsReady, setSlugsReady] = useState(false);

  const refreshSlugs = useCallback(async () => {
    try {
      const data = await socialGet<{ slugs: string[] }>("/api/social/slugs");
      setProfileSlugs((data.slugs || []).map((s) => s.toLowerCase()));
    } catch {
      setProfileSlugs([]);
    } finally {
      setSlugsReady(true);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await socialGet<MeResponse>("/api/social/me");
      setMe(data.member);
      setUnread(data.unread || 0);
    } catch {
      setMe(null);
      setUnread(0);
    } finally {
      setLoading(false);
    }
    await refreshSlugs();
  }, [refreshSlugs]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (username: string, password: string) => {
    const data = await socialSend<{ member: PublicMember }>("POST", "/api/social/login", { username, password });
    setMe(data.member);
    await queryClient.invalidateQueries();
    await refresh();
  }, [refresh]);

  const register = useCallback(async (input: {
    username: string;
    email: string;
    password: string;
    name: string;
    city: string;
    dogName: string;
    locale: SocialLocale;
  }) => {
    const data = await socialSend<{ member: PublicMember }>("POST", "/api/social/register", input);
    setMe(data.member);
    await queryClient.invalidateQueries();
    await refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await socialSend("POST", "/api/social/logout");
    setMe(null);
    setUnread(0);
    await queryClient.invalidateQueries();
  }, []);

  return (
    <SocialAuthContext.Provider
      value={{
        me,
        unread,
        loading,
        isLoggedIn: !!me,
        profileSlugs,
        slugsReady,
        refresh,
        login,
        register,
        logout,
      }}
    >
      {children}
    </SocialAuthContext.Provider>
  );
}
