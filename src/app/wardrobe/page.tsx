"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
// import { AddItemForm } from "@/components/wardrobe/add-item-form"; // Old form
import { AddItemWizard } from "@/components/wardrobe/wizard";
import { WardrobeHeader } from "@/components/wardrobe/wardrobe-header";
import { Toolbar } from "@/components/wardrobe/toolbar";
import { WardrobeContent } from "@/components/wardrobe/wardrobe-content";
import { ErrorDisplay } from "@/components/common/error-display";
import { useWardrobeStore } from "@/store/wardrobe-store";
import { useAuthStore } from "@/store/auth-store";
import { getCollectionsWithCounts } from "@/lib/mock/collections";
import { WardrobeFilters } from "@/types/wardrobe";

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

  // Memoized handlers - ALL hooks must be called before conditional returns
  const handleAddItem = useCallback(() => {
    setIsAddItemOpen(true);
  }, []);

  const handleCloseAddItem = useCallback(() => {
    setIsAddItemOpen(false);
  }, []);

  const handleFiltersChange = useCallback(
    (newFilters: WardrobeFilters) => {
      setStoreFilters(newFilters);
    },
    [setStoreFilters]
  );

  const handleSelectMode = useCallback(
    (enabled: boolean) => {
      if (enabled !== isSelectionMode) {
        toggleSelectionMode();
      }
    },
    [isSelectionMode, toggleSelectionMode]
  );

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

      {/* Add Item Modal */}
      {/* Old single-page form */}
      {/* <AddItemForm isOpen={isAddItemOpen} onClose={handleCloseAddItem} /> */}
      
      {/* New wizard form */}
      <AddItemWizard open={isAddItemOpen} onOpenChange={setIsAddItemOpen} />
    </div>
  );
}
