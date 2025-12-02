import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { outfitAPI } from "@/lib/api/outfit-api";
import {
  GetOutfitsRequest,
  CreateOutfitRequest,
  Outfit,
  GetSavedOutfitsRequest,
  SavedOutfit,
} from "@/types/outfit";

/**
 * Hook to fetch outfits with pagination
 */
export function useOutfits(params: GetOutfitsRequest) {
  return useQuery({
    queryKey: ["outfits", params],
    queryFn: () => outfitAPI.getOutfits(params),
    staleTime: 0, // Always consider data stale, refetch on mount
    gcTime: 1000 * 60 * 10, // 10 minutes cache
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Always refetch when component mounts
  });
}

/**
 * Hook to fetch a single outfit by ID
 */
export function useOutfit(id: number | null) {
  return useQuery({
    queryKey: ["outfit", id],
    queryFn: () => outfitAPI.getOutfit(id!),
    enabled: id !== null,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes cache
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to create a new outfit
 */
export function useCreateOutfit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOutfitRequest) => outfitAPI.createOutfit(data),
    onSuccess: (response) => {
      toast.success(response.message || "Outfit created successfully!");
      // Invalidate queries to refetch outfits
      queryClient.invalidateQueries({ queryKey: ["outfits"] });
    },
    onError: (error: Error) => {
      console.error("Failed to create outfit:", error);
      toast.error(error.message || "Failed to create outfit");
    },
  });
}

/**
 * Hook to update an existing outfit
 */
export function useUpdateOutfit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateOutfitRequest>;
    }) => outfitAPI.updateOutfit(id, data),
    onSuccess: (response, variables) => {
      toast.success(response.message || "Outfit updated successfully!");
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: ["outfits"] });
      queryClient.invalidateQueries({ queryKey: ["outfit", variables.id] });
    },
    onError: (error: Error) => {
      console.error("Failed to update outfit:", error);
      toast.error(error.message || "Failed to update outfit");
    },
  });
}

/**
 * Hook to delete an outfit
 */
export function useDeleteOutfit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (outfitId: number) => outfitAPI.deleteOutfit(outfitId),
    onMutate: async (outfitId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["outfits"] });

      // Snapshot previous value
      const previousData = queryClient.getQueriesData({
        queryKey: ["outfits"],
      });

      // Optimistically remove from cache
      queryClient.setQueriesData<{ data: { data: Outfit[] } }>(
        { queryKey: ["outfits"] },
        (old) => {
          if (!old?.data?.data) return old;

          return {
            ...old,
            data: {
              ...old.data,
              data: old.data.data.filter((outfit) => outfit.id !== outfitId),
            },
          };
        }
      );

      return { previousData };
    },
    onSuccess: () => {
      toast.success("Outfit deleted successfully!");
    },
    onError: (error: Error, outfitId, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error("Failed to delete outfit:", error);
      toast.error(error.message || "Failed to delete outfit");
    },
    onSettled: () => {
      // Refetch to ensure data is in sync
      queryClient.invalidateQueries({ queryKey: ["outfits"] });
    },
  });
}

/**
 * Hook to toggle favorite status of an outfit
 */
export function useSaveFavoriteOutfit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (outfitId: number) => outfitAPI.toggleFavorite(outfitId),
    onMutate: async (outfitId) => {
      // Cancel outgoing refetches for both list and detail
      await queryClient.cancelQueries({ queryKey: ["outfits"] });
      await queryClient.cancelQueries({ queryKey: ["outfit", outfitId] });

      // Snapshot previous values
      const previousListData = queryClient.getQueriesData({
        queryKey: ["outfits"],
      });
      const previousDetailData = queryClient.getQueryData(["outfit", outfitId]);

      // Update outfit list cache optimistically
      queryClient.setQueriesData<{ data: { data: Outfit[] } }>(
        { queryKey: ["outfits"] },
        (old) => {
          if (!old?.data?.data) return old;

          // Create new array with updated outfit
          const updatedData = old.data.data.map((outfit) =>
            outfit.id === outfitId
              ? { ...outfit, isFavorite: !outfit.isFavorite }
              : outfit
          );

          return {
            ...old,
            data: {
              ...old.data,
              data: updatedData,
            },
          };
        }
      );

      // Update outfit detail cache optimistically
      queryClient.setQueryData<Outfit>(["outfit", outfitId], (old) => {
        if (!old) return old;
        return { ...old, isFavorite: !old.isFavorite };
      });

      return { previousListData, previousDetailData };
    },
    onSuccess: () => {
      toast.success("Favorite status updated!");
    },
    onError: (error: Error, outfitId, context) => {
      // Rollback on error
      if (context?.previousListData) {
        context.previousListData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousDetailData) {
        queryClient.setQueryData(
          ["outfit", outfitId],
          context.previousDetailData
        );
      }
      console.error("Failed to update favorite:", error);
      toast.error("Failed to update favorite status");
    },
    onSettled: (data, error, outfitId) => {
      // Refetch to ensure data is in sync
      queryClient.invalidateQueries({ queryKey: ["outfits"] });
      queryClient.invalidateQueries({ queryKey: ["outfit", outfitId] });
    },
  });
}

/**
 * Hook to fetch saved outfits from posts and collections
 */
export function useSavedOutfits(
  params: GetSavedOutfitsRequest,
  enabled = true
) {
  return useQuery({
    queryKey: ["saved-outfits", params],
    queryFn: () => outfitAPI.getSavedOutfits(params),
    enabled,
    staleTime: 0,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

/**
 * Hook to unsave an outfit from a post or collection
 */
export function useUnsaveOutfit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      outfitId,
      sourceId,
      sourceType,
    }: {
      outfitId: number;
      sourceId: number;
      sourceType: "Post" | "Collection";
    }) => {
      if (sourceType === "Post") {
        return outfitAPI.unsaveFromPost(outfitId, sourceId);
      } else {
        return outfitAPI.unsaveFromCollection(outfitId, sourceId);
      }
    },
    onMutate: async ({ outfitId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["saved-outfits"] });

      // Snapshot previous value
      const previousData = queryClient.getQueriesData({
        queryKey: ["saved-outfits"],
      });

      // Optimistically remove from cache
      queryClient.setQueriesData<{ data: { data: { items: SavedOutfit[] } } }>(
        { queryKey: ["saved-outfits"] },
        (old) => {
          if (!old?.data?.data?.items) return old;

          return {
            ...old,
            data: {
              ...old.data,
              data: {
                ...old.data.data,
                items: old.data.data.items.filter(
                  (outfit) => outfit.id !== outfitId
                ),
              },
            },
          };
        }
      );

      return { previousData };
    },
    onSuccess: (_, variables) => {
      const source = variables.sourceType === "Post" ? "post" : "collection";
      toast.success(`Outfit removed from saved ${source}`);
    },
    onError: (error: Error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error("Failed to unsave outfit:", error);
      toast.error(error.message || "Failed to unsave outfit");
    },
    onSettled: (data, error, variables) => {
      // Refetch to ensure data is in sync
      queryClient.invalidateQueries({ queryKey: ["saved-outfits"] });
      queryClient.invalidateQueries({ queryKey: ["outfits"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      // Invalidate all collection queries (both singular and plural)
      queryClient.invalidateQueries({ queryKey: ["collection"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}
