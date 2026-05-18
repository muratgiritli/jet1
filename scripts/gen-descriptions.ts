import fs from "node:fs";
import OpenAI from "openai";

const BASE = process.env.JETGO_BASE || "https://www.jetgomarket.com";
const ADMIN_USER = "admin";
const ADMIN_PASS = "jetgo2024";
const QUEUE_FILE = "scripts/_products_needing_desc.json";
const PROGRESS_FILE = "scripts/_descriptions_progress.json";
const CONCURRENCY = 6;
const MAX = Number(process.env.MAX || 0) || Infinity;

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

type Item = { id: number; name: string; brand: string; animal: string; sub: string };

function loadProgress(): Record<string, "done" | "fail"> {
  if (fs.existsSync(PROGRESS_FILE)) return JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8"));
  return {};
}
function saveProgress(p: Record<string, "done" | "fail">) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2));
}

async function login(): Promise<string> {
  const r = await fetch(`${BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASS }),
  });
  if (!r.ok) throw new Error("login failed " + r.status);
  return (r.headers.get("set-cookie") || "").split(";")[0];
}

async function generateContent(item: Item): Promise<{ intro: string; features: string[]; benefits: string[]; usage: string }> {
  const prompt = `Sen bir Türk pet shop ürün açıklama yazarısın. Aşağıdaki ürün için TÜRKÇE, modern, satış odaklı bir açıklama üret.

Ürün: ${item.name}
Marka: ${item.brand}
Hayvan: ${item.animal}
Alt kategori: ${item.sub}

Sadece JSON döndür, başka hiçbir şey yazma. Format:
{
  "intro": "2-3 cümlelik tanıtım paragrafı",
  "features": ["öne çıkan özellik 1", "...", "...", "...", "..."] (5 madde, kısa),
  "benefits": ["fayda 1", "fayda 2", "fayda 3", "fayda 4"] (4 madde, kısa),
  "usage": "1-2 cümlelik kullanım/saklama önerisi"
}

Kurallar: Profesyonel ve sade dil, abartı yok. Ürün adındaki içerikleri (somon, tavuk vb.) referans al. Türkçe karakterleri doğru kullan.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });
  const text = completion.choices[0].message.content || "{}";
  const data = JSON.parse(text);
  return {
    intro: String(data.intro || "").trim(),
    features: Array.isArray(data.features) ? data.features.slice(0, 6).map(String) : [],
    benefits: Array.isArray(data.benefits) ? data.benefits.slice(0, 6).map(String) : [],
    usage: String(data.usage || "").trim(),
  };
}

function buildHtml(c: { intro: string; features: string[]; benefits: string[]; usage: string }): string {
  const li = (arr: string[]) => arr.map(x => `<li>${x}</li>`).join("");
  return `<p>${c.intro}</p>` +
    `<h3>Öne Çıkan Özellikler</h3><ul>${li(c.features)}</ul>` +
    `<h3>Faydaları</h3><ul>${li(c.benefits)}</ul>` +
    `<h3>Kullanım Önerisi</h3><p>${c.usage}</p>`;
}

async function patch(cookie: string, id: number, html: string): Promise<number> {
  const r = await fetch(`${BASE}/api/admin/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "Cookie": cookie },
    body: JSON.stringify({ longDescription: html }),
  });
  return r.status;
}

async function processOne(cookie: string, item: Item): Promise<"done" | "fail"> {
  try {
    const c = await generateContent(item);
    if (!c.intro || c.features.length === 0) return "fail";
    const html = buildHtml(c);
    const status = await patch(cookie, item.id, html);
    return status === 200 ? "done" : "fail";
  } catch (e) {
    console.error(`  [${item.id}] error:`, (e as Error).message);
    return "fail";
  }
}

async function main() {
  const queue: Item[] = JSON.parse(fs.readFileSync(QUEUE_FILE, "utf8"));
  const progress = loadProgress();
  const remaining = queue.filter(it => !progress[it.id]);
  const slice = remaining.slice(0, MAX);
  console.log(`Queue: ${queue.length} total, ${remaining.length} pending, processing: ${slice.length}`);

  const cookie = await login();
  console.log("Logged in");

  let done = 0, fail = 0;
  for (let i = 0; i < slice.length; i += CONCURRENCY) {
    const batch = slice.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(async (it) => {
      const res = await processOne(cookie, it);
      progress[it.id] = res;
      return { id: it.id, name: it.name, res };
    }));
    for (const r of results) {
      if (r.res === "done") done++; else fail++;
    }
    saveProgress(progress);
    const totalProcessed = i + batch.length;
    console.log(`[${totalProcessed}/${slice.length}] done=${done} fail=${fail} — last: ${results[results.length-1].name}`);
  }
  console.log(`\nFinal: ${done} done, ${fail} failed`);
}

main().catch((e) => { console.error(e); process.exit(1); });
