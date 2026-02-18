import type { Express, Request, Response, NextFunction } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { seedDatabase } from "./seed";
import { insertBrandCategorySchema, insertProductSchema } from "@shared/schema";
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
    res.json({ category, products: prods });
  });

  app.get("/api/brand-products/:animal/:subcategory/:brandSlug", async (req, res) => {
    const { animal, subcategory, brandSlug } = req.params;
    const category = await storage.getBrandCategoryBySlug(animal, subcategory, brandSlug);
    if (!category) return res.status(404).json({ message: "Brand category not found" });
    const prods = await storage.getProductsByBrandCategory(category.id);
    res.json({ category, products: prods });
  });

  app.get("/api/products", async (_req, res) => {
    const allProducts = await storage.getAllProducts();
    res.json(allProducts);
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

  return httpServer;
}
