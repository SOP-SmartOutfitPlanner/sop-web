import { useInfiniteQuery, useMutation, useQueryClient, InfiniteData } from "@tanstack/react-query";
import { communityAPI, CommunityPost, FeedResponse } from "@/lib/api/community-api";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

// Helper function to build full image URLs
// API now returns full URLs from MinIO (https://storage.wizlab.io.vn/sop/...)
// or old format from uploads folder (filename only)
const buildImageUrl = (imageUrl: string): string => {
  // If already a full URL, return as-is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  // Otherwise, assume it's a filename from old uploads folder
  const imageBaseUrl = "https://sop.wizlab.io.vn/uploads";
  return `${imageBaseUrl}/${imageUrl}`;
};

// Transform API post to include full image URLs
const transformPost = (post: CommunityPost): CommunityPost => ({
  ...post,
  images: post.images.map(buildImageUrl),
});

/**
 * Hook for infinite scroll feed with React Query
 * Fetches all posts with pagination (not personalized feed)
 */
export function useFeed(pageSize: number = 10) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Infinite query for all posts
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
    queryKey: ["posts", "all"],
    queryFn: async ({ pageParam = 1 }) => {
      return await communityAPI.getAllPosts(pageParam as number, pageSize);
    },
    getNextPageParam: (lastPage) => {
      // Return next page number if hasNext is true
      if (lastPage.metaData.hasNext) {
        return lastPage.metaData.currentPage + 1;
      }
      return undefined; // No more pages
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Flatten all pages into single array of posts
  const allPosts: CommunityPost[] = data?.pages.flatMap((page) => page.data) ?? [];

  // Deduplicate posts by ID (prevent duplicate keys error)
  const uniquePosts: CommunityPost[] = Array.from(
    new Map(allPosts.map((post) => [post.id, post])).values()
  );

  // Transform posts to include full image URLs
  const posts: CommunityPost[] = uniquePosts.map(transformPost);

  // Metadata from the latest page
  const metadata = data?.pages[data.pages.length - 1]?.metaData;

  // Like post mutation
  const likeMutation = useMutation({
    mutationFn: async ({ postId, userId }: { postId: number; userId: number }) => {
      await communityAPI.likePost(postId, userId);
    },
    onMutate: async ({ postId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["posts", "all"] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(["posts", "all"]);

      // Optimistically update
      queryClient.setQueryData<InfiniteData<FeedResponse>>(
        ["posts", "all"],
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
        queryClient.setQueryData(["posts", "all"], context.previousData);
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
      await queryClient.cancelQueries({ queryKey: ["posts", "all"] });
      const previousData = queryClient.getQueryData(["posts", "all"]);

      queryClient.setQueryData<InfiniteData<FeedResponse>>(
        ["posts", "all"],
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
        queryClient.setQueryData(["posts", "all"], context.previousData);
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
      // Invalidate and refetch all posts
      queryClient.invalidateQueries({ queryKey: ["posts", "all"] });
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
      queryClient.invalidateQueries({ queryKey: ["posts", "all"] });
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
