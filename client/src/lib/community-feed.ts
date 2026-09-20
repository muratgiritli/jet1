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
    time: "12 dk",
    image: "/assets/poodle-portrait.jpg",
    avatar: "/assets/poodle-face.jpg",
    likes: 248,
    comments: 31,
    caption: "Pamuk bugün kuaförden çıktı. Toy poodle tüyünün bu hali için sabah 40 dakika fırçaladık.",
  },
  {
    id: "p2",
    author: "Deniz Aksoy",
    dogName: "Leo",
    city: "İzmir",
    time: "38 dk",
    image: "/assets/golden-puppy.jpg",
    avatar: "/assets/golden-face.jpg",
    likes: 412,
    comments: 54,
    caption: "İlk park gezisi! Dalı bırakmadı. Yavru poodle ve golden sahipleri için Alsancak’ta yürüyüş var yarın.",
  },
  {
    id: "p3",
    author: "Ayşe Tekin",
    dogName: "Muffin",
    city: "Ankara",
    time: "1 sa",
    image: "/assets/pomeranian-portrait.jpg",
    avatar: "/assets/pomeranian-face.jpg",
    likes: 189,
    comments: 22,
    caption: "Küçük ırk kahvaltısı: yoğurt + havuç. Muffin poodle arkadaşlarıyla Çankaya’da oyun grubu arıyor.",
  },
  {
    id: "p4",
    author: "Burak Yılmaz",
    dogName: "Tarçın",
    city: "Bursa",
    time: "2 sa",
    image: "/assets/cocker-portrait.jpg",
    avatar: "/assets/cocker-face.jpg",
    likes: 156,
    comments: 18,
    caption: "Kulak bakımı günü. Poodle ve cocker sahipleri, nemli havada kulak kontrolünü ihmal etmeyin.",
  },
  {
    id: "p5",
    author: "Selin Mutlu",
    dogName: "Coco",
    city: "Antalya",
    time: "4 sa",
    image: "/assets/pug-portrait.jpg",
    avatar: "/assets/pug-face.jpg",
    likes: 301,
    comments: 41,
    caption: "Yaz sıcağında kısa yürüyüş, bol su. Poodle’lar da öğlen sıcakta evde kalmalı.",
  },
  {
    id: "p6",
    author: "Mert Şahin",
    dogName: "Mini",
    city: "Eskişehir",
    time: "6 sa",
    image: "/assets/terrier-portrait.jpg",
    avatar: "/assets/terrier-face.jpg",
    likes: 97,
    comments: 12,
    caption: "İlk tırnak kesimi geride kaldı. Mini çok sakin durdu, ödül maması şart.",
  },
  {
    id: "p7",
    author: "Ceren Demir",
    dogName: "Lila",
    city: "Kadıköy",
    time: "Dün",
    image: "/assets/golden-head.jpg",
    avatar: "/assets/golden-head.jpg",
    likes: 528,
    comments: 67,
    caption: "Moda sahilinde poodle kahvesi. Lila yeni arkadaşlar edindi, pazar 10:00’da yine oradayız.",
  },
];

export const FORUM_TOPICS: ForumTopic[] = [
  {
    id: "t1",
    title: "Toy poodle tüy bakımı: tarak mı, fırça mı?",
    author: "Zeynep Arslan",
    city: "İstanbul",
    time: "3 sa",
    replies: 24,
    views: 318,
    tag: "Bakım",
    excerpt: "Günlük tarama rutininizi paylaşır mısınız? Pamuk’un tüyleri düğümleniyor.",
    body: "Merhaba, 11 aylık toy poodle’ım Pamuk var. Her sabah tarıyorum ama kulak arkası ve koltuk altı yine düğümleniyor. Siz metal tarak mı yoksa pin fırça mı kullanıyorsunuz? Kuaför aralığınız kaç hafta?",
    comments: [
      { id: "r1", author: "Elif Kaya", city: "İstanbul", time: "2 sa", body: "Ben pin fırça + seyrek dişli tarak kullanıyorum. Düğüm yerlerine önce sprey, sonra tarak." },
      { id: "r2", author: "Onur Bilgin", city: "Samsun", time: "1 sa", body: "4 haftada bir kuaför yeterli oluyor. Evde her gün 10 dakika tarama şart." },
    ],
  },
  {
    id: "t2",
    title: "Yavru poodle ilk aşı takvimi",
    author: "Hakan Öz",
    city: "Ankara",
    time: "Dün",
    replies: 17,
    views: 241,
    tag: "Sağlık",
    excerpt: "8 haftalık yavru için veteriner önerilerinizi bekliyorum.",
    body: "8 haftalık cream poodle aldık. İç parazit, karma ve kuduz sırasını netleştirmek istiyorum. Ankara’da güvendiğiniz bir veteriner var mı?",
    comments: [
      { id: "r3", author: "Ayşe Tekin", city: "Ankara", time: "20 sa", body: "8-10-12 hafta karma, kuduz 12. haftadan sonra. Çankaya’da Pati Klinği’ni öneririm." },
    ],
  },
  {
    id: "t3",
    title: "İstanbul Avrupa yakası poodle yürüyüş grubu",
    author: "Lara Şen",
    city: "Beşiktaş",
    time: "2 gün",
    replies: 36,
    views: 502,
    tag: "Kulüp",
    excerpt: "Cumartesi sabahları Maçka Parkı’nda toplanıyoruz. Katılmak isteyen var mı?",
    body: "Her cumartesi 09:30 Maçka Parkı girişinde toy ve miniature poodle’larla yürüyoruz. Sakin köpekler, tasma zorunlu. Bu hafta 9 kişi var, yeni yüzler bekleriz.",
    comments: [
      { id: "r4", author: "Ceren Demir", city: "Kadıköy", time: "1 gün", body: "Anadolu yakasından da gelen oluyor. Feribotla 10 dakikada Maçka’ya iniyoruz." },
      { id: "r5", author: "Deniz Aksoy", city: "İzmir", time: "1 gün", body: "İzmir’de benzer bir grup kursak çok iyi olur. Formatı yazar mısınız?" },
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
