import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";

interface Variant {
  label: string;
  price: number;
}

interface Props {
  productName: string;
  animal: string | null;
  barcode?: string | null;
  skt?: string | null;
  stock?: number | null;
  variants: Variant[];
  brandName: string | null;
}

function AccordionItem({
  title,
  defaultOpen = false,
  children,
  testId,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  testId?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-lg overflow-hidden bg-white" data-testid={testId}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left font-semibold text-sm hover:bg-gray-50 transition-colors"
        data-testid={testId ? `${testId}-toggle` : undefined}
      >
        <span>{title}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 pb-4 text-sm text-gray-700 leading-relaxed">{children}</div>}
    </div>
  );
}

export default function ProductInfoAccordions({
  productName,
  animal,
  barcode,
  skt,
  stock,
  variants,
  brandName,
}: Props) {
  const hasVariants = variants.length > 0;

  const faqs = useMemo(() => [
    {
      q: "Ürün ne zaman kargoya verilir?",
      a: "Samsun içi siparişler aynı gün, şehir dışı siparişler 1 iş günü içinde kargoya verilir.",
    },
    {
      q: "Ödeme seçenekleri nelerdir?",
      a: "Kapıda nakit, kapıda kredi kartı (POS), kapıda QR, banka havalesi/EFT ve online kredi kartı (iyzico/Tosla) ile ödeme yapabilirsiniz.",
    },
    {
      q: "İade ve değişim koşulları nelerdir?",
      a: "Açılmamış ürünler 14 gün içinde iade edilebilir. Mama ve gıda ürünlerinde ambalajın bozulmamış olması gerekir.",
    },
    {
      q: "Para Puan nedir, nasıl kullanılır?",
      a: "Her alışverişinizde tutarın %5'i Para Puan olarak hesabınıza eklenir. Sonraki siparişlerinizde kullanabilirsiniz.",
    },
  ], []);

  const relatedKeywords = useMemo(() => {
    const base = [
      `${productName} fiyat`,
      `${productName} yorum`,
      `${productName} kullananlar`,
      brandName ? `${brandName} ürünleri` : "pet shop ürünleri",
      "samsun pet shop",
      "jetgo pet shop",
    ];
    if (animal === "kedi") base.push("kedi maması", "kedi bakım ürünleri");
    if (animal === "kopek") base.push("köpek maması", "köpek bakım ürünleri");
    return base;
  }, [productName, animal, brandName]);

  return (
    <div className="mt-6 space-y-2" data-testid="section-product-accordions">
      <AccordionItem title="Ne işe yarar?" defaultOpen testId="accordion-ne-ise-yarar">
        <p>
          <strong>{productName}</strong>, evcil hayvanınızın günlük ihtiyaçlarını karşılamak için özel olarak formüle edilmiştir.
          {animal === "kedi" && " Kedilerde tüy parlaklığı, deri sağlığı ve sindirim sistemine destek olmaya yardımcı olur."}
          {animal === "kopek" && " Köpeklerde enerji, eklem desteği ve genel sağlık için faydalıdır."}
        </p>
        <ul className="mt-2 space-y-1">
          <li>✅ Günlük bakım rutininize uygun</li>
          <li>✅ Sindirim sistemini destekler</li>
          <li>✅ Tüy ve deri sağlığına katkı sağlar</li>
          <li>✅ {animal === "kedi" ? "Kedi" : animal === "kopek" ? "Köpek" : "Evcil hayvan"} kullanımına uygundur</li>
        </ul>
      </AccordionItem>

      <AccordionItem title="Kullanım şekli" testId="accordion-kullanim">
        <p>Üreticinin önerdiği günlük dozu aşmayınız. {animal === "kedi" ? "Kedinin" : "Hayvanın"} kilosuna göre ambalaj üzerindeki tabloyu takip ediniz. Açtıktan sonra serin ve kuru yerde saklayınız.</p>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>Yemek saatinde veya mama üstüne ekleyerek kullanabilirsiniz.</li>
          <li>İlk kullanımda küçük dozdan başlayıp yavaş yavaş artırın.</li>
          <li>Bol su erişimi sağladığınızdan emin olun.</li>
        </ul>
      </AccordionItem>

      <AccordionItem title="İçerik" testId="accordion-icerik">
        <p>Detaylı içerik bilgileri ürün ambalajının arka yüzünde yer almaktadır. Ürünün geldiği parti numarasına göre içerik küçük farklılıklar gösterebilir.</p>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>Kaliteli hammadde</li>
          <li>Yapay renklendirici ve koruyucu içermez</li>
          <li>Veteriner kontrolünden geçmiş formül</li>
        </ul>
      </AccordionItem>

      <AccordionItem title="Kimler kullanmalı?" testId="accordion-kimler">
        <p>
          {animal === "kedi" && "Her yaştaki sağlıklı yetişkin kediler için uygundur. Yavru, hamile veya yaşlı kedilerde kullanmadan önce veterinerinize danışınız."}
          {animal === "kopek" && "Yetişkin köpeklerde günlük kullanıma uygundur. Yavru, hamile ve hasta köpeklerde veteriner kontrolünde kullanılmalıdır."}
          {!animal && "Evcil hayvanınızın yaşı, kilosu ve sağlık durumuna uygunsa kullanılabilir. Şüpheniz varsa veterinerinize danışınız."}
        </p>
      </AccordionItem>

      <AccordionItem title="Veteriner önerisi" testId="accordion-veteriner">
        <p>
          Bu ürün <strong>besin desteği / bakım ürünü</strong> niteliğindedir, hastalık tedavisi yerine geçmez. Kronik bir rahatsızlığı olan hayvanlarda veya başka bir tedavi gören evcil hayvanlarda kullanmadan önce mutlaka veterinerinizle görüşünüz.
        </p>
        <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
          JETGO Pet Shop, ürün hakkındaki sorularınız için <strong>veteriner danışma hattı</strong> sunmaktadır. Sipariş notuna sorunuzu yazabilirsiniz.
        </p>
      </AccordionItem>

      <AccordionItem title="Sıkça Sorulan Sorular (SSS)" testId="accordion-faq">
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} data-testid={`faq-item-${i}`}>
              <p className="font-semibold text-gray-900">{f.q}</p>
              <p className="text-gray-600 mt-0.5">{f.a}</p>
            </div>
          ))}
        </div>
      </AccordionItem>

      <AccordionItem title="Kargo, İade ve Değişim" testId="accordion-shipping-returns">
        <p><strong>Kargo:</strong> Samsun içi siparişler aynı gün veya en geç 1 iş günü içinde teslim edilir. Şehir dışı kargo 2-3 iş günü içinde ulaşır.</p>
        <p className="mt-2"><strong>İade:</strong> Açılmamış ürünleri 14 gün içinde iade edebilirsiniz. Mama ve gıda ürünlerinde ambalajın açılmamış olması gerekmektedir.</p>
      </AccordionItem>

      <AccordionItem title="Ürün Detayları" testId="accordion-item-details">
        <ul className="space-y-1.5">
          <li><strong>Ürün adı:</strong> {productName}</li>
          {brandName && <li><strong>Marka:</strong> {brandName}</li>}
          {barcode && <li><strong>Barkod:</strong> {barcode}</li>}
          {skt && <li><strong>S.K.T:</strong> {skt}</li>}
          <li><strong>Stok durumu:</strong> {stock && stock > 0 ? "Stokta" : "Tükendi"}</li>
          {hasVariants && (
            <li><strong>Seçenekler:</strong> {variants.map((v) => v.label).join(", ")}</li>
          )}
        </ul>
      </AccordionItem>

      <AccordionItem title="İlgili Aramalar" testId="accordion-related">
        <div className="flex flex-wrap gap-2">
          {relatedKeywords.map((kw, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full bg-gray-100 text-xs text-gray-700 border border-gray-200"
              data-testid={`related-keyword-${i}`}
            >
              {kw}
            </span>
          ))}
        </div>
      </AccordionItem>
    </div>
  );
}
