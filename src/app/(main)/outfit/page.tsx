"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import GlassButton from "@/components/ui/glass-button";
import { OutfitGrid } from "@/components/outfit/OutfitGrid";
import { OutfitFilters } from "@/components/outfit/OutfitFilters";
import {
  useOutfits,
  useDeleteOutfit,
  useSavedOutfits,
  useUnsaveOutfit,
} from "@/hooks/useOutfits";
import { useCreateCalendarEntry, useUserOccasions } from "@/hooks/useCalendar";
import { useOutfitStore } from "@/store/outfit-store";
import { wardrobeAPI } from "@/lib/api/wardrobe-api";
import { communityAPI } from "@/lib/api/community-api";
import { useAuthStore } from "@/store/auth-store";
import { Outfit, SavedOutfit } from "@/types/outfit";
import { Post, apiPostToPost } from "@/types/community";
import { format, startOfDay } from "date-fns";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PostModal } from "@/components/community/profile/PostModal";
import { toast } from "sonner";

// Dynamic imports to avoid SSR issues with antd Image
const CreateOutfitDialog = dynamic(
  () =>
    import("@/components/outfit/CreateOutfitDialog").then((mod) => ({
      default: mod.CreateOutfitDialog,
    })),
  { ssr: false }
);
const EditOutfitDialog = dynamic(
  () =>
    import("@/components/outfit/EditOutfitDialog").then((mod) => ({
      default: mod.EditOutfitDialog,
    })),
  { ssr: false }
);
const ViewOutfitDialog = dynamic(
  () =>
    import("@/components/outfit/ViewOutfitDialog").then((mod) => ({
      default: mod.ViewOutfitDialog,
    })),
  { ssr: false }
);
const VirtualTryOnDialog = dynamic(
  () =>
    import("@/components/outfit/VirtualTryOnDialog").then((mod) => ({
      default: mod.VirtualTryOnDialog,
    })),
  { ssr: false }
);

export default function OutfitPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [editingOutfit, setEditingOutfit] = useState<Outfit | null>(null);
  const [viewingOutfit, setViewingOutfit] = useState<
    Outfit | SavedOutfit | null
  >(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isVirtualTryOnDialogOpen, setIsVirtualTryOnDialogOpen] =
    useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [viewingPost, setViewingPost] = useState<Post | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const pageSize = 12;

  const { isAuthenticated, user } = useAuthStore();
  const {
    searchQuery,
    showFavorites,
    viewMode,
    isCreateDialogOpen,
    setCreateDialogOpen,
  } = useOutfitStore();

  const { mutate: deleteOutfit } = useDeleteOutfit();
  const { mutate: unsaveOutfit } = useUnsaveOutfit();
  const { mutate: createCalendarEntry } = useCreateCalendarEntry();
  const [isPastDateDialogOpen, setIsPastDateDialogOpen] = useState(false);

  // Fetch today's occasions to find existing Daily occasion
  const { data: todayOccasionsData } = useUserOccasions({
    PageIndex: 1,
    PageSize: 100,
    takeAll: true,
    Today: true,
  });

  // Fetch regular outfits when in my-outfits mode
  const { data, isLoading, error, isError } = useOutfits(
    {
      pageIndex: currentPage,
      pageSize,
      takeAll: false,
      search: searchQuery,
      isFavorite: showFavorites ? true : undefined,
    },
    viewMode === "my-outfits" // Only fetch when in my-outfits mode
  );

  // Fetch saved outfits from both posts and collections
  const {
    data: savedOutfitsData,
    isLoading: isSavedLoading,
    error: savedError,
    isError: isSavedError,
  } = useSavedOutfits(
    {
      pageIndex: currentPage,
      pageSize,
      search: searchQuery,
      // Don't specify sourceType to get both posts and collections
    },
    viewMode === "saved"
  );

  // Select data based on view mode
  const displayData = viewMode === "my-outfits" ? data : savedOutfitsData;

  const displayIsLoading =
    viewMode === "my-outfits" ? isLoading : isSavedLoading;

  const displayError = viewMode === "my-outfits" ? error : savedError;

  const displayIsError = viewMode === "my-outfits" ? isError : isSavedError;

  // Fetch wardrobe items for outfit creation
  const { data: wardrobeData } = useQuery({
    queryKey: ["wardrobe-items"],
    queryFn: () => wardrobeAPI.getItems(1, 100),
  });

  const outfits =
    displayData?.data?.data && Array.isArray(displayData.data.data)
      ? displayData.data.data
      : [];
  const metaData = displayData?.data?.metaData;
  const wardrobeItems = wardrobeData?.data || [];
  const isReadOnly = viewMode !== "my-outfits";

  // Log error for debugging
  useEffect(() => {
    if (displayIsError && displayError) {
      console.error("❌ Error fetching outfits:", displayError);
    }
  }, [displayIsError, displayError]);

  const handleEditOutfit = useCallback((outfit: Outfit) => {
    setEditingOutfit(outfit);
    setIsEditDialogOpen(true);
  }, []);

  const handleViewOutfit = useCallback((outfit: Outfit | SavedOutfit) => {
    setViewingOutfit(outfit);
    setIsViewDialogOpen(true);
  }, []);

  const handleDeleteOutfit = useCallback(
    (outfitId: number) => {
      deleteOutfit(outfitId);
    },
    [deleteOutfit]
  );

  const handleUnsaveOutfit = useCallback(
    (outfitId: number, sourceId: number, sourceType: "Post" | "Collection") => {
      unsaveOutfit({ outfitId, sourceId, sourceType });
    },
    [unsaveOutfit]
  );

  const handleOpenPost = useCallback(async (postId: number) => {
    try {
      setIsLoadingPost(true);
      const communityPost = await communityAPI.getPostById(postId);
      const post = apiPostToPost(communityPost);
      setViewingPost(post);
      setIsPostModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch post:", error);
      toast.error("Failed to load post");
    } finally {
      setIsLoadingPost(false);
    }
  }, []);

  const handleLikePost = useCallback(async () => {
    if (!viewingPost || !user?.id) return;

    // Optimistically update the UI
    const previousState = viewingPost;

    setViewingPost({
      ...viewingPost,
      isLiked: !viewingPost.isLiked,
      likes: viewingPost.isLiked
        ? viewingPost.likes - 1
        : viewingPost.likes + 1,
    });

    // Call the API
    try {
      await communityAPI.toggleLikePost(
        parseInt(viewingPost.id),
        parseInt(user.id.toString())
      );
    } catch (error) {
      // Revert on error
      console.error("Failed to like post:", error);
      toast.error("Failed to update like");
      setViewingPost(previousState);
    }
  }, [viewingPost, user]);

  const handleClosePostModal = useCallback(() => {
    setIsPostModalOpen(false);
    setViewingPost(null);
  }, []);

  const handleUseToday = useCallback(
    (outfit: Outfit) => {
      const todayDate = startOfDay(new Date());
      const formattedDate = format(todayDate, "yyyy-MM-dd'T'HH:mm:ss");
      const dateString = format(todayDate, "yyyy-MM-dd");

      // Find existing Daily occasion for today
      const todayOccasions = todayOccasionsData?.data?.data || [];
      const existingDailyOccasion = todayOccasions.find(
        (occ) =>
          occ.name === "Daily" &&
          format(new Date(occ.dateOccasion), "yyyy-MM-dd") === dateString &&
          occ.occasionId === null
      );

      if (existingDailyOccasion) {
        // Use existing Daily occasion
        createCalendarEntry(
          {
            outfitIds: [outfit.id],
            isDaily: false,
            userOccasionId: existingDailyOccasion.id,
            endTime: formattedDate,
          },
          {
            onSuccess: () => {
              // Optionally show success message
              console.log("✅ Outfit added to today's calendar");
            },
            onError: (error) => {
              console.error("❌ Failed to add outfit to calendar:", error);
            },
          }
        );
      } else {
        // Create new Daily entry (backend will create Daily occasion)
        createCalendarEntry(
          {
            outfitIds: [outfit.id],
            isDaily: true,
            time: formattedDate,
            endTime: formattedDate,
          },
          {
            onSuccess: () => {
              // Optionally show success message
              console.log("✅ Outfit added to today's calendar");
            },
            onError: (error) => {
              console.error("❌ Failed to add outfit to calendar:", error);
            },
          }
        );
      }
    },
    [createCalendarEntry, todayOccasionsData]
  );

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
  }, [
    isCreateDialogOpen,
    isEditDialogOpen,
    isViewDialogOpen,
    isVirtualTryOnDialogOpen,
  ]);

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
            <p className="bg-clip-text text-transparent bg-linear-to-r from-white via-blue-100 to-cyan-200">
              Create and manage your outfit combinations
            </p>
          </div>

          <div className="flex gap-2">
            <GlassButton
              variant="secondary"
              size="md"
              onClick={() => setIsVirtualTryOnDialogOpen(true)}
              className="gap-1.5"
              disabled={isReadOnly}
            >
              <Sparkles className="w-4 h-4" />
              Virtual Try-On
            </GlassButton>
            <GlassButton
              variant="primary"
              size="md"
              onClick={() => setCreateDialogOpen(true)}
              className="gap-1.5"
              disabled={isReadOnly}
            >
              <Plus className="w-4 h-4" />
              Create Outfit
            </GlassButton>
          </div>
        </div>

        {/* Filters */}
        <OutfitFilters />

        {/* Error State */}
        {displayIsError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="font-poppins text-sm text-red-600 dark:text-red-400">
              ❌ Failed to load outfits. Please check console for details.
            </p>
            {displayError && (
              <p className="font-poppins text-xs text-red-500 dark:text-red-300 mt-2">
                {displayError instanceof Error
                  ? displayError.message
                  : "Unknown error"}
              </p>
            )}
          </div>
        )}

        {/* Stats */}
        {metaData && (
          <div className="mb-6">
            <p className="font-poppins text-sm font-medium text-white/90">
              Showing {outfits.length} of {metaData.totalCount} outfits
            </p>
          </div>
        )}

        {/* Outfit Grid */}
        <OutfitGrid
          outfits={outfits}
          isLoading={displayIsLoading}
          onEditOutfit={isReadOnly ? undefined : handleEditOutfit}
          onDeleteOutfit={isReadOnly ? undefined : handleDeleteOutfit}
          onUnsaveOutfit={isReadOnly ? handleUnsaveOutfit : undefined}
          onViewOutfit={handleViewOutfit}
          onUseToday={isReadOnly ? undefined : handleUseToday}
          onOpenPost={isReadOnly ? handleOpenPost : undefined}
          isSavedView={isReadOnly}
        />

        {/* Pagination */}
        {metaData && metaData.totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <GlassButton
              variant="secondary"
              disabled={
                ("hasPrevious" in metaData && !metaData.hasPrevious) ||
                currentPage <= 1
              }
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </GlassButton>

            <div className="flex items-center gap-2 px-4">
              <span className="font-poppins text-sm text-gray-600 dark:text-gray-400">
                Page{" "}
                {"currentPage" in metaData ? metaData.currentPage : currentPage}{" "}
                of {metaData.totalPages}
              </span>
            </div>

            <GlassButton
              variant="secondary"
              disabled={
                ("hasNext" in metaData && !metaData.hasNext) ||
                currentPage >= metaData.totalPages
              }
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
          onEdit={isReadOnly ? undefined : handleEditOutfit}
          onDelete={isReadOnly ? undefined : handleDeleteOutfit}
          onUnsave={isReadOnly ? handleUnsaveOutfit : undefined}
          onOpenPost={isReadOnly ? handleOpenPost : undefined}
        />

        {/* Post Modal for viewing source posts */}
        {isLoadingPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-white font-poppins text-sm">Loading post...</p>
            </div>
          </div>
        )}
        {isPostModalOpen && viewingPost && (
          <PostModal
            post={viewingPost}
            isOpen={isPostModalOpen}
            onClose={handleClosePostModal}
            onLike={handleLikePost}
            onPostUpdated={() => {}}
            onPostDeleted={handleClosePostModal}
          />
        )}

        {/* Past Date Warning Dialog */}
        <ConfirmDialog
          open={isPastDateDialogOpen}
          onOpenChange={setIsPastDateDialogOpen}
          onConfirm={() => setIsPastDateDialogOpen(false)}
          title="Cannot Add to Past Date"
          description="You can only add outfits to calendar for today or future dates."
          confirmText="OK"
          cancelText=""
          variant="warning"
          isLoading={false}
        />

        {/* Virtual Try-On Dialog */}
        <VirtualTryOnDialog
          open={isVirtualTryOnDialogOpen}
          onOpenChange={setIsVirtualTryOnDialogOpen}
        />
      </div>
    </div>
  );
}
