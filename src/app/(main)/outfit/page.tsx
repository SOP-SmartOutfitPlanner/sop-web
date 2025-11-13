"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import GlassButton from "@/components/ui/glass-button";
import { OutfitGrid } from "@/components/outfit/OutfitGrid";
import { OutfitFilters } from "@/components/outfit/OutfitFilters";
import { useOutfits, useDeleteOutfit } from "@/hooks/useOutfits";
import { useOutfitStore } from "@/store/outfit-store";
import { wardrobeAPI } from "@/lib/api/wardrobe-api";
import { useAuthStore } from "@/store/auth-store";
import { Outfit } from "@/types/outfit";

// Dynamic imports to avoid SSR issues with antd Image
const CreateOutfitDialog = dynamic(
  () => import("@/components/outfit/CreateOutfitDialog").then((mod) => ({ default: mod.CreateOutfitDialog })),
  { ssr: false }
);
const EditOutfitDialog = dynamic(
  () => import("@/components/outfit/EditOutfitDialog").then((mod) => ({ default: mod.EditOutfitDialog })),
  { ssr: false }
);
const ViewOutfitDialog = dynamic(
  () => import("@/components/outfit/ViewOutfitDialog").then((mod) => ({ default: mod.ViewOutfitDialog })),
  { ssr: false }
);

export default function OutfitPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [editingOutfit, setEditingOutfit] = useState<Outfit | null>(null);
  const [viewingOutfit, setViewingOutfit] = useState<Outfit | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const pageSize = 12;

  const { isAuthenticated, user } = useAuthStore();
  const {
    searchQuery,
    showFavorites,
    isCreateDialogOpen,
    setCreateDialogOpen,
  } = useOutfitStore();

  const { mutate: deleteOutfit } = useDeleteOutfit();

  // Fetch outfits
  const { data, isLoading, error, isError } = useOutfits({
    pageIndex: currentPage,
    pageSize,
    takeAll: false,
    search: searchQuery,
    isFavorite: showFavorites ? true : undefined,
  });

  // Fetch wardrobe items for outfit creation
  const { data: wardrobeData } = useQuery({
    queryKey: ["wardrobe-items"],
    queryFn: () => wardrobeAPI.getItems(1, 100),
  });

  const outfits = data?.data?.data || [];
  const metaData = data?.data?.metaData;
  const wardrobeItems = wardrobeData?.data || [];

  // Log error for debugging
  useEffect(() => {
    if (isError && error) {
      console.error("❌ Error fetching outfits:", error);
    }
  }, [isError, error]);

  const handleEditOutfit = useCallback((outfit: Outfit) => {
    setEditingOutfit(outfit);
    setIsEditDialogOpen(true);
  }, []);

  const handleViewOutfit = useCallback((outfit: Outfit) => {
    setViewingOutfit(outfit);
    setIsViewDialogOpen(true);
  }, []);

  const handleDeleteOutfit = useCallback((outfitId: number) => {
    if (!confirm("Are you sure you want to delete this outfit?")) {
      return;
    }

    deleteOutfit(outfitId);
  }, [deleteOutfit]);

  // Prevent scrolling when dialog is open
  useEffect(() => {
    if (isCreateDialogOpen || isEditDialogOpen || isViewDialogOpen) {
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
  }, [isCreateDialogOpen, isEditDialogOpen, isViewDialogOpen]);

  // Redirect to login if not authenticated
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

  // Show loading while checking auth
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

  return (
    <div className="min-h-screen pt-32">
      <div className="container max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h4 className="font-dela-gothic text-2xl md:text-3xl lg:text-4xl leading-tight">
              <span className="bg-clip-text text-transparent bg-linear-to-r from-white via-blue-100 to-cyan-200">
                My Outfit
              </span>
            </h4>
            <p className="font-poppins text-gray-600 dark:text-gray-400 mt-2">
              Create and manage your outfit combinations
            </p>
          </div>

          <GlassButton
            variant="primary"
            size="lg"
            onClick={() => setCreateDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Outfit
          </GlassButton>
        </div>

        {/* Filters */}
        <OutfitFilters />

        {/* Error State */}
        {isError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="font-poppins text-sm text-red-600 dark:text-red-400">
              ❌ Failed to load outfits. Please check console for details.
            </p>
            {error && (
              <p className="font-poppins text-xs text-red-500 dark:text-red-300 mt-2">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            )}
          </div>
        )}

        {/* Stats */}
        {metaData && (
          <div className="mb-6">
            <p className="font-poppins text-sm text-gray-600 dark:text-gray-400">
              Showing {outfits.length} of {metaData.totalCount} outfits
            </p>
          </div>
        )}

        {/* Outfit Grid */}
        <OutfitGrid
          outfits={outfits}
          isLoading={isLoading}
          onEditOutfit={handleEditOutfit}
          onDeleteOutfit={handleDeleteOutfit}
          onViewOutfit={handleViewOutfit}
        />

        {/* Pagination */}
        {metaData && metaData.totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <GlassButton
              variant="secondary"
              disabled={!metaData.hasPrevious}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </GlassButton>

            <div className="flex items-center gap-2 px-4">
              <span className="font-poppins text-sm text-gray-600 dark:text-gray-400">
                Page {metaData.currentPage} of {metaData.totalPages}
              </span>
            </div>

            <GlassButton
              variant="secondary"
              disabled={!metaData.hasNext}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </GlassButton>
          </div>
        )}

        {/* Create Outfit Dialog */}
        <CreateOutfitDialog
          open={isCreateDialogOpen}
          onOpenChange={setCreateDialogOpen}
          wardrobeItems={wardrobeItems}
        />

        {/* Edit Outfit Dialog */}
        <EditOutfitDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          outfitId={editingOutfit?.id || null}
          wardrobeItems={wardrobeItems}
        />

        {/* View Outfit Dialog */}
        <ViewOutfitDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          outfit={viewingOutfit}
          onEdit={handleEditOutfit}
          onDelete={handleDeleteOutfit}
        />
      </div>
    </div>
  );
}
