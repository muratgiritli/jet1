import { useEffect, useState } from "react";
import { Link } from "wouter";
import SEO, { SITE_DOMAIN } from "@/components/SEO";
import { useSocialAuth } from "@/contexts/SocialAuthContext";
import { useQuery } from "@tanstack/react-query";
import { socialGet, socialSend } from "@/lib/social-api";
import { queryClient } from "@/lib/queryClient";
import type { PublicMember, ReportDto } from "@shared/social";
import { useCommunityI18n } from "@/lib/community-i18n";

type Tab = "users" | "posts" | "comments" | "topics" | "reports";

export default function CommunityAdminPage() {
  const { me, loading, isLoggedIn } = useSocialAuth();
  const { t, locale } = useCommunityI18n();

  useEffect(() => {
    const html = document.documentElement;
    const previous = html.lang;
    html.lang = locale;
    return () => {
      html.lang = previous || "tr";
    };
  }, [locale]);
  const [tab, setTab] = useState<Tab>("users");

  const overview = useQuery({
    queryKey: ["/api/social/admin/overview"],
    queryFn: () => socialGet<{ users: number; posts: number; comments: number; topics: number; reportsOpen: number }>("/api/social/admin/overview"),
    enabled: !!me?.isAdmin,
  });
  const users = useQuery({
    queryKey: ["/api/social/admin/users"],
    queryFn: () => socialGet<{ users: PublicMember[] }>("/api/social/admin/users"),
    enabled: !!me?.isAdmin && tab === "users",
  });
  const posts = useQuery({
    queryKey: ["/api/social/admin/posts"],
    queryFn: () => socialGet<{ posts: Array<{ id: string; author: string; caption: string; hidden: boolean; createdAt: string }> }>("/api/social/admin/posts"),
    enabled: !!me?.isAdmin && tab === "posts",
  });
  const comments = useQuery({
    queryKey: ["/api/social/admin/comments"],
    queryFn: () => socialGet<{ comments: Array<{ id: string; author: string; body: string; hidden: boolean; time: string; postId: string }> }>("/api/social/admin/comments"),
    enabled: !!me?.isAdmin && tab === "comments",
  });
  const topics = useQuery({
    queryKey: ["/api/social/admin/topics"],
    queryFn: () => socialGet<{ topics: Array<{ id: string; title: string; author: string; hidden: boolean; replies: number; time: string }> }>("/api/social/admin/topics"),
    enabled: !!me?.isAdmin && tab === "topics",
  });
  const reports = useQuery({
    queryKey: ["/api/social/admin/reports"],
    queryFn: () => socialGet<{ reports: ReportDto[] }>("/api/social/admin/reports"),
    enabled: !!me?.isAdmin && tab === "reports",
  });

  const refreshTab = () => {
    void queryClient.invalidateQueries({
      predicate: (query) => String(query.queryKey[0] || "").startsWith("/api/social/admin"),
    });
    void overview.refetch();
    void users.refetch();
    void posts.refetch();
    void comments.refetch();
    void topics.refetch();
    void reports.refetch();
  };

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-sm text-[#6B6573]">{t("loading")}</div>;
  }

  if (!isLoggedIn || !me?.isAdmin) {
    return (
      <div className="min-h-screen bg-white max-w-lg mx-auto px-4 py-10 text-center">
        <h1 className="text-lg font-extrabold">{t("adminPanel")}</h1>
        <p className="mt-2 text-sm text-[#6B6573]">{t("adminOnly")}</p>
        <Link href="/yp-giris?redirect=/yp-admin" className="mt-4 inline-flex h-10 px-4 items-center rounded-full bg-[#8E7CC3] text-white text-sm font-semibold">
          {t("adminLogin")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#1C1B1F] max-w-lg mx-auto" data-testid="admin-panel">
      <SEO title={t("seoTitleAdmin")} description={t("seoDescAdmin")} canonical={`${SITE_DOMAIN}/yp-admin`} />
      <header className="sticky top-0 z-40 bg-white/95 border-b border-[#EEEAF4] px-3 h-12 flex items-center justify-between">
        <h1 className="text-[15px] font-extrabold">{t("adminTitle")}</h1>
        <Link href="/" className="text-[12px] font-semibold text-[#8E7CC3]">{t("backToFeed")}</Link>
      </header>
      <div className="px-3 pt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label={t("statUsers")} value={overview.data?.users} />
        <Stat label={t("statPosts")} value={overview.data?.posts} />
        <Stat label={t("statReports")} value={overview.data?.reportsOpen} />
      </div>
      <div className="px-3 mt-4 flex gap-1 overflow-x-auto scrollbar-hide">
        {([
          ["users", t("tabUsers")],
          ["posts", t("tabPosts")],
          ["comments", t("tabComments")],
          ["topics", t("tabForum")],
          ["reports", t("tabReports")],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`h-8 px-3 rounded-full text-[12px] font-semibold shrink-0 ${
              tab === key ? "bg-[#8E7CC3] text-white" : "bg-[#F6F3FB] text-[#5B4B86]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="px-3 py-4 space-y-2 pb-10">
        {tab === "users" && (users.data?.users || []).map((user) => (
          <div key={user.id} className="rounded-2xl border border-[#F1EDF6] p-3 flex items-center gap-2">
            <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold truncate">{user.name} {user.isAdmin && <span className="text-[#8E7CC3]">· {t("roleAdmin")}</span>}</p>
              <p className="text-[11px] text-[#6B6573]">@{user.username} · {user.city} · {t("postsCount", { n: user.postCount })}</p>
            </div>
          </div>
        ))}

        {tab === "posts" && (posts.data?.posts || []).map((post) => (
          <ModRow
            key={post.id}
            title={post.author}
            body={post.caption}
            hidden={post.hidden}
            hideLabel={t("hide")}
            showLabel={t("show")}
            deleteLabel={t("delete")}
            hiddenLabel={t("hidden")}
            onHide={() => socialSend("POST", `/api/social/admin/posts/${post.id}/hide`, { hidden: !post.hidden }).then(refreshTab)}
            onDelete={() => socialSend("DELETE", `/api/social/admin/posts/${post.id}`).then(refreshTab)}
          />
        ))}

        {tab === "comments" && (comments.data?.comments || []).map((comment) => (
          <ModRow
            key={comment.id}
            title={comment.author}
            body={comment.body}
            hidden={comment.hidden}
            hideLabel={t("hide")}
            showLabel={t("show")}
            deleteLabel={t("delete")}
            hiddenLabel={t("hidden")}
            onHide={() => socialSend("POST", `/api/social/admin/comments/${comment.id}/hide`, { hidden: !comment.hidden }).then(refreshTab)}
            onDelete={() => socialSend("DELETE", `/api/social/admin/comments/${comment.id}`).then(refreshTab)}
          />
        ))}

        {tab === "topics" && (topics.data?.topics || []).map((topic) => (
          <ModRow
            key={topic.id}
            title={topic.author}
            body={topic.title}
            hidden={topic.hidden}
            hideLabel={t("hide")}
            showLabel={t("show")}
            deleteLabel={t("delete")}
            hiddenLabel={t("hidden")}
            onHide={() => socialSend("POST", `/api/social/admin/topics/${topic.id}/hide`, { hidden: !topic.hidden }).then(refreshTab)}
            onDelete={() => socialSend("DELETE", `/api/social/admin/topics/${topic.id}`).then(refreshTab)}
          />
        ))}

        {tab === "reports" && (reports.data?.reports || []).map((report) => (
          <div key={report.id} className="rounded-2xl border border-[#E4DCF3] p-3">
            <p className="text-[12px] font-semibold">{report.reporterName} · {report.targetType} · {report.status === "open" ? t("open") : t("resolved")}</p>
            <p className="text-[13px] mt-1">{report.reason}</p>
            {report.preview && <p className="text-[12px] text-[#6B6573] mt-1 line-clamp-2">{report.preview}</p>}
            {report.status === "open" && (
              <button
                type="button"
                onClick={() => void socialSend("POST", `/api/social/admin/reports/${report.id}/resolve`, { status: "resolved" }).then(refreshTab)}
                className="mt-2 h-8 px-3 rounded-full bg-[#8E7CC3] text-white text-[12px] font-semibold"
              >
                {t("markResolved")}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-2xl bg-[#FAF8FD] py-3">
      <p className="text-lg font-extrabold text-[#8E7CC3]">{value ?? "—"}</p>
      <p className="text-[11px] text-[#6B6573]">{label}</p>
    </div>
  );
}

function ModRow({
  title,
  body,
  hidden,
  hideLabel,
  showLabel,
  deleteLabel,
  hiddenLabel,
  onHide,
  onDelete,
}: {
  title: string;
  body: string;
  hidden: boolean;
  hideLabel: string;
  showLabel: string;
  deleteLabel: string;
  hiddenLabel: string;
  onHide: () => Promise<unknown>;
  onDelete: () => Promise<unknown>;
}) {
  return (
    <div className="rounded-2xl border border-[#F1EDF6] p-3">
      <p className="text-[12px] font-semibold">{title} {hidden && <span className="text-[#8E7CC3]">· {hiddenLabel}</span>}</p>
      <p className="text-[13px] text-[#2B2833] mt-1 line-clamp-3">{body}</p>
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={() => void onHide()} className="h-8 px-3 rounded-full bg-[#F6F3FB] text-[#5B4B86] text-[12px] font-semibold">
          {hidden ? showLabel : hideLabel}
        </button>
        <button type="button" onClick={() => void onDelete()} className="h-8 px-3 rounded-full text-[12px] font-semibold text-red-600">
          {deleteLabel}
        </button>
      </div>
    </div>
  );
}
