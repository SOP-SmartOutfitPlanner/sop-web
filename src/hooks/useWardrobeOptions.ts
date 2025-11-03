"use client";

import { useQuery } from "@tanstack/react-query";
import { wardrobeAPI } from "@/lib/api/wardrobe-api";

/**
 * Hook to fetch all wardrobe options (styles, seasons, occasions)
 * Used in Add Item wizard to populate selection options
 */
export function useWardrobeOptions() {
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
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    retry: 2,
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
    staleTime: 1000 * 60 * 30,
    retry: 2,
  });

  return {
    styles,
    seasons,
    occasions,
    isLoading: isLoadingStyles || isLoadingSeasons || isLoadingOccasions,
    error: stylesError || seasonsError || occasionsError,
  };
}
