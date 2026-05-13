import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import LayoutPreview from "./LayoutPreview";

// Mock products data
const mockProducts = [
  {
    id: 1,
    name: "商品 1",
    price: "100",
    imageUrl: "https://example.com/product1.jpg",
    description: "商品 1 描述",
  },
  {
    id: 2,
    name: "商品 2",
    price: "200",
    imageUrl: "https://example.com/product2.jpg",
    description: "商品 2 描述",
  },
  {
    id: 3,
    name: "商品 3",
    price: "300",
    imageUrl: "https://example.com/product3.jpg",
    description: "商品 3 描述",
  },
  {
    id: 4,
    name: "商品 4",
    price: "400",
    imageUrl: "https://example.com/product4.jpg",
    description: "商品 4 描述",
  },
  {
    id: 5,
    name: "商品 5",
    price: "500",
    imageUrl: "https://example.com/product5.jpg",
    description: "商品 5 描述",
  },
  {
    id: 6,
    name: "商品 6",
    price: "600",
    imageUrl: "https://example.com/product6.jpg",
    description: "商品 6 描述",
  },
];

describe("LayoutPreview Component", () => {
  describe("空狀態", () => {
    it("應該在沒有選擇商品時顯示空狀態", () => {
      render(
        <LayoutPreview
          gridCount={6}
          carouselMode="static"
          intervalSeconds={8}
          selectedProductIds={[]}
          backgroundColor="#000000"
          backgroundImageUrl=""
          backgroundImageOpacity={100}
          products={mockProducts}
        />
      );

      expect(screen.getByText("請選擇商品以預覽效果")).toBeInTheDocument();
    });
  });

  describe("靜態展示模式", () => {
    it("應該顯示指定數量的商品（3 格）", () => {
      render(
        <LayoutPreview
          gridCount={3}
          carouselMode="static"
          intervalSeconds={8}
          selectedProductIds={[1, 2, 3, 4, 5, 6]}
          backgroundColor="#000000"
          backgroundImageUrl=""
          backgroundImageOpacity={100}
          products={mockProducts}
        />
      );

      expect(screen.getByText("商品 1")).toBeInTheDocument();
      expect(screen.getByText("商品 2")).toBeInTheDocument();
      expect(screen.getByText("商品 3")).toBeInTheDocument();
    });

    it("應該顯示指定數量的商品（6 格）", () => {
      render(
        <LayoutPreview
          gridCount={6}
          carouselMode="static"
          intervalSeconds={8}
          selectedProductIds={[1, 2, 3, 4, 5, 6]}
          backgroundColor="#000000"
          backgroundImageUrl=""
          backgroundImageOpacity={100}
          products={mockProducts}
        />
      );

      expect(screen.getByText("商品 1")).toBeInTheDocument();
      expect(screen.getByText("商品 6")).toBeInTheDocument();
    });

    it("應該顯示指定數量的商品（8 格）", () => {
      render(
        <LayoutPreview
          gridCount={8}
          carouselMode="static"
          intervalSeconds={8}
          selectedProductIds={[1, 2, 3, 4, 5, 6]}
          backgroundColor="#000000"
          backgroundImageUrl=""
          backgroundImageOpacity={100}
          products={mockProducts}
        />
      );

      expect(screen.getByText("商品 1")).toBeInTheDocument();
      expect(screen.getByText("商品 6")).toBeInTheDocument();
    });

    it("應該不超過選擇的商品數量", () => {
      render(
        <LayoutPreview
          gridCount={6}
          carouselMode="static"
          intervalSeconds={8}
          selectedProductIds={[1, 2]}
          backgroundColor="#000000"
          backgroundImageUrl=""
          backgroundImageOpacity={100}
          products={mockProducts}
        />
      );

      expect(screen.getByText("商品 1")).toBeInTheDocument();
      expect(screen.getByText("商品 2")).toBeInTheDocument();
      expect(screen.queryByText("商品 3")).not.toBeInTheDocument();
    });
  });

  describe("單件輪播模式", () => {
    it("應該只顯示一件商品", () => {
      render(
        <LayoutPreview
          gridCount={1}
          carouselMode="single"
          intervalSeconds={8}
          selectedProductIds={[1, 2, 3]}
          backgroundColor="#000000"
          backgroundImageUrl=""
          backgroundImageOpacity={100}
          products={mockProducts}
        />
      );

      expect(screen.getByText("商品 1")).toBeInTheDocument();
      expect(screen.queryByText("商品 2")).not.toBeInTheDocument();
    });

    it("應該顯示輪播指示器", () => {
      render(
        <LayoutPreview
          gridCount={1}
          carouselMode="single"
          intervalSeconds={8}
          selectedProductIds={[1, 2, 3]}
          backgroundColor="#000000"
          backgroundImageUrl=""
          backgroundImageOpacity={100}
          products={mockProducts}
        />
      );

      expect(screen.getByText(/1 \/ 3/)).toBeInTheDocument();
    });
  });

  describe("6 件輪播模式", () => {
    it("應該顯示 6 件商品", () => {
      render(
        <LayoutPreview
          gridCount={6}
          carouselMode="6items"
          intervalSeconds={8}
          selectedProductIds={[1, 2, 3, 4, 5, 6]}
          backgroundColor="#000000"
          backgroundImageUrl=""
          backgroundImageOpacity={100}
          products={mockProducts}
        />
      );

      expect(screen.getByText("商品 1")).toBeInTheDocument();
      expect(screen.getByText("商品 6")).toBeInTheDocument();
    });

    it("應該顯示輪播指示器", () => {
      render(
        <LayoutPreview
          gridCount={6}
          carouselMode="6items"
          intervalSeconds={8}
          selectedProductIds={[1, 2, 3, 4, 5, 6]}
          backgroundColor="#000000"
          backgroundImageUrl=""
          backgroundImageOpacity={100}
          products={mockProducts}
        />
      );

      expect(screen.getByText(/6 件輪播/)).toBeInTheDocument();
    });
  });

  describe("8 件輪播模式", () => {
    it("應該顯示 8 件商品", () => {
      render(
        <LayoutPreview
          gridCount={8}
          carouselMode="8items"
          intervalSeconds={8}
          selectedProductIds={[1, 2, 3, 4, 5, 6]}
          backgroundColor="#000000"
          backgroundImageUrl=""
          backgroundImageOpacity={100}
          products={mockProducts}
        />
      );

      expect(screen.getByText("商品 1")).toBeInTheDocument();
      expect(screen.getByText("商品 6")).toBeInTheDocument();
    });

    it("應該顯示輪播指示器", () => {
      render(
        <LayoutPreview
          gridCount={8}
          carouselMode="8items"
          intervalSeconds={8}
          selectedProductIds={[1, 2, 3, 4, 5, 6]}
          backgroundColor="#000000"
          backgroundImageUrl=""
          backgroundImageOpacity={100}
          products={mockProducts}
        />
      );

      expect(screen.getByText(/8 件輪播/)).toBeInTheDocument();
    });
  });

  describe("背景設定", () => {
    it("應該應用背景顏色", () => {
      const { container } = render(
        <LayoutPreview
          gridCount={6}
          carouselMode="static"
          intervalSeconds={8}
          selectedProductIds={[1, 2, 3]}
          backgroundColor="#ff0000"
          backgroundImageUrl=""
          backgroundImageOpacity={100}
          products={mockProducts}
        />
      );

      const preview = container.firstChild as HTMLElement;
      expect(preview.style.backgroundColor).toBe("#ff0000");
    });

    it("應該應用背景圖片", () => {
      const { container } = render(
        <LayoutPreview
          gridCount={6}
          carouselMode="static"
          intervalSeconds={8}
          selectedProductIds={[1, 2, 3]}
          backgroundColor="#000000"
          backgroundImageUrl="https://example.com/bg.jpg"
          backgroundImageOpacity={100}
          products={mockProducts}
        />
      );

      const preview = container.firstChild as HTMLElement;
      expect(preview.style.backgroundImage).toContain("https://example.com/bg.jpg");
    });

    it("應該應用背景圖片透明度", () => {
      const { container } = render(
        <LayoutPreview
          gridCount={6}
          carouselMode="static"
          intervalSeconds={8}
          selectedProductIds={[1, 2, 3]}
          backgroundColor="#000000"
          backgroundImageUrl="https://example.com/bg.jpg"
          backgroundImageOpacity={50}
          products={mockProducts}
        />
      );

      // 檢查是否有透明度覆蓋層
      const overlayDivs = container.querySelectorAll("[style*='backgroundColor']");
      expect(overlayDivs.length).toBeGreaterThan(0);
    });
  });

  describe("商品資訊顯示", () => {
    it("應該顯示商品名稱和價格", () => {
      render(
        <LayoutPreview
          gridCount={6}
          carouselMode="static"
          intervalSeconds={8}
          selectedProductIds={[1]}
          backgroundColor="#000000"
          backgroundImageUrl=""
          backgroundImageOpacity={100}
          products={mockProducts}
        />
      );

      expect(screen.getByText("商品 1")).toBeInTheDocument();
      expect(screen.getByText("NT$ 100")).toBeInTheDocument();
    });

    it("應該顯示商品描述", () => {
      render(
        <LayoutPreview
          gridCount={6}
          carouselMode="static"
          intervalSeconds={8}
          selectedProductIds={[1]}
          backgroundColor="#000000"
          backgroundImageUrl=""
          backgroundImageOpacity={100}
          products={mockProducts}
        />
      );

      expect(screen.getByText("商品 1 描述")).toBeInTheDocument();
    });

    it("應該處理沒有圖片的商品", () => {
      const productsWithoutImage = [
        {
          id: 1,
          name: "無圖商品",
          price: "100",
          imageUrl: "",
          description: "無圖商品描述",
        },
      ];

      render(
        <LayoutPreview
          gridCount={6}
          carouselMode="static"
          intervalSeconds={8}
          selectedProductIds={[1]}
          backgroundColor="#000000"
          backgroundImageUrl=""
          backgroundImageOpacity={100}
          products={productsWithoutImage}
        />
      );

      expect(screen.getByText("無圖商品")).toBeInTheDocument();
    });
  });

  describe("輪播循環邏輯", () => {
    it("應該正確計算單件輪播的最大索引", () => {
      const { rerender } = render(
        <LayoutPreview
          gridCount={1}
          carouselMode="single"
          intervalSeconds={1}
          selectedProductIds={[1, 2, 3]}
          backgroundColor="#000000"
          backgroundImageUrl=""
          backgroundImageOpacity={100}
          products={mockProducts}
        />
      );

      expect(screen.getByText("商品 1")).toBeInTheDocument();
    });

    it("應該正確計算 6 件輪播的頁數", () => {
      render(
        <LayoutPreview
          gridCount={6}
          carouselMode="6items"
          intervalSeconds={8}
          selectedProductIds={[1, 2, 3, 4, 5, 6]}
          backgroundColor="#000000"
          backgroundImageUrl=""
          backgroundImageOpacity={100}
          products={mockProducts}
        />
      );

      // 6 個商品 / 6 件輪播 = 1 頁
      expect(screen.getByText(/頁 1 \/ 1/)).toBeInTheDocument();
    });

    it("應該正確計算 8 件輪播的頁數（多於 8 個商品）", () => {
      const manyProducts = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        name: `商品 ${i + 1}`,
        price: String((i + 1) * 100),
        imageUrl: `https://example.com/product${i + 1}.jpg`,
        description: `商品 ${i + 1} 描述`,
      }));

      render(
        <LayoutPreview
          gridCount={8}
          carouselMode="8items"
          intervalSeconds={8}
          selectedProductIds={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
          backgroundColor="#000000"
          backgroundImageUrl=""
          backgroundImageOpacity={100}
          products={manyProducts}
        />
      );

      // 12 個商品 / 8 件輪播 = 2 頁
      expect(screen.getByText(/頁 1 \/ 2/)).toBeInTheDocument();
    });
  });

  describe("響應式設計", () => {
    it("應該在不同格數下正確顯示", () => {
      const { rerender } = render(
        <LayoutPreview
          gridCount={3}
          carouselMode="static"
          intervalSeconds={8}
          selectedProductIds={[1, 2, 3, 4, 5, 6]}
          backgroundColor="#000000"
          backgroundImageUrl=""
          backgroundImageOpacity={100}
          products={mockProducts}
        />
      );

      expect(screen.getByText("商品 1")).toBeInTheDocument();
      expect(screen.getByText("商品 3")).toBeInTheDocument();
      expect(screen.queryByText("商品 4")).not.toBeInTheDocument();

      // 改為 6 格
      rerender(
        <LayoutPreview
          gridCount={6}
          carouselMode="static"
          intervalSeconds={8}
          selectedProductIds={[1, 2, 3, 4, 5, 6]}
          backgroundColor="#000000"
          backgroundImageUrl=""
          backgroundImageOpacity={100}
          products={mockProducts}
        />
      );

      expect(screen.getByText("商品 6")).toBeInTheDocument();
    });
  });
});
