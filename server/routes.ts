import crypto from "crypto";
import type { Express, Request, Response, NextFunction } from "express";
import { type Server } from "http";
import { storage, pool as sharedPool, db } from "./storage";
import { seedDatabase } from "./seed";
import { insertBrandCategorySchema, insertProductSchema, insertCrossSellSectionSchema, insertCrossSellItemSchema, insertOrderSchema, orderItemSchema, insertBreedStatSchema, insertStockAlertSchema, orders, virtualPets, petContestEntries, petContestVotes, productReviews } from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { saveProductImage, getProductImage, downloadAndSaveImage } from "./image-service";
import { createPaytrToken, verifyPaytrCallbackHash, generateMerchantOid } from "./paytr";
import multer from "multer";
import OpenAI from "openai";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function parseSkt(skt: string): Date | null {
  if (skt.includes("/")) {
    const parts = skt.split("/");
    if (parts.length === 2) {
      const month = parseInt(parts[0]);
      const year = parseInt(parts[1]);
      if (!isNaN(month) && !isNaN(year) && month >= 1 && month <= 12) {
        return new Date(year, month, 0);
      }
    }
  }
  if (skt.includes(".")) {
    const parts = skt.split(".");
    if (parts.length === 3) {
      const month = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      if (!isNaN(month) && !isNaN(year) && month >= 1 && month <= 12) {
        return new Date(year, month, 0);
      }
    }
    if (parts.length === 2) {
      const month = parseInt(parts[0]);
      const year = parseInt(parts[1]);
      if (!isNaN(month) && !isNaN(year) && month >= 1 && month <= 12) {
        return new Date(year, month, 0);
      }
    }
  }
  return null;
}

const otpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();
const otpSendCount = new Map<string, { count: number; resetAt: number }>();

const apiRateLimits = new Map<string, { count: number; resetAt: number }>();
function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = apiRateLimits.get(key);
  if (!entry || entry.resetAt <= now) {
    apiRateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count++;
  return entry.count > maxRequests;
}
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of apiRateLimits) {
    if (val.resetAt <= now) apiRateLimits.delete(key);
  }
  for (const [key, val] of otpStore) {
    if (val.expiresAt <= now) otpStore.delete(key);
  }
  for (const [key, val] of otpSendCount) {
    if (val.resetAt <= now) otpSendCount.delete(key);
  }
  for (const [key, val] of loginAttempts) {
    if ((val.blockedUntil > 0 && val.blockedUntil <= now) || (val.blockedUntil === 0 && val.count > 0)) loginAttempts.delete(key);
  }
  if (apiRateLimits.size > 10000) apiRateLimits.clear();
  if (loginAttempts.size > 5000) loginAttempts.clear();
  if (otpStore.size > 5000) otpStore.clear();
  if (otpSendCount.size > 5000) otpSendCount.clear();
}, 60000);

const loginAttempts = new Map<string, { count: number; blockedUntil: number }>();

function generateOTP(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

async function sendSmsViaNetgsm(phone: string, message: string): Promise<boolean> {
  const usercode = process.env.NETGSM_USERCODE;
  const password = process.env.NETGSM_PASSWORD;
  const msgheader = process.env.NETGSM_MSGHEADER;
  if (!usercode || !password || !msgheader) {
    console.error("NetGSM credentials not configured");
    return false;
  }
  const gsmno = phone.replace(/\D/g, "");
  const fullPhone = gsmno.startsWith("90") ? gsmno : "90" + gsmno;
  console.log(`NetGSM sending to: ${fullPhone}`);

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<mainbody>
<header>
<company dession="1">Netgsm</company>
<usercode>${usercode}</usercode>
<password>${password}</password>
<type>1:n</type>
<msgheader>${msgheader}</msgheader>
</header>
<body>
<msg><![CDATA[${message}]]></msg>
<no>${fullPhone}</no>
</body>
</mainbody>`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch("http://api.netgsm.com.tr/sms/send/xml", {
        method: "POST",
        headers: { "Content-Type": "application/xml" },
        body: xmlBody,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const text = await res.text();
      console.log(`NetGSM response (attempt ${attempt}):`, text);
      const code = text.split(" ")[0];
      if (["00", "01", "02"].includes(code)) return true;
      if (["30", "40", "50", "51", "70", "80", "85"].includes(code)) {
        console.error(`NetGSM permanent error code: ${code}`);
        return false;
      }
    } catch (err: any) {
      console.error(`NetGSM SMS error (attempt ${attempt}):`, err?.message || err);
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
        continue;
      }
    }
  }

  try {
    console.log("NetGSM XML failed, trying GET fallback...");
    const params = new URLSearchParams({
      usercode,
      password,
      gsmno: fullPhone,
      message,
      msgheader,
      dil: "TR",
    });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(`http://api.netgsm.com.tr/sms/send/get/?${params.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const text = await res.text();
    console.log("NetGSM GET fallback response:", text);
    const code = text.split(" ")[0];
    return ["00", "01", "02"].includes(code);
  } catch (err: any) {
    console.error("NetGSM GET fallback error:", err?.message || err);
    return false;
  }
}

const PgSession = pgSession(session);

async function ensureAdminExists() {
  const existing = await storage.getUserByUsername("admin");
  if (!existing) {
    const hashed = await bcrypt.hash("jetgo2024", 10);
    await storage.createUser({ username: "admin", password: hashed });
    console.log("Default admin user created (admin / jetgo2024)");
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!(req.session as any)?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use(
    session({
      store: new PgSession({
        pool: sharedPool,
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: { secure: process.env.NODE_ENV === "production", httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: "lax" },
    })
  );

  await seedDatabase();
  await ensureAdminExists();

  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(self), microphone=(), geolocation=(self)");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    res.setHeader("X-Download-Options", "noopen");
    res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://googleads.g.doubleclick.net https://www.googleadservices.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://www.google-analytics.com https://www.google.com https://googleads.g.doubleclick.net https://www.googleadservices.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self';");

    if (req.path.startsWith("/api/")) {
      const ip = req.ip || "unknown";
      if (req.method === "POST") {
        if (rateLimit(`global:post:${ip}`, 60, 60 * 1000)) {
          return res.status(429).json({ message: "Çok fazla istek. Lütfen bekleyin." });
        }
      }
      if (rateLimit(`global:all:${ip}`, 300, 60 * 1000)) {
        return res.status(429).json({ message: "Çok fazla istek. Lütfen bekleyin." });
      }
    }

    next();
  });

  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const SITE = "https://www.jetgo.pet";
      const today = new Date().toISOString().split("T")[0];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      xml += `  <sitemap>\n    <loc>${SITE}/sitemap-main.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
      xml += `  <sitemap>\n    <loc>${SITE}/sitemap-products.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
      xml += `  <sitemap>\n    <loc>${SITE}/sitemap-seo.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;

      xml += `</sitemapindex>`;

      res.set("Content-Type", "application/xml");
      res.set("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch (err) {
      res.status(500).send("Sitemap error");
    }
  });

  app.get("/sitemap-main.xml", async (_req, res) => {
    try {
      const SITE = "https://www.jetgo.pet";
      const staticPages = [
        { url: "/", priority: "1.0", changefreq: "daily" },
        { url: "/kategori", priority: "0.9", changefreq: "weekly" },
        { url: "/kategori/kopek", priority: "0.8", changefreq: "weekly" },
        { url: "/kategori/kedi", priority: "0.8", changefreq: "weekly" },
        { url: "/kategori/kus", priority: "0.7", changefreq: "weekly" },
        { url: "/kategori/kemirgen", priority: "0.7", changefreq: "weekly" },
        { url: "/kampanya", priority: "0.8", changefreq: "daily" },
        { url: "/sss", priority: "0.5", changefreq: "monthly" },
        { url: "/hakkimizda", priority: "0.4", changefreq: "monthly" },
        { url: "/iletisim", priority: "0.4", changefreq: "monthly" },
        { url: "/islem-rehberi", priority: "0.5", changefreq: "monthly" },
        { url: "/teslimat-iade", priority: "0.5", changefreq: "monthly" },
        { url: "/kvkk", priority: "0.3", changefreq: "yearly" },
        { url: "/gizlilik", priority: "0.3", changefreq: "yearly" },
        { url: "/kullanim-kosullari", priority: "0.3", changefreq: "yearly" },
        { url: "/cerez-politikasi", priority: "0.3", changefreq: "yearly" },
        { url: "/mesafeli-satis", priority: "0.3", changefreq: "yearly" },
        { url: "/gizlilik-sozlesmesi", priority: "0.3", changefreq: "yearly" },
      ];

      const today = new Date().toISOString().split("T")[0];
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      for (const page of staticPages) {
        xml += `  <url>\n    <loc>${SITE}${page.url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
      }

      const categories = await storage.getAllBrandCategories();
      const seenCategories = new Set<string>();
      for (const cat of categories) {
        const catKey = `${cat.animal}/${cat.subcategory}`;
        if (!seenCategories.has(catKey)) {
          seenCategories.add(catKey);
          xml += `  <url>\n    <loc>${SITE}/kategori/${cat.animal}/${cat.subcategory}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
        }
        if (cat.slug) {
          xml += `  <url>\n    <loc>${SITE}/siparis/${cat.animal}/${cat.subcategory}/${cat.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
        }
      }

      xml += `</urlset>`;

      res.set("Content-Type", "application/xml");
      res.set("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch (err) {
      res.status(500).send("Sitemap error");
    }
  });

  app.get("/sitemap-products.xml", async (_req, res) => {
    try {
      const SITE = "https://www.jetgo.pet";
      const allProducts = await storage.getAllProducts();
      const activeProducts = allProducts.filter((p: any) => p.isActive && p.stock > 0 && p.price > 0);
      const today = new Date().toISOString().split("T")[0];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      for (const p of activeProducts) {
        const slug = p.name.toLowerCase().replace(/[^a-z0-9ğüşıöç]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
        xml += `  <url>\n    <loc>${SITE}/urun/${p.id}/${slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      }
      xml += `</urlset>`;

      res.set("Content-Type", "application/xml");
      res.set("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch (err) {
      res.status(500).send("Sitemap error");
    }
  });


  app.get("/sitemap-seo.xml", async (_req, res) => {
    try {
      const SITE = "https://www.jetgo.pet";
      const today = new Date().toISOString().split("T")[0];
      const coreSlugs = [
        { url: "/samsun-petshop", priority: "0.9", changefreq: "weekly" },
        { url: "/atakum-petshop", priority: "0.8", changefreq: "weekly" },
        { url: "/ilkadim-petshop", priority: "0.8", changefreq: "weekly" },
        { url: "/canik-petshop", priority: "0.8", changefreq: "weekly" },
        { url: "/atakum-mahalleler", priority: "0.7", changefreq: "monthly" },
        { url: "/kedi-mamasi", priority: "0.8", changefreq: "weekly" },
        { url: "/kopek-mamasi", priority: "0.8", changefreq: "weekly" },
        { url: "/kedi-kumu", priority: "0.8", changefreq: "weekly" },
        { url: "/pet-aksesuar", priority: "0.7", changefreq: "weekly" },
        { url: "/kedi-mamasi-en-iyi-markalar", priority: "0.7", changefreq: "monthly" },
        { url: "/kedi-kumu-en-iyi", priority: "0.7", changefreq: "monthly" },
        { url: "/kopek-mamasi-fiyatlari", priority: "0.7", changefreq: "monthly" },
      ];
      const atakumMahalleler = ["denizevleri","guzelyali","kurupelit","atakent","incesu","mimar-sinan","korfez","yeni-mahalle","altinkum","balac","cakirlar","soguksu","taflan","cobanli","buyukoyumca","esenevler"];
      const ilkadimMahalleler = ["kadikoy","rasathane","kilicdede","baruthane","kalkanci","ulugazi","derecik","adalet","ciftlik"];
      const canikMahalleler = ["karsiyaka","gaziosmanpasa","canik-yenimahalle","kuzeyyildizi"];
      const mahalleSlugs = [
        ...atakumMahalleler.map(m => ({ url: `/atakum-${m}-petshop`, priority: "0.6", changefreq: "monthly" })),
        ...ilkadimMahalleler.map(m => ({ url: `/ilkadim-${m}-petshop`, priority: "0.6", changefreq: "monthly" })),
        ...canikMahalleler.map(m => ({ url: `/canik-${m}-petshop`, priority: "0.6", changefreq: "monthly" })),
      ];
      const keywordSlugs = [
        { url: "/samsun-atakum-petshop-kedi-kopek-mamasi", priority: "0.8", changefreq: "weekly" },
        { url: "/jetgo-petshop", priority: "0.8", changefreq: "weekly" },
        { url: "/samsun-petshop-kedi-mamasi", priority: "0.8", changefreq: "weekly" },
        { url: "/samsun-petshop-kopek-mamasi", priority: "0.8", changefreq: "weekly" },
        { url: "/samsun-petshop-kedi-kumu", priority: "0.8", changefreq: "weekly" },
        { url: "/atakum-petshop-kedi-mamasi", priority: "0.7", changefreq: "weekly" },
        { url: "/atakum-petshop-kopek-mamasi", priority: "0.7", changefreq: "weekly" },
        { url: "/en-yakin-petshop-samsun", priority: "0.7", changefreq: "weekly" },
        { url: "/kapiya-teslim-petshop-samsun", priority: "0.7", changefreq: "weekly" },
        { url: "/online-petshop-samsun", priority: "0.7", changefreq: "weekly" },
        { url: "/samsun-petshop-fiyat-kampanya", priority: "0.7", changefreq: "weekly" },
        { url: "/samsun-evcil-hayvan-magazasi", priority: "0.7", changefreq: "weekly" },
        { url: "/samsun-kedi-mamasi-fiyatlari", priority: "0.7", changefreq: "weekly" },
        { url: "/acil-kedi-mamasi-samsun", priority: "0.7", changefreq: "weekly" },
        { url: "/kopek-mamasi-hizli-teslim-samsun", priority: "0.7", changefreq: "weekly" },
        { url: "/kedi-kumu-kapiya-teslim-samsun", priority: "0.7", changefreq: "weekly" },
        { url: "/mama-siparis-samsun", priority: "0.7", changefreq: "weekly" },
        { url: "/petshop-delivery-samsun", priority: "0.7", changefreq: "weekly" },
        { url: "/samsun-kedi-acik-mama", priority: "0.6", changefreq: "monthly" },
        { url: "/samsun-kedi-yas-mama", priority: "0.6", changefreq: "monthly" },
        { url: "/samsun-kedi-konserve", priority: "0.6", changefreq: "monthly" },
        { url: "/samsun-kedi-malt-vitamin", priority: "0.6", changefreq: "monthly" },
        { url: "/samsun-kedi-odul-mama", priority: "0.6", changefreq: "monthly" },
        { url: "/samsun-kedi-bakim-saglik", priority: "0.6", changefreq: "monthly" },
        { url: "/samsun-kedi-tuvaleti", priority: "0.6", changefreq: "monthly" },
        { url: "/samsun-kedi-tasima", priority: "0.6", changefreq: "monthly" },
        { url: "/samsun-kopek-acik-mama", priority: "0.6", changefreq: "monthly" },
        { url: "/samsun-kopek-yas-mama", priority: "0.6", changefreq: "monthly" },
        { url: "/samsun-kopek-odul-kemik", priority: "0.6", changefreq: "monthly" },
        { url: "/samsun-kopek-bakim-saglik", priority: "0.6", changefreq: "monthly" },
        { url: "/samsun-kopek-tuvalet-malzemeleri", priority: "0.6", changefreq: "monthly" },
        { url: "/samsun-kopek-tasima-kulube", priority: "0.6", changefreq: "monthly" },
        { url: "/samsun-kopek-uygun-cuval-mama", priority: "0.6", changefreq: "monthly" },
        { url: "/samsun-kus-yemi", priority: "0.6", changefreq: "monthly" },
        { url: "/samsun-kus-kafesi", priority: "0.6", changefreq: "monthly" },
        { url: "/samsun-kus-vitamini", priority: "0.6", changefreq: "monthly" },
        { url: "/samsun-kus-bakim-aksesuar", priority: "0.6", changefreq: "monthly" },
        { url: "/samsun-kemirgen-yemi", priority: "0.6", changefreq: "monthly" },
        { url: "/samsun-kemirgen-kafesi", priority: "0.6", changefreq: "monthly" },
        { url: "/samsun-kemirgen-vitamin", priority: "0.6", changefreq: "monthly" },
        { url: "/samsun-kemirgen-bakim-aksesuar", priority: "0.6", changefreq: "monthly" },
        { url: "/atakum-cumhuriyet-petshop", priority: "0.5", changefreq: "monthly" },
        { url: "/atakum-alanli-petshop", priority: "0.5", changefreq: "monthly" },
        { url: "/atakum-kucukoyumca-petshop", priority: "0.5", changefreq: "monthly" },
        { url: "/atakum-avdan-petshop", priority: "0.5", changefreq: "monthly" },
        { url: "/atakum-catalcam-petshop", priority: "0.5", changefreq: "monthly" },
        { url: "/atakum-haciismail-petshop", priority: "0.5", changefreq: "monthly" },
        { url: "/atakum-kamali-petshop", priority: "0.5", changefreq: "monthly" },
        { url: "/atakum-mecidiye-petshop", priority: "0.5", changefreq: "monthly" },
        { url: "/atakum-yenicam-petshop", priority: "0.5", changefreq: "monthly" },
        { url: "/atakum-organize-sanayi-petshop", priority: "0.5", changefreq: "monthly" },
        { url: "/atakum-kozaagac-petshop", priority: "0.5", changefreq: "monthly" },
        { url: "/atakum-kedi-kumu-kapiya-teslim", priority: "0.7", changefreq: "weekly" },
        { url: "/atakum-kedi-mamasi-kapiya-teslim", priority: "0.7", changefreq: "weekly" },
        { url: "/atakum-kopek-mamasi-kapiya-teslim", priority: "0.7", changefreq: "weekly" },
        { url: "/atakum-kus-yemi-kafes", priority: "0.6", changefreq: "monthly" },
        { url: "/atakum-kemirgen-urunleri", priority: "0.6", changefreq: "monthly" },
        { url: "/atakum-petshop-ayni-gun-teslimat", priority: "0.7", changefreq: "weekly" },
        { url: "/atakum-en-yakin-petshop", priority: "0.7", changefreq: "weekly" },
        { url: "/atakum-petshop-kapida-odeme", priority: "0.7", changefreq: "weekly" },
        { url: "/atakum-petshop-whatsapp-siparis", priority: "0.7", changefreq: "weekly" },
      ];
      const blogSlugs = [
        { url: "/blog", priority: "0.8", changefreq: "weekly" },
        { url: "/blog/kedi-mamasi-nasil-secilir", priority: "0.7", changefreq: "monthly" },
        { url: "/blog/kopek-mamasi-secim-rehberi", priority: "0.7", changefreq: "monthly" },
        { url: "/blog/kedi-kumu-secim-rehberi", priority: "0.7", changefreq: "monthly" },
        { url: "/blog/evcil-hayvan-beslenme-hatalari", priority: "0.7", changefreq: "monthly" },
        { url: "/blog/kedi-bakim-ipuclari", priority: "0.7", changefreq: "monthly" },
        { url: "/blog/samsun-evcil-hayvan-gezilecek-yerler", priority: "0.6", changefreq: "monthly" },
      ];
      const seoSlugs = [...coreSlugs, ...mahalleSlugs, ...keywordSlugs, ...blogSlugs];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      for (const page of seoSlugs) {
        xml += `  <url>\n    <loc>${SITE}${page.url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
      }
      xml += `</urlset>`;

      res.set("Content-Type", "application/xml");
      res.set("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch (err) {
      res.status(500).send("Sitemap error");
    }
  });

  app.get("/api/export/xlsx", requireAdmin, async (_req, res) => {
    try {
      const XLSX = await import("xlsx");
      const SITE = "https://www.jetgo.pet";
      const ANIMAL_MAP: Record<string, string> = { kedi: "Kedi", kopek: "Köpek", kus: "Kuş", kemirgen: "Kemirgen" };

      const { rows } = await sharedPool.query(`
        SELECT p.id, p.name, p.price, p.original_price, p.skt, p.img, p.stock,
               bc.brand_name, bc.animal, s.display_name as subcategory_name
        FROM products p
        LEFT JOIN brand_categories bc ON p.brand_category_id = bc.id
        LEFT JOIN subcategories s ON bc.subcategory = s.slug AND bc.animal = s.animal
        WHERE p.is_active = true AND p.stock > 0 AND p.price > 0
        ORDER BY p.id
      `);

      const data = rows.map((r: any) => ({
        "ID": r.id,
        "Title": r.name,
        "Description": `${r.brand_name ? r.brand_name + " - " : ""}${r.name}${r.subcategory_name ? " | " + r.subcategory_name : ""}`,
        "Price": r.price,
        "Old price": r.original_price || "",
        "Currency": "TRY",
        "URL": `${SITE}/urun/${r.id}`,
        "Image URL": r.img ? `${SITE}${r.img}` : "",
        "Category": `${ANIMAL_MAP[r.animal] || r.animal || ""} > ${r.subcategory_name || ""}`,
        "Brand": r.brand_name || "",
        "Availability": r.stock > 0 ? "in stock" : "out of stock",
        "Stock": r.stock,
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      ws['!cols'] = [
        { wch: 6 }, { wch: 60 }, { wch: 70 }, { wch: 12 },
        { wch: 14 }, { wch: 6 }, { wch: 35 }, { wch: 45 },
        { wch: 30 }, { wch: 25 }, { wch: 12 }, { wch: 6 },
      ];
      XLSX.utils.book_append_sheet(wb, ws, "Ürünler");

      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      res.setHeader("Content-Disposition", "attachment; filename=jetgo_urunler.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.send(buf);
    } catch (err) {
      console.error("Export XLSX error:", err);
      res.status(500).json({ error: "Export failed" });
    }
  });

  app.get("/api/export/yml", requireAdmin, async (_req, res) => {
    try {
      const SITE = "https://www.jetgo.pet";
      const ANIMAL_MAP: Record<string, string> = { kedi: "Kedi", kopek: "Köpek", kus: "Kuş", kemirgen: "Kemirgen" };

      const { rows } = await sharedPool.query(`
        SELECT p.id, p.name, p.price, p.original_price, p.skt, p.img, p.stock,
               bc.brand_name, bc.animal, s.display_name as subcategory_name
        FROM products p
        LEFT JOIN brand_categories bc ON p.brand_category_id = bc.id
        LEFT JOIN subcategories s ON bc.subcategory = s.slug AND bc.animal = s.animal
        WHERE p.is_active = true AND p.stock > 0 AND p.price > 0
        ORDER BY p.id
      `);

      const categories = new Map<string, { id: number; animal: string; subcat: string }>();
      let catId = 1;
      for (const r of rows as any[]) {
        const key = (r.animal || "") + "|" + (r.subcategory_name || "");
        if (!categories.has(key) && r.subcategory_name) {
          categories.set(key, { id: catId++, animal: r.animal, subcat: r.subcategory_name });
        }
      }

      const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

      let yml = `<?xml version="1.0" encoding="UTF-8"?>\n<yml_catalog date="${new Date().toISOString().split("T")[0]}">\n  <shop>\n    <name>JETGO Pet Shop</name>\n    <company>Sizpa İnternet Tic. Ltd. Şti.</company>\n    <url>https://www.jetgo.pet</url>\n    <currencies>\n      <currency id="TRY" rate="1"/>\n    </currencies>\n    <categories>\n`;

      for (const [, cat] of categories) {
        yml += `      <category id="${cat.id}">${esc(cat.subcat)} (${ANIMAL_MAP[cat.animal] || cat.animal})</category>\n`;
      }
      yml += "    </categories>\n    <offers>\n";

      for (const r of rows as any[]) {
        const key = (r.animal || "") + "|" + (r.subcategory_name || "");
        const cat = categories.get(key);
        yml += `      <offer id="${r.id}" available="true">\n`;
        yml += `        <name>${esc(r.name)}</name>\n`;
        yml += `        <url>${SITE}/urun/${r.id}</url>\n`;
        yml += `        <price>${r.price}</price>\n`;
        if (r.original_price && r.original_price > r.price) yml += `        <oldprice>${r.original_price}</oldprice>\n`;
        yml += `        <currencyId>TRY</currencyId>\n`;
        if (cat) yml += `        <categoryId>${cat.id}</categoryId>\n`;
        if (r.img) yml += `        <picture>${SITE}${r.img}</picture>\n`;
        if (r.brand_name) yml += `        <vendor>${esc(r.brand_name)}</vendor>\n`;
        yml += `        <delivery>true</delivery>\n        <store>true</store>\n      </offer>\n`;
      }
      yml += "    </offers>\n  </shop>\n</yml_catalog>\n";

      res.setHeader("Content-Disposition", "attachment; filename=jetgo_urunler.yml");
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.send(yml);
    } catch (err) {
      console.error("Export YML error:", err);
      res.status(500).json({ error: "Export failed" });
    }
  });

  await sharedPool.query(`CREATE TABLE IF NOT EXISTS product_images (product_id INTEGER PRIMARY KEY, data TEXT NOT NULL, updated_at TIMESTAMP NOT NULL DEFAULT NOW())`);
  
  const { rows: [{ count: imgCount }] } = await sharedPool.query(`SELECT COUNT(*)::int as count FROM product_images`);
  
  if (imgCount === 0) {
    setTimeout(async () => {
      console.log(`[image] product_images table is empty, importing disk images in background...`);
      const fs = await import("fs");
      const pathMod = await import("path");
      const bgPool = sharedPool;
      
      const imageDirs = [
        pathMod.default.join(process.cwd(), "dist", "public", "product-images"),
        pathMod.default.join(process.cwd(), "client", "public", "product-images"),
      ].filter(d => fs.existsSync(d));
      
      let imported = 0;
      for (const dir of imageDirs) {
        const files = fs.readdirSync(dir).filter((f: string) => f.endsWith(".webp"));
        for (let i = 0; i < files.length; i += 50) {
          const batch = files.slice(i, i + 50);
          for (const file of batch) {
            const match = file.match(/product-(\d+)\.webp/);
            if (!match) continue;
            const productId = parseInt(match[1]);
            const data = fs.readFileSync(pathMod.default.join(dir, file));
            const base64 = data.toString("base64");
            try {
              await bgPool.query(
                `INSERT INTO product_images (product_id, data, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (product_id) DO NOTHING`,
                [productId, base64]
              );
              imported++;
            } catch {}
          }
          console.log(`[image] Imported ${Math.min(i + 50, files.length)}/${files.length} from ${dir}`);
        }
      }
      console.log(`[image] Disk import complete: ${imported} images`);

      const allProducts = await storage.getAllProducts();
      for (const p of allProducts) {
        if (p.originalImg && p.img?.startsWith("/product-images/")) {
          try {
            const imgPath = await (await import("./image-service")).downloadAndSaveImage(p.originalImg, p.id);
            if (imgPath) {
              await storage.updateProduct(p.id, { img: imgPath });
            }
          } catch {}
          await new Promise(r => setTimeout(r, 300));
        }
      }
      console.log(`[image] Background import fully complete`);
    }, 3000);
  }

  app.get("/api/product-image/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).end();
    const buffer = await getProductImage(id);
    if (!buffer) return res.status(404).end();
    res.setHeader("Content-Type", "image/webp");
    res.setHeader("Cache-Control", "public, max-age=604800, immutable");
    res.send(buffer);
  });

  app.get("/product-images/:filename", async (req, res) => {
    const match = req.params.filename.match(/product-(\d+)\.webp/);
    if (!match) return res.status(404).end();
    const id = parseInt(match[1]);
    const buffer = await getProductImage(id);
    if (!buffer) return res.status(404).end();
    res.setHeader("Content-Type", "image/webp");
    res.setHeader("Cache-Control", "public, max-age=604800, immutable");
    res.send(buffer);
  });

  app.get("/api/subcategories", async (req, res) => {
    const subs = await storage.getAllSubcategories();
    res.setHeader("Cache-Control", "public, max-age=120, stale-while-revalidate=600");
    if (req.query.all === "true") return res.json(subs);
    res.json(subs.filter(s => s.isActive));
  });

  app.get("/api/subcategories/:animal", async (req, res) => {
    const subs = await storage.getSubcategoriesByAnimal(req.params.animal);
    res.setHeader("Cache-Control", "public, max-age=120, stale-while-revalidate=600");
    if (req.query.all === "true") return res.json(subs);
    res.json(subs.filter(s => s.isActive));
  });

  app.post("/api/admin/subcategories", requireAdmin, async (req, res) => {
    try {
      const schema = z.object({ animal: z.string().min(1).max(30), slug: z.string().min(1).max(50), displayName: z.string().min(1).max(100), color: z.string().max(20).optional(), hasBrands: z.boolean().optional(), sortOrder: z.number().int().optional(), isActive: z.boolean().optional() });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Geçersiz veri", errors: parsed.error.errors });
      const sub = await storage.createSubcategory(parsed.data as any);
      res.status(201).json(sub);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.patch("/api/admin/subcategories/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Geçersiz ID" });
    const allowedKeys = ["animal", "slug", "displayName", "color", "hasBrands", "sortOrder", "isActive"];
    const safeBody: Record<string, any> = {};
    for (const key of allowedKeys) {
      if (req.body[key] !== undefined) safeBody[key] = req.body[key];
    }
    const sub = await storage.updateSubcategory(id, safeBody);
    if (!sub) return res.status(404).json({ message: "Subcategory not found" });
    res.json(sub);
  });

  app.delete("/api/admin/subcategories/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteSubcategory(id);
    res.json({ message: "Deleted" });
  });

  app.get("/api/brand-categories", async (_req, res) => {
    const categories = await storage.getAllBrandCategories();
    res.setHeader("Cache-Control", "public, max-age=120, stale-while-revalidate=600");
    res.json(categories);
  });

  app.get("/api/brand-categories/:id/products", async (req, res) => {
    const id = parseInt(req.params.id);
    const category = await storage.getBrandCategory(id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    const prods = await storage.getProductsByBrandCategory(id);
    const activeOnly = req.query.all !== "true";
    if (!activeOnly) {
      res.json({ category, products: prods });
    } else {
      res.json({ category, products: prods.filter(p => p.isActive) });
    }
  });

  const SUBCATEGORY_SLUG_MAP: Record<string, string> = {
    "kedi-odulu": "odul",
    "kedi-bakim-saglik": "bakim-saglik",
    "kedi-konserve": "kedi-konserve",
    "malt-macun": "malt-macun",
    "malt-vitamin": "malt-vitamin",
    "kopek-mamasi": "mama-markalari",
    "kopek-kuru-mama": "mama-markalari",
  };

  app.get("/api/brand-products/:animal/:subcategory/:brandSlug", async (req, res) => {
    const { animal, brandSlug } = req.params;
    const subcategory = SUBCATEGORY_SLUG_MAP[req.params.subcategory] || req.params.subcategory;
    const category = await storage.getBrandCategoryBySlug(animal, subcategory, brandSlug);
    if (!category) return res.status(404).json({ message: "Brand category not found" });
    const prods = await storage.getProductsByBrandCategory(category.id);
    res.json({ category, products: prods.filter(p => p.isActive) });
  });

  app.get("/api/animal-products/:animal", async (req, res) => {
    const { animal } = req.params;
    const allBrandCats = await storage.getAllBrandCategories();
    const matchingCatIds = allBrandCats
      .filter((bc) => bc.animal === animal)
      .map((bc) => bc.id);
    if (matchingCatIds.length === 0) return res.json([]);
    const allProducts = await storage.getAllProducts();
    const filtered = allProducts.filter(
      (p) => p.isActive && p.brandCategoryId && matchingCatIds.includes(p.brandCategoryId)
    );
    res.setHeader("Cache-Control", "public, max-age=120, stale-while-revalidate=600");
    res.json(filtered.map(({ costPrice, ...rest }) => rest));
  });

  app.get("/api/subcategory-products/:animal/:subcategorySlug", async (req, res) => {
    const { animal } = req.params;
    const subcategorySlug = SUBCATEGORY_SLUG_MAP[req.params.subcategorySlug] || req.params.subcategorySlug;
    const allBrandCats = await storage.getAllBrandCategories();
    const matchingCatIds = allBrandCats
      .filter((bc) => bc.animal === animal && bc.subcategory === subcategorySlug)
      .map((bc) => bc.id);
    if (matchingCatIds.length === 0) return res.json([]);
    const allProducts = await storage.getAllProducts();
    const filtered = allProducts.filter(
      (p) => p.isActive && p.brandCategoryId && matchingCatIds.includes(p.brandCategoryId)
    );
    res.setHeader("Cache-Control", "public, max-age=120, stale-while-revalidate=600");
    res.json(filtered);
  });


  app.get("/robots.txt", (req, res) => {
    res.set("Content-Type", "text/plain");
    res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /odeme\nDisallow: /giris\nDisallow: /hesabim\nDisallow: /siparis-takip\n\nSitemap: https://www.jetgo.pet/sitemap.xml\n`);
  });

  app.get("/api/products", async (req, res) => {
    const allProducts = await storage.getAllProducts();
    const isAdmin = !!(req.session as any)?.userId;
    const showAll = req.query.all === "true" && isAdmin;
    if (showAll) {
      res.setHeader("Cache-Control", "private, no-store");
      res.json(allProducts);
    } else {
      res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
      res.json(allProducts.filter(p => p.isActive).map(({ costPrice, ...rest }) => rest));
    }
  });

  app.get("/api/products/search", async (req, res) => {
    const query = (req.query.q as string || "").trim();
    if (!query || query.length < 2) return res.json([]);
    const results = await storage.searchProducts(query);
    res.json(results.filter(p => p.isActive).slice(0, 20).map(({ costPrice, ...rest }) => rest));
  });

  app.post("/api/admin/login", async (req, res) => {
    const ip = req.ip || "unknown";
    const now = Date.now();
    const attempt = loginAttempts.get(ip);
    if (attempt && attempt.blockedUntil > now) {
      const wait = Math.ceil((attempt.blockedUntil - now) / 1000);
      return res.status(429).json({ message: `Çok fazla deneme. ${wait} saniye bekleyin.` });
    }

    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }
    const user = await storage.getUserByUsername(username);
    if (!user) {
      const c = (attempt?.count || 0) + 1;
      loginAttempts.set(ip, { count: c, blockedUntil: c >= 5 ? now + 5 * 60 * 1000 : 0 });
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      const c = (attempt?.count || 0) + 1;
      loginAttempts.set(ip, { count: c, blockedUntil: c >= 5 ? now + 5 * 60 * 1000 : 0 });
      return res.status(401).json({ message: "Invalid credentials" });
    }
    loginAttempts.delete(ip);
    (req.session as any).userId = user.id;
    res.json({ message: "Login successful" });
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/admin/me", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const user = await storage.getUser(userId);
    if (!user) return res.status(401).json({ message: "Not authenticated" });
    res.json({ username: user.username });
  });

  app.post("/api/admin/brand-categories", requireAdmin, async (req, res) => {
    const parsed = insertBrandCategorySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    const category = await storage.createBrandCategory(parsed.data);
    res.status(201).json(category);
  });

  app.patch("/api/admin/brand-categories/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Geçersiz ID" });
    const allowedKeys = ["brandName", "brandSlug", "animal", "subcategory"];
    const safeBody: Record<string, any> = {};
    for (const key of allowedKeys) {
      if (req.body[key] !== undefined) safeBody[key] = req.body[key];
    }
    const category = await storage.updateBrandCategory(id, safeBody);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  });

  app.delete("/api/admin/brand-categories/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteBrandCategory(id);
    res.json({ message: "Deleted" });
  });

  app.post("/api/admin/products", requireAdmin, async (req, res) => {
    const parsed = insertProductSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    const product = await storage.createProduct(parsed.data);
    if (product.img && product.img.startsWith("http")) {
      const imgPath = await downloadAndSaveImage(product.img, product.id);
      if (imgPath) {
        const updated = await storage.updateProduct(product.id, { img: imgPath });
        return res.status(201).json(updated);
      }
    }
    res.status(201).json(product);
  });

  app.patch("/api/admin/products/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Geçersiz ürün ID" });
    const allowedFields = ["name", "price", "originalPrice", "skt", "img", "originalImg", "brandCategoryId", "isActive", "stock", "barcode", "costPrice", "mamaType", "preorderEnabled"];
    const safeBody: Record<string, any> = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) safeBody[key] = req.body[key];
    }
    if (safeBody.img && typeof safeBody.img === "string" && safeBody.img.startsWith("http")) {
      const imgPath = await downloadAndSaveImage(safeBody.img, id);
      if (imgPath) {
        safeBody.img = imgPath;
      }
    }
    const product = await storage.updateProduct(id, safeBody);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.post("/api/admin/products/:id/image", requireAdmin, upload.single("image"), async (req, res) => {
    const id = parseInt(req.params.id);
    if (!req.file) return res.status(400).json({ message: "Resim dosyası gerekli" });
    if (!req.file.mimetype.startsWith("image/")) return res.status(400).json({ message: "Sadece resim dosyaları yüklenebilir" });
    try {
      const imgPath = await saveProductImage(req.file.buffer, id);
      const product = await storage.updateProduct(id, { img: imgPath });
      if (!product) return res.status(404).json({ message: "Ürün bulunamadı" });
      res.json(product);
    } catch (err: any) {
      console.log(`[image] Upload error for product ${id}: ${err.message}`);
      res.status(500).json({ message: "Resim yüklenemedi" });
    }
  });

  app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteProduct(id);
    res.json({ message: "Deleted" });
  });

  app.post("/api/admin/products/bulk-price-update", requireAdmin, async (req, res) => {
    const { productIds, percentage } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0 || typeof percentage !== "number" || percentage === 0) {
      return res.status(400).json({ message: "Invalid data" });
    }
    const multiplier = 1 + percentage / 100;
    let updated = 0;
    for (const id of productIds) {
      const product = await storage.getProduct(id);
      if (product) {
        const newPrice = Math.round(product.price * multiplier * 100) / 100;
        const updateData: any = { price: newPrice };
        if (product.originalPrice) {
          updateData.originalPrice = Math.round(product.originalPrice * multiplier * 100) / 100;
        }
        await storage.updateProduct(id, updateData);
        updated++;
      }
    }
    res.json({ message: `${updated} ürün fiyatı güncellendi`, updated });
  });

  app.post("/api/admin/products/bulk-individual-update", requireAdmin, async (req, res) => {
    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: "Invalid data" });
    }
    let updated = 0;
    for (const { id, price } of updates) {
      if (typeof id === "number" && typeof price === "number" && price >= 0) {
        await storage.updateProduct(id, { price });
        updated++;
      }
    }
    res.json({ message: `${updated} ürün fiyatı güncellendi`, updated });
  });

  app.post("/api/admin/products/bulk-stock-update", requireAdmin, async (req, res) => {
    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0 || updates.length > 500) {
      return res.status(400).json({ message: "Invalid data" });
    }
    let updated = 0;
    for (const item of updates) {
      const id = Number(item.id);
      const stock = Number(item.stock);
      if (!Number.isInteger(id) || id <= 0 || !Number.isFinite(stock) || stock < 0) continue;
      const product = await storage.getProduct(id);
      if (product) {
        await storage.updateProduct(id, { stock: Math.floor(stock) });
        updated++;
      }
    }
    res.json({ message: `${updated} ürün stoğu güncellendi`, updated });
  });

  app.get("/api/product-detail/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const product = await storage.getProduct(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const category = await storage.getBrandCategory(product.brandCategoryId);
    const allSections = await storage.getAllCrossSellSections();
    const productAnimal = category?.animal || null;
    const activeSections = allSections
      .filter(s => {
        if (!s.isActive) return false;
        if (s.forProductId !== null) return s.forProductId === id;
        if (s.forAnimal !== null) return s.forAnimal === productAnimal;
        return true;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const sectionsWithProducts = await Promise.all(
      activeSections.map(async (section) => {
        const items = await storage.getCrossSellItemsBySection(section.id);
        const sectionProducts = (await Promise.all(
          items.sort((a, b) => a.sortOrder - b.sortOrder).map(async (item) => {
            const p = await storage.getProduct(item.productId);
            return p && p.isActive ? p : null;
          })
        )).filter(Boolean);
        return { ...section, products: sectionProducts };
      })
    );
    const breedStatsList = await storage.getBreedStatsByProduct(id);
    const sortedBreedStats = breedStatsList.sort((a, b) => a.sortOrder - b.sortOrder);
    res.json({ product, category, crossSellSections: sectionsWithProducts.filter(s => s.products.length > 0), breedStats: sortedBreedStats });
  });

  app.get("/api/cross-sell-sections", async (_req, res) => {
    const sections = await storage.getAllCrossSellSections();
    const sectionsWithItems = await Promise.all(
      sections.sort((a, b) => a.sortOrder - b.sortOrder).map(async (section) => {
        const items = await storage.getCrossSellItemsBySection(section.id);
        return { ...section, items };
      })
    );
    res.json(sectionsWithItems);
  });

  app.post("/api/admin/cross-sell-sections", requireAdmin, async (req, res) => {
    const parsed = insertCrossSellSectionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    const section = await storage.createCrossSellSection(parsed.data);
    res.status(201).json(section);
  });

  app.patch("/api/admin/cross-sell-sections/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Geçersiz ID" });
    const allowedKeys = ["title", "forProductId", "forAnimal", "sortOrder", "isActive"];
    const safeBody: Record<string, any> = {};
    for (const key of allowedKeys) {
      if (req.body[key] !== undefined) safeBody[key] = req.body[key];
    }
    const section = await storage.updateCrossSellSection(id, safeBody);
    if (!section) return res.status(404).json({ message: "Section not found" });
    res.json(section);
  });

  app.delete("/api/admin/cross-sell-sections/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteCrossSellSection(id);
    res.json({ message: "Deleted" });
  });

  app.post("/api/admin/cross-sell-items", requireAdmin, async (req, res) => {
    const parsed = insertCrossSellItemSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    const item = await storage.addCrossSellItem(parsed.data);
    res.status(201).json(item);
  });

  app.delete("/api/admin/cross-sell-items/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.removeCrossSellItem(id);
    res.json({ message: "Deleted" });
  });

  app.post("/api/admin/quick-cross-sell", requireAdmin, async (req, res) => {
    try {
      const { forProductId, addProductId } = req.body;
      if (!forProductId || !addProductId) return res.status(400).json({ message: "forProductId and addProductId required" });
      const allSections = await storage.getAllCrossSellSections();
      let section = allSections.find(s => s.forProductId === forProductId);
      if (!section) {
        section = await storage.createCrossSellSection({
          title: "Sıklıkla Birlikte Alınan",
          forProductId,
          forAnimal: null,
          sortOrder: 0,
          isActive: true,
        });
      }
      const existingItems = await storage.getCrossSellItemsBySection(section.id);
      if (existingItems.some(i => i.productId === addProductId)) {
        return res.status(400).json({ message: "Bu ürün zaten ekli" });
      }
      const item = await storage.addCrossSellItem({
        sectionId: section.id,
        productId: addProductId,
        sortOrder: existingItems.length + 1,
      });
      res.status(201).json(item);
    } catch (err) {
      res.status(500).json({ message: "Cross-sell ekleme hatası" });
    }
  });

  app.get("/api/admin/product-cross-sell/:productId", requireAdmin, async (req, res) => {
    try {
      const pid = parseInt(req.params.productId);
      const allSections = await storage.getAllCrossSellSections();
      const section = allSections.find(s => s.forProductId === pid);
      if (!section) return res.json([]);
      const items = await storage.getCrossSellItemsBySection(section.id);
      const itemsWithProducts = await Promise.all(
        items.sort((a, b) => a.sortOrder - b.sortOrder).map(async (item) => {
          const p = await storage.getProduct(item.productId);
          return p ? { ...item, product: p } : null;
        })
      );
      res.json(itemsWithProducts.filter(Boolean));
    } catch (err) {
      res.status(500).json({ message: "Cross-sell fetch error" });
    }
  });

  const createOrderSchema = z.object({
    items: z.array(orderItemSchema).min(1),
    subtotal: z.number(),
    shipping: z.number(),
    discount: z.number(),
    grandTotal: z.number(),
    paymentMethod: z.string(),
    customerNote: z.string().max(500).optional(),
    deliverySlot: z.enum(["hemen", "bugun_ogle", "bugun_aksam", "yarin_sabah"]).optional(),
    customerPhone: z.string().min(7, "Telefon numarası gerekli").max(20, "Telefon numarası çok uzun"),
    customerName: z.string().min(1, "Ad soyad gerekli").max(100, "Ad soyad çok uzun"),
    customerAddress: z.string().min(1, "Adres gerekli").max(500, "Adres çok uzun"),
    usedPoints: z.number().optional(),
    couponCode: z.string().max(50).optional(),
    donationAmount: z.number().min(0).max(1000).optional(),
    installmentMonths: z.number().optional(),
    installmentRate: z.number().optional(),
    installmentMonthly: z.number().optional(),
    installmentTotal: z.number().optional(),
  });

  app.post("/api/orders", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) {
      return res.status(401).json({ message: "Sipariş vermek için giriş yapmalısınız." });
    }
    const customerCheck = await sharedPool.query("SELECT is_blacklisted FROM customers WHERE id = $1", [customerId]);
    if (customerCheck.rows[0]?.is_blacklisted) {
      return res.status(403).json({ message: "Hesabınız askıya alınmıştır. Sipariş veremezsiniz. Lütfen müşteri hizmetleri ile iletişime geçin." });
    }
    const ip = req.ip || "unknown";
    if (rateLimit(`order:${ip}`, 20, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla sipariş denemesi. Lütfen bekleyin." });
    }
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.errors.map(e => e.message).join(", ");
      return res.status(400).json({ message: fieldErrors || "Geçersiz sipariş verisi", errors: parsed.error.errors });
    }
    const { usedPoints, couponCode, ...orderData } = parsed.data;

    const clientCampaignIds = Array.isArray((req.body as any).campaignProductIds)
      ? new Set((req.body as any).campaignProductIds.map((id: any) => parseInt(String(id))))
      : null;

    const allCampaignItems = await sharedPool.query("SELECT product_id, item_type FROM campaign_items WHERE is_active = true");
    const campaignMap = new Map<number, string>();
    for (const row of allCampaignItems.rows) {
      campaignMap.set(row.product_id, row.item_type);
    }

    let campaignMainCount = 0;
    let campaignExtraCount = 0;
    for (const item of orderData.items) {
      const pid = parseInt(String(item.productId));
      if (clientCampaignIds && !clientCampaignIds.has(pid)) continue;
      const type = campaignMap.get(pid);
      if (type === "main") campaignMainCount += item.quantity;
      if (type === "extra") campaignExtraCount += item.quantity;
    }
    const isCampaignOrder = clientCampaignIds !== null && (campaignMainCount > 0 || campaignExtraCount > 0);

    let couponDiscount = 0;
    let appliedCoupon: any = null;
    if (couponCode && !isCampaignOrder) {
      const coupon = await storage.getCouponByCode(couponCode);
      if (coupon && coupon.isActive) {
        const now = new Date();
        const notExpired = !coupon.expiresAt || new Date(coupon.expiresAt) > now;
        const notMaxed = !coupon.maxUses || coupon.usedCount < coupon.maxUses;
        const minMet = orderData.subtotal >= coupon.minOrderAmount;
        if (notExpired && notMaxed && minMet) {
          appliedCoupon = coupon;
          if (coupon.discountType === "percentage") {
            couponDiscount = Math.round(orderData.subtotal * (coupon.discountValue / 100) * 100) / 100;
          } else {
            couponDiscount = coupon.discountValue;
          }
        }
      }
    }

    const STANDARD_MIN_ORDER = 700;
    const STANDARD_FREE_SHIP_LIMIT = 1500;
    const STANDARD_SHIP_FEE = 89;
    if (!isCampaignOrder && orderData.subtotal < STANDARD_MIN_ORDER) {
      return res.status(400).json({ message: `Minimum sipariş tutarı ${STANDARD_MIN_ORDER} TL'dir.` });
    }
    if (!isCampaignOrder) {
      orderData.shipping = orderData.subtotal >= STANDARD_FREE_SHIP_LIMIT ? 0 : STANDARD_SHIP_FEE;
      orderData.grandTotal = orderData.subtotal - orderData.discount + orderData.shipping;
    }

    const KEDI_KUMU_MAX = 2;
    const kediKumuProductIds = new Set<number>();
    const allProds = await storage.getAllProducts();
    for (const p of allProds) {
      if (p.brandCategoryId === 24) kediKumuProductIds.add(p.id);
    }

    for (const item of orderData.items) {
      const pid = parseInt(String(item.productId));
      if (kediKumuProductIds.has(pid) && item.quantity > KEDI_KUMU_MAX) {
        return res.status(400).json({ message: `Kedi kumundan en fazla ${KEDI_KUMU_MAX} adet alabilirsiniz.` });
      }
    }

    if (isCampaignOrder) {
      if (campaignMainCount < 1 || campaignExtraCount < 1) {
        return res.status(400).json({ message: "Kampanya siparişlerinde en az 1 ana ürün ve 1 ek ürün gereklidir." });
      }
      if (campaignMainCount > 1) {
        return res.status(400).json({ message: "Kampanya ana ürünlerinden toplamda sadece 1 adet alabilirsiniz." });
      }
      if (orderData.paymentMethod !== "Kapıda Nakit") {
        return res.status(400).json({ message: "Kampanya siparişlerinde sadece kapıda nakit ödeme geçerlidir." });
      }
      orderData.discount = 0;
      const CAMPAIGN_SHIP_LIMIT = 4000;
      const SHIP_FEE = 89;
      orderData.shipping = orderData.subtotal >= CAMPAIGN_SHIP_LIMIT ? 0 : SHIP_FEE;
      orderData.grandTotal = orderData.subtotal + orderData.shipping;
    }

    if (!isCampaignOrder && couponDiscount > 0) {
      orderData.discount = (orderData.discount || 0) + couponDiscount;
      orderData.grandTotal = Math.max(0, orderData.subtotal - orderData.discount + orderData.shipping);
    }

    let pointsToUse = 0;

    if (!isCampaignOrder && customerId && usedPoints && usedPoints > 0) {
      const balance = await storage.getCustomerPointsBalance(customerId);
      pointsToUse = Math.min(usedPoints, balance);
      const serverTotal = Math.max(0, orderData.subtotal - orderData.discount + orderData.shipping - pointsToUse);
      orderData.grandTotal = Math.round(serverTotal * 100) / 100;
    }

    let hasPreorderItems = false;
    for (const item of orderData.items) {
      const productId = parseInt(String(item.productId));
      if (!isNaN(productId)) {
        const prod = allProds.find(p => p.id === productId);
        if (prod && prod.skt) {
          const sktDate = parseSkt(prod.skt);
          if (sktDate && sktDate < new Date()) {
            return res.status(400).json({ message: `${item.name} ürününün son kullanma tarihi geçmiş. Sipariş verilemez.` });
          }
        }
        if (prod && prod.preorderEnabled) {
          if (prod.stock > 0) {
            const deductQty = Math.min(prod.stock, item.quantity);
            await storage.decrementStock(productId, deductQty);
          }
          if (prod.stock < item.quantity) {
            hasPreorderItems = true;
            item.isPreorder = true;
          }
        } else {
          const ok = await storage.decrementStock(productId, item.quantity);
          if (!ok) {
            return res.status(400).json({ message: `Stok yetersiz: ${item.name}` });
          }
        }
      }
    }
    if (hasPreorderItems) {
      orderData.hasPreorder = true;
    }

    const isOnlinePayment = orderData.paymentMethod === "Online Kredi Kartı";
    if (isOnlinePayment) {
      (orderData as any).paymentStatus = "pending";
    }

    const order = await storage.createOrder(orderData);

    if (appliedCoupon && !isOnlinePayment) {
      await storage.incrementCouponUsage(appliedCoupon.id);
    }

    if (customerId && !isOnlinePayment) {
      if (!isCampaignOrder && pointsToUse > 0) {
        await storage.addLoyaltyPoints({
          customerId,
          orderId: order.id,
          amount: -pointsToUse,
          type: "spent",
          description: `Sipariş #${order.id} - Para Puan kullanımı`,
        });
      }
      if (!isCampaignOrder) {
        let loyaltyPct = 5;
        try {
          const lpResult = await sharedPool.query("SELECT value FROM app_settings WHERE key = 'loyalty_percent'");
          if (lpResult.rows.length > 0) loyaltyPct = Number(lpResult.rows[0].value) || 5;
        } catch {}
        const earnedPoints = Math.round(parsed.data.subtotal * (loyaltyPct / 100) * 100) / 100;
        if (earnedPoints > 0) {
          await storage.addLoyaltyPoints({
            customerId,
            orderId: order.id,
            amount: earnedPoints,
            type: "earned",
            description: `Sipariş #${order.id} - %${loyaltyPct} Para Puan kazanımı`,
          });
        }
      }
    }
    if (!isOnlinePayment) {
      try {
        const adminPhoneResult = await sharedPool.query("SELECT value FROM app_settings WHERE key = 'admin_phone'");
        const smsEnabledResult = await sharedPool.query("SELECT value FROM app_settings WHERE key = 'order_notification_sms'");
        const adminPhone = adminPhoneResult.rows[0]?.value;
        const smsEnabled = smsEnabledResult.rows[0]?.value !== "0";
        if (adminPhone && smsEnabled) {
          const customerName = orderData.customerName || "Bilinmeyen";
          const smsMsg = `YENI SIPARIS #${order.id}\n${customerName}\nTutar: ${orderData.grandTotal} TL\nOdeme: ${orderData.paymentMethod}\n${orderData.items.length} urun`;
          sendSmsViaNetgsm(adminPhone, smsMsg).catch(err => {
            console.error("Admin order notification SMS error:", err);
          });
        }
      } catch (e) {
        console.error("Admin notification error:", e);
      }
    }

    if (isOnlinePayment) {
      try {
        const merchantOid = generateMerchantOid(order.id);
        await sharedPool.query("UPDATE orders SET paytr_merchant_oid = $1 WHERE id = $2", [merchantOid, order.id]);

        const customerEmailResult = await sharedPool.query("SELECT email FROM customers WHERE id = $1", [customerId]);
        const userEmail = customerEmailResult.rows[0]?.email || `musteri${customerId}@jetgo.pet`;
        const userIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "1.1.1.1";

        const userBasket: Array<[string, string, number]> = orderData.items.map((it: any) => [
          String(it.name).substring(0, 100),
          (Number(it.price) || 0).toFixed(2),
          Number(it.quantity) || 1,
        ]);

        const protocol = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
        const host = req.headers["x-forwarded-host"] || req.headers.host;
        const baseUrl = `${protocol}://${host}`;

        const tokenResult = await createPaytrToken({
          merchantOid,
          email: userEmail,
          paymentAmount: orderData.grandTotal,
          userName: orderData.customerName || "Müşteri",
          userAddress: orderData.customerAddress || "Adres",
          userPhone: orderData.customerPhone || "0000000000",
          userBasket,
          userIp,
          okUrl: `${baseUrl}/odeme-sonuc?orderId=${order.id}`,
          failUrl: `${baseUrl}/odeme-sonuc?orderId=${order.id}&fail=1`,
          testMode: 0,
          noInstallment: 0,
          maxInstallment: 0,
          currency: "TL",
        });

        if (tokenResult.status === "success" && tokenResult.token) {
          return res.status(201).json({ ...order, paytrToken: tokenResult.token, paytrMerchantOid: merchantOid });
        } else {
          await sharedPool.query("UPDATE orders SET payment_status = 'failed', status = 'iptal' WHERE id = $1", [order.id]);
          for (const item of orderData.items) {
            const productId = parseInt(String(item.productId));
            if (!isNaN(productId)) {
              await sharedPool.query("UPDATE products SET stock = stock + $1 WHERE id = $2", [item.quantity, productId]);
            }
          }
          return res.status(502).json({ message: `Ödeme başlatılamadı: ${tokenResult.reason || "Bilinmeyen hata"}` });
        }
      } catch (err: any) {
        console.error("PayTR init error:", err);
        await sharedPool.query("UPDATE orders SET payment_status = 'failed', status = 'iptal' WHERE id = $1", [order.id]);
        for (const item of orderData.items) {
          const productId = parseInt(String(item.productId));
          if (!isNaN(productId)) {
            await sharedPool.query("UPDATE products SET stock = stock + $1 WHERE id = $2", [item.quantity, productId]);
          }
        }
        return res.status(500).json({ message: err?.message || "Online ödeme başlatılamadı" });
      }
    }

    res.status(201).json(order);
  });

  // PayTR callback (notification) — PayTR sunucusu ödeme tamamlandığında bu endpoint'e POST yapar
  app.post("/api/paytr/callback", async (req, res) => {
    try {
      const body = req.body || {};
      if (!verifyPaytrCallbackHash(body)) {
        console.error("PayTR callback hash mismatch:", body);
        return res.status(400).send("PAYTR notification failed: bad hash");
      }
      const { merchant_oid, status, total_amount, failed_reason_msg } = body;
      const orderResult = await sharedPool.query(
        "SELECT id, payment_status, customer_phone, items, grand_total, customer_name, payment_method, subtotal FROM orders WHERE paytr_merchant_oid = $1",
        [merchant_oid]
      );
      if (orderResult.rows.length === 0) {
        console.error("PayTR callback: order not found for merchant_oid", merchant_oid);
        return res.send("OK");
      }
      const order = orderResult.rows[0];
      if (order.payment_status === "paid") {
        return res.send("OK"); // idempotent
      }

      if (status === "success") {
        await sharedPool.query("UPDATE orders SET payment_status = 'paid' WHERE id = $1", [order.id]);

        // Müşteri customerId'sini bul
        const custRow = await sharedPool.query("SELECT id FROM customers WHERE phone = $1 LIMIT 1", [order.customer_phone]);
        const customerId = custRow.rows[0]?.id;

        if (customerId) {
          let loyaltyPct = 5;
          try {
            const lpResult = await sharedPool.query("SELECT value FROM app_settings WHERE key = 'loyalty_percent'");
            if (lpResult.rows.length > 0) loyaltyPct = Number(lpResult.rows[0].value) || 5;
          } catch {}
          const earnedPoints = Math.round(Number(order.subtotal) * (loyaltyPct / 100) * 100) / 100;
          if (earnedPoints > 0) {
            await storage.addLoyaltyPoints({
              customerId,
              orderId: order.id,
              amount: earnedPoints,
              type: "earned",
              description: `Sipariş #${order.id} - %${loyaltyPct} Para Puan kazanımı`,
            }).catch(e => console.error("Loyalty award error:", e));
          }
        }

        // Admin SMS bildirimi
        try {
          const adminPhoneResult = await sharedPool.query("SELECT value FROM app_settings WHERE key = 'admin_phone'");
          const smsEnabledResult = await sharedPool.query("SELECT value FROM app_settings WHERE key = 'order_notification_sms'");
          const adminPhone = adminPhoneResult.rows[0]?.value;
          const smsEnabled = smsEnabledResult.rows[0]?.value !== "0";
          if (adminPhone && smsEnabled) {
            const items = Array.isArray(order.items) ? order.items : [];
            const smsMsg = `YENI SIPARIS #${order.id}\n${order.customer_name || "Musteri"}\nTutar: ${order.grand_total} TL\nOdeme: ${order.payment_method} (Online)\n${items.length} urun`;
            sendSmsViaNetgsm(adminPhone, smsMsg).catch(err => console.error("Admin SMS error:", err));
          }
        } catch (e) {
          console.error("Admin notification error:", e);
        }
      } else {
        await sharedPool.query("UPDATE orders SET payment_status = 'failed', status = 'iptal' WHERE id = $1", [order.id]);
        // Stok iadesi
        const items = Array.isArray(order.items) ? order.items : [];
        for (const item of items) {
          const productId = parseInt(String(item.productId));
          if (!isNaN(productId)) {
            await sharedPool.query("UPDATE products SET stock = stock + $1 WHERE id = $2", [item.quantity, productId]);
          }
        }
        console.log(`PayTR ödeme başarısız order #${order.id}: ${failed_reason_msg || ""}`);
      }
      res.send("OK");
    } catch (err) {
      console.error("PayTR callback error:", err);
      res.status(500).send("PAYTR notification failed");
    }
  });

  // Frontend ödeme durumunu sorgular
  app.get("/api/orders/:id/payment-status", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız." });
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) return res.status(400).json({ message: "Geçersiz sipariş" });
    const result = await sharedPool.query(
      "SELECT id, payment_status, status, customer_phone FROM orders WHERE id = $1",
      [orderId]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Sipariş bulunamadı" });
    const order = result.rows[0];
    const cust = await sharedPool.query("SELECT phone FROM customers WHERE id = $1", [customerId]);
    if (cust.rows[0]?.phone !== order.customer_phone) {
      return res.status(403).json({ message: "Bu siparişe erişim yok" });
    }
    res.json({ orderId: order.id, paymentStatus: order.payment_status, status: order.status });
  });

  app.get("/api/admin/new-order-check", requireAdmin, async (_req, res) => {
    try {
      const result = await sharedPool.query("SELECT id, customer_name, grand_total, payment_method, created_at FROM orders ORDER BY id DESC LIMIT 1");
      const latestOrder = result.rows[0];
      if (!latestOrder) return res.json({ hasNew: false, lastId: 0 });
      const totalPending = await sharedPool.query("SELECT COUNT(*) as cnt FROM orders WHERE status = 'yeni'");
      res.json({
        hasNew: true,
        lastId: latestOrder.id,
        pendingCount: parseInt(totalPending.rows[0].cnt),
        latest: {
          id: latestOrder.id,
          customerName: latestOrder.customer_name,
          grandTotal: parseFloat(latestOrder.grand_total),
          paymentMethod: latestOrder.payment_method,
          createdAt: latestOrder.created_at,
        }
      });
    } catch {
      res.json({ hasNew: false, lastId: 0 });
    }
  });

  app.get("/api/public-settings", async (_req, res) => {
    try {
      const result = await sharedPool.query("SELECT key, value FROM app_settings WHERE key IN ('payment_eft_enabled')");
      const settings: Record<string, string> = {};
      for (const row of result.rows) settings[row.key] = row.value;
      res.json(settings);
    } catch {
      res.json({});
    }
  });

  app.get("/api/admin/settings", requireAdmin, async (_req, res) => {
    try {
      const result = await sharedPool.query("SELECT key, value FROM app_settings");
      const settings: Record<string, string> = {};
      for (const row of result.rows) settings[row.key] = row.value;
      res.json(settings);
    } catch {
      res.json({});
    }
  });

  app.patch("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const updates = req.body;
      const numericKeys = ["pet_base_points", "pet_streak_divisor", "pet_max_points", "pet_base_exp", "pet_streak_exp_bonus", "loyalty_percent"];
      const textKeys = ["admin_phone", "order_notification_sms", "payment_eft_enabled"];
      for (const [key, value] of Object.entries(updates)) {
        if (numericKeys.includes(key)) {
          const numVal = Number(value);
          if (isNaN(numVal) || numVal < 0 || numVal > 100) continue;
          await sharedPool.query(
            "INSERT INTO app_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()",
            [key, String(numVal)]
          );
        } else if (textKeys.includes(key)) {
          const strVal = String(value).trim();
          await sharedPool.query(
            "INSERT INTO app_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()",
            [key, strVal]
          );
        }
      }
      const result = await sharedPool.query("SELECT key, value FROM app_settings");
      const settings: Record<string, string> = {};
      for (const row of result.rows) settings[row.key] = row.value;
      res.json(settings);
    } catch {
      res.status(500).json({ message: "Ayarlar güncellenemedi" });
    }
  });

  app.get("/api/admin/orders", requireAdmin, async (_req, res) => {
    const allOrders = await storage.getAllOrders();
    res.json(allOrders);
  });

  app.patch("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "Status required" });
    const order = await storage.updateOrderStatus(id, status);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (status === "tamamlandi" && order.customerPhone) {
      const smsMessage = `Siparissiniz teslim edildi. Jetgo ile alisveris yaptiginiz icin tesekkurler! Bir sonraki siparissinizde 50 TL indirim icin JETGO50 kodunu kullanin. jetgo.pet`;
      sendSmsViaNetgsm(order.customerPhone, smsMessage).catch(err => {
        console.error("Post-delivery SMS error:", err);
      });
    }

    res.json(order);
  });

  app.post("/api/otp/send", async (req, res) => {
    const ip = req.ip || "unknown";
    if (rateLimit(`otp:${ip}`, 10, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
    }
    const { phone, deviceToken } = req.body;
    if (!phone) return res.status(400).json({ message: "Telefon numarası gerekli" });
    const normalized = phone.replace(/\D/g, "");
    if (normalized.length < 10) return res.status(400).json({ message: "Geçerli bir telefon numarası girin" });

    if (deviceToken && typeof deviceToken === "string" && deviceToken.length > 20) {
      try {
        const result = await sharedPool.query(
          "SELECT td.customer_id, td.id FROM trusted_devices td WHERE td.phone = $1 AND td.device_token = $2 AND td.expires_at > NOW()",
          [normalized, deviceToken]
        );
        if (result.rows.length > 0) {
          const customerId = result.rows[0].customer_id;
          const customer = await storage.getCustomer(customerId);
          if (customer && customer.phone === normalized) {
            (req.session as any).customerId = customer.id;
            await sharedPool.query(
              "UPDATE trusted_devices SET created_at = NOW(), expires_at = NOW() + INTERVAL '30 days' WHERE id = $1",
              [result.rows[0].id]
            );
            return res.json({
              message: "Güvenilir cihaz ile giriş yapıldı",
              trustedLogin: true,
              customer: { id: customer.id, phone: customer.phone, name: customer.name, address: customer.address }
            });
          }
        }
      } catch (e) {}
    }

    const sendTrack = otpSendCount.get(normalized);
    if (sendTrack && sendTrack.resetAt > Date.now() && sendTrack.count >= 5) {
      return res.status(429).json({ message: "Günlük SMS limiti aşıldı, lütfen yarın tekrar deneyin" });
    }

    const existing = otpStore.get(normalized);
    if (existing && existing.expiresAt > Date.now() && (existing.expiresAt - Date.now()) > 150000) {
      return res.status(429).json({ message: "Lütfen biraz bekleyin, kısa süre önce kod gönderildi" });
    }

    const code = generateOTP();
    otpStore.set(normalized, { code, expiresAt: Date.now() + 180000, attempts: 0 });

    const message = `JETGO dogrulama kodunuz: ${code} (3 dakika gecerlidir)\n\n@jetgo.pet #${code}`;
    const sent = await sendSmsViaNetgsm(normalized, message);
    if (!sent) {
      otpStore.delete(normalized);
      return res.status(500).json({ message: "SMS gönderilemedi, lütfen tekrar deneyin" });
    }

    const currentTrack = otpSendCount.get(normalized);
    const dayMs = 24 * 60 * 60 * 1000;
    if (currentTrack && currentTrack.resetAt > Date.now()) {
      currentTrack.count++;
    } else {
      otpSendCount.set(normalized, { count: 1, resetAt: Date.now() + dayMs });
    }

    const customerExists = !!(await storage.getCustomerByPhone(normalized));
    res.json({ message: "Doğrulama kodu gönderildi", isExisting: customerExists });
  });

  app.post("/api/otp/verify", async (req, res) => {
    const { phone, code, name, address } = req.body;
    if (!phone || !code) return res.status(400).json({ message: "Telefon ve doğrulama kodu gerekli" });
    const normalized = phone.replace(/\D/g, "");

    const entry = otpStore.get(normalized);
    if (!entry) return res.status(400).json({ message: "Doğrulama kodu bulunamadı, yeni kod isteyin" });
    if (entry.expiresAt < Date.now()) {
      otpStore.delete(normalized);
      return res.status(400).json({ message: "Doğrulama kodunun süresi doldu, yeni kod isteyin" });
    }
    if (entry.attempts >= 5) {
      otpStore.delete(normalized);
      return res.status(429).json({ message: "Çok fazla hatalı deneme, yeni kod isteyin" });
    }
    if (entry.code !== code) {
      entry.attempts++;
      return res.status(400).json({ message: "Doğrulama kodu hatalı" });
    }

    otpStore.delete(normalized);

    let customer = await storage.getCustomerByPhone(normalized);
    let isNewUser = false;
    let welcomeCouponCode: string | undefined;
    if (!customer) {
      isNewUser = true;
      const dummyPass = await bcrypt.hash(Math.random().toString(36), 10);
      customer = await storage.createCustomer({
        phone: normalized,
        password: dummyPass,
        name: (name || "").trim() || "Müşteri",
        address: (address || "").trim() || null,
      });
      try {
        const couponCode = "HG" + customer.id + crypto.randomBytes(3).toString("hex").toUpperCase();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await storage.createCoupon({
          code: couponCode,
          discountType: "fixed",
          discountValue: 100,
          minOrderAmount: 500,
          maxUses: 1,
          isActive: true,
          expiresAt,
          customerId: customer.id,
        });
        welcomeCouponCode = couponCode;
      } catch (e) {
        console.error("Welcome coupon creation failed:", e);
      }
    }

    (req.session as any).customerId = customer.id;

    let newDeviceToken: string | undefined;
    try {
      const token = crypto.randomBytes(48).toString("hex");
      const ua = req.headers["user-agent"] || "";
      await sharedPool.query(
        "INSERT INTO trusted_devices (customer_id, phone, device_token, user_agent, expires_at) VALUES ($1, $2, $3, $4, NOW() + INTERVAL '30 days')",
        [customer.id, normalized, token, ua]
      );
      newDeviceToken = token;
      await sharedPool.query("DELETE FROM trusted_devices WHERE expires_at < NOW()");
    } catch (e) {}

    res.json({ id: customer.id, phone: customer.phone, name: customer.name, address: customer.address, deviceToken: newDeviceToken, isNewUser, welcomeCouponCode });
  });

  app.post("/api/customer/register", async (req, res) => {
    const ip = req.ip || "unknown";
    if (rateLimit(`register:${ip}`, 5, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla kayıt denemesi. Lütfen daha sonra tekrar deneyin." });
    }
    const { phone, password, name, address } = req.body;
    if (!phone || !password || !name) {
      return res.status(400).json({ message: "Telefon, şifre ve ad soyad gerekli" });
    }
    if (typeof phone !== "string" || typeof password !== "string" || typeof name !== "string") {
      return res.status(400).json({ message: "Geçersiz veri tipi" });
    }
    const normalized = phone.replace(/\D/g, "");
    if (normalized.length < 10 || normalized.length > 15) {
      return res.status(400).json({ message: "Geçerli bir telefon numarası girin" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Şifre en az 6 karakter olmalı" });
    }
    if (password.length > 128) {
      return res.status(400).json({ message: "Şifre çok uzun" });
    }
    if (name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ message: "Ad soyad 2-100 karakter arasında olmalı" });
    }
    if (address && (typeof address !== "string" || address.length > 500)) {
      return res.status(400).json({ message: "Adres çok uzun (max 500 karakter)" });
    }
    const existing = await storage.getCustomerByPhone(normalized);
    if (existing) {
      return res.status(409).json({ message: "Bu telefon numarası zaten kayıtlı" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const customer = await storage.createCustomer({ phone: normalized, password: hashed, name: name.trim(), address: address?.trim() || null });
    (req.session as any).customerId = customer.id;
    res.status(201).json({ id: customer.id, phone: customer.phone, name: customer.name, address: customer.address });
  });

  app.post("/api/customer/login", async (req, res) => {
    const ip = req.ip || "unknown";
    if (rateLimit(`custlogin:${ip}`, 10, 15 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla giriş denemesi. 15 dakika bekleyin." });
    }
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: "Telefon ve şifre gerekli" });
    }
    const normalized = phone.replace(/\D/g, "");
    if (rateLimit(`custlogin:phone:${normalized}`, 5, 15 * 60 * 1000)) {
      return res.status(429).json({ message: "Bu numara için çok fazla deneme. 15 dakika bekleyin." });
    }
    const customer = await storage.getCustomerByPhone(normalized);
    if (!customer) return res.status(401).json({ message: "Telefon numarası veya şifre hatalı" });
    const valid = await bcrypt.compare(password, customer.password);
    if (!valid) return res.status(401).json({ message: "Telefon numarası veya şifre hatalı" });
    (req.session as any).customerId = customer.id;
    res.json({ id: customer.id, phone: customer.phone, name: customer.name, address: customer.address });
  });

  app.post("/api/customer/logout", (req, res) => {
    delete (req.session as any).customerId;
    req.session.save(() => {
      res.json({ message: "Çıkış yapıldı" });
    });
  });

  function requireCustomer(req: Request, res: Response, next: NextFunction) {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapılmamış" });
    (req as any).customerId = customerId;
    next();
  }

  app.get("/api/customer/me", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapılmamış" });
    const customer = await storage.getCustomer(customerId);
    if (!customer) return res.status(401).json({ message: "Giriş yapılmamış" });
    let welcomeCoupon: { code: string; discountValue: number; minOrderAmount: number; expiresAt: string | null } | undefined;
    try {
      const result = await sharedPool.query(
        "SELECT code, discount_value, min_order_amount, expires_at FROM coupons WHERE customer_id = $1 AND is_active = true AND used_count < COALESCE(max_uses, 999999) AND (expires_at IS NULL OR expires_at > NOW()) LIMIT 1",
        [customerId]
      );
      if (result.rows.length > 0) {
        const c = result.rows[0];
        welcomeCoupon = { code: c.code, discountValue: c.discount_value, minOrderAmount: c.min_order_amount, expiresAt: c.expires_at };
      }
    } catch {}
    res.json({ id: customer.id, phone: customer.phone, name: customer.name, address: customer.address, email: customer.email, tcNo: customer.tcNo, notifyStock: customer.notifyStock, notifyCampaign: customer.notifyCampaign, welcomeCoupon });
  });

  app.patch("/api/customer/profile", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const ip = req.ip || "unknown";
    if (rateLimit(`profile:${ip}`, 15, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
    }
    const { name, address, email, tcNo } = req.body;
    const updateData: Record<string, any> = {};
    if (name) {
      if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
        return res.status(400).json({ message: "Ad soyad 2-100 karakter arasında olmalı" });
      }
      updateData.name = name.trim();
    }
    if (address !== undefined) {
      if (address && (typeof address !== "string" || address.length > 500)) {
        return res.status(400).json({ message: "Adres çok uzun (max 500 karakter)" });
      }
      updateData.address = typeof address === "string" ? address.trim() : null;
    }
    if (email !== undefined) {
      if (email && (typeof email !== "string" || email.length > 200 || (email.trim() && !email.includes("@")))) {
        return res.status(400).json({ message: "Geçerli bir e-posta adresi girin" });
      }
      updateData.email = email ? email.trim() : null;
    }
    if (tcNo !== undefined) {
      if (tcNo && (typeof tcNo !== "string" || !/^\d{11}$/.test(tcNo.trim()))) {
        return res.status(400).json({ message: "TC Kimlik No 11 haneli olmalıdır" });
      }
      updateData.tcNo = tcNo ? tcNo.trim() : null;
    }
    const customer = await storage.updateCustomer(customerId, updateData);
    if (!customer) return res.status(404).json({ message: "Müşteri bulunamadı" });
    res.json({ id: customer.id, phone: customer.phone, name: customer.name, address: customer.address, email: customer.email, tcNo: customer.tcNo, notifyStock: customer.notifyStock, notifyCampaign: customer.notifyCampaign });
  });

  app.patch("/api/customer/password", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const ip = req.ip || "unknown";
    if (rateLimit(`passwd:${ip}`, 5, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla şifre değiştirme denemesi. Lütfen daha sonra tekrar deneyin." });
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "Mevcut ve yeni şifre gerekli" });
    if (typeof newPassword !== "string" || newPassword.length < 6) return res.status(400).json({ message: "Yeni şifre en az 6 karakter olmalı" });
    if (newPassword.length > 128) return res.status(400).json({ message: "Şifre çok uzun" });
    const customer = await storage.getCustomer(customerId);
    if (!customer) return res.status(404).json({ message: "Müşteri bulunamadı" });
    const valid = await bcrypt.compare(currentPassword, customer.password);
    if (!valid) return res.status(400).json({ message: "Mevcut şifre hatalı" });
    const hashed = await bcrypt.hash(newPassword, 10);
    await storage.updateCustomer(customerId, { password: hashed });
    res.json({ message: "Şifre başarıyla değiştirildi" });
  });

  app.delete("/api/customer/account", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const ip = req.ip || "unknown";
    if (rateLimit(`accdel:${ip}`, 3, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
    }
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Şifre gerekli" });
    const customer = await storage.getCustomer(customerId);
    if (!customer) return res.status(404).json({ message: "Müşteri bulunamadı" });
    const valid = await bcrypt.compare(password, customer.password);
    if (!valid) return res.status(400).json({ message: "Şifre hatalı" });
    await db.update(orders)
      .set({ customerName: "Silinmiş Kullanıcı", customerAddress: null, customerPhone: "000" })
      .where(eq(orders.customerPhone, customer.phone));
    await storage.deleteCustomerAccount(customerId);
    req.session.destroy(() => {});
    res.json({ message: "Hesabınız başarıyla silindi" });
  });

  app.patch("/api/customer/preferences", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const { notifyStock, notifyCampaign } = req.body;
    const updateData: Record<string, boolean> = {};
    if (typeof notifyStock === "boolean") updateData.notifyStock = notifyStock;
    if (typeof notifyCampaign === "boolean") updateData.notifyCampaign = notifyCampaign;
    const customer = await storage.updateCustomer(customerId, updateData as any);
    if (!customer) return res.status(404).json({ message: "Müşteri bulunamadı" });
    res.json({ notifyStock: customer.notifyStock, notifyCampaign: customer.notifyCampaign });
  });

  app.get("/api/customer/loyalty-points", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const balance = await storage.getCustomerPointsBalance(customerId);
    const history = await storage.getLoyaltyPointsByCustomer(customerId);
    res.json({ balance: Math.round(balance * 100) / 100, history });
  });

  app.get("/api/admin/loyalty-points", requireAdmin, async (_req, res) => {
    const customersWithPoints = await storage.getAllCustomersWithPoints();
    res.json(customersWithPoints);
  });

  app.get("/api/admin/loyalty-points/:customerId", requireAdmin, async (req, res) => {
    const customerId = parseInt(req.params.customerId);
    const balance = await storage.getCustomerPointsBalance(customerId);
    const history = await storage.getLoyaltyPointsByCustomer(customerId);
    res.json({ balance: Math.round(balance * 100) / 100, history });
  });

  app.post("/api/admin/loyalty-points", requireAdmin, async (req, res) => {
    const { customerId, amount, description } = req.body;
    if (!customerId || amount === undefined) return res.status(400).json({ message: "customerId ve amount gerekli" });
    const point = await storage.addLoyaltyPoints({
      customerId,
      amount: parseFloat(amount),
      type: parseFloat(amount) >= 0 ? "manual_add" : "manual_deduct",
      description: description || "Admin tarafından eklendi",
    });
    res.status(201).json(point);
  });

  const createReminderSchema = z.object({
    customerPhone: z.string().min(7),
    customerName: z.string().optional(),
    productId: z.number().int().positive(),
    productName: z.string().min(1),
    animalType: z.enum(["kedi", "kopek"]),
    dailyGrams: z.number().positive(),
    packageGrams: z.number().positive(),
    estimatedDays: z.number().int().min(1),
  });

  app.post("/api/reorder-reminders", async (req, res) => {
    const ip = req.ip || "unknown";
    if (rateLimit(`reminder:${ip}`, 10, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
    }
    const parsed = createReminderSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Eksik veya hatalı bilgi", errors: parsed.error.errors });
    const { estimatedDays, ...rest } = parsed.data;
    const reorderDate = new Date();
    reorderDate.setDate(reorderDate.getDate() + estimatedDays);
    const reminder = await storage.createReorderReminder({
      ...rest, estimatedDays, reorderDate, status: "pending",
    });
    res.status(201).json(reminder);
  });

  app.get("/api/admin/reorder-reminders", requireAdmin, async (_req, res) => {
    const reminders = await storage.getReorderReminders();
    res.json(reminders);
  });

  app.patch("/api/admin/reorder-reminders/:id/status", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "Status gerekli" });
    const updated = await storage.updateReorderReminderStatus(id, status);
    if (!updated) return res.status(404).json({ message: "Hatırlatma bulunamadı" });
    res.json(updated);
  });

  app.get("/api/customer/orders", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const customer = await storage.getCustomer(customerId);
    if (!customer) return res.status(404).json({ message: "Müşteri bulunamadı" });
    const customerOrders = await storage.getOrdersByPhone(customer.phone);
    const productIds = new Set<number>();
    for (const o of customerOrders) {
      if (Array.isArray(o.items)) {
        for (const item of o.items as any[]) {
          if (item.productId) productIds.add(item.productId);
        }
      }
    }
    const productMap = new Map<number, { img: string | null; stock: number }>();
    const bulkProducts = await storage.getProductsByIds([...productIds]);
    for (const p of bulkProducts) {
      productMap.set(p.id, { img: p.img, stock: p.stock });
    }
    res.json(customerOrders.map(o => ({
      id: o.id,
      items: Array.isArray(o.items) ? (o.items as any[]).map((item: any) => {
        const pData = productMap.get(item.productId);
        return { ...item, img: pData?.img || null, currentStock: pData?.stock ?? 0 };
      }) : o.items,
      subtotal: o.subtotal, shipping: o.shipping, discount: o.discount,
      grandTotal: o.grandTotal, status: o.status, paymentMethod: o.paymentMethod, createdAt: o.createdAt,
      customerNote: o.customerNote, deliverySlot: o.deliverySlot,
    })));
  });

  app.get("/api/customer/favorites", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const favoriteIds = await storage.getCustomerFavoriteIds(customerId);
    res.json(favoriteIds);
  });

  app.get("/api/customer/favorites/details", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const favoriteIds = await storage.getCustomerFavoriteIds(customerId);
    if (favoriteIds.length === 0) return res.json([]);
    const bulkProducts = await storage.getProductsByIds(favoriteIds);
    res.json(
      bulkProducts
        .filter(p => p.isActive)
        .map(p => ({ id: p.id, name: p.name, price: p.price, img: p.img, stock: p.stock }))
    );
  });

  app.post("/api/customer/favorites", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const ip = req.ip || "unknown";
    if (rateLimit(`fav:${ip}`, 30, 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek." });
    }
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: "productId gerekli" });
    await storage.addCustomerFavorite({ customerId, productId: Number(productId) });
    const favoriteIds = await storage.getCustomerFavoriteIds(customerId);
    res.json(favoriteIds);
  });

  app.delete("/api/customer/favorites/:productId", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const productId = parseInt(req.params.productId);
    await storage.removeCustomerFavorite(customerId, productId);
    const favoriteIds = await storage.getCustomerFavoriteIds(customerId);
    res.json(favoriteIds);
  });

  app.post("/api/customer/favorites/sync", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const ip = req.ip || "unknown";
    if (rateLimit(`favsync:${ip}`, 20, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek." });
    }
    const { productIds } = req.body;
    if (Array.isArray(productIds)) {
      const safeIds = productIds.filter(pid => typeof pid === "number" || (typeof pid === "string" && /^\d+$/.test(pid))).slice(0, 100);
      for (const pid of safeIds) {
        await storage.addCustomerFavorite({ customerId, productId: Number(pid) });
      }
    }
    const favoriteIds = await storage.getCustomerFavoriteIds(customerId);
    res.json(favoriteIds);
  });

  app.get("/api/customer/addresses", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const addresses = await storage.getCustomerAddresses(customerId);
    res.json(addresses);
  });

  app.post("/api/customer/addresses", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const ip = req.ip || "unknown";
    if (rateLimit(`addr:${ip}`, 10, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
    }
    const existingAddrs = await storage.getCustomerAddresses(customerId);
    if (existingAddrs.length >= 10) {
      return res.status(400).json({ message: "En fazla 10 adres ekleyebilirsiniz." });
    }
    const schema = z.object({ label: z.string().min(1).max(50), address: z.string().min(1).max(500), isDefault: z.boolean().optional(), neighborhoodId: z.number().optional(), district: z.string().max(100).optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Geçersiz veri" });
    if (parsed.data.isDefault) {
      await storage.setDefaultAddress(-1, customerId);
    }
    const addr = await storage.createCustomerAddress({
      customerId,
      label: parsed.data.label,
      address: parsed.data.address,
      isDefault: parsed.data.isDefault || false,
      neighborhoodId: parsed.data.neighborhoodId || null,
      district: parsed.data.district || null,
    });
    if (parsed.data.isDefault) {
      await storage.setDefaultAddress(addr.id, customerId);
    }
    const addresses = await storage.getCustomerAddresses(customerId);
    res.json(addresses);
  });

  app.patch("/api/customer/addresses/:id", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const id = parseInt(req.params.id);
    const schema = z.object({ label: z.string().min(1).optional(), address: z.string().min(1).optional(), isDefault: z.boolean().optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Geçersiz veri" });
    if (parsed.data.isDefault) {
      await storage.setDefaultAddress(id, customerId);
    }
    await storage.updateCustomerAddress(id, customerId, parsed.data);
    const addresses = await storage.getCustomerAddresses(customerId);
    res.json(addresses);
  });

  app.delete("/api/customer/addresses/:id", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const id = parseInt(req.params.id);
    await storage.deleteCustomerAddress(id, customerId);
    const addresses = await storage.getCustomerAddresses(customerId);
    res.json(addresses);
  });

  app.get("/api/customer/pets", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const pets = await storage.getPetProfiles(customerId);
    res.json(pets);
  });

  app.post("/api/customer/pets", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const ip = req.ip || "unknown";
    if (rateLimit(`pets:${ip}`, 10, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
    }
    const schema = z.object({ name: z.string().min(1).max(50), type: z.string().min(1).max(30), breed: z.string().max(50).optional(), age: z.number().min(0).max(50).optional(), weight: z.number().min(0).max(200).optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Geçersiz veri" });
    await storage.createPetProfile({ customerId, ...parsed.data });
    const pets = await storage.getPetProfiles(customerId);
    res.json(pets);
  });

  app.patch("/api/customer/pets/:id", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const id = parseInt(req.params.id);
    const schema = z.object({ name: z.string().min(1).optional(), type: z.string().min(1).optional(), breed: z.string().optional(), age: z.number().optional(), weight: z.number().optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Geçersiz veri" });
    await storage.updatePetProfile(id, customerId, parsed.data);
    const pets = await storage.getPetProfiles(customerId);
    res.json(pets);
  });

  app.delete("/api/customer/pets/:id", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const id = parseInt(req.params.id);
    await storage.deletePetProfile(id, customerId);
    const pets = await storage.getPetProfiles(customerId);
    res.json(pets);
  });

  app.get("/api/customer-lookup", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const customer = await storage.getCustomer(customerId);
    if (!customer) return res.json(null);
    const matched = await storage.getOrdersByPhone(customer.phone);
    if (matched.length === 0) return res.json(null);
    const latest = matched[0];
    res.json({
      customerName: latest.customerName || "",
      customerAddress: latest.customerAddress || "",
    });
  });

  app.get("/api/orders/track", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const customer = await storage.getCustomer(customerId);
    if (!customer) return res.json([]);
    const matched = await storage.getOrdersByPhone(customer.phone);
    const safeOrders = matched.map(o => ({
      id: o.id,
      items: o.items,
      grandTotal: o.grandTotal,
      status: o.status,
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt,
    }));
    res.json(safeOrders);
  });

  app.get("/api/breed-stats/:productId", async (req, res) => {
    const productId = parseInt(req.params.productId);
    const stats = await storage.getBreedStatsByProduct(productId);
    res.json(stats.sort((a, b) => a.sortOrder - b.sortOrder));
  });

  app.post("/api/admin/breed-stats", requireAdmin, async (req, res) => {
    const parsed = insertBreedStatSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    const stat = await storage.createBreedStat(parsed.data);
    res.status(201).json(stat);
  });

  app.delete("/api/admin/breed-stats/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteBreedStat(id);
    res.json({ message: "Deleted" });
  });

  app.post("/api/stock-alerts", async (req, res) => {
    const ip = req.ip || "unknown";
    if (rateLimit(`stockalert:${ip}`, 10, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
    }
    const schema = z.object({
      productId: z.number(),
      customerName: z.string().min(1).max(100),
      phone: z.string().min(7).max(20),
      productName: z.string().max(300),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    const alert = await storage.createStockAlert(parsed.data);
    res.status(201).json(alert);
  });

  app.get("/api/admin/stock-alerts", requireAdmin, async (_req, res) => {
    const alerts = await storage.getAllStockAlerts();
    res.json(alerts);
  });

  app.post("/api/admin/stock-alerts/:productId/notify", requireAdmin, async (req, res) => {
    const productId = parseInt(req.params.productId);
    const pending = await storage.getUnnotifiedStockAlerts(productId);
    if (pending.length === 0) return res.json({ message: "Bildirilecek kişi yok", notified: 0, contacts: [] });
    await storage.markStockAlertsNotified(productId);
    const contacts = pending.map(a => ({ name: a.customerName, phone: a.phone, productName: a.productName }));
    res.json({ message: `${contacts.length} kişi bildirildi`, notified: contacts.length, contacts });
  });

  app.get("/api/installment-rates", async (_req, res) => {
    const rates = await storage.getActiveInstallmentRates();
    res.json(rates);
  });

  app.get("/api/admin/installment-rates", requireAdmin, async (_req, res) => {
    const rates = await storage.getAllInstallmentRates();
    res.json(rates);
  });

  app.post("/api/admin/installment-rates", requireAdmin, async (req, res) => {
    const schema = z.object({
      months: z.number().min(1).max(36),
      rate: z.number().min(0).max(100),
      isActive: z.boolean().optional(),
      sortOrder: z.number().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    const rate = await storage.createInstallmentRate(parsed.data as any);
    res.status(201).json(rate);
  });

  app.patch("/api/admin/installment-rates/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id as string);
    const schema = z.object({
      months: z.number().min(1).max(36).optional(),
      rate: z.number().min(0).max(100).optional(),
      isActive: z.boolean().optional(),
      sortOrder: z.number().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    const rate = await storage.updateInstallmentRate(id, parsed.data as any);
    if (!rate) return res.status(404).json({ message: "Not found" });
    res.json(rate);
  });

  app.delete("/api/admin/installment-rates/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id as string);
    await storage.deleteInstallmentRate(id);
    res.json({ message: "Deleted" });
  });


  app.post("/api/admin/migrate-disk-images", requireAdmin, async (req, res) => {
    res.json({ message: "Disk resimlerinin DB'ye aktarımı başlatıldı" });
    
    const fs = await import("fs");
    const pathMod = await import("path");
    
    const imageDirs = [
      pathMod.default.join(process.cwd(), "dist", "public", "product-images"),
      pathMod.default.join(process.cwd(), "client", "public", "product-images"),
    ].filter(d => fs.existsSync(d));
    
    const products = await storage.getAllProducts();
    let migrated = 0;
    let skipped = 0;
    let failed = 0;
    
    for (const product of products) {
      if (product.img?.startsWith("/api/product-image/")) {
        const hasImg = await (await import("./image-service")).hasProductImage(product.id);
        if (hasImg) { skipped++; continue; }
      }
      
      let buffer: Buffer | null = null;
      const filename = `product-${product.id}.webp`;
      for (const dir of imageDirs) {
        const filePath = pathMod.default.join(dir, filename);
        if (fs.existsSync(filePath)) {
          buffer = fs.readFileSync(filePath);
          break;
        }
      }
      
      if (buffer) {
        try {
          const imgPath = await (await import("./image-service")).saveProductImage(buffer, product.id);
          await storage.updateProduct(product.id, { img: imgPath });
          migrated++;
        } catch (err: any) {
          console.log(`[migrate] Failed for product ${product.id}: ${err.message}`);
          failed++;
        }
      } else if (product.img?.startsWith("http") || product.originalImg) {
        const url = product.originalImg || product.img;
        if (url) {
          const imgPath = await (await import("./image-service")).downloadAndSaveImage(url, product.id);
          if (imgPath) {
            await storage.updateProduct(product.id, { img: imgPath });
            migrated++;
          } else {
            failed++;
          }
          await new Promise(r => setTimeout(r, 200));
        }
      } else {
        skipped++;
      }
    }
    
    console.log(`[migrate] Complete: ${migrated} migrated, ${skipped} skipped, ${failed} failed`);
  });

  app.get("/api/campaign-items", async (req, res) => {
    try {
      const { rows } = await sharedPool.query(`
        SELECT ci.*, p.name, p.price, p.original_price, p.img, p.stock, p.is_active, p.skt, p.preorder_enabled,
          bc.animal,
          CASE WHEN ci.campaign_price IS NOT NULL THEN ci.campaign_price ELSE p.price END AS display_price
        FROM campaign_items ci
        JOIN products p ON p.id = ci.product_id
        LEFT JOIN brand_categories bc ON bc.id = p.brand_category_id
        WHERE ci.is_active = true AND p.is_active = true
        ORDER BY ci.item_type, ci.sort_order
      `);
      const mapped = rows.map(r => ({
        ...r,
        original_price: r.campaign_price ? r.price : r.original_price,
        price: r.campaign_price ? parseFloat(r.campaign_price) : r.price,
      }));
      res.json(mapped);
    } catch (err) {
      res.status(500).json({ message: "Campaign items fetch error" });
    }
  });

  app.get("/api/campaign-check/:productId", async (req, res) => {
    try {
      const pid = parseInt(req.params.productId);
      const { rows } = await sharedPool.query(
        `SELECT item_type, campaign_price FROM campaign_items WHERE product_id = $1 AND is_active = true LIMIT 1`,
        [pid]
      );
      if (rows.length > 0) {
        res.json({ isCampaign: true, itemType: rows[0].item_type, campaignPrice: rows[0].campaign_price ? parseFloat(rows[0].campaign_price) : null });
      } else {
        res.json({ isCampaign: false });
      }
    } catch {
      res.json({ isCampaign: false });
    }
  });

  app.post("/api/admin/campaign-items", requireAdmin, async (req, res) => {
    try {
      const { productId, itemType, sortOrder, parentProductId, campaignPrice } = req.body;
      if (!productId || !itemType) return res.status(400).json({ message: "productId and itemType required" });
      const existing = await sharedPool.query(
        `SELECT id FROM campaign_items WHERE product_id = $1`, [productId]
      );
      if (existing.rows.length > 0) {
        return res.status(400).json({ message: "Bu ürün zaten kampanyada" });
      }
      const { rows } = await sharedPool.query(
        `INSERT INTO campaign_items (product_id, item_type, sort_order, parent_product_id, campaign_price) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [productId, itemType, sortOrder || 0, parentProductId || null, campaignPrice || null]
      );
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ message: "Campaign item create error" });
    }
  });

  app.get("/api/reviews/:productId", async (req, res) => {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) return res.status(400).json({ message: "Geçersiz ID" });
    const reviews = await db.select().from(productReviews).where(and(eq(productReviews.productId, productId), eq(productReviews.isPublished, true))).orderBy(desc(productReviews.helpfulCount));
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json(reviews);
  });

  app.get("/api/admin/reviews", requireAdmin, async (req, res) => {
    const reviews = await db.select().from(productReviews).orderBy(desc(productReviews.createdAt));
    res.json(reviews);
  });

  app.post("/api/admin/reviews", requireAdmin, async (req, res) => {
    const schema = z.object({
      productId: z.number().int(),
      reviewerName: z.string().min(1).max(100),
      rating: z.number().int().min(1).max(5),
      comment: z.string().min(1).max(2000),
      helpfulCount: z.number().int().min(0).default(0),
      reviewDate: z.string().min(1).max(50),
      isPublished: z.boolean().default(true),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Geçersiz veri", errors: parsed.error.errors });
    const [review] = await db.insert(productReviews).values(parsed.data).returning();
    res.status(201).json(review);
  });

  app.patch("/api/admin/reviews/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Geçersiz ID" });
    const patchSchema = z.object({
      productId: z.number().int().optional(),
      reviewerName: z.string().min(1).max(100).optional(),
      rating: z.number().int().min(1).max(5).optional(),
      comment: z.string().min(1).max(2000).optional(),
      helpfulCount: z.number().int().min(0).optional(),
      reviewDate: z.string().min(1).max(50).optional(),
      isPublished: z.boolean().optional(),
    });
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Geçersiz veri", errors: parsed.error.errors });
    const safeBody = parsed.data;
    if (Object.keys(safeBody).length === 0) return res.status(400).json({ message: "Güncellenecek alan yok" });
    const [updated] = await db.update(productReviews).set(safeBody).where(eq(productReviews.id, id)).returning();
    if (!updated) return res.status(404).json({ message: "Yorum bulunamadı" });
    res.json(updated);
  });

  app.delete("/api/admin/reviews/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Geçersiz ID" });
    await db.delete(productReviews).where(eq(productReviews.id, id));
    res.json({ message: "Silindi" });
  });

  app.get("/api/admin/campaign-items", requireAdmin, async (req, res) => {
    try {
      const { rows } = await sharedPool.query(`
        SELECT ci.*, ci.campaign_price, p.name, p.price, p.original_price, p.img, p.stock, p.is_active AS product_active, p.skt
        FROM campaign_items ci
        JOIN products p ON p.id = ci.product_id
        ORDER BY ci.item_type, ci.sort_order
      `);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ message: "Admin campaign items fetch error" });
    }
  });

  app.patch("/api/admin/campaign-items/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isActive, sortOrder, itemType, campaignPrice } = req.body;
      const sets: string[] = [];
      const vals: any[] = [];
      let idx = 1;
      if (typeof isActive === "boolean") { sets.push(`is_active = $${idx++}`); vals.push(isActive); }
      if (typeof sortOrder === "number") { sets.push(`sort_order = $${idx++}`); vals.push(sortOrder); }
      if (typeof itemType === "string") { sets.push(`item_type = $${idx++}`); vals.push(itemType); }
      if (campaignPrice !== undefined) { sets.push(`campaign_price = $${idx++}`); vals.push(campaignPrice === "" || campaignPrice === null ? null : campaignPrice); }
      if (sets.length === 0) return res.status(400).json({ message: "No fields to update" });
      vals.push(id);
      const { rows } = await sharedPool.query(
        `UPDATE campaign_items SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`,
        vals
      );
      if (rows.length === 0) return res.status(404).json({ message: "Not found" });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ message: "Campaign item update error" });
    }
  });

  app.delete("/api/admin/campaign-items/:id", requireAdmin, async (req, res) => {
    try {
      await sharedPool.query(`DELETE FROM campaign_items WHERE id = $1`, [req.params.id]);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ message: "Campaign item delete error" });
    }
  });

  app.get("/api/delivery-neighborhoods", async (_req, res) => {
    try {
      const neighborhoods = await storage.getActiveDeliveryNeighborhoods();
      res.json(neighborhoods);
    } catch (err) {
      res.status(500).json({ message: "Delivery neighborhoods fetch error" });
    }
  });

  app.get("/api/admin/delivery-neighborhoods", requireAdmin, async (_req, res) => {
    try {
      const neighborhoods = await storage.getAllDeliveryNeighborhoods();
      res.json(neighborhoods);
    } catch (err) {
      res.status(500).json({ message: "Delivery neighborhoods fetch error" });
    }
  });

  app.post("/api/admin/delivery-neighborhoods", requireAdmin, async (req, res) => {
    try {
      const { district, name, distance, minOrder, shippingFee, freeShippingLimit, isActive, sortOrder } = req.body;
      if (!name || typeof name !== "string") {
        return res.status(400).json({ message: "Mahalle adı gerekli" });
      }
      const nh = await storage.createDeliveryNeighborhood({
        district: (district || "Atakum").trim(),
        name: name.trim(),
        distance: distance ? parseFloat(distance) : null,
        minOrder: parseFloat(minOrder) || 700,
        shippingFee: parseFloat(shippingFee) || 89,
        freeShippingLimit: parseFloat(freeShippingLimit) || 2000,
        isActive: isActive !== false,
        sortOrder: parseInt(sortOrder) || 0,
      });
      res.json(nh);
    } catch (err) {
      res.status(500).json({ message: "Delivery neighborhood create error" });
    }
  });

  app.patch("/api/admin/delivery-neighborhoods/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates: Record<string, any> = {};
      if (req.body.district !== undefined) updates.district = req.body.district.trim();
      if (req.body.name !== undefined) updates.name = req.body.name.trim();
      if (req.body.distance !== undefined) updates.distance = req.body.distance !== null ? parseFloat(req.body.distance) : null;
      if (req.body.minOrder !== undefined) updates.minOrder = parseFloat(req.body.minOrder);
      if (req.body.shippingFee !== undefined) updates.shippingFee = parseFloat(req.body.shippingFee);
      if (req.body.freeShippingLimit !== undefined) updates.freeShippingLimit = parseFloat(req.body.freeShippingLimit);
      if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;
      if (req.body.sortOrder !== undefined) updates.sortOrder = parseInt(req.body.sortOrder);
      const updated = await storage.updateDeliveryNeighborhood(id, updates);
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Delivery neighborhood update error" });
    }
  });

  app.delete("/api/admin/delivery-neighborhoods/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteDeliveryNeighborhood(parseInt(req.params.id));
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ message: "Delivery neighborhood delete error" });
    }
  });

  app.get("/api/admin/dashboard-stats", requireAdmin, async (_req, res) => {
    try {
      const allOrders = await storage.getAllOrders();
      const allProducts = await storage.getAllProducts();
      const allCustomers = await storage.getAllCustomers();
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - 7);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= todayStart);
      const weekOrders = allOrders.filter(o => new Date(o.createdAt) >= weekStart);
      const monthOrders = allOrders.filter(o => new Date(o.createdAt) >= monthStart);

      const sum = (arr: typeof allOrders) => arr.reduce((s, o) => s + (o.grandTotal || 0), 0);
      const completed = (arr: typeof allOrders) => arr.filter(o => o.status === "tamamlandi");
      const pending = (arr: typeof allOrders) => arr.filter(o => o.status === "yeni" || o.status === "onaylandi" || o.status === "hazirlaniyor");

      const lowStockProducts = allProducts.filter(p => p.stock <= 3 && p.isActive);

      const productSales: Record<number, { name: string; qty: number; revenue: number }> = {};
      for (const order of allOrders) {
        if (order.status === "iptal") continue;
        for (const item of order.items as any[]) {
          const pid = Number(item.productId);
          if (!productSales[pid]) productSales[pid] = { name: item.name, qty: 0, revenue: 0 };
          productSales[pid].qty += item.quantity;
          productSales[pid].revenue += item.price * item.quantity;
        }
      }
      const topProducts = Object.entries(productSales)
        .map(([id, d]) => ({ id: Number(id), ...d }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      const last30 = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(todayStart);
        d.setDate(d.getDate() - (29 - i));
        return d;
      });
      const dailyRevenue = last30.map(day => {
        const nextDay = new Date(day);
        nextDay.setDate(nextDay.getDate() + 1);
        const dayOrders = allOrders.filter(o => {
          const t = new Date(o.createdAt);
          return t >= day && t < nextDay && o.status !== "iptal";
        });
        return { date: day.toISOString().split("T")[0], revenue: sum(dayOrders), count: dayOrders.length };
      });

      const avg = (arr: typeof allOrders) => arr.length > 0 ? sum(arr) / arr.length : 0;

      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      const yesterdayOrders = allOrders.filter(o => { const t = new Date(o.createdAt); return t >= yesterdayStart && t < todayStart; });
      const prevWeekStart = new Date(weekStart);
      prevWeekStart.setDate(prevWeekStart.getDate() - 7);
      const prevWeekOrders = allOrders.filter(o => { const t = new Date(o.createdAt); return t >= prevWeekStart && t < weekStart; });

      const customerOrderMap: Record<string, { phone: string; name: string; id: number; total: number; count: number; lastDate: Date | null }> = {};
      for (const c of allCustomers) {
        customerOrderMap[c.phone] = { phone: c.phone, name: c.name, id: c.id, total: 0, count: 0, lastDate: null };
      }
      for (const o of allOrders) {
        if (o.status === "iptal") continue;
        const entry = customerOrderMap[o.customerPhone];
        if (entry) {
          entry.total += o.grandTotal || 0;
          entry.count += 1;
          const d = new Date(o.createdAt);
          if (!entry.lastDate || d > entry.lastDate) entry.lastDate = d;
        }
      }
      const custEntries = Object.values(customerOrderMap);
      const vipThreshold = 3000;
      const dormantDays = 30;
      const nowMs = now.getTime();
      const vipCustomers = custEntries.filter(c => c.total >= vipThreshold).sort((a, b) => b.total - a.total);
      const dormantCustomers = custEntries.filter(c => {
        if (!c.lastDate) return c.count === 0;
        return (nowMs - c.lastDate.getTime()) / (1000 * 60 * 60 * 24) > dormantDays;
      }).sort((a, b) => {
        const aD = a.lastDate ? (nowMs - a.lastDate.getTime()) : Infinity;
        const bD = b.lastDate ? (nowMs - b.lastDate.getTime()) : Infinity;
        return bD - aD;
      });
      const riskyCustomers = (() => {
        const cancelMap: Record<string, number> = {};
        for (const o of allOrders) {
          if (o.status === "iptal") cancelMap[o.customerPhone] = (cancelMap[o.customerPhone] || 0) + 1;
        }
        return custEntries.filter(c => (cancelMap[c.phone] || 0) >= 2).map(c => ({ ...c, cancellations: cancelMap[c.phone] || 0 }));
      })();

      res.json({
        today: { orders: todayOrders.length, revenue: Math.round(sum(todayOrders) * 100) / 100, avgBasket: Math.round(avg(todayOrders) * 100) / 100 },
        yesterday: { orders: yesterdayOrders.length, revenue: Math.round(sum(yesterdayOrders) * 100) / 100 },
        week: { orders: weekOrders.length, revenue: Math.round(sum(weekOrders) * 100) / 100, avgBasket: Math.round(avg(weekOrders) * 100) / 100 },
        prevWeek: { orders: prevWeekOrders.length, revenue: Math.round(sum(prevWeekOrders) * 100) / 100 },
        month: { orders: monthOrders.length, revenue: Math.round(sum(monthOrders) * 100) / 100, avgBasket: Math.round(avg(monthOrders) * 100) / 100 },
        total: { orders: allOrders.length, revenue: Math.round(sum(allOrders) * 100) / 100, customers: allCustomers.length, products: allProducts.filter(p => p.isActive).length },
        pending: pending(allOrders).length,
        completed: completed(allOrders).length,
        lowStockProducts,
        topProducts,
        dailyRevenue,
        segments: {
          vip: vipCustomers.slice(0, 30).map(c => ({ id: c.id, name: c.name, phone: c.phone, total: Math.round(c.total), count: c.count, lastDate: c.lastDate })),
          dormant: dormantCustomers.slice(0, 30).map(c => ({ id: c.id, name: c.name, phone: c.phone, total: Math.round(c.total), count: c.count, lastDate: c.lastDate, daysSince: c.lastDate ? Math.floor((nowMs - c.lastDate.getTime()) / (1000 * 60 * 60 * 24)) : null })),
          risky: riskyCustomers.slice(0, 30).map(c => ({ id: c.id, name: c.name, phone: c.phone, total: Math.round(c.total), count: c.count, cancellations: c.cancellations })),
          vipCount: vipCustomers.length,
          dormantCount: dormantCustomers.length,
          riskyCount: riskyCustomers.length,
        },
      });
    } catch (err) {
      res.status(500).json({ message: "Dashboard stats error" });
    }
  });

  app.get("/api/admin/customers", requireAdmin, async (_req, res) => {
    try {
      const allCustomers = await storage.getAllCustomers();
      const allOrders = await storage.getAllOrders();
      const allAddresses = await sharedPool.query("SELECT * FROM customer_addresses ORDER BY id DESC");
      const addressMap = new Map<number, any[]>();
      for (const a of allAddresses.rows) {
        const list = addressMap.get(a.customer_id) || [];
        list.push(a);
        addressMap.set(a.customer_id, list);
      }
      const result = allCustomers.map(c => {
        const customerOrders = allOrders.filter(o => o.customerPhone === c.phone);
        const totalSpent = customerOrders.reduce((s, o) => s + (o.grandTotal || 0), 0);
        return {
          id: c.id, phone: c.phone, name: c.name, address: c.address,
          email: c.email,
          createdAt: c.createdAt,
          isBlacklisted: c.isBlacklisted,
          blacklistReason: c.blacklistReason,
          orderCount: customerOrders.length,
          totalSpent: Math.round(totalSpent * 100) / 100,
          lastOrder: customerOrders.length > 0 ? customerOrders[0].createdAt : null,
          addresses: (addressMap.get(c.id) || []).map(a => ({ id: a.id, label: a.label, address: a.address, district: a.district })),
          orders: customerOrders.slice(0, 20).map(o => ({
            id: o.id,
            createdAt: o.createdAt,
            grandTotal: o.grandTotal,
            status: o.status,
            itemCount: Array.isArray(o.items) ? o.items.length : 0,
            paymentMethod: o.paymentMethod,
          })),
        };
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Customers fetch error" });
    }
  });

  app.patch("/api/admin/customers/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, address } = req.body;
      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (address !== undefined) updates.address = address;
      const updated = await storage.updateCustomer(id, updates);
      if (!updated) return res.status(404).json({ message: "Müşteri bulunamadı" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Customer update error" });
    }
  });

  app.post("/api/admin/impersonate/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Geçersiz müşteri ID" });
      const customer = await storage.getCustomer(id);
      if (!customer) return res.status(404).json({ message: "Müşteri bulunamadı" });
      (req.session as any).customerId = customer.id;
      (req.session as any).adminImpersonating = true;
      res.json({ success: true, phone: customer.phone, name: customer.name });
    } catch (err) {
      res.status(500).json({ message: "Impersonation error" });
    }
  });

  app.delete("/api/admin/customers/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Geçersiz müşteri ID" });
      await storage.deleteCustomerAccount(id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Müşteri silme hatası" });
    }
  });

  app.post("/api/admin/send-sms", requireAdmin, async (req, res) => {
    try {
      const { phones, message } = req.body;
      if (!phones || !Array.isArray(phones) || phones.length === 0 || !message || typeof message !== "string") {
        return res.status(400).json({ message: "Telefon listesi ve mesaj gerekli" });
      }
      if (message.length > 300) {
        return res.status(400).json({ message: "Mesaj en fazla 300 karakter olabilir" });
      }
      const validPhones = phones
        .filter((p: any) => typeof p === "string" && /^\d{10,15}$/.test(p.replace(/\D/g, "")))
        .slice(0, 100);
      if (validPhones.length === 0) return res.status(400).json({ message: "Geçerli telefon numarası bulunamadı" });
      let sent = 0, failed = 0;
      for (const phone of validPhones) {
        const ok = await sendSmsViaNetgsm(phone, message);
        if (ok) sent++;
        else failed++;
        await new Promise(r => setTimeout(r, 200));
      }
      res.json({ sent, failed, total: validPhones.length });
    } catch (err) {
      res.status(500).json({ message: "SMS gönderim hatası" });
    }
  });

  app.get("/api/admin/banners", requireAdmin, async (_req, res) => {
    try {
      const all = await storage.getAllBanners();
      res.json(all);
    } catch (err) {
      res.status(500).json({ message: "Banners fetch error" });
    }
  });

  app.post("/api/admin/banners", requireAdmin, upload.single("image"), async (req, res) => {
    try {
      const { title, linkUrl, sortOrder } = req.body;
      if (!title) return res.status(400).json({ message: "Başlık gerekli" });
      let imageData: string | undefined;
      if (req.file) {
        imageData = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      }
      const banner = await storage.createBanner({ title, linkUrl: linkUrl || null, imageData: imageData || null, sortOrder: parseInt(sortOrder || "0"), isActive: true });
      res.json(banner);
    } catch (err) {
      res.status(500).json({ message: "Banner oluşturma hatası" });
    }
  });

  app.patch("/api/admin/banners/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates: any = {};
      if (req.body.title !== undefined) updates.title = req.body.title;
      if (req.body.linkUrl !== undefined) updates.linkUrl = req.body.linkUrl;
      if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;
      if (req.body.sortOrder !== undefined) updates.sortOrder = parseInt(req.body.sortOrder);
      const updated = await storage.updateBanner(id, updates);
      if (!updated) return res.status(404).json({ message: "Banner bulunamadı" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Banner güncelleme hatası" });
    }
  });

  app.delete("/api/admin/banners/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteBanner(parseInt(req.params.id));
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ message: "Banner silme hatası" });
    }
  });

  app.post("/api/admin/blacklist/:customerId", requireAdmin, async (req, res) => {
    const customerId = parseInt(req.params.customerId);
    const { reason } = req.body;
    await sharedPool.query("UPDATE customers SET is_blacklisted = true, blacklist_reason = $1 WHERE id = $2", [reason || "Belirtilmemiş", customerId]);
    res.json({ success: true });
  });

  app.post("/api/admin/unblacklist/:customerId", requireAdmin, async (req, res) => {
    const customerId = parseInt(req.params.customerId);
    await sharedPool.query("UPDATE customers SET is_blacklisted = false, blacklist_reason = NULL WHERE id = $1", [customerId]);
    res.json({ success: true });
  });

  app.get("/api/admin/blacklisted-customers", requireAdmin, async (_req, res) => {
    const result = await sharedPool.query("SELECT * FROM customers WHERE is_blacklisted = true ORDER BY name");
    res.json(result.rows);
  });

  app.get("/api/admin/reports", requireAdmin, async (_req, res) => {
    try {
      const allOrders = await storage.getAllOrders();
      const allProducts = await storage.getAllProducts();
      const allCustomers = await storage.getAllCustomers();
      const categories = await storage.getBrandCategories();
      const catMap = new Map(categories.map(c => [c.id, c]));

      const paymentMethods: Record<string, { count: number; total: number }> = {};
      const customerRanking: Record<string, { phone: string; name: string; total: number; count: number; cancelCount: number }> = {};

      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const dailyCiro: Record<string, number> = {};
      const weeklyCiroByMethod: Record<string, number> = {};
      let dailyTotal = 0;
      let weeklyTotal = 0;

      const productSales: Record<number, { name: string; quantity: number; revenue: number; cost: number }> = {};

      for (const order of allOrders) {
        if (order.customerPhone) {
          const key = order.customerPhone;
          if (!customerRanking[key]) customerRanking[key] = { phone: key, name: order.customerName || "", total: 0, count: 0, cancelCount: 0 };
          if (order.status === "iptal") {
            customerRanking[key].cancelCount++;
          }
        }

        if (order.status === "iptal") continue;

        const method = order.paymentMethod || "Bilinmiyor";
        if (!paymentMethods[method]) paymentMethods[method] = { count: 0, total: 0 };
        paymentMethods[method].count++;
        paymentMethods[method].total += order.grandTotal || 0;

        if (order.customerPhone) {
          const key = order.customerPhone;
          customerRanking[key].total += order.grandTotal || 0;
          customerRanking[key].count++;
        }

        const orderDate = new Date(order.createdAt);
        const orderDateStr = orderDate.toISOString().slice(0, 10);
        if (orderDateStr === todayStr) {
          dailyTotal += order.grandTotal || 0;
          dailyCiro[method] = (dailyCiro[method] || 0) + (order.grandTotal || 0);
        }
        if (orderDate >= weekAgo) {
          weeklyTotal += order.grandTotal || 0;
          weeklyCiroByMethod[method] = (weeklyCiroByMethod[method] || 0) + (order.grandTotal || 0);
        }

        const items = order.items as any[];
        if (items) {
          for (const item of items) {
            const pid = parseInt(String(item.productId));
            if (!productSales[pid]) productSales[pid] = { name: item.name || "", quantity: 0, revenue: 0, cost: 0 };
            productSales[pid].quantity += item.quantity || 1;
            productSales[pid].revenue += (item.price || 0) * (item.quantity || 1);
          }
        }
      }

      for (const [pid, ps] of Object.entries(productSales)) {
        const product = allProducts.find(p => p.id === parseInt(pid));
        if (product && product.originalPrice) {
          ps.cost = product.originalPrice * ps.quantity;
        } else if (product) {
          ps.cost = product.price * 0.7 * ps.quantity;
        }
      }

      const bestSellers = Object.entries(productSales)
        .map(([pid, data]) => ({
          productId: parseInt(pid),
          name: data.name,
          quantity: data.quantity,
          revenue: Math.round(data.revenue * 100) / 100,
          profit: Math.round((data.revenue - data.cost) * 100) / 100,
          marginPercent: data.revenue > 0 ? Math.round(((data.revenue - data.cost) / data.revenue) * 100) : 0,
        }))
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 20);

      const topCustomers = Object.values(customerRanking)
        .sort((a, b) => b.total - a.total)
        .slice(0, 15)
        .map(c => ({ ...c, total: Math.round(c.total * 100) / 100 }));

      const problemCustomers = Object.values(customerRanking)
        .filter(c => c.cancelCount >= 2)
        .sort((a, b) => b.cancelCount - a.cancelCount)
        .slice(0, 10);

      const statusCounts: Record<string, number> = {};
      for (const order of allOrders) {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      }

      const monthlyData: Record<string, { revenue: number; orders: number }> = {};
      const neighborhoodStats: Record<string, { count: number; total: number }> = {};
      for (const order of allOrders) {
        if (order.status === "iptal") continue;
        const month = new Date(order.createdAt).toISOString().slice(0, 7);
        if (!monthlyData[month]) monthlyData[month] = { revenue: 0, orders: 0 };
        monthlyData[month].revenue += order.grandTotal || 0;
        monthlyData[month].orders++;

        if (order.customerAddress) {
          const addr = order.customerAddress;
          const mahalleParts = addr.split(",");
          let mahalle = mahalleParts[0]?.trim();
          if (mahalle && mahalle.toLowerCase().includes("mah")) {
            if (!neighborhoodStats[mahalle]) neighborhoodStats[mahalle] = { count: 0, total: 0 };
            neighborhoodStats[mahalle].count++;
            neighborhoodStats[mahalle].total += order.grandTotal || 0;
          }
        }
      }

      const heatmapData = Object.entries(neighborhoodStats)
        .map(([name, data]) => {
          const maxCount = Math.max(...Object.values(neighborhoodStats).map(n => n.count), 1);
          return {
            name,
            count: data.count,
            total: Math.round(data.total * 100) / 100,
            intensity: Math.round((data.count / maxCount) * 100),
          };
        })
        .sort((a, b) => b.count - a.count);

      res.json({
        paymentMethods: Object.entries(paymentMethods).map(([method, data]) => ({
          method, ...data, total: Math.round(data.total * 100) / 100,
        })),
        topCustomers,
        problemCustomers,
        bestSellers,
        statusCounts,
        dailyCiro: {
          total: Math.round(dailyTotal * 100) / 100,
          byMethod: Object.entries(dailyCiro).map(([method, total]) => ({ method, total: Math.round(total * 100) / 100 })),
        },
        weeklyCiro: {
          total: Math.round(weeklyTotal * 100) / 100,
          byMethod: Object.entries(weeklyCiroByMethod).map(([method, total]) => ({ method, total: Math.round(total * 100) / 100 })),
        },
        monthlyData: Object.entries(monthlyData).map(([month, data]) => ({
          month, revenue: Math.round(data.revenue * 100) / 100, orders: data.orders,
        })).sort((a, b) => a.month.localeCompare(b.month)),
        totalCustomers: allCustomers.length,
        totalProducts: allProducts.filter(p => p.isActive).length,
        totalOrders: allOrders.length,
        neighborhoodStats: Object.entries(neighborhoodStats)
          .map(([name, data]) => ({ name, count: data.count, total: Math.round(data.total * 100) / 100 }))
          .sort((a, b) => b.total - a.total),
        heatmapData,
      });
    } catch (err) {
      res.status(500).json({ message: "Reports error" });
    }
  });

  const petAI = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });

  app.post("/api/pet-ask", async (req: Request, res: Response) => {
    const ip = req.ip || "unknown";
    if (rateLimit(`petask:${ip}`, 5, 60 * 1000)) {
      return res.status(429).json({ error: "Çok fazla soru. Lütfen biraz bekleyin." });
    }
    if (rateLimit(`petask:global`, 100, 60 * 60 * 1000)) {
      return res.status(429).json({ error: "Sistem yoğun. Lütfen daha sonra tekrar deneyin." });
    }
    try {
      const { question } = req.body;
      if (!question || typeof question !== "string" || question.trim().length < 2 || question.trim().length > 500) {
        return res.status(400).json({ error: "Lütfen 2-500 karakter arası bir soru yazın" });
      }

      const completion = await petAI.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Sen Türkiye'de bir pet shop'un yapay zeka asistanısın. Sadece evcil hayvanlar (kedi, köpek, kuş, kemirgen, balık) hakkında sorulara cevap ver. Konular: beslenme, mama seçimi, sağlık, bakım, davranış, eğitim, veteriner tavsiyeleri. Cevapları Türkçe ver, kısa ve öz tut (max 3-4 cümle). Evcil hayvanla ilgili olmayan sorulara "Bu konuda yardımcı olamıyorum, sadece evcil hayvan bakımı hakkında sorular sorabilirsiniz." de. Asla ilaç dozu veya tedavi reçetesi verme, veterinere yönlendir.`
          },
          { role: "user", content: question.trim() }
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const answer = completion.choices[0]?.message?.content || "Üzgünüm, şu an cevap veremiyorum.";
      res.json({ answer });
    } catch (error: any) {
      console.error("Pet AI error:", error?.message || error);
      res.status(500).json({ error: "Yapay zeka şu an meşgul, lütfen tekrar deneyin." });
    }
  });

  app.post("/api/coupons/validate", async (req, res) => {
    const ip = req.ip || "unknown";
    if (rateLimit(`coupon:${ip}`, 15, 60 * 1000)) {
      return res.status(429).json({ valid: false, message: "Çok fazla deneme. Lütfen bekleyin." });
    }
    const { code, subtotal } = req.body;
    if (!code || typeof code !== "string" || code.length > 50) return res.status(400).json({ valid: false, message: "Kupon kodu gerekli" });
    const coupon = await storage.getCouponByCode(code);
    if (!coupon || !coupon.isActive) return res.json({ valid: false, message: "Geçersiz kupon kodu" });
    const now = new Date();
    if (coupon.expiresAt && new Date(coupon.expiresAt) < now) return res.json({ valid: false, message: "Kupon kodunun süresi dolmuş" });
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return res.json({ valid: false, message: "Kupon kullanım limiti dolmuş" });
    if (coupon.customerId) {
      const customerId = (req.session as any)?.customerId;
      if (!customerId || customerId !== coupon.customerId) {
        return res.json({ valid: false, message: "Bu kupon size ait değil" });
      }
    }
    if (subtotal && subtotal < coupon.minOrderAmount) return res.json({ valid: false, message: `Minimum sipariş tutarı: ${coupon.minOrderAmount} TL` });
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = Math.round((subtotal || 0) * (coupon.discountValue / 100) * 100) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }
    res.json({
      valid: true,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      minOrderAmount: coupon.minOrderAmount,
      message: coupon.discountType === "percentage" ? `%${coupon.discountValue} indirim uygulandı` : `${coupon.discountValue} TL indirim uygulandı`,
    });
  });

  app.get("/api/admin/coupons", requireAdmin, async (_req, res) => {
    const all = await storage.getAllCoupons();
    res.json(all);
  });

  app.post("/api/admin/coupons", requireAdmin, async (req, res) => {
    const schema = z.object({
      code: z.string().min(3),
      discountType: z.enum(["percentage", "fixed"]),
      discountValue: z.number().positive(),
      minOrderAmount: z.number().min(0).optional(),
      maxUses: z.number().positive().optional().nullable(),
      isActive: z.boolean().optional(),
      expiresAt: z.string().optional().nullable(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Geçersiz veri" });
    const data: any = { ...parsed.data };
    if (data.expiresAt) data.expiresAt = new Date(data.expiresAt);
    else data.expiresAt = null;
    const coupon = await storage.createCoupon(data);
    res.status(201).json(coupon);
  });

  app.patch("/api/admin/coupons/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Geçersiz ID" });
    const allowedKeys = ["code", "discountType", "discountValue", "minOrderAmount", "maxUses", "isActive", "expiresAt", "customerId"];
    const data: any = {};
    for (const key of allowedKeys) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }
    if (data.expiresAt) data.expiresAt = new Date(data.expiresAt);
    else if (data.expiresAt === null) data.expiresAt = null;
    const updated = await storage.updateCoupon(id, data);
    if (!updated) return res.status(404).json({ message: "Kupon bulunamadı" });
    res.json(updated);
  });

  app.delete("/api/admin/coupons/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteCoupon(id);
    res.json({ message: "Silindi" });
  });

  app.get("/api/customer/virtual-pet", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const [pet] = await db.select().from(virtualPets).where(eq(virtualPets.customerId, customerId));
    if (!pet) return res.json(null);
    res.json(pet);
  });

  app.post("/api/customer/virtual-pet", requireCustomer, async (req, res) => {
    try {
      const customerId = (req as any).customerId;
      const { petType, petName } = req.body;
      const validTypes = ["kedi", "kopek", "kus"];
      const safePetType = validTypes.includes(petType) ? petType : "kedi";
      const safePetName = (petName || "Minnoş").toString().trim().slice(0, 20) || "Minnoş";
      const [existing] = await db.select().from(virtualPets).where(eq(virtualPets.customerId, customerId));
      if (existing) return res.json(existing);
      const [pet] = await db.insert(virtualPets).values({
        customerId,
        petType: safePetType,
        petName: safePetName,
      }).returning();
      res.json(pet);
    } catch (e) {
      res.status(500).json({ message: "Sanal hayvan oluşturulamadı" });
    }
  });

  app.post("/api/customer/virtual-pet/feed", requireCustomer, async (req, res) => {
    try {
      const customerId = (req as any).customerId;
      const ip = req.ip || "unknown";
      if (rateLimit(`petfeed:${ip}`, 10, 60 * 60 * 1000)) {
        return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
      }
      const [pet] = await db.select().from(virtualPets).where(eq(virtualPets.customerId, customerId));
      if (!pet) return res.status(404).json({ message: "Önce bir sanal hayvan sahiplen!" });

      const today = new Date().toISOString().split("T")[0];
      if (pet.lastFeedDate === today) {
        return res.status(400).json({ message: "Bugün zaten besledin! Yarın tekrar gel.", pet });
      }

      const settingsResult = await sharedPool.query("SELECT key, value FROM app_settings WHERE key IN ('pet_base_points', 'pet_streak_divisor', 'pet_max_points', 'pet_base_exp', 'pet_streak_exp_bonus')");
      const s: Record<string, number> = {};
      for (const row of settingsResult.rows) s[row.key] = Number(row.value);
      const basePoints = s.pet_base_points ?? 1;
      const streakDiv = s.pet_streak_divisor ?? 3;
      const maxPoints = s.pet_max_points ?? 5;
      const baseExp = s.pet_base_exp ?? 10;
      const streakExpBonus = s.pet_streak_exp_bonus ?? 2;

      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      const newStreak = pet.lastFeedDate === yesterday ? pet.streak + 1 : 1;
      const feedPoints = Math.min(basePoints + Math.floor(newStreak / Math.max(streakDiv, 1)), maxPoints);
      const newExp = pet.experience + baseExp + (newStreak * streakExpBonus);
      const newLevel = Math.floor(newExp / 100) + 1;

      const [updated] = await db.update(virtualPets)
        .set({
          lastFeedDate: today,
          streak: newStreak,
          totalFeedings: pet.totalFeedings + 1,
          experience: newExp,
          level: newLevel,
          earnedPoints: pet.earnedPoints + feedPoints,
        })
        .where(eq(virtualPets.id, pet.id))
        .returning();

      const customer = await storage.getCustomer(customerId);
      if (customer) {
        await storage.addLoyaltyPoints({
          customerId,
          amount: feedPoints,
          type: "earned",
          description: `Sanal pet besleme (Gün ${newStreak})`,
        });
      }

      res.json({ pet: updated, pointsEarned: feedPoints, message: `+${feedPoints} Para Puan kazandın!` });
    } catch (e) {
      res.status(500).json({ message: "Besleme sırasında bir hata oluştu" });
    }
  });

  app.get("/api/firsat-urunleri", async (_req, res) => {
    const allProducts = await storage.getAllProducts();
    const now = new Date();
    const threeMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
    const firsatProducts = allProducts.filter(p => {
      if (!p.skt || !p.isActive || p.stock <= 0) return false;
      const sktDate = parseSkt(p.skt);
      if (!sktDate) return false;
      return sktDate > now && sktDate <= threeMonthsLater;
    });
    res.json(firsatProducts);
  });

  app.get("/api/skt-alerts", requireAdmin, async (_req, res) => {
    const allProducts = await storage.getAllProducts();
    const now = new Date();
    const threeMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
    const expired: any[] = [];
    const expiringSoon: any[] = [];
    for (const p of allProducts) {
      if (!p.skt || !p.isActive) continue;
      const sktDate = parseSkt(p.skt);
      if (!sktDate) continue;
      if (sktDate < now) {
        expired.push({ ...p, sktDate: sktDate.toISOString(), status: "expired" });
      } else if (sktDate <= threeMonthsLater) {
        expiringSoon.push({ ...p, sktDate: sktDate.toISOString(), status: "expiring" });
      }
    }
    res.json({ expired, expiringSoon });
  });

  app.get("/api/admin/product-by-barcode/:barcode", requireAdmin, async (req, res) => {
    const barcode = req.params.barcode;
    const result = await sharedPool.query("SELECT * FROM products WHERE barcode = $1 LIMIT 1", [barcode]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Barkod bulunamadı" });
    res.json(result.rows[0]);
  });

  app.patch("/api/admin/product-quick-update/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Geçersiz ürün ID" });
    const { stock, skt, barcode } = req.body;
    if (stock !== undefined && (typeof stock !== "number" || stock < 0 || stock > 99999)) return res.status(400).json({ message: "Geçersiz stok değeri" });
    if (skt !== undefined && typeof skt !== "string") return res.status(400).json({ message: "Geçersiz SKT" });
    if (barcode !== undefined && typeof barcode !== "string") return res.status(400).json({ message: "Geçersiz barkod" });
    if (skt && skt.length > 20) return res.status(400).json({ message: "SKT çok uzun" });
    if (barcode && barcode.length > 50) return res.status(400).json({ message: "Barkod çok uzun" });
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;
    if (stock !== undefined) { updates.push(`stock = $${idx++}`); values.push(stock); }
    if (skt !== undefined) { updates.push(`skt = $${idx++}`); values.push(skt); }
    if (barcode !== undefined) { updates.push(`barcode = $${idx++}`); values.push(barcode); }
    if (updates.length === 0) return res.status(400).json({ message: "Güncellenecek alan yok" });
    values.push(id);
    await sharedPool.query(`UPDATE products SET ${updates.join(", ")} WHERE id = $${idx}`, values);
    const result = await sharedPool.query("SELECT * FROM products WHERE id = $1", [id]);
    res.json(result.rows[0]);
  });

  app.get("/api/customer/pet-profiles", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const result = await sharedPool.query("SELECT * FROM pet_profiles WHERE customer_id = $1 ORDER BY created_at", [customerId]);
    res.json(result.rows);
  });

  app.post("/api/customer/pet-profiles", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const ip = req.ip || "unknown";
    if (rateLimit(`petprof:${ip}`, 10, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
    }
    const { name, type, breed, birthday, weight, photoData, notes } = req.body;
    if (!name || !type) return res.status(400).json({ message: "İsim ve tür gerekli" });
    if (typeof name !== "string" || name.length > 50) return res.status(400).json({ message: "İsim çok uzun" });
    if (typeof type !== "string" || type.length > 30) return res.status(400).json({ message: "Geçersiz tür" });
    if (breed && (typeof breed !== "string" || breed.length > 100)) return res.status(400).json({ message: "Cins adı çok uzun" });
    if (notes && (typeof notes !== "string" || notes.length > 500)) return res.status(400).json({ message: "Not çok uzun" });
    if (photoData && (typeof photoData !== "string" || photoData.length > 4 * 1024 * 1024)) return res.status(400).json({ message: "Fotoğraf çok büyük (max 3MB)" });
    const result = await sharedPool.query(
      "INSERT INTO pet_profiles (customer_id, name, type, breed, birthday, weight, photo_data, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
      [customerId, name, type, breed || null, birthday || null, weight || null, photoData || null, notes || null]
    );
    res.json(result.rows[0]);
  });

  app.patch("/api/customer/pet-profiles/:id", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const ip = req.ip || "unknown";
    if (rateLimit(`petprofup:${ip}`, 15, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
    }
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Geçersiz ID" });
    const { name, breed, birthday, weight, photoData, notes, favoriteFoodId } = req.body;
    if (name && (typeof name !== "string" || name.length > 50)) return res.status(400).json({ message: "İsim çok uzun" });
    if (breed && (typeof breed !== "string" || breed.length > 100)) return res.status(400).json({ message: "Cins çok uzun" });
    if (notes && (typeof notes !== "string" || notes.length > 500)) return res.status(400).json({ message: "Not çok uzun" });
    if (photoData && (typeof photoData !== "string" || photoData.length > 4 * 1024 * 1024)) return res.status(400).json({ message: "Fotoğraf çok büyük" });
    await sharedPool.query(
      "UPDATE pet_profiles SET name=COALESCE($1,name), breed=COALESCE($2,breed), birthday=COALESCE($3,birthday), weight=COALESCE($4,weight), photo_data=COALESCE($5,photo_data), notes=COALESCE($6,notes), favorite_food_id=COALESCE($7,favorite_food_id) WHERE id=$8 AND customer_id=$9",
      [name, breed, birthday, weight, photoData, notes, favoriteFoodId, id, customerId]
    );
    const result = await sharedPool.query("SELECT * FROM pet_profiles WHERE id=$1 AND customer_id=$2", [id, customerId]);
    res.json(result.rows[0]);
  });

  app.delete("/api/customer/pet-profiles/:id", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const id = parseInt(req.params.id);
    await sharedPool.query("DELETE FROM pet_photos WHERE pet_profile_id=$1", [id]);
    await sharedPool.query("DELETE FROM pet_weight_log WHERE pet_profile_id=$1", [id]);
    await sharedPool.query("DELETE FROM pet_health_records WHERE pet_profile_id=$1", [id]);
    await sharedPool.query("DELETE FROM pet_profiles WHERE id=$1 AND customer_id=$2", [id, customerId]);
    res.json({ success: true });
  });

  app.get("/api/customer/pet-profiles/:id/health", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const id = parseInt(req.params.id);
    const pet = await sharedPool.query("SELECT id FROM pet_profiles WHERE id=$1 AND customer_id=$2", [id, customerId]);
    if (pet.rows.length === 0) return res.status(404).json({ message: "Pet bulunamadı" });
    const result = await sharedPool.query("SELECT * FROM pet_health_records WHERE pet_profile_id=$1 ORDER BY date DESC", [id]);
    res.json(result.rows);
  });

  async function verifyPetOwnership(petId: number, customerId: number): Promise<boolean> {
    const pet = await sharedPool.query("SELECT id FROM pet_profiles WHERE id=$1 AND customer_id=$2", [petId, customerId]);
    return pet.rows.length > 0;
  }

  app.post("/api/customer/pet-profiles/:id/health", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const ip = req.ip || "unknown";
    if (rateLimit(`pethealth:${ip}`, 20, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
    }
    const petId = parseInt(req.params.id);
    if (!(await verifyPetOwnership(petId, customerId))) return res.status(403).json({ message: "Erişim reddedildi" });
    const { recordType, title, date, notes, nextDate } = req.body;
    if (!recordType || !title || !date) return res.status(400).json({ message: "Tür, başlık ve tarih gerekli" });
    if (typeof title !== "string" || title.length > 200) return res.status(400).json({ message: "Başlık çok uzun" });
    if (notes && (typeof notes !== "string" || notes.length > 500)) return res.status(400).json({ message: "Not çok uzun" });
    const result = await sharedPool.query(
      "INSERT INTO pet_health_records (pet_profile_id, record_type, title, date, notes, next_date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [petId, recordType, title, date, notes || null, nextDate || null]
    );
    res.json(result.rows[0]);
  });

  app.delete("/api/customer/pet-health/:id", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const recordId = parseInt(req.params.id);
    const check = await sharedPool.query(
      "SELECT phr.id FROM pet_health_records phr JOIN pet_profiles pp ON pp.id = phr.pet_profile_id WHERE phr.id=$1 AND pp.customer_id=$2",
      [recordId, customerId]
    );
    if (check.rows.length === 0) return res.status(403).json({ message: "Erişim reddedildi" });
    await sharedPool.query("DELETE FROM pet_health_records WHERE id=$1", [recordId]);
    res.json({ success: true });
  });

  app.get("/api/customer/pet-profiles/:id/weight", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const petId = parseInt(req.params.id);
    if (!(await verifyPetOwnership(petId, customerId))) return res.status(403).json({ message: "Erişim reddedildi" });
    const result = await sharedPool.query("SELECT * FROM pet_weight_log WHERE pet_profile_id=$1 ORDER BY date DESC", [petId]);
    res.json(result.rows);
  });

  app.post("/api/customer/pet-profiles/:id/weight", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const ip = req.ip || "unknown";
    if (rateLimit(`petweight:${ip}`, 20, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
    }
    const petId = parseInt(req.params.id);
    if (!(await verifyPetOwnership(petId, customerId))) return res.status(403).json({ message: "Erişim reddedildi" });
    const { weight, date } = req.body;
    if (!weight || !date) return res.status(400).json({ message: "Kilo ve tarih gerekli" });
    if (typeof weight !== "number" || weight <= 0 || weight > 200) return res.status(400).json({ message: "Geçersiz kilo değeri" });
    const result = await sharedPool.query(
      "INSERT INTO pet_weight_log (pet_profile_id, weight, date) VALUES ($1,$2,$3) RETURNING *",
      [petId, weight, date]
    );
    res.json(result.rows[0]);
  });

  app.get("/api/customer/pet-profiles/:id/photos", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const petId = parseInt(req.params.id);
    if (!(await verifyPetOwnership(petId, customerId))) return res.status(403).json({ message: "Erişim reddedildi" });
    const result = await sharedPool.query("SELECT * FROM pet_photos WHERE pet_profile_id=$1 ORDER BY created_at DESC", [petId]);
    res.json(result.rows);
  });

  app.post("/api/customer/pet-profiles/:id/photos", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const ip = req.ip || "unknown";
    if (rateLimit(`petphoto:${ip}`, 20, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla fotoğraf yükleme. Lütfen daha sonra tekrar deneyin." });
    }
    const petId = parseInt(req.params.id);
    if (!(await verifyPetOwnership(petId, customerId))) return res.status(403).json({ message: "Erişim reddedildi" });
    const { photoData, caption } = req.body;
    if (!photoData) return res.status(400).json({ message: "Fotoğraf gerekli" });
    if (caption && (typeof caption !== "string" || caption.length > 200)) return res.status(400).json({ message: "Açıklama çok uzun" });
    if (photoData.length > 4 * 1024 * 1024) return res.status(400).json({ message: "Dosya çok büyük (maks 3MB)" });
    const result = await sharedPool.query(
      "INSERT INTO pet_photos (pet_profile_id, photo_data, caption) VALUES ($1,$2,$3) RETURNING *",
      [petId, photoData, caption || null]
    );
    res.json(result.rows[0]);
  });

  app.delete("/api/customer/pet-photos/:id", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const photoId = parseInt(req.params.id);
    const check = await sharedPool.query(
      "SELECT pp2.id FROM pet_photos pp2 JOIN pet_profiles pp ON pp.id = pp2.pet_profile_id WHERE pp2.id=$1 AND pp.customer_id=$2",
      [photoId, customerId]
    );
    if (check.rows.length === 0) return res.status(403).json({ message: "Erişim reddedildi" });
    await sharedPool.query("DELETE FROM pet_photos WHERE id=$1", [photoId]);
    res.json({ success: true });
  });

  app.get("/api/lost-found", async (_req, res) => {
    const result = await sharedPool.query("SELECT * FROM lost_found_posts WHERE is_resolved = false ORDER BY created_at DESC LIMIT 50");
    res.json(result.rows);
  });

  app.post("/api/lost-found", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const ip = req.ip || "unknown";
    if (rateLimit(`lostfound:${ip}`, 5, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla ilan. Lütfen daha sonra tekrar deneyin." });
    }
    const { postType, petName, petType, breed, color, lastSeenLocation, description, contactPhone, photoData } = req.body;
    if (!postType || !petName || !petType || !description || !contactPhone) {
      return res.status(400).json({ message: "Zorunlu alanları doldurun" });
    }
    if (!["lost", "found", "adoption"].includes(postType)) return res.status(400).json({ message: "Geçersiz ilan tipi" });
    if (typeof petName !== "string" || petName.length > 100) return res.status(400).json({ message: "Pet adı çok uzun" });
    if (typeof petType !== "string" || petType.length > 50) return res.status(400).json({ message: "Geçersiz pet türü" });
    if (typeof contactPhone !== "string" || contactPhone.length < 7 || contactPhone.length > 20) return res.status(400).json({ message: "Geçersiz telefon numarası" });
    if (breed && (typeof breed !== "string" || breed.length > 100)) return res.status(400).json({ message: "Cins bilgisi çok uzun" });
    if (color && (typeof color !== "string" || color.length > 50)) return res.status(400).json({ message: "Renk bilgisi çok uzun" });
    if (lastSeenLocation && (typeof lastSeenLocation !== "string" || lastSeenLocation.length > 200)) return res.status(400).json({ message: "Konum bilgisi çok uzun" });
    if (photoData && (typeof photoData !== "string" || photoData.length > 5 * 1024 * 1024)) {
      return res.status(400).json({ message: "Fotoğraf boyutu çok büyük (max 4MB)" });
    }
    if (typeof description !== "string" || description.length > 1000) {
      return res.status(400).json({ message: "Açıklama çok uzun" });
    }
    const customer = await sharedPool.query("SELECT name FROM customers WHERE id=$1", [customerId]);
    const result = await sharedPool.query(
      "INSERT INTO lost_found_posts (customer_id, post_type, pet_name, pet_type, breed, color, last_seen_location, description, contact_phone, photo_data, customer_name) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *",
      [customerId, postType, petName, petType, breed || null, color || null, lastSeenLocation || null, description, contactPhone, photoData || null, customer.rows[0]?.name || ""]
    );
    res.json(result.rows[0]);
  });

  app.patch("/api/lost-found/:id/resolve", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const ip = req.ip || "unknown";
    if (rateLimit(`lfresolve:${ip}`, 10, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek." });
    }
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Geçersiz ID" });
    await sharedPool.query("UPDATE lost_found_posts SET is_resolved = true WHERE id=$1 AND customer_id=$2", [id, customerId]);
    res.json({ success: true });
  });

  app.get("/api/customer/purchase-history", async (req, res) => {
    const customerId = (req.session as any)?.customerId;
    if (!customerId) return res.status(401).json({ message: "Giriş yapmalısınız" });
    const customer = await sharedPool.query("SELECT phone FROM customers WHERE id=$1", [customerId]);
    if (customer.rows.length === 0) return res.json([]);
    const orders = await sharedPool.query("SELECT items, created_at FROM orders WHERE customer_phone=$1 AND status != 'iptal' ORDER BY created_at DESC", [customer.rows[0].phone]);
    const purchasedProducts: Record<number, { name: string; lastDate: string; count: number }> = {};
    for (const order of orders.rows) {
      const items = order.items as any[];
      if (!items) continue;
      for (const item of items) {
        const pid = parseInt(String(item.productId));
        if (!purchasedProducts[pid]) {
          purchasedProducts[pid] = { name: item.name, lastDate: order.created_at, count: 0 };
        }
        purchasedProducts[pid].count += item.quantity || 1;
      }
    }
    res.json(Object.entries(purchasedProducts).map(([id, data]) => ({ productId: parseInt(id), ...data })));
  });

  app.post("/api/voice-order", async (req, res) => {
    const ip = req.ip || "unknown";
    if (rateLimit(`voiceorder:${ip}`, 3, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
    }
    const { name, phone, note } = req.body;
    if (!phone || typeof phone !== "string" || phone.length < 7 || phone.length > 20) return res.status(400).json({ message: "Telefon numarası gerekli" });
    if (name && typeof name === "string" && name.length > 100) return res.status(400).json({ message: "İsim çok uzun" });
    if (note && typeof note === "string" && note.length > 500) return res.status(400).json({ message: "Not çok uzun" });
    res.json({ message: "Sesli sipariş talebiniz alındı. En kısa sürede sizi arayacağız!" });
  });

  function getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const week = Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${String(week).padStart(2, "0")}`;
  }

  app.get("/api/pet-contest", async (_req, res) => {
    const currentWeek = getCurrentWeek();
    const entries = await db.select().from(petContestEntries)
      .where(eq(petContestEntries.weekNumber, currentWeek))
      .orderBy(desc(petContestEntries.votes));
    res.json({ week: currentWeek, entries: entries.map(e => ({ ...e, photoData: e.photoData.substring(0, 100) + "..." })) });
  });

  app.get("/api/pet-contest/photo/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const [entry] = await db.select().from(petContestEntries).where(eq(petContestEntries.id, id));
    if (!entry) return res.status(404).json({ message: "Bulunamadı" });
    const match = entry.photoData.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      res.setHeader("Content-Type", match[1]);
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.send(Buffer.from(match[2], "base64"));
    } else {
      res.status(400).json({ message: "Geçersiz fotoğraf" });
    }
  });

  app.get("/api/pet-contest/winner", async (_req, res) => {
    const currentWeek = getCurrentWeek();
    const now = new Date();
    const lastWeekDate = new Date(now.getTime() - 7 * 86400000);
    const lastStart = new Date(lastWeekDate.getFullYear(), 0, 1);
    const lastDiff = lastWeekDate.getTime() - lastStart.getTime();
    const lastWeekNum = Math.ceil((lastDiff / 86400000 + lastStart.getDay() + 1) / 7);
    const lastWeek = `${lastWeekDate.getFullYear()}-W${String(lastWeekNum).padStart(2, "0")}`;

    const winners = await db.select().from(petContestEntries)
      .where(and(eq(petContestEntries.weekNumber, lastWeek), eq(petContestEntries.isWinner, true)));
    
    if (winners.length === 0) {
      const topEntries = await db.select().from(petContestEntries)
        .where(eq(petContestEntries.weekNumber, lastWeek))
        .orderBy(desc(petContestEntries.votes))
        .limit(1);
      if (topEntries.length > 0 && topEntries[0].votes > 0) {
        await db.update(petContestEntries)
          .set({ isWinner: true })
          .where(eq(petContestEntries.id, topEntries[0].id));
        return res.json({ winner: { ...topEntries[0], isWinner: true, photoData: undefined }, week: lastWeek });
      }
    }

    if (winners.length > 0) {
      return res.json({ winner: { ...winners[0], photoData: undefined }, week: lastWeek });
    }
    res.json({ winner: null, week: lastWeek });
  });

  app.post("/api/pet-contest", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const ip = req.ip || "unknown";
    if (rateLimit(`contest:${ip}`, 5, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." });
    }
    const { petName, petType, photo, description } = req.body;
    if (!petName || !photo) return res.status(400).json({ message: "Pet adı ve fotoğraf gerekli" });
    if (typeof photo !== "string" || photo.length > 5 * 1024 * 1024) return res.status(400).json({ message: "Fotoğraf boyutu çok büyük (max 4MB)" });
    if (typeof petName !== "string" || petName.length > 100) return res.status(400).json({ message: "Pet adı çok uzun" });
    if (description && typeof description === "string" && description.length > 500) return res.status(400).json({ message: "Açıklama çok uzun" });

    const currentWeek = getCurrentWeek();
    const existing = await db.select().from(petContestEntries)
      .where(and(eq(petContestEntries.customerId, customerId), eq(petContestEntries.weekNumber, currentWeek)));
    if (existing.length > 0) return res.status(400).json({ message: "Bu hafta zaten katıldınız!" });

    const customer = await storage.getCustomer(customerId);
    const [entry] = await db.insert(petContestEntries).values({
      customerId,
      petName,
      petType: petType || "kedi",
      photoData: photo,
      description: description || null,
      weekNumber: currentWeek,
      customerName: customer?.name || null,
    }).returning();

    res.json({ ...entry, photoData: undefined });
  });

  app.post("/api/pet-contest/:id/vote", async (req, res) => {
    const ip = req.ip || "unknown";
    if (rateLimit(`vote:${ip}`, 30, 60 * 60 * 1000)) {
      return res.status(429).json({ message: "Çok fazla oy. Lütfen daha sonra tekrar deneyin." });
    }
    const entryId = parseInt(req.params.id);
    const voterIp = req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown";
    const customerId = (req as any).session?.customerId || null;

    const currentWeek = getCurrentWeek();
    const [entry] = await db.select().from(petContestEntries).where(eq(petContestEntries.id, entryId));
    if (!entry || entry.weekNumber !== currentWeek) return res.status(400).json({ message: "Bu yarışma sona erdi" });

    const existingVotes = await db.select().from(petContestVotes)
      .where(and(eq(petContestVotes.entryId, entryId), eq(petContestVotes.voterIp, voterIp)));
    if (existingVotes.length > 0) return res.status(400).json({ message: "Bu pet için zaten oy verdiniz!" });

    await db.insert(petContestVotes).values({ entryId, voterIp, customerId });
    await db.update(petContestEntries)
      .set({ votes: sql`${petContestEntries.votes} + 1` })
      .where(eq(petContestEntries.id, entryId));

    res.json({ message: "Oyunuz kaydedildi!" });
  });

  return httpServer;
}
