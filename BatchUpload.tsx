import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, CheckCircle, AlertCircle, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "uploading" | "completed" | "generating" | "creating" | "failed";
  url?: string;
  slogan?: string;
  description?: string;
  name?: string;
  price?: string;
  error?: string;
}

export default function BatchUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [createProgress, setCreateProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const batchUploadMutation = trpc.storage.batchUploadImages.useMutation();
  const batchGenerateMutation = trpc.storage.batchGenerateCopy.useMutation();
  const tagsQuery = trpc.tags.list.useQuery();

  const handleFilesSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} 不是圖片檔案`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} 大小超過 10MB`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        newFiles.push({
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview: e.target?.result as string,
          status: "pending",
          name: file.name.replace(/\.[^/.]+$/, ""),
          price: "",
        });
      };
      reader.readAsDataURL(file);
    }

    setTimeout(() => {
      setFiles((prev) => [...prev, ...newFiles]);
    }, 100);
  };

  const handleBatchUpload = async () => {
    if (files.length === 0) {
      toast.error("請選擇至少一張圖片");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const uploadData = files
      .filter((f) => f.status === "pending")
      .map((f) => ({
        imageData: f.preview,
        fileName: f.file.name,
        mimeType: f.file.type,
      }));

    try {
      const result = await batchUploadMutation.mutateAsync({
        images: uploadData,
      });

      let completed = 0;
      setFiles((prev) =>
        prev.map((f) => {
          const uploadResult = result.results.find((r: any) => r.fileName === f.file.name);
          if (uploadResult) {
            completed++;
            setUploadProgress(Math.round((completed / uploadData.length) * 100));
            return {
              ...f,
              status: uploadResult.success ? "completed" : "failed",
              url: uploadResult.success ? uploadResult.url : undefined,
              error: uploadResult.success ? undefined : uploadResult.error,
            };
          }
          return f;
        })
      );

      const successCount = result.results.filter((r) => r.success).length;
      toast.success(`成功上傳 ${successCount} 張圖片`);
    } catch (error) {
      toast.error("批量上傳失敗");
    } finally {
      setIsUploading(false);
    }
  };

  const handleBatchGenerateCopy = async () => {
    const completedFiles = files.filter((f) => f.status === "completed" && f.url);
    if (completedFiles.length === 0) {
      toast.error("請先上傳圖片");
      return;
    }

    setIsGenerating(true);
    setGenerateProgress(0);
    try {
      const result = await batchGenerateMutation.mutateAsync({
        imageUrls: completedFiles.map((f) => f.url!),
      });

      let completed = 0;
      setFiles((prev) =>
        prev.map((f) => {
          const copyResult = result.results.find((r) => r.imageUrl === f.url);
          if (copyResult) {
            completed++;
            setGenerateProgress(Math.round((completed / completedFiles.length) * 100));
            return {
              ...f,
              slogan: copyResult.success ? copyResult.slogan : undefined,
              description: copyResult.success ? copyResult.description : undefined,
              error: copyResult.success ? undefined : copyResult.error,
            };
          }
          return f;
        })
      );

      const successCount = result.results.filter((r) => r.success).length;
      toast.success(`成功生成 ${successCount} 件商品文案`);
    } catch (error) {
      toast.error("批量生成文案失敗");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBatchCreateProducts = async () => {
    const productsToCreate = files
      .filter((f) => f.url && f.name && f.price)
      .map((f) => ({
        name: f.name!,
        price: f.price!,
        imageUrl: f.url!,
        description: f.description || "",
        tagIds: selectedTags,
      }));

    if (productsToCreate.length === 0) {
      toast.error("請填寫商品名稱和價格");
      return;
    }

    setIsCreating(true);
    setCreateProgress(0);
    try {
      // 注意：批量建立商品功能需要後端 API 支援
      // const result = await batchCreateMutation.mutateAsync({
      //   products: productsToCreate,
      // });
      // setResults(result);
      // const successCount = result.results.filter((r: any) => r.success).length;
      // toast.success(`成功建立 ${successCount} 件商品`);
      
      toast.success("商品建立功能已準備就緒");
    } catch (error) {
      toast.error("商品建立出錯");
    } finally {
      setIsCreating(false);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFile = (id: string, updates: Partial<UploadedFile>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">批量上傳商品</h1>
        <p className="text-blue-100">一次上傳多張圖片，自動生成 AI 廣告文案，快速上架商品</p>
      </div>

      {/* 上傳區域 */}
      <Card className="p-8 border-2 border-dashed border-blue-300 hover:border-blue-500 transition">
        <div
          className="text-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFilesSelect(e.dataTransfer.files);
          }}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-blue-500" />
          <h3 className="text-lg font-semibold mb-2">拖拽圖片到此處或點擊選擇</h3>
          <p className="text-gray-500 text-sm">支援 JPG、PNG、GIF（最大 10MB，可批量上傳）</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFilesSelect(e.target.files)}
          className="hidden"
        />
      </Card>

      {/* 檔案列表與編輯 */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">已選擇 {files.length} 張圖片</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Button
                  onClick={() => setShowTagSelector(!showTagSelector)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  標籤 ({selectedTags.length})
                  <ChevronDown className="w-4 h-4" />
                </Button>
                {showTagSelector && (
                  <div className="absolute top-full right-0 mt-2 bg-white border rounded-lg shadow-lg p-4 z-10 min-w-48">
                    {tagsQuery.data?.map((tag) => (
                      <label key={tag.id} className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTags([...selectedTags, tag.id]);
                            } else {
                              setSelectedTags(selectedTags.filter((id) => id !== tag.id));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{tag.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => setFiles([])}
                className="text-red-600 hover:text-red-700"
              >
                清空全部
              </Button>
            </div>
          </div>

          {/* 進度條 */}
          {(uploadProgress > 0 || generateProgress > 0 || createProgress > 0) && (
            <div className="space-y-3">
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>上傳進度</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              {generateProgress > 0 && generateProgress < 100 && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>AI 文案生成進度</span>
                    <span>{generateProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${generateProgress}%` }}
                    />
                  </div>
                </div>
              )}
              {createProgress > 0 && createProgress < 100 && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>商品建立進度</span>
                    <span>{createProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${createProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 商品編輯表單 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map((file) => (
              <Card key={file.id} className="p-4">
                <div className="space-y-3">
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div>
                    <label className="text-sm font-semibold">商品名稱</label>
                    <Input
                      value={file.name || ""}
                      onChange={(e) => updateFile(file.id, { name: e.target.value })}
                      placeholder="輸入商品名稱"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">價格</label>
                    <Input
                      value={file.price || ""}
                      onChange={(e) => updateFile(file.id, { price: e.target.value })}
                      placeholder="輸入價格"
                      className="mt-1"
                    />
                  </div>
                  {file.slogan && (
                    <div>
                      <label className="text-sm font-semibold">AI 標語</label>
                      <p className="text-sm text-blue-600 mt-1">{file.slogan}</p>
                    </div>
                  )}
                  {file.description && (
                    <div>
                      <label className="text-sm font-semibold">AI 介紹</label>
                      <p className="text-xs text-gray-600 mt-1">{file.description}</p>
                    </div>
                  )}
                  {file.error && (
                    <p className="text-xs text-red-600">錯誤：{file.error}</p>
                  )}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="w-full text-red-600 hover:text-red-700 text-sm py-2"
                  >
                    移除
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {/* 操作按鈕 */}
          <div className="flex gap-4">
            <Button
              onClick={handleBatchUpload}
              disabled={isUploading || files.every((f) => f.status !== "pending")}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  上傳中...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  批量上傳圖片
                </>
              )}
            </Button>

            <Button
              onClick={handleBatchGenerateCopy}
              disabled={isGenerating || files.filter((f) => f.status === "completed").length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  批量生成文案
                </>
              )}
            </Button>

            <Button
              onClick={handleBatchCreateProducts}
              disabled={true || isCreating || files.filter((f) => f.url && f.name && f.price).length === 0}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  建立中...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  批量建立商品
                </>
              )}
            </Button>
          </div>

          {/* 結果報告 */}
          {results && (
            <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <h3 className="text-lg font-bold mb-4">批量操作結果報告</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {results.results.filter((r: any) => r.success).length}
                  </div>
                  <p className="text-sm text-gray-600">成功</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {results.results.filter((r: any) => !r.success).length}
                  </div>
                  <p className="text-sm text-gray-600">失敗</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {results.results.length}
                  </div>
                  <p className="text-sm text-gray-600">總計</p>
                </div>
              </div>
              <div className="space-y-2">
                {results.results.map((result: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span>{result.productName || result.fileName}</span>
                    {result.error && <span className="text-red-600">({result.error})</span>}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
