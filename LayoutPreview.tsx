import { useState, useEffect } from "react";

interface LayoutPreviewProps {
  gridCount: number;
  carouselMode: "single" | "2items" | "3items" | "6items" | "8items" | "static";
  intervalSeconds: number;
  selectedProductIds: number[];
  backgroundColor: string;
  backgroundImageUrl: string;
  backgroundImageOpacity: number;
  animationType: "fade" | "slide";
  products: any[];
}

export default function LayoutPreview({
  gridCount,
  carouselMode,
  intervalSeconds,
  selectedProductIds,
  backgroundColor,
  backgroundImageUrl,
  backgroundImageOpacity,
  animationType,
  products,
}: LayoutPreviewProps) {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [displayProducts, setDisplayProducts] = useState<any[]>([]);

  // 根據選擇的商品過濾，並根據排序順序和置頂狀態排序（對齐 Display.tsx）
  useEffect(() => {
    if (selectedProductIds.length === 0) {
      setDisplayProducts([]);
      return;
    }

    let filtered = products.filter((p) => selectedProductIds.includes(p.id));

    // 根據排序順序和置頂狀態排序（完全對齐 Display.tsx）
    const sorted = filtered.sort((a: any, b: any) => {
      // 置頂商品優先顯示
      if (a.isPinned === "true" && b.isPinned !== "true") return -1;
      if (a.isPinned !== "true" && b.isPinned === "true") return 1;

      // 根據 displayOrder 排序
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    });

    setDisplayProducts(sorted);
    setCarouselIndex(0);
  }, [selectedProductIds, products]);

  // 輪播邏輯
  useEffect(() => {
    if (displayProducts.length === 0 || carouselMode === "static") return;

    const interval = setInterval(() => {
      setCarouselIndex((prev) => {
        let maxIndex = displayProducts.length;

        if (carouselMode === "2items") {
          maxIndex = Math.ceil(displayProducts.length / 2);
        } else if (carouselMode === "3items") {
          maxIndex = Math.ceil(displayProducts.length / 3);
        } else if (carouselMode === "6items") {
          maxIndex = Math.ceil(displayProducts.length / 6);
        } else if (carouselMode === "8items") {
          maxIndex = Math.ceil(displayProducts.length / 8);
        }

        return (prev + 1) % Math.max(1, maxIndex);
      });
    }, intervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [displayProducts, carouselMode, intervalSeconds]);

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

  const gridClass = getGridClass(gridCount);

  const getDisplayedProducts = () => {
    if (!displayProducts.length) return [];

    switch (carouselMode) {
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
        return displayProducts.slice(0, gridCount);
    }
  };

  const productsToShow = getDisplayedProducts();

  // 背景樣式
  const backgroundStyle: React.CSSProperties = {
    backgroundColor,
    backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  };

  const overlayStyle: React.CSSProperties = backgroundImageUrl
    ? {
        backgroundColor: `rgba(0, 0, 0, ${1 - backgroundImageOpacity / 100})`,
      }
    : {};

  // 單件商品展示（對齐 Display.tsx）
  const renderSingleProductLayout = () => {
    if (carouselMode !== "single" || productsToShow.length === 0) return null;

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

  // 多件商品展示（對齐 Display.tsx）
  const renderGridLayout = () => {
    if (carouselMode === "single") return null;

    const animationClass = animationType === "slide" 
      ? "animate-slide-in"
      : "animate-fade-in";

    return (
      <div className={`grid ${gridClass} gap-4 w-full h-full`}>
        {productsToShow.map((product: any, index: number) => (
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
        ))}
      </div>
    );
  };

  // 空狀態
  if (selectedProductIds.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-lg border-2 border-dashed border-slate-600">
        <div className="text-center">
          <p className="text-gray-400 text-sm">請選擇商品以預覽效果</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden rounded-lg relative" style={backgroundStyle}>
      {/* 底圖透明度覆蓋層 */}
      {backgroundImageUrl && (
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

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-in {
          animation: slideIn 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>

      <div className="flex-1 p-8 flex items-center justify-center relative z-10 h-full">
        {carouselMode === "single" ? renderSingleProductLayout() : renderGridLayout()}
      </div>

      {/* 輪播指示器 */}
      {carouselMode !== "static" && displayProducts.length > 0 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1 z-20">
          {carouselMode === "single" ? (
            <div className="text-xs text-amber-500 bg-black/50 px-2 py-1 rounded transition-all duration-300">
              {carouselIndex + 1} / {displayProducts.length}
            </div>
          ) : (
            <div className="text-xs text-amber-500 bg-black/50 px-2 py-1 rounded transition-all duration-300">
              {carouselMode === "2items" ? "2 件輪播" : carouselMode === "3items" ? "3 件輪播" : carouselMode === "6items" ? "6 件輪播" : "8 件輪播"} - 頁 {carouselIndex + 1} / {Math.ceil(displayProducts.length / (carouselMode === "2items" ? 2 : carouselMode === "3items" ? 3 : carouselMode === "6items" ? 6 : 8))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
