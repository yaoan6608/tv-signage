import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, index, tinyint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 商品表
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  price: varchar("price", { length: 50 }).notNull(),
  imageUrl: text("imageUrl"),
  videoUrl: text("videoUrl"),
  description: text("description"),
  category: mysqlEnum("category", ["food", "beverage", "dessert", "restaurant", "apparel", "beauty", "home", "electronics"]).default("food").notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  isPinned: mysqlEnum("isPinned", ["true", "false"]).default("false").notNull(),
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * 標籤表
 */
export const tags = mysqlTable("tags", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  color: varchar("color", { length: 7 }).default("#FFB703").notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;

/**
 * 商品標籤關聯表
 */
export const productTags = mysqlTable("product_tags", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  tagId: int("tagId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductTag = typeof productTags.$inferSelect;
export type InsertProductTag = typeof productTags.$inferInsert;

/**
 * 自定義欄位表
 */
export const customFields = mysqlTable("custom_fields", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  fieldType: mysqlEnum("fieldType", ["text", "textarea", "number", "select"]).default("text").notNull(),
  isRequired: tinyint("isRequired").default(0).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomField = typeof customFields.$inferSelect;
export type InsertCustomField = typeof customFields.$inferInsert;

/**
 * 商品自定義欄位值表
 */
export const productFieldValues = mysqlTable("product_field_values", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  fieldId: int("fieldId").notNull(),
  value: text("value"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProductFieldValue = typeof productFieldValues.$inferSelect;
export type InsertProductFieldValue = typeof productFieldValues.$inferInsert;

/**
 * 版面配置表
 */
export const displayLayout = mysqlTable("display_layout", {
  id: int("id").autoincrement().primaryKey(),
  gridCount: int("gridCount").default(6).notNull(),
  carouselMode: mysqlEnum("carouselMode", ["single", "2items", "3items", "6items", "8items", "static"]).default("6items").notNull(),
  intervalSeconds: int("intervalSeconds").default(8).notNull(),
  selectedProductIds: text("selectedProductIds").default("[]").notNull(),
  backgroundColor: varchar("backgroundColor", { length: 7 }).default("#000000").notNull(),
  backgroundImageUrl: text("backgroundImageUrl"),
  backgroundImageOpacity: int("backgroundImageOpacity").default(100).notNull(),
  animationType: mysqlEnum("animationType", ["fade", "slide"]).default("fade").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DisplayLayout = typeof displayLayout.$inferSelect;
export type InsertDisplayLayout = typeof displayLayout.$inferInsert;

/**
 * 跑馬燈表
 */
export const marquee = mysqlTable("marquee", {
  id: int("id").autoincrement().primaryKey(),
  text: text("text").notNull(),
  scrollSpeed: int("scrollSpeed").default(50).notNull(),
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Marquee = typeof marquee.$inferSelect;
export type InsertMarquee = typeof marquee.$inferInsert;

/**
 * 商品分析表（追蹤曝光次數、點擊次數）
 */
export const productAnalytics = mysqlTable(
  "product_analytics",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull(),
    eventType: mysqlEnum("eventType", ["impression", "click"]).notNull(),
    eventDate: varchar("eventDate", { length: 10 }).notNull(),
    count: int("count").notNull().default(1),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    idx: index("idx_product_date").on(table.productId, table.eventDate),
  })
);

export type ProductAnalytic = typeof productAnalytics.$inferSelect;
export type InsertProductAnalytic = typeof productAnalytics.$inferInsert;
