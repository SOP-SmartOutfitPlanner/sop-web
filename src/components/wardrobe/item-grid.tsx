"use client";

import { useEffect } from "react";
import { ItemCard } from "./item-card";
import { ItemGridProps } from "@/types/wardrobe";
import { useWardrobeStore } from "@/store/wardrobe-store";
import { Loader2, Package } from "lucide-react";

export function ItemGrid({
  items,
  isLoading: externalLoading,
  emptyMessage = "No items found",
}: ItemGridProps) {
  const {
    filteredItems,
    isLoading: storeLoading,
    fetchItems,
    deleteItem,
    selectedItems,
    toggleItemSelection,
  } = useWardrobeStore();

  // Use external items if provided, otherwise use store items
  const displayItems = items || filteredItems || [];
  const loading =
    externalLoading !== undefined ? externalLoading : storeLoading;

  useEffect(() => {
    // Only fetch if no external items provided and store is empty
    if (!items && (!filteredItems || filteredItems.length === 0)) {
      fetchItems();
    }
  }, [items, filteredItems?.length, fetchItems]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await deleteItem(id);
    }
  };

  const handleEdit = (item: any) => {
    // TODO: Implement edit functionality
  };

  const handleView = (item: any) => {
    // TODO: Implement view details functionality
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">Loading items...</p>
        </div>
      </div>
    );
  }

  if (displayItems.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {emptyMessage}
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Start adding items to your wardrobe to see them here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {displayItems.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          isSelected={selectedItems.includes(item.id)}
          onToggleSelection={toggleItemSelection}
        />
      ))}
    </div>
  );
}
