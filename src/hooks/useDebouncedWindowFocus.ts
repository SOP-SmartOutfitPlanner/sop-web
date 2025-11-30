import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UseDebouncedWindowFocusOptions {
  queryKey: string[];
  enabled?: boolean;
  debounceMs?: number;
  showNotification?: boolean;
  notificationMessage?: string;
}

/**
 * Hook to invalidate queries when window regains focus (debounced)
 * Useful when user opens wardrobe/outfit in new tab and returns to post creation
 * 
 * @param queryKey - React Query key to invalidate
 * @param enabled - Whether the hook is active (default: true)
 * @param debounceMs - Debounce delay in milliseconds (default: 500)
 * @param showNotification - Whether to show toast notification with count (default: false)
 * @param notificationMessage - Base message for notification (count will be appended)
 */
export function useDebouncedWindowFocus({
  queryKey,
  enabled = true,
  debounceMs = 500,
  showNotification = false,
  notificationMessage = "Updated",
}: UseDebouncedWindowFocusOptions) {
  const queryClient = useQueryClient();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousCountRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleFocus = () => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new debounced timeout
      timeoutRef.current = setTimeout(() => {
        // Check if query is stale before invalidating
        const queryState = queryClient.getQueryState(queryKey);
        
        if (queryState?.isInvalidated || !queryState) {
          // Already invalidated or doesn't exist, just invalidate
          queryClient.invalidateQueries({ queryKey });
          return;
        }

        // Get current count before invalidation
        const currentData = queryClient.getQueryData(queryKey);
        let oldCount = 0;

        if (currentData) {
          // Handle both array and paginated response formats
          if (Array.isArray(currentData)) {
            oldCount = currentData.length;
          } else if (
            typeof currentData === "object" &&
            "data" in currentData &&
            Array.isArray(currentData.data)
          ) {
            oldCount = currentData.data.length;
          } else if (
            typeof currentData === "object" &&
            "metaData" in currentData &&
            currentData.metaData &&
            typeof currentData.metaData === "object" &&
            "totalCount" in currentData.metaData
          ) {
            oldCount = (currentData.metaData as { totalCount?: number }).totalCount || 0;
          }
        }

        // Store old count for comparison after refetch
        if (showNotification) {
          previousCountRef.current = oldCount;
        }

        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey }).then(() => {
          if (showNotification && notificationMessage) {
            // Get new count after refetch
            const newData = queryClient.getQueryData(queryKey);
            let newCount = 0;

            if (newData) {
              if (Array.isArray(newData)) {
                newCount = newData.length;
              } else if (
                typeof newData === "object" &&
                "data" in newData &&
                Array.isArray(newData.data)
              ) {
                newCount = newData.data.length;
              } else if (
                typeof newData === "object" &&
                "metaData" in newData &&
                newData.metaData &&
                typeof newData.metaData === "object" &&
                "totalCount" in newData.metaData
              ) {
                newCount = (newData.metaData as { totalCount?: number }).totalCount || 0;
              }
            }

            // Show notification if count changed
            const diff = newCount - (previousCountRef.current || 0);
            if (diff > 0) {
              toast.success(`${notificationMessage} (${diff} new)`);
            } else if (diff < 0) {
              toast.info(`${notificationMessage} (${Math.abs(diff)} removed)`);
            }
          }
        });
      }, debounceMs);
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [queryKey, enabled, debounceMs, showNotification, notificationMessage, queryClient]);
}
