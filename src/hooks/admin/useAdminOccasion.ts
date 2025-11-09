import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api/admin-api";
import type {
  OccasionsListRequest,
  CreateOccasionRequest,
  UpdateOccasionRequest,
} from "@/types/occasion";
import { toast } from "sonner";

/**
 * Hook for fetching occasions list
 */
export function useAdminOccasions(params: OccasionsListRequest) {
  return useQuery({
    queryKey: ["admin-occasions", params.PageIndex, params.PageSize, params.Search],
    queryFn: () => adminAPI.getOccasions(params),
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
  });
}

/**
 * Hook for creating an occasion
 */
export function useCreateOccasion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOccasionRequest) => adminAPI.createOccasion(data),
    onSuccess: () => {
      toast.success("Occasion created successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-occasions"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create occasion");
    },
  });
}

/**
 * Hook for updating an occasion
 */
export function useUpdateOccasion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateOccasionRequest) => adminAPI.editOccasion(data),
    onSuccess: () => {
      toast.success("Occasion updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-occasions"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update occasion");
    },
  });
}

/**
 * Hook for deleting an occasion
 */
export function useDeleteOccasion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminAPI.deleteOccasion(id),
    onSuccess: () => {
      toast.success("Occasion deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-occasions"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete occasion");
    },
  });
}

/**
 * Hook for bulk deleting occasions
 */
export function useBulkDeleteOccasions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      // Sequential delete since no bulk API
      await Promise.all(ids.map((id) => adminAPI.deleteOccasion(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-occasions"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete occasions");
    },
  });
}
