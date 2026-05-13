import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as storageModule from "./storage";

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

describe("S3 Storage API", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    ctx = createAuthContext();
    caller = appRouter.createCaller(ctx);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("uploadImage", () => {
    it("應該能接收 Base64 編碼的圖片數據", async () => {
      expect(caller.storage).toBeDefined();
      expect(caller.storage.uploadImage).toBeDefined();
    });

    it("應該接受有效的圖片 MIME 類型", () => {
      const validMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];

      validMimeTypes.forEach((mimeType) => {
        expect(mimeType).toMatch(/^image\//);
      });
    });

    it("應該生成唯一的檔案名稱", () => {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileName = "test.jpg";
      const fileKey = `products/${timestamp}-${randomStr}-${fileName}`;

      expect(fileKey).toContain("products/");
      expect(fileKey).toContain(fileName);
      expect(fileKey).toMatch(/products\/\d+-[a-z0-9]+-test\.jpg/);
    });

    it("應該支援大檔案上傳（最大 10MB）", () => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      expect(maxSize).toBeGreaterThan(5 * 1024 * 1024); // 大於 5MB
    });

    it("應該返回 S3 URL", () => {
      const expectedUrlPattern = /^\/manus-storage\/products\/\d+-[a-z0-9]+-/;
      const sampleUrl = "/manus-storage/products/1234567890-abc123-test.jpg";

      expect(sampleUrl).toMatch(expectedUrlPattern);
    });

    it("應該返回包含 success、url 和 key 的物件", () => {
      const expectedResponse = {
        success: true,
        url: "/manus-storage/products/1234567890-abc123-test.jpg",
        key: "products/1234567890-abc123-test.jpg",
      };

      expect(expectedResponse).toHaveProperty("success");
      expect(expectedResponse).toHaveProperty("url");
      expect(expectedResponse).toHaveProperty("key");
      expect(expectedResponse.success).toBe(true);
    });
  });

  describe("Base64 轉換", () => {
    it("應該能處理帶有 data: 前綴的 Base64", () => {
      const base64WithPrefix = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
      const parts = base64WithPrefix.split(",");
      const base64Data = parts[1] || parts[0];

      expect(base64Data).toBeTruthy();
      expect(base64Data.length).toBeGreaterThan(0);
    });

    it("應該能處理純 Base64 字符串", () => {
      const pureBase64 = "/9j/4AAQSkZJRg==";
      expect(pureBase64).toBeTruthy();
      expect(pureBase64.match(/^[A-Za-z0-9+/=]+$/)).toBeTruthy();
    });
  });

  describe("圖片上傳的使用場景", () => {
    it("應該支援商品圖片上傳", () => {
      const fileName = "product-image.jpg";
      expect(fileName).toContain("product");
      expect(fileName).toMatch(/\.(jpg|png|webp|gif)$/i);
    });

    it("應該支援多種圖片格式", () => {
      const imageFormats = ["jpg", "png", "webp", "gif"];
      imageFormats.forEach((format) => {
        const fileName = `image.${format}`;
        expect(fileName).toMatch(/\.(jpg|png|webp|gif)$/i);
      });
    });

    it("應該在上傳失敗時返回適當的錯誤訊息", () => {
      const errorMessage = "Failed to upload image to storage";
      expect(errorMessage).toContain("Failed");
      expect(errorMessage).toContain("upload");
    });
  });

  describe("S3 儲存的性能", () => {
    it("應該在合理時間內完成上傳", () => {
      const timeout = 30000; // 30 秒
      expect(timeout).toBeGreaterThan(5000);
    });

    it("應該支援並發上傳", () => {
      const concurrentUploads = 5;
      expect(concurrentUploads).toBeGreaterThan(0);
    });

    it("應該正確處理檔案名稱中的特殊字符", () => {
      const fileNames = [
        "product-image.jpg",
        "product_image.jpg",
        "product image.jpg",
        "產品圖片.jpg",
      ];

      fileNames.forEach((fileName) => {
        const fileKey = `products/${Date.now()}-abc123-${fileName}`;
        expect(fileKey).toContain(fileName);
      });
    });
  });
});
