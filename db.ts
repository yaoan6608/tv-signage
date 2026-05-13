import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== 商品相關查詢 =====

import { and, inArray } from "drizzle-orm";
import {
  products,
  tags,
  productTags,
  customFields,
  productFieldValues,
  displayLayout,
  marquee,
  type Product,
  type Tag,
  type CustomField,
  type ProductFieldValue,
  type DisplayLayout,
  type Marquee,
} from "../drizzle/schema";

/**
 * 取得所有商品（包含標籤）
 */
export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.isActive, "true"));
}

/**
 * 取得單一商品及其標籤與自定義欄位值
 */
export async function getProductWithDetails(productId: number) {
  const db = await getDb();
  if (!db) return null;

  const product = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (product.length === 0) return null;

  const productTagsList = await db.select().from(productTags).where(eq(productTags.productId, productId));
  const fieldValues = await db.select().from(productFieldValues).where(eq(productFieldValues.productId, productId));

  return {
    ...product[0],
    tagIds: productTagsList.map((pt) => pt.tagId),
    fieldValues,
  };
}

/**
 * 取得所有標籤
 */
export async function getAllTags() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tags).orderBy(tags.displayOrder);
}

/**
 * 取得所有自定義欄位
 */
export async function getAllCustomFields() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customFields).orderBy(customFields.displayOrder);
}

/**
 * 取得電視端版面配置
 */
export async function getDisplayLayout() {
  const db = await getDb();
  if (!db) return null;
  const layout = await db.select().from(displayLayout).limit(1);
  return layout.length > 0 ? layout[0] : null;
}

/**
 * 取得跑馬燈設定
 */
export async function getMarquee() {
  const db = await getDb();
  if (!db) return null;
  const marqueeData = await db.select().from(marquee).where(eq(marquee.isActive, "true")).limit(1);
  return marqueeData.length > 0 ? marqueeData[0] : null;
}

// ===== 分析數據相關查詢 =====

import { gte, sql } from "drizzle-orm";
import { productAnalytics } from "../drizzle/schema";

/**
 * 記錄商品曝光或點擊事件
 */
export async function trackProductEvent(
  productId: number,
  eventType: "impression" | "click"
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const today = new Date().toISOString().split("T")[0];
    const existing = await db
      .select()
      .from(productAnalytics)
      .where(
        and(
          eq(productAnalytics.productId, productId),
          eq(productAnalytics.eventType, eventType),
          eq(productAnalytics.eventDate, today)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(productAnalytics)
        .set({ count: existing[0].count + 1 })
        .where(
          and(
            eq(productAnalytics.productId, productId),
            eq(productAnalytics.eventType, eventType),
            eq(productAnalytics.eventDate, today)
          )
        );
    } else {
      await db.insert(productAnalytics).values({
        productId,
        eventType,
        eventDate: today,
        count: 1,
      });
    }
  } catch (error) {
    console.error("[Analytics] Failed to track event:", error);
  }
}

/**
 * 查詢商品統計數據
 */
export async function getProductStats(productId?: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split("T")[0];

    const conditions: any[] = [gte(productAnalytics.eventDate, startDateStr)];
    if (productId) {
      conditions.push(eq(productAnalytics.productId, productId));
    }

    return await db
      .select({
        productId: productAnalytics.productId,
        eventType: productAnalytics.eventType,
        eventDate: productAnalytics.eventDate,
        count: productAnalytics.count,
      })
      .from(productAnalytics)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0]);
  } catch (error) {
    console.error("[Analytics] Failed to get stats:", error);
    return [];
  }
}

/**
 * 查詢商品的總曝光和點擊數
 */
export async function getProductSummary(productId: number) {
  const db = await getDb();
  if (!db) return { impressions: 0, clicks: 0, clickRate: 0 };

  try {
    const stats = await db
      .select({
        eventType: productAnalytics.eventType,
        totalCount: sql<number>`SUM(${productAnalytics.count})`,
      })
      .from(productAnalytics)
      .where(eq(productAnalytics.productId, productId))
      .groupBy(productAnalytics.eventType);

    const impressions = Number(stats.find((s) => s.eventType === "impression")?.totalCount || 0);
    const clicks = Number(stats.find((s) => s.eventType === "click")?.totalCount || 0);
    const clickRate = impressions > 0 ? (clicks / impressions) * 100 : 0;

    return {
      impressions,
      clicks,
      clickRate: parseFloat(clickRate.toFixed(2)),
    };
  } catch (error) {
    console.error("[Analytics] Failed to get summary:", error);
    return { impressions: 0, clicks: 0, clickRate: 0 };
  }
}

/**
 * 查詢所有商品的統計摘要（用於排序）
 */
export async function getAllProductsSummary() {
  const db = await getDb();
  if (!db) return [];

  try {
    const allProducts = await db.select().from(products).where(eq(products.isActive, "true"));

    const summaries = await Promise.all(
      allProducts.map(async (product) => {
        const summary = await getProductSummary(product.id);
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          videoUrl: product.videoUrl,
          description: product.description,
          isActive: product.isActive,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          impressions: summary.impressions,
          clicks: summary.clicks,
          clickRate: summary.clickRate,
        };
      })
    );

    return summaries;
  } catch (error) {
    console.error("[Analytics] Failed to get all summaries:", error);
    return [];
  }
}
