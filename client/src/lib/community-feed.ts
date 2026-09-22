export type Story = {
  id: string;
  name: string;
  dogName: string;
  city: string;
  avatar: string;
};

export type Post = {
  id: string;
  author: string;
  dogName: string;
  city: string;
  time: string;
  image: string;
  avatar: string;
  likes: number;
  comments: number;
  caption: string;
};

export type ForumReply = {
  id: string;
  author: string;
  city: string;
  time: string;
  body: string;
};

export type ForumTopic = {
  id: string;
  title: string;
  author: string;
  city: string;
  time: string;
  replies: number;
  views: number;
  excerpt: string;
  tag: string;
  body: string;
  comments: ForumReply[];
};

export type Club = {
  id: string;
  name: string;
  city: string;
  members: number;
  cover: string;
  description: string;
};

export const STORIES: Story[] = [
  { id: "s1", name: "Elif K.", dogName: "Pamuk", city: "İstanbul", avatar: "/assets/poodle-face.jpg" },
  { id: "s2", name: "Deniz A.", dogName: "Leo", city: "İzmir", avatar: "/assets/golden-face.jpg" },
  { id: "s3", name: "Ayşe T.", dogName: "Muffin", city: "Ankara", avatar: "/assets/pomeranian-face.jpg" },
  { id: "s4", name: "Burak Y.", dogName: "Tarçın", city: "Bursa", avatar: "/assets/cocker-face.jpg" },
  { id: "s5", name: "Selin M.", dogName: "Coco", city: "Antalya", avatar: "/assets/pug-face.jpg" },
  { id: "s6", name: "Mert S.", dogName: "Mini", city: "Eskişehir", avatar: "/assets/terrier-face.jpg" },
  { id: "s7", name: "Ceren D.", dogName: "Lila", city: "Kadıköy", avatar: "/assets/golden-head.jpg" },
  { id: "s8", name: "Onur B.", dogName: "Max", city: "Samsun", avatar: "/assets/golden-hero.jpg" },
];

export const POSTS: Post[] = [
  {
    id: "p1",
    author: "Elif Kaya",
    dogName: "Pamuk",
    city: "İstanbul",
    time: "12 dk önce",
    image: "/assets/poodle-portrait.jpg",
    avatar: "/assets/poodle-face.jpg",
    likes: 248,
    comments: 31,
    caption: "Pamuk bugün kuaförden yeni çıktı. Toy poodle tüyünü parlak tutmak için sabah kırk dakika fırçaladık.",
  },
  {
    id: "p2",
    author: "Deniz Aksoy",
    dogName: "Leo",
    city: "İzmir",
    time: "38 dk önce",
    image: "/assets/golden-puppy.jpg",
    avatar: "/assets/golden-face.jpg",
    likes: 412,
    comments: 54,
    caption: "Leo ile ilk park gezisine çıktık ve dalı bir an bile bırakmadı. Yarın Alsancak'ta yavru poodle sahipleri için yürüyüş var.",
  },
  {
    id: "p3",
    author: "Ayşe Tekin",
    dogName: "Muffin",
    city: "Ankara",
    time: "1 sa önce",
    image: "/assets/golden-head.jpg",
    avatar: "/assets/pomeranian-face.jpg",
    likes: 189,
    comments: 22,
    caption: "Muffin bu sabah yoğurt ve havuç yedi. Çankaya'da poodle arkadaşlarıyla oynayabileceği bir grup arıyoruz.",
  },
  {
    id: "p4",
    author: "Burak Yılmaz",
    dogName: "Tarçın",
    city: "Bursa",
    time: "2 sa önce",
    image: "/assets/golden-hero.jpg",
    avatar: "/assets/cocker-face.jpg",
    likes: 156,
    comments: 18,
    caption: "Bugün Tarçın'ın kulak bakımını yaptık. Nemli havada poodle kulaklarını her gün kontrol etmek gerekiyor.",
  },
  {
    id: "p5",
    author: "Selin Mutlu",
    dogName: "Coco",
    city: "Antalya",
    time: "4 sa önce",
    image: "/assets/poodle-face.jpg",
    avatar: "/assets/pug-face.jpg",
    likes: 301,
    comments: 41,
    caption: "Antalya sıcağında Coco ile yalnızca kısa yürüyüş yaptık. Öğlen saatlerinde poodle'lar evde serin kalmalı.",
  },
  {
    id: "p6",
    author: "Mert Şahin",
    dogName: "Mini",
    city: "Eskişehir",
    time: "6 sa önce",
    image: "/assets/golden-face.jpg",
    avatar: "/assets/terrier-face.jpg",
    likes: 97,
    comments: 12,
    caption: "Mini ilk tırnak kesiminde çok sakin durdu. Ödül maması verince işlem kolaylaştı.",
  },
  {
    id: "p7",
    author: "Ceren Demir",
    dogName: "Lila",
    city: "Kadıköy",
    time: "1 gün önce",
    image: "/assets/golden-head.jpg",
    avatar: "/assets/golden-hero.jpg",
    likes: 528,
    comments: 67,
    caption: "Moda sahilinde Lila yeni poodle arkadaşları edindi. Pazar sabahı saat onda yine orada olacağız.",
  },
];

export const FORUM_TOPICS: ForumTopic[] = [
  {
    id: "t1",
    title: "Toy poodle tüy bakımı için tarak mı yoksa fırça mı kullanıyorsunuz?",
    author: "Zeynep Arslan",
    city: "İstanbul",
    time: "3 sa önce",
    replies: 24,
    views: 318,
    tag: "Bakım",
    excerpt: "Günlük tarama rutininizi paylaşır mısınız? Pamuk'un tüyleri hâlâ düğümleniyor.",
    body: "Merhaba, on bir aylık toy poodle'ım Pamuk var. Her sabah tarıyorum ama kulak arkası ve koltuk altı yine düğümleniyor. Siz metal tarak mı yoksa pin fırça mı kullanıyorsunuz? Kuaföre kaç haftada bir götürüyorsunuz?",
    comments: [
      { id: "r1", author: "Elif Kaya", city: "İstanbul", time: "2 sa önce", body: "Ben pin fırça ve seyrek dişli tarak kullanıyorum. Düğüm yerlerine önce sprey sıkıp sonra tarıyorum." },
      { id: "r2", author: "Onur Bilgin", city: "Samsun", time: "1 sa önce", body: "Dört haftada bir kuaför yeterli oluyor. Evde her gün on dakika tarama şart." },
    ],
  },
  {
    id: "t2",
    title: "Yavru poodle için ilk aşı takvimi nasıl olmalı?",
    author: "Hakan Öz",
    city: "Ankara",
    time: "1 gün önce",
    replies: 17,
    views: 241,
    tag: "Sağlık",
    excerpt: "Sekiz haftalık yavrumuz için veteriner önerilerinizi bekliyorum.",
    body: "Sekiz haftalık krem rengi bir poodle aldık. İç parazit, karma ve kuduz aşılarının sırasını netleştirmek istiyorum. Ankara'da güvendiğiniz bir veteriner var mı?",
    comments: [
      { id: "r3", author: "Ayşe Tekin", city: "Ankara", time: "20 sa önce", body: "Sekiz, on ve on iki haftada karma aşı, kuduz ise on ikinci haftadan sonra yapılıyor. Çankaya'da Pati Kliniği'ni öneririm." },
    ],
  },
  {
    id: "t3",
    title: "İstanbul Avrupa yakasında poodle yürüyüş grubu kuruyoruz",
    author: "Lara Şen",
    city: "Beşiktaş",
    time: "2 gün önce",
    replies: 36,
    views: 502,
    tag: "Kulüp",
    excerpt: "Her cumartesi sabahı Maçka Parkı'nda toplanıyoruz. Katılmak ister misiniz?",
    body: "Her cumartesi saat 09.30'da Maçka Parkı girişinde toy ve minyatür poodle'larla yürüyoruz. Sakin köpekler geliyor ve tasma zorunlu. Bu hafta dokuz kişi var, yeni yüzler bekleriz.",
    comments: [
      { id: "r4", author: "Ceren Demir", city: "Kadıköy", time: "1 gün önce", body: "Anadolu yakasından da gelen oluyor. Feribotla on dakikada Maçka'ya iniyoruz." },
      { id: "r5", author: "Deniz Aksoy", city: "İzmir", time: "1 gün önce", body: "İzmir'de benzer bir grup kursak çok iyi olur. Toplantı düzeninizi yazar mısınız?" },
    ],
  },
];

export const CLUBS: Club[] = [
  {
    id: "c1",
    name: "İstanbul Poodle Kulübü",
    city: "İstanbul",
    members: 842,
    cover: "/assets/poodle-portrait.jpg",
    description: "Maçka, Caddebostan ve Belgrad Ormanı buluşmaları.",
  },
  {
    id: "c2",
    name: "Ankara Küçük Irklar",
    city: "Ankara",
    members: 391,
    cover: "/assets/pomeranian-face.jpg",
    description: "Poodle, pomeranian ve yorkie sahipleri için park günleri.",
  },
  {
    id: "c3",
    name: "Ege Poodle Yürüyüşü",
    city: "İzmir",
    members: 256,
    cover: "/assets/golden-puppy.jpg",
    description: "Alsancak ve İnciraltı sahil yürüyüşleri.",
  },
];

export type FeedItem =
  | { type: "post"; post: Post }
  | { type: "forum"; topic: ForumTopic };

/** Insert a forum card after every second post so the feed scrolls through both. */
export function buildFeed(posts = POSTS, topics = FORUM_TOPICS): FeedItem[] {
  const items: FeedItem[] = [];
  let topicIndex = 0;
  posts.forEach((post, index) => {
    items.push({ type: "post", post });
    if ((index + 1) % 2 === 0 && topicIndex < topics.length) {
      items.push({ type: "forum", topic: topics[topicIndex] });
      topicIndex += 1;
    }
  });
  while (topicIndex < topics.length) {
    items.push({ type: "forum", topic: topics[topicIndex] });
    topicIndex += 1;
  }
  return items;
}

export function getForumTopic(id: string): ForumTopic | undefined {
  return FORUM_TOPICS.find((topic) => topic.id === id);
}

export function searchCommunity(query: string): { posts: Post[]; topics: ForumTopic[] } {
  const q = query.trim().toLocaleLowerCase("tr-TR");
  if (!q) return { posts: POSTS, topics: FORUM_TOPICS };
  const match = (value: string) => value.toLocaleLowerCase("tr-TR").includes(q);
  return {
    posts: POSTS.filter((p) => match(p.caption) || match(p.author) || match(p.dogName) || match(p.city)),
    topics: FORUM_TOPICS.filter((t) => match(t.title) || match(t.excerpt) || match(t.tag) || match(t.body)),
  };
}
