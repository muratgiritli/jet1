import { Link } from "wouter";
import { Phone, Mail, MapPin, ChevronDown, ChevronUp, ShoppingCart, Truck, CreditCard, Search, UserPlus, Heart, ClipboardList } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useState } from "react";
import SEO from "@/components/SEO";

function PageWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-20">
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

export function SSSPage() {
  const faqs = [
    { q: "Sipariş nasıl verebilirim?", a: "Sitemizden istediğiniz ürünleri sepete ekleyip, ödeme sayfasında bilgilerinizi girerek WhatsApp üzerinden siparişinizi oluşturabilirsiniz." },
    { q: "Minimum sipariş tutarı nedir?", a: "Minimum sipariş tutarı 500 TL'dir." },
    { q: "Teslimat ücreti ne kadar?", a: "1.000 TL ve üzeri siparişlerde kargo ücretsizdir. 1.000 TL altı siparişlerde teslimat ücreti 89 TL'dir." },
    { q: "Hangi bölgelere teslimat yapıyorsunuz?", a: "Samsun Atakum bölgesindeki belirli mahallelere aynı gün teslimat yapıyoruz. Teslimat bölgeleri sipariş sırasında mahalle seçiminde listelenmiştir." },
    { q: "Ödeme yöntemleri nelerdir?", a: "Kapıda nakit (%5 indirimli), banka havalesi/EFT ve kapıda QR ödeme seçenekleri mevcuttur. Ayrıca kredi kartı ile taksitli ödeme imkanı sunuyoruz." },
    { q: "Siparişim ne zaman teslim edilir?", a: "Samsun içi siparişleriniz genellikle aynı gün veya ertesi gün teslim edilir." },
    { q: "Ürün iadesi yapabilir miyim?", a: "Açılmamış ve kullanılmamış ürünleri 14 gün içinde iade edebilirsiniz. İade için WhatsApp hattımızdan iletişime geçiniz." },
    { q: "Para Puan sistemi nedir?", a: "Her alışverişinizde sipariş tutarınızın %5'i kadar para puan kazanırsınız. Kazandığınız puanları sonraki siparişlerinizde indirim olarak kullanabilirsiniz." },
    { q: "Üyelik nasıl oluşturulur?", a: "Telefon numaranız ve doğum yılınız (4 haneli şifre) ile kolayca üye olabilirsiniz. Üyelik ile sipariş geçmişinizi takip edebilir, favorilerinizi kaydedebilir ve para puan kazanabilirsiniz." },
    { q: "Stokta olmayan ürünü nasıl takip edebilirim?", a: "Stokta olmayan ürünlerin sayfasında 'Gelince Haber Ver' butonuna tıklayarak, ürün stoğa girdiğinde WhatsApp üzerinden bildirim alabilirsiniz." },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <PageWrapper title="Sıkça Sorulan Sorular">
      <SEO title="Sıkça Sorulan Sorular | JETGO Samsun Pet Shop" description="JETGO Pet Shop hakkında merak edilen sorular ve cevapları. Sipariş, teslimat, ödeme ve iade konularında bilgi alın." />
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
    </PageWrapper>
  );
}

export function KVKKPage() {
  return (
    <PageWrapper title="Kişisel Verilerin Korunması">
      <SEO title="KVKK Aydınlatma Metni | JETGO Samsun Pet Shop" description="JETGO Pet Shop kişisel verilerin korunması kanunu kapsamında aydınlatma metni." />

      <Section title="Veri Sorumlusu">
        <p>Sizpa İnternet Tic. Ltd. Şti. ("Şirket") olarak kişisel verilerinizin güvenliğine önem veriyoruz. 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla aşağıdaki bilgilendirmeyi yapmaktayız.</p>
      </Section>

      <Section title="Toplanan Kişisel Veriler">
        <p>Hizmetlerimizden yararlanmanız sırasında aşağıdaki kişisel verileriniz işlenebilmektedir:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Ad soyad</li>
          <li>Telefon numarası</li>
          <li>Teslimat adresi</li>
          <li>Sipariş bilgileri</li>
          <li>Evcil hayvan bilgileri (isteğe bağlı)</li>
        </ul>
      </Section>

      <Section title="Verilerin İşlenme Amacı">
        <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Sipariş süreçlerinin yürütülmesi ve teslimat işlemleri</li>
          <li>Müşteri ilişkileri yönetimi</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi</li>
          <li>Ürün ve hizmet kalitesinin artırılması</li>
          <li>Sadakat programı (Para Puan) yönetimi</li>
        </ul>
      </Section>

      <Section title="Verilerin Aktarılması">
        <p>Kişisel verileriniz, sipariş teslimat süreçlerinin yürütülmesi amacıyla teslimat hizmeti sağlayıcılarına ve yasal zorunluluklar çerçevesinde yetkili kamu kurum ve kuruluşlarına aktarılabilmektedir.</p>
      </Section>

      <Section title="Haklarınız">
        <p>KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
          <li>İşlenmişse buna ilişkin bilgi talep etme</li>
          <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
          <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
          <li>Silinmesini veya yok edilmesini isteme</li>
        </ul>
        <p className="mt-2">Haklarınızı kullanmak için <a href="mailto:info@sizpa.com" className="text-primary underline">info@sizpa.com</a> adresine yazılı olarak başvurabilirsiniz.</p>
      </Section>

      <Section title="İletişim">
        <p><strong>Sizpa İnternet Tic. Ltd. Şti.</strong></p>
        <p>Atatürk 3. Kısım Bulvarı No:113/A, Atakum, Samsun</p>
        <p>E-posta: info@sizpa.com | Tel: +90 850 840 3959</p>
      </Section>
    </PageWrapper>
  );
}

export function GizlilikPage() {
  return (
    <PageWrapper title="Gizlilik Politikası">
      <SEO title="Gizlilik Politikası | JETGO Samsun Pet Shop" description="JETGO Pet Shop gizlilik politikası. Kişisel verilerinizin nasıl korunduğunu öğrenin." />

      <Section>
        <p>Sizpa İnternet Tic. Ltd. Şti. ("JETGO") olarak gizliliğinize saygı duyuyor ve kişisel verilerinizi korumayı taahhüt ediyoruz. Bu Gizlilik Politikası, web sitemizi kullanırken hangi bilgilerin toplandığını, nasıl kullanıldığını ve korunduğunu açıklamaktadır.</p>
      </Section>

      <Section title="Toplanan Bilgiler">
        <p>Sitemizi ziyaret ettiğinizde ve hizmetlerimizi kullandığınızda aşağıdaki bilgiler toplanabilir:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Hesap bilgileri:</strong> Üyelik oluşturduğunuzda telefon numaranız, adınız ve adresiniz</li>
          <li><strong>Sipariş bilgileri:</strong> Satın aldığınız ürünler, teslimat adresi ve ödeme tercihi</li>
          <li><strong>Kullanım verileri:</strong> Ziyaret ettiğiniz sayfalar, arama sorgularınız ve favori ürünleriniz</li>
          <li><strong>Cihaz bilgileri:</strong> Tarayıcı türü ve dil tercihi</li>
        </ul>
      </Section>

      <Section title="Bilgilerin Kullanımı">
        <p>Toplanan bilgiler yalnızca aşağıdaki amaçlarla kullanılır:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Siparişlerinizi işlemek ve teslim etmek</li>
          <li>Müşteri desteği sağlamak</li>
          <li>Hizmet kalitemizi iyileştirmek</li>
          <li>Sadakat programı (Para Puan) kapsamında avantajlar sunmak</li>
          <li>Stok bildirimi ve kampanya bilgilendirmesi (izniniz dahilinde)</li>
        </ul>
      </Section>

      <Section title="Bilgi Güvenliği">
        <p>Kişisel verileriniz şifreli oturum yönetimi ve güvenli veritabanı altyapısı ile korunmaktadır. Verileriniz üçüncü taraflarla pazarlama amacıyla paylaşılmaz.</p>
      </Section>

      <Section title="Üçüncü Taraf Hizmetler">
        <p>Sipariş süreçlerinde WhatsApp Business iletişim kanalı kullanılmaktadır. WhatsApp'ın kendi gizlilik politikası geçerlidir.</p>
      </Section>

      <Section title="İletişim">
        <p>Gizlilik politikamız hakkında sorularınız için <a href="mailto:info@sizpa.com" className="text-primary underline">info@sizpa.com</a> adresinden bize ulaşabilirsiniz.</p>
      </Section>
    </PageWrapper>
  );
}

export function KullanimKosullariPage() {
  return (
    <PageWrapper title="Kullanım Koşulları">
      <SEO title="Kullanım Koşulları | JETGO Samsun Pet Shop" description="JETGO Pet Shop web sitesi kullanım koşulları ve şartları." />

      <Section title="Genel">
        <p>Bu web sitesi Sizpa İnternet Tic. Ltd. Şti. tarafından işletilmektedir. Siteyi kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız.</p>
      </Section>

      <Section title="Hizmet Kapsamı">
        <p>JETGO, Samsun Atakum bölgesinde evcil hayvan ürünleri satışı ve teslimat hizmeti sunmaktadır. Hizmet bölgemiz dışındaki adreslere teslimat yapılmamaktadır.</p>
      </Section>

      <Section title="Sipariş ve Ödeme">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Minimum sipariş tutarı 500 TL'dir.</li>
          <li>1.000 TL üzeri siparişlerde teslimat ücretsizdir, altında 89 TL teslimat ücreti uygulanır.</li>
          <li>Sitede gösterilen fiyatlar günceldir ancak stok durumuna göre değişiklik gösterebilir.</li>
          <li>Sipariş onayı WhatsApp üzerinden verilir.</li>
          <li>Ödeme yöntemleri: Kapıda nakit, banka havalesi/EFT, kapıda QR ödeme ve kredi kartı taksit.</li>
        </ul>
      </Section>

      <Section title="İade ve İptal">
        <p>Açılmamış ve kullanılmamış ürünler, teslim tarihinden itibaren 14 gün içinde iade edilebilir. Açık mama, konserve ve kişiye özel hazırlanan ürünlerde iade kabul edilmemektedir. İade talebinizi WhatsApp hattımız üzerinden iletebilirsiniz.</p>
      </Section>

      <Section title="Fikri Mülkiyet">
        <p>Sitede yer alan logo, tasarım, metin ve görseller Sizpa İnternet Tic. Ltd. Şti.'ne aittir. İzinsiz kopyalanamaz veya çoğaltılamaz.</p>
      </Section>

      <Section title="Sorumluluk Sınırları">
        <p>Ürün görselleri temsilidir; renk ve boyut farklılıkları olabilir. Son kullanma tarihi yaklaşan ürünler indirimli olarak satışa sunulabilir ve bu durum ürün sayfasında belirtilir.</p>
      </Section>

      <Section title="Değişiklikler">
        <p>Şirketimiz, kullanım koşullarını önceden bildirmeksizin güncelleme hakkını saklı tutar. Güncel koşullar her zaman bu sayfada yayınlanır.</p>
      </Section>
    </PageWrapper>
  );
}

export function CerezPage() {
  return (
    <PageWrapper title="Çerez Politikası">
      <SEO title="Çerez Politikası | JETGO Samsun Pet Shop" description="JETGO Pet Shop çerez kullanımı hakkında bilgilendirme." />

      <Section>
        <p>JETGO web sitesi, size daha iyi bir deneyim sunmak amacıyla çerezler (cookies) kullanmaktadır.</p>
      </Section>

      <Section title="Çerez Nedir?">
        <p>Çerezler, web sitemizi ziyaret ettiğinizde tarayıcınıza yerleştirilen küçük metin dosyalarıdır. Bu dosyalar, tercihlerinizi hatırlamamıza ve siteyi kullanımınızı iyileştirmemize yardımcı olur.</p>
      </Section>

      <Section title="Kullandığımız Çerezler">
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li><strong>Zorunlu çerezler:</strong> Oturum yönetimi ve güvenlik için gereklidir. Giriş yapmanızı ve sepetinizi yönetmenizi sağlar.</li>
          <li><strong>İşlevsel çerezler:</strong> Tercihlerinizi (sepet içeriği, favori ürünler, son görüntülenen ürünler, mahalle seçimi) hatırlamamıza yardımcı olur.</li>
        </ul>
      </Section>

      <Section title="Çerez Yönetimi">
        <p>Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz. Ancak bu durumda sitenin bazı özellikleri (sepet, oturum açma, favoriler) düzgün çalışmayabilir.</p>
      </Section>

      <Section title="Üçüncü Taraf Çerezleri">
        <p>Sitemiz üçüncü taraf reklam çerezleri kullanmamaktadır. Yalnızca sitemizin işleyişi için gerekli çerezler kullanılır.</p>
      </Section>
    </PageWrapper>
  );
}

export function IslemRehberiPage() {
  const steps = [
    { icon: Search, title: "Ürün Arayın", desc: "Ana sayfadaki arama çubuğunu kullanarak veya kategorilere göz atarak istediğiniz ürünü bulun." },
    { icon: ShoppingCart, title: "Sepete Ekleyin", desc: "Ürün sayfasında adet seçerek 'Sepete Ekle' butonuna tıklayın. İstediğiniz kadar ürün ekleyebilirsiniz." },
    { icon: UserPlus, title: "Üye Olun veya Giriş Yapın", desc: "Sipariş verebilmek için telefon numaranız ve 4 haneli şifrenizle (doğum yılınız) giriş yapın veya yeni üyelik oluşturun." },
    { icon: CreditCard, title: "Ödeme Yöntemi Seçin", desc: "Kapıda nakit (%5 indirim), banka havalesi, QR ödeme veya kredi kartı taksit seçeneklerinden birini tercih edin." },
    { icon: ClipboardList, title: "Siparişi Onaylayın", desc: "Adres ve mahalle bilgilerinizi kontrol edip WhatsApp üzerinden siparişinizi gönderin." },
    { icon: Truck, title: "Teslimatı Bekleyin", desc: "Siparişiniz hazırlanır ve Samsun Atakum bölgesinde aynı gün veya ertesi gün kapınıza teslim edilir." },
  ];

  return (
    <PageWrapper title="İşlem Rehberi">
      <SEO title="İşlem Rehberi | JETGO Samsun Pet Shop" description="JETGO Pet Shop'tan nasıl sipariş vereceğinizi adım adım öğrenin." />

      <p className="text-sm text-muted-foreground mb-6">JETGO'dan sipariş vermek çok kolay! Adım adım nasıl yapacağınızı aşağıda bulabilirsiniz.</p>

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

      <div className="mt-6 p-4 rounded-lg border-2 border-dashed" style={{ borderColor: "#6B3480" }}>
        <div className="flex items-start gap-3">
          <Heart className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#6B3480" }} />
          <div>
            <h3 className="text-sm font-semibold mb-1">Para Puan Kazanın!</h3>
            <p className="text-sm text-muted-foreground">Her alışverişinizde sipariş tutarınızın %5'i kadar para puan kazanırsınız. Puanlarınızı sonraki siparişlerinizde kullanabilirsiniz.</p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export function HakkimizdaPage() {
  return (
    <PageWrapper title="Hakkımızda">
      <SEO title="Hakkımızda | JETGO Samsun Pet Shop" description="JETGO - Samsun'un güvenilir pet shop'u. Kedi maması, köpek maması ve tüm evcil hayvan ürünlerinde kaliteli hizmet." />

      <Section>
        <p><strong>Sizpa İnternet Tic. Ltd. Şti.</strong> olarak Samsun Atakum'da evcil hayvan sahiplerine kaliteli ürünleri en uygun fiyatlarla sunuyoruz.</p>
      </Section>

      <Section title="Biz Kimiz?">
        <p>JETGO markası altında faaliyet gösteren pet shopumuz, kedi maması, köpek maması, kedi kumu, ödül mamaları, bakım ürünleri ve evcil hayvan aksesuarları gibi geniş bir ürün yelpazesi sunmaktadır.</p>
        <p>Royal Canin, Pro Plan, Hill's, N&D, Reflex, ProChoice, Brit Care gibi dünyaca ünlü markaların yetkili satıcısıyız.</p>
      </Section>

      <Section title="Neden JETGO?">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Uygun fiyat garantisi:</strong> Piyasanın en uygun fiyatlarıyla hizmet veriyoruz</li>
          <li><strong>Aynı gün teslimat:</strong> Samsun Atakum bölgesinde aynı gün kapınıza teslim</li>
          <li><strong>Kapıda ödeme:</strong> Nakit, kredi kartı ve QR ödeme seçenekleri</li>
          <li><strong>Para Puan sistemi:</strong> Her alışverişte %5 para puan kazanın</li>
          <li><strong>Geniş ürün yelpazesi:</strong> 800+ ürün çeşidi ile tüm ihtiyaçlarınız tek adreste</li>
          <li><strong>Açık mama satışı:</strong> İstediğiniz kadar, istediğiniz markadan açık mama</li>
          <li><strong>Akıllı mama hesaplama:</strong> Evcil hayvanınıza özel günlük mama miktarı hesaplama</li>
        </ul>
      </Section>

      <Section title="Şirket Bilgileri">
        <p><strong>Ticari Unvan:</strong> Sizpa İnternet Tic. Ltd. Şti.</p>
        <p><strong>Adres:</strong> Atatürk 3. Kısım Bulvarı No:113/A, Atakum, Samsun</p>
        <p><strong>Telefon:</strong> +90 850 840 3959</p>
        <p><strong>E-posta:</strong> info@sizpa.com</p>
      </Section>
    </PageWrapper>
  );
}

export function TeslimatIadePage() {
  return (
    <PageWrapper title="Teslimat ve İade Şartları">
      <SEO title="Teslimat ve İade Şartları | JETGO Samsun Pet Shop" description="JETGO Pet Shop teslimat koşulları ve iade politikası hakkında bilgi edinin." />

      <Section title="Teslimat Koşulları">
        <p>JETGO olarak Samsun Atakum bölgesinde hızlı ve güvenilir teslimat hizmeti sunmaktayız.</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Teslimat bölgemiz Samsun Atakum ilçesi ve çevresindeki belirli mahallelerle sınırlıdır.</li>
          <li>Siparişleriniz genellikle aynı gün veya ertesi gün teslim edilir.</li>
          <li>Teslimat saatleri: Pazartesi - Cumartesi 09:00 - 20:00, Pazar 10:00 - 18:00 arasındadır.</li>
          <li>Minimum sipariş tutarı <strong>500 TL</strong>'dir.</li>
          <li><strong>1.000 TL</strong> ve üzeri siparişlerde teslimat <strong>ücretsizdir</strong>.</li>
          <li>1.000 TL altı siparişlerde teslimat ücreti <strong>89 TL</strong>'dir.</li>
          <li>Teslimat sırasında alıcının belirtilen adreste bulunması gerekmektedir.</li>
          <li>Teslimat esnasında ürünlerin kontrol edilmesi önerilir.</li>
        </ul>
      </Section>

      <Section title="Teslimat Süreleri">
        <p>Sipariş onayından sonra teslimat süreleri aşağıdaki gibidir:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Standart teslimat:</strong> Sipariş onayından itibaren aynı gün veya ertesi iş günü</li>
          <li><strong>Yoğun dönemlerde:</strong> Bayram, kampanya ve özel günlerde teslimat süresi 1-2 iş günü uzayabilir</li>
          <li>Stokta olmayan ürünler için tahmini tedarik süresi sipariş onayında bildirilir</li>
        </ul>
      </Section>

      <Section title="İade Koşulları">
        <p>6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamında aşağıdaki iade koşulları geçerlidir:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Teslim tarihinden itibaren <strong>14 gün</strong> içinde cayma hakkınızı kullanabilirsiniz.</li>
          <li>İade edilecek ürünler <strong>açılmamış, kullanılmamış ve orijinal ambalajında</strong> olmalıdır.</li>
          <li>Ürünün faturası ile birlikte iade edilmesi gerekmektedir.</li>
          <li>İade talebinizi WhatsApp hattımız (<strong>+90 850 840 3959</strong>) üzerinden iletebilirsiniz.</li>
        </ul>
      </Section>

      <Section title="İade Edilemeyecek Ürünler">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Açılmış veya kullanılmış mamalar ve gıda ürünleri</li>
          <li>Açık mama olarak satılan ürünler</li>
          <li>Hijyen ürünleri (kedi kumu, çiş pedi vb.) açılmış olanlar</li>
          <li>Konserve ve yaş mama ürünleri (açılmış olanlar)</li>
          <li>Kişiye özel hazırlanan veya ambalajı bozulmuş ürünler</li>
        </ul>
      </Section>

      <Section title="İade Süreci">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>1.</strong> WhatsApp üzerinden iade talebinizi iletin</li>
          <li><strong>2.</strong> Ürünü orijinal ambalajında ve faturasıyla birlikte hazırlayın</li>
          <li><strong>3.</strong> Kurye ürünü adresinizden teslim alacaktır</li>
          <li><strong>4.</strong> Ürün kontrolü sonrası iade bedeli ödeme yönteminize göre 3-7 iş günü içinde iade edilir</li>
        </ul>
      </Section>

      <Section title="Hasarlı veya Hatalı Ürün">
        <p>Teslimat sırasında hasarlı veya hatalı ürün teslim alındığında:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Teslimat anında ürünü kontrol ediniz</li>
          <li>Hasarlı ürünü teslim almayınız veya tutanak tutturarak teslim alınız</li>
          <li>24 saat içinde WhatsApp hattımızdan durumu bildiriniz</li>
          <li>Hasarlı/hatalı ürünler ücretsiz olarak değiştirilir</li>
        </ul>
      </Section>

      <Section title="İletişim">
        <p>Teslimat ve iade konusundaki tüm sorularınız için:</p>
        <p><strong>Telefon:</strong> +90 850 840 3959</p>
        <p><strong>WhatsApp:</strong> +90 850 840 3959</p>
        <p><strong>E-posta:</strong> info@sizpa.com</p>
      </Section>
    </PageWrapper>
  );
}

export function GizlilikSozlesmesiPage() {
  return (
    <PageWrapper title="Gizlilik Sözleşmesi">
      <SEO title="Gizlilik Sözleşmesi | JETGO Samsun Pet Shop" description="JETGO Pet Shop gizlilik sözleşmesi. Kişisel verilerinizin korunması ve gizliliğinize ilişkin taahhütlerimiz." />

      <Section>
        <p>İşbu Gizlilik Sözleşmesi, <strong>Sizpa İnternet Tic. Ltd. Şti.</strong> ("Şirket") tarafından işletilen JETGO Pet Shop web sitesini ("Site") kullanan kullanıcıların ("Kullanıcı") kişisel verilerinin korunmasına ilişkin koşulları düzenler.</p>
      </Section>

      <Section title="Madde 1 – Taraflar">
        <p><strong>Hizmet Sağlayıcı:</strong> Sizpa İnternet Tic. Ltd. Şti.</p>
        <p><strong>Adres:</strong> Atatürk 3. Kısım Bulvarı No:113/A, Atakum, Samsun</p>
        <p><strong>Kullanıcı:</strong> Siteyi kullanan ve/veya üyelik oluşturan gerçek kişi</p>
      </Section>

      <Section title="Madde 2 – Sözleşmenin Konusu">
        <p>İşbu sözleşme, Kullanıcı'nın Site'yi kullanması sırasında paylaştığı kişisel verilerin toplanması, işlenmesi, saklanması ve korunmasına ilişkin Şirket'in yükümlülüklerini ve Kullanıcı'nın haklarını belirler.</p>
      </Section>

      <Section title="Madde 3 – Toplanan Veriler">
        <p>Site üzerinden aşağıdaki kişisel veriler toplanabilmektedir:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Ad ve soyad</li>
          <li>Telefon numarası</li>
          <li>Teslimat adresi bilgileri</li>
          <li>Doğum yılı (üyelik şifresi olarak)</li>
          <li>Sipariş geçmişi ve tercih bilgileri</li>
          <li>Evcil hayvan profil bilgileri (isteğe bağlı)</li>
          <li>Konum bilgisi (teslimat amacıyla, izin dahilinde)</li>
        </ul>
      </Section>

      <Section title="Madde 4 – Verilerin İşlenme Amaçları">
        <p>Toplanan kişisel veriler yalnızca aşağıdaki amaçlarla işlenir:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Sipariş oluşturma, onaylama ve teslimat süreçlerinin yürütülmesi</li>
          <li>Üyelik hesabının oluşturulması ve yönetilmesi</li>
          <li>Para Puan sadakat programının işletilmesi</li>
          <li>Stok bildirimi ve sipariş hatırlatma hizmetlerinin sunulması</li>
          <li>Müşteri destek hizmetlerinin sağlanması</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi</li>
        </ul>
      </Section>

      <Section title="Madde 5 – Verilerin Korunması">
        <p>Şirket, Kullanıcı'nın kişisel verilerini korumak için aşağıdaki önlemleri almaktadır:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>SSL (Secure Socket Layer) şifreli bağlantı ile veri iletimi</li>
          <li>Şifrelerin tek yönlü hash algoritması (bcrypt) ile saklanması</li>
          <li>Güvenli oturum yönetimi ve otomatik oturum sonlandırma</li>
          <li>Veritabanı erişiminin yetkilendirilmiş personelle sınırlandırılması</li>
          <li>Düzenli güvenlik güncellemeleri ve sistem kontrolleri</li>
        </ul>
      </Section>

      <Section title="Madde 6 – Verilerin Üçüncü Taraflarla Paylaşımı">
        <p>Kullanıcı'nın kişisel verileri, açık rızası olmaksızın üçüncü taraflarla paylaşılmaz. Aşağıdaki istisnai durumlar saklıdır:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Teslimat hizmeti için gerekli minimum bilgilerin teslimat personeliyle paylaşılması</li>
          <li>Yasal zorunluluk halinde yetkili kamu kurum ve kuruluşlarıyla paylaşım</li>
          <li>WhatsApp Business üzerinden sipariş iletişimi (Kullanıcı'nın talebi doğrultusunda)</li>
        </ul>
      </Section>

      <Section title="Madde 7 – Kullanıcı Hakları">
        <p>Kullanıcı, 6698 sayılı KVKK kapsamında aşağıdaki haklara sahiptir:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Kişisel verilerinin işlenip işlenmediğini öğrenme</li>
          <li>Verilerin düzeltilmesini veya silinmesini talep etme</li>
          <li>Verilerin aktarıldığı üçüncü kişileri bilme</li>
          <li>İşlemenin sonuçlarına itiraz etme</li>
          <li>Hesabını ve verilerini tamamen silme (hesap silme talebi)</li>
        </ul>
      </Section>

      <Section title="Madde 8 – Çerezler">
        <p>Site, oturum yönetimi ve kullanıcı tercihlerinin saklanması amacıyla zorunlu çerezler kullanmaktadır. Detaylı bilgi için <Link href="/cerez-politikasi" className="text-primary underline">Çerez Politikası</Link> sayfamızı inceleyebilirsiniz.</p>
      </Section>

      <Section title="Madde 9 – Sözleşme Değişiklikleri">
        <p>Şirket, işbu sözleşmeyi önceden bildirmeksizin güncelleme hakkını saklı tutar. Güncellenmiş sözleşme Site üzerinde yayınlandığı tarihte yürürlüğe girer.</p>
      </Section>

      <Section title="Madde 10 – İletişim ve Başvuru">
        <p>Gizlilik sözleşmesi kapsamındaki haklarınızı kullanmak veya sorularınız için:</p>
        <p><strong>E-posta:</strong> <a href="mailto:info@sizpa.com" className="text-primary underline">info@sizpa.com</a></p>
        <p><strong>Telefon:</strong> +90 850 840 3959</p>
        <p><strong>Adres:</strong> Atatürk 3. Kısım Bulvarı No:113/A, Atakum, Samsun</p>
      </Section>
    </PageWrapper>
  );
}

export function MesafeliSatisSozlesmesiPage() {
  return (
    <PageWrapper title="Mesafeli Satış Sözleşmesi">
      <SEO title="Mesafeli Satış Sözleşmesi | JETGO Samsun Pet Shop" description="JETGO Pet Shop mesafeli satış sözleşmesi. 6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamında ön bilgilendirme." />

      <Section>
        <p>İşbu Mesafeli Satış Sözleşmesi, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümlerine uygun olarak düzenlenmiştir.</p>
      </Section>

      <Section title="Madde 1 – Satıcı Bilgileri">
        <p><strong>Ticari Unvan:</strong> Sizpa İnternet Tic. Ltd. Şti.</p>
        <p><strong>Marka:</strong> JETGO Pet Shop</p>
        <p><strong>Adres:</strong> Atatürk 3. Kısım Bulvarı No:113/A, Atakum, Samsun</p>
        <p><strong>Telefon:</strong> +90 850 840 3959</p>
        <p><strong>E-posta:</strong> info@sizpa.com</p>
      </Section>

      <Section title="Madde 2 – Sözleşmenin Konusu">
        <p>İşbu sözleşmenin konusu, Alıcı'nın Satıcı'ya ait JETGO web sitesinden elektronik ortamda sipariş vererek satın almak istediği ürünlerin satışı ve teslimatına ilişkin tarafların hak ve yükümlülüklerinin belirlenmesidir.</p>
      </Section>

      <Section title="Madde 3 – Sözleşme Konusu Ürün/Hizmet">
        <p>Sipariş edilen ürünlerin cinsi, miktarı, KDV dahil satış fiyatı ve ödeme bilgileri sipariş özeti ve WhatsApp sipariş mesajında belirtildiği şekildedir. Ürün açıklamaları ve görselleri bilgi amaçlıdır.</p>
      </Section>

      <Section title="Madde 4 – Genel Hükümler">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Alıcı, sipariş verdiği ürünlerin temel nitelikleri, satış fiyatı, ödeme şekli ve teslimata ilişkin ön bilgilendirmeyi okuduğunu kabul eder.</li>
          <li>Sözleşme, Alıcı tarafından onaylandığı tarihte yürürlüğe girer.</li>
          <li>Ürünler, sipariş onayını takiben en geç 30 gün içinde teslim edilir.</li>
          <li>Ürünler, Samsun Atakum bölgesinde Alıcı'nın belirttiği adrese teslim edilir.</li>
        </ul>
      </Section>

      <Section title="Madde 5 – Teslimat Koşulları">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Teslimat, Samsun Atakum ilçesi ve çevresindeki belirli mahallelerle sınırlıdır.</li>
          <li>Minimum sipariş tutarı 500 TL'dir.</li>
          <li>1.000 TL ve üzeri siparişlerde teslimat ücretsizdir.</li>
          <li>1.000 TL altı siparişlerde 89 TL teslimat ücreti uygulanır.</li>
          <li>Siparişler genellikle aynı gün veya ertesi iş günü teslim edilir.</li>
          <li>Mücbir sebepler (doğal afet, pandemi, hükümet kararları vb.) nedeniyle teslimat gecikebilir.</li>
        </ul>
      </Section>

      <Section title="Madde 6 – Ödeme Koşulları">
        <p>Alıcı, sipariş tutarını aşağıdaki yöntemlerden biriyle ödeyebilir:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Kapıda nakit ödeme:</strong> Sipariş tutarında %5 indirim uygulanır</li>
          <li><strong>Banka havalesi / EFT:</strong> Sipariş onayından önce ödeme yapılır</li>
          <li><strong>Kapıda POS cihazı ile kredi kartı / banka kartı:</strong> Tek çekim veya taksitli</li>
          <li><strong>Kapıda QR ödeme:</strong> Mobil bankacılık uygulaması ile</li>
          <li><strong>Kredi kartı taksit:</strong> 3, 4, 6, 9 ve 12 aya varan taksit imkanı (vade farkı uygulanır)</li>
        </ul>
      </Section>

      <Section title="Madde 7 – Cayma Hakkı">
        <p>Alıcı, ürünü teslim aldığı tarihten itibaren <strong>14 (on dört) gün</strong> içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin cayma hakkını kullanabilir.</p>
        <p className="mt-2">Cayma hakkının kullanılması için:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Ürün kullanılmamış ve ambalajı açılmamış olmalıdır</li>
          <li>WhatsApp hattından (+90 850 840 3959) cayma bildirimi yapılmalıdır</li>
          <li>Ürün, faturasıyla birlikte eksiksiz iade edilmelidir</li>
        </ul>
      </Section>

      <Section title="Madde 8 – Cayma Hakkı Kullanılamayacak Ürünler">
        <p>Aşağıdaki ürünlerde cayma hakkı kullanılamaz:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Ambalajı açılmış gıda ürünleri (kuru mama, yaş mama, konserve, ödül maması)</li>
          <li>Açık mama olarak tartılarak satılan ürünler</li>
          <li>Ambalajı açılmış hijyen ürünleri (kedi kumu, çiş pedi vb.)</li>
          <li>Tek kullanımlık ürünler ve ambalajı bozulmuş ürünler</li>
          <li>Fiyatı borsa veya piyasa koşullarına göre değişen ürünler</li>
        </ul>
      </Section>

      <Section title="Madde 9 – İade ve Geri Ödeme">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Cayma hakkının kullanılması halinde, iade edilen ürünler Satıcı tarafından kontrol edilir.</li>
          <li>Ürünün iade koşullarına uygun olması halinde, ürün bedeli ödeme yöntemine göre en geç <strong>14 gün</strong> içinde Alıcı'ya iade edilir.</li>
          <li>Nakit ödemelerde nakit iade yapılır.</li>
          <li>Kredi kartı ödemelerinde iade, karta yapılır.</li>
          <li>İade kargo/teslimat ücreti Alıcı'ya aittir (hasarlı/hatalı ürün hariç).</li>
        </ul>
      </Section>

      <Section title="Madde 10 – Uyuşmazlık Çözümü">
        <p>İşbu sözleşmeden doğan uyuşmazlıklarda Samsun Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir. Başvuru sınırları her yıl Ticaret Bakanlığı tarafından belirlenir.</p>
      </Section>

      <Section title="Madde 11 – Yürürlük">
        <p>İşbu sözleşme, Alıcı tarafından elektronik ortamda onaylandığı veya sipariş verildiği tarihte yürürlüğe girer. Sözleşmenin bir nüshası sipariş onayı ile birlikte Alıcı'ya iletilir.</p>
        <p className="mt-2 font-medium">Alıcı, işbu sözleşmenin tüm maddelerini okuduğunu, anladığını ve kabul ettiğini beyan eder.</p>
      </Section>
    </PageWrapper>
  );
}

export function IletisimPage() {
  return (
    <PageWrapper title="İletişim">
      <SEO title="İletişim | JETGO Samsun Pet Shop" description="JETGO Pet Shop iletişim bilgileri. Samsun Atakum'da evcil hayvan ürünleri siparişi için bize ulaşın." />

      <div className="space-y-4">
        <div className="p-5 border rounded-lg space-y-4" data-testid="contact-info">
          <h2 className="font-semibold">Sizpa İnternet Tic. Ltd. Şti.</h2>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Adres</p>
              <p className="text-sm text-muted-foreground">Atatürk 3. Kısım Bulvarı No:113/A, Atakum, Samsun</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Telefon</p>
              <a href="tel:+908508403959" className="text-sm text-primary" data-testid="contact-phone">+90 850 840 3959</a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">E-posta</p>
              <a href="mailto:info@sizpa.com" className="text-sm text-primary" data-testid="contact-email">info@sizpa.com</a>
            </div>
          </div>
        </div>

        <a
          href="https://wa.me/908508403959"
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
            <li>Samsun Atakum bölgesine aynı gün teslimat</li>
            <li>Minimum sipariş tutarı: 500 TL</li>
            <li>1.000 TL üzeri siparişlerde ücretsiz teslimat</li>
            <li>1.000 TL altı siparişlerde teslimat ücreti: 89 TL</li>
          </ul>
        </div>
      </div>
    </PageWrapper>
  );
}
