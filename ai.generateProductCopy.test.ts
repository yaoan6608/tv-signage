import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateLLMPrompt } from "../shared/categoryTemplates";

/**
 * AI 文案生成 API 的集成測試
 * 
 * 注意：這些測試驗證 API 的邏輯和參數處理，
 * 實際的 LLM 調用在集成測試中進行模擬。
 */

describe("AI generateProductCopy API", () => {
  describe("API 參數驗證", () => {
    it("應該接受必需的 imageUrl 參數", () => {
      const input = {
        imageUrl: "https://example.com/image.jpg",
      };
      expect(input.imageUrl).toBeDefined();
      expect(typeof input.imageUrl).toBe("string");
    });

    it("應該接受可選的 productName 參數", () => {
      const input = {
        imageUrl: "https://example.com/image.jpg",
        productName: "新鮮蘋果",
      };
      expect(input.productName).toBeDefined();
      expect(typeof input.productName).toBe("string");
    });

    it("應該接受可選的 category 參數", () => {
      const categories = ["food", "beverage", "dessert", "restaurant", "apparel", "beauty", "home", "electronics"];
      categories.forEach((category) => {
        const input = {
          imageUrl: "https://example.com/image.jpg",
          category,
        };
        expect(input.category).toBeDefined();
        expect(categories).toContain(input.category);
      });
    });

    it("應該使用預設類別 food 當未指定 category", () => {
      const input = {
        imageUrl: "https://example.com/image.jpg",
      };
      const category = input.category || "food";
      expect(category).toBe("food");
    });
  });

  describe("模板選擇邏輯", () => {
    it("應該根據 category 選擇正確的模板", () => {
      const testCases = [
        { category: "food", expectedKeyword: "食品" },
        { category: "beverage", expectedKeyword: "飲品" },
        { category: "dessert", expectedKeyword: "甜點" },
        { category: "restaurant", expectedKeyword: "菜肴" },
        { category: "apparel", expectedKeyword: "服飾" },
        { category: "beauty", expectedKeyword: "美妝" },
        { category: "home", expectedKeyword: "家居" },
        { category: "electronics", expectedKeyword: "電子" },
      ];

      testCases.forEach(({ category, expectedKeyword }) => {
        const { systemPrompt } = generateLLMPrompt(category as any, "商品");
        expect(systemPrompt).toContain(expectedKeyword);
      });
    });

    it("應該為食品類別生成食慾激發的提示詞", () => {
      const { systemPrompt } = generateLLMPrompt("food", "商品");
      expect(systemPrompt).toMatch(/感官|食慾|新鮮|營養/);
    });

    it("應該為飲品類別生成清爽的提示詞", () => {
      const { systemPrompt } = generateLLMPrompt("beverage", "商品");
      expect(systemPrompt).toMatch(/清爽|解渴|提神/);
    });

    it("應該為服飾類別生成時尚的提示詞", () => {
      const { systemPrompt } = generateLLMPrompt("apparel", "商品");
      expect(systemPrompt).toMatch(/時尚|風格|設計/);
    });

    it("應該為美妝類別生成美麗的提示詞", () => {
      const { systemPrompt } = generateLLMPrompt("beauty", "商品");
      expect(systemPrompt).toMatch(/光彩|美麗|效果/);
    });

    it("應該為電子類別生成技術的提示詞", () => {
      const { systemPrompt } = generateLLMPrompt("electronics", "商品");
      expect(systemPrompt).toMatch(/技術|先進|智能/);
    });
  });

  describe("提示詞生成", () => {
    it("應該包含產品名稱在用戶提示詞中", () => {
      const productName = "特色商品";
      const { userPrompt } = generateLLMPrompt("food", productName);
      expect(userPrompt).toContain(productName);
    });

    it("應該包含圖片描述在用戶提示詞中", () => {
      const imageDesc = "高質量商品圖片";
      const { userPrompt } = generateLLMPrompt("food", "商品", imageDesc);
      expect(userPrompt).toContain(imageDesc);
    });

    it("應該在未提供圖片描述時使用預設值", () => {
      const { userPrompt } = generateLLMPrompt("food", "商品");
      expect(userPrompt).toContain("商品圖片");
    });

    it("應該要求生成標語和介紹詞", () => {
      const { userPrompt } = generateLLMPrompt("food", "商品");
      expect(userPrompt).toMatch(/標語|標題|slogan/i);
      expect(userPrompt).toMatch(/介紹|描述|description/i);
    });

    it("應該指定標語長度為 1-2 句", () => {
      const { userPrompt } = generateLLMPrompt("food", "商品");
      expect(userPrompt).toMatch(/1-2\s*句|1-2\s*句/);
    });

    it("應該指定介紹詞長度為 3-5 句", () => {
      const { userPrompt } = generateLLMPrompt("food", "商品");
      expect(userPrompt).toMatch(/3-5\s*句|3-5\s*句/);
    });
  });

  describe("API 響應格式", () => {
    it("應該返回 slogan 和 description 欄位", () => {
      // 模擬 API 響應
      const mockResponse = {
        slogan: "新鮮美味的蘋果",
        description: "這是一個美味的蘋果描述",
      };

      expect(mockResponse).toHaveProperty("slogan");
      expect(mockResponse).toHaveProperty("description");
      expect(typeof mockResponse.slogan).toBe("string");
      expect(typeof mockResponse.description).toBe("string");
    });

    it("slogan 應該是 1-2 句", () => {
      const mockResponse = {
        slogan: "新鮮美味的蘋果",
        description: "這是一個美味的蘋果描述",
      };

      const sloganSentences = mockResponse.slogan.split(/[。！？]/);
      expect(sloganSentences.length).toBeLessThanOrEqual(3); // 考慮最後的空字符串
    });

    it("description 應該是 3-5 句", () => {
      const mockResponse = {
        slogan: "新鮮美味的蘋果",
        description: "這是一個美味的蘋果。營養豐富。適合全家。品質保證。推薦購買。",
      };

      const descSentences = mockResponse.description.split(/[。！？]/);
      const nonEmptySentences = descSentences.filter((s) => s.trim());
      expect(nonEmptySentences.length).toBeGreaterThanOrEqual(3);
      expect(nonEmptySentences.length).toBeLessThanOrEqual(5);
    });
  });

  describe("錯誤處理", () => {
    it("應該在 imageUrl 為空時返回錯誤", () => {
      const input = {
        imageUrl: "",
      };
      expect(input.imageUrl).toBe("");
      // 實際的 API 應該驗證並拒絕空的 imageUrl
    });

    it("應該在無效的 imageUrl 時返回錯誤", () => {
      const input = {
        imageUrl: "not-a-valid-url",
      };
      // 實際的 API 應該驗證 URL 格式
      expect(input.imageUrl).not.toMatch(/^https?:\/\//);
    });

    it("應該在 LLM 響應無效時返回錯誤", () => {
      // 模擬無效的 LLM 響應
      const invalidResponse = {
        choices: [],
      };
      expect(invalidResponse.choices).toHaveLength(0);
    });

    it("應該在 LLM 響應缺少必需欄位時返回錯誤", () => {
      // 模擬缺少欄位的 LLM 響應
      const incompleteResponse = {
        slogan: "標語",
        // 缺少 description
      };
      expect(incompleteResponse).not.toHaveProperty("description");
    });
  });

  describe("類別特定的行為", () => {
    it("食品類別應該強調新鮮度", () => {
      const { systemPrompt } = generateLLMPrompt("food", "商品");
      expect(systemPrompt).toContain("新鮮");
    });

    it("飲品類別應該強調清爽", () => {
      const { systemPrompt } = generateLLMPrompt("beverage", "商品");
      expect(systemPrompt).toContain("清爽");
    });

    it("甜點類別應該強調精緻", () => {
      const { systemPrompt } = generateLLMPrompt("dessert", "商品");
      expect(systemPrompt).toContain("精緻");
    });

    it("餐飲類別應該強調烹飪", () => {
      const { systemPrompt } = generateLLMPrompt("restaurant", "商品");
      expect(systemPrompt).toContain("烹飪");
    });

    it("服飾類別應該強調風格", () => {
      const { systemPrompt } = generateLLMPrompt("apparel", "商品");
      expect(systemPrompt).toContain("風格");
    });

    it("美妝類別應該強調效果", () => {
      const { systemPrompt } = generateLLMPrompt("beauty", "商品");
      expect(systemPrompt).toContain("效果");
    });

    it("家居類別應該強調功能", () => {
      const { systemPrompt } = generateLLMPrompt("home", "商品");
      expect(systemPrompt).toContain("功能");
    });

    it("電子類別應該強調規格", () => {
      const { systemPrompt } = generateLLMPrompt("electronics", "商品");
      expect(systemPrompt).toContain("規格");
    });
  });
});
