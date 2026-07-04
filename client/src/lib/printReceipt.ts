import type { Order } from "@shared/schema";
import { brandify } from "@/lib/store";

const STORE_NAME = brandify("JETGO PET SHOP");
const STORE_SUB = "Samsun - Hızlı Sipariş";

function esc(s: any): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function money(n: number): string {
  return (Number(n) || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " TL";
}

export interface ReceiptOptions {
  deliverySlotText?: string;
  copyLabel?: string;
}

export function buildReceiptHtml(order: Order, opts: ReceiptOptions = {}): string {
  const d = order.createdAt ? new Date(order.createdAt) : new Date();
  const dateStr =
    d.toLocaleDateString("tr-TR") +
    " " +
    d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

  const items = (order.items as any[]) || [];
  const itemsHtml = items
    .map((it) => {
      const lineTotal = (Number(it.price) || 0) * (Number(it.quantity) || 0);
      return `
        <div class="item">
          <div class="item-name">${esc(it.quantity)} x ${esc(it.name)}</div>
          <div class="item-row">
            <span>${money(Number(it.price) || 0)}</span>
            <span class="b">${money(lineTotal)}</span>
          </div>
        </div>`;
    })
    .join("");

  const customerHtml = [
    order.customerName ? `<div class="b">${esc(order.customerName)}</div>` : "",
    order.customerPhone ? `<div>Tel: ${esc(order.customerPhone)}</div>` : "",
    order.customerAddress ? `<div>${esc(order.customerAddress)}</div>` : "",
    opts.deliverySlotText ? `<div>Teslimat: ${esc(opts.deliverySlotText)}</div>` : "",
  ]
    .filter(Boolean)
    .join("");

  const pending = order.paymentStatus && order.paymentStatus !== "completed";

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<title>Fiş #${esc(order.id)}</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    width: 80mm;
    padding: 4mm 3mm 8mm;
    font-family: "Courier New", monospace;
    font-size: 12px;
    line-height: 1.35;
    color: #000;
  }
  .center { text-align: center; }
  .b { font-weight: bold; }
  .store { font-size: 17px; font-weight: bold; letter-spacing: 1px; }
  .sub { font-size: 11px; }
  .order-no { font-size: 15px; font-weight: bold; }
  .hr { border-top: 1px dashed #000; margin: 6px 0; }
  .sec-title { font-weight: bold; font-size: 11px; text-transform: uppercase; margin-bottom: 2px; }
  .item { margin-bottom: 4px; }
  .item-name { word-break: break-word; }
  .item-row { display: flex; justify-content: space-between; padding-left: 8px; }
  .tot-row { display: flex; justify-content: space-between; }
  .grand { font-size: 15px; font-weight: bold; margin-top: 4px; }
  .note { word-break: break-word; }
  .foot { margin-top: 8px; font-size: 11px; }
</style>
</head>
<body>
  <div class="center store">${esc(STORE_NAME)}</div>
  <div class="center sub">${esc(STORE_SUB)}</div>
  <div class="hr"></div>
  <div class="center order-no">SİPARİŞ #${esc(order.id)}</div>
  <div class="center sub">${esc(dateStr)}</div>
  ${opts.copyLabel ? `<div class="center sub b">${esc(opts.copyLabel)}</div>` : ""}
  <div class="hr"></div>
  ${
    customerHtml
      ? `<div class="sec-title">Müşteri</div>${customerHtml}<div class="hr"></div>`
      : ""
  }
  <div class="sec-title">Ürünler</div>
  ${itemsHtml}
  <div class="hr"></div>
  <div class="tot-row"><span>Ara Toplam</span><span>${money(order.subtotal)}</span></div>
  <div class="tot-row"><span>Kargo</span><span>${order.shipping === 0 ? "Ücretsiz" : money(order.shipping)}</span></div>
  ${order.discount > 0 ? `<div class="tot-row"><span>İndirim</span><span>-${money(order.discount)}</span></div>` : ""}
  <div class="tot-row grand"><span>TOPLAM</span><span>${money(order.grandTotal)}</span></div>
  <div class="hr"></div>
  <div class="tot-row"><span>Ödeme</span><span class="b">${esc(order.paymentMethod)}</span></div>
  ${pending ? `<div class="center b">** ÖDEME BEKLENİYOR **</div>` : ""}
  ${order.customerNote ? `<div class="hr"></div><div class="sec-title">Not</div><div class="note">${esc(order.customerNote)}</div>` : ""}
  <div class="hr"></div>
  <div class="center foot b">Teşekkür ederiz!</div>
  <div class="center foot">${esc(brandify("JETGO Pet Shop"))}</div>
  <script>
    window.onload = function () {
      window.focus();
      window.print();
    };
    window.onafterprint = function () { window.close(); };
  </script>
</body>
</html>`;
}

export function printOrderReceipt(order: Order, opts: ReceiptOptions = {}): boolean {
  const html = buildReceiptHtml(order, opts);
  const w = window.open("", "_blank", "width=380,height=640");
  if (!w) {
    alert("Yazdırma penceresi açılamadı. Lütfen tarayıcıda pop-up iznine izin verin.");
    return false;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  return true;
}
