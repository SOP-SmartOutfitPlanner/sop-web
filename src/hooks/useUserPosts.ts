import { useInfiniteQuery, useMutation, useQueryClient, InfiniteData } from "@tanstack/react-query";
import { communityAPI, CommunityPost, FeedResponse } from "@/lib/api/community-api";
import { toast } from "sonner";
import { useMemo } from "react";

interface UseUserPostsOptions {
  userId: number;
  pageSize?: number;
}

/**
 * Unified hook for fetching user posts with React Query
 * 
 * Replaces duplicate logic in:
 * - UserProfilePosts.tsx
 * - PostGrid.tsx
 * 
 * Benefits:
 * - ✅ React Query caching - Instant navigation
 * - ✅ Optimistic updates - Smooth UX
 * - ✅ Auto refetch - Fresh data
 * - ✅ No duplicate code - Single source of truth
 * 
 * @example
 * const { posts, isLoading, fetchNextPage, toggleLike } = useUserPosts({
 *   userId: 123,
 *   pageSize: 10
 * });
 */
export function useUserPosts({ userId, pageSize = 10 }: UseUserPostsOptions) {
  const queryClient = useQueryClient();

  // Infinite query for user posts
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery<FeedResponse, Error>({
    queryKey: ["posts", "user", userId],
    queryFn: async ({ pageParam = 1 }) => {
      // Fetch user posts (currentUserId optional for isLiked status)
      return await communityAPI.getPostsByUser(
        userId,
        pageParam as number,
        pageSize
      );
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.metaData) {
        console.error("Invalid lastPage structure:", lastPage);
        return undefined;
      }

      // Return next page number if hasNext is true
      return lastPage.metaData.hasNext
        ? lastPage.metaData.currentPage + 1
        : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh
    gcTime: 1000 * 60 * 10, // 10 minutes - keep in cache
  });

  // Memoized posts array - only recompute when data changes
  const posts = useMemo(() => {
    if (!data?.pages) return [];

    // Flatten all pages
    const allPosts = data.pages.flatMap((page) => page.data);

    // Deduplicate by ID to prevent duplicate keys
    const uniquePosts = Array.from(
      new Map(allPosts.map((post) => [post.id, post])).values()
    );

    return uniquePosts;
  }, [data?.pages]);

  // Metadata from the latest page
  const metadata = data?.pages[data.pages.length - 1]?.metaData;

  // Toggle like/unlike post mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async ({
      postId,
      userId,
    }: {
      postId: number;
      userId: number;
    }) => {
      return await communityAPI.toggleLikePost(postId, userId);
    },
    onMutate: async ({ postId }) => {
      const queryKey = ["posts", "user", userId];

      // Cancel outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value for rollback
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update cache
      queryClient.setQueryData<InfiniteData<FeedResponse>>(queryKey, (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: FeedResponse) => ({
            ...page,
            data: page.data.map((post: CommunityPost) => {
              if (post.id === postId) {
                const isLiked = post.isLiked;
                return {
                  ...post,
                  likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1,
                  isLiked: !isLiked,
                };
              }
              return post;
            }),
          })),
        };
      });

      return { previousData, queryKey };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      toast.error("Failed to update like");
    },
    onSuccess: () => {
      // Optional: Show success toast
      // toast.success("Post liked!");
    },
    onSettled: () => {
      // Invalidate to ensure data is in sync with server
      queryClient.invalidateQueries({
        queryKey: ["posts", "user", userId],
      });
    },
  });

  return {
    // Data
    posts,
    metadata,

    // Loading states
    isLoading,
    isError,
    error,

    // Pagination
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,

    // Actions
    refetch,
    toggleLike: toggleLikeMutation.mutate,
    isTogglingLike: toggleLikeMutation.isPending,
  };
}
