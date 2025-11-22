import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api/admin-api";
import { toast } from "sonner";

/**
 * Hook for fetching styles list
 */
export function useAdminStyles(params?: {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ["admin-styles", params?.pageIndex, params?.pageSize, params?.search],
    queryFn: () => adminAPI.getStyles(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook for creating a style
 */
export function useCreateStyle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      adminAPI.createStyle(data),
    onSuccess: () => {
      toast.success("Style created successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-styles"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create style");
    },
  });
}

/**
 * Hook for updating a style
 */
export function useUpdateStyle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; name: string; description: string }) =>
      adminAPI.updateStyle(data),
    onSuccess: () => {
      toast.success("Style updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-styles"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update style");
    },
  });
}

/**
 * Hook for deleting a style
 */
export function useDeleteStyle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminAPI.deleteStyle(id),
    onSuccess: () => {
      toast.success("Style deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-styles"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete style");
    },
  });
}

/**
 * Hook for bulk deleting styles
 */
export function useBulkDeleteStyles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      // Sequential delete since no bulk API
      await Promise.all(ids.map((id) => adminAPI.deleteStyle(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-styles"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete styles");
    },
  });
}

