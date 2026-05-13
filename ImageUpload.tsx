import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Camera, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface ImageUploadProps {
  onImageUrl: (url: string) => void;
  currentImage?: string;
}

export default function ImageUpload({ onImageUrl, currentImage }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = trpc.storage.uploadImage.useMutation();

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("請選擇圖片檔案");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("圖片大小不能超過 10MB");
      return;
    }

    setIsLoading(true);
    try {
      // 顯示本地預覽
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        setPreview(dataUrl);

        // 上傳至 S3
        try {
          const result = await uploadMutation.mutateAsync({
            imageData: dataUrl,
            fileName: file.name,
            mimeType: file.type,
          });
          onImageUrl(result.url);
          toast.success("圖片已上傳至雲端");
        } catch (error) {
          toast.error("圖片上傳失敗，請重試");
          setPreview(null);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("圖片處理失敗");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-40 object-cover rounded-lg"
          />
          <button
            onClick={() => {
              setPreview(null);
              onImageUrl("");
            }}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || uploadMutation.isPending}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
        >
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              上傳中...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              上傳圖片
            </>
          )}
        </Button>
        <Button
          onClick={() => cameraInputRef.current?.click()}
          disabled={isLoading || uploadMutation.isPending}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white"
        >
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              拍照中...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              拍照
            </>
          )}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
      />

      <p className="text-gray-400 text-xs">支援 JPG、PNG、GIF（最大 10MB），自動上傳至雲端</p>
    </div>
  );
}
