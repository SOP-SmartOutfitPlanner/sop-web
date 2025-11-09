"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { WardrobeHeader } from "@/components/wardrobe/wardrobe-header";
import { WardrobeContent } from "@/components/wardrobe/wardrobe-content";
import { WardrobeStats } from "@/components/wardrobe/wardrobe-stats";
import { ErrorDisplay } from "@/components/common/error-display";
import { useWardrobeStore } from "@/store/wardrobe-store";
import { useAuthStore } from "@/store/auth-store";
import { WardrobeFilters } from "@/types/wardrobe";
import { WardrobeItem } from "@/types";
import { ApiWardrobeItem, wardrobeAPI } from "@/lib/api/wardrobe-api";

// Dynamic import for heavy wizard component
const AddItemWizard = dynamic(
  () =>
    import("@/components/wardrobe/wizard").then((mod) => ({
      default: mod.AddItemWizard,
    })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm text-muted-foreground">
          Loading wizard...
        </span>
      </div>
    ),
  }
);

export default function WardrobePage() {
  const router = useRouter();
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Edit mode state
  const [editItem, setEditItem] = useState<ApiWardrobeItem | null>(null);
  const isEditMode = !!editItem;

  const { isAuthenticated, user } = useAuthStore();

  // Store hooks - MUST be called before any conditional returns
  const {
    isLoading,
    error,
    items,
    getRawItemById, // Get raw API item helper
    filters,
    setFilters: setStoreFilters,
  } = useWardrobeStore();

  // Handlers - ALL hooks must be called before conditional returns
  const handleEditItem = async (item: WardrobeItem) => {
    try {
      // Get raw API item from store (includes styles & occasions)
      const rawItem = getRawItemById(parseInt(item.id));

      if (!rawItem) {
        // Fallback: fetch from API if not in store
        const response = await wardrobeAPI.getItem(parseInt(item.id));

        if (!response) {
          throw new Error("Item not found");
        }

        setEditItem(response);
      } else {
        setEditItem(rawItem);
      }

      // Small delay to ensure state is updated
      setTimeout(() => {
        setIsAddItemOpen(true);
      }, 100);
    } catch (error) {
      console.error("❌ Failed to fetch item for edit:", error);
      toast.error("Failed to load item details. Please try again.");
    }
  };

  const handleFiltersChange = (newFilters: WardrobeFilters) => {
    setStoreFilters(newFilters);
  };

  // Prevent scrolling when dialog is open
  useEffect(() => {
    if (isAddItemOpen) {
      // Stop Lenis smooth scrolling
      const html = document.documentElement;
      html.classList.add("lenis-stopped");

      // Prevent body scroll
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      // Re-enable Lenis smooth scrolling
      const html = document.documentElement;
      html.classList.remove("lenis-stopped");

      // Restore body scroll and scroll position
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";

      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    // Cleanup on unmount
    return () => {
      const html = document.documentElement;
      html.classList.remove("lenis-stopped");
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
    };
  }, [isAddItemOpen]);

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
    <div className="min-h-screen  pt-32">
      <div className="container max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Error Display */}
        {error && <ErrorDisplay error={error} />}

        {/* Header Section with Search and Filter */}
        <WardrobeHeader
          onAddItem={() => setIsAddItemOpen(true)}
          isLoading={isLoading}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          wardrobeItems={items}
        />

        {/* Main Content */}
        <WardrobeContent onEditItem={handleEditItem} />

        {/* Wardrobe Statistics at Bottom */}
        <WardrobeStats />

        {/* Add Item Wizard */}
        <AddItemWizard
          open={isAddItemOpen}
          onOpenChange={(open) => {
            setIsAddItemOpen(open);
            if (!open) {
              // Delay clearing edit state until after dialog close animation
              setTimeout(() => {
                setEditItem(null);
              }, 300);
            }
          }}
          editMode={isEditMode}
          editItemId={editItem?.id}
          editItem={editItem || undefined}
        />
      </div>
    </div>
  );
}
