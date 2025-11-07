"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, ImageOff } from "lucide-react";
import { EnhancedPostCard } from "@/components/community/post/EnhancedPostCard";
import { PostSkeleton } from "@/components/community/feed/PostSkeleton";
import { communityAPI } from "@/lib/api/community-api";
import { apiPostToPost, Post } from "@/types/community";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

interface UserProfilePostsProps {
  userId: string;
  userName: string;
}

/**
 * User Profile Posts - Show all posts from this user
 * Similar to Facebook profile posts section
 */
export function UserProfilePosts({ userId, userName }: UserProfilePostsProps) {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch user posts
  const fetchUserPosts = useCallback(async (pageNum: number) => {
    try {
      setIsLoading(true);
      
      // Use dedicated API endpoint to get posts by user
      const response = await communityAPI.getPostsByUser(
        parseInt(userId, 10),
        pageNum,
        10
      );

      const transformedPosts = response.data.map(apiPostToPost);

      if (pageNum === 1) {
        setPosts(transformedPosts);
      } else {
        setPosts((prev) => [...prev, ...transformedPosts]);
      }

      setHasMore(response.metaData.hasNext);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      toast.error("Không thể tải bài viết");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    fetchUserPosts(1);
  }, [fetchUserPosts]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setPage((prev) => prev + 1);
          fetchUserPosts(page + 1);
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
  }, [hasMore, isLoading, page, fetchUserPosts]);

  const handleLike = async (postId: string) => {
    try {
      if (!user?.id) {
        toast.error("Vui lòng đăng nhập");
        return;
      }

      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      const isCurrentlyLiked = post.isLiked;
      const numericPostId = parseInt(postId, 10);
      const numericUserId = parseInt(user.id.toString(), 10);

      // Toggle like
      await communityAPI.toggleLikePost(numericPostId, numericUserId);

      // Update local state
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLiked: !isCurrentlyLiked,
                likes: isCurrentlyLiked ? p.likes - 1 : p.likes + 1,
              }
            : p
        )
      );
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Không thể thực hiện hành động");
    }
  };

  const handleReport = (reason: string) => {
    toast.success(`Đã báo cáo với lý do: ${reason}`);
  };

  if (isLoading && page === 1) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bricolage font-bold">Bài viết</h2>
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  if (!isLoading && posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
          <ImageOff className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Chưa có bài viết nào</h3>
        <p className="text-muted-foreground">
          {userName} chưa chia sẻ bài viết nào
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bricolage font-bold">Bài viết</h2>

      {/* Posts Grid */}
      <div className="space-y-6">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <EnhancedPostCard
              post={post}
              currentUser={{
                id: user?.id?.toString() || "",
                name: user?.displayName || "Unknown",
                avatar: user?.avatar,
              }}
              onLike={() => handleLike(post.id)}
              onReport={handleReport}
            />
          </motion.div>
        ))}
      </div>

      {/* Loading More */}
      {isLoading && page > 1 && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {hasMore && <div ref={observerTarget} className="h-20" />}

      {/* End Message */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Đã hiển thị tất cả bài viết
        </div>
      )}
    </div>
  );
}
