"use client";

import { useState } from "react";
import { ItemGrid } from "@/components/wardrobe/item-grid";
import { Filters } from "@/components/wardrobe/filters";
import { AddItemForm } from "@/components/wardrobe/add-item-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWardrobeStore } from "@/store/wardrobe-store";
import { Plus, Database, Search } from "lucide-react";

export default function WardrobePage() {
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isLoading, error, fetchItems, items } = useWardrobeStore();
  
  // Debug logging
  console.log('Current items:', items);

  const handleRefreshItems = async () => {
    try {
      await fetchItems();
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-600 mb-2">My Wardrobe</h1>
          <p className="text-gray-600">Test API integration with Mock API</p>
          <div className="mt-1 text-sm text-gray-500">
            📊 Total items: {items.length} | Status: {isLoading ? "Loading..." : "Ready"}
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleRefreshItems} 
            variant="outline"
            disabled={isLoading}
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <Database className="w-4 h-4 mr-2" />
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
          <Button
            onClick={() => setIsAddItemOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Simple Search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search wardrobe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <ItemGrid />
        </div>
        <div className="lg:col-span-1">
          <Filters />
        </div>
      </div>

      {/* Add Item Modal */}
      <AddItemForm
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
      />
    </div>
  );
}
