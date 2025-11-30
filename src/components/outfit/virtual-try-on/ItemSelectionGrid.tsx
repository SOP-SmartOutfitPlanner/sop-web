"use client";

import { CheckCircle2, Image as ImageIcon } from "lucide-react";
import { Image } from "antd";
import { ApiWardrobeItem } from "@/lib/api/wardrobe-api";

interface ItemSelectionGridProps {
  items: ApiWardrobeItem[];
  selectedItemIds: number[];
  isLoading: boolean;
  hasMore: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  isProcessing: boolean;
  view: "wardrobe" | "outfit";
  totalItems?: number;
  onToggleItem: (itemId: number) => void;
}

export function ItemSelectionGrid({
  items,
  selectedItemIds,
  isLoading,
  hasMore,
  loadMoreRef,
  isProcessing,
  view,
  totalItems,
  onToggleItem,
}: ItemSelectionGridProps) {
  if (isLoading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-white/60">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mb-3" />
        <p className="text-sm">Loading items...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-white/60">
        <ImageIcon className="w-12 h-12 mb-3 opacity-40" />
        <p className="text-sm font-medium">No items found</p>
        <p className="text-xs mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-2 pb-2">
        {items.map((item, index) => {
          const isSelected = item.id ? selectedItemIds.includes(item.id) : false;
          // Create unique key combining view, id, name and index to avoid duplicates
          const uniqueKey = `${view}-item-${item.id || 'no-id'}-${item.name?.slice(0, 10) || 'unnamed'}-${index}`;

          return (
            <button
              key={uniqueKey}
              onClick={() => item.id && onToggleItem(item.id)}
              disabled={isProcessing}
              className={`relative p-1.5 rounded-lg transition-all ${
                isSelected
                  ? "bg-gradient-to-br from-cyan-400/30 via-blue-300/20 to-indigo-400/30 border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/40"
                  : "bg-white/5 border-2 border-white/20 hover:border-white/40"
              }`}
            >
              {/* Selection Badge */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 z-10 w-5 h-5 rounded-full bg-cyan-500 border-2 border-white shadow-xl flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Image */}
              <div className="aspect-square rounded-md overflow-hidden bg-white/5">
                <Image
                  src={item.imgUrl}
                  alt={item.name}
                  width="100%"
                  height="100%"
                  className="object-cover"
                  preview={{
                    mask: <span className="text-xs">View</span>,
                    getContainer: () => document.body,
                    zIndex: 10001,
                  }}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

              {/* Name - Only show on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center p-1 rounded-lg">
                <p className="text-xs font-medium text-white text-center line-clamp-2">
                  {item.name}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Infinite Scroll Sentinel + Loading Indicator */}
      <div className="flex flex-col items-center gap-3 pt-4">
        {/* Loading indicator */}
        {isLoading && items.length > 0 && (
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Loading more items...</span>
          </div>
        )}

        {/* Items counter */}
        {items.length > 0 && totalItems !== undefined && (
          <div className="text-white/50 text-xs">
            Showing {items.length} of {totalItems} items
          </div>
        )}

        {/* Intersection observer sentinel */}
        {hasMore && <div ref={loadMoreRef} className="h-4 w-full" />}

        {/* End message */}
        {!hasMore && items.length > 0 && (
          <div className="text-white/40 text-sm py-2">✓ All items loaded</div>
        )}
      </div>
    </>
  );
}
