export const SOCIAL_PHOTOS = [
  "/assets/poodle-portrait.jpg",
  "/assets/poodle-face.jpg",
  "/assets/golden-puppy.jpg",
  "/assets/golden-face.jpg",
  "/assets/golden-head.jpg",
  "/assets/golden-hero.jpg",
  "/assets/pomeranian-face.jpg",
  "/assets/cocker-face.jpg",
  "/assets/pug-face.jpg",
  "/assets/terrier-face.jpg",
] as const;

export const DEMO_PASSWORD = "poodle123";
export const ADMIN_USERNAME = "admin";
export const ADMIN_PASSWORD = "YourPoodle1!";

export type SocialLocale = "tr" | "en";

export const RESERVED_PROFILE_SLUGS = new Set([
  "forum",
  "kulupler",
  "profil",
  "ara",
  "giris",
  "yp-giris",
  "yp-admin",
  "bildirimler",
  "gonderi",
  "uye",
  "petshop",
  "admin",
  "api",
  "assets",
  "kategori",
  "urun",
  "odeme",
  "hesabim",
  "blog",
  "demo",
  "kampanya",
  "sss",
  "kvkk",
  "gizlilik",
  "iletisim",
  "hakkimizda",
  "magaza",
  "abone",
  "favoriler",
  "yarisma",
  "siparis-takip",
  "sokak-canlari",
  "ozel-patiler",
  "kayip-ilan",
  "pati-blog",
  "teslimat-iade",
  "kullanim-kosullari",
  "cerez-politikasi",
  "islem-rehberi",
  "gizlilik-sozlesmesi",
  "mesafeli-satis",
]);

export function slugifyDogName(name: string): string {
  const mapped = name
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return mapped || "poodle";
}

export function uniqueDogSlug(dogName: string, taken: Iterable<string>, reserved = RESERVED_PROFILE_SLUGS): string {
  const used = new Set([...taken, ...reserved]);
  const base = slugifyDogName(dogName);
  if (!used.has(base)) return base;
  let n = 2;
  while (used.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export function profilePath(member: { dogSlug?: string; username: string }): string {
  return member.dogSlug ? `/${member.dogSlug}` : `/uye/${member.username}`;
}

export type PublicMember = {
  id: string;
  username: string;
  name: string;
  city: string;
  dogName: string;
  dogSlug: string;
  locale: SocialLocale;
  avatar: string;
  bio: string;
  isAdmin: boolean;
  createdAt: string;
  followers: number;
  following: number;
  postCount: number;
  isFollowing?: boolean;
};

export type FeedPostDto = {
  id: string;
  authorId: string;
  username: string;
  author: string;
  dogSlug: string;
  dogName: string;
  city: string;
  time: string;
  createdAt: string;
  image: string;
  avatar: string;
  likes: number;
  comments: number;
  caption: string;
  liked: boolean;
  saved: boolean;
  isFollowing: boolean;
};

export type StoryDto = {
  id: string;
  authorId: string;
  username: string;
  name: string;
  dogSlug: string;
  dogName: string;
  city: string;
  avatar: string;
  image: string;
  time: string;
  createdAt: string;
  isFollowing: boolean;
};

export type CommentDto = {
  id: string;
  authorId: string;
  username: string;
  dogSlug: string;
  author: string;
  city: string;
  avatar: string;
  body: string;
  time: string;
  createdAt: string;
};

export type ForumReplyDto = {
  id: string;
  authorId: string;
  username: string;
  dogSlug: string;
  author: string;
  city: string;
  avatar: string;
  body: string;
  time: string;
  createdAt: string;
};

export type ForumTopicDto = {
  id: string;
  authorId: string;
  username: string;
  dogSlug: string;
  title: string;
  author: string;
  city: string;
  avatar: string;
  time: string;
  createdAt: string;
  replies: number;
  views: number;
  excerpt: string;
  tag: string;
  body: string;
  comments: ForumReplyDto[];
};

export type ClubDto = {
  id: string;
  name: string;
  city: string;
  members: number;
  cover: string;
  description: string;
  joined: boolean;
};

export type NotificationDto = {
  id: string;
  kind: string;
  actorName: string;
  text: string;
  href: string;
  read: boolean;
  time: string;
  createdAt: string;
};

export type ReportDto = {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  createdAt: string;
  preview: string;
};

export function formatTimeAgo(iso: string, now = Date.now(), locale: SocialLocale = "tr"): string {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now - then);
  const min = Math.floor(diff / 60000);
  if (locale === "en") {
    if (min < 1) return "just now";
    if (min < 60) return `${min} min ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day === 1) return "1 day ago";
    if (day < 7) return `${day} days ago`;
    return new Date(iso).toLocaleDateString("en-US");
  }
  if (min < 1) return "az önce";
  if (min < 60) return `${min} dk önce`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} sa önce`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "1 gün önce";
  if (day < 7) return `${day} gün önce`;
  return new Date(iso).toLocaleDateString("tr-TR");
}
