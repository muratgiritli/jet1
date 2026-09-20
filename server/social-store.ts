import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
  DEMO_PASSWORD,
  SOCIAL_PHOTOS,
  formatTimeAgo,
  uniqueDogSlug,
  slugifyDogName,
  forumTopicPath,
  type ClubDto,
  type CommentDto,
  type FeedPostDto,
  type ForumCategoryDto,
  type ForumTopicDto,
  type NotificationDto,
  type PublicMember,
  type ReportDto,
  type SocialLocale,
  type StoryDto,
} from "@shared/social";

export type SocialMember = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  name: string;
  city: string;
  dogName: string;
  dogSlug: string;
  locale: SocialLocale;
  avatar: string;
  bio: string;
  isAdmin: boolean;
  createdAt: string;
};

export type SocialPost = {
  id: string;
  authorId: string;
  image: string;
  caption: string;
  hidden: boolean;
  createdAt: string;
};

export type SocialStory = {
  id: string;
  authorId: string;
  image: string;
  createdAt: string;
};

export type SocialComment = {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  hidden: boolean;
  createdAt: string;
};

export type SocialLike = { id: string; postId: string; memberId: string };
export type SocialSave = { id: string; postId: string; memberId: string };
export type SocialFollow = { id: string; followerId: string; followingId: string };

export type SocialForumCategory = {
  id: string;
  slug: string;
  nameTr: string;
  nameEn: string;
  descriptionTr: string;
  descriptionEn: string;
  hidden: boolean;
  sort: number;
};

export type SocialTopic = {
  id: string;
  authorId: string;
  categoryId: string;
  title: string;
  body: string;
  tag: string;
  hidden: boolean;
  views: number;
  createdAt: string;
};

export type SocialReply = {
  id: string;
  topicId: string;
  authorId: string;
  body: string;
  hidden: boolean;
  createdAt: string;
};

export type SocialClub = {
  id: string;
  name: string;
  city: string;
  cover: string;
  description: string;
};

export type SocialClubMember = { id: string; clubId: string; memberId: string };

export type SocialNotification = {
  id: string;
  memberId: string;
  kind: string;
  actorName: string;
  text: string;
  href: string;
  read: boolean;
  createdAt: string;
};

export type SocialReport = {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  createdAt: string;
};

export type SocialSession = {
  token: string;
  memberId: string;
  expiresAt: number;
};

type SocialDb = {
  members: SocialMember[];
  posts: SocialPost[];
  stories: SocialStory[];
  comments: SocialComment[];
  likes: SocialLike[];
  saves: SocialSave[];
  follows: SocialFollow[];
  categories: SocialForumCategory[];
  topics: SocialTopic[];
  replies: SocialReply[];
  clubs: SocialClub[];
  clubMembers: SocialClubMember[];
  notifications: SocialNotification[];
  reports: SocialReport[];
  sessions: SocialSession[];
};

const DATA_PATH = path.resolve(process.cwd(), "data", "yourpoodle.json");
const SESSION_MS = 14 * 24 * 60 * 60 * 1000;

function nid(): string {
  return crypto.randomUUID();
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3600_000).toISOString();
}

function finalizeMembers(
  raw: Array<Omit<SocialMember, "dogSlug" | "locale"> & Partial<Pick<SocialMember, "dogSlug" | "locale">>>,
): SocialMember[] {
  const taken: string[] = [];
  return raw.map((member) => {
    const locale: SocialLocale = member.locale === "en" ? "en" : "tr";
    const dogSlug = member.dogSlug || uniqueDogSlug(member.dogName || member.username, taken);
    taken.push(dogSlug);
    return { ...member, locale, dogSlug };
  });
}

function defaultCategories(): SocialForumCategory[] {
  return [
    {
      id: "fc-bakim",
      slug: "bakim",
      nameTr: "Bakım",
      nameEn: "Grooming",
      descriptionTr: "Tüy, tarak, kuaför ve ev bakımı.",
      descriptionEn: "Coat, brush, groomer, and home care.",
      hidden: false,
      sort: 1,
    },
    {
      id: "fc-saglik",
      slug: "saglik",
      nameTr: "Sağlık",
      nameEn: "Health",
      descriptionTr: "Aşı, veteriner ve yavru sağlığı.",
      descriptionEn: "Vaccines, vets, and puppy health.",
      hidden: false,
      sort: 2,
    },
    {
      id: "fc-geziler",
      slug: "geziler",
      nameTr: "Geziler",
      nameEn: "Walks",
      descriptionTr: "Park yürüyüşleri ve gezi planları.",
      descriptionEn: "Park walks and outing plans.",
      hidden: false,
      sort: 3,
    },
    {
      id: "fc-sahiplenme",
      slug: "sahiplenme",
      nameTr: "Sahiplenme",
      nameEn: "Adoption",
      descriptionTr: "Sahiplenme ve yeni poodle sahipleri.",
      descriptionEn: "Adoption and new poodle owners.",
      hidden: false,
      sort: 4,
    },
  ];
}

function categoryIdForTag(tag: string, categories: SocialForumCategory[]): string {
  const map: Record<string, string> = {
    Bakım: "fc-bakim",
    Sağlık: "fc-saglik",
    Kulüp: "fc-geziler",
    Sohbet: "fc-geziler",
    Sahiplenme: "fc-sahiplenme",
    Grooming: "fc-bakim",
    Health: "fc-saglik",
    Walks: "fc-geziler",
    Adoption: "fc-sahiplenme",
  };
  const id = map[tag];
  if (id && categories.some((c) => c.id === id)) return id;
  return categories[0]?.id || "fc-bakim";
}

function migrateDb(state: SocialDb) {
  const taken: string[] = [];
  for (const member of state.members) {
    if (member.locale !== "en") member.locale = "tr";
    if (!member.dogSlug) {
      member.dogSlug = uniqueDogSlug(member.dogName || member.username, taken);
    }
    taken.push(member.dogSlug);
  }
  if (!state.categories?.length) {
    state.categories = defaultCategories();
  }
  for (const topic of state.topics) {
    if (!topic.categoryId) {
      topic.categoryId = categoryIdForTag(topic.tag, state.categories);
    }
  }
  for (const note of state.notifications) {
    if (!note.actorName) {
      note.actorName = note.text.split(" ")[0] ? note.text.replace(/ (seni|gönderine|gönderini|forum).*$/, "").trim() : "";
    }
    if (note.href.startsWith("/uye/")) {
      const username = note.href.slice("/uye/".length);
      const target = state.members.find((m) => m.username === username);
      if (target?.dogSlug) note.href = `/${target.dogSlug}`;
    }
    if (/^\/forum\/[^/]+$/.test(note.href)) {
      const topicId = note.href.slice("/forum/".length);
      const topic = state.topics.find((t) => t.id === topicId);
      const category = state.categories.find((c) => c.id === topic?.categoryId);
      if (topic && category) note.href = `/forum/${category.slug}/${topic.id}`;
    }
  }
}

function buildSeed(): SocialDb {
  const demoHash = bcrypt.hashSync(DEMO_PASSWORD, 8);
  const adminHash = bcrypt.hashSync(ADMIN_PASSWORD, 8);

  const members = finalizeMembers([
    {
      id: "m-admin",
      username: ADMIN_USERNAME,
      email: "admin@yourpoodle.local",
      passwordHash: adminHash,
      name: "YourPoodle Yönetim",
      city: "İstanbul",
      dogName: "Lulu",
      avatar: SOCIAL_PHOTOS[1],
      bio: "YourPoodle topluluk yönetimi. Raporları ve içerikleri buradan inceliyoruz.",
      isAdmin: true,
      createdAt: hoursAgo(40 * 24),
    },
    {
      id: "m-elif",
      username: "elif",
      email: "elif@yourpoodle.local",
      passwordHash: demoHash,
      name: "Elif Kaya",
      city: "İstanbul",
      dogName: "Pamuk",
      avatar: SOCIAL_PHOTOS[1],
      bio: "Kadıköy'de toy poodle sahibi. Tüy bakımı ve park yürüyüşleri.",
      isAdmin: false,
      createdAt: hoursAgo(20 * 24),
    },
    {
      id: "m-deniz",
      username: "deniz",
      email: "deniz@yourpoodle.local",
      passwordHash: demoHash,
      name: "Deniz Aksoy",
      city: "İzmir",
      dogName: "Leo",
      avatar: SOCIAL_PHOTOS[3],
      bio: "Alsancak'ta yavru poodle büyütüyorum.",
      isAdmin: false,
      createdAt: hoursAgo(18 * 24),
    },
    {
      id: "m-ayse",
      username: "ayse",
      email: "ayse@yourpoodle.local",
      passwordHash: demoHash,
      name: "Ayşe Tekin",
      city: "Ankara",
      dogName: "Muffin",
      avatar: SOCIAL_PHOTOS[6],
      bio: "Çankaya'da poodle arkadaşları arıyoruz.",
      isAdmin: false,
      createdAt: hoursAgo(16 * 24),
    },
    {
      id: "m-burak",
      username: "burak",
      email: "burak@yourpoodle.local",
      passwordHash: demoHash,
      name: "Burak Yılmaz",
      city: "Bursa",
      dogName: "Tarçın",
      avatar: SOCIAL_PHOTOS[7],
      bio: "Kulak bakımı ve ev eğitimi üzerine notlar paylaşıyorum.",
      isAdmin: false,
      createdAt: hoursAgo(14 * 24),
    },
    {
      id: "m-selin",
      username: "selin",
      email: "selin@yourpoodle.local",
      passwordHash: demoHash,
      name: "Selin Mutlu",
      city: "Antalya",
      dogName: "Coco",
      avatar: SOCIAL_PHOTOS[8],
      bio: "Sıcakta kısa yürüyüş, evde serin oyun.",
      isAdmin: false,
      createdAt: hoursAgo(12 * 24),
    },
    {
      id: "m-mert",
      username: "mert",
      email: "mert@yourpoodle.local",
      passwordHash: demoHash,
      name: "Mert Şahin",
      city: "Eskişehir",
      dogName: "Mini",
      avatar: SOCIAL_PHOTOS[9],
      bio: "İlk tırnak kesimi ve ödül maması deneyimleri.",
      isAdmin: false,
      createdAt: hoursAgo(10 * 24),
    },
    {
      id: "m-ceren",
      username: "ceren",
      email: "ceren@yourpoodle.local",
      passwordHash: demoHash,
      name: "Ceren Demir",
      city: "Kadıköy",
      dogName: "Lila",
      avatar: SOCIAL_PHOTOS[4],
      bio: "Moda sahilinde pazar yürüyüşleri.",
      isAdmin: false,
      createdAt: hoursAgo(9 * 24),
    },
    {
      id: "m-onur",
      username: "onur",
      email: "onur@yourpoodle.local",
      passwordHash: demoHash,
      name: "Onur Bilgin",
      city: "Samsun",
      dogName: "Max",
      avatar: SOCIAL_PHOTOS[5],
      bio: "Karadeniz'de poodle bakımı.",
      isAdmin: false,
      createdAt: hoursAgo(8 * 24),
    },
    {
      id: "m-zeynep",
      username: "zeynep",
      email: "zeynep@yourpoodle.local",
      passwordHash: demoHash,
      name: "Zeynep Arslan",
      city: "İstanbul",
      dogName: "Pamuk",
      avatar: SOCIAL_PHOTOS[0],
      bio: "Forumda tüy bakımı soruları soruyorum.",
      isAdmin: false,
      createdAt: hoursAgo(7 * 24),
    },
    {
      id: "m-hakan",
      username: "hakan",
      email: "hakan@yourpoodle.local",
      passwordHash: demoHash,
      name: "Hakan Öz",
      city: "Ankara",
      dogName: "Boncuk",
      avatar: SOCIAL_PHOTOS[2],
      bio: "Yavru aşı takvimi peşinde.",
      isAdmin: false,
      createdAt: hoursAgo(6 * 24),
    },
    {
      id: "m-lara",
      username: "lara",
      email: "lara@yourpoodle.local",
      passwordHash: demoHash,
      name: "Lara Şen",
      city: "Beşiktaş",
      dogName: "Topik",
      avatar: SOCIAL_PHOTOS[3],
      bio: "Maçka Parkı yürüyüş grubunu düzenliyorum.",
      isAdmin: false,
      createdAt: hoursAgo(5 * 24),
    },
  ]);

  const posts: SocialPost[] = [
    {
      id: "p1",
      authorId: "m-elif",
      image: SOCIAL_PHOTOS[0],
      caption: "Pamuk bugün kuaförden yeni çıktı. Toy poodle tüyünü parlak tutmak için sabah kırk dakika fırçaladık.",
      hidden: false,
      createdAt: hoursAgo(0.2),
    },
    {
      id: "p2",
      authorId: "m-deniz",
      image: SOCIAL_PHOTOS[2],
      caption: "Leo ile ilk park gezisine çıktık ve dalı bir an bile bırakmadı. Yarın Alsancak'ta yavru poodle sahipleri için yürüyüş var.",
      hidden: false,
      createdAt: hoursAgo(0.63),
    },
    {
      id: "p3",
      authorId: "m-ayse",
      image: SOCIAL_PHOTOS[4],
      caption: "Muffin bu sabah yoğurt ve havuç yedi. Çankaya'da poodle arkadaşlarıyla oynayabileceği bir grup arıyoruz.",
      hidden: false,
      createdAt: hoursAgo(1.1),
    },
    {
      id: "p4",
      authorId: "m-burak",
      image: SOCIAL_PHOTOS[5],
      caption: "Bugün Tarçın'ın kulak bakımını yaptık. Nemli havada poodle kulaklarını her gün kontrol etmek gerekiyor.",
      hidden: false,
      createdAt: hoursAgo(2.1),
    },
    {
      id: "p5",
      authorId: "m-selin",
      image: SOCIAL_PHOTOS[1],
      caption: "Antalya sıcağında Coco ile yalnızca kısa yürüyüş yaptık. Öğlen saatlerinde poodle'lar evde serin kalmalı.",
      hidden: false,
      createdAt: hoursAgo(4.1),
    },
    {
      id: "p6",
      authorId: "m-mert",
      image: SOCIAL_PHOTOS[3],
      caption: "Mini ilk tırnak kesiminde çok sakin durdu. Ödül maması verince işlem kolaylaştı.",
      hidden: false,
      createdAt: hoursAgo(6.1),
    },
    {
      id: "p7",
      authorId: "m-ceren",
      image: SOCIAL_PHOTOS[4],
      caption: "Moda sahilinde Lila yeni poodle arkadaşları edindi. Pazar sabahı saat onda yine orada olacağız.",
      hidden: false,
      createdAt: hoursAgo(25),
    },
  ];

  const stories: SocialStory[] = [
    { id: "s1", authorId: "m-elif", image: SOCIAL_PHOTOS[0], createdAt: hoursAgo(0.4) },
    { id: "s2", authorId: "m-deniz", image: SOCIAL_PHOTOS[2], createdAt: hoursAgo(1.2) },
    { id: "s3", authorId: "m-ayse", image: SOCIAL_PHOTOS[6], createdAt: hoursAgo(2) },
    { id: "s4", authorId: "m-burak", image: SOCIAL_PHOTOS[7], createdAt: hoursAgo(3) },
    { id: "s5", authorId: "m-selin", image: SOCIAL_PHOTOS[8], createdAt: hoursAgo(5) },
    { id: "s6", authorId: "m-mert", image: SOCIAL_PHOTOS[9], createdAt: hoursAgo(7) },
    { id: "s7", authorId: "m-ceren", image: SOCIAL_PHOTOS[4], createdAt: hoursAgo(9) },
    { id: "s8", authorId: "m-onur", image: SOCIAL_PHOTOS[5], createdAt: hoursAgo(11) },
  ];

  const comments: SocialComment[] = [
    { id: "pc1", postId: "p1", authorId: "m-deniz", body: "Pamuk çok parlak duruyor. Hangi spreyi kullanıyorsun?", hidden: false, createdAt: hoursAgo(0.15) },
    { id: "pc2", postId: "p1", authorId: "m-ceren", body: "Kuaför sonrası fotoğraf harika olmuş. Kadıköy'de hangi salona gidiyorsunuz?", hidden: false, createdAt: hoursAgo(0.12) },
    { id: "pc3", postId: "p2", authorId: "m-elif", body: "Alsancak yürüyüşüne Pamuk ile gelebiliriz.", hidden: false, createdAt: hoursAgo(0.5) },
    { id: "pc4", postId: "p7", authorId: "m-lara", body: "Moda sahili pazarları çok kalabalık oluyor, Lila'ya dikkat edin.", hidden: false, createdAt: hoursAgo(20) },
  ];

  const likes: SocialLike[] = [
    { id: "l1", postId: "p1", memberId: "m-deniz" },
    { id: "l2", postId: "p1", memberId: "m-ceren" },
    { id: "l3", postId: "p1", memberId: "m-ayse" },
    { id: "l4", postId: "p2", memberId: "m-elif" },
    { id: "l5", postId: "p2", memberId: "m-lara" },
    { id: "l6", postId: "p7", memberId: "m-elif" },
    { id: "l7", postId: "p7", memberId: "m-deniz" },
    { id: "l8", postId: "p3", memberId: "m-elif" },
  ];

  const saves: SocialSave[] = [
    { id: "sv1", postId: "p7", memberId: "m-elif" },
    { id: "sv2", postId: "p2", memberId: "m-elif" },
    { id: "sv3", postId: "p1", memberId: "m-deniz" },
  ];

  const follows: SocialFollow[] = [
    { id: "f1", followerId: "m-elif", followingId: "m-deniz" },
    { id: "f2", followerId: "m-elif", followingId: "m-ceren" },
    { id: "f3", followerId: "m-deniz", followingId: "m-elif" },
    { id: "f4", followerId: "m-ayse", followingId: "m-elif" },
    { id: "f5", followerId: "m-ceren", followingId: "m-elif" },
    { id: "f6", followerId: "m-lara", followingId: "m-ceren" },
    { id: "f7", followerId: "m-admin", followingId: "m-elif" },
  ];

  const categories = defaultCategories();
  const topics: SocialTopic[] = [
    {
      id: "t1",
      authorId: "m-zeynep",
      categoryId: "fc-bakim",
      title: "Toy poodle tüy bakımı için tarak mı yoksa fırça mı kullanıyorsunuz?",
      body: "Merhaba, on bir aylık toy poodle'ım Pamuk var. Her sabah tarıyorum ama kulak arkası ve koltuk altı yine düğümleniyor. Siz metal tarak mı yoksa pin fırça mı kullanıyorsunuz? Kuaföre kaç haftada bir götürüyorsunuz?",
      tag: "Bakım",
      hidden: false,
      views: 318,
      createdAt: hoursAgo(3.2),
    },
    {
      id: "t2",
      authorId: "m-hakan",
      categoryId: "fc-saglik",
      title: "Yavru poodle için ilk aşı takvimi nasıl olmalı?",
      body: "Sekiz haftalık krem rengi bir poodle aldık. İç parazit, karma ve kuduz aşılarının sırasını netleştirmek istiyorum. Ankara'da güvendiğiniz bir veteriner var mı?",
      tag: "Sağlık",
      hidden: false,
      views: 241,
      createdAt: hoursAgo(26),
    },
    {
      id: "t3",
      authorId: "m-lara",
      categoryId: "fc-geziler",
      title: "İstanbul Avrupa yakasında poodle yürüyüş grubu kuruyoruz",
      body: "Her cumartesi saat 09.30'da Maçka Parkı girişinde toy ve minyatür poodle'larla yürüyoruz. Sakin köpekler geliyor ve tasma zorunlu. Bu hafta dokuz kişi var, yeni yüzler bekleriz.",
      tag: "Geziler",
      hidden: false,
      views: 502,
      createdAt: hoursAgo(50),
    },
    {
      id: "t4",
      authorId: "m-ayse",
      categoryId: "fc-sahiplenme",
      title: "Ankara'da toy poodle sahiplendirmek isteyen var mı?",
      body: "Tanıdık bir evde üç yaşında, aşıları tam bir dişi toy poodle yeni yuva arıyor. Sorumlu sahiplenme, sözleşme ve ilk veteriner kontrolü şart. Çankaya'da tanışabiliriz.",
      tag: "Sahiplenme",
      hidden: false,
      views: 88,
      createdAt: hoursAgo(12),
    },
  ];

  const replies: SocialReply[] = [
    { id: "r1", topicId: "t1", authorId: "m-elif", body: "Ben pin fırça ve seyrek dişli tarak kullanıyorum. Düğüm yerlerine önce sprey sıkıp sonra tarıyorum.", hidden: false, createdAt: hoursAgo(2.1) },
    { id: "r2", topicId: "t1", authorId: "m-onur", body: "Dört haftada bir kuaför yeterli oluyor. Evde her gün on dakika tarama şart.", hidden: false, createdAt: hoursAgo(1.2) },
    { id: "r3", topicId: "t2", authorId: "m-ayse", body: "Sekiz, on ve on iki haftada karma aşı, kuduz ise on ikinci haftadan sonra yapılıyor. Çankaya'da Pati Kliniği'ni öneririm.", hidden: false, createdAt: hoursAgo(20) },
    { id: "r4", topicId: "t3", authorId: "m-ceren", body: "Anadolu yakasından da gelen oluyor. Feribotla on dakikada Maçka'ya iniyoruz.", hidden: false, createdAt: hoursAgo(30) },
    { id: "r5", topicId: "t3", authorId: "m-deniz", body: "İzmir'de benzer bir grup kursak çok iyi olur. Toplantı düzeninizi yazar mısınız?", hidden: false, createdAt: hoursAgo(28) },
    { id: "r6", topicId: "t4", authorId: "m-hakan", body: "Çankaya'dayız, bu hafta sonu tanışabiliriz. Aşı karnesini görebilir miyiz?", hidden: false, createdAt: hoursAgo(10) },
  ];

  const clubs: SocialClub[] = [
    {
      id: "c1",
      name: "İstanbul Poodle Kulübü",
      city: "İstanbul",
      cover: SOCIAL_PHOTOS[0],
      description: "Maçka, Caddebostan ve Belgrad Ormanı buluşmaları. Tasma zorunlu, küçük ırklar öncelikli.",
    },
    {
      id: "c2",
      name: "Ankara Küçük Irklar",
      city: "Ankara",
      cover: SOCIAL_PHOTOS[6],
      description: "Poodle, pomeranian ve yorkie sahipleri için park günleri. Çankaya ve Bahçelievler.",
    },
    {
      id: "c3",
      name: "Ege Poodle Yürüyüşü",
      city: "İzmir",
      cover: SOCIAL_PHOTOS[2],
      description: "Alsancak ve İnciraltı sahil yürüyüşleri. Yavru köpekler için ayrı tempo.",
    },
  ];

  const clubMembers: SocialClubMember[] = [
    { id: "cm1", clubId: "c1", memberId: "m-elif" },
    { id: "cm2", clubId: "c1", memberId: "m-ceren" },
    { id: "cm3", clubId: "c1", memberId: "m-lara" },
    { id: "cm4", clubId: "c1", memberId: "m-zeynep" },
    { id: "cm5", clubId: "c2", memberId: "m-ayse" },
    { id: "cm6", clubId: "c2", memberId: "m-hakan" },
    { id: "cm7", clubId: "c3", memberId: "m-deniz" },
  ];

  const notifications: SocialNotification[] = [
    {
      id: "n1",
      memberId: "m-elif",
      kind: "follow",
      actorName: "Ayşe Tekin",
      text: "Ayşe Tekin seni takip etmeye başladı.",
      href: "/muffin",
      read: false,
      createdAt: hoursAgo(0.8),
    },
    {
      id: "n2",
      memberId: "m-elif",
      kind: "comment",
      actorName: "Deniz Aksoy",
      text: "Deniz Aksoy gönderine yorum yazdı.",
      href: "/gonderi/p1",
      read: false,
      createdAt: hoursAgo(0.15),
    },
    {
      id: "n3",
      memberId: "m-elif",
      kind: "follow",
      actorName: "Ceren Demir",
      text: "Ceren Demir seni takip etmeye başladı.",
      href: "/lila",
      read: true,
      createdAt: hoursAgo(8),
    },
    {
      id: "n4",
      memberId: "m-deniz",
      kind: "comment",
      actorName: "Elif Kaya",
      text: "Elif Kaya gönderine yorum yazdı.",
      href: "/gonderi/p2",
      read: false,
      createdAt: hoursAgo(0.5),
    },
  ];

  const reports: SocialReport[] = [
    {
      id: "rp1",
      reporterId: "m-elif",
      targetType: "comment",
      targetId: "pc4",
      reason: "Konu dışı uyarı, incelensin.",
      status: "open",
      createdAt: hoursAgo(12),
    },
  ];

  return {
    members,
    posts,
    stories,
    comments,
    likes,
    saves,
    follows,
    categories,
    topics,
    replies,
    clubs,
    clubMembers,
    notifications,
    reports,
    sessions: [],
  };
}

function emptyDb(): SocialDb {
  return {
    members: [],
    posts: [],
    stories: [],
    comments: [],
    likes: [],
    saves: [],
    follows: [],
    categories: [],
    topics: [],
    replies: [],
    clubs: [],
    clubMembers: [],
    notifications: [],
    reports: [],
    sessions: [],
  };
}

function loadFile(): SocialDb | null {
  try {
    if (!fs.existsSync(DATA_PATH)) return null;
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw) as SocialDb;
    if (!parsed?.members?.length) return null;
    if (!Array.isArray(parsed.categories)) parsed.categories = [];
    return parsed;
  } catch {
    return null;
  }
}

function persist(db: SocialDb) {
  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify(db, null, 2), "utf8");
}

let db: SocialDb = loadFile() ?? buildSeed();
migrateDb(db);
persist(db);

let writeChain = Promise.resolve();

function mutate<T>(fn: (state: SocialDb) => T): T {
  const result = fn(db);
  const snapshot = db;
  writeChain = writeChain.then(() => persist(snapshot)).catch((err) => {
    console.error("[social-store] persist failed", err);
  });
  return result;
}

function memberById(id: string) {
  return db.members.find((m) => m.id === id);
}

function memberByUsername(username: string) {
  return db.members.find((m) => m.username.toLowerCase() === username.toLowerCase());
}

function localeOf(memberId?: string | null): SocialLocale {
  if (!memberId) return "tr";
  return memberById(memberId)?.locale === "en" ? "en" : "tr";
}

function errFor(memberId: string | null | undefined, tr: string, en: string, status = 400): never {
  throw Object.assign(new Error(localeOf(memberId) === "en" ? en : tr), { status });
}

export function toPublicMember(member: SocialMember, viewerId?: string | null): PublicMember {
  return {
    id: member.id,
    username: member.username,
    name: member.name,
    city: member.city,
    dogName: member.dogName,
    dogSlug: member.dogSlug,
    locale: member.locale === "en" ? "en" : "tr",
    avatar: member.avatar,
    bio: member.bio,
    isAdmin: member.isAdmin,
    createdAt: member.createdAt,
    followers: db.follows.filter((f) => f.followingId === member.id).length,
    following: db.follows.filter((f) => f.followerId === member.id).length,
    postCount: db.posts.filter((p) => p.authorId === member.id && !p.hidden).length,
    isFollowing: viewerId ? db.follows.some((f) => f.followerId === viewerId && f.followingId === member.id) : false,
  };
}

export function toFeedPost(post: SocialPost, viewerId?: string | null): FeedPostDto | null {
  const author = memberById(post.authorId);
  if (!author) return null;
  return {
    id: post.id,
    authorId: author.id,
    username: author.username,
    author: author.name,
    dogSlug: author.dogSlug,
    dogName: author.dogName,
    city: author.city,
    time: formatTimeAgo(post.createdAt),
    createdAt: post.createdAt,
    image: post.image,
    avatar: author.avatar,
    likes: db.likes.filter((l) => l.postId === post.id).length,
    comments: db.comments.filter((c) => c.postId === post.id && !c.hidden).length,
    caption: post.caption,
    liked: viewerId ? db.likes.some((l) => l.postId === post.id && l.memberId === viewerId) : false,
    saved: viewerId ? db.saves.some((s) => s.postId === post.id && s.memberId === viewerId) : false,
    isFollowing: viewerId ? db.follows.some((f) => f.followerId === viewerId && f.followingId === author.id) : false,
  };
}

function toComment(comment: SocialComment): CommentDto | null {
  const author = memberById(comment.authorId);
  if (!author) return null;
  return {
    id: comment.id,
    authorId: author.id,
    username: author.username,
    dogSlug: author.dogSlug,
    author: author.name,
    city: author.city,
    avatar: author.avatar,
    body: comment.body,
    time: formatTimeAgo(comment.createdAt),
    createdAt: comment.createdAt,
  };
}

function toTopic(topic: SocialTopic, includeHiddenReplies = false): ForumTopicDto | null {
  const author = memberById(topic.authorId);
  if (!author) return null;
  const topicReplies = db.replies
    .filter((r) => r.topicId === topic.id && (includeHiddenReplies || !r.hidden))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const comments = topicReplies.map((r) => {
    const ra = memberById(r.authorId);
    return {
      id: r.id,
      authorId: r.authorId,
      username: ra?.username || "",
      dogSlug: ra?.dogSlug || "",
      author: ra?.name || "YourPoodle",
      city: ra?.city || "",
      avatar: ra?.avatar || SOCIAL_PHOTOS[1],
      body: r.body,
      time: formatTimeAgo(r.createdAt),
      createdAt: r.createdAt,
    };
  });
  return {
    id: topic.id,
    authorId: author.id,
    username: author.username,
    dogSlug: author.dogSlug,
    title: topic.title,
    author: author.name,
    city: author.city,
    avatar: author.avatar,
    time: formatTimeAgo(topic.createdAt),
    createdAt: topic.createdAt,
    replies: comments.length,
    views: topic.views,
    excerpt: topic.body.slice(0, 140),
    tag: topic.tag,
    categoryId: topic.categoryId,
    categorySlug: categoryById(topic.categoryId)?.slug || "",
    body: topic.body,
    comments,
  };
}

function categoryById(id: string) {
  return db.categories.find((c) => c.id === id);
}

function categoryBySlug(slug: string) {
  const key = decodeURIComponent(slug).toLowerCase();
  return db.categories.find((c) => c.slug.toLowerCase() === key);
}

function toCategoryDto(category: SocialForumCategory, includeHiddenTopics = false): ForumCategoryDto {
  const topics = db.topics.filter(
    (t) => t.categoryId === category.id && (includeHiddenTopics || !t.hidden),
  );
  const last = topics.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  return {
    id: category.id,
    slug: category.slug,
    nameTr: category.nameTr,
    nameEn: category.nameEn,
    descriptionTr: category.descriptionTr,
    descriptionEn: category.descriptionEn,
    hidden: category.hidden,
    sort: category.sort,
    topicCount: topics.length,
    lastActivity: last?.createdAt,
  };
}

function toClub(club: SocialClub, viewerId?: string | null): ClubDto {
  return {
    id: club.id,
    name: club.name,
    city: club.city,
    members: db.clubMembers.filter((c) => c.clubId === club.id).length,
    cover: club.cover,
    description: club.description,
    joined: viewerId ? db.clubMembers.some((c) => c.clubId === club.id && c.memberId === viewerId) : false,
  };
}

function notify(memberId: string, kind: string, text: string, href: string, actorId?: string) {
  if (!memberId || memberId === actorId) return;
  const actor = actorId ? memberById(actorId) : undefined;
  db.notifications.unshift({
    id: nid(),
    memberId,
    kind,
    actorName: actor?.name || "",
    text,
    href,
    read: false,
    createdAt: new Date().toISOString(),
  });
}

export function getSessionMember(token?: string | null): SocialMember | null {
  if (!token) return null;
  const now = Date.now();
  const session = db.sessions.find((s) => s.token === token && s.expiresAt > now);
  if (!session) return null;
  return memberById(session.memberId) || null;
}

export function createSession(memberId: string): string {
  const token = crypto.randomBytes(24).toString("hex");
  return mutate((state) => {
    state.sessions = state.sessions.filter((s) => s.expiresAt > Date.now() && s.memberId !== memberId);
    state.sessions.push({ token, memberId, expiresAt: Date.now() + SESSION_MS });
    return token;
  });
}

export function destroySession(token?: string | null) {
  if (!token) return;
  mutate((state) => {
    state.sessions = state.sessions.filter((s) => s.token !== token);
  });
}

export function login(identifier: string, password: string): SocialMember | null {
  const key = identifier.trim().toLowerCase();
  const member = db.members.find(
    (m) => m.username.toLowerCase() === key || m.email.toLowerCase() === key,
  );
  if (!member) return null;
  if (!bcrypt.compareSync(password, member.passwordHash)) return null;
  return member;
}

export function registerMember(input: {
  username: string;
  email: string;
  password: string;
  name: string;
  city: string;
  dogName: string;
  locale?: string;
}): SocialMember {
  const locale: SocialLocale = input.locale === "en" ? "en" : "tr";
  const err = (tr: string, en: string, status = 400) => {
    throw Object.assign(new Error(locale === "en" ? en : tr), { status });
  };
  const username = input.username.trim().toLowerCase();
  const email = input.email.trim().toLowerCase();
  if (!/^[a-z0-9._]{3,20}$/.test(username)) {
    err("Kullanıcı adı 3-20 karakter olmalı; harf, rakam, nokta veya alt çizgi kullanın.", "Username must be 3-20 characters: letters, numbers, dot, or underscore.");
  }
  if (!email.includes("@") || email.length < 5) {
    err("Geçerli bir e-posta yazın.", "Enter a valid email address.");
  }
  if (input.password.length < 6) {
    err("Şifre en az 6 karakter olmalı.", "Password must be at least 6 characters.");
  }
  if (!input.name.trim()) {
    err("Adınızı yazın.", "Enter your name.");
  }
  if (memberByUsername(username) || db.members.some((m) => m.email.toLowerCase() === email)) {
    err("Bu kullanıcı adı veya e-posta zaten kayıtlı.", "This username or email is already registered.", 409);
  }
  const dogName = input.dogName.trim() || "Poodle";
  const member: SocialMember = {
    id: nid(),
    username,
    email,
    passwordHash: bcrypt.hashSync(input.password, 8),
    name: input.name.trim(),
    city: input.city.trim() || (locale === "en" ? "Turkey" : "Türkiye"),
    dogName,
    dogSlug: uniqueDogSlug(dogName, db.members.map((m) => m.dogSlug)),
    locale,
    avatar: SOCIAL_PHOTOS[0],
    bio: "",
    isAdmin: false,
    createdAt: new Date().toISOString(),
  };
  return mutate((state) => {
    state.members.push(member);
    return member;
  });
}

export function updateProfile(
  memberId: string,
  patch: Partial<Pick<SocialMember, "name" | "city" | "dogName" | "avatar" | "bio" | "locale">>,
): SocialMember {
  return mutate((state) => {
    const member = state.members.find((m) => m.id === memberId);
    if (!member) errFor(memberId, "Üye bulunamadı.", "Member not found.", 404);
    if (patch.name !== undefined) member.name = patch.name.trim() || member.name;
    if (patch.city !== undefined) member.city = patch.city.trim();
    if (patch.locale === "en" || patch.locale === "tr") member.locale = patch.locale;
    if (patch.dogName !== undefined) {
      member.dogName = patch.dogName.trim() || member.dogName;
      const taken = state.members.filter((m) => m.id !== memberId).map((m) => m.dogSlug);
      member.dogSlug = uniqueDogSlug(member.dogName, taken);
    }
    if (patch.avatar !== undefined && SOCIAL_PHOTOS.includes(patch.avatar as typeof SOCIAL_PHOTOS[number])) {
      member.avatar = patch.avatar;
    } else if (patch.avatar !== undefined && patch.avatar.startsWith("/assets/")) {
      member.avatar = patch.avatar;
    }
    if (patch.bio !== undefined) member.bio = patch.bio.trim().slice(0, 180);
    return member;
  });
}

export function listFeed(viewerId?: string | null): FeedPostDto[] {
  return db.posts
    .filter((p) => !p.hidden)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((p) => toFeedPost(p, viewerId))
    .filter((p): p is FeedPostDto => !!p);
}

export function listStories(viewerId?: string | null): StoryDto[] {
  return db.stories
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((story) => {
      const author = memberById(story.authorId);
      if (!author) return null;
      return {
        id: story.id,
        authorId: author.id,
        username: author.username,
        name: author.name,
        dogSlug: author.dogSlug,
        dogName: author.dogName,
        city: author.city,
        avatar: author.avatar,
        image: story.image,
        time: formatTimeAgo(story.createdAt),
        createdAt: story.createdAt,
        isFollowing: viewerId ? db.follows.some((f) => f.followerId === viewerId && f.followingId === author.id) : false,
      } satisfies StoryDto;
    })
    .filter((s): s is StoryDto => !!s);
}

export function getPost(id: string, viewerId?: string | null) {
  const post = db.posts.find((p) => p.id === id);
  if (!post || post.hidden) return null;
  const dto = toFeedPost(post, viewerId);
  if (!dto) return null;
  const comments = db.comments
    .filter((c) => c.postId === id && !c.hidden)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map(toComment)
    .filter((c): c is CommentDto => !!c);
  return { post: dto, comments };
}

export function createPost(authorId: string, caption: string, image: string): FeedPostDto {
  const clean = caption.trim();
  if (clean.length < 3) errFor(authorId, "Gönderi yazısı çok kısa.", "Post caption is too short.");
  const photo = SOCIAL_PHOTOS.includes(image as typeof SOCIAL_PHOTOS[number]) ? image : SOCIAL_PHOTOS[0];
  const post: SocialPost = {
    id: nid(),
    authorId,
    image: photo,
    caption: clean,
    hidden: false,
    createdAt: new Date().toISOString(),
  };
  return mutate((state) => {
    state.posts.unshift(post);
    const dto = toFeedPost(post, authorId);
    if (!dto) errFor(authorId, "Gönderi oluşturulamadı.", "Could not create post.", 500);
    return dto;
  });
}

export function toggleLike(postId: string, memberId: string) {
  const post = db.posts.find((p) => p.id === postId && !p.hidden);
  if (!post) errFor(memberId, "Gönderi bulunamadı.", "Post not found.", 404);
  return mutate((state) => {
    const existing = state.likes.find((l) => l.postId === postId && l.memberId === memberId);
    if (existing) {
      state.likes = state.likes.filter((l) => l.id !== existing.id);
    } else {
      state.likes.push({ id: nid(), postId, memberId });
      const actor = memberById(memberId);
      notify(post.authorId, "like", `${actor?.name || "Bir üye"} gönderini beğendi.`, `/gonderi/${postId}`, memberId);
    }
    return toFeedPost(post, memberId);
  });
}

export function toggleSave(postId: string, memberId: string) {
  const post = db.posts.find((p) => p.id === postId && !p.hidden);
  if (!post) errFor(memberId, "Gönderi bulunamadı.", "Post not found.", 404);
  return mutate((state) => {
    const existing = state.saves.find((s) => s.postId === postId && s.memberId === memberId);
    if (existing) state.saves = state.saves.filter((s) => s.id !== existing.id);
    else state.saves.push({ id: nid(), postId, memberId });
    return toFeedPost(post, memberId);
  });
}

export function addComment(postId: string, memberId: string, body: string) {
  const post = db.posts.find((p) => p.id === postId && !p.hidden);
  if (!post) errFor(memberId, "Gönderi bulunamadı.", "Post not found.", 404);
  const text = body.trim();
  if (text.length < 1) errFor(memberId, "Yorum yazın.", "Write a comment.");
  const comment: SocialComment = {
    id: nid(),
    postId,
    authorId: memberId,
    body: text,
    hidden: false,
    createdAt: new Date().toISOString(),
  };
  return mutate((state) => {
    state.comments.push(comment);
    const actor = memberById(memberId);
    notify(post.authorId, "comment", `${actor?.name || "Bir üye"} gönderine yorum yazdı.`, `/gonderi/${postId}`, memberId);
    return toComment(comment);
  });
}

export function toggleFollow(username: string, followerId: string) {
  const target = memberByUsername(username);
  if (!target) errFor(followerId, "Üye bulunamadı.", "Member not found.", 404);
  if (target.id === followerId) errFor(followerId, "Kendinizi takip edemezsiniz.", "You cannot follow yourself.");
  return mutate((state) => {
    const existing = state.follows.find((f) => f.followerId === followerId && f.followingId === target.id);
    if (existing) {
      state.follows = state.follows.filter((f) => f.id !== existing.id);
    } else {
      state.follows.push({ id: nid(), followerId, followingId: target.id });
      const actor = memberById(followerId);
      notify(target.id, "follow", `${actor?.name || "Bir üye"} seni takip etmeye başladı.`, actor?.dogSlug ? `/${actor.dogSlug}` : `/uye/${actor?.username || ""}`, followerId);
    }
    return toPublicMember(target, followerId);
  });
}

export function getMemberProfile(username: string, viewerId?: string | null) {
  const member = memberByUsername(username);
  if (!member) return null;
  const posts = db.posts
    .filter((p) => p.authorId === member.id && !p.hidden)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((p) => toFeedPost(p, viewerId))
    .filter((p): p is FeedPostDto => !!p);
  const followers = db.follows
    .filter((f) => f.followingId === member.id)
    .map((f) => memberById(f.followerId))
    .filter((m): m is SocialMember => !!m)
    .map((m) => toPublicMember(m, viewerId));
  const following = db.follows
    .filter((f) => f.followerId === member.id)
    .map((f) => memberById(f.followingId))
    .filter((m): m is SocialMember => !!m)
    .map((m) => toPublicMember(m, viewerId));
  return { member: toPublicMember(member, viewerId), posts, followers, following };
}

export function listProfileSlugs(): string[] {
  return db.members.map((m) => m.dogSlug).filter(Boolean);
}

export function getMemberBySlug(slug: string, viewerId?: string | null) {
  const key = decodeURIComponent(slug).toLowerCase();
  const member = db.members.find((m) => m.dogSlug.toLowerCase() === key);
  if (!member) return null;
  return getMemberProfile(member.username, viewerId);
}

export function listSaved(memberId: string): FeedPostDto[] {
  const ids = new Set(db.saves.filter((s) => s.memberId === memberId).map((s) => s.postId));
  return db.posts
    .filter((p) => ids.has(p.id) && !p.hidden)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((p) => toFeedPost(p, memberId))
    .filter((p): p is FeedPostDto => !!p);
}

export function listForum(viewerAdmin = false): ForumTopicDto[] {
  return db.topics
    .filter((t) => {
      if (!viewerAdmin && t.hidden) return false;
      const category = categoryById(t.categoryId);
      if (!category) return false;
      if (!viewerAdmin && category.hidden) return false;
      return true;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((t) => toTopic(t, viewerAdmin))
    .filter((t): t is ForumTopicDto => !!t);
}

export function listCategories(viewerAdmin = false): ForumCategoryDto[] {
  return db.categories
    .filter((c) => viewerAdmin || !c.hidden)
    .sort((a, b) => a.sort - b.sort || a.nameTr.localeCompare(b.nameTr, "tr"))
    .map((c) => toCategoryDto(c, viewerAdmin));
}

export function getCategoryBySlug(slug: string, viewerAdmin = false) {
  const category = categoryBySlug(slug);
  if (!category) return null;
  if (category.hidden && !viewerAdmin) return null;
  const topics = db.topics
    .filter((t) => t.categoryId === category.id && (viewerAdmin || !t.hidden))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((t) => toTopic(t, viewerAdmin))
    .filter((t): t is ForumTopicDto => !!t);
  return { category: toCategoryDto(category, viewerAdmin), topics };
}

export function getForumTopic(id: string, increment = false, viewerAdmin = false) {
  const topic = db.topics.find((t) => t.id === id);
  if (!topic) return null;
  const category = categoryById(topic.categoryId);
  if (!topic.hidden && category && (viewerAdmin || !category.hidden)) {
    if (increment) {
      mutate((state) => {
        const row = state.topics.find((t) => t.id === id);
        if (row) row.views += 1;
      });
    }
    return toTopic(topic);
  }
  if (viewerAdmin) return toTopic(topic, true);
  if (topic.hidden) return null;
  return null;
}

export function createTopic(authorId: string, title: string, body: string, categorySlug: string) {
  const category = categoryBySlug(categorySlug);
  if (!category || category.hidden) errFor(authorId, "Başlık bulunamadı.", "Category not found.", 404);
  const t = title.trim();
  const b = body.trim();
  if (t.length < 8 || b.length < 8) {
    errFor(authorId, "Başlık ve metin daha uzun olmalı.", "Title and body need to be longer.");
  }
  const topic: SocialTopic = {
    id: nid(),
    authorId,
    categoryId: category.id,
    title: t,
    body: b,
    tag: category.nameTr,
    hidden: false,
    views: 1,
    createdAt: new Date().toISOString(),
  };
  return mutate((state) => {
    state.topics.unshift(topic);
    return toTopic(topic);
  });
}

export function createCategory(
  actorId: string,
  input: { nameTr: string; nameEn?: string; descriptionTr?: string; descriptionEn?: string },
): ForumCategoryDto {
  const actor = memberById(actorId);
  if (!actor?.isAdmin) errFor(actorId, "Yalnızca yöneticiler başlık açabilir.", "Only administrators can create categories.", 403);
  const nameTr = input.nameTr.trim();
  const nameEn = (input.nameEn || input.nameTr).trim();
  if (nameTr.length < 2) errFor(actorId, "Başlık adı daha uzun olmalı.", "Category name needs to be longer.");
  const taken = db.categories.map((c) => c.slug);
  const slug = uniqueDogSlug(nameTr, taken);
  const category: SocialForumCategory = {
    id: nid(),
    slug,
    nameTr,
    nameEn: nameEn || nameTr,
    descriptionTr: (input.descriptionTr || "").trim().slice(0, 180),
    descriptionEn: (input.descriptionEn || input.descriptionTr || "").trim().slice(0, 180),
    hidden: false,
    sort: (db.categories.reduce((max, c) => Math.max(max, c.sort), 0) || 0) + 1,
  };
  return mutate((state) => {
    state.categories.push(category);
    return toCategoryDto(category, true);
  });
}

export function updateCategory(
  actorId: string,
  id: string,
  patch: Partial<Pick<SocialForumCategory, "nameTr" | "nameEn" | "descriptionTr" | "descriptionEn" | "hidden" | "slug">>,
): ForumCategoryDto {
  const actor = memberById(actorId);
  if (!actor?.isAdmin) errFor(actorId, "Yalnızca yöneticiler başlık düzenleyebilir.", "Only administrators can edit categories.", 403);
  return mutate((state) => {
    const category = state.categories.find((c) => c.id === id);
    if (!category) errFor(actorId, "Başlık bulunamadı.", "Category not found.", 404);
    if (patch.nameTr !== undefined) category.nameTr = patch.nameTr.trim() || category.nameTr;
    if (patch.nameEn !== undefined) category.nameEn = patch.nameEn.trim() || category.nameEn;
    if (patch.descriptionTr !== undefined) category.descriptionTr = patch.descriptionTr.trim().slice(0, 180);
    if (patch.descriptionEn !== undefined) category.descriptionEn = patch.descriptionEn.trim().slice(0, 180);
    if (patch.hidden !== undefined) category.hidden = !!patch.hidden;
    if (patch.slug !== undefined) {
      const next = slugifyDogName(patch.slug);
      const clash = state.categories.some((c) => c.id !== id && c.slug === next);
      if (next && !clash) category.slug = next;
    }
    return toCategoryDto(category, true);
  });
}

export function addReply(topicId: string, memberId: string, body: string) {
  const topic = db.topics.find((t) => t.id === topicId && !t.hidden);
  if (!topic) errFor(memberId, "Konu bulunamadı.", "Topic not found.", 404);
  const text = body.trim();
  if (text.length < 1) errFor(memberId, "Yanıt yazın.", "Write a reply.");
  const reply: SocialReply = {
    id: nid(),
    topicId,
    authorId: memberId,
    body: text,
    hidden: false,
    createdAt: new Date().toISOString(),
  };
  return mutate((state) => {
    state.replies.push(reply);
    const actor = memberById(memberId);
    const dto = toTopic(topic);
    notify(topic.authorId, "reply", `${actor?.name || "Bir üye"} forum konusuna yanıt verdi.`, dto ? forumTopicPath(dto) : `/forum/${topicId}`, memberId);
    return toTopic(topic);
  });
}

export function listClubs(viewerId?: string | null): ClubDto[] {
  return db.clubs.map((c) => toClub(c, viewerId));
}

export function getClub(id: string, viewerId?: string | null) {
  const club = db.clubs.find((c) => c.id === id);
  if (!club) return null;
  const members = db.clubMembers
    .filter((c) => c.clubId === id)
    .map((c) => memberById(c.memberId))
    .filter((m): m is SocialMember => !!m)
    .map((m) => toPublicMember(m, viewerId));
  return { club: toClub(club, viewerId), members };
}

export function toggleClub(id: string, memberId: string) {
  const club = db.clubs.find((c) => c.id === id);
  if (!club) errFor(memberId, "Kulüp bulunamadı.", "Club not found.", 404);
  return mutate((state) => {
    const existing = state.clubMembers.find((c) => c.clubId === id && c.memberId === memberId);
    if (existing) state.clubMembers = state.clubMembers.filter((c) => c.id !== existing.id);
    else state.clubMembers.push({ id: nid(), clubId: id, memberId });
    const members = state.clubMembers
      .filter((c) => c.clubId === id)
      .map((c) => memberById(c.memberId))
      .filter((m): m is SocialMember => !!m)
      .map((m) => toPublicMember(m, memberId));
    return { club: toClub(club, memberId), members };
  });
}

export function listNotifications(memberId: string): NotificationDto[] {
  return db.notifications
    .filter((n) => n.memberId === memberId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 50)
    .map((n) => ({
      id: n.id,
      kind: n.kind,
      actorName: n.actorName || "",
      text: n.text,
      href: n.href,
      read: n.read,
      time: formatTimeAgo(n.createdAt),
      createdAt: n.createdAt,
    }));
}

export function unreadCount(memberId: string) {
  return db.notifications.filter((n) => n.memberId === memberId && !n.read).length;
}

export function markNotificationsRead(memberId: string) {
  mutate((state) => {
    for (const n of state.notifications) {
      if (n.memberId === memberId) n.read = true;
    }
  });
}

export function searchAll(query: string, viewerId?: string | null) {
  const q = query.trim().toLocaleLowerCase("tr-TR");
  const match = (value: string) => !q || value.toLocaleLowerCase("tr-TR").includes(q);
  const posts = listFeed(viewerId).filter(
    (p) => match(p.caption) || match(p.author) || match(p.dogName) || match(p.city) || match(p.username),
  );
  const topics = listForum().filter(
    (t) => match(t.title) || match(t.excerpt) || match(t.tag) || match(t.body) || match(t.author),
  );
  const members = db.members
    .filter((m) => match(m.name) || match(m.username) || match(m.city) || match(m.dogName))
    .map((m) => toPublicMember(m, viewerId));
  return { posts, topics, members };
}

export function createReport(reporterId: string, targetType: string, targetId: string, reason: string) {
  const allowed = ["post", "comment", "topic", "reply"];
  if (!allowed.includes(targetType)) {
    errFor(reporterId, "Geçersiz rapor türü.", "Invalid report type.");
  }
  const text = reason.trim() || (localeOf(reporterId) === "en" ? "Please review this." : "İncelenmesini istiyorum.");
  return mutate((state) => {
    const report: SocialReport = {
      id: nid(),
      reporterId,
      targetType,
      targetId,
      reason: text,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    state.reports.unshift(report);
    return report;
  });
}

function reportPreview(report: SocialReport): string {
  if (report.targetType === "post") return db.posts.find((p) => p.id === report.targetId)?.caption || "";
  if (report.targetType === "comment") return db.comments.find((c) => c.id === report.targetId)?.body || "";
  if (report.targetType === "topic") return db.topics.find((t) => t.id === report.targetId)?.title || "";
  if (report.targetType === "reply") return db.replies.find((r) => r.id === report.targetId)?.body || "";
  return "";
}

export function adminOverview() {
  return {
    users: db.members.length,
    posts: db.posts.length,
    comments: db.comments.length,
    topics: db.topics.length,
    reportsOpen: db.reports.filter((r) => r.status === "open").length,
  };
}

export function adminUsers() {
  return db.members.map((m) => toPublicMember(m));
}

export function adminPosts() {
  return db.posts
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((p) => {
      const dto = toFeedPost(p, null);
      return { ...dto, hidden: p.hidden, id: p.id, caption: p.caption, createdAt: p.createdAt, author: dto?.author || "—" };
    });
}

export function adminComments() {
  return db.comments
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((c) => {
      const author = memberById(c.authorId);
      return {
        id: c.id,
        postId: c.postId,
        author: author?.name || "Üye",
        body: c.body,
        hidden: c.hidden,
        createdAt: c.createdAt,
        time: formatTimeAgo(c.createdAt),
      };
    });
}

export function adminTopics() {
  return db.topics
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((t) => ({
      id: t.id,
      title: t.title,
      author: memberById(t.authorId)?.name || "Üye",
      tag: t.tag,
      hidden: t.hidden,
      replies: db.replies.filter((r) => r.topicId === t.id).length,
      createdAt: t.createdAt,
      time: formatTimeAgo(t.createdAt),
    }));
}

export function adminReports(): ReportDto[] {
  return db.reports
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((r) => ({
      id: r.id,
      reporterId: r.reporterId,
      reporterName: memberById(r.reporterId)?.name || "Üye",
      targetType: r.targetType,
      targetId: r.targetId,
      reason: r.reason,
      status: r.status,
      createdAt: r.createdAt,
      preview: reportPreview(r),
    }));
}

export function hidePost(id: string, hidden: boolean) {
  mutate((state) => {
    const post = state.posts.find((p) => p.id === id);
    if (post) post.hidden = hidden;
  });
}

export function deletePost(id: string) {
  mutate((state) => {
    state.posts = state.posts.filter((p) => p.id !== id);
    state.comments = state.comments.filter((c) => c.postId !== id);
    state.likes = state.likes.filter((l) => l.postId !== id);
    state.saves = state.saves.filter((s) => s.postId !== id);
  });
}

export function hideComment(id: string, hidden: boolean) {
  mutate((state) => {
    const row = state.comments.find((c) => c.id === id);
    if (row) row.hidden = hidden;
  });
}

export function deleteComment(id: string) {
  mutate((state) => {
    state.comments = state.comments.filter((c) => c.id !== id);
  });
}

export function hideTopic(id: string, hidden: boolean) {
  mutate((state) => {
    const row = state.topics.find((t) => t.id === id);
    if (row) row.hidden = hidden;
  });
}

export function deleteTopic(id: string) {
  mutate((state) => {
    state.topics = state.topics.filter((t) => t.id !== id);
    state.replies = state.replies.filter((r) => r.topicId !== id);
  });
}

export function resolveReport(id: string, status: string) {
  mutate((state) => {
    const row = state.reports.find((r) => r.id === id);
    if (row) row.status = status;
  });
}

export function hideReply(id: string, hidden: boolean) {
  mutate((state) => {
    const row = state.replies.find((r) => r.id === id);
    if (row) row.hidden = hidden;
  });
}

void emptyDb;
