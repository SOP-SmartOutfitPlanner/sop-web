import { useState, useEffect, useRef, useCallback } from "react";
import { communityAPI, CommunityPost } from "@/lib/api/community-api";
import { apiPostToPost, Post } from "@/types/community";
import { toast } from "sonner";

export function useUserPosts(userId: string, currentUserId?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  const pageSize = 10;

  // Fetch first page
  useEffect(() => {
    const fetchInitialPosts = async () => {
      try {
        setIsInitialLoading(true);
        const numericUserId = parseInt(userId, 10);

        const postsResponse = await communityAPI.getPostsByUser(
          numericUserId,
          1,
          pageSize
        );

        const mappedPosts = postsResponse.data.map((post: CommunityPost) =>
          apiPostToPost(post)
        );

        setPosts(mappedPosts);
        setHasMore(postsResponse.metaData.hasNext);
        setCurrentPage(1);
      } catch (error) {
        console.error("Error fetching posts:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Không thể tải bài viết";
        toast.error(errorMessage);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchInitialPosts();
  }, [userId]);

  // Fetch more posts
  const fetchMorePosts = useCallback(async () => {
    if (isFetching || !hasMore) return;

    try {
      setIsFetching(true);
      const nextPage = currentPage + 1;
      const numericUserId = parseInt(userId, 10);

      const postsResponse = await communityAPI.getPostsByUser(
        numericUserId,
        nextPage,
        pageSize
      );

      const newPosts = postsResponse.data.map((post: CommunityPost) =>
        apiPostToPost(post)
      );

      setPosts((prev) => [...prev, ...newPosts]);
      setHasMore(postsResponse.metaData.hasNext);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error("Error fetching more posts:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Không thể tải bài viết";
      toast.error(errorMessage);
    } finally {
      setIsFetching(false);
    }
  }, [userId, currentPage, pageSize, isFetching, hasMore]);

  // Intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
          fetchMorePosts();
        }
      },
      { threshold: 0.1 }
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
  }, [fetchMorePosts, hasMore, isFetching]);

  // Like handler
  const handleLike = useCallback(
    async (postId: number) => {
      if (!currentUserId) {
        toast.error("Vui lòng đăng nhập");
        return;
      }

      try {
        await communityAPI.toggleLikePost(postId, parseInt(currentUserId));

        // Optimistic update
        setPosts((prev) =>
          prev.map((post) => {
            if (post.id === postId.toString()) {
              return {
                ...post,
                isLiked: !post.isLiked,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              };
            }
            return post;
          })
        );
      } catch (error) {
        console.error("Error liking post:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Không thể thực hiện thao tác";
        toast.error(errorMessage);
      }
    },
    [currentUserId]
  );

  const refetch = useCallback(async () => {
    try {
      setIsInitialLoading(true);
      const numericUserId = parseInt(userId, 10);

      const postsResponse = await communityAPI.getPostsByUser(
        numericUserId,
        1,
        pageSize
      );

      const mappedPosts = postsResponse.data.map((post: CommunityPost) =>
        apiPostToPost(post)
      );

      setPosts(mappedPosts);
      setHasMore(postsResponse.metaData.hasNext);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error refetching posts:", error);
    } finally {
      setIsInitialLoading(false);
    }
  }, [userId]);

  return {
    posts,
    isInitialLoading,
    isFetching,
    hasMore,
    observerTarget,
    handleLike,
    refetch,
  };
}
