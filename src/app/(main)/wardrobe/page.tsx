"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { WardrobeHeader } from "@/components/wardrobe/header/WardrobeHeader";
import { WardrobeContent } from "@/components/wardrobe/wardrobe-content";
import { ErrorDisplay } from "@/components/common/error-display";
import { AnalysisToast } from "@/components/wardrobe/wizard/AnalysisToast";
import { useWardrobeStore } from "@/store/wardrobe-store";
import { useAuthStore } from "@/store/auth-store";
import { useScrollLock } from "@/hooks/useScrollLock";
import { WardrobeFilters } from "@/types/wardrobe";
import { WardrobeItem } from "@/types";
import { PostModal } from "@/components/community/profile/PostModal";
import { Post, apiPostToPost } from "@/types/community";
import { communityAPI } from "@/lib/api/community-api";
import { toast } from "sonner";

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

// Dynamic import for edit item dialog
const EditItemDialog = dynamic(
  () =>
    import("@/components/wardrobe/EditItemDialog").then((mod) => ({
      default: mod.EditItemDialog,
    })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm text-muted-foreground">
          Loading editor...
        </span>
      </div>
    ),
  }
);

// Dynamic import for view item dialog
const ViewItemDialog = dynamic(
  () =>
    import("@/components/wardrobe/ViewItemDialog").then((mod) => ({
      default: mod.ViewItemDialog,
    })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
      </div>
    ),
  }
);

// Separate component for handling search params
function WardrobePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Edit mode state
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [editItemId, setEditItemId] = useState<number | null>(null);

  // View mode state
  const [isViewItemOpen, setIsViewItemOpen] = useState(false);
  const [viewItemId, setViewItemId] = useState<number | null>(null);

  // Post modal state
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [viewingPost, setViewingPost] = useState<Post | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(false);

  const { isAuthenticated, user } = useAuthStore();

  // Store hooks - MUST be called before any conditional returns
  const {
    isLoading,
    error,
    items,
    filters,
    setFilters: setStoreFilters,
    analyzingItem,
    analysisProgress,
  } = useWardrobeStore();

  // Handlers - ALL hooks must be called before conditional returns
  const handleViewItem = (item: WardrobeItem) => {
    setViewItemId(parseInt(item.id));
    setIsViewItemOpen(true);
  };

  const handleOpenPost = async (postId: number) => {
    setIsLoadingPost(true);
    try {
      const post = await communityAPI.getPostById(postId);
      if (post) {
        setViewingPost(apiPostToPost(post));
        setIsPostModalOpen(true);
      }
    } catch (error) {
      console.error("Failed to fetch post:", error);
      toast.error("Failed to load post details");
    } finally {
      setIsLoadingPost(false);
    }
  };

  const handleLikePost = async () => {
    if (!viewingPost || !user) return;

    const previousState = { ...viewingPost };
    const newIsLiked = !viewingPost.isLiked;
    const newLikeCount = viewingPost.likes + (newIsLiked ? 1 : -1);

    // Optimistic update
    setViewingPost({
      ...viewingPost,
      isLiked: newIsLiked,
      likes: newLikeCount,
    });

    try {
      await communityAPI.toggleLikePost(
        parseInt(viewingPost.id),
        parseInt(user.id)
      );
    } catch (error) {
      console.error("Failed to toggle like:", error);
      // Revert on error
      setViewingPost(previousState);
      toast.error("Failed to update like");
    }
  };

  const handleEditItem = (item: WardrobeItem) => {
    setEditItemId(parseInt(item.id));
    setIsEditItemOpen(true);
  };

  const handleEditFromView = () => {
    if (viewItemId) {
      setIsViewItemOpen(false);
      setTimeout(() => {
        setEditItemId(viewItemId);
        setIsEditItemOpen(true);
      }, 100);
    }
  };

  const handleItemUpdated = async () => {
    // Refresh wardrobe items after successful edit
    const state = useWardrobeStore.getState();
    await state.fetchItems();
  };

  const handleFiltersChange = useCallback(
    (newFilters: WardrobeFilters) => {
      setStoreFilters(newFilters);

      // Update URL query parameters
      const params = new URLSearchParams();
      if (newFilters.isAnalyzed !== undefined) {
        params.set("isAnalyzed", newFilters.isAnalyzed.toString());
      }
      if (newFilters.categoryId) {
        params.set("categoryId", newFilters.categoryId.toString());
      }
      if (newFilters.seasonId) {
        params.set("seasonId", newFilters.seasonId.toString());
      }
      if (newFilters.styleId) {
        params.set("styleId", newFilters.styleId.toString());
      }
      if (newFilters.occasionId) {
        params.set("occasionId", newFilters.occasionId.toString());
      }
      if (newFilters.sortByDate) {
        params.set("sortByDate", newFilters.sortByDate);
      }

      // Update URL without reloading
      const newUrl = params.toString() ? `?${params.toString()}` : "/wardrobe";
      router.replace(newUrl, { scroll: false });
    },
    [router, setStoreFilters]
  );

  // Initialize filters from URL query parameters
  useEffect(() => {
    if (searchParams) {
      const urlFilters: WardrobeFilters = { ...filters };

      const isAnalyzed = searchParams.get("isAnalyzed");
      if (isAnalyzed !== null) {
        urlFilters.isAnalyzed = isAnalyzed === "true";
      }

      const categoryId = searchParams.get("categoryId");
      if (categoryId) {
        urlFilters.categoryId = parseInt(categoryId);
      }

      const seasonId = searchParams.get("seasonId");
      if (seasonId) {
        urlFilters.seasonId = parseInt(seasonId);
      }

      const styleId = searchParams.get("styleId");
      if (styleId) {
        urlFilters.styleId = parseInt(styleId);
      }

      const occasionId = searchParams.get("occasionId");
      if (occasionId) {
        urlFilters.occasionId = parseInt(occasionId);
      }

      const sortByDate = searchParams.get("sortByDate");
      if (sortByDate === "asc" || sortByDate === "desc") {
        urlFilters.sortByDate = sortByDate;
      }

      // Only update if filters changed
      const hasFiltersChanged =
        urlFilters.isAnalyzed !== filters.isAnalyzed ||
        urlFilters.categoryId !== filters.categoryId ||
        urlFilters.seasonId !== filters.seasonId ||
        urlFilters.styleId !== filters.styleId ||
        urlFilters.occasionId !== filters.occasionId ||
        urlFilters.sortByDate !== filters.sortByDate;

      if (hasFiltersChanged) {
        setStoreFilters(urlFilters);
      }
    }
    // Only run on mount or when searchParams change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Prevent scrolling when dialog is open
  const isAnyDialogOpen = isAddItemOpen || isEditItemOpen || isViewItemOpen;
  useScrollLock(isAnyDialogOpen);

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
        <WardrobeContent
          onEditItem={handleEditItem}
          onViewItem={handleViewItem}
          onOpenPost={handleOpenPost}
        />

        {/* Wardrobe Statistics at Bottom */}
        {/* <WardrobeStats /> */}

        {/* Add Item Wizard */}
        <AddItemWizard open={isAddItemOpen} onOpenChange={setIsAddItemOpen} />

        {/* View Item Dialog */}
        {viewItemId && (
          <ViewItemDialog
            open={isViewItemOpen}
            onOpenChange={(open) => {
              setIsViewItemOpen(open);
              if (!open) {
                setTimeout(() => {
                  setViewItemId(null);
                }, 300);
              }
            }}
            itemId={viewItemId}
            onEdit={handleEditFromView}
            savedFromPost={
              items.find((i) => parseInt(i.id) === viewItemId)?.savedFromPost
            }
            onOpenPost={handleOpenPost}
            isPostLoading={isLoadingPost}
          />
        )}

        {/* Edit Item Dialog */}
        {editItemId && (
          <EditItemDialog
            open={isEditItemOpen}
            onOpenChange={(open) => {
              setIsEditItemOpen(open);
              if (!open) {
                setTimeout(() => {
                  setEditItemId(null);
                }, 300);
              }
            }}
            itemId={editItemId}
            onItemUpdated={handleItemUpdated}
          />
        )}

        {/* Post Modal */}
        {viewingPost && (
          <PostModal
            post={viewingPost}
            isOpen={isPostModalOpen}
            onClose={() => setIsPostModalOpen(false)}
            onLike={handleLikePost}
          />
        )}

        {/* Full Screen Loading Overlay */}
        {isLoadingPost && (
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white font-medium">Loading post...</p>
            </div>
          </div>
        )}

        {/* Analysis Toast */}
        <AnalysisToast
          isVisible={!!analyzingItem}
          progress={analysisProgress}
          imageUrl={analyzingItem?.imageUrl}
          itemName={analyzingItem?.name}
        />
      </div>
    </div>
  );
}

// Export default component with Suspense boundary
export default function WardrobePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading wardrobe...</p>
          </div>
        </div>
      }
    >
      <WardrobePageContent />
    </Suspense>
  );
}
