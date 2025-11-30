"use client";

import { X } from "lucide-react";
import { Image } from "antd";
import { ApiWardrobeItem } from "@/lib/api/wardrobe-api";

interface SelectedItemsPreviewProps {
  selectedItems: ApiWardrobeItem[];
  onRemoveItem: (itemId: number) => void;
}

export function SelectedItemsPreview({
  selectedItems,
  onRemoveItem,
}: SelectedItemsPreviewProps) {
  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-white/90">
        Selected Items ({selectedItems.length}/5)
      </h4>
      <div className="grid grid-cols-3 gap-2">
        {selectedItems.map((item) => (
          <div key={item.id} className="relative group">
            <div className="aspect-square rounded-lg overflow-hidden bg-white/5 border border-cyan-400/40">
              <Image
                src={item.imgUrl}
                alt={item.name}
                width="100%"
                height="100%"
                className="object-cover"
                preview={false}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            <button
              onClick={() => item.id && onRemoveItem(item.id)}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
