import { describe, it, expect } from "vitest";
import {
  getCategoryTemplate,
  getAllCategories,
  generateLLMPrompt,
  CATEGORY_TEMPLATES,
  ProductCategory,
} from "./categoryTemplates";

describe("Category Templates System", () => {
  describe("getCategoryTemplate", () => {
    it("應該為每個類別返回正確的模板", () => {
      const categories: ProductCategory[] = [
        "food",
        "beverage",
        "dessert",
        "restaurant",
        "apparel",
        "beauty",
        "home",
        "electronics",
      ];

      categories.forEach((category) => {
        const template = getCategoryTemplate(category);
        expect(template).toBeDefined();
        expect(template.name).toBe(category);
        expect(template.displayName).toBeDefined();
        expect(template.icon).toBeDefined();
        expect(template.description).toBeDefined();
        expect(template.systemPrompt).toBeDefined();
        expect(template.userPromptTemplate).toBeDefined();
        expect(template.sloganStyle).toBeDefined();
        expect(template.descriptionStyle).toBeDefined();
      });
    });

    it("應該在類別不存在時返回預設的食品模板", () => {
      const template = getCategoryTemplate("invalid" as ProductCategory);
      expect(template.name).toBe("food");
    });

    it("食品模板應該包含食慾激發的詞彙", () => {
      const template = getCategoryTemplate("food");
      expect(template.systemPrompt).toContain("感官詞彙");
      expect(template.sloganStyle).toContain("食慾激發");
    });

    it("飲品模板應該包含清爽的詞彙", () => {
      const template = getCategoryTemplate("beverage");
      expect(template.systemPrompt).toContain("清爽");
      expect(template.sloganStyle).toContain("清爽");
    });

    it("甜點模板應該包含誘人的詞彙", () => {
      const template = getCategoryTemplate("dessert");
      expect(template.systemPrompt).toContain("誘人");
      expect(template.sloganStyle).toContain("誘人");
    });

    it("服飾模板應該包含時尚的詞彙", () => {
      const template = getCategoryTemplate("apparel");
      expect(template.systemPrompt).toContain("風格");
      expect(template.sloganStyle).toContain("時尚");
    });

    it("美妝模板應該包含美麗的詞彙", () => {
      const template = getCategoryTemplate("beauty");
      expect(template.systemPrompt).toContain("效果");
      expect(template.sloganStyle).toContain("光彩");
    });

    it("家居模板應該包含舒適的詞彙", () => {
      const template = getCategoryTemplate("home");
      expect(template.systemPrompt).toContain("設計");
      expect(template.sloganStyle).toContain("舒適");
    });

    it("電子模板應該包含技術的詞彙", () => {
      const template = getCategoryTemplate("electronics");
      expect(template.systemPrompt).toContain("技術");
      expect(template.sloganStyle).toContain("先進");
    });
  });

  describe("getAllCategories", () => {
    it("應該返回 8 個類別", () => {
      const categories = getAllCategories();
      expect(categories).toHaveLength(8);
    });

    it("每個類別應該有 value、label 和 icon", () => {
      const categories = getAllCategories();
      categories.forEach((cat) => {
        expect(cat.value).toBeDefined();
        expect(cat.label).toBeDefined();
        expect(cat.icon).toBeDefined();
        expect(typeof cat.value).toBe("string");
        expect(typeof cat.label).toBe("string");
        expect(typeof cat.icon).toBe("string");
      });
    });

    it("應該包含所有預期的類別", () => {
      const categories = getAllCategories();
      const values = categories.map((c) => c.value);
      expect(values).toContain("food");
      expect(values).toContain("beverage");
      expect(values).toContain("dessert");
      expect(values).toContain("restaurant");
      expect(values).toContain("apparel");
      expect(values).toContain("beauty");
      expect(values).toContain("home");
      expect(values).toContain("electronics");
    });

    it("每個類別的 label 應該包含 emoji 圖標", () => {
      const categories = getAllCategories();
      categories.forEach((cat) => {
        expect(cat.label).toMatch(/^[\s\S]*[\u{1F300}-\u{1F9FF}][\s\S]*$/u);
      });
    });
  });

  describe("generateLLMPrompt", () => {
    it("應該為食品類別生成正確的提示詞", () => {
      const { systemPrompt, userPrompt } = generateLLMPrompt("food", "新鮮蘋果", "紅色蘋果圖片");
      expect(systemPrompt).toContain("食品行銷文案撰寫人");
      expect(userPrompt).toContain("新鮮蘋果");
      expect(userPrompt).toContain("紅色蘋果圖片");
    });

    it("應該為飲品類別生成正確的提示詞", () => {
      const { systemPrompt, userPrompt } = generateLLMPrompt("beverage", "冰咖啡");
      expect(systemPrompt).toContain("飲品行銷文案撰寫人");
      expect(userPrompt).toContain("冰咖啡");
    });

    it("應該替換產品名稱", () => {
      const productName = "特色商品";
      const { userPrompt } = generateLLMPrompt("food", productName);
      expect(userPrompt).toContain(productName);
    });

    it("應該替換圖片描述", () => {
      const imageDesc = "高質量商品圖片";
      const { userPrompt } = generateLLMPrompt("food", "商品", imageDesc);
      expect(userPrompt).toContain(imageDesc);
    });

    it("應該在未提供圖片描述時使用預設值", () => {
      const { userPrompt } = generateLLMPrompt("food", "商品");
      expect(userPrompt).toContain("商品圖片");
    });

    it("系統提示詞應該要求繁體中文回應", () => {
      const categories: ProductCategory[] = [
        "food",
        "beverage",
        "dessert",
        "restaurant",
        "apparel",
        "beauty",
        "home",
        "electronics",
      ];

      categories.forEach((category) => {
        const { systemPrompt, userPrompt } = generateLLMPrompt(category, "商品");
        expect(systemPrompt).toContain("繁體中文");
        expect(userPrompt).toContain("繁體中文");
      });
    });

    it("應該包含標語和介紹詞的要求", () => {
      const { userPrompt } = generateLLMPrompt("food", "商品");
      expect(userPrompt).toContain("標語");
      expect(userPrompt).toContain("介紹詞");
    });
  });

  describe("CATEGORY_TEMPLATES", () => {
    it("應該包含所有 8 個類別的模板", () => {
      expect(Object.keys(CATEGORY_TEMPLATES)).toHaveLength(8);
    });

    it("每個模板應該有完整的結構", () => {
      Object.values(CATEGORY_TEMPLATES).forEach((template) => {
        expect(template.name).toBeDefined();
        expect(template.displayName).toBeDefined();
        expect(template.icon).toBeDefined();
        expect(template.description).toBeDefined();
        expect(template.systemPrompt).toBeDefined();
        expect(template.userPromptTemplate).toBeDefined();
        expect(template.sloganStyle).toBeDefined();
        expect(template.descriptionStyle).toBeDefined();

        // 驗證內容長度
        expect(template.systemPrompt.length).toBeGreaterThan(100);
        expect(template.userPromptTemplate.length).toBeGreaterThan(50);
      });
    });

    it("每個模板的 systemPrompt 應該包含角色定義", () => {
      Object.values(CATEGORY_TEMPLATES).forEach((template) => {
        expect(template.systemPrompt).toMatch(/你是一位專業的.*行銷文案撰寫人/);
      });
    });

    it("每個模板的 userPromptTemplate 應該包含產品名稱和圖片描述佔位符", () => {
      Object.values(CATEGORY_TEMPLATES).forEach((template) => {
        expect(template.userPromptTemplate).toContain("{productName}");
        expect(template.userPromptTemplate).toContain("{imageDescription}");
      });
    });
  });

  describe("類別特定的驗證", () => {
    it("食品類別應該強調新鮮度和營養", () => {
      const template = getCategoryTemplate("food");
      expect(template.systemPrompt).toMatch(/新鮮|營養|健康/);
    });

    it("餐飲類別應該強調烹飪工藝", () => {
      const template = getCategoryTemplate("restaurant");
      expect(template.systemPrompt).toContain("烹飪工藝");
    });

    it("美妝類別應該強調安全性", () => {
      const template = getCategoryTemplate("beauty");
      expect(template.systemPrompt).toMatch(/天然|無害|認證/);
    });

    it("電子類別應該強調技術規格", () => {
      const template = getCategoryTemplate("electronics");
      expect(template.systemPrompt).toContain("技術規格");
    });
  });
});
