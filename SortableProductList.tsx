import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GripVertical, Pin, PinOff, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  price: string;
  imageUrl?: string | null;
  displayOrder: number;
  isPinned: string | boolean;
}

interface SortableProductListProps {
  products: Product[];
  onReorder: (products: Product[]) => void;
  onTogglePin: (productId: number, isPinned: boolean) => void;
  onAutoSort: (sortBy: "clicks" | "views" | "manual") => void;
}

function SortableProductItem({
  product,
  onTogglePin,
}: {
  product: Product;
  onTogglePin: (productId: number, isPinned: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 bg-white border rounded-lg ${
        isDragging ? "shadow-lg border-blue-500" : "border-gray-200"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded"
      >
        <GripVertical className="w-5 h-5 text-gray-400" />
      </button>

      {product.imageUrl && (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-16 h-16 object-cover rounded"
        />
      )}

      <div className="flex-1">
        <h3 className="font-semibold text-sm">{product.name}</h3>
        <p className="text-xs text-gray-500">¥{product.price}</p>
      </div>

      <div className="flex items-center gap-2">
        {product.isPinned && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
            置頂
          </span>
        )}
        <button
          onClick={() => onTogglePin(product.id, !product.isPinned)}
          className="p-2 hover:bg-gray-100 rounded"
          title={product.isPinned ? "取消置頂" : "置頂"}
        >
          {product.isPinned ? (
            <PinOff className="w-5 h-5 text-red-500" />
          ) : (
            <Pin className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
}

export function SortableProductList({
  products,
  onReorder,
  onTogglePin,
  onAutoSort,
}: SortableProductListProps) {
  const [sortMode, setSortMode] = useState<"manual" | "clicks" | "views">(
    "manual"
  );
  const [isAutoSorting, setIsAutoSorting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = products.findIndex((p) => p.id === active.id);
      const newIndex = products.findIndex((p) => p.id === over.id);

      const newProducts = arrayMove(products, oldIndex, newIndex).map(
        (p: Product, idx: number) => ({
          ...p,
          displayOrder: idx,
        })
      );

      onReorder(newProducts);
      toast.success("商品順序已更新");
    }
  };

  const handleAutoSort = async (mode: "clicks" | "views") => {
    setIsAutoSorting(true);
    try {
      onAutoSort(mode);
      setSortMode(mode);
      toast.success(
        mode === "clicks" ? "已按點擊率排序" : "已按曝光率排序"
      );
    } catch (error) {
      toast.error("自動排序失敗");
    } finally {
      setIsAutoSorting(false);
    }
  };

  // 分離置頂和非置頂商品
  const pinnedProducts = products.filter((p) => p.isPinned);
  const unpinnedProducts = products.filter((p) => !p.isPinned);
  const sortedProducts = [...pinnedProducts, ...unpinnedProducts];

  return (
    <div className="space-y-4">
      {/* 排序選項 */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-sm">排序模式：</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortMode === "manual" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortMode("manual")}
              className="text-xs"
            >
              手動排序
            </Button>
            <Button
              variant={sortMode === "clicks" ? "default" : "outline"}
              size="sm"
              onClick={() => handleAutoSort("clicks")}
              disabled={isAutoSorting}
              className="text-xs"
            >
              按點擊率
            </Button>
            <Button
              variant={sortMode === "views" ? "default" : "outline"}
              size="sm"
              onClick={() => handleAutoSort("views")}
              disabled={isAutoSorting}
              className="text-xs"
            >
              按曝光率
            </Button>
          </div>
        </div>
      </Card>

      {/* 置頂商品提示 */}
      {pinnedProducts.length > 0 && (
        <div className="text-xs text-gray-600 bg-amber-50 p-3 rounded border border-amber-200">
          ⭐ {pinnedProducts.length} 件置頂商品將優先展示
        </div>
      )}

      {/* 拖曳排序列表 */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedProducts.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {sortedProducts.map((product) => (
              <SortableProductItem
                key={product.id}
                product={product}
                onTogglePin={onTogglePin}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* 空狀態 */}
      {sortedProducts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>暫無商品</p>
        </div>
      )}
    </div>
  );
}
