/**
 * React Query hooks for Wardrobe data management
 * Handles caching, optimistic updates, and background sync
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wardrobeAPI, type ApiWardrobeItem, type CreateWardrobeItemRequest } from '@/lib/api/wardrobe-api';
import { queryKeys } from '@/lib/query-client';

// Types
interface WardrobeFilters extends Record<string, unknown> {
  category?: string;
  color?: string;
  season?: string;
  page?: number;
  limit?: number;
  search?: string;
}

// Note: PaginatedResponse will be used when backend pagination is implemented
// interface PaginatedResponse<T> {
//   data: T[];
//   totalCount: number;
//   currentPage: number;
//   totalPages: number;
//   hasNext: boolean;
//   hasPrevious: boolean;
// }

/**
 * Fetch wardrobe items with caching
 */
export function useWardrobeItems(filters: WardrobeFilters = {}) {
  return useQuery({
    queryKey: queryKeys.wardrobe.list(filters),
    queryFn: async (): Promise<ApiWardrobeItem[]> => {
      // For now, use existing API - later can implement pagination
      const items = await wardrobeAPI.getItems();
      
      // Client-side filtering until backend pagination is implemented
      let filteredItems = items;
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredItems = filteredItems.filter(item => 
          item.name.toLowerCase().includes(searchTerm) ||
          item.brand?.toLowerCase().includes(searchTerm) ||
          item.color.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters.category) {
        filteredItems = filteredItems.filter(item => 
          item.categoryName.toLowerCase() === filters.category?.toLowerCase()
        );
      }
      
      if (filters.color) {
        filteredItems = filteredItems.filter(item => 
          item.color.toLowerCase().includes(filters.color!.toLowerCase())
        );
      }
      
      return filteredItems;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetch single wardrobe item
 */
export function useWardrobeItem(id: string) {
  return useQuery({
    queryKey: queryKeys.wardrobe.detail(id),
    queryFn: () => wardrobeAPI.getItem(parseInt(id)),
    enabled: !!id,
  });
}

/**
 * Create new wardrobe item with optimistic updates
 */
export function useCreateWardrobeItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (itemData: CreateWardrobeItemRequest) => 
      wardrobeAPI.createItem(itemData),
    
    onMutate: async (newItem) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.wardrobe.lists() 
      });
      
      // Snapshot the previous value
      const previousItems = queryClient.getQueryData(
        queryKeys.wardrobe.list({})
      ) as ApiWardrobeItem[] | undefined;
      
      // Optimistically update to the new value
      if (previousItems) {
        const optimisticItem: ApiWardrobeItem = {
          ...newItem,
          id: Date.now(), // Temporary ID
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        queryClient.setQueryData(
          queryKeys.wardrobe.list({}),
          [...previousItems, optimisticItem]
        );
      }
      
      // Return context with snapshot
      return { previousItems };
    },
    
    onError: (err, newItem, context) => {
      // Roll back on error
      if (context?.previousItems) {
        queryClient.setQueryData(
          queryKeys.wardrobe.list({}),
          context.previousItems
        );
      }
    },
    
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: queryKeys.wardrobe.lists()
      });
    },
  });
}

/**
 * Update wardrobe item with optimistic updates
 */
export function useUpdateWardrobeItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateWardrobeItemRequest> }) =>
      wardrobeAPI.updateItem(id, data),
    
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.wardrobe.lists()
      });
      
      // Update the specific item in cache
      const queryKey = queryKeys.wardrobe.detail(id.toString());
      const previousItem = queryClient.getQueryData(queryKey) as ApiWardrobeItem | undefined;
      
      if (previousItem) {
        queryClient.setQueryData(queryKey, {
          ...previousItem,
          ...data,
          updatedAt: new Date().toISOString(),
        });
      }
      
      return { previousItem };
    },
    
    onError: (err, { id }, context) => {
      if (context?.previousItem) {
        queryClient.setQueryData(
          queryKeys.wardrobe.detail(id.toString()),
          context.previousItem
        );
      }
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.wardrobe.all
      });
    },
  });
}

/**
 * Delete wardrobe item with optimistic updates
 */
export function useDeleteWardrobeItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => wardrobeAPI.deleteItem(id),
    
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.wardrobe.lists()
      });
      
      // Remove from cache immediately
      const previousItems = queryClient.getQueryData(
        queryKeys.wardrobe.list({})
      ) as ApiWardrobeItem[] | undefined;
      
      if (previousItems) {
        queryClient.setQueryData(
          queryKeys.wardrobe.list({}),
          previousItems.filter(item => item.id !== id)
        );
      }
      
      return { previousItems };
    },
    
    onError: (err, id, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(
          queryKeys.wardrobe.list({}),
          context.previousItems
        );
      }
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.wardrobe.lists()
      });
    },
  });
}

/**
 * Prefetch wardrobe items for better UX
 */
export function usePrefetchWardrobeItems() {
  const queryClient = useQueryClient();
  
  return (filters: WardrobeFilters = {}) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.wardrobe.list(filters),
      queryFn: () => wardrobeAPI.getItems(),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
}