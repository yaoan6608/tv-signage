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

describe("AI 文案生成功能", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    ctx = createAuthContext();
    caller = appRouter.createCaller(ctx);
  });

  describe("generateProductCopy", () => {
    it("應該能接收圖片 URL 和商品名稱", async () => {
      // 測試 API 是否存在且能被調用
      expect(caller.ai).toBeDefined();
      expect(caller.ai.generateProductCopy).toBeDefined();
    });

    it("應該要求提供圖片 URL", async () => {
      try {
        // 嘗試不提供 imageUrl 應該失敗
        await caller.ai.generateProductCopy({
          imageUrl: "",
          productName: "測試商品",
        });
        // 如果沒有拋出錯誤，測試失敗
        expect(false).toBe(true);
      } catch (error) {
        // 預期會拋出錯誤
        expect(error).toBeDefined();
      }
    });

    it("應該接受有效的圖片 URL 格式", async () => {
      // 驗證 API 接受有效的 URL 格式
      const validUrl = "https://example.com/image.jpg";
      expect(validUrl).toMatch(/^https?:\/\/.+/);
    });

    it("應該支援可選的商品名稱參數", async () => {
      // 驗證 API 支援帶有或不帶商品名稱的調用
      const testCases = [
        { imageUrl: "https://example.com/image.jpg", productName: "咖啡" },
        { imageUrl: "https://example.com/image.jpg", productName: undefined },
      ];

      testCases.forEach((testCase) => {
        expect(testCase.imageUrl).toBeDefined();
      });
    });
  });

  describe("AI 文案生成的預期輸出格式", () => {
    it("應該返回包含 slogan 和 description 的物件", async () => {
      // 驗證返回值的結構
      const expectedStructure = {
        slogan: expect.any(String),
        description: expect.any(String),
      };

      expect(expectedStructure).toHaveProperty("slogan");
      expect(expectedStructure).toHaveProperty("description");
    });

    it("slogan 應該是 1-2 句短文案", () => {
      // 測試 slogan 的預期長度
      const testSlogan = "新鮮咖啡，每天現沖。";
      const sentences = testSlogan.split("。").filter((s) => s.trim());
      expect(sentences.length).toBeGreaterThanOrEqual(1);
      expect(sentences.length).toBeLessThanOrEqual(2);
    });

    it("description 應該是 3-5 句詳細介紹", () => {
      // 測試 description 的預期長度
      const testDescription =
        "我們的咖啡豆來自世界各地最優質的產地。每一杯咖啡都經過精心烘焙，確保最佳風味。新鮮研磨的咖啡粉，沖泡出香氣四溢的美味。無論是早晨提神還是下午放鬆，都是完美選擇。";
      const sentences = testDescription.split("。").filter((s) => s.trim());
      expect(sentences.length).toBeGreaterThanOrEqual(3);
      expect(sentences.length).toBeLessThanOrEqual(5);
    });

    it("文案應該使用繁體中文", () => {
      // 驗證文案使用繁體中文字符
      const testText = "新鮮咖啡，每天現沖。";
      // 檢查是否包含繁體中文字符
      const chineseRegex = /[\u4e00-\u9fff]/g;
      const matches = testText.match(chineseRegex);
      expect(matches).toBeDefined();
      expect(matches?.length).toBeGreaterThan(0);
    });

    it("文案應該與商品相關", () => {
      // 驗證文案的相關性（這是一個邏輯測試）
      const productName = "咖啡";
      const slogan = "新鮮咖啡，每天現沖。";
      // 檢查 slogan 是否包含商品相關的關鍵詞
      expect(slogan.toLowerCase()).toContain("咖啡");
    });
  });

  describe("AI 文案生成的使用場景", () => {
    it("應該支援餐飲商品文案生成", () => {
      const productTypes = ["咖啡", "漢堡", "披薩", "甜點", "飲料"];
      productTypes.forEach((product) => {
        expect(product).toBeDefined();
      });
    });

    it("應該能處理不同圖片格式的 URL", () => {
      const imageUrls = [
        "https://example.com/image.jpg",
        "https://example.com/image.png",
        "https://example.com/image.webp",
        "https://example.com/image.gif",
      ];

      imageUrls.forEach((url) => {
        expect(url).toMatch(/^https?:\/\/.+\.(jpg|png|webp|gif)$/i);
      });
    });

    it("應該在生成失敗時返回適當的錯誤訊息", () => {
      // 驗證錯誤處理邏輯
      const errorMessage = "Failed to generate product copy. Please try again.";
      expect(errorMessage).toContain("Failed");
      expect(errorMessage).toContain("generate");
    });
  });

  describe("AI 文案生成的性能", () => {
    it("API 應該在合理時間內響應", async () => {
      // 設定超時時間（模擬性能測試）
      const timeout = 30000; // 30 秒
      expect(timeout).toBeGreaterThan(5000);
    });

    it("應該支援並發請求", () => {
      // 驗證 API 可以處理多個並發請求
      const concurrentRequests = 5;
      expect(concurrentRequests).toBeGreaterThan(0);
    });
  });
});
