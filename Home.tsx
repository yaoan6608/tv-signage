import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { Package, Tag, Settings, Tv, Grid3x3, MessageSquare, TrendingUp, Upload, Shuffle } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-white">載入中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-amber-500 mb-4">商品廣告展示系統</h1>
          <p className="text-gray-300 mb-8">管理您的店鋪商品，在電視上展示精美廣告</p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 py-6 text-lg"
          >
            登入管理系統
          </Button>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      title: "商品管理",
      description: "新增、編輯、刪除商品",
      icon: Package,
      color: "bg-blue-500",
      path: "/products",
    },
    {
      title: "標籤設定",
      description: "設定 1-7 個自定義標籤",
      icon: Tag,
      color: "bg-purple-500",
      path: "/tags",
    },
    {
      title: "自定義欄位",
      description: "新增商品欄位（功效、成份等）",
      icon: Grid3x3,
      color: "bg-green-500",
      path: "/fields",
    },
    {
      title: "版面配置",
      description: "設定電視端顯示格數與輪播模式",
      icon: Tv,
      color: "bg-orange-500",
      path: "/layout",
    },
    {
      title: "跑馬燈設定",
      description: "設定底部跑馬燈文字與速度",
      icon: MessageSquare,
      color: "bg-pink-500",
      path: "/marquee",
    },
    {
      title: "電視展示預覽",
      description: "預覽電視端廣告展示效果",
      icon: Settings,
      color: "bg-indigo-500",
      path: "/display",
    },
    {
      title: "數據統計",
      description: "查看商品曝光率與點擊率",
      icon: TrendingUp,
      color: "bg-amber-500",
      path: "/analytics",
    },
    {
      title: "批量上傳",
      description: "一次上傳多張圖片，自動生成文案",
      icon: Upload,
      color: "bg-cyan-500",
      path: "/batch-upload",
    },
    {
      title: "商品排序",
      description: "拖曳調整商品順序，置頂重要商品",
      icon: Shuffle,
      color: "bg-teal-500",
      path: "/product-sort",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-black border-b-2 border-amber-500 py-6 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-amber-500">商品廣告展示系統</h1>
            <p className="text-gray-400 mt-1">歡迎，{user?.name || "用戶"}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer group"
              >
                <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{item.title}</h2>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
