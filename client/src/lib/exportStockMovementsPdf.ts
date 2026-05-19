type Movement = {
  id: number;
  product_id: number;
  product_name: string;
  barcode: string | null;
  delta: number;
  new_stock: number;
  mode: string;
  created_at: string;
};

type ExportOpts = {
  period: "Günlük" | "Haftalık" | "Aylık";
  from: string;
  to: string;
  movements: Movement[];
};

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });

const dateOnly = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));

export function exportStockMovementsPdf(opts: ExportOpts) {
  const { period, from, to, movements } = opts;
  const now = new Date().toLocaleString("tr-TR");

  // Daily groups
  const byDay = new Map<string, { date: string; sales: Movement[]; receipts: Movement[]; other: Movement[] }>();
  for (const m of movements) {
    const d = dateOnly(m.created_at);
    if (!byDay.has(d)) byDay.set(d, { date: d, sales: [], receipts: [], other: [] });
    const bucket = byDay.get(d)!;
    if (m.delta < 0) bucket.sales.push(m);
    else if (m.delta > 0) bucket.receipts.push(m);
    else bucket.other.push(m);
  }
  const days = Array.from(byDay.values()).sort((a, b) => b.date.localeCompare(a.date));

  let totalOut = 0, totalIn = 0;
  for (const m of movements) {
    if (m.delta < 0) totalOut += -m.delta;
    else if (m.delta > 0) totalIn += m.delta;
  }

  const daysHtml = days.map((d) => {
    const dayOut = d.sales.reduce((s, m) => s + -m.delta, 0);
    const dayIn = d.receipts.reduce((s, m) => s + m.delta, 0);
    const aggBy = (list: Movement[]) => {
      const map = new Map<string, { name: string; barcode: string | null; qty: number; count: number }>();
      for (const m of list) {
        const k = String(m.product_id);
        if (!map.has(k)) map.set(k, { name: m.product_name, barcode: m.barcode, qty: 0, count: 0 });
        const r = map.get(k)!;
        r.qty += Math.abs(m.delta);
        r.count += 1;
      }
      return Array.from(map.values()).sort((a, b) => b.qty - a.qty);
    };
    const salesAgg = aggBy(d.sales);
    const recAgg = aggBy(d.receipts);
    const salesRows = salesAgg.map((p, i) => `<tr>
      <td class="num">${i + 1}</td>
      <td>${escapeHtml(p.name)}</td>
      <td class="bc">${escapeHtml(p.barcode || "-")}</td>
      <td class="num">${p.qty}</td>
      <td class="num">${p.count}</td>
    </tr>`).join("");
    const recRows = recAgg.map((p, i) => `<tr>
      <td class="num">${i + 1}</td>
      <td>${escapeHtml(p.name)}</td>
      <td class="bc">${escapeHtml(p.barcode || "-")}</td>
      <td class="num">${p.qty}</td>
      <td class="num">${p.count}</td>
    </tr>`).join("");
    return `
    <section class="day">
      <h2>${escapeHtml(d.date)} <span class="tot">Satış: ${dayOut} adet / ${d.sales.length} işlem &middot; Mal Kabul: ${dayIn} adet / ${d.receipts.length} işlem</span></h2>
      ${salesAgg.length ? `<h3 class="sales-h">SATIŞ (Stoktan Düşülen)</h3>
      <table>
        <thead><tr><th style="width:30px">#</th><th>Ürün</th><th style="width:120px">Barkod</th><th style="width:60px">Adet</th><th style="width:60px">İşlem</th></tr></thead>
        <tbody>${salesRows}</tbody>
      </table>` : ""}
      ${recAgg.length ? `<h3 class="rec-h">MAL KABUL (Stoğa Eklenen)</h3>
      <table>
        <thead><tr><th style="width:30px">#</th><th>Ürün</th><th style="width:120px">Barkod</th><th style="width:60px">Adet</th><th style="width:60px">İşlem</th></tr></thead>
        <tbody>${recRows}</tbody>
      </table>` : ""}
    </section>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8" />
<title>JETGO - ${period} Stok Hareket Raporu (${from} - ${to})</title>
<style>
  @page { size: A4 portrait; margin: 12mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #111; margin: 0; padding: 16px; font-size: 11px; }
  header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #222; padding-bottom: 8px; margin-bottom: 10px; }
  h1 { margin: 0 0 4px 0; font-size: 18px; }
  .meta { font-size: 10px; color: #555; }
  .summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin: 10px 0 16px; }
  .summary div { padding: 8px; border-radius: 6px; text-align: center; }
  .sum-out { background: #fee2e2; border: 1px solid #fca5a5; }
  .sum-in  { background: #dcfce7; border: 1px solid #86efac; }
  .sum-cnt { background: #dbeafe; border: 1px solid #93c5fd; }
  .summary .lbl { font-size: 10px; font-weight: 700; opacity: .75; }
  .summary .val { font-size: 20px; font-weight: 800; margin-top: 2px; }
  .day { margin-bottom: 18px; page-break-inside: avoid; }
  .day h2 { font-size: 13px; margin: 12px 0 6px; padding: 6px 8px; background: #1f2937; color: #fff; border-radius: 4px; display: flex; justify-content: space-between; align-items: baseline; }
  .day h2 .tot { font-size: 10px; font-weight: 500; opacity: .85; }
  .day h3 { font-size: 11px; margin: 8px 0 4px; padding: 3px 6px; border-radius: 3px; display: inline-block; }
  .sales-h { background: #fee2e2; color: #991b1b; }
  .rec-h   { background: #dcfce7; color: #166534; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 6px; }
  thead th { background: #f3f4f6; padding: 4px 6px; text-align: left; font-weight: 600; border-bottom: 1px solid #d1d5db; }
  tbody td { padding: 4px 6px; border-bottom: 1px solid #e5e7eb; }
  .num { text-align: right; }
  .bc { font-family: ui-monospace, Menlo, Consolas, monospace; }
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
      <h1>JETGO - ${period} Stok Hareket Raporu</h1>
      <div class="meta">${from} - ${to} aralığı &middot; Toplam ${movements.length} hareket &middot; Rapor: ${now}</div>
    </div>
    <div class="meta" style="text-align:right">
      jetgomarket.com<br/>Sizpa LTD
    </div>
  </header>
  <div class="summary">
    <div class="sum-out"><div class="lbl">TOPLAM SATIŞ</div><div class="val">-${totalOut} adet</div></div>
    <div class="sum-in"><div class="lbl">TOPLAM MAL KABUL</div><div class="val">+${totalIn} adet</div></div>
    <div class="sum-cnt"><div class="lbl">HAREKET SAYISI</div><div class="val">${movements.length}</div></div>
  </div>
  ${days.length ? daysHtml : '<p style="text-align:center;color:#888;padding:30px">Bu aralıkta hareket bulunamadı.</p>'}
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
