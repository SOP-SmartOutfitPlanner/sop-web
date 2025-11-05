import { useInfiniteQuery, useMutation, useQueryClient, InfiniteData } from "@tanstack/react-query";
import { communityAPI, CommunityPost, FeedResponse } from "@/lib/api/community-api";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

/**
 * Hook for infinite scroll feed with React Query
 * Similar to TikTok, Instagram, Facebook feeds
 */
export function useFeed(pageSize: number = 10) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Infinite query for feed
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
    queryKey: ["feed", user?.id],
    queryFn: async ({ pageParam = 1 }) => {
      if (!user) {
        throw new Error("User not authenticated");
      }
      const userId = parseInt(user.id);
      return await communityAPI.getFeed(userId, pageParam as number, pageSize);
    },
    getNextPageParam: (lastPage) => {
      // Return next page number if hasNext is true
      if (lastPage.metaData.hasNext) {
        return lastPage.metaData.currentPage + 1;
      }
      return undefined; // No more pages
    },
    initialPageParam: 1,
    enabled: !!user, // Only run query if user is authenticated
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (previously cacheTime)
  });

  // Flatten all pages into single array of posts
  const posts: CommunityPost[] = data?.pages.flatMap((page) => page.data) ?? [];

  // Metadata from the latest page
  const metadata = data?.pages[data.pages.length - 1]?.metaData;

  // Like post mutation
  const likeMutation = useMutation({
    mutationFn: async ({ postId, userId }: { postId: number; userId: number }) => {
      await communityAPI.likePost(postId, userId);
    },
    onMutate: async ({ postId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["feed", user?.id] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(["feed", user?.id]);

      // Optimistically update
      queryClient.setQueryData<InfiniteData<FeedResponse>>(
        ["feed", user?.id],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page: FeedResponse) => ({
              ...page,
              data: page.data.map((post: CommunityPost) =>
                post.id === postId
                  ? { ...post, likeCount: post.likeCount + 1, isLikedByUser: true }
                  : post
              ),
            })),
          };
        }
      );

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(["feed", user?.id], context.previousData);
      }
      toast.error("Failed to like post");
    },
    onSuccess: () => {
      toast.success("Post liked!");
    },
  });

  // Unlike post mutation
  const unlikeMutation = useMutation({
    mutationFn: async ({ postId, userId }: { postId: number; userId: number }) => {
      await communityAPI.unlikePost(postId, userId);
    },
    onMutate: async ({ postId }) => {
      await queryClient.cancelQueries({ queryKey: ["feed", user?.id] });
      const previousData = queryClient.getQueryData(["feed", user?.id]);

      queryClient.setQueryData<InfiniteData<FeedResponse>>(
        ["feed", user?.id],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page: FeedResponse) => ({
              ...page,
              data: page.data.map((post: CommunityPost) =>
                post.id === postId
                  ? { ...post, likeCount: post.likeCount - 1, isLikedByUser: false }
                  : post
              ),
            })),
          };
        }
      );

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["feed", user?.id], context.previousData);
      }
      toast.error("Failed to unlike post");
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: {
      userId: number;
      body: string;
      hashtags: string[];
      imageUrls: string[];
    }) => {
      return await communityAPI.createPost(postData);
    },
    onSuccess: () => {
      // Invalidate and refetch feed
      queryClient.invalidateQueries({ queryKey: ["feed", user?.id] });
      toast.success("Post created successfully!");
    },
    onError: () => {
      toast.error("Failed to create post");
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      await communityAPI.deletePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed", user?.id] });
      toast.success("Post deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete post");
    },
  });

  // Report post mutation
  const reportPostMutation = useMutation({
    mutationFn: async ({
      postId,
      userId,
      reason,
    }: {
      postId: number;
      userId: number;
      reason: string;
    }) => {
      await communityAPI.reportPost(postId, userId, reason);
    },
    onSuccess: () => {
      toast.success("Post reported", {
        description: "Thank you for reporting. We'll review this content.",
      });
    },
    onError: () => {
      toast.error("Failed to report post");
    },
  });

  // Helper function to toggle like
  const toggleLike = (postId: number) => {
    if (!user) return;
    
    const userId = parseInt(user.id);
    const post = posts.find((p) => p.id === postId);
    
    if (post?.isLikedByUser) {
      unlikeMutation.mutate({ postId, userId });
    } else {
      likeMutation.mutate({ postId, userId });
    }
  };

  return {
    // Data
    posts,
    metadata,
    
    // Loading states
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    
    // Actions
    fetchNextPage,
    refetch,
    toggleLike,
    createPost: createPostMutation.mutate,
    deletePost: deletePostMutation.mutate,
    reportPost: reportPostMutation.mutate,
    
    // Mutation states
    isCreatingPost: createPostMutation.isPending,
    isDeletingPost: deletePostMutation.isPending,
    isReportingPost: reportPostMutation.isPending,
  };
}
