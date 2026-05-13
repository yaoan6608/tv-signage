import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import ImageUpload from "@/components/ImageUpload";
import VideoPlayer from "@/components/VideoPlayer";
import { getAllCategories } from "@shared/categoryTemplates";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Products() {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    imageUrl: "",
    videoUrl: "",
    description: "",
    category: "food" as any,
    aiSlogan: "",
    aiDescription: "",
    tagIds: [] as number[],
    fieldValues: {} as Record<number, string>,
  });
  
  const categories = getAllCategories();

  const { data: products, isLoading, refetch } = trpc.products.list.useQuery();
  const { data: tags } = trpc.tags.list.useQuery();
  const { data: fields } = trpc.customFields.list.useQuery();
  const createMutation = trpc.products.create.useMutation();
  const updateMutation = trpc.products.update.useMutation();
  const deleteMutation = trpc.products.delete.useMutation();
  const generateCopyMutation = trpc.ai.generateProductCopy.useMutation();

  const handleGenerateAICopy = async () => {
    if (!formData.imageUrl) {
      toast.error("請先上傳商品圖片");
      return;
    }

    setIsGeneratingCopy(true);
    try {
      const result = await generateCopyMutation.mutateAsync({
        imageUrl: formData.imageUrl,
        productName: formData.name,
        category: formData.category,
      });
      setFormData({
        ...formData,
        name: formData.name || "新商品",
        aiSlogan: result.slogan,
        aiDescription: result.description,
      });
      toast.success("AI 文案已生成！");
    } catch (error) {
      toast.error("AI 文案生成失敗，請重試");
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      toast.error("請填寫商品名稱和價格");
      return;
    }

    try {
      const fieldValuesArray = Object.entries(formData.fieldValues)
        .filter(([, value]) => value)
        .map(([fieldId, value]) => ({
          fieldId: parseInt(fieldId),
          value,
        }));

      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          name: formData.name,
          price: formData.price,
          imageUrl: formData.imageUrl,
          videoUrl: formData.videoUrl,
          description: formData.description,
          tagIds: formData.tagIds,
          fieldValues: fieldValuesArray,
        });
        toast.success("商品已更新");
        // 觸發實時更新事件
        window.dispatchEvent(new CustomEvent("product-updated", { detail: { type: "update" } }));
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          price: formData.price,
          imageUrl: formData.imageUrl,
          videoUrl: formData.videoUrl,
          description: formData.description,
          tagIds: formData.tagIds,
          fieldValues: fieldValuesArray,
        });
        toast.success("商品已新增");
        // 觸發實時更新事件
        window.dispatchEvent(new CustomEvent("product-updated", { detail: { type: "create" } }));
      }
      setOpen(false);
      setFormData({
        name: "",
        price: "",
        imageUrl: "",
        videoUrl: "",
        description: "",
        category: "food",
        aiSlogan: "",
        aiDescription: "",
        tagIds: [],
        fieldValues: {},
      });
      setEditingId(null);
      refetch();
    } catch (error) {
      toast.error("操作失敗，請重試");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("確定要刪除此商品嗎？")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("商品已刪除");
        // 觸發實時更新事件
        window.dispatchEvent(new CustomEvent("product-updated", { detail: { type: "delete" } }));
        refetch();
      } catch (error) {
        toast.error("刪除失敗");
      }
    }
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl || "",
      videoUrl: product.videoUrl || "",
      description: product.description || "",
      category: product.category || "food",
      aiSlogan: "",
      aiDescription: "",
      tagIds: product.tagIds || [],
      fieldValues: {},
    });
    setOpen(true);
  };

  const toggleTag = (tagId: number) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
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
            <h1 className="text-3xl font-bold text-amber-500">商品管理</h1>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    name: "",
                    price: "",
                    imageUrl: "",
                    videoUrl: "",
                    description: "",
                    category: "food",
                    aiSlogan: "",
                    aiDescription: "",
                    tagIds: [],
                    fieldValues: {},
                  });
                }}
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
              >
                <Plus className="w-4 h-4 mr-2" />
                新增商品
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">{editingId ? "編輯商品" : "新增商品"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="商品名稱"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                
                {/* Category Selection */}
                <div>
                  <label className="text-white text-sm font-semibold mb-2 block">商品類別</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="選擇商品類別" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {categories.map((cat: any) => (
                        <SelectItem key={cat.value} value={cat.value} className="text-white">
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Category Template Preview */}
                {formData.category && (() => {
                  const template = categories.find((c: any) => c.value === formData.category);
                  return template ? (
                    <div className="bg-slate-700 border border-amber-500/30 rounded-lg p-3 space-y-2">
                      <p className="text-amber-400 text-sm font-semibold">{template.label} 模板預覽</p>
                      <div className="text-xs text-gray-300 space-y-1">
                        <p><span className="text-amber-300">標語風格：</span> 根據類別特性生成吸引人的標語</p>
                        <p><span className="text-amber-300">介紹風格：</span> 詳細描述產品特點和優勢</p>
                      </div>
                    </div>
                  ) : null;
                })()}
                
                <Input
                  placeholder="價格"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  placeholder="圖片 URL"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />

                <Textarea
                  placeholder="商品描述"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />

                {/* Image Upload */}
                <div>
                  <label className="text-white text-sm font-semibold mb-2 block">商品圖片</label>
                  <ImageUpload
                    onImageUrl={(url) => setFormData({ ...formData, imageUrl: url })}
                    currentImage={formData.imageUrl}
                  />
                  {formData.imageUrl && (
                    <Button
                      onClick={handleGenerateAICopy}
                      disabled={isGeneratingCopy}
                      className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                    >
                      {isGeneratingCopy ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI 生成文案
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* AI Generated Slogan */}
                {formData.aiSlogan && (
                  <div>
                    <label className="text-white text-sm font-semibold mb-2 block">AI 生成標語</label>
                    <Input
                      value={formData.aiSlogan}
                      onChange={(e) => setFormData({ ...formData, aiSlogan: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="編輯 AI 生成的標語"
                    />
                  </div>
                )}

                {/* AI Generated Description */}
                {formData.aiDescription && (
                  <div>
                    <label className="text-white text-sm font-semibold mb-2 block">AI 生成介紹詞</label>
                    <Textarea
                      value={formData.aiDescription}
                      onChange={(e) => setFormData({ ...formData, aiDescription: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="編輯 AI 生成的介紹詞"
                      rows={4}
                    />
                  </div>
                )}

                {/* Video URL */}
                <div>
                  <label className="text-white text-sm font-semibold mb-2 block">影片 URL</label>
                  <Input
                    placeholder="YouTube 連結或 MP4 URL"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  {formData.videoUrl && <VideoPlayer videoUrl={formData.videoUrl} />}
                </div>

                {/* Tags Selection */}
                {tags && tags.length > 0 && (
                  <div>
                    <label className="text-white text-sm font-semibold mb-2 block">標籤</label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag: any) => (
                        <button
                          key={tag.id}
                          onClick={() => toggleTag(tag.id)}
                          className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
                            formData.tagIds.includes(tag.id)
                              ? "bg-amber-500 text-black"
                              : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                          }`}
                          style={{
                            backgroundColor: formData.tagIds.includes(tag.id) ? tag.color : undefined,
                          }}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Fields */}
                {fields && fields.length > 0 && (
                  <div>
                    <label className="text-white text-sm font-semibold mb-2 block">自定義欄位</label>
                    <div className="space-y-2">
                      {fields.map((field: any) => (
                        <div key={field.id}>
                          <label className="text-gray-300 text-xs mb-1 block">{field.name}</label>
                          {field.fieldType === "textarea" ? (
                            <Textarea
                              placeholder={field.name}
                              value={formData.fieldValues[field.id] || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  fieldValues: { ...formData.fieldValues, [field.id]: e.target.value },
                                })
                              }
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          ) : (
                            <Input
                              type={field.fieldType === "number" ? "number" : "text"}
                              placeholder={field.name}
                              value={formData.fieldValues[field.id] || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  fieldValues: { ...formData.fieldValues, [field.id]: e.target.value },
                                })
                              }
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold"
                >
                  {editingId ? "更新商品" : "新增商品"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Product List */}
      <div className="max-w-7xl mx-auto py-8 px-4">
        {isLoading ? (
          <div className="text-center text-gray-400">載入中...</div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: any) => (
              <div key={product.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-amber-500 transition-all">
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-lg font-bold text-white mb-2">{product.name}</h3>
                <p className="text-amber-500 font-bold mb-2">NT$ {product.price}</p>
                <p className="text-gray-400 text-sm mb-4">{product.description}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(product)}
                    className="flex-1 border-slate-600 text-gray-300 hover:text-amber-500"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    編輯
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(product.id)}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    刪除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <p>尚無商品，請新增第一件商品</p>
          </div>
        )}
      </div>
    </div>
  );
}
