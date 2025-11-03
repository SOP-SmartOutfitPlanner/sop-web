/**
 * Infinite Scroll Item Grid Component
 * Uses intersection observer to load more items as user scrolls
 */

"use client";

import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { ItemCard } from "./item-card";
import { WardrobeItem } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface InfiniteItemGridProps {
  items: WardrobeItem[];
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  onSelect?: (id: string, selected: boolean) => void;
  selectedItems?: string[];
  showCheckbox?: boolean;
  onEdit?: (item: WardrobeItem) => void;
  onDelete?: (id: string) => void;
  itemsPerPage?: number;
}

export function InfiniteItemGrid({
  items,
  isLoading = false,
  error,
  onRetry,
  onSelect,
  selectedItems = [],
  showCheckbox = false,
  onEdit,
  onDelete,
  itemsPerPage = 12,
}: InfiniteItemGridProps) {
  const [displayCount, setDisplayCount] = useState(itemsPerPage);
  
  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Auto-load more when in view
  useEffect(() => {
    if (inView && displayCount < items.length) {
      const timer = setTimeout(() => {
        setDisplayCount(prev => Math.min(prev + itemsPerPage, items.length));
      }, 500); // Small delay for better UX
      
      return () => clearTimeout(timer);
    }
  }, [inView, displayCount, items.length, itemsPerPage]);

  // Reset display count when items change (e.g., new search)
  useEffect(() => {
    setDisplayCount(itemsPerPage);
  }, [items.length, itemsPerPage]);

  // Currently displayed items
  const displayedItems = items.slice(0, displayCount);

  const hasMore = displayCount < items.length;

  // Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to load items
        </h3>
        <p className="text-gray-500 mb-4">
          There was an error loading your wardrobe items. Please try again.
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        )}
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.from({ length: itemsPerPage }).map((_, index) => (
          <div key={index} className="space-y-4">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  // Empty State
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-6 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
          <svg
            className="h-8 w-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No items found
        </h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Your wardrobe is empty or no items match your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {displayedItems.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            isSelected={selectedItems.includes(item.id)}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            showCheckbox={showCheckbox}
          />
        ))}
      </div>

      {/* Load More Trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
            <span className="text-sm">Loading more items...</span>
          </div>
        </div>
      )}

      {/* End of List Indicator */}
      {!hasMore && items.length > itemsPerPage && (
        <div className="flex justify-center py-8">
          <div className="text-center text-gray-500">
            <p className="text-sm">
              You&apos;ve reached the end of your wardrobe
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {items.length} {items.length === 1 ? 'item' : 'items'} total
            </p>
          </div>
        </div>
      )}
    </div>
  );
}