import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, serial, boolean } from "drizzle-orm/pg-core";
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
