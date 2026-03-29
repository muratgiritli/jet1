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

export const subcategories = pgTable("subcategories", {
  id: serial("id").primaryKey(),
  animal: text("animal").notNull(),
  slug: text("slug").notNull(),
  displayName: text("display_name").notNull(),
  color: text("color").notNull().default("#607D8B"),
  hasBrands: boolean("has_brands").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertSubcategorySchema = createInsertSchema(subcategories).omit({ id: true });
export type InsertSubcategory = z.infer<typeof insertSubcategorySchema>;
export type Subcategory = typeof subcategories.$inferSelect;

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
  originalImg: text("original_img"),
  brandCategoryId: integer("brand_category_id").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  stock: integer("stock").notNull().default(10),
  barcode: text("barcode"),
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
  deliverySlot: text("delivery_slot"),
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
  email: text("email"),
  notifyStock: boolean("notify_stock").notNull().default(true),
  notifyCampaign: boolean("notify_campaign").notNull().default(true),
  isBlacklisted: boolean("is_blacklisted").notNull().default(false),
  blacklistReason: text("blacklist_reason"),
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
  neighborhoodId: integer("neighborhood_id"),
  district: text("district"),
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
  birthday: text("birthday"),
  photoData: text("photo_data"),
  favoriteFoodId: integer("favorite_food_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPetProfileSchema = createInsertSchema(petProfiles).omit({ id: true, createdAt: true });
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

export const productImages = pgTable("product_images", {
  productId: integer("product_id").primaryKey(),
  data: text("data").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const deliveryNeighborhoods = pgTable("delivery_neighborhoods", {
  id: serial("id").primaryKey(),
  district: text("district").notNull().default("Atakum"),
  name: text("name").notNull(),
  distance: real("distance"),
  minOrder: real("min_order").notNull().default(700),
  shippingFee: real("shipping_fee").notNull().default(89),
  freeShippingLimit: real("free_shipping_limit").notNull().default(2000),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertDeliveryNeighborhoodSchema = createInsertSchema(deliveryNeighborhoods).omit({ id: true });
export type InsertDeliveryNeighborhood = z.infer<typeof insertDeliveryNeighborhoodSchema>;
export type DeliveryNeighborhood = typeof deliveryNeighborhoods.$inferSelect;

export const campaignItems = pgTable("campaign_items", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  itemType: text("item_type").notNull().default("main"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertCampaignItemSchema = createInsertSchema(campaignItems).omit({ id: true });
export type InsertCampaignItem = z.infer<typeof insertCampaignItemSchema>;
export type CampaignItem = typeof campaignItems.$inferSelect;

export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageData: text("image_data"),
  linkUrl: text("link_url"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBannerSchema = createInsertSchema(banners).omit({ id: true, createdAt: true });
export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type Banner = typeof banners.$inferSelect;

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull().default("percentage"),
  discountValue: real("discount_value").notNull(),
  minOrderAmount: real("min_order_amount").notNull().default(0),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCouponSchema = createInsertSchema(coupons).omit({ id: true, createdAt: true, usedCount: true });
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Coupon = typeof coupons.$inferSelect;

export const virtualPets = pgTable("virtual_pets", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  petType: text("pet_type").notNull().default("kedi"),
  petName: text("pet_name").notNull().default("Minnoş"),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  totalFeedings: integer("total_feedings").notNull().default(0),
  lastFeedDate: text("last_feed_date"),
  streak: integer("streak").notNull().default(0),
  earnedPoints: real("earned_points").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type VirtualPet = typeof virtualPets.$inferSelect;

export const petContestEntries = pgTable("pet_contest_entries", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  petName: text("pet_name").notNull(),
  petType: text("pet_type").notNull().default("kedi"),
  photoData: text("photo_data").notNull(),
  description: text("description"),
  votes: integer("votes").notNull().default(0),
  weekNumber: text("week_number").notNull(),
  isWinner: boolean("is_winner").notNull().default(false),
  customerName: text("customer_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type PetContestEntry = typeof petContestEntries.$inferSelect;

export const petContestVotes = pgTable("pet_contest_votes", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").notNull(),
  voterIp: text("voter_ip").notNull(),
  customerId: integer("customer_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const petHealthRecords = pgTable("pet_health_records", {
  id: serial("id").primaryKey(),
  petProfileId: integer("pet_profile_id").notNull(),
  recordType: text("record_type").notNull(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  notes: text("notes"),
  nextDate: text("next_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export type PetHealthRecord = typeof petHealthRecords.$inferSelect;

export const petWeightLog = pgTable("pet_weight_log", {
  id: serial("id").primaryKey(),
  petProfileId: integer("pet_profile_id").notNull(),
  weight: real("weight").notNull(),
  date: text("date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export type PetWeightLog = typeof petWeightLog.$inferSelect;

export const petPhotos = pgTable("pet_photos", {
  id: serial("id").primaryKey(),
  petProfileId: integer("pet_profile_id").notNull(),
  photoData: text("photo_data").notNull(),
  caption: text("caption"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export type PetPhoto = typeof petPhotos.$inferSelect;

export const lostFoundPosts = pgTable("lost_found_posts", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  postType: text("post_type").notNull(),
  petName: text("pet_name").notNull(),
  petType: text("pet_type").notNull(),
  breed: text("breed"),
  color: text("color"),
  lastSeenLocation: text("last_seen_location"),
  description: text("description").notNull(),
  contactPhone: text("contact_phone").notNull(),
  photoData: text("photo_data"),
  isResolved: boolean("is_resolved").notNull().default(false),
  customerName: text("customer_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export type LostFoundPost = typeof lostFoundPosts.$inferSelect;
