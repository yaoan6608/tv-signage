import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Pin, PinOff, TrendingUp, GripVertical } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { SortableProductList } from "@/components/SortableProductList";

export default function ProductSort() {
  const [, navigate] = useLocation();
  const [sortMode, setSortMode] = useState<"manual" | "clicks" | "views">(
    "manual"
  );

  const { data: products = [], isLoading, refetch } = trpc.products.list.useQuery();

  // 模擬排序和置頂 API 調用
  const handleReorder = async (reorderedProducts: any[]) => {
    try {
      // 這裡應該調用後端 API 保存排序
      // await trpc.products.reorder.mutateAsync({...})
      toast.success("商品順序已更新");
      refetch();
      window.dispatchEvent(new CustomEvent("productsUpdated"));
    } catch (error) {
      toast.error("排序更新失敗");
    }
  };

  const handleTogglePin = async (productId: number, isPinned: boolean) => {
    try {
      // 這裡應該調用後端 API 保存置頂狀態
      // await trpc.products.togglePin.mutateAsync({...})
      toast.success(isPinned ? "已置頂" : "已取消置頂");
      refetch();
      window.dispatchEvent(new CustomEvent("productsUpdated"));
    } catch (error) {
      toast.error("操作失敗");
    }
  };

  const handleAutoSort = async (sortBy: "clicks" | "views" | "manual") => {
    try {
      // 根據點擊率或曝光率排序
      const sorted = [...products].sort((a: any, b: any) => {
        if (sortBy === "clicks") {
          return (b.clickCount || 0) - (a.clickCount || 0);
        } else if (sortBy === "views") {
          return (b.viewCount || 0) - (a.viewCount || 0);
        }
        return 0;
      });

      // 更新 displayOrder
      const reordered = sorted.map((p: any, idx: number) => ({
        ...p,
        displayOrder: idx,
      }));

      await handleReorder(reordered);
      setSortMode(sortBy);
      toast.success(
        sortBy === "clicks" ? "已按點擊率排序" : "已按曝光率排序"
      );
    } catch (error) {
      toast.error("自動排序失敗");
    }
  };

  // 按 displayOrder 排序商品
  const sortedProducts = [...products].sort(
    (a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 頁面標題 */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-gray-200 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">商品排序管理</h1>
              <p className="text-sm text-gray-600 mt-1">
                拖曳調整商品順序，或使用自動排序功能
              </p>
            </div>
          </div>
        </div>

        {/* 統計信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-white">
            <div className="text-sm text-gray-600">總商品數</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">
              {products.length}
            </div>
          </Card>
          <Card className="p-4 bg-white">
            <div className="text-sm text-gray-600">置頂商品</div>
            <div className="text-2xl font-bold text-red-600 mt-2">
              {products.filter((p: any) => p.isPinned).length}
            </div>
          </Card>
          <Card className="p-4 bg-white">
            <div className="text-sm text-gray-600">排序模式</div>
            <div className="text-lg font-bold text-blue-600 mt-2 capitalize">
              {sortMode === "manual"
                ? "手動排序"
                : sortMode === "clicks"
                  ? "按點擊率"
                  : "按曝光率"}
            </div>
          </Card>
        </div>

        {/* 主要內容 */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <GripVertical className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mt-4">載入商品中...</p>
          </div>
        ) : sortedProducts.length === 0 ? (
          <Card className="p-12 text-center bg-white">
            <p className="text-gray-600">暫無商品，請先新增商品</p>
            <Button
              onClick={() => navigate("/products")}
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              前往商品管理
            </Button>
          </Card>
        ) : (
          <SortableProductList
            products={sortedProducts}
            onReorder={handleReorder}
            onTogglePin={handleTogglePin}
            onAutoSort={handleAutoSort}
          />
        )}
      </div>
    </div>
  );
}
