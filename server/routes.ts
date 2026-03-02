import type { Express, Request, Response, NextFunction } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { seedDatabase } from "./seed";
import { insertBrandCategorySchema, insertProductSchema, insertCrossSellSectionSchema, insertCrossSellItemSchema, insertOrderSchema, orderItemSchema, insertBreedStatSchema, insertStockAlertSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import session from "express-session";
import pgSession from "connect-pg-simple";
import pg from "pg";
import { downloadAndConvertImage, migrateAllImages } from "./image-service";

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
        pool: new pg.Pool({ connectionString: process.env.DATABASE_URL }),
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "jetgo-fallback-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 30 * 24 * 60 * 60 * 1000 },
    })
  );

  await seedDatabase();
  await ensureAdminExists();

  app.get("/api/brand-categories", async (_req, res) => {
    const categories = await storage.getAllBrandCategories();
    res.json(categories);
  });

  app.get("/api/brand-categories/:id/products", async (req, res) => {
    const id = parseInt(req.params.id);
    const category = await storage.getBrandCategory(id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    const prods = await storage.getProductsByBrandCategory(id);
    const activeOnly = req.query.all !== "true";
    res.json({ category, products: activeOnly ? prods.filter(p => p.isActive) : prods });
  });

  const SUBCATEGORY_SLUG_MAP: Record<string, string> = {
    "kedi-odulu": "odul",
    "kedi-bakim-saglik": "bakim-saglik",
    "kedi-konserve": "kedi-konserve",
    "malt-macun": "malt-macun",
    "malt-vitamin": "malt-vitamin",
  };

  app.get("/api/brand-products/:animal/:subcategory/:brandSlug", async (req, res) => {
    const { animal, brandSlug } = req.params;
    const subcategory = SUBCATEGORY_SLUG_MAP[req.params.subcategory] || req.params.subcategory;
    const category = await storage.getBrandCategoryBySlug(animal, subcategory, brandSlug);
    if (!category) return res.status(404).json({ message: "Brand category not found" });
    const prods = await storage.getProductsByBrandCategory(category.id);
    res.json({ category, products: prods.filter(p => p.isActive) });
  });

  app.get("/sitemap.xml", async (req, res) => {
    try {
      const products = (await storage.getAllProducts()).filter(p => p.isActive);
      const categories = await storage.getAllBrandCategories();
      const baseUrl = "https://jet55.app";
      const today = new Date().toISOString().split("T")[0];

      const staticPages = [
        { loc: "/", priority: "1.0", changefreq: "daily" },
        { loc: "/kategori", priority: "0.8", changefreq: "weekly" },
        { loc: "/kategori/kopek", priority: "0.8", changefreq: "weekly" },
        { loc: "/kategori/kedi", priority: "0.8", changefreq: "weekly" },
        { loc: "/kategori/kus", priority: "0.7", changefreq: "weekly" },
        { loc: "/kategori/kemirgen", priority: "0.7", changefreq: "weekly" },
        { loc: "/odeme", priority: "0.5", changefreq: "monthly" },
        { loc: "/giris", priority: "0.4", changefreq: "monthly" },
        { loc: "/siparis-takip", priority: "0.4", changefreq: "monthly" },
        { loc: "/favoriler", priority: "0.4", changefreq: "monthly" },
      ];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      for (const page of staticPages) {
        xml += `  <url>\n    <loc>${baseUrl}${page.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
      }

      for (const cat of categories) {
        xml += `  <url>\n    <loc>${baseUrl}/kategori/${cat.animal}/${cat.subcategory}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
        xml += `  <url>\n    <loc>${baseUrl}/siparis/${cat.animal}/${cat.subcategory}/${cat.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      }

      for (const product of products) {
        const slug = product.name.toLowerCase().replace(/[^a-z0-9ğüşıöç]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
        xml += `  <url>\n    <loc>${baseUrl}/urun/${product.id}/${slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
      }

      xml += `</urlset>`;
      res.set("Content-Type", "application/xml");
      res.send(xml);
    } catch (err) {
      res.status(500).send("Sitemap error");
    }
  });

  app.get("/robots.txt", (req, res) => {
    res.set("Content-Type", "text/plain");
    res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: https://jet55.app/sitemap.xml\n`);
  });

  app.get("/api/products", async (req, res) => {
    const allProducts = await storage.getAllProducts();
    const activeOnly = req.query.all !== "true";
    res.json(activeOnly ? allProducts.filter(p => p.isActive) : allProducts);
  });

  app.get("/api/products/search", async (req, res) => {
    const query = (req.query.q as string || "").trim();
    if (!query || query.length < 2) return res.json([]);
    const results = await storage.searchProducts(query);
    res.json(results.filter(p => p.isActive).slice(0, 20));
  });

  app.post("/api/admin/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }
    const user = await storage.getUserByUsername(username);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });
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
    const category = await storage.updateBrandCategory(id, req.body);
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
    if (product.img && !product.img.startsWith("/product-images/")) {
      const localPath = await downloadAndConvertImage(product.img, product.id);
      if (localPath) {
        const updated = await storage.updateProduct(product.id, { img: localPath });
        return res.status(201).json(updated);
      }
    }
    res.status(201).json(product);
  });

  app.patch("/api/admin/products/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (req.body.img && !req.body.img.startsWith("/product-images/")) {
      try {
        const localPath = await downloadAndConvertImage(req.body.img, id);
        if (localPath) {
          req.body.img = localPath;
        }
      } catch (err) {
        console.log(`[image] Download failed for product ${id}, keeping external URL`);
      }
    }
    const product = await storage.updateProduct(id, req.body);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
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
    const section = await storage.updateCrossSellSection(id, req.body);
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

  const createOrderSchema = z.object({
    items: z.array(orderItemSchema).min(1),
    subtotal: z.number(),
    shipping: z.number(),
    discount: z.number(),
    grandTotal: z.number(),
    paymentMethod: z.string(),
    customerNote: z.string().optional(),
    customerPhone: z.string().min(7, "Telefon numarası gerekli"),
    customerName: z.string().min(1, "Ad soyad gerekli"),
    customerAddress: z.string().optional(),
    usedPoints: z.number().optional(),
    installmentMonths: z.number().optional(),
    installmentRate: z.number().optional(),
    installmentMonthly: z.number().optional(),
    installmentTotal: z.number().optional(),
  });

  app.post("/api/orders", async (req, res) => {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    const { usedPoints, ...orderData } = parsed.data;

    const customerId = (req.session as any)?.customerId;
    let pointsToUse = 0;

    if (customerId && usedPoints && usedPoints > 0) {
      const balance = await storage.getCustomerPointsBalance(customerId);
      pointsToUse = Math.min(usedPoints, balance);
      const serverTotal = Math.max(0, orderData.subtotal - orderData.discount + orderData.shipping - pointsToUse);
      orderData.grandTotal = Math.round(serverTotal * 100) / 100;
    }

    for (const item of orderData.items) {
      const productId = parseInt(String(item.productId));
      if (!isNaN(productId)) {
        const ok = await storage.decrementStock(productId, item.quantity);
        if (!ok) {
          return res.status(400).json({ message: `Stok yetersiz: ${item.name}` });
        }
      }
    }

    const order = await storage.createOrder(orderData);

    if (customerId) {
      if (pointsToUse > 0) {
        await storage.addLoyaltyPoints({
          customerId,
          orderId: order.id,
          amount: -pointsToUse,
          type: "spent",
          description: `Sipariş #${order.id} - Para Puan kullanımı`,
        });
      }
      const earnedPoints = Math.round(parsed.data.subtotal * 0.05 * 100) / 100;
      if (earnedPoints > 0) {
        await storage.addLoyaltyPoints({
          customerId,
          orderId: order.id,
          amount: earnedPoints,
          type: "earned",
          description: `Sipariş #${order.id} - %5 Para Puan kazanımı`,
        });
      }
    }
    res.status(201).json(order);
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
    res.json(order);
  });

  app.post("/api/customer/register", async (req, res) => {
    const { phone, password, name, address } = req.body;
    if (!phone || !password || !name) {
      return res.status(400).json({ message: "Telefon, şifre ve ad soyad gerekli" });
    }
    const normalized = phone.replace(/\D/g, "");
    if (normalized.length < 10) {
      return res.status(400).json({ message: "Geçerli bir telefon numarası girin" });
    }
    if (password.length < 4) {
      return res.status(400).json({ message: "Şifre en az 4 karakter olmalı" });
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
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: "Telefon ve şifre gerekli" });
    }
    const normalized = phone.replace(/\D/g, "");
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
    res.json({ id: customer.id, phone: customer.phone, name: customer.name, address: customer.address, notifyStock: customer.notifyStock, notifyCampaign: customer.notifyCampaign });
  });

  app.patch("/api/customer/profile", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const { name, address } = req.body;
    const updateData: Record<string, string> = {};
    if (name) updateData.name = name.trim();
    if (address !== undefined) updateData.address = address.trim();
    const customer = await storage.updateCustomer(customerId, updateData);
    if (!customer) return res.status(404).json({ message: "Müşteri bulunamadı" });
    res.json({ id: customer.id, phone: customer.phone, name: customer.name, address: customer.address, notifyStock: customer.notifyStock, notifyCampaign: customer.notifyCampaign });
  });

  app.patch("/api/customer/password", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "Mevcut ve yeni şifre gerekli" });
    if (newPassword.length < 4) return res.status(400).json({ message: "Yeni şifre en az 4 karakter olmalı" });
    const customer = await storage.getCustomer(customerId);
    if (!customer) return res.status(404).json({ message: "Müşteri bulunamadı" });
    const valid = await bcrypt.compare(currentPassword, customer.password);
    if (!valid) return res.status(400).json({ message: "Mevcut şifre hatalı" });
    const hashed = await bcrypt.hash(newPassword, 10);
    await storage.updateCustomer(customerId, { password: hashed });
    res.json({ message: "Şifre başarıyla değiştirildi" });
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
    res.json(customerOrders.map(o => ({
      id: o.id, items: o.items, subtotal: o.subtotal, shipping: o.shipping, discount: o.discount,
      grandTotal: o.grandTotal, status: o.status, paymentMethod: o.paymentMethod, createdAt: o.createdAt,
      customerNote: o.customerNote,
    })));
  });

  app.get("/api/customer/favorites", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
    const favoriteIds = await storage.getCustomerFavoriteIds(customerId);
    res.json(favoriteIds);
  });

  app.post("/api/customer/favorites", requireCustomer, async (req, res) => {
    const customerId = (req as any).customerId;
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
    const { productIds } = req.body;
    if (Array.isArray(productIds)) {
      for (const pid of productIds) {
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
    const schema = z.object({ label: z.string().min(1), address: z.string().min(1), isDefault: z.boolean().optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Geçersiz veri" });
    if (parsed.data.isDefault) {
      await storage.setDefaultAddress(-1, customerId);
    }
    const addr = await storage.createCustomerAddress({ customerId, label: parsed.data.label, address: parsed.data.address, isDefault: parsed.data.isDefault || false });
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
    const schema = z.object({ name: z.string().min(1), type: z.string().min(1), breed: z.string().optional(), age: z.number().optional(), weight: z.number().optional() });
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
    const schema = z.object({
      productId: z.number(),
      customerName: z.string().min(1),
      phone: z.string().min(7),
      productName: z.string(),
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

  app.post("/api/admin/migrate-images", requireAdmin, async (req, res) => {
    res.json({ message: "Image migration started in background" });
    migrateAllImages().then(result => {
      console.log(`[image] Migration finished:`, result);
    }).catch(err => {
      console.error(`[image] Migration error:`, err);
    });
  });

  return httpServer;
}
