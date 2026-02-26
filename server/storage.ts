import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, desc, ilike, or, and } from "drizzle-orm";
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
  type InstallmentRate, type InsertInstallmentRate,
  type Customer, type InsertCustomer,
  type CustomerFavorite, type InsertCustomerFavorite,
  type CustomerAddress, type InsertCustomerAddress,
  type PetProfile, type InsertPetProfile,
  users, brandCategories, products, crossSellSections, crossSellItems, orders, breedStats, reviews, stockAlerts, installmentRates, customers, customerFavorites, customerAddresses, petProfiles,
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
  updateBrandCategory(id: number, data: Partial<InsertBrandCategory>): Promise<BrandCategory | undefined>;
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
  getApprovedReviewsByProduct(productId: number): Promise<Review[]>;
  getAllReviews(): Promise<Review[]>;
  createReview(data: InsertReview): Promise<Review>;
  approveReview(id: number): Promise<Review | undefined>;
  deleteReview(id: number): Promise<void>;

  createStockAlert(data: InsertStockAlert): Promise<StockAlert>;
  getStockAlertsByProduct(productId: number): Promise<StockAlert[]>;
  getAllStockAlerts(): Promise<StockAlert[]>;

  getAllInstallmentRates(): Promise<InstallmentRate[]>;
  getActiveInstallmentRates(): Promise<InstallmentRate[]>;
  createInstallmentRate(data: InsertInstallmentRate): Promise<InstallmentRate>;
  updateInstallmentRate(id: number, data: Partial<InsertInstallmentRate>): Promise<InstallmentRate | undefined>;
  deleteInstallmentRate(id: number): Promise<void>;

  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(data: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, data: Partial<InsertCustomer>): Promise<Customer | undefined>;

  getCustomerFavorites(customerId: number): Promise<CustomerFavorite[]>;
  addCustomerFavorite(data: InsertCustomerFavorite): Promise<CustomerFavorite>;
  removeCustomerFavorite(customerId: number, productId: number): Promise<void>;
  getCustomerFavoriteIds(customerId: number): Promise<number[]>;

  getCustomerAddresses(customerId: number): Promise<CustomerAddress[]>;
  createCustomerAddress(data: InsertCustomerAddress): Promise<CustomerAddress>;
  updateCustomerAddress(id: number, customerId: number, data: Partial<InsertCustomerAddress>): Promise<CustomerAddress | undefined>;
  deleteCustomerAddress(id: number, customerId: number): Promise<void>;
  setDefaultAddress(id: number, customerId: number): Promise<void>;

  getPetProfiles(customerId: number): Promise<PetProfile[]>;
  createPetProfile(data: InsertPetProfile): Promise<PetProfile>;
  updatePetProfile(id: number, customerId: number, data: Partial<InsertPetProfile>): Promise<PetProfile | undefined>;
  deletePetProfile(id: number, customerId: number): Promise<void>;

  getOrdersByCustomerPhone(phone: string): Promise<Order[]>;
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

  async updateBrandCategory(id: number, data: Partial<InsertBrandCategory>): Promise<BrandCategory | undefined> {
    const [cat] = await db.update(brandCategories).set(data).where(eq(brandCategories.id, id)).returning();
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

  async getApprovedReviewsByProduct(productId: number): Promise<Review[]> {
    return db.select().from(reviews).where(and(eq(reviews.productId, productId), eq(reviews.isApproved, true))).orderBy(desc(reviews.createdAt));
  }

  async getAllReviews(): Promise<Review[]> {
    return db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }

  async createReview(data: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(data).returning();
    return review;
  }

  async approveReview(id: number): Promise<Review | undefined> {
    const [review] = await db.update(reviews).set({ isApproved: true }).where(eq(reviews.id, id)).returning();
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

  async getAllInstallmentRates(): Promise<InstallmentRate[]> {
    return db.select().from(installmentRates);
  }

  async getActiveInstallmentRates(): Promise<InstallmentRate[]> {
    return db.select().from(installmentRates).where(eq(installmentRates.isActive, true));
  }

  async createInstallmentRate(data: InsertInstallmentRate): Promise<InstallmentRate> {
    const [rate] = await db.insert(installmentRates).values(data).returning();
    return rate;
  }

  async updateInstallmentRate(id: number, data: Partial<InsertInstallmentRate>): Promise<InstallmentRate | undefined> {
    const [rate] = await db.update(installmentRates).set(data).where(eq(installmentRates.id, id)).returning();
    return rate;
  }

  async deleteInstallmentRate(id: number): Promise<void> {
    await db.delete(installmentRates).where(eq(installmentRates.id, id));
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const normalized = phone.replace(/\D/g, "");
    const all = await db.select().from(customers);
    return all.find(c => c.phone.replace(/\D/g, "") === normalized);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(data: InsertCustomer): Promise<Customer> {
    const [customer] = await db.insert(customers).values(data).returning();
    return customer;
  }

  async updateCustomer(id: number, data: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [customer] = await db.update(customers).set(data).where(eq(customers.id, id)).returning();
    return customer;
  }

  async getCustomerFavorites(customerId: number): Promise<CustomerFavorite[]> {
    return db.select().from(customerFavorites).where(eq(customerFavorites.customerId, customerId)).orderBy(desc(customerFavorites.createdAt));
  }

  async addCustomerFavorite(data: InsertCustomerFavorite): Promise<CustomerFavorite> {
    const existing = await db.select().from(customerFavorites).where(and(eq(customerFavorites.customerId, data.customerId), eq(customerFavorites.productId, data.productId)));
    if (existing.length > 0) return existing[0];
    const [fav] = await db.insert(customerFavorites).values(data).returning();
    return fav;
  }

  async removeCustomerFavorite(customerId: number, productId: number): Promise<void> {
    await db.delete(customerFavorites).where(and(eq(customerFavorites.customerId, customerId), eq(customerFavorites.productId, productId)));
  }

  async getCustomerFavoriteIds(customerId: number): Promise<number[]> {
    const favs = await db.select({ productId: customerFavorites.productId }).from(customerFavorites).where(eq(customerFavorites.customerId, customerId));
    return favs.map(f => f.productId);
  }

  async getCustomerAddresses(customerId: number): Promise<CustomerAddress[]> {
    return db.select().from(customerAddresses).where(eq(customerAddresses.customerId, customerId));
  }

  async createCustomerAddress(data: InsertCustomerAddress): Promise<CustomerAddress> {
    const [addr] = await db.insert(customerAddresses).values(data).returning();
    return addr;
  }

  async updateCustomerAddress(id: number, customerId: number, data: Partial<InsertCustomerAddress>): Promise<CustomerAddress | undefined> {
    const [addr] = await db.update(customerAddresses).set(data).where(and(eq(customerAddresses.id, id), eq(customerAddresses.customerId, customerId))).returning();
    return addr;
  }

  async deleteCustomerAddress(id: number, customerId: number): Promise<void> {
    await db.delete(customerAddresses).where(and(eq(customerAddresses.id, id), eq(customerAddresses.customerId, customerId)));
  }

  async setDefaultAddress(id: number, customerId: number): Promise<void> {
    await db.update(customerAddresses).set({ isDefault: false }).where(eq(customerAddresses.customerId, customerId));
    await db.update(customerAddresses).set({ isDefault: true }).where(and(eq(customerAddresses.id, id), eq(customerAddresses.customerId, customerId)));
  }

  async getPetProfiles(customerId: number): Promise<PetProfile[]> {
    return db.select().from(petProfiles).where(eq(petProfiles.customerId, customerId));
  }

  async createPetProfile(data: InsertPetProfile): Promise<PetProfile> {
    const [pet] = await db.insert(petProfiles).values(data).returning();
    return pet;
  }

  async updatePetProfile(id: number, customerId: number, data: Partial<InsertPetProfile>): Promise<PetProfile | undefined> {
    const [pet] = await db.update(petProfiles).set(data).where(and(eq(petProfiles.id, id), eq(petProfiles.customerId, customerId))).returning();
    return pet;
  }

  async deletePetProfile(id: number, customerId: number): Promise<void> {
    await db.delete(petProfiles).where(and(eq(petProfiles.id, id), eq(petProfiles.customerId, customerId)));
  }

  async getOrdersByCustomerPhone(phone: string): Promise<Order[]> {
    const normalized = phone.replace(/\D/g, "");
    return db.select().from(orders).where(eq(orders.customerPhone, normalized)).orderBy(desc(orders.createdAt));
  }
}

export const storage = new DatabaseStorage();
