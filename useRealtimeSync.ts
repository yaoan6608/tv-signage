import { useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";

/**
 * 實時同步 Hook - 監聽後台配置變更
 * 使用輪詢機制確保電視端能立即獲得最新配置
 * 同時監聽本地 CustomEvent 以支援跨頁面通知
 */
export function useRealtimeSync(
  onLayoutUpdate?: (layout: any) => void,
  onMarqueeUpdate?: (marquee: any) => void,
  onProductsUpdate?: (products: any[]) => void
) {
  const lastLayoutVersionRef = useRef<string>("");
  const lastMarqueeVersionRef = useRef<string>("");
  const lastProductsVersionRef = useRef<string>("");

  // 使用 tRPC 查詢配置，設定 3 秒輪詢間隔
  const layoutQuery = trpc.layout.get.useQuery(undefined, {
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });

  const marqueeQuery = trpc.marquee.get.useQuery(undefined, {
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });

  // 商品清單也納入 3 秒輪詢
  const productsQuery = trpc.products.list.useQuery(undefined, {
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });

  // 監聽版面配置變更
  useEffect(() => {
    if (layoutQuery.data) {
      const currentVersion = JSON.stringify(layoutQuery.data);
      if (currentVersion !== lastLayoutVersionRef.current) {
        lastLayoutVersionRef.current = currentVersion;
        onLayoutUpdate?.(layoutQuery.data);
      }
    }
  }, [layoutQuery.data, onLayoutUpdate]);

  // 監聽跑馬燈設定變更
  useEffect(() => {
    if (marqueeQuery.data) {
      const currentVersion = JSON.stringify(marqueeQuery.data);
      if (currentVersion !== lastMarqueeVersionRef.current) {
        lastMarqueeVersionRef.current = currentVersion;
        onMarqueeUpdate?.(marqueeQuery.data);
      }
    }
  }, [marqueeQuery.data, onMarqueeUpdate]);

  // 監聽商品清單變更
  useEffect(() => {
    if (productsQuery.data) {
      const currentVersion = JSON.stringify(productsQuery.data);
      if (currentVersion !== lastProductsVersionRef.current) {
        lastProductsVersionRef.current = currentVersion;
        onProductsUpdate?.(productsQuery.data);
      }
    }
  }, [productsQuery.data, onProductsUpdate]);

  // 監聽本地 CustomEvent（用於同一瀏覽器的跨頁面通知）
  useEffect(() => {
    const handleProductUpdate = () => {
      layoutQuery.refetch();
      productsQuery.refetch();
    };

    const handleLayoutUpdate = () => {
      layoutQuery.refetch();
    };

    const handleMarqueeUpdate = () => {
      marqueeQuery.refetch();
    };

    window.addEventListener("product-updated", handleProductUpdate);
    window.addEventListener("layout-updated", handleLayoutUpdate);
    window.addEventListener("marquee-updated", handleMarqueeUpdate);

    return () => {
      window.removeEventListener("product-updated", handleProductUpdate);
      window.removeEventListener("layout-updated", handleLayoutUpdate);
      window.removeEventListener("marquee-updated", handleMarqueeUpdate);
    };
  }, [layoutQuery, marqueeQuery, productsQuery]);

  return {
    layout: layoutQuery.data,
    marquee: marqueeQuery.data,
    products: productsQuery.data,
    isLoading: layoutQuery.isLoading || marqueeQuery.isLoading || productsQuery.isLoading,
    isError: layoutQuery.isError || marqueeQuery.isError || productsQuery.isError,
  };
}
