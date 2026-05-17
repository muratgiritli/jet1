type ExportProduct = {
  name: string;
  price: number;
  originalPrice?: number | null;
  stock: number;
  skt?: string | null;
  barcode?: string | null;
  isActive: boolean;
  preorderEnabled?: boolean;
  brandCategoryId: number;
};

type ExportCategory = {
  id: number;
  animal: string;
  subcategory: string;
  brandName: string;
};

type ExportMeta = {
  animal?: string;
  subcategory?: string;
  brand?: string;
  search?: string;
  quickFilter?: string;
};

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + " TL";

export function exportProductsPdf(
  products: ExportProduct[],
  categories: ExportCategory[],
  meta: ExportMeta
) {
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const now = new Date();
  const dateStr = now.toLocaleString("tr-TR");

  const filterLines: string[] = [];
  if (meta.animal && meta.animal !== "all") filterLines.push(`Hayvan: ${meta.animal}`);
  if (meta.subcategory && meta.subcategory !== "all") filterLines.push(`Kategori: ${meta.subcategory}`);
  if (meta.brand && meta.brand !== "all") filterLines.push(`Marka: ${meta.brand}`);
  if (meta.search) filterLines.push(`Arama: "${meta.search}"`);
  if (meta.quickFilter && meta.quickFilter !== "none") filterLines.push(`Filtre: ${meta.quickFilter}`);

  const rows = products
    .map((p, i) => {
      const cat = catMap.get(p.brandCategoryId);
      const brand = cat?.brandName || "-";
      const categoryLabel = cat ? `${cat.animal} / ${cat.subcategory}` : "-";
      const statusParts: string[] = [];
      if (!p.isActive) statusParts.push("Pasif");
      if (p.stock === 0 && !p.preorderEnabled) statusParts.push("Stokta Yok");
      if (p.preorderEnabled) statusParts.push("Ön Sipariş");
      const status = statusParts.join(", ") || "Aktif";
      const priceCell = p.originalPrice && p.originalPrice > p.price
        ? `${fmtMoney(p.price)} <span class="old">${fmtMoney(p.originalPrice)}</span>`
        : fmtMoney(p.price);
      return `<tr>
        <td class="num">${i + 1}</td>
        <td>${escapeHtml(p.name)}</td>
        <td>${escapeHtml(brand)}</td>
        <td>${escapeHtml(categoryLabel)}</td>
        <td class="num">${p.stock}</td>
        <td class="num price">${priceCell}</td>
        <td class="num">${escapeHtml(p.skt || "-")}</td>
        <td class="num bc">${escapeHtml(p.barcode || "-")}</td>
        <td>${escapeHtml(status)}</td>
      </tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8" />
<title>JETGO - Ürün Listesi (${products.length})</title>
<style>
  @page { size: A4 landscape; margin: 12mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #111; margin: 0; padding: 16px; font-size: 11px; }
  header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #222; padding-bottom: 8px; margin-bottom: 10px; }
  h1 { margin: 0 0 4px 0; font-size: 18px; }
  .meta { font-size: 10px; color: #555; }
  .filters { margin-top: 4px; font-size: 10px; color: #333; }
  .filters span { display: inline-block; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 2px 6px; border-radius: 4px; margin-right: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; }
  thead th { background: #1f2937; color: #fff; padding: 6px 5px; text-align: left; font-weight: 600; }
  tbody td { padding: 5px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  tbody tr:nth-child(even) td { background: #f9fafb; }
  .num { text-align: right; white-space: nowrap; }
  .price { font-weight: 600; }
  .old { color: #9ca3af; text-decoration: line-through; font-weight: 400; margin-left: 4px; }
  .bc { font-family: ui-monospace, Menlo, Consolas, monospace; }
  .actions { margin-bottom: 10px; text-align: right; }
  .actions button { background: #2563eb; color: #fff; border: 0; padding: 8px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; font-weight: 600; }
  @media print { .actions { display: none; } body { padding: 0; } }
  tfoot td { padding-top: 8px; font-size: 10px; color: #666; }
</style>
</head>
<body>
  <div class="actions">
    <button onclick="window.print()">PDF Olarak Kaydet / Yazdır</button>
  </div>
  <header>
    <div>
      <h1>JETGO - Ürün Listesi</h1>
      <div class="meta">Toplam ${products.length} ürün &middot; ${dateStr}</div>
      ${filterLines.length ? `<div class="filters">${filterLines.map((f) => `<span>${escapeHtml(f)}</span>`).join("")}</div>` : ""}
    </div>
    <div class="meta" style="text-align:right">
      jetgomarket.com<br/>Sizpa LTD
    </div>
  </header>
  <table>
    <thead>
      <tr>
        <th style="width:30px">#</th>
        <th>Ürün Adı</th>
        <th>Marka</th>
        <th>Kategori</th>
        <th style="width:50px">Stok</th>
        <th style="width:120px">Fiyat</th>
        <th style="width:70px">SKT</th>
        <th style="width:110px">Barkod</th>
        <th style="width:90px">Durum</th>
      </tr>
    </thead>
    <tbody>${rows || `<tr><td colspan="9" style="text-align:center;padding:20px;color:#888">Ürün bulunamadı</td></tr>`}</tbody>
  </table>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) {
    alert("Lütfen pop-up engelleyicisini kapatın.");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => {
    try { w.print(); } catch {}
  }, 400);
}
