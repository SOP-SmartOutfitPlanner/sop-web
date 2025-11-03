"use client";

import { useQuery } from "@tanstack/react-query";
import { wardrobeAPI } from "@/lib/api/wardrobe-api";

/**
 * Hook to fetch all wardrobe options (categories, styles, seasons, occasions)
 * Used in Add Item wizard to populate selection options
 */
export function useWardrobeOptions() {
  // Fetch categories
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useQuery({
    queryKey: ["wardrobe", "categories"],
    queryFn: async () => {
      const result = await wardrobeAPI.getCategories();
      return result || [];
    },
    staleTime: 0, // Always fresh
    retry: 2,
    enabled: true,
    refetchOnMount: true,
  });

  // Fetch styles
  const {
    data: styles = [],
    isLoading: isLoadingStyles,
    error: stylesError,
  } = useQuery({
    queryKey: ["wardrobe", "styles"],
    queryFn: async () => {
      const result = await wardrobeAPI.getStyles();
      return result || [];
    },
    staleTime: 0, // Always fresh
    retry: 2,
    enabled: true,
    refetchOnMount: true,
  });

  // Fetch seasons
  const {
    data: seasons = [],
    isLoading: isLoadingSeasons,
    error: seasonsError,
  } = useQuery({
    queryKey: ["wardrobe", "seasons"],
    queryFn: async () => {
      const result = await wardrobeAPI.getSeasons();
      return result || [];
    },
    staleTime: 1000 * 60 * 30,
    retry: 2,
  });

  // Fetch occasions
  const {
    data: occasions = [],
    isLoading: isLoadingOccasions,
    error: occasionsError,
  } = useQuery({
    queryKey: ["wardrobe", "occasions"],
    queryFn: async () => {
      const result = await wardrobeAPI.getOccasions();
      return result || [];
    },
    staleTime: 0, // Always fresh
    retry: 2,
    enabled: true,
    refetchOnMount: true,
  });

  return {
    categories,
    styles,
    seasons,
    occasions,
    isLoading:
      isLoadingCategories ||
      isLoadingStyles ||
      isLoadingSeasons ||
      isLoadingOccasions,
    error: categoriesError || stylesError || seasonsError || occasionsError,
  };
}
