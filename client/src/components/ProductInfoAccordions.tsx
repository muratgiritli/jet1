import { useState, useMemo } from "react";
import { brandify } from "@/lib/store";
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
      brandify("jetgo pet shop"),
    ];
    if (animal === "kedi") base.push("kedi maması", "kedi bakım ürünleri");
    if (animal === "kopek") base.push("köpek maması", "köpek bakım ürünleri");
    return base;
  }, [productName, animal, brandName]);

  return (
    <div className="mt-6 space-y-2" data-testid="section-product-accordions">
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
