import { useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";

export function useAutoRefresh(intervalSeconds: number = 30) {
  const layoutQuery = trpc.layout.get.useQuery();
  const marqueeQuery = trpc.marquee.get.useQuery();
  const productsQuery = trpc.products.list.useQuery();

  const refetchAll = useCallback(() => {
    layoutQuery.refetch().catch(() => {
      // 靜默處理失敗
    });
    marqueeQuery.refetch().catch(() => {});
    productsQuery.refetch().catch(() => {});
  }, [layoutQuery, marqueeQuery, productsQuery]);

  useEffect(() => {
    const interval = setInterval(refetchAll, intervalSeconds * 1000);
    return () => clearInterval(interval);
  }, [intervalSeconds, refetchAll]);

  return {
    layout: layoutQuery.data,
    marquee: marqueeQuery.data,
    products: productsQuery.data,
    isLoading: layoutQuery.isLoading || marqueeQuery.isLoading || productsQuery.isLoading,
  };
}
