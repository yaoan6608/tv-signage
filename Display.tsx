import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";

export default function Display() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [displayProducts, setDisplayProducts] = useState<any[]>([]);
  const [trackedProductIds, setTrackedProductIds] = useState<number[]>([]);

  // 使用實時同步 Hook 監聽所有配置變更
  const { layout, products: allProducts } = useRealtimeSync();

  // 根據版面配置過濾商品，並根據排序順序和置頂狀態排序
  useEffect(() => {
    let filtered = allProducts || [];
    
    // 根據版面配置選擇的商品
    if (layout?.selectedProductIds && layout.selectedProductIds.length > 0) {
      filtered = filtered.filter((p: any) => layout.selectedProductIds.includes(p.id));
    }
    
    // 根據排序順序和置頂狀態排序
    const sorted = filtered.sort((a: any, b: any) => {
      // 置頂商品優先顯示
      if (a.isPinned === "true" && b.isPinned !== "true") return -1;
      if (a.isPinned !== "true" && b.isPinned === "true") return 1;
      
      // 根據 displayOrder 排序
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    });
    
    setDisplayProducts(sorted);
    setCarouselIndex(0);
  }, [allProducts, layout]);

  // 輪播邏輯
  useEffect(() => {
    if (displayProducts.length === 0 || layout?.carouselMode === "static") return;

    const interval = setInterval(() => {
      setCarouselIndex((prev) => {
        // 根據輪播模式計算最大索引
        let maxIndex = displayProducts.length;
        
        if (layout?.carouselMode === "2items") {
          maxIndex = Math.ceil(displayProducts.length / 2);
        } else if (layout?.carouselMode === "3items") {
          maxIndex = Math.ceil(displayProducts.length / 3);
        } else if (layout?.carouselMode === "6items") {
          maxIndex = Math.ceil(displayProducts.length / 6);
        } else if (layout?.carouselMode === "8items") {
          maxIndex = Math.ceil(displayProducts.length / 8);
        }
        
        return (prev + 1) % Math.max(1, maxIndex);
      });
    }, (layout?.intervalSeconds || 8) * 1000);

    return () => clearInterval(interval);
  }, [displayProducts, layout]);

  const getGridClass = (count: number) => {
    const gridClasses: Record<number, string> = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-2 grid-rows-2",
      5: "grid-cols-3 grid-rows-2",
      6: "grid-cols-3 grid-rows-2",
      7: "grid-cols-4 grid-rows-2",
      8: "grid-cols-4 grid-rows-2",
    };
    return gridClasses[count] || "grid-cols-3 grid-rows-2";
  };

  const gridClass = getGridClass(layout?.gridCount || 6);

  const getDisplayedProducts = () => {
    if (!displayProducts.length) return [];

    switch (layout?.carouselMode) {
      case "single":
        return [displayProducts[carouselIndex % displayProducts.length]];
      case "2items": {
        const itemsPerPage = 2;
        const startIndex = (carouselIndex * itemsPerPage) % displayProducts.length;
        const items = [];
        
        for (let i = 0; i < itemsPerPage && items.length < displayProducts.length; i++) {
          items.push(displayProducts[(startIndex + i) % displayProducts.length]);
        }
        
        return items;
      }
      case "3items": {
        const itemsPerPage = 3;
        const startIndex = (carouselIndex * itemsPerPage) % displayProducts.length;
        const items = [];
        
        for (let i = 0; i < itemsPerPage && items.length < displayProducts.length; i++) {
          items.push(displayProducts[(startIndex + i) % displayProducts.length]);
        }
        
        return items;
      }
      case "6items": {
        const itemsPerPage = 6;
        const startIndex = (carouselIndex * itemsPerPage) % displayProducts.length;
        const items = [];
        
        for (let i = 0; i < itemsPerPage && items.length < displayProducts.length; i++) {
          items.push(displayProducts[(startIndex + i) % displayProducts.length]);
        }
        
        return items;
      }
      case "8items": {
        const itemsPerPage = 8;
        const startIndex = (carouselIndex * itemsPerPage) % displayProducts.length;
        const items = [];
        
        for (let i = 0; i < itemsPerPage && items.length < displayProducts.length; i++) {
          items.push(displayProducts[(startIndex + i) % displayProducts.length]);
        }
        
        return items;
      }
      case "static":
      default:
        return displayProducts.slice(0, layout?.gridCount || 6);
    }
  };

  const productsToShow = getDisplayedProducts();
  const trackMutation = trpc.analytics.trackEvent.useMutation();

  // 追蹤商品曝光事件，防止重複灌點
  useEffect(() => {
    if (productsToShow.length === 0) return;

    const currentProductIds = productsToShow.map((p: any) => p.id);
    const newProductIds = currentProductIds.filter((id) => !trackedProductIds.includes(id));

    if (newProductIds.length > 0) {
      newProductIds.forEach((id) => {
        trackMutation.mutate({
          eventType: "impression",
          productId: id,
        });
      });

      setTrackedProductIds((prev) => [...prev, ...newProductIds]);
    }
  }, [productsToShow, trackedProductIds, trackMutation]);

  const gridClass2 = getGridClass(layout?.gridCount || 6);
  const animationType = (layout?.animationType || "fade") as "fade" | "slide";

  const renderSingleProductLayout = () => {
    if (layout?.carouselMode !== "single" || productsToShow.length === 0) return null;

    const product = productsToShow[0];

    return (
      <div className="w-full h-full flex items-center justify-center gap-8 px-8">
        {/* 左邊：商品圖片 */}
        <div className="flex-1 h-full flex items-center justify-center">
          {product.imageUrl && (
            <div className="w-full h-full overflow-hidden rounded-lg border-2 border-amber-500/30 bg-black animate-fade-in">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23333' width='100' height='100'/%3E%3C/svg%3E";
                }}
              />
            </div>
          )}
        </div>

        {/* 右邊：黑色區域顯示商品信息 */}
        <div className="flex-1 h-full flex flex-col justify-center bg-black/60 rounded-lg border-2 border-amber-500/30 p-8 animate-fade-in">
          {/* 商品名稱 */}
          <h2 className="text-amber-500 font-bold text-4xl mb-4 line-clamp-2">{product.name}</h2>

          {/* 商品標題/描述 */}
          {product.description && (
            <p className="text-white text-lg mb-6 line-clamp-4">{product.description}</p>
          )}

          {/* 商品價格 */}
          <p className="text-amber-500 text-5xl font-bold">NT$ {product.price}</p>
        </div>
      </div>
    );
  };

  const renderGridLayout = () => {
    if (layout?.carouselMode === "single") return null;

    return (
      <div className={`grid ${gridClass2} gap-4 w-full h-full`}>
        {productsToShow.map((product: any, index: number) => {
          const animationClass = animationType === "slide" 
            ? "animate-slide-in"
            : "animate-fade-in";

          return (
            <div
              key={product.id}
              className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg overflow-hidden border-2 border-amber-500/30 hover:border-amber-500 transition-all flex flex-col transform ${animationClass}`}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {product.imageUrl && (
                <div className="flex-1 overflow-hidden bg-black">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23333' width='100' height='100'/%3E%3C/svg%3E";
                    }}
                  />
                </div>
              )}

              <div className="p-3 bg-black/80 flex flex-col justify-end">
                <h2 className="text-amber-500 font-bold text-base mb-1 line-clamp-1">{product.name}</h2>
                <p className="text-white text-xl font-bold mb-1">NT$ {product.price}</p>
                {product.description && (
                  <p className="text-gray-300 text-xs line-clamp-2">{product.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const backgroundStyle: React.CSSProperties = {
    backgroundColor: layout?.backgroundColor || "#000000",
    backgroundImage: layout?.backgroundImageUrl ? `url(${layout.backgroundImageUrl})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  };

  const overlayStyle: React.CSSProperties = layout?.backgroundImageUrl
    ? {
        backgroundColor: `rgba(0, 0, 0, ${1 - (layout.backgroundImageOpacity || 100) / 100})`,
      }
    : {};

  // 獲取跑馬燈數據（從上一個 useRealtimeSync 中獲取）
  const marquee = layout?.marquee;

  // 計算跑馬燈動畫速度（scrollSpeed 1-100，轉換為 duration 50-5 秒，速度越高越快）
  const marqueeSpeed = marquee?.scrollSpeed || 50;
  const marqueeDuration = 50 - (marqueeSpeed - 1) * 0.45; // 速度 1 時 50 秒，速度 100 時 5 秒

  return (
    <div className="w-full h-screen overflow-hidden relative" style={backgroundStyle}>
      {/* 底圖透明度覆蓋層 */}
      {layout?.backgroundImageUrl && (
        <div className="absolute inset-0 pointer-events-none" style={overlayStyle} />
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes marqueeScroll {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-in {
          animation: slideIn 0.6s ease-out forwards;
          opacity: 0;
        }

        .marquee-text {
          animation: marqueeScroll ${marqueeDuration}s linear infinite;
          white-space: nowrap;
          display: inline-block;
        }
      `}</style>

      <div className="flex-1 p-8 flex items-center justify-center relative z-10 h-full">
        {layout?.carouselMode === "single" ? renderSingleProductLayout() : renderGridLayout()}
      </div>

      {/* 跑馬燈 */}
      {marquee?.isActive === "true" && marquee?.text && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-amber-500 py-3 px-4 overflow-hidden z-20">
          <div className="marquee-text text-lg font-semibold">
            {marquee.text}
          </div>
        </div>
      )}

      {/* 輪播指示器 */}
      {layout?.carouselMode !== "static" && displayProducts.length > 0 && (
        <div className={`absolute left-0 right-0 flex justify-center gap-1 z-20 ${marquee?.isActive === "true" && marquee?.text ? "bottom-20" : "bottom-4"} transition-all duration-300`}>
          {layout?.carouselMode === "single" ? (
            <div className="text-xs text-amber-500 bg-black/50 px-2 py-1 rounded transition-all duration-300">
              {carouselIndex + 1} / {displayProducts.length}
            </div>
          ) : (
            <div className="text-xs text-amber-500 bg-black/50 px-2 py-1 rounded transition-all duration-300">
              {layout?.carouselMode === "2items" ? "2 件輪播" : layout?.carouselMode === "3items" ? "3 件輪播" : layout?.carouselMode === "6items" ? "6 件輪播" : "8 件輪播"} - 頁 {carouselIndex + 1} / {Math.ceil(displayProducts.length / (layout?.carouselMode === "2items" ? 2 : layout?.carouselMode === "3items" ? 3 : layout?.carouselMode === "6items" ? 6 : 8))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
