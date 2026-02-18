import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
  type User, type InsertUser,
  type BrandCategory, type InsertBrandCategory,
  type Product, type InsertProduct,
  users, brandCategories, products,
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
    await db.delete(products).where(eq(products.id, id));
  }
}

export const storage = new DatabaseStorage();
