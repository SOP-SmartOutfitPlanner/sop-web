import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wardrobeAPI } from "@/lib/api/wardrobe-api";
import { toast } from "sonner";

interface WardrobeParams {
  pageIndex?: number;
  pageSize?: number;
  searchQuery?: string;
  isAnalyzed?: boolean;
  categoryId?: number;
}

/**
 * Hook for fetching system wardrobe items (all users - admin only)
 */
export function useAdminWardrobeItems(params: WardrobeParams) {
  return useQuery({
    queryKey: [
      "admin-wardrobe-system",
      params.pageIndex,
      params.pageSize,
      params.searchQuery,
      params.isAnalyzed,
      params.categoryId,
    ],
    queryFn: () => wardrobeAPI.getSystemItems(
      params.pageIndex || 1,
      params.pageSize || 15,
      {
        searchQuery: params.searchQuery,
        isAnalyzed: params.isAnalyzed,
        categoryId: params.categoryId,
      }
    ),
    staleTime: 0, // Always fetch fresh data
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
  });
}

/**
 * Hook for fetching a single wardrobe item detail
 */
export function useAdminWardrobeItem(itemId: number | null) {
  return useQuery({
    queryKey: ["admin-wardrobe-item", itemId],
    queryFn: () => (itemId ? wardrobeAPI.getItem(itemId) : null),
    enabled: !!itemId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook for deleting a wardrobe item
 */
export function useDeleteWardrobeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: number) => wardrobeAPI.deleteItem(itemId),
    onSuccess: () => {
      toast.success("Item deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-wardrobe"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete item");
    },
  });
}

/**
 * Hook for bulk deleting wardrobe items
 */
export function useBulkDeleteWardrobeItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemIds: number[]) => {
      // Delete items sequentially
      const promises = itemIds.map((id) =>
        wardrobeAPI.deleteItem(id)
      );
      await Promise.all(promises);
    },
    onSuccess: (_, itemIds) => {
      toast.success(`${itemIds.length} items deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ["admin-wardrobe"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete items");
    },
  });
}
