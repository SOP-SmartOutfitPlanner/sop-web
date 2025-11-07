import { useEffect, useState } from "react";

/**
 * Debounce hook - Delays updating value until user stops typing
 * 
 * @example
 * const [searchQuery, setSearchQuery] = useState("");
 * const debouncedSearch = useDebounce(searchQuery, 300);
 * 
 * // Use debouncedSearch for API calls/filtering
 * useEffect(() => {
 *   // Only runs 300ms after user stops typing
 *   performSearch(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up timeout to update debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancel timeout if value changes before delay expires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
