export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  category: string;
  readTime: string;
  date: string;
  excerpt: string;
  sections: { heading: string; content: string[] }[];
  faq?: { q: string; a: string }[];
  relatedSlugs?: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "kedi-mamasi-nasil-secilir",
    title: "Kedi Maması Nasıl Seçilir?",
    metaTitle: "Kedi Maması Nasıl Seçilir? Uzman Rehberi 2026 | JETGO Pet Shop Samsun",
    metaDescription: "Kedi maması seçerken dikkat edilmesi gerekenler. Yaş, ırk ve sağlık durumuna göre en iyi kedi maması nasıl belirlenir? Veteriner önerileri ve marka karşılaştırması.",
    keywords: "kedi maması nasıl seçilir, kedi maması seçimi, en iyi kedi maması, kedi beslenmesi, kedi maması önerisi",
    category: "Kedi Bakımı",
    readTime: "5 dk",
    date: "2026-03-15",
    excerpt: "Kediniz için doğru mamayı seçmek sağlığı için kritik öneme sahiptir. Yaşına, ırkına ve sağlık durumuna göre en uygun mamayı nasıl belirleyeceğinizi anlatıyoruz.",
    sections: [
      {
        heading: "Kedinizin Yaşına Göre Mama Seçimi",
        content: [
          "Kediler yaşam dönemlerine göre farklı beslenme ihtiyaçlarına sahiptir. Yavru kediler (0-12 ay) yüksek proteinli ve kalorik mamalara ihtiyaç duyarken, yetişkin kediler (1-7 yaş) dengeli beslenme gerektiren mamaları tercih etmelidir.",
          "7 yaş üzeri yaşlı kediler ise eklem sağlığını destekleyen, düşük fosforlu ve böbrek dostu formüllere yönelmelidir. Royal Canin, Hill's ve N&D bu yaş gruplarına özel mamalar sunmaktadır.",
          "Samsun'da JETGO Pet Shop olarak tüm yaş gruplarına uygun kedi mamalarını aynı gün kapınıza teslim ediyoruz. Yanlış mama seçimi kedinizin sindirim sorunları yaşamasına neden olabilir, bu yüzden geçiş dönemlerinde yavaş yavaş değiştirin.",
        ],
      },
      {
        heading: "Kuru Mama mı Yaş Mama mı?",
        content: [
          "Kuru mama diş sağlığını destekler ve ekonomiktir. Yaş mama ise su alımını artırır ve iştahsız kediler için idealdir. En sağlıklı beslenme her ikisinin kombinasyonudur.",
          "Kuru mama seçerken içerik listesinde ilk sırada et veya balık ürünü olmasına dikkat edin. Tahıl oranı düşük mamalar sindirim açısından daha avantajlıdır. N&D ve Profine tahılsız seçenekleriyle öne çıkar.",
          "JETGO'da hem kuru mama hem yaş mama çeşitlerimiz mevcuttur. Samsun'da aynı gün kapıya teslim ile kedinizin mamaya ihtiyacı olduğunda hemen sipariş verebilirsiniz.",
        ],
      },
      {
        heading: "Kısırlaştırılmış Kediler İçin Mama",
        content: [
          "Kısırlaştırma sonrası kedilerin metabolizması yavaşlar ve kilo alma eğilimi artar. Bu nedenle kısır kediler için özel formüle edilmiş düşük kalorili mamalar tercih edilmelidir.",
          "Royal Canin Sterilised, Hill's Sterilised Cat ve Pro Plan Sterilised bu segment için en çok tercih edilen markalardır. Bu mamalar idrar yolu sağlığını da destekler.",
          "Samsun Atakum'da kısır kedi maması arıyorsanız JETGO'dan online sipariş verin, aynı gün kapınıza getirelim. Nakit ödemede ekstra avantajlı fiyatlardan yararlanın.",
        ],
      },
      {
        heading: "Bütçeye Göre Mama Önerileri",
        content: [
          "Premium segment: Royal Canin, Hill's, N&D - En yüksek kalite, veteriner önerili markalar. Kg başı 300-600 TL.",
          "Orta segment: Pro Plan, Pronature, Profine - İyi kalite, makul fiyat. Kg başı 200-350 TL.",
          "Ekonomik premium: Reflex Plus, Pro Performance - Büyük paketlerde tasarruf. Kg başı 120-200 TL.",
        ],
      },
    ],
    faq: [
      { q: "Kedi maması ne sıklıkla değiştirilmeli?", a: "Mama değişikliği 7-10 gün içinde kademeli olarak yapılmalıdır. Eski ve yeni mamayı karıştırarak geçiş yapın." },
      { q: "Kedim mamayı yemiyorsa ne yapmalıyım?", a: "Yaş mama ile karıştırmayı deneyin veya mamayı hafifçe ısıtın. Sürekli iştahsızlık durumunda veteriner kontrolü önerilir." },
      { q: "Samsun'da kedi maması aynı gün gelir mi?", a: "Evet, JETGO ile saat 17:00'ye kadar verilen siparişler aynı gün teslim edilir." },
    ],
    relatedSlugs: ["kopek-mamasi-secim-rehberi", "kedi-kumu-secim-rehberi", "evcil-hayvan-beslenme-hatalari"],
  },
  {
    slug: "kopek-mamasi-secim-rehberi",
    title: "Köpek Maması Seçim Rehberi",
    metaTitle: "Köpek Maması Nasıl Seçilir? Irka Göre Mama Rehberi 2026 | JETGO Samsun",
    metaDescription: "Köpek maması seçimi: Küçük, orta ve büyük ırk köpekler için en iyi mama markaları. Yavru ve yetişkin köpek beslenme rehberi. Samsun kapıya teslim.",
    keywords: "köpek maması seçimi, köpek maması nasıl seçilir, ırka göre köpek maması, yavru köpek maması, büyük ırk köpek maması",
    category: "Köpek Bakımı",
    readTime: "6 dk",
    date: "2026-03-10",
    excerpt: "Köpeğinizin ırkına, yaşına ve boyutuna göre en uygun mamayı seçmek için bilmeniz gereken her şey bu rehberde.",
    sections: [
      {
        heading: "Irka Göre Mama Seçimi",
        content: [
          "Köpek ırkları arasındaki fiziksel farklılıklar beslenme ihtiyaçlarını doğrudan etkiler. Küçük ırk köpekler (Chihuahua, Yorkshire, Pomeranian) yüksek enerjili, küçük granüllü mamalara ihtiyaç duyar.",
          "Orta ırk köpekler (Beagle, Cocker, Border Collie) dengeli protein ve yağ oranına sahip mamalardan fayda görür. Royal Canin Medium ve Hill's Medium Breed bu segment için idealdir.",
          "Büyük ırk köpekler (Golden Retriever, Alman Çobanı, Labrador) eklem sağlığını destekleyen glukozamin ve kondroitin içeren mamalara yönelmelidir. Royal Canin Maxi ve N&D büyük ırk formülleri öne çıkar.",
        ],
      },
      {
        heading: "Yavru Köpek Beslenmesi",
        content: [
          "Yavru köpekler ilk 12-18 ayda çok hızlı büyür ve bu dönemde yüksek proteinli puppy mamalarına ihtiyaç duyarlar. Erken dönemde kaliteli beslenme, köpeğinizin yaşam boyu sağlığını belirler.",
          "Küçük ırk yavru köpekler 10 aylıkken yetişkin mamasına geçebilirken, büyük ırk köpekler 15-18 aya kadar yavru maması kullanmalıdır.",
          "JETGO'da Royal Canin Puppy, Hill's Puppy ve Pro Plan Puppy gibi güvenilir marka yavru köpek mamaları mevcuttur. Samsun'da aynı gün kapıya teslim.",
        ],
      },
      {
        heading: "Hassas Sindirimli Köpekler İçin",
        content: [
          "Bazı köpekler besin alerjisi veya hassas sindirim sistemi nedeniyle özel mamalara ihtiyaç duyar. Hill's Sensitive Stomach, Royal Canin Digestive Care ve N&D Quinoa Digestion bu durumlar için formüle edilmiştir.",
          "Glutensiz ve hipoalerjenik mamalar (Profine, N&D) cilt problemleri yaşayan köpekler için idealdir. Tek protein kaynağı içeren mamalar alerji tespiti için kullanılabilir.",
          "Samsun'da hassas sindirimli köpek maması arıyorsanız JETGO'da geniş bir seçenek yelpazesi bulabilirsiniz. Veterinerinize danışarak en uygun mamayı belirleyin.",
        ],
      },
    ],
    faq: [
      { q: "Köpek maması ne kadar verilmeli?", a: "Paket üzerindeki gramaj tablosunu takip edin. Genel olarak yetişkin köpekler günde 2 öğün, yavru köpekler 3-4 öğün beslenmelidir." },
      { q: "Köpek mamasında tahıl zararlı mı?", a: "Tahıl alerjisi olmayan köpekler için zararlı değildir. Ancak tahılsız mamalar genellikle daha yüksek et oranı sunar." },
    ],
    relatedSlugs: ["kedi-mamasi-nasil-secilir", "evcil-hayvan-beslenme-hatalari"],
  },
  {
    slug: "kedi-kumu-secim-rehberi",
    title: "Kedi Kumu Seçim Rehberi",
    metaTitle: "Kedi Kumu Nasıl Seçilir? Bentonit vs Silika Karşılaştırma | JETGO Samsun",
    metaDescription: "Kedi kumu seçimi rehberi. Bentonit mi silika mı? Topaklanan kedi kumu avantajları. Koku kontrolü, temizlik kolaylığı. Samsun kapıya teslim.",
    keywords: "kedi kumu seçimi, kedi kumu nasıl seçilir, bentonit kedi kumu, silika kedi kumu, topaklanan kedi kumu",
    category: "Kedi Bakımı",
    readTime: "4 dk",
    date: "2026-03-05",
    excerpt: "Doğru kedi kumunu seçmek hem kedinizin konforunu hem de ev hijyeninizi doğrudan etkiler. Bu rehberde kum türlerini karşılaştırıyoruz.",
    sections: [
      {
        heading: "Kedi Kumu Türleri",
        content: [
          "Bentonit Kum: En yaygın kullanılan kedi kumu türüdür. Suyu emerek topaklanır, bu sayede günlük temizlik kolaylaşır. Van Cat, Biokat's ve Sanicat en popüler bentonit markalarıdır.",
          "Silika (Kristal) Kum: Suyu emerek buharlaştırır, topaklama yapmaz. Daha uzun ömürlüdür ancak maliyeti daha yüksektir. Tek kedi haneleri için uygundur.",
          "Doğal/Organik Kum: Mısır, buğday veya odun bazlı kumlar çevre dostu alternatiflerdir. Tuvalete atılabilir özellikleri avantaj sağlar.",
        ],
      },
      {
        heading: "Aktif Karbonlu Kumların Avantajı",
        content: [
          "Aktif karbonlu kedi kumları kötü kokuları emer ve nötralize eder. Özellikle apartman dairelerinde yaşayan kedi sahipleri için vazgeçilmezdir.",
          "Van Cat Aktif Karbonlu İnce Taneli bentonit kum, Türkiye'de en çok satılan kedi kumlarından biridir. Güçlü topaklanma ve koku kontrolü sunar.",
          "Biokat's Bianco Fresh ise mandalina aromalı premium bir seçenektir. Almanya üretimi olup üstün koku kontrolü sağlar. JETGO'da her iki markayı da bulabilirsiniz.",
        ],
      },
      {
        heading: "Kedi Kumu Bakım İpuçları",
        content: [
          "Topakları günlük olarak temizleyin ve haftada bir tüm kumu alt üst edin. 2-3 haftada bir kumu tamamen değiştirin ve tuvalet kabını sabunlu suyla yıkayın.",
          "Kum seviyesi her zaman 7-10 cm olmalıdır. Çok az kum kedinizin kazmasını zorlaştırır, çok fazla kum ise dağılma sorununa yol açar.",
          "JETGO ile düzenli kedi kumu siparişi verin, 10-20 kg ağırlığındaki kum çuvallarını taşıma derdinden kurtulun. Samsun'da aynı gün kapıya teslim.",
        ],
      },
    ],
    faq: [
      { q: "Kedi kumu ne sıklıkla değiştirilmeli?", a: "Topaklanan kumlar günlük temizlikle 2-3 haftada bir, kristal kumlar ayda bir tamamen değiştirilmelidir." },
      { q: "Aromalı kedi kumu kediler için zararlı mı?", a: "Kaliteli markaların aromalı kumları kediler için güvenlidir. Ancak bazı hassas kediler koku içermeyen kumları tercih edebilir." },
    ],
    relatedSlugs: ["kedi-mamasi-nasil-secilir", "kedi-bakim-ipuclari"],
  },
  {
    slug: "evcil-hayvan-beslenme-hatalari",
    title: "Evcil Hayvan Beslenmesinde Yapılan 10 Hata",
    metaTitle: "Evcil Hayvan Beslenmesinde 10 Kritik Hata | JETGO Samsun Pet Shop",
    metaDescription: "Kedi ve köpek beslenmesinde en sık yapılan hatalar. Yanlış mama seçimi, aşırı besleme, sofra artığı verme ve daha fazlası. Uzman önerileri.",
    keywords: "evcil hayvan beslenme hataları, kedi besleme hataları, köpek besleme yanlışları, doğru evcil hayvan beslenmesi",
    category: "Genel Bakım",
    readTime: "5 dk",
    date: "2026-02-28",
    excerpt: "Evcil hayvan sahiplerinin beslenmede sıkça yaptığı hatalar ve bunlardan nasıl kaçınılacağı hakkında kapsamlı bir rehber.",
    sections: [
      {
        heading: "En Sık Yapılan Beslenme Hataları",
        content: [
          "1. Sofra artığı vermek: İnsan yiyecekleri evcil hayvanlar için zararlı olabilir. Soğan, sarımsak, çikolata ve üzüm kediler ve köpekler için toksiktir.",
          "2. Aşırı beslemek: Obezite evcil hayvanlarda en yaygın sağlık sorunlarından biridir. Paket üzerindeki gramaj önerilerine uyun ve düzenli tartın.",
          "3. Süt vermek: Yetişkin kedilerin çoğu laktoz intoleranslıdır. Süt yerine taze su sağlayın.",
          "4. Tek tip mama: Uzun süre aynı mamayı vermek beslenme eksikliğine neden olabilir. Kuru ve yaş mamayı karıştırın.",
          "5. Ucuz mama tercih etmek: Düşük kaliteli mamalar kısa vadede ucuz görünse de uzun vadede veteriner masraflarına yol açabilir.",
        ],
      },
      {
        heading: "Doğru Beslenme Alışkanlıkları",
        content: [
          "6. Su kabını temiz tutun ve günde en az bir kez yenileyin. Kediler akan suyu tercih eder, çeşme tipi su kabı düşünebilirsiniz.",
          "7. Mama değişikliğini kademeli yapın. 7-10 gün boyunca eski ve yeni mamayı karıştırarak geçiş yapın.",
          "8. Yaşa uygun mama seçin. Yavru, yetişkin ve yaşlı hayvanların beslenme ihtiyaçları farklıdır.",
          "9. Ödül mamalarını günlük kalori hesabına dahil edin. Ödüller toplam kalorinin %10'unu geçmemelidir.",
          "10. Veterinerle düzenli beslenme kontrolü yapın. Özellikle kilo değişimleri ve sindirim sorunlarında profesyonel destek alın.",
        ],
      },
    ],
    faq: [
      { q: "Kedime çiğ et verebilir miyim?", a: "Çiğ et parazit riski taşır. Pişmiş tavuk veya balık daha güvenlidir, ancak asıl beslenme kaliteli kedi mamasıyla sağlanmalıdır." },
      { q: "Köpeğime kemik verebilir miyim?", a: "Pişmiş kemikler tehlikelidir, kırılarak sindirim kanalını yaralayabilir. Bunun yerine özel tasarlanmış ödül kemikleri tercih edin." },
    ],
    relatedSlugs: ["kedi-mamasi-nasil-secilir", "kopek-mamasi-secim-rehberi"],
  },
  {
    slug: "kedi-bakim-ipuclari",
    title: "Yeni Başlayanlar İçin Kedi Bakım Rehberi",
    metaTitle: "Kedi Bakımı Rehberi - Yeni Kedi Sahipleri İçin | JETGO Samsun Pet Shop",
    metaDescription: "Kedi bakımı için bilmeniz gereken her şey. Beslenme, tuvalet eğitimi, oyun, sağlık kontrolleri ve temel bakım ipuçları. Samsun JETGO Pet Shop.",
    keywords: "kedi bakımı, kedi bakım rehberi, yeni kedi sahipleri, kedi beslenme, kedi tuvalet eğitimi",
    category: "Kedi Bakımı",
    readTime: "7 dk",
    date: "2026-03-20",
    excerpt: "İlk kez kedi mi sahiplendiniz? Beslenme, tuvalet, oyun ve sağlık konularında bilmeniz gereken temel bilgileri bu rehberde bulabilirsiniz.",
    sections: [
      {
        heading: "Beslenme Temelleri",
        content: [
          "Kedinize yaşına uygun kaliteli bir mama seçin. Yavru kediler (0-12 ay) yüksek proteinli kitten mamalarıyla beslenmelidir. Yetişkin kediler dengeli bir diyete ihtiyaç duyar.",
          "Taze su her zaman ulaşılabilir olmalıdır. Kediler genellikle yemeklerinden uzakta duran su kaplarını tercih eder. Günde 2-3 öğün düzenli beslenme idealdir.",
          "JETGO'da kedinizin yaşına ve ihtiyacına uygun mama çeşitlerini bulabilirsiniz. Samsun'da aynı gün kapıya teslim.",
        ],
      },
      {
        heading: "Tuvalet Eğitimi ve Kum Seçimi",
        content: [
          "Kediler doğal olarak kumda tuvalet yapmayı tercih eder. Kapalı veya açık tuvalet kabı arasında kedinizin tercihini gözlemleyin.",
          "Kum seviyesini 7-10 cm tutun ve günlük olarak topakları temizleyin. Kum kabını sessiz ve erişilebilir bir yere koyun, yemek kabından uzak tutun.",
          "Topaklanan bentonit kumlar temizlik kolaylığı sağlar. Aktif karbonlu seçenekler koku kontrolü için idealdir. JETGO'da tüm kedi kumu markalarını bulabilirsiniz.",
        ],
      },
      {
        heading: "Sağlık ve Veteriner Kontrolü",
        content: [
          "Yılda en az bir kez veteriner kontrolü yaptırın. Aşı takvimini düzenli takip edin. İç ve dış parazit tedavisi mevsimsel olarak uygulanmalıdır.",
          "Diş sağlığı için dental mamalar veya diş bakım ürünleri kullanabilirsiniz. Tırnak bakımı için tırnak makası edinmenizi öneririz.",
          "Kısırlaştırma 6-8 aylıkken yapılabilir. Kısırlaştırma sonrası özel formüllü mamaya geçiş yapın. JETGO'da kısır kedi mamaları mevcuttur.",
        ],
      },
    ],
    faq: [
      { q: "Kedimin ne kadar yemesi gerekir?", a: "Yaşa ve kiloya göre değişir. Paket üzerindeki gramaj tablosunu takip edin. Yetişkin bir kedi günde yaklaşık 200-300 kalori almalıdır." },
      { q: "Kedi ne sıklıkla veterinere götürülmeli?", a: "Sağlıklı yetişkin kediler yılda en az bir kez, yaşlı kediler 6 ayda bir kontrole götürülmelidir." },
    ],
    relatedSlugs: ["kedi-mamasi-nasil-secilir", "kedi-kumu-secim-rehberi"],
  },
  {
    slug: "samsun-evcil-hayvan-gezilecek-yerler",
    title: "Samsun'da Evcil Hayvanla Gezilecek Yerler",
    metaTitle: "Samsun'da Evcil Hayvanla Gezilecek 10 Yer | JETGO Pet Shop",
    metaDescription: "Samsun'da köpeğinizle gezebileceğiniz parklar, sahiller ve doğa alanları. Atakum sahili, Amisos Tepesi, Batı Park ve daha fazlası.",
    keywords: "samsun evcil hayvan gezdirme, samsun köpek parkı, samsun evcil hayvan dostu mekanlar, atakum köpek gezdirme",
    category: "Samsun Rehber",
    readTime: "4 dk",
    date: "2026-03-01",
    excerpt: "Samsun'da evcil hayvanınızla vakit geçirebileceğiniz en güzel parklar, sahiller ve doğa yürüyüş rotaları.",
    sections: [
      {
        heading: "Sahil Yürüyüşleri",
        content: [
          "Atakum Sahili: Samsun'un en uzun sahil şeridi, köpeğinizle yürüyüş yapmak için idealdir. Sabah erken saatlerde veya akşam üstü ziyaret etmenizi öneririz.",
          "Güzelyalı Sahil Parkı: Geniş yürüyüş yolları ve oturma alanları ile evcil hayvanınızla rahat vakit geçirebilirsiniz. Çeşme noktaları mevcuttur.",
          "Altınkum Plajı: Yaz aylarında köpeğinizle denize girebileceğiniz alanlar bulunmaktadır. Erken saatleri tercih edin.",
        ],
      },
      {
        heading: "Parklar ve Yeşil Alanlar",
        content: [
          "Batı Park (Atakum): Geniş çim alanları ve ağaçlıklı yürüyüş parkurları ile köpek gezdirmek için en popüler parklardan biri.",
          "Amisos Tepesi: Şehir manzarası eşliğinde yürüyüş yapabileceğiniz tarihi alan. Merdiven çıkışları köpekler için iyi bir egzersiz fırsatı sunar.",
          "Mert Irmağı Parkı: Doğa içinde yürüyüş rotaları ve piknik alanları ile evcil hayvanınızla gün boyu vakit geçirebilirsiniz.",
        ],
      },
      {
        heading: "Gezi Öncesi Hazırlık",
        content: [
          "Gezi çantanızda mutlaka su kabı, poşet, ödül maması ve tasma bulundurun. JETGO'dan taşınabilir su kabı ve ödül maması sipariş edebilirsiniz.",
          "Sıcak havalarda asfalt üzerinde yürümekten kaçının, pati yanıklarına neden olabilir. Gölgeli rotaları tercih edin ve bol su içirin.",
          "Veteriner aşı kartınızı yanınızda bulundurun. Dış parazit (pire, kene) tedavisini güncel tutun, özellikle doğa yürüyüşlerinde.",
        ],
      },
    ],
    relatedSlugs: ["kedi-bakim-ipuclari", "evcil-hayvan-beslenme-hatalari"],
  },
];

export const BLOG_CATEGORIES = [
  { name: "Tümü", slug: "tumu" },
  { name: "Kedi Bakımı", slug: "kedi-bakimi" },
  { name: "Köpek Bakımı", slug: "kopek-bakimi" },
  { name: "Genel Bakım", slug: "genel-bakim" },
  { name: "Samsun Rehber", slug: "samsun-rehber" },
];
