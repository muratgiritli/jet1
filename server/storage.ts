import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, desc, ilike, or, and, gte, sql, inArray } from "drizzle-orm";
import {
  type User, type InsertUser,
  type Subcategory, type InsertSubcategory,
  type BrandCategory, type InsertBrandCategory,
  type Product, type InsertProduct,
  type CrossSellSection, type InsertCrossSellSection,
  type CrossSellItem, type InsertCrossSellItem,
  type Order, type InsertOrder,
  type BreedStat, type InsertBreedStat,
  type StockAlert, type InsertStockAlert,
  type InstallmentRate, type InsertInstallmentRate,
  type Customer, type InsertCustomer,
  type CustomerFavorite, type InsertCustomerFavorite,
  type CustomerAddress, type InsertCustomerAddress,
  type PetProfile, type InsertPetProfile,
  type LoyaltyPoint, type InsertLoyaltyPoint,
  type ReorderReminder, type InsertReorderReminder,
  type DeliveryNeighborhood, type InsertDeliveryNeighborhood,
  type Banner, type InsertBanner,
  type Subscription, type InsertSubscription,
  type Coupon, type InsertCoupon,
  users, subcategories, brandCategories, products, crossSellSections, crossSellItems, orders, breedStats, stockAlerts, installmentRates, customers, customerFavorites, customerAddresses, petProfiles, loyaltyPoints, reorderReminders, deliveryNeighborhoods, banners, coupons, contactMessages, subscriptions,
  type ContactMessage, type InsertContactMessage,
} from "@shared/schema";

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  keepAlive: true,
  allowExitOnIdle: false,
});

pool.on("error", (err) => {
  console.error("[pg pool error - keeping process alive]", err.message);
});

export const db = drizzle(pool);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getAllSubcategories(): Promise<Subcategory[]>;
  getSubcategoriesByAnimal(animal: string): Promise<Subcategory[]>;
  createSubcategory(data: InsertSubcategory): Promise<Subcategory>;
  updateSubcategory(id: number, data: Partial<InsertSubcategory>): Promise<Subcategory | undefined>;
  deleteSubcategory(id: number): Promise<void>;

  getAllBrandCategories(): Promise<BrandCategory[]>;
  getBrandCategory(id: number): Promise<BrandCategory | undefined>;
  getBrandCategoryBySlug(animal: string, subcategory: string, brandSlug: string): Promise<BrandCategory | undefined>;
  createBrandCategory(data: InsertBrandCategory): Promise<BrandCategory>;
  updateBrandCategory(id: number, data: Partial<InsertBrandCategory>): Promise<BrandCategory | undefined>;
  deleteBrandCategory(id: number): Promise<void>;

  getProductsByBrandCategory(brandCategoryId: number): Promise<Product[]>;
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByIds(ids: number[]): Promise<Product[]>;
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


  decrementStock(productId: number, quantity: number): Promise<boolean>;
  createStockAlert(data: InsertStockAlert): Promise<StockAlert>;
  getStockAlertsByProduct(productId: number): Promise<StockAlert[]>;
  getAllStockAlerts(): Promise<StockAlert[]>;
  getUnnotifiedStockAlerts(productId: number): Promise<StockAlert[]>;
  markStockAlertsNotified(productId: number): Promise<void>;

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

  getLoyaltyPointsByCustomer(customerId: number): Promise<LoyaltyPoint[]>;
  getCustomerPointsBalance(customerId: number): Promise<number>;
  addLoyaltyPoints(data: InsertLoyaltyPoint): Promise<LoyaltyPoint>;
  getAllCustomersWithPoints(): Promise<{ id: number; phone: string; name: string; balance: number }[]>;

  createReorderReminder(data: InsertReorderReminder): Promise<ReorderReminder>;
  getReorderReminders(): Promise<ReorderReminder[]>;
  updateReorderReminderStatus(id: number, status: string): Promise<ReorderReminder | undefined>;

  getAllDeliveryNeighborhoods(): Promise<DeliveryNeighborhood[]>;
  getActiveDeliveryNeighborhoods(): Promise<DeliveryNeighborhood[]>;
  createDeliveryNeighborhood(data: InsertDeliveryNeighborhood): Promise<DeliveryNeighborhood>;
  updateDeliveryNeighborhood(id: number, data: Partial<InsertDeliveryNeighborhood>): Promise<DeliveryNeighborhood | undefined>;
  deleteDeliveryNeighborhood(id: number): Promise<void>;

  getAllCustomers(): Promise<Customer[]>;

  getAllBanners(): Promise<Banner[]>;
  getActiveBanners(): Promise<Banner[]>;
  createBanner(data: InsertBanner): Promise<Banner>;
  updateBanner(id: number, data: Partial<InsertBanner>): Promise<Banner | undefined>;
  deleteBanner(id: number): Promise<void>;

  createSubscription(data: InsertSubscription): Promise<Subscription>;
  getAllSubscriptions(): Promise<Subscription[]>;
  updateSubscriptionStatus(id: number, status: string): Promise<void>;
  deleteSubscription(id: number): Promise<void>;

  getCouponByCode(code: string): Promise<Coupon | undefined>;
  getAllCoupons(): Promise<Coupon[]>;
  createCoupon(data: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: number, data: Partial<InsertCoupon>): Promise<Coupon | undefined>;
  deleteCoupon(id: number): Promise<void>;

  incrementCouponUsage(id: number): Promise<void>;

  createContactMessage(data: InsertContactMessage): Promise<ContactMessage>;
  getAllContactMessages(): Promise<ContactMessage[]>;
  getUnreadContactMessageCount(): Promise<number>;
  markContactMessageRead(id: number, isRead: boolean): Promise<ContactMessage | undefined>;
  deleteContactMessage(id: number): Promise<void>;

  deleteCustomerAccount(customerId: number): Promise<void>;
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

  async getAllSubcategories(): Promise<Subcategory[]> {
    return db.select().from(subcategories).orderBy(subcategories.sortOrder);
  }

  async getSubcategoriesByAnimal(animal: string): Promise<Subcategory[]> {
    return db.select().from(subcategories).where(eq(subcategories.animal, animal)).orderBy(subcategories.sortOrder);
  }

  async createSubcategory(data: InsertSubcategory): Promise<Subcategory> {
    const [sub] = await db.insert(subcategories).values(data).returning();
    return sub;
  }

  async updateSubcategory(id: number, data: Partial<InsertSubcategory>): Promise<Subcategory | undefined> {
    const [sub] = await db.update(subcategories).set(data).where(eq(subcategories.id, id)).returning();
    return sub;
  }

  async deleteSubcategory(id: number): Promise<void> {
    await db.delete(subcategories).where(eq(subcategories.id, id));
  }

  async getAllBrandCategories(): Promise<BrandCategory[]> {
    return db.select().from(brandCategories);
  }

  async getBrandCategory(id: number): Promise<BrandCategory | undefined> {
    const [cat] = await db.select().from(brandCategories).where(eq(brandCategories.id, id));
    return cat;
  }

  async getBrandCategoryBySlug(animal: string, subcategory: string, brandSlug: string): Promise<BrandCategory | undefined> {
    const [cat] = await db.select().from(brandCategories).where(
      and(
        eq(brandCategories.animal, animal),
        eq(brandCategories.subcategory, subcategory),
        eq(brandCategories.brandSlug, brandSlug)
      )
    );
    return cat;
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

  async getProductsByIds(ids: number[]): Promise<Product[]> {
    if (ids.length === 0) return [];
    return db.select().from(products).where(inArray(products.id, ids));
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
    return db.select().from(orders)
      .where(sql`regexp_replace(${orders.customerPhone}, '\\D', '', 'g') = ${normalized}`)
      .orderBy(desc(orders.createdAt));
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


  async decrementStock(productId: number, quantity: number): Promise<boolean> {
    const result = await db.update(products)
      .set({ stock: sql`${products.stock} - ${quantity}` })
      .where(and(eq(products.id, productId), gte(products.stock, quantity)))
      .returning();
    return result.length > 0;
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

  async getUnnotifiedStockAlerts(productId: number): Promise<StockAlert[]> {
    return db.select().from(stockAlerts).where(and(eq(stockAlerts.productId, productId), eq(stockAlerts.isNotified, false)));
  }

  async markStockAlertsNotified(productId: number): Promise<void> {
    await db.update(stockAlerts).set({ isNotified: true }).where(and(eq(stockAlerts.productId, productId), eq(stockAlerts.isNotified, false)));
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
    const [customer] = await db.select().from(customers).where(
      sql`regexp_replace(${customers.phone}, '\\D', '', 'g') = ${normalized}`
    );
    return customer;
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

  async getLoyaltyPointsByCustomer(customerId: number): Promise<LoyaltyPoint[]> {
    return db.select().from(loyaltyPoints).where(eq(loyaltyPoints.customerId, customerId)).orderBy(desc(loyaltyPoints.createdAt));
  }

  async getCustomerPointsBalance(customerId: number): Promise<number> {
    const [result] = await db.select({ total: sql<number>`coalesce(sum(${loyaltyPoints.amount}), 0)` })
      .from(loyaltyPoints).where(eq(loyaltyPoints.customerId, customerId));
    return Number(result?.total ?? 0);
  }

  async addLoyaltyPoints(data: InsertLoyaltyPoint): Promise<LoyaltyPoint> {
    const [point] = await db.insert(loyaltyPoints).values(data).returning();
    return point;
  }

  async getAllCustomersWithPoints(): Promise<{ id: number; phone: string; name: string; balance: number }[]> {
    const results = await db
      .select({
        id: customers.id,
        phone: customers.phone,
        name: customers.name,
        balance: sql<number>`coalesce(sum(${loyaltyPoints.amount}), 0)`,
      })
      .from(customers)
      .innerJoin(loyaltyPoints, eq(customers.id, loyaltyPoints.customerId))
      .groupBy(customers.id, customers.phone, customers.name)
      .having(sql`sum(${loyaltyPoints.amount}) != 0`)
      .orderBy(sql`sum(${loyaltyPoints.amount}) desc`);
    return results.map(r => ({ ...r, balance: Number(r.balance) }));
  }

  async createReorderReminder(data: InsertReorderReminder): Promise<ReorderReminder> {
    const [reminder] = await db.insert(reorderReminders).values(data).returning();
    return reminder;
  }

  async getReorderReminders(): Promise<ReorderReminder[]> {
    return db.select().from(reorderReminders).orderBy(reorderReminders.reorderDate);
  }

  async updateReorderReminderStatus(id: number, status: string): Promise<ReorderReminder | undefined> {
    const [updated] = await db.update(reorderReminders).set({ status, notifiedAt: status === "notified" ? new Date() : undefined }).where(eq(reorderReminders.id, id)).returning();
    return updated;
  }

  async getAllDeliveryNeighborhoods(): Promise<DeliveryNeighborhood[]> {
    return db.select().from(deliveryNeighborhoods).orderBy(deliveryNeighborhoods.sortOrder);
  }

  async getActiveDeliveryNeighborhoods(): Promise<DeliveryNeighborhood[]> {
    return db.select().from(deliveryNeighborhoods).where(eq(deliveryNeighborhoods.isActive, true)).orderBy(deliveryNeighborhoods.sortOrder);
  }

  async createDeliveryNeighborhood(data: InsertDeliveryNeighborhood): Promise<DeliveryNeighborhood> {
    const [nh] = await db.insert(deliveryNeighborhoods).values(data).returning();
    return nh;
  }

  async updateDeliveryNeighborhood(id: number, data: Partial<InsertDeliveryNeighborhood>): Promise<DeliveryNeighborhood | undefined> {
    const [updated] = await db.update(deliveryNeighborhoods).set(data).where(eq(deliveryNeighborhoods.id, id)).returning();
    return updated;
  }

  async deleteDeliveryNeighborhood(id: number): Promise<void> {
    await db.delete(deliveryNeighborhoods).where(eq(deliveryNeighborhoods.id, id));
  }

  async getAllCustomers(): Promise<Customer[]> {
    return db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getAllBanners(): Promise<Banner[]> {
    return db.select().from(banners).orderBy(banners.sortOrder);
  }

  async getActiveBanners(): Promise<Banner[]> {
    return db.select().from(banners).where(eq(banners.isActive, true)).orderBy(banners.sortOrder);
  }

  async createBanner(data: InsertBanner): Promise<Banner> {
    const [banner] = await db.insert(banners).values(data).returning();
    return banner;
  }

  async updateBanner(id: number, data: Partial<InsertBanner>): Promise<Banner | undefined> {
    const [updated] = await db.update(banners).set(data).where(eq(banners.id, id)).returning();
    return updated;
  }

  async deleteBanner(id: number): Promise<void> {
    await db.delete(banners).where(eq(banners.id, id));
  }

  async createSubscription(data: InsertSubscription): Promise<Subscription> {
    const [row] = await db.insert(subscriptions).values(data).returning();
    return row;
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    return db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));
  }

  async updateSubscriptionStatus(id: number, status: string): Promise<void> {
    await db.update(subscriptions).set({ status }).where(eq(subscriptions.id, id));
  }

  async deleteSubscription(id: number): Promise<void> {
    await db.delete(subscriptions).where(eq(subscriptions.id, id));
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase()));
    return coupon;
  }

  async getAllCoupons(): Promise<Coupon[]> {
    return db.select().from(coupons).orderBy(desc(coupons.createdAt));
  }

  async createCoupon(data: InsertCoupon): Promise<Coupon> {
    const [coupon] = await db.insert(coupons).values({ ...data, code: data.code.toUpperCase() }).returning();
    return coupon;
  }

  async updateCoupon(id: number, data: Partial<InsertCoupon>): Promise<Coupon | undefined> {
    if (data.code) data.code = data.code.toUpperCase();
    const [updated] = await db.update(coupons).set(data).where(eq(coupons.id, id)).returning();
    return updated;
  }

  async deleteCoupon(id: number): Promise<void> {
    await db.delete(coupons).where(eq(coupons.id, id));
  }

  async incrementCouponUsage(id: number): Promise<void> {
    await db.update(coupons).set({ usedCount: sql`${coupons.usedCount} + 1` }).where(eq(coupons.id, id));
  }

  async createContactMessage(data: InsertContactMessage): Promise<ContactMessage> {
    const [row] = await db.insert(contactMessages).values(data).returning();
    return row;
  }
  async getAllContactMessages(): Promise<ContactMessage[]> {
    return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }
  async getUnreadContactMessageCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` }).from(contactMessages).where(eq(contactMessages.isRead, false));
    return result[0]?.count ?? 0;
  }
  async markContactMessageRead(id: number, isRead: boolean): Promise<ContactMessage | undefined> {
    const [row] = await db.update(contactMessages).set({ isRead }).where(eq(contactMessages.id, id)).returning();
    return row;
  }
  async deleteContactMessage(id: number): Promise<void> {
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
  }

  async deleteCustomerAccount(customerId: number): Promise<void> {
    await db.delete(customerFavorites).where(eq(customerFavorites.customerId, customerId));
    await db.delete(customerAddresses).where(eq(customerAddresses.customerId, customerId));
    const petIds = await db.select({ id: petProfiles.id }).from(petProfiles).where(eq(petProfiles.customerId, customerId));
    if (petIds.length > 0) {
      const ids = petIds.map(p => p.id);
      await pool.query(`DELETE FROM pet_health_records WHERE pet_profile_id = ANY($1)`, [ids]);
      await pool.query(`DELETE FROM pet_weight_log WHERE pet_profile_id = ANY($1)`, [ids]);
      await pool.query(`DELETE FROM pet_photos WHERE pet_profile_id = ANY($1)`, [ids]);
    }
    await db.delete(petProfiles).where(eq(petProfiles.customerId, customerId));
    await db.delete(loyaltyPoints).where(eq(loyaltyPoints.customerId, customerId));
    const safeDel = async (sql: string) => { try { await pool.query(sql, [customerId]); } catch {} };
    await safeDel(`DELETE FROM virtual_pets WHERE customer_id = $1`);
    await safeDel(`DELETE FROM pet_contest_entries WHERE customer_id = $1`);
    await safeDel(`DELETE FROM pet_contest_votes WHERE customer_id = $1`);
    await safeDel(`DELETE FROM lost_found_posts WHERE customer_id = $1`);
    await safeDel(`DELETE FROM trusted_devices WHERE customer_id = $1`);
    await safeDel(`DELETE FROM coupons WHERE customer_id = $1`);
    await db.delete(customers).where(eq(customers.id, customerId));
  }
}

export const storage = new DatabaseStorage();
