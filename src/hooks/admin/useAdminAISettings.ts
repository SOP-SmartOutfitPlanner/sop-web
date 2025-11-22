import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api/admin-api";
import { toast } from "sonner";

/**
 * Hook for fetching all AI settings
 */
export function useAdminAISettings() {
  return useQuery({
    queryKey: ["admin-ai-settings"],
    queryFn: () => adminAPI.getAISettings(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook for fetching a single AI setting by ID
 */
export function useAdminAISettingById(id?: number) {
  return useQuery({
    queryKey: ["admin-ai-settings", id],
    queryFn: () => adminAPI.getAISettingById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

/**
 * Hook for fetching AI setting by type
 */
export function useAdminAISettingByType(type?: string) {
  return useQuery({
    queryKey: ["admin-ai-settings", "type", type],
    queryFn: () => adminAPI.getAISettingByType(type!),
    enabled: !!type,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

/**
 * Hook for creating an AI setting
 */
export function useCreateAISetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; value: string; type: string }) =>
      adminAPI.createAISetting(data),
    onSuccess: () => {
      toast.success("AI Setting created successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-ai-settings"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create AI Setting");
    },
  });
}

/**
 * Hook for updating an AI setting
 */
export function useUpdateAISetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { name: string; value: string; type: string };
    }) => adminAPI.updateAISetting(id, data),
    onSuccess: () => {
      toast.success("AI Setting updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-ai-settings"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update AI Setting");
    },
  });
}

/**
 * Hook for deleting an AI setting
 */
export function useDeleteAISetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminAPI.deleteAISetting(id),
    onSuccess: () => {
      toast.success("AI Setting deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-ai-settings"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete AI Setting");
    },
  });
}

/**
 * Hook for bulk deleting AI settings
 */
export function useBulkDeleteAISettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      // Sequential delete since no bulk API
      await Promise.all(ids.map((id) => adminAPI.deleteAISetting(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ai-settings"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete AI Settings");
    },
  });
}

