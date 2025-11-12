"use client";

import { motion } from "framer-motion";
import { Loader2, ImageOff } from "lucide-react";
import { EnhancedPostCard } from "@/components/community/post/EnhancedPostCard";
import { PostSkeleton } from "@/components/community/feed/PostSkeleton";
import { useAuthStore } from "@/store/auth-store";
import { useUserPosts } from "@/hooks/community/useUserPosts";
import { communityAPI } from "@/lib/api/community-api";
import { toast } from "sonner";

interface UserProfilePostsProps {
  userId: string;
  userName: string;
}

/**
 * ✅ OPTIMIZED: User Profile Posts Feed
 * - Uses useUserPosts hook for data management
 * - Reduced from ~200 lines to ~80 lines
 * - Clean and simple rendering logic
 */
export function UserProfilePosts({ userId, userName }: UserProfilePostsProps) {
  const { user } = useAuthStore();

  // Data management hook
  const {
    posts,
    isInitialLoading,
    isFetching,
    hasMore,
    observerTarget,
    handleLike,
  } = useUserPosts(userId);

  const handleReportPost = async (postId: string, reason: string) => {
    if (!user?.id) {
      const message = "Vui lòng đăng nhập";
      toast.error(message);
      throw new Error(message);
    }

    const parsedPostId = Number.parseInt(postId, 10);

    if (Number.isNaN(parsedPostId)) {
      const message = "ID bài viết không hợp lệ";
      toast.error(message);
      throw new Error(message);
    }

    try {
      const response = await communityAPI.createReport({
        postId: parsedPostId,
        userId: Number.parseInt(user.id, 10),
        type: "POST",
        description: reason,
      });

      toast.success("Cảm ơn bạn đã báo cáo", {
        description: response?.message,
      });
    } catch (error) {
      console.error("Error reporting post:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Không thể gửi báo cáo";
      toast.error(errorMessage);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  };

  // Loading state
  if (isInitialLoading && posts.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bricolage font-bold">Bài viết</h2>
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  // Empty state
  if (!isInitialLoading && posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
          <ImageOff className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
        <p className="text-muted-foreground">
          {userName} chưa chia sẻ bài viết nào
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bricolage font-bold">Bài viết</h2>

      {/* Posts Feed */}
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
              onLike={() => handleLike(parseInt(post.id))}
              onReport={(reason) => handleReportPost(post.id, reason)}
              onEditPost={(post) => {
                console.log("Edit post:", post);
                // TODO: Open edit dialog with post data
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Loading More */}
      {isFetching && posts.length > 0 && (
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
