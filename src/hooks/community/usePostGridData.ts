import { useState, useEffect, useCallback } from "react";
import { communityAPI } from "@/lib/api/community-api";
import { apiPostToPost, Post } from "@/types/community";
import { toast } from "sonner";
import { useInfiniteScroll } from "@/hooks/common/useInfiniteScroll";
import { useAuthStore } from "@/store/auth-store";

interface UsePostGridDataProps {
  userId: string;
  pageSize?: number;
}

/**
 * Custom hook for post grid data management
 * Handles fetching posts, likes, and infinite scroll
 */
export function usePostGridData({ userId, pageSize = 12 }: UsePostGridDataProps) {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Fetch posts handler
  const fetchPosts = useCallback(
    async (page: number) => {
      try {
        setIsLoading(true);

        const response = await communityAPI.getPostsByUser(
          parseInt(userId, 10),
          page,
          pageSize
        );

        const transformedPosts = response.data.map(apiPostToPost);

        if (page === 1) {
          setPosts(transformedPosts);
        } else {
          setPosts((prev) => [...prev, ...transformedPosts]);
        }

        setHasMore(response.metaData.hasNext);
        setCurrentPage(page);
      } catch (error) {
        console.error("Error fetching user posts:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Không thể tải bài viết";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, pageSize]
  );

  // Infinite scroll hook
  const { observerTarget } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: fetchPosts,
  });

  // Initial fetch
  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  // Handle like
  const handleLikePost = useCallback(
    async (postId: string) => {
      try {
        if (!user?.id) {
          toast.error("Vui lòng đăng nhập");
          return;
        }

        const numericPostId = parseInt(postId, 10);
        const numericUserId = parseInt(user.id.toString(), 10);

        // Optimistic update
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  isLiked: !p.isLiked,
                  likes: p.isLiked ? p.likes - 1 : p.likes + 1,
                }
              : p
          )
        );

        // Update selected post
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost({
            ...selectedPost,
            isLiked: !selectedPost.isLiked,
            likes: selectedPost.isLiked
              ? selectedPost.likes - 1
              : selectedPost.likes + 1,
          });
        }

        // API call
        await communityAPI.toggleLikePost(numericPostId, numericUserId);
      } catch (error) {
        console.error("Error liking post:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Không thể like bài viết";
        toast.error(errorMessage);

        // Rollback optimistic update
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  isLiked: !p.isLiked,
                  likes: p.isLiked ? p.likes + 1 : p.likes - 1,
                }
              : p
          )
        );
      }
    },
    [user?.id, selectedPost]
  );

  return {
    posts,
    isLoading,
    hasMore,
    currentPage,
    selectedPost,
    setSelectedPost,
    observerTarget,
    handleLikePost,
  };
}

