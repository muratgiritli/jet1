import { useState } from "react";
import { Link } from "wouter";
import { ChevronRight, MessagesSquare, Plus } from "lucide-react";
import SEO, { SITE_DOMAIN } from "@/components/SEO";
import CommunityLayout from "@/components/community/CommunityLayout";
import { useQuery } from "@tanstack/react-query";
import { categoryDescription, categoryLabel, type ForumCategoryDto } from "@shared/social";
import { socialGet, socialSend } from "@/lib/social-api";
import { queryClient } from "@/lib/queryClient";
import { useCommunityI18n } from "@/lib/community-i18n";
import { useSocialAuth } from "@/contexts/SocialAuthContext";

export default function CommunityForumPage() {
  const { t, locale, timeAgo } = useCommunityI18n();
  const { me } = useSocialAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nameTr: "", nameEn: "", descriptionTr: "", descriptionEn: "" });
  const [error, setError] = useState("");
  const { data } = useQuery({
    queryKey: ["/api/social/forum"],
    queryFn: () => socialGet<{ categories: ForumCategoryDto[] }>("/api/social/forum"),
    staleTime: 10_000,
  });

  const createHeading = async () => {
    setError("");
    try {
      await socialSend("POST", "/api/social/admin/categories", form);
      setForm({ nameTr: "", nameEn: "", descriptionTr: "", descriptionEn: "" });
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["/api/social/forum"] });
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t("topicFailed"));
    }
  };

  return (
    <CommunityLayout>
      <SEO
        title={t("seoTitleForum")}
        description={t("seoDescForum")}
        canonical={`${SITE_DOMAIN}/forum`}
      />
      <div className="px-3 pt-4 pb-2 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold text-[#1C1B1F]" data-testid="text-forum-title">{t("forumTitle")}</h1>
          <p className="text-[13px] text-[#6B6573] mt-1">{t("forumLead")}</p>
        </div>
        {me?.isAdmin && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="h-9 px-3 rounded-full bg-[#8E7CC3] text-white text-[12px] font-semibold shrink-0 inline-flex items-center gap-1"
            data-testid="btn-new-category"
          >
            <Plus className="w-3.5 h-3.5" />
            {t("newCategory")}
          </button>
        )}
      </div>
      {open && me?.isAdmin && (
        <div className="mx-3 mb-3 rounded-2xl border border-[#E4DCF3] bg-[#FAF8FD] p-3 space-y-2" data-testid="form-new-category">
          <input value={form.nameTr} onChange={(e) => setForm((f) => ({ ...f, nameTr: e.target.value }))} placeholder={t("categoryNameTr")} className="w-full h-10 rounded-xl border border-[#E4DCF3] bg-white px-3 text-sm" />
          <input value={form.nameEn} onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))} placeholder={t("categoryNameEn")} className="w-full h-10 rounded-xl border border-[#E4DCF3] bg-white px-3 text-sm" />
          <input value={form.descriptionTr} onChange={(e) => setForm((f) => ({ ...f, descriptionTr: e.target.value }))} placeholder={t("categoryDescTr")} className="w-full h-10 rounded-xl border border-[#E4DCF3] bg-white px-3 text-sm" />
          <input value={form.descriptionEn} onChange={(e) => setForm((f) => ({ ...f, descriptionEn: e.target.value }))} placeholder={t("categoryDescEn")} className="w-full h-10 rounded-xl border border-[#E4DCF3] bg-white px-3 text-sm" />
          {error && <p className="text-[12px] text-red-600">{error}</p>}
          <button type="button" onClick={() => void createHeading()} className="h-10 w-full rounded-full bg-[#8E7CC3] text-white text-sm font-semibold">
            {t("newCategory")}
          </button>
        </div>
      )}
      <p className="px-3 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wide text-[#8E7CC3]">{t("forumCategories")}</p>
      <ul className="px-3 space-y-2.5" data-testid="forum-category-list">
        {(data?.categories || []).map((category) => (
          <li key={category.id}>
            <Link
              href={`/forum/${category.slug}`}
              className="block rounded-2xl border border-[#E4DCF3] bg-white p-3.5"
              data-testid={`forum-category-${category.slug}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#6A5A96]">
                  <MessagesSquare className="w-3 h-3" />
                  {categoryLabel(locale, category)}
                </span>
                {category.hidden && <span className="text-[10px] text-[#8E7CC3]">{t("hidden")}</span>}
              </div>
              <p className="text-[13px] text-[#5F5B66]">{categoryDescription(locale, category)}</p>
              <div className="mt-2 flex items-center text-[11px] text-[#6B6573]">
                <span>{t("topicsCount", { n: category.topicCount })}</span>
                {category.lastActivity && (
                  <span className="ml-2">{t("lastActivity")} · {timeAgo(category.lastActivity)}</span>
                )}
                <ChevronRight className="w-4 h-4 ml-auto text-[#8E7CC3]" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </CommunityLayout>
  );
}
