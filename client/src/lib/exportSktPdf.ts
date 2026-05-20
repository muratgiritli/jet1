type SktProduct = {
  id: number;
  name: string;
  barcode?: string | null;
  price?: number | string | null;
  stock?: number | null;
  skt?: string | null;
  isActive?: boolean;
  img?: string | null;
};

type ExportOpts = {
  monthLabel: string;
  status: "expired" | "near" | "ok";
  diffDays: number;
  products: SktProduct[];
};

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );

export function exportSktPdf(opts: ExportOpts) {
  const { monthLabel, status, diffDays, products } = opts;
  const now = new Date().toLocaleString("tr-TR");
  const statusLabel = status === "expired" ? "SÜRESİ DOLMUŞ" : status === "near" ? `${diffDays} GÜN KALDI` : `${diffDays} gün kaldı`;
  const statusClass = status === "expired" ? "bad" : status === "near" ? "warn" : "ok";

  const totalStock = products.reduce((s, p) => s + (Number(p.stock) || 0), 0);
  const activeCount = products.filter(p => p.isActive !== false).length;
  const passiveCount = products.length - activeCount;

  const rows = products.map((p, i) => `<tr class="${p.isActive === false ? "pasif" : ""}">
    <td class="num">${i + 1}</td>
    <td>${escapeHtml(p.name)}${p.isActive === false ? ' <span class="pasif-badge">PASİF</span>' : ""}</td>
    <td class="bc">${escapeHtml(p.barcode || "-")}</td>
    <td class="num">${p.price != null ? escapeHtml(String(p.price)) + " TL" : "-"}</td>
    <td class="num">${p.stock ?? 0}</td>
    <td class="skt">${escapeHtml(p.skt || "-")}</td>
  </tr>`).join("");

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8" />
<title>JETGO - SKT Takip Raporu (${escapeHtml(monthLabel)})</title>
<style>
  @page { size: A4 portrait; margin: 12mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #111; margin: 0; padding: 16px; font-size: 11px; }
  header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #222; padding-bottom: 8px; margin-bottom: 10px; }
  h1 { margin: 0 0 4px 0; font-size: 18px; }
  .meta { font-size: 10px; color: #555; }
  .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-weight: 700; font-size: 11px; margin-left: 6px; }
  .badge.bad { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
  .badge.warn { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
  .badge.ok { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
  .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 10px 0 16px; }
  .summary div { padding: 8px; border-radius: 6px; text-align: center; background: #f3f4f6; border: 1px solid #e5e7eb; }
  .summary .lbl { font-size: 10px; font-weight: 700; opacity: .75; }
  .summary .val { font-size: 18px; font-weight: 800; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 6px; }
  thead th { background: #f3f4f6; padding: 5px 6px; text-align: left; font-weight: 600; border-bottom: 1px solid #d1d5db; }
  tbody td { padding: 5px 6px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  .num { text-align: right; }
  .bc { font-family: ui-monospace, Menlo, Consolas, monospace; }
  .skt { font-weight: 700; color: ${status === "expired" ? "#991b1b" : status === "near" ? "#92400e" : "#166534"}; }
  tr.pasif td { color: #999; font-style: italic; }
  .pasif-badge { display: inline-block; padding: 1px 5px; border-radius: 3px; background: #e5e7eb; color: #6b7280; font-size: 9px; font-weight: 700; margin-left: 4px; vertical-align: middle; }
  .actions { margin-bottom: 10px; text-align: right; }
  .actions button { background: #2563eb; color: #fff; border: 0; padding: 8px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; font-weight: 600; }
  @media print { .actions { display: none; } body { padding: 0; } }
</style>
</head>
<body>
  <div class="actions">
    <button onclick="window.print()">PDF Olarak Kaydet / Yazdır</button>
  </div>
  <header>
    <div>
      <h1>JETGO - SKT Takip Raporu</h1>
      <div class="meta">SKT Ayı: <strong>${escapeHtml(monthLabel)}</strong> <span class="badge ${statusClass}">${statusLabel}</span></div>
      <div class="meta" style="margin-top:3px">Rapor: ${now}</div>
    </div>
    <div class="meta" style="text-align:right">
      jetgomarket.com<br/>Sizpa LTD
    </div>
  </header>
  <div class="summary">
    <div><div class="lbl">TOPLAM ÜRÜN</div><div class="val">${products.length}</div></div>
    <div><div class="lbl">TOPLAM STOK</div><div class="val">${totalStock}</div></div>
    <div><div class="lbl">AKTİF</div><div class="val">${activeCount}</div></div>
    <div><div class="lbl">PASİF</div><div class="val">${passiveCount}</div></div>
  </div>
  ${products.length ? `<table>
    <thead><tr>
      <th style="width:30px">#</th>
      <th>Ürün Adı</th>
      <th style="width:120px">Barkod</th>
      <th style="width:70px">Fiyat</th>
      <th style="width:50px">Stok</th>
      <th style="width:70px">SKT</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>` : '<p style="text-align:center;color:#888;padding:30px">Bu ayda SKT\'si olan ürün bulunamadı.</p>'}
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) { alert("Lütfen pop-up engelleyicisini kapatın."); return; }
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { try { w.print(); } catch {} }, 400);
}
