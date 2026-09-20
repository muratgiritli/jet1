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

export type PublicMember = {
  id: string;
  username: string;
  name: string;
  city: string;
  dogName: string;
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
  dogName: string;
  city: string;
  avatar: string;
  image: string;
  time: string;
  isFollowing: boolean;
};

export type CommentDto = {
  id: string;
  authorId: string;
  username: string;
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

export function formatTimeAgo(iso: string, now = Date.now()): string {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now - then);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "az önce";
  if (min < 60) return `${min} dk önce`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} sa önce`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "1 gün önce";
  if (day < 7) return `${day} gün önce`;
  return new Date(iso).toLocaleDateString("tr-TR");
}
