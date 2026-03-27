import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, AlertTriangle, Heart, BookOpen, Dog, Cat, Bird, Leaf } from "lucide-react";
import { useLocation } from "wouter";

const CATEGORIES = [
  { id: "all", label: "Tümü" },
  { id: "local", label: "Samsun Yerel" },
  { id: "poison", label: "Zehirli Maddeler" },
  { id: "beginner", label: "Yeni Başlayanlar" },
  { id: "care", label: "Bakım" },
];

interface Article {
  id: string;
  category: string;
  title: string;
  emoji: string;
  summary: string;
  content: string[];
  tips?: string[];
}

const ARTICLES: Article[] = [
  {
    id: "samsun-nemli-hava-tuy-bakimi",
    category: "local",
    title: "Samsun'un Nemli Havasında Tüy Bakımı Nasıl Olmalı?",
    emoji: "🌧️",
    summary: "Karadeniz iklimine özel pet bakım rehberi",
    content: [
      "Samsun'un yüksek nem oranı, evcil hayvanlarınızın tüy sağlığını doğrudan etkiler. Özellikle uzun tüylü kediler ve çift katlı tüy yapısına sahip köpekler, nemli ortamda mantar ve cilt enfeksiyonlarına karşı daha savunmasızdır.",
      "Tüy bakımında dikkat edilmesi gerekenler:",
      "• Haftada en az 2-3 kez fırçalama yapın. Nem nedeniyle tüyler daha çabuk keçeleşir.",
      "• Banyo sonrası mutlaka kurutma makinesiyle (düşük ısıda) tüyleri tamamen kurutun. Nemli tüyler mantar üremesine neden olur.",
      "• Kış aylarında evdeki kalorifer çok sıcak tutuluyorsa, tüy dökülmesi artar. Oda nemlendiricisi kullanın.",
      "• Yaz aylarında Atakum sahilinde yürüyüş sonrası patileri tatlı suyla yıkayın — tuzlu su cilt kuruluğuna yol açar.",
      "• Bahar aylarında (Mart-Mayıs) tüy dökme sezonu yoğun olur. Bu dönemde omega-3 takviyesi verin.",
    ],
    tips: ["Samsun'da veterinerinize 3 ayda bir tüy ve cilt kontrolü yaptırın.", "Nemli günlerde pet yatağını sık değiştirin."],
  },
  {
    id: "zehirli-bitkiler-rehberi",
    category: "poison",
    title: "Evde Tehlikeli Bitkiler ve Gıdalar Rehberi",
    emoji: "☠️",
    summary: "Evcil hayvanınız için hayati tehlike oluşturan maddelerin tam listesi",
    content: [
      "Evcil hayvanlarımızın merak duygusu bazen tehlikeli olabilir. İşte evde ve bahçede mutlaka uzak tutmanız gereken bitkiler ve gıdalar:",
      "🌿 ZEHİRLİ BİTKİLER:",
      "• Zambak (özellikle kediler için ölümcül — polen bile böbrek yetmezliğine yol açabilir)",
      "• Difenbahya (ağız ve boğazda şişmeye neden olur)",
      "• Aloevera (mide-bağırsak sorunları)",
      "• Açelyalar / Ormangülü (kalp yetmezliği riski)",
      "• Sarmaşık (kusma, ishal, karın ağrısı)",
      "• Filodendron (ağız yanması, yutma güçlüğü)",
      "• Lale ve Nergis soğanları (ciddi kusma)",
      "",
      "🍫 ZEHİRLİ GIDALAR:",
      "• Çikolata (teobromin — özellikle bitter çikolata tehlikeli)",
      "• Soğan ve Sarımsak (kırmızı kan hücreleri tahrip eder)",
      "• Üzüm ve Kuru Üzüm (böbrek yetmezliği)",
      "• Avokado (persin toksini — kuşlar için ölümcül)",
      "• Ksilitol (şekersiz sakız — köpeklerde kan şekerini aniden düşürür)",
      "• Kafein (çay, kahve — kalp çarpıntısı)",
      "• Makadamya fındığı (köpeklerde kas güçsüzlüğü)",
      "• Çiğ hamur/maya (mide genişlemesi)",
    ],
    tips: ["Zehirlenme şüphesinde hemen veterinere gidin.", "Acil durumda: 0362 büyükşehir veteriner hattını arayın."],
  },
  {
    id: "ilk-kez-kedi-sahiplendim",
    category: "beginner",
    title: "İlk Kez Kedi Sahiplendim — Ne Almalıyım?",
    emoji: "🐱",
    summary: "Yeni kedi sahipleri için eksiksiz başlangıç rehberi ve alışveriş listesi",
    content: [
      "Tebrikler! Yeni bir patili aile üyeniz var. İlk hafta için ihtiyacınız olan her şeyi listeledik:",
      "",
      "📦 TEMEL İHTİYAÇLAR:",
      "1. Kedi Kumu (Bentonit veya silika — günde 1x kontrol edin)",
      "2. Kedi Tuvaleti (Kapalı model koku için daha iyi)",
      "3. Mama Kabı (Çelik veya seramik — plastikten kaçının)",
      "4. Su Kabı veya Çeşmesi (Kediler akan suyu tercih eder)",
      "5. Tırmalama Tahtası (Mobilyalarınızı kurtarır!)",
      "6. Taşıma Çantası (Veteriner ziyaretleri için şart)",
      "",
      "🍽️ BESLENME:",
      "• Yavru kedi (0-12 ay): Yavru kedi maması (Kitten) — günde 3-4 öğün",
      "• Yetişkin kedi (1-7 yaş): Yetişkin mama — günde 2 öğün",
      "• Yaşlı kedi (7+ yaş): Senior mama — günde 2 öğün, porsiyon kontrolü",
      "• Kuru ve yaş mama karışımı ideal: %80 kuru + %20 yaş mama",
      "",
      "🏥 İLK HAFTA YAPILACAKLAR:",
      "• Veteriner kontrolü (parazit ve genel sağlık)",
      "• İç-dış parazit uygulaması",
      "• Aşı takvimini öğrenin (Karma + Kuduz)",
      "• Evdeki tehlikeli eşyaları kaldırın (ip, lastik, küçük oyuncaklar)",
    ],
    tips: [
      "İlk 3 gün kediyi sakin bırakın — yeni ortama alışması zaman alır.",
      "JETGO'dan 'Yeni Başlayan Kedi Paketi' sipariş edebilirsiniz!",
    ],
  },
  {
    id: "ilk-kez-kopek-sahiplendim",
    category: "beginner",
    title: "İlk Kez Köpek Sahiplendim — Ne Almalıyım?",
    emoji: "🐶",
    summary: "Yeni köpek sahipleri için eksiksiz başlangıç rehberi",
    content: [
      "Köpek sahiplendiniz, harika! İlk günleriniz için hazırladığımız rehber:",
      "",
      "📦 TEMEL İHTİYAÇLAR:",
      "1. Mama ve Su Kabı (Boyutuna uygun, kaymaz tabanlı)",
      "2. Tasma ve Gögüs Kayışı (Yavru için harness önerilir)",
      "3. Yatak veya Kulübe (Kendi alanı olsun)",
      "4. Tuvalet Pedi (Yavru eğitimi için — çim kokulu tercih edin)",
      "5. Oyuncaklar (Çiğneme oyuncakları diş sağlığı için önemli)",
      "6. Tarak ve Fırça (Tüy tipine uygun)",
      "",
      "🍽️ BESLENME:",
      "• Yavru köpek (0-12 ay): Puppy mama — günde 3-4 öğün",
      "• Yetişkin köpek (1-7 yaş): Adult mama — günde 2 öğün",
      "• Büyük ırk vs küçük ırk mama farkına dikkat edin",
      "• Kemik ve ödül mamaları eğitimde çok işe yarar",
      "",
      "🎓 İLK HAFTA EĞİTİMİ:",
      "• İsim eğitimi: İsmini söylerken ödül verin",
      "• Tuvalet eğitimi: Yemekten 15-20 dk sonra dışarı çıkarın",
      "• 'Otur' komutu: En temel ve en kolay komut",
      "• Sabrınızı kaybetmeyin — yavru köpekler 4-6 ayda öğrenir",
    ],
    tips: [
      "Samsun'da köpek gezdirme parkları: Atatürk Parkı, Batıpark, Sahil Yürüyüş Yolu",
      "Yavru köpeğinizi 2 aylıkken aşılamaya başlayın.",
    ],
  },
  {
    id: "samsun-pet-dostlari-mekanlar",
    category: "local",
    title: "Samsun'da Pet Dostu Mekanlar ve Yürüyüş Rotaları",
    emoji: "🏖️",
    summary: "Evcil hayvanınızla gidebileceğiniz Samsun lokasyonları",
    content: [
      "Samsun'da evcil hayvanınızla vakit geçirebileceğiniz en iyi yerler:",
      "",
      "🌊 YÜRÜYÜŞ ROTALARI:",
      "• Atakum Sahil Bandı: 7 km'lik düz yürüyüş. Sabah erken saatlerde ideal.",
      "• Batıpark: Geniş yeşil alan. Köpek gezdirmeye uygun.",
      "• Atatürk Parkı: Şehir merkezinde, kısa yürüyüşler için.",
      "• Amisos Tepesi: Manzaralı yürüyüş. Dikkat: Dik yokuş!",
      "• Kurugöl Tabiat Parkı: Hafta sonu piknik + yürüyüş.",
      "",
      "☀️ MEVSİMSEL ÖNERİLER:",
      "• Yaz: Sıcak asfaltta pati yanığına dikkat. Sabah 07-09 veya akşam 18-20 arası gezdirin.",
      "• Kış: Samsun'da don nadir ama yağmur çok. Su geçirmez köpek montu düşünün.",
      "• Bahar: Kene sezonu! Çimenlik alanlarda mutlaka kene kontrolü yapın.",
    ],
    tips: ["Her yürüyüşte yanınızda su ve kese bulundurun.", "Samsun Büyükşehir hayvan barınağından sahiplendirme yapabilirsiniz."],
  },
  {
    id: "kedi-kopek-dis-bakimi",
    category: "care",
    title: "Kedi ve Köpeklerde Diş Bakımı",
    emoji: "🦷",
    summary: "Evcil hayvanınızın ağız sağlığını korumak için bilmeniz gerekenler",
    content: [
      "Evcil hayvanların %80'inde 3 yaşından sonra diş eti hastalığı görülür. Düzenli ağız bakımı hem sağlık hem de mama yeme sorunlarını önler.",
      "",
      "🐱 KEDİLERDE:",
      "• Haftalık diş kontrolü: Diş etleri pembeyse sağlıklı, kırmızı/şiş ise sorun var.",
      "• Diş temizleme çubukları veya dental mama kullanın.",
      "• Ağız kokusu varsa mutlaka veterinere götürün.",
      "",
      "🐶 KÖPEKLERDE:",
      "• Çiğneme oyuncakları doğal diş temizliği sağlar.",
      "• Haftalık evcil hayvan diş macunu ile fırçalama ideal.",
      "• İnsan diş macunu KESİNLİKLE KULLANMAYIN (florür zehirlenmesi).",
      "• Dental kemikler hem ödül hem diş bakımı.",
    ],
    tips: ["Yılda 1 kez veterinerde profesyonel diş temizliği yaptırın."],
  },
];

export default function PatiBlogPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const filteredArticles = activeCategory === "all"
    ? ARTICLES
    : ARTICLES.filter(a => a.category === activeCategory);

  return (
    <div className="max-w-lg mx-auto px-4 py-4 pb-28 space-y-4">
      <div className="text-center">
        <h1 className="text-xl font-bold" data-testid="text-pati-blog-title">📚 Pati-Blog & Bilgi Bankası</h1>
        <p className="text-sm text-muted-foreground mt-1">Samsun'un yerel pet uzmanlarından tavsiyeler</p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setActiveCategory(c.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === c.id ? "text-white" : "bg-muted/60 text-muted-foreground"}`} style={activeCategory === c.id ? { backgroundColor: "#6B3480" } : {}} data-testid={`btn-cat-${c.id}`}>{c.label}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredArticles.map(article => {
          const isExpanded = expandedArticle === article.id;
          return (
            <Card key={article.id} className="overflow-hidden" data-testid={`article-${article.id}`}>
              <button onClick={() => setExpandedArticle(isExpanded ? null : article.id)} className="w-full text-left p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{article.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm leading-tight">{article.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{article.summary}</p>
                    <Badge variant="secondary" className="mt-1.5 text-[10px]">{CATEGORIES.find(c => c.id === article.category)?.label}</Badge>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                </div>
              </button>
              {isExpanded && (
                <CardContent className="px-4 pb-4 pt-0 border-t">
                  <div className="space-y-2 mt-3">
                    {article.content.map((line, i) => (
                      <p key={i} className={`text-sm ${line.startsWith("•") ? "pl-4" : line.match(/^[🌿🍫📦🍽️🏥🎓🐱🐶🌊☀️]/) ? "font-semibold mt-2" : ""} ${line === "" ? "h-2" : ""}`}>{line}</p>
                    ))}
                    {article.tips && article.tips.length > 0 && (
                      <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                        <p className="text-xs font-semibold text-purple-700 mb-1">💡 Uzman İpuçları:</p>
                        {article.tips.map((tip, i) => (
                          <p key={i} className="text-xs text-purple-600 mt-0.5">• {tip}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-[#6B3480] to-[#9B59B6] text-white">
        <CardContent className="p-4 text-center">
          <p className="text-lg mb-1">🤖 Daha fazla soru mu var?</p>
          <p className="text-xs opacity-90 mb-3">Yapay zeka pet asistanımıza sorun!</p>
          <Button variant="secondary" size="sm" onClick={() => navigate("/")} data-testid="btn-ai-chat">Ana Sayfada Soru Sor</Button>
        </CardContent>
      </Card>
    </div>
  );
}
