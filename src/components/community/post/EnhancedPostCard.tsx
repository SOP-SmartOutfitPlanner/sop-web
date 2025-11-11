"use client";

import { Post, CommunityUser } from "@/types/community";
import { UserMini } from "@/types/chat";
import { QuickChatModal } from "@/components/chat/QuickChatModal";
import { PostModal } from "@/components/community/profile/PostModal";
import { useAuthStore } from "@/store/auth-store";
import { usePostInteractions } from "@/hooks/post/usePostInteractions";
import { usePostAuthor } from "@/hooks/post/usePostAuthor";
import { PostCardContainer } from "./PostCardContainer";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface EnhancedPostCardProps {
  post: Post;
  currentUser: CommunityUser;
  onLike: () => void;
  onReport: (reason: string) => void;
  onRequestStylist?: (post: Post) => void;
  showChallengeEntry?: boolean;
  onPostDeleted?: (postId: string) => void;
  onDeletePost?: (postId: number) => Promise<void>;
  onEditPost?: (post: Post) => void;
}

/**
 * ✅ OPTIMIZED Enhanced Post Card
 * - Extracted interactions logic to custom hook
 * - Extracted author logic to custom hook
 * - Separated UI into PostCardContainer
 * - Better separation of concerns
 * - ~190 → ~130 lines
 */
export function EnhancedPostCard({
  post,
  currentUser,
  onLike,
  onReport,
  showChallengeEntry,
  onPostDeleted,
  onDeletePost,
  onEditPost,
}: EnhancedPostCardProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedStylist, setSelectedStylist] = useState<UserMini | null>(null);
  
  // Sync with post.isFollowing from parent (React Query data)
  // This ensures data consistency after cache invalidation
  const [isFollowing, setIsFollowing] = useState(post.isFollowing ?? false);
  
  // Update local state when post.isFollowing changes from parent
  useEffect(() => {
    setIsFollowing(post.isFollowing ?? false);
  }, [post.id, post.isFollowing]);

  // Check if this is the current user's own post
  const isOwnPost = user?.id?.toString() === post.userId;

  // Listen for follow status changes from other components (TopContributors, etc.)
  useEffect(() => {
    const handleFollowStatusChange = (event: Event) => {
      const customEvent = event as CustomEvent<{
        userId: number;
        isFollowing: boolean;
      }>;
      const { userId, isFollowing: newFollowStatus } = customEvent.detail;

      // Update if this post's author was followed/unfollowed
      if (userId === parseInt(post.userId)) {
        setIsFollowing(newFollowStatus);
      }
    };

    window.addEventListener("followStatusChanged", handleFollowStatusChange);

    return () => {
      window.removeEventListener(
        "followStatusChanged",
        handleFollowStatusChange
      );
    };
  }, [post.userId]);

  // Post interactions hook
  const {
    isCommentModalOpen,
    isChatModalOpen,
    setIsCommentModalOpen,
    setIsChatModalOpen,
    handleLike,
    handleDoubleClick,
    handleImageClick,
    handleOpenComments,
    handleDelete,
    handleReport,
  } = usePostInteractions({
    post,
    isOwnPost,
    onLike,
    onReport,
    onDelete: isOwnPost && onDeletePost
      ? async () => {
          await onDeletePost(parseInt(post.id, 10));
          onPostDeleted?.(post.id);
        }
      : undefined,
  });

  // Post author hook
  const { isAuthorStylist, handleMessageAuthor, authorInfo } = usePostAuthor({
    post,
    currentUser,
    onStylistChat: (stylist) => {
      setSelectedStylist(stylist);
      setIsChatModalOpen(true);
    },
  });

  // Handle follow/unfollow
  const handleFollow = async () => {
    if (!user?.id) {
      return;
    }

    try {
      const { communityAPI } = await import("@/lib/api/community-api");
      await communityAPI.toggleFollow(
        parseInt(user.id),
        parseInt(post.userId)
      );

      setIsFollowing(!isFollowing);

      // Trigger global event to sync follow state across components
      window.dispatchEvent(
        new CustomEvent("followStatusChanged", {
          detail: {
            userId: parseInt(post.userId),
            isFollowing: !isFollowing,
          },
        })
      );

      // Invalidate React Query cache to refetch posts with updated isFollowing
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  // Image array
  const images =
    post.images?.length > 0 ? post.images : post.image ? [post.image] : [];

  return (
    <>
      <PostCardContainer
        post={post}
        images={images}
        isOwnPost={isOwnPost}
        isAuthorStylist={isAuthorStylist}
        showChallengeEntry={showChallengeEntry}
        isFollowing={isFollowing}
        onDoubleClick={handleDoubleClick}
        onImageClick={handleImageClick}
        onLike={handleLike}
        onComment={handleOpenComments}
        onReport={handleReport}
        onMessageAuthor={handleMessageAuthor}
        onFollow={handleFollow}
        onDelete={isOwnPost ? handleDelete : undefined}
        onEdit={isOwnPost && onEditPost ? () => onEditPost(post) : undefined}
        authorInfo={authorInfo}
      />

      {/* Chat Modal */}
      {selectedStylist && (
        <QuickChatModal
          isOpen={isChatModalOpen}
          onClose={() => {
            setIsChatModalOpen(false);
            setSelectedStylist(null);
          }}
          stylist={selectedStylist}
        />
      )}

      {/* Comment Modal */}
      {isCommentModalOpen && (
        <PostModal
          post={post}
          isOpen={isCommentModalOpen}
          onClose={() => setIsCommentModalOpen(false)}
          onLike={onLike}
        />
      )}
    </>
  );
}
