import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api/admin-api";
import { ItemsListRequest } from "@/types/item";
import { toast } from "sonner";

/**
 * Hook for fetching admin items list
 */
export function useAdminItems(params: ItemsListRequest) {
  return useQuery({
    queryKey: ["admin-items", params.PageIndex, params.PageSize, params.Search],
    queryFn: () => {
      console.log('API Call with params:', params);
      return adminAPI.getItems(params);
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes (renamed from cacheTime)
  });
}

/**
 * Hook for deleting an item (if needed in the future)
 */
export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: number) => {
      // TODO: Add delete item API endpoint when available
      throw new Error("Delete item API not implemented yet");
    },
    onSuccess: () => {
      toast.success("Item deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-items"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete item");
    },
  });
}
