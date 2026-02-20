import type { Express, Request, Response, NextFunction } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { seedDatabase } from "./seed";
import { insertBrandCategorySchema, insertProductSchema, insertCrossSellSectionSchema, insertCrossSellItemSchema, insertOrderSchema, orderItemSchema, insertBreedStatSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import session from "express-session";
import pgSession from "connect-pg-simple";
import pg from "pg";

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
      cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
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

  app.get("/api/brand-products/:animal/:subcategory/:brandSlug", async (req, res) => {
    const { animal, subcategory, brandSlug } = req.params;
    const category = await storage.getBrandCategoryBySlug(animal, subcategory, brandSlug);
    if (!category) return res.status(404).json({ message: "Brand category not found" });
    const prods = await storage.getProductsByBrandCategory(category.id);
    res.json({ category, products: prods.filter(p => p.isActive) });
  });

  app.get("/api/products", async (req, res) => {
    const allProducts = await storage.getAllProducts();
    const activeOnly = req.query.all !== "true";
    res.json(activeOnly ? allProducts.filter(p => p.isActive) : allProducts);
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

  app.delete("/api/admin/brand-categories/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteBrandCategory(id);
    res.json({ message: "Deleted" });
  });

  app.post("/api/admin/products", requireAdmin, async (req, res) => {
    const parsed = insertProductSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    const product = await storage.createProduct(parsed.data);
    res.status(201).json(product);
  });

  app.patch("/api/admin/products/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const product = await storage.updateProduct(id, req.body);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteProduct(id);
    res.json({ message: "Deleted" });
  });

  app.get("/api/product-detail/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const product = await storage.getProduct(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const category = await storage.getBrandCategory(product.brandCategoryId);
    const allSections = await storage.getAllCrossSellSections();
    const activeSections = allSections.filter(s => s.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
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

  // Order routes
  const createOrderSchema = z.object({
    items: z.array(orderItemSchema).min(1),
    subtotal: z.number(),
    shipping: z.number(),
    discount: z.number(),
    grandTotal: z.number(),
    paymentMethod: z.string(),
    customerNote: z.string().optional(),
  });

  app.post("/api/orders", async (req, res) => {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    const order = await storage.createOrder(parsed.data);
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

  return httpServer;
}
