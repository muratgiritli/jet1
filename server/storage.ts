import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, desc, ilike, or } from "drizzle-orm";
import {
  type User, type InsertUser,
  type BrandCategory, type InsertBrandCategory,
  type Product, type InsertProduct,
  type CrossSellSection, type InsertCrossSellSection,
  type CrossSellItem, type InsertCrossSellItem,
  type Order, type InsertOrder,
  type BreedStat, type InsertBreedStat,
  type Review, type InsertReview,
  type StockAlert, type InsertStockAlert,
  users, brandCategories, products, crossSellSections, crossSellItems, orders, breedStats, reviews, stockAlerts,
} from "@shared/schema";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getAllBrandCategories(): Promise<BrandCategory[]>;
  getBrandCategory(id: number): Promise<BrandCategory | undefined>;
  getBrandCategoryBySlug(animal: string, subcategory: string, brandSlug: string): Promise<BrandCategory | undefined>;
  createBrandCategory(data: InsertBrandCategory): Promise<BrandCategory>;
  deleteBrandCategory(id: number): Promise<void>;

  getProductsByBrandCategory(brandCategoryId: number): Promise<Product[]>;
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(data: InsertProduct): Promise<Product>;
  updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;
  searchProducts(query: string): Promise<Product[]>;

  getAllCrossSellSections(): Promise<CrossSellSection[]>;
  getCrossSellSection(id: number): Promise<CrossSellSection | undefined>;
  createCrossSellSection(data: InsertCrossSellSection): Promise<CrossSellSection>;
  updateCrossSellSection(id: number, data: Partial<InsertCrossSellSection>): Promise<CrossSellSection | undefined>;
  deleteCrossSellSection(id: number): Promise<void>;

  getCrossSellItemsBySection(sectionId: number): Promise<CrossSellItem[]>;
  addCrossSellItem(data: InsertCrossSellItem): Promise<CrossSellItem>;
  removeCrossSellItem(id: number): Promise<void>;

  getAllOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(data: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  getOrdersByPhone(phone: string): Promise<Order[]>;

  getBreedStatsByProduct(productId: number): Promise<BreedStat[]>;
  createBreedStat(data: InsertBreedStat): Promise<BreedStat>;
  deleteBreedStat(id: number): Promise<void>;

  getReviewsByProduct(productId: number): Promise<Review[]>;
  createReview(data: InsertReview): Promise<Review>;
  deleteReview(id: number): Promise<void>;

  createStockAlert(data: InsertStockAlert): Promise<StockAlert>;
  getStockAlertsByProduct(productId: number): Promise<StockAlert[]>;
  getAllStockAlerts(): Promise<StockAlert[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllBrandCategories(): Promise<BrandCategory[]> {
    return db.select().from(brandCategories);
  }

  async getBrandCategory(id: number): Promise<BrandCategory | undefined> {
    const [cat] = await db.select().from(brandCategories).where(eq(brandCategories.id, id));
    return cat;
  }

  async getBrandCategoryBySlug(animal: string, subcategory: string, brandSlug: string): Promise<BrandCategory | undefined> {
    const all = await db.select().from(brandCategories);
    return all.find(c => c.animal === animal && c.subcategory === subcategory && c.brandSlug === brandSlug);
  }

  async createBrandCategory(data: InsertBrandCategory): Promise<BrandCategory> {
    const [cat] = await db.insert(brandCategories).values(data).returning();
    return cat;
  }

  async deleteBrandCategory(id: number): Promise<void> {
    await db.delete(products).where(eq(products.brandCategoryId, id));
    await db.delete(brandCategories).where(eq(brandCategories.id, id));
  }

  async getProductsByBrandCategory(brandCategoryId: number): Promise<Product[]> {
    return db.select().from(products).where(eq(products.brandCategoryId, brandCategoryId));
  }

  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(data: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(data).returning();
    return product;
  }

  async updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(crossSellItems).where(eq(crossSellItems.productId, id));
    await db.delete(products).where(eq(products.id, id));
  }

  async searchProducts(query: string): Promise<Product[]> {
    return db.select().from(products).where(
      ilike(products.name, `%${query}%`)
    );
  }

  async getAllCrossSellSections(): Promise<CrossSellSection[]> {
    return db.select().from(crossSellSections);
  }

  async getCrossSellSection(id: number): Promise<CrossSellSection | undefined> {
    const [section] = await db.select().from(crossSellSections).where(eq(crossSellSections.id, id));
    return section;
  }

  async createCrossSellSection(data: InsertCrossSellSection): Promise<CrossSellSection> {
    const [section] = await db.insert(crossSellSections).values(data).returning();
    return section;
  }

  async updateCrossSellSection(id: number, data: Partial<InsertCrossSellSection>): Promise<CrossSellSection | undefined> {
    const [section] = await db.update(crossSellSections).set(data).where(eq(crossSellSections.id, id)).returning();
    return section;
  }

  async deleteCrossSellSection(id: number): Promise<void> {
    await db.delete(crossSellItems).where(eq(crossSellItems.sectionId, id));
    await db.delete(crossSellSections).where(eq(crossSellSections.id, id));
  }

  async getCrossSellItemsBySection(sectionId: number): Promise<CrossSellItem[]> {
    return db.select().from(crossSellItems).where(eq(crossSellItems.sectionId, sectionId));
  }

  async addCrossSellItem(data: InsertCrossSellItem): Promise<CrossSellItem> {
    const [item] = await db.insert(crossSellItems).values(data).returning();
    return item;
  }

  async removeCrossSellItem(id: number): Promise<void> {
    await db.delete(crossSellItems).where(eq(crossSellItems.id, id));
  }

  async getAllOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(data: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(data).returning();
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [order] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return order;
  }

  async getOrdersByPhone(phone: string): Promise<Order[]> {
    const normalized = phone.replace(/\D/g, "");
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    return allOrders.filter(o => o.customerPhone && o.customerPhone.replace(/\D/g, "").includes(normalized));
  }

  async getBreedStatsByProduct(productId: number): Promise<BreedStat[]> {
    return db.select().from(breedStats).where(eq(breedStats.productId, productId));
  }

  async createBreedStat(data: InsertBreedStat): Promise<BreedStat> {
    const [stat] = await db.insert(breedStats).values(data).returning();
    return stat;
  }

  async deleteBreedStat(id: number): Promise<void> {
    await db.delete(breedStats).where(eq(breedStats.id, id));
  }

  async getReviewsByProduct(productId: number): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt));
  }

  async createReview(data: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(data).returning();
    return review;
  }

  async deleteReview(id: number): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, id));
  }

  async createStockAlert(data: InsertStockAlert): Promise<StockAlert> {
    const [alert] = await db.insert(stockAlerts).values(data).returning();
    return alert;
  }

  async getStockAlertsByProduct(productId: number): Promise<StockAlert[]> {
    return db.select().from(stockAlerts).where(eq(stockAlerts.productId, productId));
  }

  async getAllStockAlerts(): Promise<StockAlert[]> {
    return db.select().from(stockAlerts).orderBy(desc(stockAlerts.createdAt));
  }
}

export const storage = new DatabaseStorage();
