/**
 * React Query Client Configuration
 * Handles data caching, background refetching, and optimistic updates
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 2 times
      retry: 2,
      // Don't refetch on window focus by default
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

// Query Keys for consistent caching
export const queryKeys = {
  wardrobe: {
    all: ['wardrobe'] as const,
    lists: () => [...queryKeys.wardrobe.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => 
      [...queryKeys.wardrobe.lists(), filters] as const,
    details: () => [...queryKeys.wardrobe.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.wardrobe.details(), id] as const,
  },
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
  },
} as const;