"use client";

import { motion } from "framer-motion";
import { Loader2, ImageOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { EnhancedPostCard } from "@/components/community/post/EnhancedPostCard";
import { PostSkeleton } from "@/components/community/feed/PostSkeleton";
import { useAuthStore } from "@/store/auth-store";
import { useUserPosts } from "@/hooks/community/useUserPosts";
import { communityAPI, Hashtag } from "@/lib/api/community-api";
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
  const router = useRouter();

  // Data management hook
  const {
    posts,
    isInitialLoading,
    isFetching,
    hasMore,
    observerTarget,
    handleLike,
    refetch,
  } = useUserPosts(userId, user?.id);

  const handleReportPost = async (postId: string, reason: string) => {
    if (!user?.id) {
      const message = "Please log in to report posts";
      toast.error(message);
      throw new Error(message);
    }

    const parsedPostId = Number.parseInt(postId, 10);

    if (Number.isNaN(parsedPostId)) {
      const message = "Invalid post ID";
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

      toast.success("Thank you for reporting", {
        description: response?.message,
      });
    } catch (error) {
      console.error("Error reporting post:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unable to send report";
      toast.error(errorMessage);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!user?.id) {
      toast.error("Please log in");
      return;
    }

    try {
      await communityAPI.deletePost(postId);
      toast.success("Post has been deleted");
      
      // Refetch posts to update the list
      await refetch();
    } catch (error) {
      console.error("Error deleting post:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unable to delete post";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleTagClick = (tag: Hashtag) => {
    // Navigate to community page with tag filter
    router.push(`/community?hashtag=${tag.id}`);
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
          {userName} has not shared any posts yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bricolage font-bold">Posts</h2>

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
              onDeletePost={handleDeletePost}
              onEditPost={(post) => {
                // TODO: Open edit dialog with post data
              }}
              onTagClick={handleTagClick}
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
          All posts have been displayed
        </div>
      )}
    </div>
  );
}
