import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api/admin-api";

/**
 * Hook to fetch all categories
 */
export function useAdminCategories(params?: {
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ["admin", "categories", params],
    queryFn: async () => {
      const response = await adminAPI.getCategories(params);
      return response.data;
    },
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch categories by parent ID
 */
export function useAdminCategoriesByParent(
  parentId: number,
  params?: { page?: number; pageSize?: number }
) {
  return useQuery({
    queryKey: ["admin", "categories", "parent", parentId, params],
    queryFn: async () => {
      const response = await adminAPI.getCategoriesByParent(parentId, params);
      return response.data;
    },
    enabled: !!parentId,
    staleTime: 60000,
  });
}

/**
 * Hook to create category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; parentId: number | null }) => {
      const response = await adminAPI.createCategory(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });
}

/**
 * Hook to update category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: { name: string; parentId: number | null };
    }) => {
      const response = await adminAPI.updateCategory(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });
}

/**
 * Hook to delete category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await adminAPI.deleteCategory(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });
}

/**
 * Hook to bulk delete categories
 */
export function useBulkDeleteCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      await adminAPI.bulkDeleteCategories(ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });
}

/**
 * Hook to fetch category usage statistics
 */
export function useCategoryStats() {
  return useQuery({
    queryKey: ["admin", "categories", "stats"],
    queryFn: async () => {
      const response = await adminAPI.getCategoryStats();
      return response.data;
    },
    staleTime: 60000, // 1 minute
  });
}

