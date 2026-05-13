import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Tags() {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", color: "#FFB703" });

  const { data: tags, isLoading, refetch } = trpc.tags.list.useQuery();
  const createMutation = trpc.tags.create.useMutation();
  const updateMutation = trpc.tags.update.useMutation();
  const deleteMutation = trpc.tags.delete.useMutation();

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("請填寫標籤名稱");
      return;
    }

    if (tags && tags.length >= 7 && !editingId) {
      toast.error("最多只能建立 7 個標籤");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...formData });
        toast.success("標籤已更新");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("標籤已新增");
      }
      setOpen(false);
      setFormData({ name: "", color: "#FFB703" });
      setEditingId(null);
      refetch();
    } catch (error) {
      toast.error("操作失敗");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("確定要刪除此標籤嗎？")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("標籤已刪除");
        refetch();
      } catch (error) {
        toast.error("刪除失敗");
      }
    }
  };

  const handleEdit = (tag: any) => {
    setEditingId(tag.id);
    setFormData({ name: tag.name, color: tag.color });
    setOpen(true);
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
            <h1 className="text-3xl font-bold text-amber-500">標籤設定</h1>
            <span className="text-gray-400">({tags?.length || 0}/7)</span>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingId(null);
                  setFormData({ name: "", color: "#FFB703" });
                }}
                disabled={!editingId && tags && tags.length >= 7}
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold disabled:opacity-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                新增標籤
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">{editingId ? "編輯標籤" : "新增標籤"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="標籤名稱（例如：特價商品、店長推薦）"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <div className="flex gap-2 items-center">
                  <label className="text-white">顏色：</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <span className="text-gray-400 text-sm">{formData.color}</span>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold"
                >
                  {editingId ? "更新標籤" : "新增標籤"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tags List */}
      <div className="max-w-7xl mx-auto py-8 px-4">
        {isLoading ? (
          <div className="text-center text-gray-400">載入中...</div>
        ) : tags && tags.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tags.map((tag: any) => (
              <div key={tag.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-white font-semibold">{tag.name}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(tag)}
                    className="border-slate-600 text-gray-300 hover:text-amber-500"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(tag.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <p>尚無標籤，請新增第一個標籤</p>
          </div>
        )}
      </div>
    </div>
  );
}
