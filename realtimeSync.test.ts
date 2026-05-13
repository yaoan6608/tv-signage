import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("實時同步功能", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    ctx = createAuthContext();
    caller = appRouter.createCaller(ctx);
  });

  describe("版面配置同步", () => {
    it("應該能取得版面配置", async () => {
      // 先設定版面配置
      await caller.layout.update({
        gridCount: 6,
        carouselMode: "6items",
        intervalSeconds: 8,
        selectedProductIds: [],
      });

      // 取得版面配置
      const layout = await caller.layout.get();
      expect(layout).toBeDefined();
      expect(layout?.gridCount).toBe(6);
      expect(layout?.carouselMode).toBe("6items");
      expect(layout?.intervalSeconds).toBe(8);
    });

    it("應該能更新版面配置並反映變更", async () => {
      // 更新版面配置
      await caller.layout.update({
        gridCount: 8,
        carouselMode: "8items",
        intervalSeconds: 10,
        selectedProductIds: [],
      });

      // 驗證更新結果
      const layout = await caller.layout.get();
      expect(layout?.gridCount).toBe(8);
      expect(layout?.carouselMode).toBe("8items");
      expect(layout?.intervalSeconds).toBe(10);
    });
  });

  describe("跑馬燈同步", () => {
    it("應該能取得跑馬燈設定", async () => {
      // 先設定跑馬燈
      await caller.marquee.update({
        text: "特價商品上架！",
        scrollSpeed: 50,
        isActive: true,
      });

      // 取得跑馬燈設定
      const marquee = await caller.marquee.get();
      expect(marquee).toBeDefined();
      expect(marquee?.text).toBe("特價商品上架！");
      expect(marquee?.scrollSpeed).toBe(50);
      expect(marquee?.isActive).toBe(true);
    });

    it("應該能更新跑馬燈設定並反映變更", async () => {
      // 更新跑馬燈設定
      await caller.marquee.update({
        text: "新品上市，限時優惠！",
        scrollSpeed: 75,
        isActive: true,
      });

      // 驗證更新結果
      const marquee = await caller.marquee.get();
      expect(marquee?.text).toBe("新品上市，限時優惠！");
      expect(marquee?.scrollSpeed).toBe(75);
    });

    it("應該能停用跑馬燈", async () => {
      // 停用跑馬燈
      await caller.marquee.update({
        text: "測試文字",
        scrollSpeed: 50,
        isActive: false,
      });

      // 驗證停用結果
      const marquee = await caller.marquee.get();
      expect(marquee?.isActive).toBe(false);
    });
  });

  describe("商品同步", () => {
    it("應該能取得商品清單", async () => {
      // 建立商品
      await caller.products.create({
        name: "測試商品",
        price: "100",
        imageUrl: "https://example.com/image.jpg",
        videoUrl: "",
        description: "測試描述",
        tagIds: [],
        fieldValues: [],
      });

      // 取得商品清單
      const products = await caller.products.list();
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
      expect(products[0]?.name).toBe("測試商品");
    });

    it("應該能更新商品並反映變更", async () => {
      // 建立商品
      const created = await caller.products.create({
        name: "原始商品名稱",
        price: "100",
        imageUrl: "https://example.com/image.jpg",
        videoUrl: "",
        description: "原始描述",
        tagIds: [],
        fieldValues: [],
      });

      // 更新商品
      await caller.products.update({
        id: created.id,
        name: "更新後的商品名稱",
        price: "150",
        imageUrl: "https://example.com/image2.jpg",
        videoUrl: "",
        description: "更新後的描述",
        tagIds: [],
        fieldValues: [],
      });

      // 驗證更新結果
      const products = await caller.products.list();
      const updated = products.find((p: any) => p.id === created.id);
      expect(updated?.name).toBe("更新後的商品名稱");
      expect(updated?.price).toBe("150");
    });

    it("應該能刪除商品", async () => {
      // 建立商品
      const created = await caller.products.create({
        name: "待刪除商品",
        price: "100",
        imageUrl: "https://example.com/image.jpg",
        videoUrl: "",
        description: "描述",
        tagIds: [],
        fieldValues: [],
      });

      // 刪除商品
      await caller.products.delete({ id: created.id });

      // 驗證刪除結果
      const products = await caller.products.list();
      const deleted = products.find((p: any) => p.id === created.id);
      expect(deleted).toBeUndefined();
    });
  });

  describe("分析事件追蹤", () => {
    it("應該能記錄商品曝光事件", async () => {
      // 建立商品
      const created = await caller.products.create({
        name: "測試商品",
        price: "100",
        imageUrl: "https://example.com/image.jpg",
        videoUrl: "",
        description: "描述",
        tagIds: [],
        fieldValues: [],
      });

      // 記錄曝光事件
      await caller.analytics.trackEvent({
        productId: created.id,
        eventType: "impression",
      });

      // 驗證事件記錄
      const stats = await caller.analytics.getStats({
        timeRange: 7,
        sortBy: "impressions",
      });

      expect(stats.length).toBeGreaterThan(0);
      const tracked = stats.find((s: any) => s.productId === created.id);
      expect(tracked?.impressions).toBeGreaterThan(0);
    });

    it("應該能記錄商品點擊事件", async () => {
      // 建立商品
      const created = await caller.products.create({
        name: "測試商品",
        price: "100",
        imageUrl: "https://example.com/image.jpg",
        videoUrl: "",
        description: "描述",
        tagIds: [],
        fieldValues: [],
      });

      // 記錄點擊事件
      await caller.analytics.trackEvent({
        productId: created.id,
        eventType: "click",
      });

      // 驗證事件記錄
      const stats = await caller.analytics.getStats({
        timeRange: 7,
        sortBy: "clicks",
      });

      expect(stats.length).toBeGreaterThan(0);
      const tracked = stats.find((s: any) => s.productId === created.id);
      expect(tracked?.clicks).toBeGreaterThan(0);
    });

    it("應該能計算點擊率", async () => {
      // 建立商品
      const created = await caller.products.create({
        name: "測試商品",
        price: "100",
        imageUrl: "https://example.com/image.jpg",
        videoUrl: "",
        description: "描述",
        tagIds: [],
        fieldValues: [],
      });

      // 記錄 10 次曝光和 2 次點擊
      for (let i = 0; i < 10; i++) {
        await caller.analytics.trackEvent({
          productId: created.id,
          eventType: "impression",
        });
      }

      for (let i = 0; i < 2; i++) {
        await caller.analytics.trackEvent({
          productId: created.id,
          eventType: "click",
        });
      }

      // 驗證點擊率計算
      const stats = await caller.analytics.getStats({
        timeRange: 7,
        sortBy: "ctr",
      });

      const tracked = stats.find((s: any) => s.productId === created.id);
      expect(tracked?.ctr).toBeCloseTo(0.2, 1); // 2/10 = 0.2 = 20%
    });
  });
});
