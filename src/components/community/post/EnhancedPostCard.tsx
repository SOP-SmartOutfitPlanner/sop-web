"use client";

import { Post, CommunityUser } from "@/types/community";
import { UserMini } from "@/types/chat";
import { QuickChatModal } from "@/components/chat/QuickChatModal";
import { PostModal } from "@/components/community/profile/PostModal";
import { useAuthStore } from "@/store/auth-store";
import { usePostInteractions } from "@/hooks/post/usePostInteractions";
import { usePostAuthor } from "@/hooks/post/usePostAuthor";
import { PostCardContainer } from "./PostCardContainer";
import { useState } from "react";

interface EnhancedPostCardProps {
  post: Post;
  currentUser: CommunityUser;
  onLike: () => void;
  onReport: (reason: string) => void;
  onRequestStylist?: (post: Post) => void;
  showChallengeEntry?: boolean;
  onFollow?: (userId: string) => void;
  isFollowing?: boolean;
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
  onFollow,
  isFollowing = false,
  onPostDeleted,
  onDeletePost,
  onEditPost,
}: EnhancedPostCardProps) {
  const { user } = useAuthStore();
  const [selectedStylist, setSelectedStylist] = useState<UserMini | null>(null);

  // Check if this is the current user's own post
  const isOwnPost = user?.id?.toString() === post.userId;

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
        onFollow={onFollow ? () => onFollow(post.userId) : undefined}
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
