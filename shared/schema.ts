import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, serial, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const brandCategories = pgTable("brand_categories", {
  id: serial("id").primaryKey(),
  brandName: text("brand_name").notNull(),
  brandSlug: text("brand_slug").notNull(),
  animal: text("animal").notNull(),
  subcategory: text("subcategory").notNull(),
});

export const insertBrandCategorySchema = createInsertSchema(brandCategories).omit({ id: true });
export type InsertBrandCategory = z.infer<typeof insertBrandCategorySchema>;
export type BrandCategory = typeof brandCategories.$inferSelect;

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: real("price").notNull(),
  originalPrice: real("original_price"),
  skt: text("skt"),
  img: text("img"),
  brandCategoryId: integer("brand_category_id").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  stock: integer("stock").notNull().default(10),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export const crossSellSections = pgTable("cross_sell_sections", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  forProductId: integer("for_product_id"),
  forAnimal: text("for_animal"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertCrossSellSectionSchema = createInsertSchema(crossSellSections).omit({ id: true });
export type InsertCrossSellSection = z.infer<typeof insertCrossSellSectionSchema>;
export type CrossSellSection = typeof crossSellSections.$inferSelect;

export const crossSellItems = pgTable("cross_sell_items", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id").notNull(),
  productId: integer("product_id").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertCrossSellItemSchema = createInsertSchema(crossSellItems).omit({ id: true });
export type InsertCrossSellItem = z.infer<typeof insertCrossSellItemSchema>;
export type CrossSellItem = typeof crossSellItems.$inferSelect;

export const orderItemSchema = z.object({
  productId: z.union([z.number(), z.string()]),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  img: z.string().optional(),
});

export type OrderItem = z.infer<typeof orderItemSchema>;

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  items: jsonb("items").notNull().$type<OrderItem[]>(),
  subtotal: real("subtotal").notNull(),
  shipping: real("shipping").notNull(),
  discount: real("discount").notNull().default(0),
  grandTotal: real("grand_total").notNull(),
  paymentMethod: text("payment_method").notNull(),
  status: text("status").notNull().default("yeni"),
  customerNote: text("customer_note"),
  customerPhone: text("customer_phone"),
  customerName: text("customer_name"),
  customerAddress: text("customer_address"),
  installmentMonths: integer("installment_months"),
  installmentRate: real("installment_rate"),
  installmentMonthly: real("installment_monthly"),
  installmentTotal: real("installment_total"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, status: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export const breedStats = pgTable("breed_stats", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  breedName: text("breed_name").notNull(),
  percentage: integer("percentage").notNull(),
  color: text("color").notNull().default("#e65100"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertBreedStatSchema = createInsertSchema(breedStats).omit({ id: true });
export type InsertBreedStat = z.infer<typeof insertBreedStatSchema>;
export type BreedStat = typeof breedStats.$inferSelect;

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  authorName: text("author_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true, isApproved: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export const stockAlerts = pgTable("stock_alerts", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  productName: text("product_name").notNull(),
  isNotified: boolean("is_notified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStockAlertSchema = createInsertSchema(stockAlerts).omit({ id: true, createdAt: true, isNotified: true });
export type InsertStockAlert = z.infer<typeof insertStockAlertSchema>;
export type StockAlert = typeof stockAlerts.$inferSelect;

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  address: text("address"),
  notifyStock: boolean("notify_stock").notNull().default(true),
  notifyCampaign: boolean("notify_campaign").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

export const customerFavorites = pgTable("customer_favorites", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  productId: integer("product_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCustomerFavoriteSchema = createInsertSchema(customerFavorites).omit({ id: true, createdAt: true });
export type InsertCustomerFavorite = z.infer<typeof insertCustomerFavoriteSchema>;
export type CustomerFavorite = typeof customerFavorites.$inferSelect;

export const customerAddresses = pgTable("customer_addresses", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  label: text("label").notNull(),
  address: text("address").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
});

export const insertCustomerAddressSchema = createInsertSchema(customerAddresses).omit({ id: true });
export type InsertCustomerAddress = z.infer<typeof insertCustomerAddressSchema>;
export type CustomerAddress = typeof customerAddresses.$inferSelect;

export const petProfiles = pgTable("pet_profiles", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  breed: text("breed"),
  age: integer("age"),
  weight: real("weight"),
});

export const insertPetProfileSchema = createInsertSchema(petProfiles).omit({ id: true });
export type InsertPetProfile = z.infer<typeof insertPetProfileSchema>;
export type PetProfile = typeof petProfiles.$inferSelect;

export const installmentRates = pgTable("installment_rates", {
  id: serial("id").primaryKey(),
  months: integer("months").notNull(),
  rate: real("rate").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertInstallmentRateSchema = createInsertSchema(installmentRates).omit({ id: true });
export type InsertInstallmentRate = z.infer<typeof insertInstallmentRateSchema>;
export type InstallmentRate = typeof installmentRates.$inferSelect;

export const loyaltyPoints = pgTable("loyalty_points", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  orderId: integer("order_id"),
  amount: real("amount").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLoyaltyPointSchema = createInsertSchema(loyaltyPoints).omit({ id: true, createdAt: true });
export type InsertLoyaltyPoint = z.infer<typeof insertLoyaltyPointSchema>;
export type LoyaltyPoint = typeof loyaltyPoints.$inferSelect;

export const reorderReminders = pgTable("reorder_reminders", {
  id: serial("id").primaryKey(),
  customerPhone: text("customer_phone").notNull(),
  customerName: text("customer_name"),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  animalType: text("animal_type").notNull(),
  dailyGrams: real("daily_grams").notNull(),
  packageGrams: real("package_grams").notNull(),
  estimatedDays: integer("estimated_days").notNull(),
  reorderDate: timestamp("reorder_date").notNull(),
  status: text("status").notNull().default("pending"),
  notifiedAt: timestamp("notified_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReorderReminderSchema = createInsertSchema(reorderReminders).omit({ id: true, createdAt: true, notifiedAt: true });
export type InsertReorderReminder = z.infer<typeof insertReorderReminderSchema>;
export type ReorderReminder = typeof reorderReminders.$inferSelect;
