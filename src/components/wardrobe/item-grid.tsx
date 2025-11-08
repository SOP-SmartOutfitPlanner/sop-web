"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { ItemCard } from "./item-card";
import { useWardrobeStore } from "@/store/wardrobe-store";
import { Skeleton } from "../ui/skeleton";
import GlassCard from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { WardrobeItem } from "@/types";

interface GridProps {
  items?: WardrobeItem[];
  loading?: boolean;
  error?: Error;
  selectedItems?: string[];
  onSelectItem?: (id: string, selected: boolean) => void;
  onEditItem?: (item: WardrobeItem) => void;
  onDeleteItem?: (id: string) => void;
  onUseInOutfit?: (item: WardrobeItem) => void;
  showCheckboxes?: boolean;
  emptyMessage?: string;
}

export function ItemGrid({
  items: externalItems,
  loading: externalLoading,
  error,
  selectedItems: externalSelectedItems,
  onSelectItem,
  onEditItem,
  onDeleteItem,
  onUseInOutfit,
  showCheckboxes = false,
  emptyMessage = "No items found",
}: GridProps) {
  const {
    filteredItems,
    isLoading: storeLoading,
    error: storeError,
    fetchItems,
    deleteItem,
    selectedItems: storeSelectedItems,
    toggleItemSelection,
    isSelectionMode,
    hasInitialFetch,
  } = useWardrobeStore();

  // Use external props or fallback to store values
  const items = externalItems || filteredItems || [];
  const loading =
    externalLoading !== undefined ? externalLoading : storeLoading;
  const selectedItems = externalSelectedItems || storeSelectedItems || [];
  const currentError = error || storeError;

  useEffect(() => {
    // Only fetch if no external items provided and haven't done initial fetch yet
    if (!externalItems && !hasInitialFetch && (!filteredItems || filteredItems.length === 0)) {
      fetchItems();
    }

  }, [externalItems, hasInitialFetch, filteredItems, fetchItems]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      if (onDeleteItem) {
        onDeleteItem(id);
      } else {
        await deleteItem(id);
      }
    }
  };

  const handleEdit = (item: WardrobeItem) => {
    if (onEditItem) {
      onEditItem(item);
    } else {
      // TODO: Implement default edit functionality
      console.log("Edit item:", item);
    }
  };

  const handleUseInOutfit = (item: WardrobeItem) => {
    if (onUseInOutfit) {
      onUseInOutfit(item);
    } else {
      // TODO: Implement default use in outfit functionality
      console.log("Use in outfit:", item);
    }
  };

  const handleSelectItem = (id: string, selected: boolean) => {
    if (onSelectItem) {
      onSelectItem(id, selected);
    } else {
      toggleItemSelection(id);
    }
  };

  // Error state
  if (currentError) {
    return (
      <div className="text-center py-12">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Failed to load items</h3>
            <p className="text-muted-foreground mt-1">
              {currentError instanceof Error
                ? currentError.message
                : "Something went wrong"}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{emptyMessage}</h3>
            <p className="text-muted-foreground mt-1">
              Try adjusting your filters or add some items to your wardrobe
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-6",
        "grid-cols-1",
        "sm:grid-cols-2",
        "lg:grid-cols-3",
        "xl:grid-cols-4"
      )}
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: index * 0.05,
            ease: "easeOut"
          }}
          className="h-full"
        >
          <ItemCard
            item={item}
            isSelected={selectedItems.includes(item.id)}
            onSelect={handleSelectItem}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onUseInOutfit={handleUseInOutfit}
            showCheckbox={showCheckboxes || isSelectionMode}
          />
        </motion.div>
      ))}

      {/* Loading skeletons */}
      {loading && (
        <>
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))}
        </>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <GlassCard
      padding="0"
      borderRadius="16px"
      blur="8px"
      brightness={1.15}
      glowColor="rgba(255, 255, 255, 0.3)"
      glowIntensity={8}
      borderColor="rgba(255, 255, 255, 0.3)"
      borderWidth="2px"
      displacementScale={15}
      className="overflow-hidden"
    >
      <div className="p-0">
        {/* Image */}
        <Skeleton className="aspect-[4/5] w-full" />

        {/* Content */}
        <div className="p-3 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>

          {/* Colors */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-12" />
            <div className="flex gap-1">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="w-5 h-5 rounded-full" />
            </div>
          </div>

          {/* Meta */}
          <div className="flex gap-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>

          {/* Stats */}
          <div className="flex justify-between">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>

          {/* Button */}
          <Skeleton className="h-8 w-full rounded" />
        </div>
      </div>
    </GlassCard>
  );
}
