import { useRef, useEffect, useCallback } from "react";

interface UseInfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: (page: number) => Promise<void>;
  threshold?: number;
  rootMargin?: string;
}

/**
 * Custom hook for infinite scroll using IntersectionObserver
 * Reusable across PostGrid, UserProfilePosts, etc.
 */
export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 0.1,
  rootMargin = "100px",
}: UseInfiniteScrollProps) {
  const observerTarget = useRef<HTMLDivElement>(null);
  const currentPageRef = useRef(1);

  // Reset page when data changes significantly
  const resetPage = useCallback(() => {
    currentPageRef.current = 1;
  }, []);

  // Load more handler
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    currentPageRef.current += 1;
    try {
      await onLoadMore(currentPageRef.current);
    } catch (error) {
      currentPageRef.current -= 1;
      throw error;
    }
  }, [isLoading, hasMore, onLoadMore]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, loadMore, threshold, rootMargin]);

  return {
    observerTarget,
    resetPage,
    currentPage: currentPageRef.current,
  };
}

