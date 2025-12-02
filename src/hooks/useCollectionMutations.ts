import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { collectionAPI, communityAPI } from "@/lib/api";
import { COLLECTION_QUERY_KEYS } from "@/lib/collections/constants";

/**
 * Hook to invalidate collection-related queries
 */
export function useInvalidateCollectionQueries(collectionId: number) {
  const queryClient = useQueryClient();

  return useCallback(
    (userId?: number) => {
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEYS.collection(collectionId),
      });
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEYS.collections,
      });
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: COLLECTION_QUERY_KEYS.savedCollections(userId),
        });
      }
    },
    [collectionId, queryClient]
  );
}

/**
 * Hook for liking/unliking a collection
 */
export function useLikeCollection(
  collectionId: number,
  userId: number | null,
  currentIsLiked: boolean | undefined
) {
  const invalidateQueries = useInvalidateCollectionQueries(collectionId);

  return useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("User not authenticated");
      }
      return collectionAPI.likeCollection(collectionId, userId);
    },
    onSuccess: () => {
      invalidateQueries();
      toast.success(
        currentIsLiked ? "Collection unliked" : "Collection liked successfully"
      );
    },
    onError: (error) => {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like status");
    },
  });
}

/**
 * Hook for saving/unsaving a collection
 */
export function useSaveCollection(
  collectionId: number,
  userId: number | null,
  currentIsSaved: boolean | undefined
) {
  const invalidateQueries = useInvalidateCollectionQueries(collectionId);

  return useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("User not authenticated");
      }
      return collectionAPI.saveCollection(collectionId, userId);
    },
    onSuccess: () => {
      invalidateQueries(userId || undefined);
      toast.success(
        currentIsSaved ? "Collection unsaved" : "Collection saved successfully"
      );
    },
    onError: (error) => {
      console.error("Error toggling save:", error);
      toast.error("Failed to update save status");
    },
  });
}

/**
 * Hook for following/unfollowing a stylist
 */
export function useFollowStylist(
  collectionId: number,
  userId: number | null,
  followingId: number,
  currentIsFollowing: boolean | undefined
) {
  const invalidateQueries = useInvalidateCollectionQueries(collectionId);

  return useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("User not authenticated");
      }
      return communityAPI.toggleFollow(userId, followingId);
    },
    onSuccess: () => {
      invalidateQueries();
      toast.success(
        currentIsFollowing
          ? "Unfollowed successfully"
          : "Following successfully"
      );
    },
    onError: (error) => {
      console.error("Error toggling follow:", error);
      toast.error("Failed to update follow status");
    },
  });
}

/**
 * Hook for publishing/unpublishing a collection
 */
export function usePublishCollection(
  collectionId: number,
  currentIsPublished: boolean | undefined
) {
  const invalidateQueries = useInvalidateCollectionQueries(collectionId);

  return useMutation({
    mutationFn: async () => {
      return collectionAPI.togglePublishCollection(collectionId);
    },
    onSuccess: () => {
      invalidateQueries();
      toast.success(
        currentIsPublished
          ? "Collection unpublished successfully"
          : "Collection published successfully"
      );
    },
    onError: (error: unknown) => {
      console.error("Error toggling publish:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update publish status";
      if (errorMessage.includes("permission")) {
        toast.error("You don't have permission to publish this collection");
      } else {
        toast.error("Failed to update publish status");
      }
    },
  });
}

/**
 * Hook for saving/unsaving an outfit from a collection
 */
export function useSaveOutfitFromCollection(
  outfitId: number,
  collectionId: number,
  currentIsSavedFromCollection: boolean | undefined
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (currentIsSavedFromCollection) {
        return collectionAPI.unsaveOutfitFromCollection(outfitId, collectionId);
      } else {
        return collectionAPI.saveOutfitFromCollection(outfitId, collectionId);
      }
    },
    onSuccess: () => {
      // Invalidate the collection query to refresh the isSavedFromCollection status
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEYS.collection(collectionId),
      });
      toast.success(
        currentIsSavedFromCollection
          ? "Outfit removed from saved"
          : "Outfit saved to your wardrobe"
      );
    },
    onError: (error: unknown) => {
      console.error("Error toggling outfit save:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update save status";
      if (errorMessage.includes("already saved")) {
        toast.error("This outfit is already saved");
      } else {
        toast.error("Failed to update save status");
      }
    },
  });
}
