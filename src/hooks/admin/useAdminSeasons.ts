import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api/admin-api";
import { toast } from "sonner";

/**
 * Hook for fetching seasons list
 */
export function useAdminSeasons(params?: {
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ["admin-seasons", params?.page, params?.pageSize],
    queryFn: () => adminAPI.getSeasons(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook for creating a season
 */
export function useCreateSeason() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string }) => adminAPI.createSeason(data),
    onSuccess: () => {
      toast.success("Season created successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-seasons"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create season");
    },
  });
}

/**
 * Hook for updating a season
 */
export function useUpdateSeason() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; name: string }) =>
      adminAPI.updateSeason(data),
    onSuccess: () => {
      toast.success("Season updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-seasons"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update season");
    },
  });
}

/**
 * Hook for deleting a season
 */
export function useDeleteSeason() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminAPI.deleteSeason(id),
    onSuccess: () => {
      toast.success("Season deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-seasons"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete season");
    },
  });
}

/**
 * Hook for bulk deleting seasons
 */
export function useBulkDeleteSeasons() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      // Sequential delete since no bulk API
      await Promise.all(ids.map((id) => adminAPI.deleteSeason(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-seasons"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete seasons");
    },
  });
}

