import { Link } from "wouter";
import { Phone, Mail, MapPin, ChevronDown, ChevronUp, ShoppingCart, Truck, CreditCard, Search, UserPlus, Heart, ClipboardList, Building2, Clock, Navigation, Store } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useState } from "react";
import SEO, { SITE_DOMAIN, FAQ_JSONLD } from "@/components/SEO";
import { brandify, CURRENT_STORE } from "@/lib/store";

const COMPANY = {
  name: "Sizpa İnternet Tic. Ltd. Şti.",
  brand: "JETGO Pet Shop",
  ticSicilNo: "29458",
  mersisNo: "0772071161700010",
  vergiDairesi: "Gaziler",
  vergiNo: "7720711617",
  address: "Yenimahalle Atatürk 3. Kısım Blv. No:113/A, Atakum, Samsun",
  phone: "0 850 840 3959",
  phoneHref: "+908508403959",
  whatsapp: "908508403959",
  email: "info@sizpa.com",
};

function PageWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-6" data-testid="text-page-title">{title}</h1>
        {children}
      </div>
    </div>
  );
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      {title && <h2 className="text-base font-semibold mb-3">{title}</h2>}
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

function CompanyInfoBlock() {
  return (
    <div className="p-4 border rounded-lg bg-muted/30 space-y-1 text-sm">
      <p><strong>Ticari Unvan:</strong> {COMPANY.name}</p>
      <p><strong>Tic. Sicil No:</strong> {COMPANY.ticSicilNo}</p>
      <p><strong>MERSİS No:</strong> {COMPANY.mersisNo}</p>
      <p><strong>Vergi Dairesi / No:</strong> {COMPANY.vergiDairesi} / {COMPANY.vergiNo}</p>
      <p><strong>Adres:</strong> {COMPANY.address}</p>
      <p><strong>Telefon / WhatsApp:</strong> {COMPANY.phone}</p>
      <p><strong>E-posta:</strong> {COMPANY.email}</p>
    </div>
  );
}

export function SSSPage() {
  const faqs = [
    {
      q: "Sipariş nasıl verebilirim?",
      a: "Sitemizden istediğiniz ürünleri sepete ekleyip, ödeme sayfasında bilgilerinizi girerek WhatsApp üzerinden siparişinizi oluşturabilirsiniz. Detaylı bilgi için İşlem Rehberi sayfamızı ziyaret edebilirsiniz."
    },
    {
      q: "Minimum sipariş tutarı nedir?",
      a: "Minimum sipariş tutarı 500 TL'dir. Bu tutarın altındaki siparişler sistem tarafından kabul edilmemektedir."
    },
    {
      q: "Teslimat ücreti ne kadar?",
      a: "1.000 TL ve üzeri siparişlerde teslimat tamamen ücretsizdir. 1.000 TL altı siparişlerde teslimat ücreti 89 TL olarak uygulanır."
    },
    {
      q: "Hangi bölgelere teslimat yapıyorsunuz?",
      a: "Samsun Atakum bölgesindeki belirli mahallelere aynı gün veya ertesi gün teslimat yapıyoruz. Teslimat yapılan mahalleler sipariş sırasında mahalle seçiminde listelenmektedir. Hizmet bölgemiz dışındaki adreslere teslimat yapılmamaktadır."
    },
    {
      q: "Teslimat süreleri nasıldır?",
      a: "Siparişleriniz genellikle aynı gün veya ertesi iş günü teslim edilir. Bayram, kampanya ve yoğun dönemlerde teslimat süresi 1-2 iş günü uzayabilir. Mücbir sebepler (doğal afet, pandemi vb.) nedeniyle gecikmeler yaşanabilir."
    },
    {
      q: "Ödeme yöntemleri nelerdir?",
      a: "Kapıda nakit ödeme (%5 indirimli), banka havalesi/EFT, kapıda POS cihazı ile kredi kartı/banka kartı, kapıda QR ödeme (mobil bankacılık) seçenekleri mevcuttur."
    },
    {
      q: "Ürün iadesi yapabilir miyim?",
      a: "Evet. Açılmamış ve kullanılmamış ürünleri teslim tarihinden itibaren 14 gün içinde iade edebilirsiniz. Açılmış gıda ürünleri (mama, konserve), açık mama, açılmış hijyen ürünleri (kedi kumu, çiş pedi) iade kabul edilmez. İade talebinizi WhatsApp hattımızdan (+90 850 840 3959) iletebilirsiniz."
    },
    {
      q: "Hasarlı veya hatalı ürün teslim aldım, ne yapmalıyım?",
      a: "Teslimat sırasında ürünleri mutlaka kontrol ediniz. Hasarlı veya hatalı ürün tespit ettiğinizde 24 saat içinde WhatsApp hattımızdan durumu bildiriniz. Hasarlı/hatalı ürünler ücretsiz olarak değiştirilir."
    },
    {
      q: "Üyelik nasıl oluşturulur?",
      a: "Telefon numaranız ve doğum yılınız (4 haneli şifre olarak) ile kolayca üye olabilirsiniz. Üyelik ile sipariş geçmişinizi takip edebilir, favorilerinizi kaydedebilir ve stok bildirimlerinden yararlanabilirsiniz."
    },
    {
      q: "Stokta olmayan ürünü nasıl takip edebilirim?",
      a: "Stokta olmayan ürünlerin sayfasında 'Gelince Haber Ver' butonuna tıklayarak telefon numaranızı bırakın. Ürün tekrar stoğa girdiğinde WhatsApp üzerinden size bildirim gönderilecektir."
    },
    {
      q: "Akıllı Mama Hesaplama nedir?",
      a: "Evcil hayvanınızın kilosuna ve yaşına göre günlük mama ihtiyacını hesaplayan bir araçtır. Ürün detay sayfalarında mama ürünlerinde bu özelliği kullanabilir, bir paket mamanın kaç gün süreceğini öğrenebilir ve mama bittiğinde hatırlatma kurabilirsiniz."
    },
    {
      q: "Sipariş takibi nasıl yapılır?",
      a: "Üye girişi yaptıktan sonra alt menüdeki 'Takip' sekmesinden siparişlerinizin durumunu (Yeni, Hazırlanıyor, Tamamlandı, İptal) anlık olarak takip edebilirsiniz."
    },
    {
      q: "Açık mama satışı yapıyor musunuz?",
      a: "Evet. Birçok markadan istediğiniz miktarda açık mama satışı yapmaktayız. Açık mama ürünlerimizi ilgili kategoriden görüntüleyebilirsiniz."
    },
    {
      q: "Son kullanma tarihi yaklaşan ürünler hakkında bilgi verir misiniz?",
      a: "SKT'si yaklaşan ürünler indirimli fiyatlarla satışa sunulur ve ürün sayfasında son kullanma tarihi açıkça belirtilir."
    },
    {
      q: "İletişim bilgileriniz nelerdir?",
      a: `Telefon/WhatsApp: ${COMPANY.phone} | E-posta: ${COMPANY.email} | Adres: ${COMPANY.address}. Çalışma saatleri: Pazartesi-Cumartesi 09:00-20:00, Pazar 10:00-18:00.`
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <PageWrapper title="Sıkça Sorulan Sorular">
      <SEO
        title="Sıkça Sorulan Sorular | JETGO Samsun Pet Shop"
        description="JETGO Pet Shop hakkında merak edilen sorular ve cevapları. Sipariş, teslimat, ödeme, iade ve üyelik konularında detaylı bilgi."
        canonical={`${SITE_DOMAIN}/sss`}
        jsonLd={FAQ_JSONLD(faqs.map(f => ({ question: f.q, answer: f.a })))}
      />
      <p className="text-sm text-muted-foreground mb-4">{brandify("JETGO Pet Shop")} hakkında en çok sorulan sorular ve detaylı cevapları aşağıda yer almaktadır.</p>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="border rounded-lg overflow-hidden" data-testid={`faq-item-${i}`}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-left text-sm font-medium hover:bg-muted/50 transition-colors"
              data-testid={`faq-toggle-${i}`}
            >
              <span>{faq.q}</span>
              {openIndex === i ? <ChevronUp className="w-4 h-4 flex-shrink-0 ml-2" /> : <ChevronDown className="w-4 h-4 flex-shrink-0 ml-2" />}
            </button>
            {openIndex === i && (
              <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 border rounded-lg bg-muted/30">
        <p className="text-sm text-muted-foreground">Sorularınız için bize <a href={`https://wa.me/${COMPANY.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-primary underline">WhatsApp</a> üzerinden veya <a href={`mailto:${COMPANY.email}`} className="text-primary underline">{COMPANY.email}</a> adresinden ulaşabilirsiniz.</p>
      </div>
    </PageWrapper>
  );
}

export function IslemRehberiPage() {
  const steps = [
    { icon: Search, title: "Ürün Arayın", desc: "Ana sayfadaki arama çubuğunu kullanarak veya kategorilere (Köpek, Kedi, Kuş, Kemirgen) göz atarak istediğiniz ürünü bulun. Alt kategoriler ve markalar arasında kolayca gezinebilirsiniz." },
    { icon: ShoppingCart, title: "Sepete Ekleyin", desc: "Ürün sayfasında adet seçerek 'Sepete Ekle' butonuna tıklayın. İstediğiniz kadar ürün ekleyebilirsiniz. Sepet içeriğiniz sayfalar arasında geçiş yaptığınızda da korunur." },
    { icon: UserPlus, title: "Üye Olun veya Giriş Yapın", desc: "Sipariş verebilmek için telefon numaranız ve 4 haneli şifrenizle (doğum yılınız) giriş yapın veya yeni üyelik oluşturun. Üyelik sayesinde sipariş geçmişinizi takip edebilirsiniz." },
    { icon: CreditCard, title: "Ödeme Yöntemi Seçin", desc: "Kapıda nakit (%5 indirim), banka havalesi/EFT, kapıda POS ile kredi kartı veya QR ödeme seçeneklerinden birini tercih edin." },
    { icon: ClipboardList, title: "Siparişi Onaylayın", desc: "Teslimat mahallenizi seçin, adres bilgilerinizi kontrol edin ve 'WhatsApp ile Sipariş Ver' butonuna tıklayarak siparişinizi gönderin. Sipariş detaylarınız otomatik olarak WhatsApp mesajına dönüştürülür." },
    { icon: Truck, title: "Teslimatı Bekleyin", desc: "Siparişiniz hazırlanır ve Samsun Atakum bölgesinde genellikle aynı gün veya ertesi gün kapınıza teslim edilir. Sipariş durumunuzu 'Takip' sekmesinden anlık olarak izleyebilirsiniz." },
  ];

  return (
    <PageWrapper title="İşlem Rehberi">
      <SEO title="İşlem Rehberi - Nasıl Sipariş Verilir | JETGO Samsun Pet Shop" description="JETGO Pet Shop'tan adım adım nasıl sipariş vereceğinizi öğrenin. Üyelik, sepet, ödeme ve teslimat süreçleri hakkında detaylı bilgi." canonical={`${SITE_DOMAIN}/islem-rehberi`} />

      <p className="text-sm text-muted-foreground mb-6">{brandify("JETGO")}'dan sipariş vermek çok kolay! Adım adım nasıl yapacağınızı aşağıda bulabilirsiniz.</p>

      <div className="space-y-4">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i} className="flex gap-4 items-start p-4 border rounded-lg" data-testid={`step-${i}`}>
              <div className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 text-white" style={{ backgroundColor: "#6B3480" }}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">{i + 1}. {step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <Section title="Önemli Bilgiler">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Minimum sipariş tutarı <strong>500 TL</strong>'dir.</li>
          <li>1.000 TL ve üzeri siparişlerde teslimat <strong>ücretsizdir</strong>.</li>
          <li>1.000 TL altı siparişlerde teslimat ücreti <strong>89 TL</strong>'dir.</li>
          <li>Teslimat bölgemiz Samsun Atakum ilçesi ve çevresindeki belirli mahallelerle sınırlıdır.</li>
          <li>Kapıda nakit ödemede sipariş tutarında <strong>%5 indirim</strong> uygulanır.</li>
        </ul>
      </Section>
    </PageWrapper>
  );
}

export function TeslimatIadePage() {
  return (
    <PageWrapper title="Teslimat ve İade Şartları">
      <SEO title="Teslimat ve İade Şartları | JETGO Samsun Pet Shop" description="JETGO Pet Shop teslimat koşulları, teslimat süreleri, iade politikası ve cayma hakkı hakkında detaylı bilgi." canonical={`${SITE_DOMAIN}/teslimat-iade`} />

      <Section>
        <p><strong>{COMPANY.name}</strong> ("{brandify("JETGO")}") olarak müşterilerimize hızlı, güvenilir ve şeffaf bir alışveriş deneyimi sunmayı taahhüt ediyoruz. İşbu sayfa, teslimat koşullarımızı ve 6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamındaki iade politikamızı detaylı olarak açıklamaktadır.</p>
      </Section>

      <Section title="1. Teslimat Bölgesi">
        <p>{brandify("JETGO Pet Shop")}, Samsun ili Atakum ilçesi ve çevresindeki belirli mahallelere teslimat hizmeti sunmaktadır.</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Teslimat yapılan mahalleler, sipariş oluşturma aşamasında mahalle seçim listesinde gösterilmektedir.</li>
          <li>Listede yer almayan mahallelere teslimat yapılamamaktadır.</li>
          <li>Teslimat bölgemiz, operasyonel kapasitemize göre genişletilebilir veya güncellenebilir.</li>
        </ul>
      </Section>

      <Section title="2. Teslimat Ücretleri">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Minimum sipariş tutarı <strong>500 TL</strong>'dir. Bu tutarın altındaki siparişler kabul edilmemektedir.</li>
          <li><strong>1.000 TL ve üzeri</strong> siparişlerde teslimat <strong>ücretsizdir</strong>.</li>
          <li><strong>1.000 TL altı</strong> siparişlerde teslimat ücreti <strong>89 TL</strong>'dir.</li>
          <li>Teslimat ücreti, sipariş özetinde ayrıca gösterilir ve toplam tutara eklenir.</li>
        </ul>
      </Section>

      <Section title="3. Teslimat Süreleri">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Standart teslimat:</strong> Sipariş onayından itibaren genellikle aynı gün veya ertesi iş günü.</li>
          <li><strong>Yoğun dönemlerde:</strong> Bayram, kampanya ve özel günlerde teslimat süresi 1-2 iş günü uzayabilir.</li>
          <li>Yasal süre olarak siparişler, onay tarihinden itibaren en geç <strong>30 gün</strong> içinde teslim edilir.</li>
          <li>Stokta olmayan ürünler için tahmini tedarik süresi sipariş onayı sırasında bildirilir.</li>
          <li>Mücbir sebepler (doğal afet, pandemi, hükümet kararları, olağanüstü hava koşulları vb.) nedeniyle teslimat gecikebilir.</li>
        </ul>
      </Section>

      <Section title="4. Teslimat Saatleri">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Pazartesi - Cumartesi:</strong> 09:00 - 20:00</li>
          <li><strong>Pazar:</strong> 10:00 - 18:00</li>
          <li>Resmi tatil günlerinde teslimat saatleri değişiklik gösterebilir.</li>
        </ul>
      </Section>

      <Section title="5. Teslimat Sırasında Dikkat Edilmesi Gerekenler">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Teslimat sırasında alıcının veya yetkilendirdiği kişinin belirtilen adreste bulunması gerekmektedir.</li>
          <li>Ürünleri teslim alırken ambalaj ve ürün bütünlüğünü mutlaka kontrol ediniz.</li>
          <li>Hasarlı ambalajlı ürünleri teslim almayınız veya tutanak tutturarak teslim alınız.</li>
          <li>Adresin bulunamadığı veya alıcıya ulaşılamadığı durumlarda teslimat ertesi güne ertelenebilir.</li>
        </ul>
      </Section>

      <Section title="6. Cayma Hakkı (İade)">
        <p>6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Teslim tarihinden itibaren <strong>14 (on dört) gün</strong> içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin cayma hakkınızı kullanabilirsiniz.</li>
          <li>İade edilecek ürünler <strong>açılmamış, kullanılmamış ve orijinal ambalajında</strong> olmalıdır.</li>
          <li>Ürünün faturası ile birlikte iade edilmesi gerekmektedir.</li>
          <li>Cayma hakkı bildirimini WhatsApp hattımız (<strong>{COMPANY.phone}</strong>) üzerinden veya <strong>{COMPANY.email}</strong> adresine yazılı olarak yapabilirsiniz.</li>
        </ul>
      </Section>

      <Section title="7. Cayma Hakkının Kullanılamayacağı Ürünler">
        <p>Aşağıdaki ürünlerde, ürünün niteliği gereği cayma hakkı kullanılamaz:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Ambalajı açılmış gıda ürünleri (kuru mama, yaş mama, konserve, ödül maması, vitamin/takviye)</li>
          <li>Açık mama olarak tartılarak satılan ürünler</li>
          <li>Ambalajı açılmış hijyen ürünleri (kedi kumu, çiş pedi, tırnak makası, diş fırçası vb.)</li>
          <li>Tek kullanımlık ürünler ve ambalajı bozulmuş ürünler</li>
          <li>Fiyatı borsa veya piyasa koşullarına göre değişen ürünler</li>
          <li>Tüketicinin istekleri doğrultusunda özel olarak hazırlanan ürünler</li>
        </ul>
      </Section>

      <Section title="8. İade Süreci">
        <p>İade talebiniz aşağıdaki adımlarla gerçekleştirilir:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>1. Adım:</strong> WhatsApp hattımızdan ({COMPANY.phone}) veya e-posta ({COMPANY.email}) ile iade talebinizi iletin.</li>
          <li><strong>2. Adım:</strong> Ürünü orijinal ambalajında, kullanılmamış halde ve faturasıyla birlikte hazırlayın.</li>
          <li><strong>3. Adım:</strong> Kurye/teslimat personelimiz ürünü adresinizden teslim alacaktır.</li>
          <li><strong>4. Adım:</strong> Ürün kontrolü sonrası iade bedeli ödeme yönteminize göre işleme alınır.</li>
        </ul>
      </Section>

      <Section title="9. Geri Ödeme">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Nakit ödemelerde nakit olarak iade yapılır.</li>
          <li>Kredi kartı/banka kartı ödemelerinde iade, ödemenin yapıldığı karta yapılır.</li>
          <li>Havale/EFT ile yapılan ödemelerde alıcının belirttiği banka hesabına iade edilir.</li>
          <li>İade işlemi, ürünün Satıcı'ya ulaşmasını takiben en geç <strong>14 gün</strong> içinde tamamlanır.</li>
          <li>Kredi kartına yapılan iadelerin hesaba yansıması banka süreçlerine bağlı olarak değişebilir.</li>
          <li>İade teslimat ücreti alıcıya aittir. Ancak hasarlı veya hatalı ürünlerde teslimat ücreti Satıcı tarafından karşılanır.</li>
        </ul>
      </Section>

      <Section title="10. Hasarlı veya Hatalı Ürün">
        <p>Teslimat sırasında hasarlı veya hatalı ürün tespit edildiğinde:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Teslimat anında ürünü kontrol ediniz.</li>
          <li>Hasarlı ürünü teslim almayınız veya tutanak tutturarak teslim alınız.</li>
          <li><strong>24 saat</strong> içinde WhatsApp hattımızdan ({COMPANY.phone}) durumu fotoğraflı olarak bildiriniz.</li>
          <li>Hasarlı/hatalı ürünler ücretsiz olarak değiştirilir veya ürün bedeli iade edilir.</li>
          <li>Değişim veya iade teslimat ücreti Satıcı tarafından karşılanır.</li>
        </ul>
      </Section>

      <Section title="İletişim">
        <CompanyInfoBlock />
      </Section>
    </PageWrapper>
  );
}

function MesafeliSatisJetgo() {
  return (
    <PageWrapper title="Mesafeli Satış Sözleşmesi">
      <SEO title="Mesafeli Satış Sözleşmesi | JETGO" description="Jetgomarket.com mesafeli satış sözleşmesi: taraflar, teslimat, cayma hakkı, iade ve ödeme koşulları." canonical={`${SITE_DOMAIN}/mesafeli-satis`} />

      <Section title="1. Taraflar">
        <p><strong>SATICI / HİZMET SAĞLAYICI</strong></p>
        <CompanyInfoBlock />
        <p className="mt-3"><strong>ALICI / ÜYE / MÜŞTERİ</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Ad Soyad / Unvan: Sipariş sırasında beyan edilen bilgiler</li>
          <li>Adres: Sipariş sırasında bildirilen teslimat adresi</li>
          <li>Telefon / E-posta: Sipariş sırasında bildirilen iletişim bilgileri</li>
        </ul>
        <p className="mt-2">İşbu sözleşme, <strong>jetgomarket.com</strong> üzerinden ürün satın alan alıcı ile satıcı arasında elektronik ortamda kurulmuştur.</p>
      </Section>

      <Section title="2. Konu">
        <p>İşbu sözleşmenin konusu, alıcının jetgomarket.com internet sitesi üzerinden elektronik ortamda sipariş verdiği ürünlerin satışı, teslimatı, ödeme koşulları, cayma hakkı, iade ve tarafların hak ve yükümlülüklerinin düzenlenmesidir.</p>
        <p>Alıcı, siparişi onaylamadan önce ürün bilgilerini, fiyatı, teslimat ve ödeme şartlarını kontrol ettiğini kabul eder.</p>
      </Section>

      <Section title="3. Ürün ve Ödeme Bilgileri">
        <p>Satın alınan ürünün cinsi, miktarı, satış fiyatı, ödeme şekli, teslimat bilgileri ve varsa kampanya/indirim bilgileri sipariş onay ekranında ve sipariş kayıtlarında yer almaktadır.</p>
        <p>Alıcı, siparişi onaylamadan önce ürün bilgilerini, fiyatı, teslimat ve ödeme şartlarını kontrol ettiğini kabul eder.</p>
      </Section>

      <Section title="4. Teslimat Bilgileri">
        <p>Ürünler, alıcının sipariş sırasında bildirdiği adrese teslim edilir.</p>
        <p>Teslimat süresi, stok durumu, teslimat bölgesi ve operasyonel şartlara göre değişebilir. Atakum içi hızlı teslimat hizmeti sunulabilmekle birlikte, yoğunluk, hava şartları, trafik, stok durumu veya mücbir sebepler nedeniyle teslimat süresi değişebilir.</p>
        <p>Teslimat sırasında alıcının adreste bulunmaması, eksik veya hatalı adres bildirmesi gibi nedenlerle teslimat yapılamazsa, bundan doğacak gecikme ve masraflardan alıcı sorumludur.</p>
      </Section>

      <Section title="5. Cayma Hakkı">
        <p>Alıcı, mesafeli satış mevzuatı kapsamında, teslim aldığı tarihten itibaren 14 gün içinde herhangi bir gerekçe göstermeksizin cayma hakkını kullanabilir.</p>
        <p>Cayma hakkının kullanılabilmesi için bu süre içinde satıcıya yazılı olarak veya kalıcı veri saklayıcısı ile bildirim yapılması gerekir.</p>
        <p className="mt-2"><strong>Cayma bildirimi için iletişim:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>E-posta: <a href={`mailto:${COMPANY.email}`} className="text-primary underline">{COMPANY.email}</a></li>
          <li>Telefon / WhatsApp: {COMPANY.phone}</li>
        </ul>
      </Section>

      <Section title="6. Cayma Hakkı Kullanılamayacak Ürünler">
        <p>Aşağıdaki ürünlerde cayma hakkı kullanılamaz:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Ambalajı açılmış, kullanılmış veya yeniden satışa uygun olmayan ürünler,</li>
          <li>Hijyen ve sağlık açısından iadesi uygun olmayan ürünler,</li>
          <li>Son kullanma tarihi yaklaşan veya çabuk bozulabilecek ürünler,</li>
          <li>Alıcının isteği doğrultusunda özel olarak hazırlanan ürünler,</li>
          <li>Açık mama, açık ürün, özel tartım veya kişiye özel hazırlanan ürünler,</li>
          <li>Teslimden sonra ambalajı açılmış pet bakım, hijyen ve tüketim ürünleri.</li>
        </ul>
      </Section>

      <Section title="7. İade Şartları">
        <p>İade edilecek ürünün kullanılmamış, ambalajı bozulmamış, yeniden satışa uygun ve varsa faturası/fişi ile birlikte gönderilmesi gerekir.</p>
        <p>İade talebi satıcı tarafından incelenir. İade şartlarına uygun olmayan ürünlerde iade kabul edilmeyebilir.</p>
        <p>Ürün bedeli, iade şartlarının sağlanması ve ürünün satıcıya ulaşmasından sonra mevzuata uygun süre içinde alıcıya iade edilir.</p>
      </Section>

      <Section title="8. Ayıplı / Hatalı Ürün">
        <p>Teslim edilen ürünün ayıplı, hasarlı, eksik veya siparişten farklı olması halinde alıcı, durumu makul süre içinde satıcıya bildirmelidir.</p>
        <p>Bu durumda ürün değişimi, iade veya bedel iadesi konusunda mevzuata uygun işlem yapılır.</p>
      </Section>

      <Section title="9. Alıcının Yükümlülükleri">
        <p>Alıcı, sipariş verirken doğru ve eksiksiz bilgi vermekle yükümlüdür.</p>
        <p>Alıcı, sipariş onayı ile birlikte ürün bilgilerini, satış fiyatını, ödeme ve teslimat koşullarını kabul etmiş sayılır.</p>
        <p>Alıcının hatalı bilgi vermesi nedeniyle oluşabilecek teslimat sorunlarından satıcı sorumlu değildir.</p>
      </Section>

      <Section title="10. Satıcının Yükümlülükleri">
        <p>Satıcı, siparişe konu ürünü belirtilen niteliklere uygun şekilde teslim etmekle yükümlüdür.</p>
        <p>Stokta bulunmayan veya temini mümkün olmayan ürünlerde satıcı, alıcıyı bilgilendirerek siparişi iptal edebilir, muadil ürün önerebilir veya ücret iadesi yapabilir.</p>
      </Section>

      <Section title="11. Uyuşmazlıkların Çözümü">
        <p>İşbu sözleşmeden doğabilecek uyuşmazlıklarda, Ticaret Bakanlığı tarafından ilan edilen parasal sınırlar dahilinde Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.</p>
      </Section>

      <Section title="12. Yürürlük">
        <p>Alıcı, jetgomarket.com üzerinden sipariş vererek işbu Mesafeli Satış Sözleşmesi'ni okuduğunu, anladığını ve elektronik ortamda kabul ettiğini beyan eder.</p>
      </Section>

      <Section title="Satıcı Bilgileri">
        <CompanyInfoBlock />
      </Section>
    </PageWrapper>
  );
}

export function MesafeliSatisSozlesmesiPage() {
  if (CURRENT_STORE.id === "jetgo") return <MesafeliSatisJetgo />;
  return (
    <PageWrapper title="Mesafeli Satış Sözleşmesi">
      <SEO title="Mesafeli Satış Sözleşmesi | JETGO Samsun Pet Shop" description="JETGO Pet Shop mesafeli satış sözleşmesi. 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında ön bilgilendirme ve sözleşme koşulları." canonical={`${SITE_DOMAIN}/mesafeli-satis`} />

      <Section>
        <p>İşbu Mesafeli Satış Sözleşmesi ("Sözleşme"), 6502 sayılı Tüketicinin Korunması Hakkında Kanun ("Kanun") ve 27.11.2014 tarihli 29188 sayılı Resmi Gazete'de yayımlanan Mesafeli Sözleşmeler Yönetmeliği ("Yönetmelik") hükümlerine uygun olarak düzenlenmiştir.</p>
      </Section>

      <Section title="Madde 1 – Taraflar">
        <p><strong>SATICI:</strong></p>
        <CompanyInfoBlock />
        <p className="mt-3"><strong>ALICI:</strong></p>
        <p>Siteye üye olan ve/veya sipariş veren gerçek kişi. Alıcı'nın adı, soyadı, teslimat adresi, telefon numarası ve e-posta adresi sipariş formunda belirtildiği şekildedir.</p>
      </Section>

      <Section title="Madde 2 – Sözleşmenin Konusu">
        <p>İşbu Sözleşme'nin konusu, Alıcı'nın Satıcı'ya ait {brandify("JETGO Pet Shop")} web sitesinden ("Site") elektronik ortamda sipariş vererek satın almak istediği aşağıda nitelikleri ve satış fiyatı belirtilen ürün/ürünlerin satışı ve teslimatına ilişkin 6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.</p>
        <p>Alıcı, satışa konu ürünün temel nitelikleri, satış fiyatı, ödeme şekli, teslimat koşulları ve süresi ile cayma hakkına ilişkin ön bilgilendirmeyi okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli onayı verdiğini kabul, beyan ve taahhüt eder.</p>
      </Section>

      <Section title="Madde 3 – Sözleşme Konusu Ürün/Hizmet Bilgileri">
        <p>Sipariş edilen ürünlerin cinsi, adedi, marka/modeli, rengi, KDV dahil satış fiyatı ve ödeme şekli sipariş özeti sayfasında ve Alıcı'ya WhatsApp üzerinden iletilen sipariş mesajında belirtildiği şekildedir.</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Ürün görselleri temsilidir; renk, boyut ve ambalaj farklılıkları olabilir.</li>
          <li>Ürün fiyatları KDV dahildir.</li>
          <li>Son kullanma tarihi yaklaşan ürünler indirimli fiyatla satışa sunulabilir ve bu durum ürün sayfasında belirtilir.</li>
          <li>Listelenen fiyatlar satış fiyatıdır. İndirim uygulanmış fiyatlar ayrıca gösterilir.</li>
        </ul>
      </Section>

      <Section title="Madde 4 – Genel Hükümler">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Alıcı, Site'de ürünlerin temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli onayı verdiğini kabul eder.</li>
          <li>Sözleşme, Alıcı tarafından elektronik ortamda onaylandığı/sipariş verildiği tarihte kurulmuş sayılır.</li>
          <li>Satıcı, sözleşme konusu ürünü eksiksiz, siparişte belirtilen niteliklere uygun ve varsa garanti belgeleri, kullanım kılavuzları ile birlikte teslim etmeyi kabul ve taahhüt eder.</li>
          <li>Satıcı, sipariş konusu ürün veya hizmetin yerine getirilmesinin imkânsızlaştığı hallerde, bu durumu öğrendiği tarihten itibaren 3 gün içinde Alıcı'yı bilgilendirir ve varsa teslimat masrafları dahil tahsil edilen tüm ödemeleri iade eder.</li>
        </ul>
      </Section>

      <Section title="Madde 5 – Teslimat Koşulları">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Teslimat, Samsun Atakum ilçesi ve çevresindeki Site'de belirtilen mahallelerle sınırlıdır.</li>
          <li>Hizmet bölgesi dışındaki adreslere teslimat yapılmamaktadır.</li>
          <li>Minimum sipariş tutarı <strong>500 TL</strong>'dir.</li>
          <li><strong>1.000 TL</strong> ve üzeri siparişlerde teslimat ücretsizdir.</li>
          <li><strong>1.000 TL</strong> altı siparişlerde <strong>89 TL</strong> teslimat ücreti uygulanır.</li>
          <li>Siparişler genellikle aynı gün veya ertesi iş günü teslim edilir.</li>
          <li>Ürünler en geç sipariş tarihinden itibaren <strong>30 gün</strong> içinde teslim edilir.</li>
          <li>Mücbir sebepler (doğal afet, pandemi, hükümet kararları, olağanüstü hava koşulları, savaş, grev vb.) nedeniyle teslimat gecikebilir. Bu süre boyunca Satıcı'nın sorumluluğu doğmaz.</li>
          <li>Teslimat, Alıcı'nın sipariş formunda belirttiği adrese yapılır. Alıcı'nın veya yetkilendirdiği kişinin teslimat anında belirtilen adreste bulunması gerekmektedir.</li>
        </ul>
      </Section>

      <Section title="Madde 6 – Ödeme Koşulları">
        <p>Alıcı, sipariş tutarını aşağıdaki ödeme yöntemlerinden biriyle ödeyebilir:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Kapıda nakit ödeme:</strong> Sipariş tutarında %5 nakit ödeme indirimi uygulanır.</li>
          <li><strong>Banka havalesi / EFT:</strong> Sipariş onayından önce Satıcı'nın bildireceği banka hesabına ödeme yapılır.</li>
          <li><strong>Kapıda POS cihazı ile kredi kartı / banka kartı:</strong> Teslimat sırasında ödeme.</li>
          <li><strong>Kapıda QR ödeme:</strong> Mobil bankacılık uygulaması ile teslimat anında ödeme.</li>
        </ul>
        <p className="mt-2">Kapıda nakit ödeme indirimi, diğer indirim ve kampanyalarla birleştirilebilir.</p>
      </Section>

      <Section title="Madde 7 – Cayma Hakkı">
        <p>Alıcı, ürünü teslim aldığı tarihten itibaren <strong>14 (on dört) gün</strong> içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin cayma hakkını kullanabilir.</p>
        <p className="mt-2">Cayma hakkının kullanılabilmesi için:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>14 günlük cayma hakkı süresi içinde Satıcı'ya cayma bildirimi yapılmalıdır.</li>
          <li>Cayma bildirimi WhatsApp ({COMPANY.phone}) veya e-posta ({COMPANY.email}) yoluyla yapılabilir.</li>
          <li>Ürün kullanılmamış, açılmamış ve orijinal ambalajında olmalıdır.</li>
          <li>Ürün faturasıyla birlikte eksiksiz iade edilmelidir.</li>
          <li>Ürünün olağan gözden geçirme dışında kullanılmış olması halinde cayma hakkı kaybedilir.</li>
        </ul>
      </Section>

      <Section title="Madde 8 – Cayma Hakkının Kullanılamayacağı Ürünler">
        <p>Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesi kapsamında aşağıdaki ürünlerde cayma hakkı kullanılamaz:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Tesliminden sonra ambalaj, bant, mühür, paket gibi koruyucu unsurları açılmış olan ve iadesi sağlık ve hijyen açısından uygun olmayan ürünler (açılmış mama, konserve, yaş mama, ödül maması, vitamin/takviye ürünleri)</li>
          <li>Açık mama olarak tartılarak satılan ürünler (tüketicinin istekleri doğrultusunda hazırlanan)</li>
          <li>Ambalajı açılmış hijyen ürünleri (kedi kumu, çiş pedi, tırnak makası, bakım ürünleri)</li>
          <li>Tek kullanımlık ürünler ve ambalajı bozulmuş ürünler</li>
          <li>Çabuk bozulabilen veya son kullanma tarihi geçebilecek ürünler</li>
          <li>Fiyatı finansal piyasalardaki dalgalanmalara bağlı olarak değişen ürünler</li>
          <li>Tüketicinin istekleri veya açıkça kişisel ihtiyaçları doğrultusunda hazırlanan ürünler</li>
        </ul>
      </Section>

      <Section title="Madde 9 – İade ve Geri Ödeme Koşulları">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Cayma hakkının kullanılması halinde, iade edilen ürünler Satıcı tarafından kontrol edilir.</li>
          <li>Ürünün iade koşullarına uygun olması halinde, ürün bedeli ödeme yöntemine göre en geç <strong>14 gün</strong> içinde Alıcı'ya iade edilir.</li>
          <li>Nakit ödemelerde nakit iade; kredi kartı ödemelerinde karta iade; havale/EFT ödemelerinde alıcının belirttiği banka hesabına iade yapılır.</li>
          <li>Kredi kartına yapılan iadelerin hesaba yansıması ilgili bankanın süreçlerine bağlıdır.</li>
          <li>İade teslimat ücreti Alıcı'ya aittir. Hasarlı veya hatalı ürünlerde teslimat ücreti Satıcı tarafından karşılanır.</li>
          <li>Ürünün Satıcı'nın bildirdiği anlaşmalı iade adresine gönderilmesi gerekmektedir.</li>
        </ul>
      </Section>

      <Section title="Madde 10 – Garanti ve Sorumluluk">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Satıcı, sözleşme konusu ürünü sağlam, eksiksiz, sipariş edilen niteliklere uygun teslim etmeyi taahhüt eder.</li>
          <li>Ürünlerin yasal garanti süresi, Kanun ve ilgili mevzuat hükümlerine tabidir.</li>
          <li>Ayıplı ürünlerde tüketicinin seçimlik hakları (ücretsiz onarım, ürün değişimi, bedel iadesi, bedel indirimi) saklıdır.</li>
          <li>Satıcı, ürünlerin son kullanma tarihine uygun olarak teslim edilmesini sağlar.</li>
        </ul>
      </Section>

      <Section title="Madde 11 – Uyuşmazlık Çözümü">
        <p>İşbu Sözleşme'den doğan uyuşmazlıklarda, Gümrük ve Ticaret Bakanlığı tarafından her yıl belirlenen parasal sınırlar dahilinde <strong>Samsun Tüketici Hakem Heyetleri</strong>, bu sınırları aşan uyuşmazlıklarda <strong>Samsun Tüketici Mahkemeleri</strong> yetkilidir.</p>
        <p className="mt-2">Alıcı, Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri'ne başvuru haklarının bulunduğunu bildiğini kabul ve beyan eder.</p>
      </Section>

      <Section title="Madde 12 – Yürürlük">
        <p>İşbu Sözleşme, Alıcı tarafından elektronik ortamda onaylandığı veya sipariş verildiği tarihte yürürlüğe girer ve taraflarca aksi kararlaştırılıncaya veya sözleşme konusu yükümlülükler tamamen ifa edilinceye kadar yürürlükte kalır.</p>
        <p className="mt-3 font-medium">Alıcı, işbu Sözleşme'nin tüm maddelerini okuduğunu, anladığını ve kabul ettiğini beyan eder.</p>
      </Section>

      <Section title="Satıcı Bilgileri">
        <CompanyInfoBlock />
      </Section>
    </PageWrapper>
  );
}

export function KVKKPage() {
  return (
    <PageWrapper title="Kişisel Verilerin Korunması (KVKK) Aydınlatma Metni">
      <SEO title="KVKK Aydınlatma Metni | JETGO Samsun Pet Shop" description="JETGO Pet Shop kişisel verilerin korunması kanunu (KVKK) kapsamında aydınlatma metni. 6698 sayılı Kanun gereği veri işleme politikamız." canonical={`${SITE_DOMAIN}/kvkk`} />

      <Section>
        <p><strong>{COMPANY.name}</strong> ("Şirket") olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla, kişisel verilerinizin hukuka uygun biçimde işlenmesini, güvenli şekilde saklanmasını ve korunmasını sağlamayı taahhüt ediyoruz.</p>
        <p>İşbu aydınlatma metni, KVKK'nın 10. maddesi uyarınca hazırlanmış olup, kişisel verilerinizin işlenme amaçları, hukuki sebepleri, aktarıldığı taraflar ve haklarınız hakkında sizi bilgilendirmeyi amaçlamaktadır.</p>
      </Section>

      <Section title="1. Veri Sorumlusu">
        <CompanyInfoBlock />
      </Section>

      <Section title="2. Toplanan Kişisel Veriler">
        <p>Hizmetlerimizden yararlanmanız sırasında aşağıdaki kişisel verileriniz işlenebilmektedir:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Kimlik bilgileri:</strong> Ad, soyad</li>
          <li><strong>İletişim bilgileri:</strong> Telefon numarası, e-posta adresi, teslimat adresi</li>
          <li><strong>Müşteri işlem bilgileri:</strong> Sipariş geçmişi, ödeme tercihleri, sepet içeriği, favori ürünler</li>
          <li><strong>Hesap güvenlik bilgileri:</strong> Doğum yılı (şifre olarak), oturum bilgileri</li>
          <li><strong>Lokasyon bilgileri:</strong> Teslimat adresi konumu (izniniz dahilinde)</li>
          <li><strong>Evcil hayvan bilgileri:</strong> Pet profil bilgileri, ırk, yaş, kilo (isteğe bağlı, mama hesaplama ve kişiselleştirilmiş hizmet için)</li>
          <li><strong>Dijital iz bilgileri:</strong> Ziyaret edilen sayfalar, arama sorguları, son görüntülenen ürünler, tarayıcı türü, cihaz bilgileri</li>
        </ul>
      </Section>

      <Section title="3. Verilerin İşlenme Amaçları">
        <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Sipariş oluşturma, onaylama, hazırlama ve teslimat süreçlerinin yürütülmesi</li>
          <li>Üyelik hesabının oluşturulması, yönetilmesi ve kimlik doğrulama</li>
          <li>Müşteri ilişkileri yönetimi ve müşteri destek hizmetlerinin sunulması</li>
          <li>Stok bildirimi ve sipariş hatırlatma (mama bitimi hatırlatma) hizmetlerinin sunulması</li>
          <li>Ürün ve hizmet kalitesinin iyileştirilmesi, kullanıcı deneyiminin kişiselleştirilmesi</li>
          <li>Akıllı mama hesaplama ve evcil hayvan bakım danışmanlığı hizmetlerinin sunulması</li>
          <li>Yasal ve düzenleyici yükümlülüklerin yerine getirilmesi</li>
          <li>Hukuki süreçlerin takibi ve şirket haklarının korunması</li>
          <li>İstatistiksel analiz ve raporlama (anonimleştirilmiş verilerle)</li>
        </ul>
      </Section>

      <Section title="4. Verilerin İşlenme Hukuki Sebepleri">
        <p>Kişisel verileriniz, KVKK'nın 5. maddesinde belirtilen aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması (sipariş ve teslimat)</li>
          <li>Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi (vergi, fatura, yasal saklama)</li>
          <li>İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla veri sorumlusunun meşru menfaati (hizmet iyileştirme)</li>
          <li>Açık rızanız (stok bildirimi, kampanya bilgilendirmesi, konum paylaşımı)</li>
        </ul>
      </Section>

      <Section title="5. Verilerin Aktarılması">
        <p>Kişisel verileriniz, aşağıdaki durumlarda ve yalnızca gerekli minimum düzeyde üçüncü taraflarla paylaşılabilmektedir:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Teslimat hizmeti:</strong> Sipariş teslimatı için gerekli minimum bilgilerin (ad, adres, telefon) teslimat personeliyle paylaşılması</li>
          <li><strong>Ödeme hizmeti:</strong> Ödeme işlemlerinin gerçekleştirilmesi için ödeme hizmeti sağlayıcılarıyla (Tosla / Aktif Bank — AKÖDE Elektronik Para A.Ş. vb.) paylaşım</li>
          <li><strong>İletişim:</strong> WhatsApp Business üzerinden sipariş iletişimi (talepleriniz doğrultusunda)</li>
          <li><strong>Yasal zorunluluklar:</strong> Kanun ve mevzuat gereği yetkili kamu kurum ve kuruluşlarına bilgi aktarımı</li>
          <li><strong>Hukuki süreçler:</strong> Mahkeme kararı veya yasal zorunluluk halinde yargı organlarına bilgi aktarımı</li>
        </ul>
        <p className="mt-2">Kişisel verileriniz, pazarlama veya reklam amacıyla üçüncü taraflarla paylaşılmaz. Yurt dışına veri aktarımı yapılmamaktadır.</p>
      </Section>

      <Section title="6. Verilerin Saklanması ve Güvenliği">
        <p>Kişisel verileriniz, işlenme amacının gerektirdiği süre boyunca ve ilgili mevzuatın öngördüğü saklama süreleri boyunca güvenli ortamda saklanır.</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>SSL (Secure Socket Layer) şifreli bağlantı ile veri iletimi sağlanır.</li>
          <li>Şifreler tek yönlü hash algoritması (bcrypt) ile saklanır, açık metin olarak tutulmaz.</li>
          <li>Güvenli oturum yönetimi ve otomatik oturum sonlandırma mekanizmaları kullanılır.</li>
          <li>Veritabanı erişimi yetkilendirilmiş personelle sınırlandırılmıştır.</li>
          <li>Düzenli güvenlik güncellemeleri ve sistem kontrolleri yapılmaktadır.</li>
          <li>Saklama süresi dolmuş veya işlenme amacı ortadan kalkmış veriler, re'sen veya talep üzerine silinir, yok edilir veya anonim hale getirilir.</li>
        </ul>
      </Section>

      <Section title="7. İlgili Kişinin Hakları">
        <p>KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
          <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
          <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
          <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme</li>
          <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
          <li>Düzeltme, silme veya yok etme işlemlerinin kişisel verilerinizin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
          <li>İşlenen verilerinizin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
          <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
        </ul>
      </Section>

      <Section title="8. Başvuru Yöntemi">
        <p>Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki yöntemlerle Şirketimize başvurabilirsiniz:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>E-posta:</strong> <a href={`mailto:${COMPANY.email}`} className="text-primary underline">{COMPANY.email}</a> adresine "KVKK Bilgi Talebi" konulu e-posta göndererek</li>
          <li><strong>Yazılı başvuru:</strong> {COMPANY.address} adresine kimlik fotokopisi ekli dilekçe ile</li>
          <li><strong>WhatsApp:</strong> {COMPANY.phone} numaralı hattan</li>
        </ul>
        <p className="mt-2">Başvurularınız en geç <strong>30 gün</strong> içinde ücretsiz olarak sonuçlandırılacaktır. İşlemin ayrıca bir maliyet gerektirmesi halinde, Kişisel Verileri Koruma Kurulunca belirlenen tarifedeki ücret alınacaktır.</p>
      </Section>

      <Section title="9. Aydınlatma Metninde Değişiklik">
        <p>Şirketimiz, işbu aydınlatma metnini yasal düzenlemelere ve şirket politikalarına uygun olarak güncelleme hakkını saklı tutar. Güncellenmiş metin, Site üzerinde yayınlandığı tarihte yürürlüğe girer.</p>
        <p className="mt-2"><strong>Son güncelleme tarihi:</strong> {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </Section>
    </PageWrapper>
  );
}

export function GizlilikPage() {
  return (
    <PageWrapper title="Gizlilik Politikası">
      <SEO title="Gizlilik Politikası | JETGO Samsun Pet Shop" description="JETGO Pet Shop gizlilik politikası. Kişisel verilerinizin nasıl toplandığı, kullanıldığı, korunduğu ve paylaşıldığı hakkında detaylı bilgi." canonical={`${SITE_DOMAIN}/gizlilik`} />

      <Section>
        <p><strong>{COMPANY.name}</strong> ("{brandify("JETGO")}") olarak gizliliğinize saygı duyuyor ve kişisel verilerinizi korumayı taahhüt ediyoruz. İşbu Gizlilik Politikası, web sitemizi ve mobil uygulamamızı kullanırken hangi bilgilerin toplandığını, nasıl kullanıldığını, kimlerle paylaşıldığını ve nasıl korunduğunu detaylı olarak açıklamaktadır.</p>
        <p>Sitemizi kullanarak işbu Gizlilik Politikası'nı kabul etmiş sayılırsınız.</p>
      </Section>

      <Section title="1. Toplanan Bilgiler">
        <p>Sitemizi ziyaret ettiğinizde ve hizmetlerimizi kullandığınızda aşağıdaki bilgiler toplanabilir:</p>
        <p className="mt-2"><strong>a) Doğrudan sağladığınız bilgiler:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Üyelik bilgileri: Ad, soyad, telefon numarası, doğum yılı</li>
          <li>Teslimat bilgileri: Adres, mahalle, konum bilgisi</li>
          <li>Sipariş bilgileri: Satın aldığınız ürünler, ödeme tercihi</li>
          <li>İletişim bilgileri: WhatsApp mesajları, e-posta yazışmaları</li>
          <li>Evcil hayvan bilgileri: Pet adı, türü, ırkı, yaşı, kilosu (isteğe bağlı)</li>
        </ul>
        <p className="mt-2"><strong>b) Otomatik olarak toplanan bilgiler:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Kullanım verileri: Ziyaret edilen sayfalar, arama sorguları, son görüntülenen ürünler</li>
          <li>Sepet bilgileri: Sepete eklenen ürünler ve miktarları</li>
          <li>Favori bilgileri: Favori olarak işaretlenen ürünler</li>
          <li>Cihaz bilgileri: Tarayıcı türü, işletim sistemi, ekran çözünürlüğü, dil tercihi</li>
          <li>Oturum bilgileri: Giriş zamanı, oturum süresi</li>
        </ul>
      </Section>

      <Section title="2. Bilgilerin Kullanım Amaçları">
        <p>Toplanan bilgiler yalnızca aşağıdaki amaçlarla kullanılır:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Siparişlerinizi işlemek, onaylamak ve teslim etmek</li>
          <li>Üyelik hesabınızı oluşturmak ve yönetmek</li>
          <li>Akıllı mama hesaplama ve mama bitimi hatırlatma hizmeti sunmak</li>
          <li>Yapay zeka destekli evcil hayvan bakım danışmanlığı hizmeti sunmak</li>
          <li>Stok bildirimi göndermek (ürün tekrar stoğa girdiğinde)</li>
          <li>Müşteri desteği sağlamak ve sorunlarınızı çözmek</li>
          <li>Hizmet kalitemizi iyileştirmek ve kullanıcı deneyimini geliştirmek</li>
          <li>Yasal yükümlülüklerimizi yerine getirmek</li>
        </ul>
      </Section>

      <Section title="3. Bilgi Güvenliği">
        <p>Kişisel verilerinizin güvenliği için aşağıdaki teknik ve idari önlemler alınmaktadır:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>SSL şifreleme:</strong> Tüm veri iletimi 256-bit SSL sertifikası ile şifrelenmektedir.</li>
          <li><strong>Şifre güvenliği:</strong> Kullanıcı şifreleri bcrypt algoritması ile tek yönlü hash'lenerek saklanır.</li>
          <li><strong>Oturum güvenliği:</strong> Güvenli oturum yönetimi, HttpOnly ve Secure cookie bayrakları kullanılır.</li>
          <li><strong>Veritabanı güvenliği:</strong> Veritabanına erişim yetkili personelle sınırlıdır.</li>
          <li><strong>Düzenli güncellemeler:</strong> Sistem ve güvenlik güncellemeleri düzenli olarak yapılır.</li>
        </ul>
      </Section>

      <Section title="4. Bilgilerin Üçüncü Taraflarla Paylaşımı">
        <p>Kişisel bilgileriniz aşağıdaki durumlar dışında üçüncü taraflarla <strong>kesinlikle paylaşılmaz</strong>:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Teslimat hizmeti:</strong> Siparişinizin teslimi için gerekli minimum bilgilerin (ad, adres, telefon) paylaşılması</li>
          <li><strong>Ödeme altyapısı:</strong> Online ödeme işlemleri için ödeme hizmeti sağlayıcısıyla (Tosla / Aktif Bank — AKÖDE Elektronik Para A.Ş.) paylaşım</li>
          <li><strong>WhatsApp iletişimi:</strong> Sipariş onayı ve müşteri desteği için WhatsApp Business kullanımı</li>
          <li><strong>Yasal zorunluluk:</strong> Kanun gereği yetkili kamu kurum ve kuruluşlarına bilgi aktarımı</li>
        </ul>
        <p className="mt-2">Verileriniz, pazarlama veya reklam amacıyla üçüncü taraflara satılmaz veya kiralanmaz.</p>
      </Section>

      <Section title="5. Üçüncü Taraf Hizmetler">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>WhatsApp Business:</strong> Sipariş iletişimi için kullanılır. WhatsApp'ın kendi gizlilik politikası geçerlidir.</li>
          <li><strong>Tosla (Aktif Bank — AKÖDE):</strong> Online kredi kartı ödeme altyapısı için kullanılır. Tosla / Aktif Bank'ın kendi gizlilik politikası ve PCI DSS uyumluluğu geçerlidir.</li>
          <li><strong>OpenAI:</strong> Yapay zeka pet bakım danışmanlığı hizmeti için kullanılır. Bu hizmet kapsamında yalnızca genel pet bakım soruları işlenir, kişisel verileriniz paylaşılmaz.</li>
        </ul>
      </Section>

      <Section title="6. Veri Saklama Süreleri">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Üyelik bilgileri: Hesap aktif olduğu sürece ve hesap silme talebinden itibaren 30 gün içinde</li>
          <li>Sipariş bilgileri: Yasal saklama süresi boyunca (vergi mevzuatı gereği 5 yıl)</li>
          <li>İletişim kayıtları: 1 yıl süreyle</li>
          <li>Çerez verileri: Oturum çerezleri tarayıcı kapatıldığında, kalıcı çerezler belirtilen sürelerde silinir</li>
        </ul>
      </Section>

      <Section title="7. Kullanıcı Hakları">
        <p>Kişisel verilerinizle ilgili aşağıdaki haklara sahipsiniz:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Verilerinize erişim talep etme</li>
          <li>Yanlış veya eksik verilerin düzeltilmesini isteme</li>
          <li>Verilerinizin silinmesini talep etme (hesap silme)</li>
          <li>Veri işlemeye itiraz etme</li>
          <li>Verilerinizin taşınabilirliğini talep etme</li>
        </ul>
        <p className="mt-2">Bu haklarınızı kullanmak için <a href={`mailto:${COMPANY.email}`} className="text-primary underline">{COMPANY.email}</a> adresine veya <a href={`https://wa.me/${COMPANY.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-primary underline">WhatsApp hattımıza</a> başvurabilirsiniz.</p>
      </Section>

      <Section title="8. Politika Değişiklikleri">
        <p>İşbu Gizlilik Politikası, yasal düzenlemeler ve hizmet değişiklikleri doğrultusunda güncellenebilir. Önemli değişiklikler Site üzerinde duyurulur. Güncellenmiş politika yayınlandığı tarihte yürürlüğe girer.</p>
        <p className="mt-2"><strong>Son güncelleme:</strong> {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </Section>

      <Section title="İletişim">
        <p>Gizlilik politikamız hakkında sorularınız için:</p>
        <CompanyInfoBlock />
      </Section>
    </PageWrapper>
  );
}

export function GizlilikSozlesmesiPage() {
  return (
    <PageWrapper title="Gizlilik Sözleşmesi">
      <SEO title="Gizlilik Sözleşmesi | JETGO Samsun Pet Shop" description="JETGO Pet Shop gizlilik sözleşmesi. Kişisel verilerinizin korunması, veri işleme politikası ve kullanıcı hakları hakkında detaylı sözleşme metni." canonical={`${SITE_DOMAIN}/gizlilik-sozlesmesi`} />

      <Section>
        <p>İşbu Gizlilik Sözleşmesi ("Sözleşme"), <strong>{COMPANY.name}</strong> ("Şirket" veya "Hizmet Sağlayıcı") tarafından işletilen {brandify("JETGO Pet Shop")} web sitesini ve mobil uygulamasını ("Site") kullanan kullanıcıların ("Kullanıcı") kişisel verilerinin toplanması, işlenmesi, saklanması, korunması ve imha edilmesine ilişkin koşulları düzenler.</p>
        <p>Kullanıcı, Site'yi kullanarak ve/veya üyelik oluşturarak işbu Sözleşme'nin tüm hükümlerini kabul etmiş sayılır.</p>
      </Section>

      <Section title="Madde 1 – Taraflar">
        <p><strong>Hizmet Sağlayıcı:</strong></p>
        <CompanyInfoBlock />
        <p className="mt-3"><strong>Kullanıcı:</strong> Site'yi kullanan, üyelik oluşturan ve/veya sipariş veren gerçek kişi.</p>
      </Section>

      <Section title="Madde 2 – Sözleşmenin Konusu ve Kapsamı">
        <p>İşbu Sözleşme, Kullanıcı'nın Site'yi kullanması sırasında doğrudan veya dolaylı olarak paylaştığı kişisel verilerin toplanması, işlenmesi, saklanması, korunması ve gerekli hallerde imha edilmesine ilişkin Şirket'in yükümlülüklerini ve Kullanıcı'nın haklarını belirler.</p>
        <p>Sözleşme, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK), 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun ve ilgili mevzuat hükümlerine uygun olarak hazırlanmıştır.</p>
      </Section>

      <Section title="Madde 3 – Toplanan Kişisel Veriler">
        <p>Site üzerinden aşağıdaki kişisel veriler toplanabilmektedir:</p>
        <p className="mt-2"><strong>a) Kimlik ve İletişim Verileri:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Ad ve soyad</li>
          <li>Telefon numarası</li>
          <li>E-posta adresi</li>
          <li>Teslimat adresi (il, ilçe, mahalle, açık adres)</li>
          <li>Doğum yılı (üyelik şifresi olarak)</li>
        </ul>
        <p className="mt-2"><strong>b) Müşteri İşlem Verileri:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Sipariş geçmişi ve detayları</li>
          <li>Ödeme yöntemi tercihleri</li>
          <li>Sepet içeriği ve favori ürünler</li>
          <li>Stok bildirim talepleri</li>
          <li>Mama bitimi hatırlatma tercihleri</li>
        </ul>
        <p className="mt-2"><strong>c) Evcil Hayvan Verileri (İsteğe Bağlı):</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Pet profil bilgileri (ad, tür, ırk, yaş, kilo)</li>
          <li>Beslenme tercihleri ve mama hesaplama verileri</li>
        </ul>
        <p className="mt-2"><strong>d) Dijital Kullanım Verileri:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Ziyaret edilen sayfalar ve arama sorguları</li>
          <li>Son görüntülenen ürünler</li>
          <li>Tarayıcı türü, işletim sistemi ve cihaz bilgileri</li>
          <li>Oturum süreleri ve giriş bilgileri</li>
          <li>Konum bilgisi (teslimat amacıyla, izin dahilinde)</li>
        </ul>
      </Section>

      <Section title="Madde 4 – Verilerin İşlenme Amaçları ve Hukuki Sebepleri">
        <p>Toplanan kişisel veriler, KVKK'nın 5. maddesinde belirtilen hukuki sebeplere dayanılarak aşağıdaki amaçlarla işlenir:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Sipariş oluşturma, onaylama, hazırlama ve teslimat süreçlerinin yürütülmesi (sözleşmenin ifası)</li>
          <li>Üyelik hesabının oluşturulması ve yönetilmesi (sözleşmenin ifası)</li>
          <li>Akıllı mama hesaplama ve mama bitimi hatırlatma hizmetlerinin sunulması (meşru menfaat)</li>
          <li>Yapay zeka destekli evcil hayvan bakım danışmanlığı (meşru menfaat)</li>
          <li>Müşteri destek ve iletişim hizmetlerinin sağlanması (meşru menfaat)</li>
          <li>Stok bildirimi ve kampanya bilgilendirmesi (açık rıza)</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi (vergi, fatura, saklama yükümlülükleri)</li>
          <li>Hukuki süreçlerin takibi ve şirket haklarının korunması (hukuki yükümlülük)</li>
        </ul>
      </Section>

      <Section title="Madde 5 – Verilerin Korunması ve Güvenlik Önlemleri">
        <p>Şirket, Kullanıcı'nın kişisel verilerini korumak için aşağıdaki teknik ve idari önlemleri almaktadır:</p>
        <p className="mt-2"><strong>Teknik Önlemler:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>256-bit SSL (Secure Socket Layer) şifreli bağlantı ile veri iletimi</li>
          <li>Şifrelerin tek yönlü hash algoritması (bcrypt) ile saklanması; açık metin olarak hiçbir yerde tutulmaması</li>
          <li>Güvenli oturum yönetimi (HttpOnly, Secure, SameSite cookie bayrakları)</li>
          <li>Veritabanı erişiminin yetkilendirilmiş personelle sınırlandırılması</li>
          <li>Düzenli güvenlik güncellemeleri ve zafiyet taramaları</li>
          <li>Yedekleme ve felaket kurtarma prosedürleri</li>
        </ul>
        <p className="mt-2"><strong>İdari Önlemler:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Veri erişimi için yetki matrisi uygulanması</li>
          <li>Çalışanların veri güvenliği konusunda bilgilendirilmesi</li>
          <li>Kişisel veri işleme envanteri tutulması</li>
          <li>Veri ihlali durumunda bildirim prosedürlerinin belirlenmesi</li>
        </ul>
      </Section>

      <Section title="Madde 6 – Verilerin Üçüncü Taraflarla Paylaşımı">
        <p>Kullanıcı'nın kişisel verileri, açık rızası olmaksızın üçüncü taraflarla paylaşılmaz. Aşağıdaki istisnai durumlar saklıdır:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Teslimat hizmeti:</strong> Sipariş teslimatı için gerekli minimum bilgilerin (ad, adres, telefon) teslimat personeliyle paylaşılması</li>
          <li><strong>Ödeme hizmeti:</strong> Online ödeme işlemleri için ödeme hizmeti sağlayıcısıyla (Tosla / Aktif Bank — AKÖDE Elektronik Para A.Ş.) paylaşım. Tosla, PCI DSS uyumlu güvenlik standartlarına sahiptir.</li>
          <li><strong>İletişim hizmeti:</strong> WhatsApp Business üzerinden sipariş iletişimi (Kullanıcı'nın talebi doğrultusunda)</li>
          <li><strong>Yasal zorunluluk:</strong> Kanun ve mevzuat gereği yetkili kamu kurum ve kuruluşlarına (mahkeme, savcılık, vergi dairesi vb.) bilgi aktarımı</li>
        </ul>
        <p className="mt-2">Kullanıcı'nın kişisel verileri hiçbir koşulda pazarlama, reklam veya profilleme amacıyla üçüncü taraflara satılmaz, kiralanmaz veya devredilmez. Yurt dışına veri aktarımı yapılmamaktadır.</p>
      </Section>

      <Section title="Madde 7 – Kullanıcı Hakları">
        <p>Kullanıcı, 6698 sayılı KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahiptir:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Kişisel verilerinin işlenip işlenmediğini öğrenme</li>
          <li>Kişisel verileri işlenmişse buna ilişkin bilgi talep etme</li>
          <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme</li>
          <li>Kişisel verilerin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme</li>
          <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme</li>
          <li>Düzeltme, silme veya yok etme işlemlerinin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
          <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhine bir sonucun ortaya çıkmasına itiraz etme</li>
          <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması halinde zararın giderilmesini talep etme</li>
          <li>Üyelik hesabının ve tüm kişisel verilerinin tamamen silinmesini talep etme</li>
        </ul>
      </Section>

      <Section title="Madde 8 – Veri Saklama Süreleri">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Üyelik bilgileri:</strong> Hesap aktif olduğu sürece; hesap silme talebinden itibaren 30 gün içinde imha edilir</li>
          <li><strong>Sipariş ve fatura bilgileri:</strong> Vergi mevzuatı gereği 5 yıl</li>
          <li><strong>İletişim kayıtları:</strong> 1 yıl</li>
          <li><strong>Çerez verileri:</strong> Çerez Politikası'nda belirtilen süreler boyunca</li>
        </ul>
        <p className="mt-2">Saklama süresi dolmuş veya işlenme amacı ortadan kalkmış veriler, re'sen veya Kullanıcı'nın talebi üzerine silinir, yok edilir veya anonim hale getirilir.</p>
      </Section>

      <Section title="Madde 9 – Çerezler">
        <p>Site, oturum yönetimi ve kullanıcı tercihlerinin saklanması amacıyla zorunlu ve işlevsel çerezler kullanmaktadır. Detaylı bilgi için <Link href="/cerez-politikasi" className="text-primary underline">Çerez Politikası</Link> sayfamızı inceleyebilirsiniz.</p>
      </Section>

      <Section title="Madde 10 – Sözleşme Değişiklikleri">
        <p>Şirket, işbu Sözleşme'yi yasal düzenlemelere ve hizmet değişikliklerine uygun olarak güncelleme hakkını saklı tutar. Önemli değişiklikler Site üzerinde duyurulur. Güncellenmiş Sözleşme, Site üzerinde yayınlandığı tarihte yürürlüğe girer.</p>
        <p>Kullanıcı, güncellenmiş Sözleşme yürürlüğe girdikten sonra Site'yi kullanmaya devam etmekle güncellenmiş hükümleri kabul etmiş sayılır.</p>
      </Section>

      <Section title="Madde 11 – Uyuşmazlık Çözümü">
        <p>İşbu Sözleşme'den doğan uyuşmazlıklarda Türkiye Cumhuriyeti kanunları uygulanır. Uyuşmazlıkların çözümünde <strong>Samsun Mahkemeleri ve İcra Daireleri</strong> yetkilidir.</p>
      </Section>

      <Section title="Madde 12 – Başvuru ve İletişim">
        <p>İşbu Sözleşme kapsamındaki haklarınızı kullanmak, sorularınızı iletmek veya veri işleme faaliyetlerimiz hakkında bilgi almak için:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>E-posta:</strong> <a href={`mailto:${COMPANY.email}`} className="text-primary underline">{COMPANY.email}</a></li>
          <li><strong>WhatsApp:</strong> <a href={`https://wa.me/${COMPANY.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-primary underline">{COMPANY.phone}</a></li>
          <li><strong>Adres:</strong> {COMPANY.address}</li>
        </ul>
        <p className="mt-2">Başvurularınız en geç <strong>30 gün</strong> içinde sonuçlandırılacaktır.</p>
        <p className="mt-2"><strong>Son güncelleme:</strong> {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </Section>
    </PageWrapper>
  );
}

export function KullanimKosullariPage() {
  return (
    <PageWrapper title="Kullanım Koşulları">
      <SEO title="Kullanım Koşulları | JETGO Samsun Pet Shop" description="JETGO Pet Shop web sitesi kullanım koşulları ve şartları. Site kullanımı, sipariş, ödeme, fikri mülkiyet ve sorumluluk sınırları hakkında bilgi." canonical={`${SITE_DOMAIN}/kullanim-kosullari`} />

      <Section>
        <p>İşbu Kullanım Koşulları ("Koşullar"), <strong>{COMPANY.name}</strong> tarafından işletilen {brandify("JETGO Pet Shop")} web sitesinin ("Site") kullanımına ilişkin kuralları ve koşulları belirler. Site'yi kullanarak işbu Koşulları kabul etmiş sayılırsınız.</p>
      </Section>

      <Section title="1. Hizmet Sağlayıcı Bilgileri">
        <CompanyInfoBlock />
      </Section>

      <Section title="2. Hizmet Kapsamı">
        <p>{brandify("JETGO Pet Shop")}, Samsun ili Atakum ilçesi ve çevresinde evcil hayvan ürünleri satışı ve teslimat hizmeti sunmaktadır.</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Kedi maması, köpek maması, kedi kumu, ödül mamaları, vitamin/takviyeler, bakım ürünleri, aksesuar ve evcil hayvan ekipmanları satışı yapılmaktadır.</li>
          <li>Açık mama (tartarak) satış hizmeti sunulmaktadır.</li>
          <li>Hizmet bölgemiz Samsun Atakum ilçesi ve çevresindeki belirli mahallelerle sınırlıdır.</li>
          <li>Hizmet bölgemiz dışındaki adreslere teslimat yapılmamaktadır.</li>
          <li>Yapay zeka destekli evcil hayvan bakım danışmanlığı hizmeti (genel bilgi amaçlı, veteriner tavsiyesi yerine geçmez).</li>
        </ul>
      </Section>

      <Section title="3. Üyelik Koşulları">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Site'ye üye olmak için geçerli bir telefon numarası ve 4 haneli şifre (doğum yılı) gereklidir.</li>
          <li>Üyelik bilgilerinin doğruluğundan Kullanıcı sorumludur.</li>
          <li>Her telefon numarası için yalnızca bir üyelik hesabı oluşturulabilir.</li>
          <li>Üyelik hesabının güvenliğinden Kullanıcı sorumludur; hesap bilgilerini üçüncü kişilerle paylaşmamalıdır.</li>
          <li>Şirket, uygunsuz kullanım tespit ettiğinde üyeliği askıya alma veya iptal etme hakkını saklı tutar.</li>
        </ul>
      </Section>

      <Section title="4. Sipariş ve Ödeme Koşulları">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Minimum sipariş tutarı <strong>500 TL</strong>'dir.</li>
          <li><strong>1.000 TL</strong> ve üzeri siparişlerde teslimat <strong>ücretsizdir</strong>. 1.000 TL altında <strong>89 TL</strong> teslimat ücreti uygulanır.</li>
          <li>Site'de gösterilen tüm fiyatlar KDV dahil Türk Lirası (TL) cinsindendir.</li>
          <li>Fiyatlar günceldir ancak stok durumuna, piyasa koşullarına ve döviz kurlarına göre değişiklik gösterebilir.</li>
          <li>Sipariş, WhatsApp üzerinden gönderildiğinde oluşturulmuş sayılır. Sipariş onayı Şirket tarafından verilir.</li>
          <li>Şirket, stok yetersizliği veya fiyat hatası durumunda siparişi iptal etme veya düzeltme hakkını saklı tutar.</li>
          <li>Ödeme yöntemleri: Kapıda nakit (%5 indirim), banka havalesi/EFT, kapıda POS ile kart, kapıda QR ödeme.</li>
        </ul>
      </Section>

      <Section title="5. Teslimat Koşulları">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Teslimat, sipariş formunda belirtilen adrese yapılır.</li>
          <li>Siparişler genellikle aynı gün veya ertesi iş günü teslim edilir.</li>
          <li>En geç sipariş tarihinden itibaren 30 gün içinde teslim edilir.</li>
          <li>Teslimat saatleri: Pazartesi-Cumartesi 09:00-20:00, Pazar 10:00-18:00.</li>
          <li>Mücbir sebeplerden kaynaklanan gecikmelerden Şirket sorumlu tutulamaz.</li>
          <li>Detaylı bilgi için <Link href="/teslimat-iade" className="text-primary underline">Teslimat ve İade Şartları</Link> sayfamızı inceleyiniz.</li>
        </ul>
      </Section>

      <Section title="6. İade ve Cayma Hakkı">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Açılmamış ve kullanılmamış ürünler, teslim tarihinden itibaren <strong>14 gün</strong> içinde iade edilebilir.</li>
          <li>Açılmış gıda ürünleri, açık mama, açılmış hijyen ürünleri ve tek kullanımlık ürünlerde iade kabul edilmez.</li>
          <li>İade talebi WhatsApp hattımız ({COMPANY.phone}) veya e-posta ({COMPANY.email}) üzerinden iletilmelidir.</li>
          <li>Detaylı iade koşulları için <Link href="/teslimat-iade" className="text-primary underline">Teslimat ve İade Şartları</Link> sayfamızı inceleyiniz.</li>
        </ul>
      </Section>

      <Section title="7. Fikri Mülkiyet Hakları">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Site'de yer alan {brandify("JETGO")} logosu, tasarım, grafik, metin, yazılım ve diğer tüm içerik {COMPANY.name}'ne aittir ve Fikri ve Sınai Mülkiyet Hakları mevzuatı ile korunmaktadır.</li>
          <li>Site içeriği izinsiz kopyalanamaz, çoğaltılamaz, dağıtılamaz, yayınlanamaz veya ticari amaçla kullanılamaz.</li>
          <li>Ürün görselleri, ilgili markaların ve üreticilerin mülkiyetindedir; bilgilendirme amacıyla kullanılmaktadır.</li>
        </ul>
      </Section>

      <Section title="8. Kullanıcı Yükümlülükleri">
        <p>Kullanıcı, Site'yi kullanırken:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Türkiye Cumhuriyeti kanunlarına ve genel ahlak kurallarına uygun davranmayı,</li>
          <li>Doğru ve güncel bilgi vermeyi,</li>
          <li>Başkalarının hesap bilgilerini kullanmamayı,</li>
          <li>Site'nin işleyişini engelleyecek veya bozacak davranışlarda bulunmamayı,</li>
          <li>Otomatik veri toplama araçları (bot, scraper vb.) kullanmamayı kabul ve taahhüt eder.</li>
        </ul>
      </Section>

      <Section title="9. Sorumluluk Sınırları">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Ürün görselleri temsilidir; renk, boyut ve ambalaj farklılıkları olabilir.</li>
          <li>Son kullanma tarihi yaklaşan ürünler indirimli olarak satışa sunulabilir ve bu durum ürün sayfasında belirtilir.</li>
          <li>Yapay zeka pet bakım danışmanlığı genel bilgi amaçlıdır ve profesyonel veteriner tavsiyesi yerine geçmez.</li>
          <li>Site'de yer alan bilgilerin doğruluğu konusunda azami özen gösterilmekle birlikte, teknik hatalar, fiyat hataları veya güncellenememiş bilgilerden dolayı Şirket sorumlu tutulamaz.</li>
          <li>Şirket, tespit edilen fiyat hatalarında siparişi iptal etme ve doğru fiyatı bildirme hakkını saklı tutar.</li>
          <li>Mücbir sebepler nedeniyle hizmet kesintilerinden Şirket sorumlu tutulamaz.</li>
        </ul>
      </Section>

      <Section title="10. Uygulanacak Hukuk ve Uyuşmazlık">
        <p>İşbu Koşullar, Türkiye Cumhuriyeti kanunlarına tabidir. Koşullardan doğan uyuşmazlıklarda <strong>Samsun Mahkemeleri ve İcra Daireleri</strong> yetkilidir.</p>
      </Section>

      <Section title="11. Değişiklikler">
        <p>Şirket, işbu Kullanım Koşulları'nı önceden bildirmeksizin güncelleme hakkını saklı tutar. Güncel koşullar her zaman bu sayfada yayınlanır ve yayınlandığı tarihte yürürlüğe girer.</p>
        <p className="mt-2"><strong>Son güncelleme:</strong> {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </Section>
    </PageWrapper>
  );
}

function CerezPolitikasiJetgo() {
  return (
    <PageWrapper title="Çerez (Cookie) Politikası">
      <SEO title="Çerez Politikası | JETGO" description="Jetgomarket.com çerez (cookie) politikası: çerez türleri, üçüncü taraf çerezleri, saklama süreleri ve çerez yönetimi." canonical={`${SITE_DOMAIN}/cerez-politikasi`} />

      <Section>
        <p><strong>Son Güncelleme:</strong> 27.06.2026</p>
        <p>Jetgomarket.com ("Site"), ziyaretçilerimize daha güvenli, hızlı ve verimli bir kullanıcı deneyimi sunabilmek amacıyla çerez (cookie) teknolojisini kullanmaktadır.</p>
        <p>Bu politika, web sitemizde kullanılan çerezlerin türlerini, kullanım amaçlarını ve çerez tercihlerinizi nasıl yönetebileceğinizi açıklamaktadır.</p>
      </Section>

      <Section title="1. Çerez (Cookie) Nedir?">
        <p>Çerezler; ziyaret ettiğiniz internet siteleri tarafından tarayıcınıza veya cihazınıza kaydedilen küçük metin dosyalarıdır.</p>
        <p>Bu dosyalar sayesinde internet sitesi sizi sonraki ziyaretlerinizde tanıyabilir ve kullanıcı deneyiminizi geliştirebilir.</p>
      </Section>

      <Section title="2. Hangi Çerezleri Kullanıyoruz?">
        <p><strong>a) Zorunlu Çerezler</strong></p>
        <p>Bu çerezler web sitesinin düzgün çalışabilmesi için gereklidir. Örneğin;</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Oturum yönetimi</li>
          <li>Sepet işlemleri</li>
          <li>Güvenli giriş</li>
          <li>Sipariş süreci</li>
          <li>Güvenlik doğrulamaları</li>
        </ul>
        <p className="mt-1">Bu çerezler kapatılamaz.</p>

        <p className="mt-3"><strong>b) Performans ve Analiz Çerezleri</strong></p>
        <p>Web sitemizin performansını geliştirmek amacıyla anonim istatistikler oluşturulabilir. Bu kapsamda;</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Sayfa görüntüleme sayıları</li>
          <li>Ziyaret süreleri</li>
          <li>Hata kayıtları</li>
          <li>Trafik kaynakları</li>
        </ul>
        <p className="mt-1">analiz edilebilir.</p>

        <p className="mt-3"><strong>c) İşlevsellik Çerezleri</strong></p>
        <p>Bu çerezler kullanıcı tercihlerini hatırlamak amacıyla kullanılabilir. Örneğin;</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Dil tercihi</li>
          <li>Bölge seçimi</li>
          <li>Sepetteki ürünler</li>
          <li>Kullanıcı tercihleri</li>
        </ul>

        <p className="mt-3"><strong>d) Reklam ve Pazarlama Çerezleri</strong></p>
        <p>Onay vermeniz halinde;</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>İlgi alanlarınıza uygun reklam gösterimi,</li>
          <li>Reklam performansının ölçülmesi,</li>
          <li>Yeniden pazarlama (Remarketing),</li>
          <li>Kampanya analizleri</li>
        </ul>
        <p className="mt-1">amacıyla reklam çerezleri kullanılabilir.</p>
      </Section>

      <Section title="3. Üçüncü Taraf Çerezleri">
        <p>Web sitemizde aşağıdaki hizmet sağlayıcıların çerezleri kullanılabilir:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Google Analytics</li>
          <li>Google Ads</li>
          <li>Google Tag Manager</li>
          <li>Meta (Facebook / Instagram)</li>
          <li>Ödeme kuruluşları</li>
          <li>Kargo takip sistemleri</li>
        </ul>
        <p className="mt-1">Bu hizmet sağlayıcılar kendi gizlilik politikaları doğrultusunda veri işleyebilir.</p>
      </Section>

      <Section title="4. Çerezlerin Saklanma Süresi">
        <p>Çerezler;</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Oturum süresince,</li>
          <li>Belirli bir süre boyunca,</li>
          <li>Tarayıcı ayarlarınız değiştirilinceye kadar</li>
        </ul>
        <p className="mt-1">saklanabilir.</p>
      </Section>

      <Section title="5. Çerezleri Nasıl Kontrol Edebilirsiniz?">
        <p>Tarayıcınızın ayarlarını değiştirerek;</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Çerezleri engelleyebilir,</li>
          <li>Mevcut çerezleri silebilir,</li>
          <li>Yeni çerezleri reddedebilir,</li>
          <li>Belirli internet siteleri için izin verebilirsiniz.</li>
        </ul>
        <p className="mt-1">Ancak zorunlu çerezlerin devre dışı bırakılması durumunda web sitesinin bazı bölümleri düzgün çalışmayabilir.</p>
      </Section>

      <Section title="6. Kişisel Verilerin Korunması">
        <p>Çerezler aracılığıyla elde edilen kişisel veriler, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve ilgili mevzuata uygun olarak işlenmektedir.</p>
        <p>Detaylı bilgi için <Link href="/kvkk" className="text-primary underline">KVKK Aydınlatma Metni</Link> ve <Link href="/gizlilik" className="text-primary underline">Gizlilik Politikası</Link> sayfalarımızı inceleyebilirsiniz.</p>
      </Section>

      <Section title="7. Çerez Tercihleri">
        <p>İlk ziyaretinizde sunulan çerez tercih ekranı üzerinden, zorunlu olmayan çerezlere ilişkin tercihlerinizi belirleyebilir ve dilediğiniz zaman değiştirebilirsiniz.</p>
      </Section>

      <Section title="8. Politika Değişiklikleri">
        <p>Jetgomarket.com, işbu Çerez Politikası'nı yürürlükteki mevzuata veya hizmetlerinde meydana gelen değişikliklere bağlı olarak güncelleyebilir.</p>
        <p>Güncel sürüm her zaman internet sitemizde yayımlanır.</p>
      </Section>

      <Section title="İletişim">
        <CompanyInfoBlock />
      </Section>
    </PageWrapper>
  );
}

export function CerezPage() {
  if (CURRENT_STORE.id === "jetgo") return <CerezPolitikasiJetgo />;
  return (
    <PageWrapper title="Çerez Politikası">
      <SEO title="Çerez Politikası | JETGO Samsun Pet Shop" description="JETGO Pet Shop çerez (cookie) kullanımı hakkında detaylı bilgilendirme. Çerez türleri, kullanım amaçları ve yönetimi." canonical={`${SITE_DOMAIN}/cerez-politikasi`} />

      <Section>
        <p><strong>{COMPANY.name}</strong> ("{brandify("JETGO")}") olarak web sitemizde çerezler (cookies) kullanmaktayız. İşbu Çerez Politikası, sitemizde hangi çerezlerin kullanıldığını, ne amaçla kullanıldığını ve çerezleri nasıl yönetebileceğinizi açıklamaktadır.</p>
        <p>Sitemizi kullanarak çerez kullanımına onay vermiş sayılırsınız.</p>
      </Section>

      <Section title="1. Çerez Nedir?">
        <p>Çerezler (cookies), web sitemizi ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza (bilgisayar, tablet veya akıllı telefon) yerleştirilen küçük metin dosyalarıdır. Bu dosyalar, tercihlerinizi hatırlamamıza, oturumunuzu yönetmemize ve site kullanımınızı iyileştirmemize yardımcı olur.</p>
        <p>Çerezler, kişisel dosyalarınıza erişim sağlamaz ve cihazınıza zarar vermez.</p>
      </Section>

      <Section title="2. Kullanılan Çerez Türleri">
        <p><strong>a) Zorunlu Çerezler (Teknik Çerezler)</strong></p>
        <p>Site'nin düzgün çalışması için gerekli olan çerezlerdir. Bu çerezler olmadan giriş yapma, sepet yönetimi ve sipariş verme gibi temel işlevler çalışmaz.</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Oturum çerezi:</strong> Giriş yapmanızı ve oturumunuzun sürdürülmesini sağlar. Tarayıcı kapatıldığında veya oturum süresi dolduğunda otomatik olarak silinir.</li>
          <li><strong>Güvenlik çerezi:</strong> CSRF koruması ve güvenli form gönderimi için kullanılır.</li>
        </ul>

        <p className="mt-3"><strong>b) İşlevsel Çerezler (Tercih Çerezleri)</strong></p>
        <p>Tercihlerinizi hatırlayarak size daha iyi bir deneyim sunmamızı sağlar.</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Sepet çerezi (jet55_cart):</strong> Sepetinize eklediğiniz ürünleri sayfalar arasında geçiş yaptığınızda korur. Oturum sonuna kadar veya siz silene kadar saklanır.</li>
          <li><strong>Mahalle tercihi (jet55_mahalle):</strong> Seçtiğiniz teslimat mahallesini hatırlar.</li>
          <li><strong>Favori ürünler:</strong> Favori olarak işaretlediğiniz ürünleri saklar.</li>
          <li><strong>Son görüntülenen ürünler:</strong> Son baktığınız ürünleri hatırlar ve size gösterir.</li>
          <li><strong>PWA kurulum tercihi:</strong> Uygulama kurulum bildirimini daha önce kapattıysanız tekrar göstermez.</li>
        </ul>
      </Section>

      <Section title="3. Kullanmadığımız Çerezler">
        <p>Aşağıdaki çerez türleri sitemizde <strong>kullanılmamaktadır</strong>:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Reklam çerezleri:</strong> Üçüncü taraf reklam çerezleri kullanmıyoruz.</li>
          <li><strong>İzleme/takip çerezleri:</strong> Google Analytics veya benzeri izleme araçları kullanmıyoruz.</li>
          <li><strong>Sosyal medya çerezleri:</strong> Sosyal medya paylaşım butonları veya izleme pikselleri kullanmıyoruz.</li>
          <li><strong>Profilleme çerezleri:</strong> Kullanıcıları profilleme amacıyla çerez kullanmıyoruz.</li>
        </ul>
      </Section>

      <Section title="4. Çerez Saklama Süreleri">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Oturum çerezleri:</strong> Tarayıcı kapatıldığında veya oturum süresi dolduğunda silinir.</li>
          <li><strong>Sepet çerezi:</strong> Tarayıcı verilerini temizleyene kadar veya 30 gün boyunca saklanır.</li>
          <li><strong>Tercih çerezleri:</strong> Siz silene kadar veya 1 yıl boyunca saklanır.</li>
          <li><strong>Favori ve son görüntülenen:</strong> Siz silene kadar saklanır (localStorage).</li>
        </ul>
      </Section>

      <Section title="5. Çerez Yönetimi">
        <p>Çerezleri tarayıcı ayarlarınızdan yönetebilirsiniz. Çoğu tarayıcı, çerezleri kabul etme, reddetme veya silme seçenekleri sunar.</p>
        <p className="mt-2"><strong>Tarayıcı bazında çerez ayarları:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Google Chrome:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler ve site verileri</li>
          <li><strong>Mozilla Firefox:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler ve Site Verileri</li>
          <li><strong>Safari:</strong> Tercihler → Gizlilik → Çerezleri ve web sitesi verilerini yönet</li>
          <li><strong>Microsoft Edge:</strong> Ayarlar → Çerezler ve site izinleri</li>
          <li><strong>Mobil tarayıcılar:</strong> Tarayıcı ayarları → Gizlilik → Çerezler</li>
        </ul>
        <p className="mt-2"><strong>Önemli:</strong> Zorunlu çerezleri devre dışı bırakmanız halinde Site'nin bazı temel özellikleri (oturum açma, sepet yönetimi, sipariş verme, favoriler) düzgün çalışmayabilir.</p>
      </Section>

      <Section title="6. localStorage Kullanımı">
        <p>Site, çerezlere ek olarak tarayıcınızın localStorage özelliğini de kullanmaktadır. localStorage verileri tarayıcınızda kalıcı olarak saklanır ve sunucuya otomatik olarak gönderilmez.</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Sepet içeriği</li>
          <li>Favori ürünler</li>
          <li>Son görüntülenen ürünler</li>
          <li>Mahalle tercihi</li>
        </ul>
        <p className="mt-2">localStorage verilerini tarayıcınızın "Site Verilerini Temizle" seçeneğiyle silebilirsiniz.</p>
      </Section>

      <Section title="7. Politika Değişiklikleri">
        <p>İşbu Çerez Politikası, yasal düzenlemeler ve hizmet değişiklikleri doğrultusunda güncellenebilir. Güncellenmiş politika, Site üzerinde yayınlandığı tarihte yürürlüğe girer.</p>
        <p className="mt-2"><strong>Son güncelleme:</strong> {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </Section>

      <Section title="İletişim">
        <p>Çerez politikamız hakkında sorularınız için <a href={`mailto:${COMPANY.email}`} className="text-primary underline">{COMPANY.email}</a> adresinden veya <a href={`https://wa.me/${COMPANY.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-primary underline">WhatsApp hattımızdan</a> bize ulaşabilirsiniz.</p>
      </Section>
    </PageWrapper>
  );
}

export function HakkimizdaPage() {
  return (
    <PageWrapper title="Hakkımızda">
      <SEO title="Hakkımızda | JETGO Samsun Pet Shop" description="JETGO - Samsun Atakum'un güvenilir pet shop'u. Sizpa İnternet Tic. Ltd. Şti. tarafından işletilmektedir. Kedi, köpek, kuş ve kemirgen ürünlerinde kaliteli hizmet." canonical={`${SITE_DOMAIN}/hakkimizda`} />

      <Section>
        <p><strong>{COMPANY.name}</strong> bünyesinde faaliyet gösteren <strong>{brandify("JETGO Pet Shop")}</strong> olarak, Samsun Atakum'da evcil hayvan sahiplerine kaliteli ürünleri en uygun fiyatlarla ulaştırmayı hedefliyoruz.</p>
      </Section>

      <Section title="Biz Kimiz?">
        <p>{brandify("JETGO")}, kedi, köpek, kuş ve kemirgen sahiplerinin tüm ihtiyaçlarını tek bir noktadan karşılayan modern bir pet shop platformudur. Geniş ürün yelpazemiz ile evcil hayvanınızın beslenme, bakım ve aksesuar ihtiyaçlarını hızlı ve güvenilir bir şekilde karşılıyoruz.</p>
        <p className="mt-2">Ürün portföyümüzde 900'den fazla ürün çeşidiyle hizmet vermekteyiz:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Kuru mamalar (yavru, yetişkin, kısırlaştırılmış, ırk bazlı, diyet)</li>
          <li>Yaş mamalar ve konserveler</li>
          <li>Kedi kumu çeşitleri</li>
          <li>Ödül mamaları ve kemikleri</li>
          <li>Vitamin, takviye ve macunlar</li>
          <li>Bakım ürünleri (şampuan, diş bakımı, tırnak makası)</li>
          <li>Tasma, kayış ve aksesuar çeşitleri</li>
          <li>Taşıma çantası, kafes ve ev ürünleri</li>
          <li>Oyuncak ve eğitim ürünleri</li>
          <li>Kuş ve kemirgen yemi ve aksesuarları</li>
          <li>Açık mama (tartarak) satışı</li>
        </ul>
      </Section>

      <Section title="Markalarımız">
        <p>Dünyaca ünlü ve güvenilir markaların yetkili satıcısıyız:</p>
        <p className="mt-1">Royal Canin, Pro Plan, Hill's Science Plan, N&D Farmina, Reflex, Reflex Plus, ProChoice, Brit Care, Profine, Acana, Orijen, Gimcat, Gimdog, Felix, Gourmet, Purina, Wahlen, Bioline, M-Pets, Pawise, Nunbell ve daha fazlası.</p>
      </Section>

      <Section title={brandify("Neden JETGO?")}>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Uygun fiyat garantisi:</strong> Piyasanın en uygun fiyatlarıyla, kaliteden ödün vermeden hizmet veriyoruz.</li>
          <li><strong>Aynı gün teslimat:</strong> Samsun Atakum bölgesinde aynı gün veya ertesi gün kapınıza teslim.</li>
          <li><strong>Çoklu ödeme seçeneği:</strong> Kapıda nakit (%5 indirim), kart, QR ödeme imkanı.</li>
          <li><strong>900+ ürün çeşidi:</strong> Evcil hayvanınızın tüm ihtiyaçları tek adreste.</li>
          <li><strong>Açık mama satışı:</strong> İstediğiniz kadar, istediğiniz markadan açık mama.</li>
          <li><strong>Akıllı mama hesaplama:</strong> Evcil hayvanınıza özel günlük mama miktarı hesaplama ve mama bitimi hatırlatması.</li>
          <li><strong>Yapay zeka danışman:</strong> Evcil hayvan bakımı hakkında anında sorular sorabilirsiniz.</li>
          <li><strong>Kolay sipariş:</strong> WhatsApp ile hızlı ve güvenli sipariş süreci.</li>
          <li><strong>SKT takibi:</strong> Son kullanma tarihi yaklaşan ürünleri indirimli fiyatlarla sunuyoruz.</li>
        </ul>
      </Section>

      <Section title="Şirket Bilgileri">
        <CompanyInfoBlock />
      </Section>

      <Section title="Çalışma Saatleri">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Pazartesi - Cumartesi:</strong> 09:00 - 20:00</li>
          <li><strong>Pazar:</strong> 10:00 - 18:00</li>
        </ul>
      </Section>
    </PageWrapper>
  );
}

export function IletisimPage() {
  return (
    <PageWrapper title="İletişim">
      <SEO title="İletişim | JETGO Samsun Pet Shop" description="JETGO Pet Shop iletişim bilgileri. Samsun Atakum'da evcil hayvan ürünleri siparişi için bize ulaşın. Telefon, WhatsApp, e-posta." canonical={`${SITE_DOMAIN}/iletisim`} />

      <div className="space-y-4">
        <div className="p-5 border rounded-lg space-y-4" data-testid="contact-info">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">{COMPANY.name}</h2>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Adres</p>
              <p className="text-sm text-muted-foreground">{COMPANY.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Telefon / WhatsApp</p>
              <a href={`tel:${COMPANY.phoneHref}`} className="text-sm text-primary" data-testid="contact-phone">{COMPANY.phone}</a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">E-posta</p>
              <a href={`mailto:${COMPANY.email}`} className="text-sm text-primary" data-testid="contact-email">{COMPANY.email}</a>
            </div>
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-muted/30 space-y-1 text-sm">
          <p><strong>Tic. Sicil No:</strong> {COMPANY.ticSicilNo}</p>
          <p><strong>MERSİS No:</strong> {COMPANY.mersisNo}</p>
          <p><strong>Vergi Dairesi / No:</strong> {COMPANY.vergiDairesi} / {COMPANY.vergiNo}</p>
        </div>

        <a
          href={`https://wa.me/${COMPANY.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 p-4 rounded-lg text-white font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#25D366" }}
          data-testid="contact-whatsapp"
        >
          <SiWhatsapp className="w-5 h-5" />
          WhatsApp ile Ulaşın
        </a>

        <div className="p-5 border rounded-lg" data-testid="working-hours">
          <h2 className="font-semibold mb-3">Çalışma Saatleri</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pazartesi - Cumartesi</span>
              <span className="font-medium">09:00 - 20:00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pazar</span>
              <span className="font-medium">10:00 - 18:00</span>
            </div>
          </div>
        </div>

        <div className="p-5 border rounded-lg" data-testid="delivery-info">
          <h2 className="font-semibold mb-3">Teslimat Bilgileri</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Samsun Atakum bölgesine aynı gün veya ertesi gün teslimat</li>
            <li>Minimum sipariş tutarı: 500 TL</li>
            <li>1.000 TL ve üzeri siparişlerde ücretsiz teslimat</li>
            <li>1.000 TL altı siparişlerde teslimat ücreti: 89 TL</li>
            <li>Kapıda nakit ödemede %5 indirim</li>
          </ul>
        </div>

        <div className="p-5 border rounded-lg" data-testid="payment-info">
          <h2 className="font-semibold mb-3">Ödeme Yöntemleri</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Kapıda nakit ödeme (%5 indirim)</li>
            <li>Banka havalesi / EFT</li>
            <li>Kapıda POS cihazı ile kredi kartı / banka kartı</li>
            <li>Kapıda QR ödeme (mobil bankacılık)</li>
          </ul>
        </div>
      </div>
    </PageWrapper>
  );
}

export function MagazaPage() {
  const storeFaqs = [
    {
      q: brandify("JETGO Pet Shop mağazası nerede?"),
      a: `Mağazamız ${COMPANY.address} adresinde, Atakum'un merkezi konumunda Atatürk Bulvarı üzerinde yer almaktadır. OMÜ Eğitim ve Araştırma Hastanesi, Atakum Sahili ve Yenimahalle bölgesine yürüme mesafesindedir.`
    },
    {
      q: "Atakum'da aynı gün teslimat var mı?",
      a: "Evet. Atakum, İlkadım ve Canik içindeki tüm hizmet bölgelerimize aynı gün teslimat yapıyoruz. Saat 18:00'a kadar verilen siparişler aynı gün, sonrası ise ertesi gün teslim edilir."
    },
    {
      q: "Mağazadan paket teslim alabilir miyim?",
      a: "Evet, sipariş verdikten sonra mağazadan ücretsiz teslim alma seçeneğini tercih edebilirsiniz. WhatsApp üzerinden hazır olduğunda size bildirim gönderiyoruz."
    },
    {
      q: "Mağazada hangi ürünler bulunur?",
      a: "Mağazamızda 900+ ürün bulunmaktadır: kedi maması, köpek maması, kedi kumu, açık mama, ödül-ek besin, oyuncak, tasma-kayış, kuş yemi, kemirgen yemi, akvaryum yemi ve hijyen ürünleri stoklarımızda mevcuttur."
    },
    {
      q: "Çalışma saatleriniz nedir?",
      a: "Pazartesi-Cumartesi 09:00-22:00, Pazar 10:00-22:00 saatleri arasında hizmet veriyoruz. Online sipariş 7/24 alınmaktadır."
    },
    {
      q: "Otopark var mı?",
      a: "Mağazamızın önünde ve Atatürk Bulvarı üzerinde ücretsiz cadde otoparkı bulunmaktadır."
    },
    {
      q: "Samsun içinde kapıda ödeme alıyor musunuz?",
      a: "Evet. Kapıda nakit ödemede %5 indirim uygulanır. Ayrıca POS ile kredi/banka kartı, QR ödeme ve havale/EFT seçenekleri mevcuttur."
    },
    {
      q: "Ürünlerin son kullanma tarihini görebilir miyim?",
      a: "Evet. Tüm mama, konserve ve gıda ürünlerimizin son kullanma tarihi ürün sayfasında belirtilir. SKT'si yaklaşan ürünler indirimli fiyatlarla 'Açık Mama / SKT Yakın' bölümünde sunulur ve sipariş öncesi sistem tarafından kontrol edilir."
    },
  ];

  const storeJsonLd = {
    "@context": "https://schema.org",
    "@type": "PetStore",
    "@id": `${SITE_DOMAIN}/magaza#location`,
    "name": "JETGO Pet Shop - Atakum Mağazası",
    "url": `${SITE_DOMAIN}/magaza`,
    "image": `${SITE_DOMAIN}/og-image.webp`,
    "telephone": COMPANY.phoneHref,
    "email": COMPANY.email,
    "priceRange": "₺₺",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Yenimahalle Atatürk 3. Kısım Bulvarı No:113/A",
      "addressLocality": "Atakum",
      "addressRegion": "Samsun",
      "postalCode": "55200",
      "addressCountry": "TR"
    },
    "geo": { "@type": "GeoCoordinates", "latitude": 41.2867, "longitude": 36.33 },
    "hasMap": "https://www.google.com/maps/search/?api=1&query=Yenimahalle+Atatürk+3.+Kısım+Bulvarı+113%2FA+Atakum+Samsun",
    "openingHoursSpecification": [
      { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], "opens": "09:00", "closes": "22:00" },
      { "@type": "OpeningHoursSpecification", "dayOfWeek": "Sunday", "opens": "10:00", "closes": "22:00" }
    ],
    "areaServed": [
      { "@type": "City", "name": "Samsun" },
      { "@type": "AdministrativeArea", "name": "Atakum" },
      { "@type": "AdministrativeArea", "name": "İlkadım" },
      { "@type": "AdministrativeArea", "name": "Canik" }
    ]
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": SITE_DOMAIN },
      { "@type": "ListItem", "position": 2, "name": "Mağaza", "item": `${SITE_DOMAIN}/magaza` }
    ]
  };

  return (
    <PageWrapper title={brandify("JETGO Pet Shop Atakum Mağazası")}>
      <SEO
        title="JETGO Atakum Mağaza | Samsun Pet Shop Adres, Harita, Çalışma Saatleri"
        description="JETGO Pet Shop Atakum mağazası: Yenimahalle Atatürk 3. Kısım Bulvarı No:113/A. Aynı gün teslimat, kapıda ödeme, 900+ ürün. Pzt-Cmt 09:00-22:00, Pazar 10:00-22:00."
        canonical={`${SITE_DOMAIN}/magaza`}
        keywords="atakum petshop mağaza, samsun pet shop adres, jetgo mağaza, atakum pet shop, yenimahalle pet shop, samsun petshop konum"
        jsonLd={[storeJsonLd, breadcrumbJsonLd, FAQ_JSONLD(storeFaqs.map(f => ({ question: f.q, answer: f.a })))]}
      />

      <div className="space-y-6">
        <div className="p-5 border rounded-lg bg-gradient-to-br from-primary/5 to-transparent" data-testid="store-hero">
          <div className="flex items-start gap-3">
            <Store className="w-7 h-7 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-base mb-1">{brandify("JETGO Pet Shop")} — Atakum, Samsun</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Samsun Atakum'un merkezinde, Atatürk Bulvarı üzerinde hizmet veren mahalle pet shop'unuz.
                900+ ürün, taze stok, son kullanma tarihi kontrollü mama, kapıda ödeme ve aynı gün teslimat seçenekleriyle
                Samsun içindeki tüm hizmet bölgelerimize hizmet veriyoruz.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 border rounded-lg space-y-3" data-testid="store-nap">
            <h2 className="font-semibold flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />Adres ve İletişim</h2>
            <div className="text-sm space-y-2">
              <p><strong>Adres:</strong><br />{COMPANY.address}</p>
              <p>
                <strong>Telefon:</strong>{" "}
                <a href={`tel:${COMPANY.phoneHref}`} className="text-primary underline" data-testid="store-phone">{COMPANY.phone}</a>
              </p>
              <p>
                <strong>WhatsApp:</strong>{" "}
                <a href={`https://wa.me/${COMPANY.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 underline" data-testid="store-whatsapp">+90 850 840 3959</a>
              </p>
              <p><strong>E-posta:</strong> <a href={`mailto:${COMPANY.email}`} className="text-primary underline">{COMPANY.email}</a></p>
            </div>
            <div className="flex gap-2 pt-1">
              <a
                href={`https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(`Merhaba, ${brandify("JETGO Pet Shop")} hakkında bilgi almak istiyorum.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
                data-testid="button-store-whatsapp"
              >
                <SiWhatsapp className="w-4 h-4" /> WhatsApp
              </a>
              <a
                href={`tel:${COMPANY.phoneHref}`}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
                data-testid="button-store-call"
              >
                <Phone className="w-4 h-4" /> Ara
              </a>
            </div>
          </div>

          <div className="p-5 border rounded-lg space-y-3" data-testid="store-hours">
            <h2 className="font-semibold flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />Çalışma Saatleri</h2>
            <ul className="text-sm space-y-1.5">
              <li className="flex justify-between"><span>Pazartesi</span><span className="text-muted-foreground">09:00 - 22:00</span></li>
              <li className="flex justify-between"><span>Salı</span><span className="text-muted-foreground">09:00 - 22:00</span></li>
              <li className="flex justify-between"><span>Çarşamba</span><span className="text-muted-foreground">09:00 - 22:00</span></li>
              <li className="flex justify-between"><span>Perşembe</span><span className="text-muted-foreground">09:00 - 22:00</span></li>
              <li className="flex justify-between"><span>Cuma</span><span className="text-muted-foreground">09:00 - 22:00</span></li>
              <li className="flex justify-between"><span>Cumartesi</span><span className="text-muted-foreground">09:00 - 22:00</span></li>
              <li className="flex justify-between"><span>Pazar</span><span className="text-muted-foreground">10:00 - 22:00</span></li>
            </ul>
            <p className="text-xs text-muted-foreground pt-1">Online sipariş hattımız 7/24 açıktır. Aynı gün teslimat için saat 18:00'a kadar sipariş verebilirsiniz.</p>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden" data-testid="store-map">
          <iframe
            title={brandify("JETGO Pet Shop Atakum Mağaza Konumu")}
            src="https://maps.google.com/maps?q=Yenimahalle%20Atat%C3%BCrk%203.%20K%C4%B1s%C4%B1m%20Bulvar%C4%B1%20No%3A113%2FA%20Atakum%20Samsun&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="320"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block w-full"
          />
          <div className="p-3 flex items-center justify-between gap-3 bg-muted/30 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Navigation className="w-4 h-4" />
              Atakum, Samsun
            </span>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Yenimahalle+Atat%C3%BCrk+3.+K%C4%B1s%C4%B1m+Bulvar%C4%B1+113%2FA+Atakum+Samsun"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium underline"
              data-testid="link-store-directions"
            >
              Yol Tarifi Al →
            </a>
          </div>
        </div>

        <div className="p-5 border rounded-lg space-y-2" data-testid="store-about">
          <h2 className="font-semibold">Mağazamız Hakkında</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {brandify("JETGO Pet Shop")}, Samsun Atakum'da kurulmuş bir mahalle pet shop'tur. Kedi maması, köpek maması, kedi kumu,
            açık mama, ödül-ek besin, oyuncak, tasma, kuş yemi, kemirgen yemi, akvaryum ürünleri ve hijyen ürünleri
            kategorilerinde 900+ ürün bulundurmaktayız.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tüm gıda ürünlerimizin son kullanma tarihini sistemimiz üzerinden takip ediyoruz; SKT'si yaklaşan ürünler
            "Açık Mama / SKT Yakın" bölümünde indirimli fiyatlarla sunulur. Açılmış mama satışı yapıyor, isteyen
            müşterilerimize gramaj bazlı tartım hizmeti veriyoruz.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Kapıda nakit (%5 indirimli), kapıda kart (POS), QR ödeme ve havale/EFT seçenekleriyle kolay ödeme imkânı
            sunuyoruz. "Askıda Mama" projemizle sokak hayvanlarına destek olabilirsiniz.
          </p>
        </div>

        <div className="p-5 border rounded-lg space-y-3" data-testid="store-areas">
          <h2 className="font-semibold flex items-center gap-2"><Truck className="w-4 h-4 text-primary" />Aynı Gün Teslimat Bölgeleri</h2>
          <p className="text-sm text-muted-foreground">
            Samsun Atakum, İlkadım ve Canik ilçeleri içindeki mahallelerimize aynı gün teslimat yapıyoruz. Aşağıdaki
            mahalle sayfalarımızdan bölgenize özel petshop hizmetimizi inceleyebilirsiniz:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { label: "Atakum Pet Shop", href: "/atakum-petshop" },
              { label: "İlkadım Pet Shop", href: "/ilkadim-petshop" },
              { label: "Canik Pet Shop", href: "/canik-petshop" },
              { label: "Samsun Pet Shop", href: "/samsun-petshop" },
              { label: "Aynı Gün Teslimat", href: "/ayni-gun-teslimat-petshop" },
              { label: "Kapıda Ödeme Petshop", href: "/kapida-odeme-petshop" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs px-3 py-1.5 rounded-full border bg-muted/40 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-colors"
                data-testid={`store-area-${l.href.slice(1)}`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="p-5 border rounded-lg space-y-3" data-testid="store-categories">
          <h2 className="font-semibold flex items-center gap-2"><Heart className="w-4 h-4 text-primary" />Mağazadaki Kategoriler</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Kedi Maması", href: "/kedi-mamasi" },
              { label: "Köpek Maması", href: "/kopek-mamasi" },
              { label: "Kedi Kumu", href: "/kedi-kumu" },
              { label: "Pet Aksesuar", href: "/pet-aksesuar" },
              { label: "Açık Mama", href: "/acik-mama" },
              { label: "Kampanyalar", href: "/kampanya" },
              { label: "Tüm Markalar", href: "/markalar" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs px-3 py-1.5 rounded-full border bg-muted/40 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-colors"
                data-testid={`store-cat-${l.href.slice(1)}`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-2" data-testid="store-faq">
          <h2 className="font-semibold flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" />Mağaza Hakkında Sıkça Sorulanlar</h2>
          {storeFaqs.map((faq, i) => (
            <details key={i} className="border rounded-lg p-3 group" data-testid={`store-faq-${i}`}>
              <summary className="cursor-pointer text-sm font-medium flex items-center justify-between gap-2">
                <span>{faq.q}</span>
                <ChevronDown className="w-4 h-4 flex-shrink-0 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>

        <div className="p-4 border rounded-lg bg-muted/30 text-sm" data-testid="store-cta">
          <p className="text-muted-foreground">
            Sipariş için <Link href="/" className="text-primary underline font-medium">ana sayfaya</Link> dönüp ürünlere göz atabilir
            ya da <a href={`https://wa.me/${COMPANY.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-primary underline font-medium">WhatsApp</a> üzerinden bize ulaşabilirsiniz.
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}
