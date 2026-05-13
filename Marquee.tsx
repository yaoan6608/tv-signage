import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Marquee() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    text: "",
    scrollSpeed: 50,
    isActive: true,
  });

  const { data: marquee, isLoading } = trpc.marquee.get.useQuery();
  const updateMutation = trpc.marquee.update.useMutation();

  useEffect(() => {
    if (marquee) {
      setFormData({
        text: marquee.text,
        scrollSpeed: marquee.scrollSpeed,
        isActive: marquee.isActive === "true",
      });
    }
  }, [marquee]);

  const handleSubmit = async () => {
    if (!formData.text) {
      toast.error("請填寫跑馬燈文字");
      return;
    }

    try {
      await updateMutation.mutateAsync(formData);
      toast.success("跑馬燈已保存");
      // 觸發實時更新事件
      window.dispatchEvent(new CustomEvent("marquee-updated", { detail: { type: "update" } }));
    } catch (error) {
      toast.error("保存失敗");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-black border-b-2 border-amber-500 py-6 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-gray-400 hover:text-amber-500"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-3xl font-bold text-amber-500">跑馬燈設定</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        {isLoading ? (
          <div className="text-center text-gray-400">載入中...</div>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 space-y-6">
            {/* Preview */}
            <div className="bg-black rounded-lg p-4 border border-amber-500/30 overflow-hidden">
              <div className="text-amber-500 text-sm mb-2">預覽</div>
              <div className="h-12 bg-slate-900 rounded flex items-center overflow-hidden">
                <div
                  className="text-white font-bold whitespace-nowrap"
                  style={{
                    animation: `scroll ${Math.max(10, 100 / formData.scrollSpeed)}s linear infinite`,
                  }}
                >
                  {formData.text || "跑馬燈文字預覽"}
                </div>
              </div>
              <style>{`
                @keyframes scroll {
                  0% { transform: translateX(100%); }
                  100% { transform: translateX(-100%); }
                }
              `}</style>
            </div>

            {/* Form */}
            <div>
              <label className="text-white text-sm font-semibold mb-2 block">跑馬燈文字</label>
              <Textarea
                placeholder="輸入要在電視端顯示的跑馬燈文字"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white min-h-24"
              />
            </div>

            <div>
              <label className="text-white text-sm font-semibold mb-2 block">滾動速度</label>
              <div className="flex items-center gap-4">
                <Input
                  type="range"
                  min="10"
                  max="200"
                  value={formData.scrollSpeed}
                  onChange={(e) => setFormData({ ...formData, scrollSpeed: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-white font-semibold w-16 text-right">{formData.scrollSpeed}</span>
              </div>
              <p className="text-gray-400 text-xs mt-2">速度越高滾動越快（10-200）</p>
            </div>

            <label className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-white font-semibold">啟用跑馬燈</span>
            </label>

            <Button
              onClick={handleSubmit}
              disabled={updateMutation.isPending}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-6 text-lg"
            >
              保存設定
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
