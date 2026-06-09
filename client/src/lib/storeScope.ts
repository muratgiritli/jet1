import { STORES } from "@shared/stores";

// Paylaşılan ("Tüm Siteler" / "all") içeriği yanlışlıkla düzenlemeye karşı koruma.
// Belirli bir mağaza seçiliyken (Tümü değil) "all" kapsamındaki bir satır
// tüm sitelerde ortaktır; bu satırı düzenlemek/silmek her domaini etkiler.
export function isSharedRowInStoreView(rowStore: string | null | undefined, adminStore: string): boolean {
  return adminStore !== "all" && (rowStore ?? "all") === "all";
}

// Paylaşılan bir satır belirli mağaza görünümünde düzenlenmek istenirse açık onay ister.
// Onay verilirse (veya satır paylaşılan değilse) true döner.
export function confirmSharedEdit(rowStore: string | null | undefined, adminStore: string): boolean {
  if (!isSharedRowInStoreView(rowStore, adminStore)) return true;
  const storeName = STORES.find(s => s.id === adminStore)?.name || adminStore;
  return confirm(
    `⚠️ Bu içerik TÜM SİTELERDE ortaktır ("Tüm Siteler").\n\n` +
    `Şu an "${storeName}" görünümündesiniz, ancak bu değişiklik BÜTÜN sitelerde geçerli olacak.\n\n` +
    `Yine de devam etmek istiyor musunuz?`
  );
}

// Defense-in-depth: PATCH/DELETE isteklerine seçili mağaza bağlamını ekler.
// Sunucu, satır başka bir spesifik mağazaya aitse bu bağlamla işlemi reddeder.
// "all" görünümünde bağlam gönderilmez (kısıtlama yok). store satırına yazılmaz.
export function storeCtxParam(adminStore: string): string {
  return adminStore && adminStore !== "all" ? `?storeContext=${encodeURIComponent(adminStore)}` : "";
}

// Store-scoped app_settings anahtarları (sunucudaki STORE_SCOPED_SETTING_KEYS ile
// aynı tutulmalı). Bu anahtarlar belirli bir mağaza görünümünde önekli (mağazaya
// özel) yazılır; listede OLMAYAN tüm ayarlar temel (öneksiz) anahtara yazılır ve
// TÜM SİTELER için ortaktır.
export const STORE_SCOPED_SETTING_KEYS = new Set<string>([
  "sms_msgheader",
  "campaign_hero_title", "campaign_hero_subtitle", "campaign_end_date",
  "daily_cargo_widget_enabled",
  "sokak_banner_enabled", "veteriner_banner_enabled",
  "sokak_banner_image", "sokak_banner_link", "veteriner_banner_image", "veteriner_banner_link",
  "top_banner_enabled", "top_banner_text", "top_banner_link", "top_banner_bg", "top_banner_color",
  "breed_banners", "category_banners",
  "cargo_fee", "cargo_free_limit", "cargo_min_order",
]);

// Belirli bir mağaza görünümündeyken ORTAK (mağazaya özel olmayan) ayarların
// kaydedilmek üzere değiştirilmesi BÜTÜN siteleri etkiler. Yalnızca gerçekten
// değişen ortak anahtarlar için açık onay ister; sadece mağazaya özel anahtarlar
// değiştiyse (ör. kampanya başlığı) uyarmaz. "all" görünümünde uyarı yoktur.
export function confirmSharedSettingsSave(
  current: Record<string, string>,
  baseline: Record<string, string>,
  adminStore: string,
): boolean {
  if (!adminStore || adminStore === "all") return true;
  const changedShared = Object.keys(current).filter(
    (k) => !STORE_SCOPED_SETTING_KEYS.has(k) && (current[k] ?? "") !== (baseline[k] ?? ""),
  );
  if (changedShared.length === 0) return true;
  const storeName = STORES.find((s) => s.id === adminStore)?.name || adminStore;
  return confirm(
    `⚠️ Değiştirdiğiniz ayarlar TÜM SİTELERDE ortaktır.\n\n` +
    `Şu an "${storeName}" görünümündesiniz, ancak bu ayarlar (ödeme, banka, sadakat/puan, besleme vb.) BÜTÜN sitelerde geçerli olacak.\n\n` +
    `Yine de devam etmek istiyor musunuz?`
  );
}
