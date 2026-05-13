import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import LayoutPreview from "@/components/LayoutPreview";

export default function Layout() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    gridCount: 6,
    carouselMode: "6items" as "single" | "2items" | "3items" | "6items" | "8items" | "static",
    intervalSeconds: 8,
    selectedProductIds: [] as number[],
    backgroundColor: "#000000",
    backgroundImageUrl: "",
    backgroundImageOpacity: 100,
    animationType: "fade" as "fade" | "slide",
    marqueeText: "",
    marqueeSpeed: 50,
    marqueeActive: false,
  });

  const { data: layout, isLoading: layoutLoading } = trpc.layout.get.useQuery();
  const { data: products } = trpc.products.list.useQuery();
  const updateMutation = trpc.layout.update.useMutation();

  useEffect(() => {
    if (layout) {
      try {
        const selectedIds = layout.selectedProductIds && typeof layout.selectedProductIds === 'string' && layout.selectedProductIds.trim() ? JSON.parse(layout.selectedProductIds) : [];
        setFormData({
          gridCount: layout.gridCount,
          carouselMode: layout.carouselMode,
          intervalSeconds: layout.intervalSeconds,
          selectedProductIds: Array.isArray(selectedIds) ? selectedIds : [],
          backgroundColor: layout.backgroundColor || "#000000",
          backgroundImageUrl: layout.backgroundImageUrl || "",
          backgroundImageOpacity: layout.backgroundImageOpacity || 100,
          animationType: (layout.animationType || "fade") as "fade" | "slide",
          marqueeText: "",
          marqueeSpeed: 50,
          marqueeActive: false,
        });
      } catch (error) {
        console.error("Failed to parse layout data:", error);
        setFormData((prev) => ({
          ...prev,
          backgroundColor: layout.backgroundColor || "#000000",
          backgroundImageUrl: layout.backgroundImageUrl || "",
          backgroundImageOpacity: layout.backgroundImageOpacity || 100,
          animationType: (layout.animationType || "fade") as "fade" | "slide",
        }));
      }
    }
  }, [layout]);

  const handleSubmit = async () => {
    try {
      await updateMutation.mutateAsync(formData);
      toast.success("版面配置已保存");
      // 觸發實時更新事件
      window.dispatchEvent(new CustomEvent("layout-updated", { detail: { type: "update" } }));
    } catch (error) {
      toast.error("保存失敗");
    }
  };

  const toggleProduct = (productId: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedProductIds: prev.selectedProductIds.includes(productId)
        ? prev.selectedProductIds.filter((id) => id !== productId)
        : [...prev.selectedProductIds, productId],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-black border-b-2 border-amber-500 py-6 px-4">
        <div className="max-w-full mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-gray-400 hover:text-amber-500"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-3xl font-bold text-amber-500">版面配置</h1>
          </div>
        </div>
      </div>

      {/* Content - 3 Column Layout */}
      <div className="max-w-full mx-auto py-8 px-4 h-[calc(100vh-120px)]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Column 1: Settings (1/4 width) */}
          <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-4 flex-shrink-0">
              <h2 className="text-white text-lg font-semibold">配置設定</h2>

              <div>
                <label className="text-white text-xs font-semibold mb-1 block">顯示格數</label>
                <Select value={String(formData.gridCount)} onValueChange={(value) => setFormData({ ...formData, gridCount: parseInt(value) })}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <SelectItem key={num} value={String(num)}>
                        {num} 格
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-white text-xs font-semibold mb-1 block">輪播模式</label>
                <Select value={formData.carouselMode} onValueChange={(value) => setFormData({ ...formData, carouselMode: value as "single" | "2items" | "3items" | "6items" | "8items" | "static" })}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="static">靜態展示</SelectItem>
                    <SelectItem value="single">單件輪播</SelectItem>
                    <SelectItem value="2items">2 件輪播</SelectItem>
                    <SelectItem value="3items">3 件輪播</SelectItem>
                    <SelectItem value="6items">6 件輪播</SelectItem>
                    <SelectItem value="8items">8 件輪播</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-white text-xs font-semibold mb-1 block">輪播間隔（秒）</label>
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.intervalSeconds}
                  onChange={(e) => setFormData({ ...formData, intervalSeconds: parseInt(e.target.value) })}
                  className="bg-slate-700 border-slate-600 text-white h-9 text-sm"
                />
              </div>

              <div className="border-t border-slate-700 pt-4">
                <h3 className="text-white text-xs font-semibold mb-3">背景設定</h3>

                <div className="mb-3">
                  <label className="text-white text-xs font-semibold mb-1 block">底色</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="bg-slate-700 border-slate-600 h-9 w-12 cursor-pointer rounded"
                    />
                    <Input
                      type="text"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      placeholder="#000000"
                      className="bg-slate-700 border-slate-600 text-white flex-1 h-9 text-sm"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="text-white text-xs font-semibold mb-1 block">底圖 URL</label>
                  <Input
                    type="url"
                    value={formData.backgroundImageUrl}
                    onChange={(e) => setFormData({ ...formData, backgroundImageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="bg-slate-700 border-slate-600 text-white h-9 text-sm"
                  />
                </div>

                <div>
                  <label className="text-white text-xs font-semibold mb-1 block">底圖透明度: {formData.backgroundImageOpacity}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.backgroundImageOpacity}
                    onChange={(e) => setFormData({ ...formData, backgroundImageOpacity: parseInt(e.target.value) })}
                    className="w-full h-2"
                  />
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <h3 className="text-white text-xs font-semibold mb-3">過渡動畫</h3>

                <div>
                  <label className="text-white text-xs font-semibold mb-1 block">動畫類型</label>
                  <Select value={formData.animationType} onValueChange={(value) => setFormData({ ...formData, animationType: value as "fade" | "slide" })}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="fade">淡入淡出</SelectItem>
                      <SelectItem value="slide">滑動進入</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <h3 className="text-white text-xs font-semibold mb-3">跑馬燈設定</h3>

                <div className="mb-3">
                  <label className="text-white text-xs font-semibold mb-1 block">
                    <input
                      type="checkbox"
                      checked={formData.marqueeActive}
                      onChange={(e) => setFormData({ ...formData, marqueeActive: e.target.checked })}
                      className="mr-2"
                    />
                    啟用跑馬燈
                  </label>
                </div>

                {formData.marqueeActive && (
                  <>
                    <div className="mb-3">
                      <label className="text-white text-xs font-semibold mb-1 block">跑馬燈文字</label>
                      <Input
                        type="text"
                        value={formData.marqueeText}
                        onChange={(e) => setFormData({ ...formData, marqueeText: e.target.value })}
                        placeholder="輸入跑馬燈文字..."
                        className="bg-slate-700 border-slate-600 text-white h-9 text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-white text-xs font-semibold mb-1 block">滾動速度: {formData.marqueeSpeed}</label>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={formData.marqueeSpeed}
                        onChange={(e) => setFormData({ ...formData, marqueeSpeed: parseInt(e.target.value) })}
                        className="w-full h-2"
                      />
                    </div>
                  </>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={updateMutation.isPending}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold h-9 text-sm"
              >
                保存配置
              </Button>
            </div>
          </div>

          {/* Column 2: Product Selection (1.5/4 width) */}
          <div className="lg:col-span-1 flex flex-col">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex-1 overflow-y-auto">
              <h2 className="text-white text-sm font-semibold mb-3 sticky top-0 bg-slate-800 pb-2">選擇商品</h2>
              {products && products.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {products.map((product: any) => (
                    <label
                      key={product.id}
                      className="flex items-center gap-2 p-2 bg-slate-700 rounded cursor-pointer hover:bg-slate-600 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedProductIds.includes(product.id)}
                        onChange={() => toggleProduct(product.id)}
                        className="w-4 h-4 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-xs truncate">{product.name}</p>
                        <p className="text-amber-500 text-xs">NT$ {product.price}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">尚無商品</p>
              )}
            </div>
          </div>

          {/* Column 3 & 4: Live Preview (2/4 width) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex-1 flex flex-col">
              <h2 className="text-white text-sm font-semibold mb-3">即時預覽</h2>
              <div className="bg-black rounded-lg overflow-hidden border-2 border-amber-500/30 flex-1">
                {products && (
                  <LayoutPreview
                    gridCount={formData.gridCount}
                    carouselMode={formData.carouselMode}
                    intervalSeconds={formData.intervalSeconds}
                    selectedProductIds={formData.selectedProductIds}
                    backgroundColor={formData.backgroundColor}
                    backgroundImageUrl={formData.backgroundImageUrl}
                    backgroundImageOpacity={formData.backgroundImageOpacity}
                    animationType={formData.animationType}
                    products={products}
                  />
                )}
              </div>
            </div>

            {/* Preview Info */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-400">當前設定</p>
                  <p className="text-white font-semibold">
                    {formData.gridCount} 格 • {formData.carouselMode === "static" ? "靜態" : formData.carouselMode === "single" ? "單件" : formData.carouselMode === "2items" ? "2件" : formData.carouselMode === "3items" ? "3件" : formData.carouselMode === "6items" ? "6件" : "8件"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">已選商品</p>
                  <p className="text-amber-500 font-semibold">{formData.selectedProductIds.length} / {products?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
