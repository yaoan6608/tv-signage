import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function CustomFields() {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    fieldType: "text" as const,
    isRequired: false,
  });

  const { data: fields, isLoading, refetch } = trpc.customFields.list.useQuery();
  const createMutation = trpc.customFields.create.useMutation();
  const updateMutation = trpc.customFields.update.useMutation();
  const deleteMutation = trpc.customFields.delete.useMutation();

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("請填寫欄位名稱");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...formData });
        toast.success("欄位已更新");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("欄位已新增");
      }
      setOpen(false);
      setFormData({ name: "", fieldType: "text", isRequired: false });
      setEditingId(null);
      refetch();
    } catch (error) {
      toast.error("操作失敗");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("確定要刪除此欄位嗎？")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("欄位已刪除");
        refetch();
      } catch (error) {
        toast.error("刪除失敗");
      }
    }
  };

  const handleEdit = (field: any) => {
    setEditingId(field.id);
    setFormData({
      name: field.name,
      fieldType: field.fieldType,
      isRequired: field.isRequired,
    });
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
            <h1 className="text-3xl font-bold text-amber-500">自定義欄位</h1>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingId(null);
                  setFormData({ name: "", fieldType: "text", isRequired: false });
                }}
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
              >
                <Plus className="w-4 h-4 mr-2" />
                新增欄位
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">{editingId ? "編輯欄位" : "新增欄位"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="欄位名稱（例如：功效、成份、備註）"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <div>
                  <label className="text-white text-sm mb-2 block">欄位類型</label>
                  <Select value={formData.fieldType} onValueChange={(value: any) => setFormData({ ...formData, fieldType: value })}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="text">單行文字</SelectItem>
                      <SelectItem value="textarea">多行文字</SelectItem>
                      <SelectItem value="number">數字</SelectItem>
                      <SelectItem value="select">下拉選單</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <label className="flex items-center gap-2 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isRequired}
                    onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span>必填欄位</span>
                </label>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold"
                >
                  {editingId ? "更新欄位" : "新增欄位"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Fields List */}
      <div className="max-w-7xl mx-auto py-8 px-4">
        {isLoading ? (
          <div className="text-center text-gray-400">載入中...</div>
        ) : fields && fields.length > 0 ? (
          <div className="space-y-3">
            {fields.map((field: any) => (
              <div key={field.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{field.name}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-gray-400">
                    <span>類型：{field.fieldType}</span>
                    {field.isRequired && <span className="text-amber-500">必填</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(field)}
                    className="border-slate-600 text-gray-300 hover:text-amber-500"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(field.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <p>尚無自定義欄位</p>
          </div>
        )}
      </div>
    </div>
  );
}
