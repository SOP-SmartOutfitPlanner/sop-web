/**
 * Advanced Search Hook using Fuse.js
 * Provides fuzzy search across wardrobe items with scoring
 */

import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { WardrobeItem } from '@/types';

interface SearchOptions {
  threshold?: number; // 0.0 = perfect match, 1.0 = match anything
  includeScore?: boolean;
  minMatchCharLength?: number;
}

interface SearchResult {
  item: WardrobeItem;
  score?: number;
}

const defaultOptions = {
  // Fields to search with different weights
  keys: [
    { name: 'name', weight: 0.4 },
    { name: 'brand', weight: 0.3 },
    { name: 'colors', weight: 0.2 },
    { name: 'tags', weight: 0.1 },
    { name: 'type', weight: 0.1 },
    { name: 'seasons', weight: 0.05 },
    { name: 'occasions', weight: 0.05 },
  ],
  // Fuzzy search settings
  threshold: 0.4, // 0.0 = perfect match, 1.0 = match anything
  location: 0,
  distance: 100,
  minMatchCharLength: 2,
  includeScore: true,
  // Search in arrays and nested objects
  ignoreLocation: true,
  useExtendedSearch: false,
};

export function useAdvancedSearch(
  items: WardrobeItem[],
  searchQuery: string,
  options: SearchOptions = {}
) {
  const fuse = useMemo(() => {
    if (!items || items.length === 0) return null;
    
    return new Fuse(items, {
      ...defaultOptions,
      ...options,
    });
  }, [items, options]);

  const results = useMemo(() => {
    if (!fuse || !searchQuery.trim()) {
      return items.map(item => ({ item, score: undefined }));
    }

    const fuseResults = fuse.search(searchQuery);
    return fuseResults.map((result): SearchResult => ({
      item: result.item,
      score: result.score,
    }));
  }, [fuse, searchQuery, items]);

  // Separate function for getting search suggestions
  const getSuggestions = useMemo(() => {
    if (!items || items.length === 0) return [];
    
    // Extract unique values for suggestions
    const suggestions = new Set<string>();
    
    items.forEach(item => {
      // Add item names
      if (item.name) suggestions.add(item.name);
      
      // Add brands
      if (item.brand) suggestions.add(item.brand);
      
      // Add colors
      if (item.colors) {
        item.colors.forEach(color => suggestions.add(color.name));
      }
      
      // Add tags
      if (item.tags) {
        item.tags.forEach(tag => suggestions.add(tag));
      }
      
      // Add type
      if (item.type) suggestions.add(item.type);
    });
    
    return Array.from(suggestions).sort();
  }, [items]);

  return {
    results,
    suggestions: getSuggestions,
    isEmpty: results.length === 0 && searchQuery.trim().length > 0,
    hasQuery: searchQuery.trim().length > 0,
  };
}

/**
 * Hook for search filtering with categories
 */
export function useCategorizedSearch(items: WardrobeItem[], searchQuery: string) {
  const { results } = useAdvancedSearch(items, searchQuery);
  
  const categorizedResults = useMemo(() => {
    const categories = {
      exactMatches: [] as SearchResult[],
      nameMatches: [] as SearchResult[],
      brandMatches: [] as SearchResult[],
      colorMatches: [] as SearchResult[],
      otherMatches: [] as SearchResult[],
    };

    if (!searchQuery.trim()) {
      categories.otherMatches = results;
      return categories;
    }

    results.forEach(result => {
      const { item, score } = result;
      const query = searchQuery.toLowerCase();
      
      // Exact match (very high score)
      if (score !== undefined && score < 0.1) {
        categories.exactMatches.push(result);
      }
      // Name matches
      else if (item.name?.toLowerCase().includes(query)) {
        categories.nameMatches.push(result);
      }
      // Brand matches  
      else if (item.brand?.toLowerCase().includes(query)) {
        categories.brandMatches.push(result);
      }
      // Color matches
      else if (item.colors?.some(color => color.name.toLowerCase().includes(query))) {
        categories.colorMatches.push(result);
      }
      // Other matches
      else {
        categories.otherMatches.push(result);
      }
    });

    return categories;
  }, [results, searchQuery]);

  return categorizedResults;
}