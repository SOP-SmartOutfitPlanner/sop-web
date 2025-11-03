"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { WardrobeHeader } from "@/components/wardrobe/wardrobe-header";
import { Toolbar } from "@/components/wardrobe/toolbar";
import { WardrobeContent } from "@/components/wardrobe/wardrobe-content";
import { ErrorDisplay } from "@/components/common/error-display";
import { useWardrobeStore } from "@/store/wardrobe-store";
import { useAuthStore } from "@/store/auth-store";
import { getCollectionsWithCounts } from "@/lib/mock/collections";
import { WardrobeFilters } from "@/types/wardrobe";

// Dynamic import for heavy wizard component
const AddItemWizard = dynamic(() => import("@/components/wardrobe/wizard").then(mod => ({ default: mod.AddItemWizard })), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2 text-sm text-muted-foreground">Loading wizard...</span>
    </div>
  ),
});

export default function WardrobePage() {
  const router = useRouter();
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { isAuthenticated, user } = useAuthStore();

  // Store hooks - MUST be called before any conditional returns
  const {
    isLoading,
    error,
    items,
    isSelectionMode,
    toggleSelectionMode,
    selectedItems,
    clearSelection,
    filters,
    setFilters: setStoreFilters,
  } = useWardrobeStore();

  // Collections data - Pass actual items instead of just length
  const collections = useMemo(() => getCollectionsWithCounts(items), [items]);

  // Handlers - ALL hooks must be called before conditional returns
  const handleAddItem = () => {
    setIsAddItemOpen(true);
  };

  const handleFiltersChange = (newFilters: WardrobeFilters) => {
    setStoreFilters(newFilters);
  };

  const handleSelectMode = (enabled: boolean) => {
    if (enabled !== isSelectionMode) {
      toggleSelectionMode();
    }
  };

  // Redirect to login if not authenticated (useEffect AFTER all other hooks)
  useEffect(() => {
    // Give time for AuthProvider to initialize
    const timer = setTimeout(() => {
      if (!isAuthenticated && !user) {
        router.push("/login");
      } else {
        setIsCheckingAuth(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);

  // Show loading while checking auth (conditional return AFTER all hooks)
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100">
      <div className="container max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Error Display */}
        {error && <ErrorDisplay error={error} />}

        {/* Header Section */}
        <WardrobeHeader onAddItem={handleAddItem} isLoading={isLoading} />

        {/* Toolbar */}
        <Toolbar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          collections={collections}
          selectedItems={selectedItems}
          onClearSelection={clearSelection}
          onSelectMode={handleSelectMode}
          isSelectMode={isSelectionMode}
          wardrobeItems={items}
        />

        {/* Main Content */}
        <WardrobeContent />

        {/* Add Item Wizard */}
        <AddItemWizard open={isAddItemOpen} onOpenChange={setIsAddItemOpen} />
      </div>
    </div>
  );
}

