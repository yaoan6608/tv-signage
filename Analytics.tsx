import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Eye, MousePointer2 } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Analytics() {
  const [, navigate] = useLocation();
  const [timeRange, setTimeRange] = useState(7);
  const [sortBy, setSortBy] = useState<"impressions" | "clicks" | "clickRate">("impressions");

  const { data: summaries, isLoading } = trpc.analytics.getAllProductsSummary.useQuery();
  const { data: stats } = trpc.analytics.getProductStats.useQuery({ days: timeRange });

  // 準備圖表數據
  const chartData = stats
    ? Object.entries(
        stats.reduce(
          (acc, stat) => {
            const date = stat.eventDate;
            if (!acc[date]) acc[date] = { date, impressions: 0, clicks: 0 };
            if (stat.eventType === "impression") acc[date].impressions += stat.count;
            if (stat.eventType === "click") acc[date].clicks += stat.count;
            return acc;
          },
          {} as Record<string, { date: string; impressions: number; clicks: number }>
        )
      )
        .map(([, data]) => data)
        .sort((a, b) => a.date.localeCompare(b.date))
    : [];

  // 排序商品
  const sortedProducts = summaries
    ? [...summaries].sort((a, b) => {
        if (sortBy === "impressions") return b.impressions - a.impressions;
        if (sortBy === "clicks") return b.clicks - a.clicks;
        return b.clickRate - a.clickRate;
      })
    : [];

  const trackMutation = trpc.analytics.trackEvent.useMutation();

  const handleProductClick = (productId: number) => {
    trackMutation.mutate({
      productId,
      eventType: "click",
    });
  };

  // 計算總數
  const totalImpressions = sortedProducts.reduce((sum, p) => sum + p.impressions, 0);
  const totalClicks = sortedProducts.reduce((sum, p) => sum + p.clicks, 0);
  const avgClickRate = sortedProducts.length > 0
    ? (sortedProducts.reduce((sum, p) => sum + p.clickRate, 0) / sortedProducts.length).toFixed(2)
    : "0";

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* 標題 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            size="icon"
            className="text-amber-500 hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold text-amber-500">數據統計</h1>
        </div>
      </div>

      {/* 時間範圍選擇 */}
      <div className="flex gap-2 mb-6">
        {[7, 14, 30].map((days) => (
          <Button
            key={days}
            onClick={() => setTimeRange(days)}
            className={`${
              timeRange === days
                ? "bg-amber-500 text-black hover:bg-amber-600"
                : "bg-slate-700 text-white hover:bg-slate-600"
            }`}
          >
            {days} 天
          </Button>
        ))}
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 border border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">總曝光次數</p>
              <p className="text-2xl font-bold text-amber-500">{totalImpressions.toLocaleString()}</p>
            </div>
            <Eye className="w-8 h-8 text-amber-500/50" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">總點擊次數</p>
              <p className="text-2xl font-bold text-amber-500">{totalClicks.toLocaleString()}</p>
            </div>
            <MousePointer2 className="w-8 h-8 text-amber-500/50" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">平均點擊率</p>
              <p className="text-2xl font-bold text-amber-500">{avgClickRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-amber-500/50" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">商品數量</p>
              <p className="text-2xl font-bold text-amber-500">{sortedProducts.length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-amber-500/50" />
          </div>
        </div>
      </div>

      {/* 圖表 */}
      {chartData.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold text-amber-500 mb-4">曝光與點擊趨勢</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                labelStyle={{ color: "#fbbf24" }}
              />
              <Legend />
              <Line type="monotone" dataKey="impressions" stroke="#fbbf24" strokeWidth={2} />
              <Line type="monotone" dataKey="clicks" stroke="#f97316" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 排序選項 */}
      <div className="flex gap-2 mb-6">
        <Button
          onClick={() => setSortBy("impressions")}
          className={`${
            sortBy === "impressions"
              ? "bg-amber-500 text-black hover:bg-amber-600"
              : "bg-slate-700 text-white hover:bg-slate-600"
          }`}
        >
          按曝光排序
        </Button>
        <Button
          onClick={() => setSortBy("clicks")}
          className={`${
            sortBy === "clicks"
              ? "bg-amber-500 text-black hover:bg-amber-600"
              : "bg-slate-700 text-white hover:bg-slate-600"
          }`}
        >
          按點擊排序
        </Button>
        <Button
          onClick={() => setSortBy("clickRate")}
          className={`${
            sortBy === "clickRate"
              ? "bg-amber-500 text-black hover:bg-amber-600"
              : "bg-slate-700 text-white hover:bg-slate-600"
          }`}
        >
          按點擊率排序
        </Button>
      </div>

      {/* 商品列表 */}
      <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900">
              <th className="px-4 py-3 text-left text-amber-500 font-semibold">商品名稱</th>
              <th className="px-4 py-3 text-right text-amber-500 font-semibold">曝光次數</th>
              <th className="px-4 py-3 text-right text-amber-500 font-semibold">點擊次數</th>
              <th className="px-4 py-3 text-right text-amber-500 font-semibold">點擊率</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  載入中...
                </td>
              </tr>
            ) : sortedProducts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  暫無數據
                </td>
              </tr>
            ) : (
              sortedProducts.map((product, idx) => (
                <tr
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className={`border-b border-slate-700 hover:bg-slate-700/50 transition-colors cursor-pointer ${
                    idx % 2 === 0 ? "bg-slate-800/50" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-white">{product.name}</td>
                  <td className="px-4 py-3 text-right text-amber-500">{product.impressions.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-orange-500">{product.clicks.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-green-500">{product.clickRate.toFixed(2)}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
