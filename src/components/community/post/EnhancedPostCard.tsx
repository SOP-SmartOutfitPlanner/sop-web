"use client";

import { Post, CommunityUser } from "@/types/community";
import { Hashtag } from "@/lib/api/community-api";
import type { PostLiker } from "@/lib/api/community-api";
import { UserMini } from "@/types/chat";
import { QuickChatModal } from "@/components/chat/QuickChatModal";
import { PostModal } from "@/components/community/profile/PostModal";
import { useAuthStore } from "@/store/auth-store";
import { usePostInteractions } from "@/hooks/post/usePostInteractions";
import { usePostAuthor } from "@/hooks/post/usePostAuthor";
import { PostCardContainer } from "./PostCardContainer";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface EnhancedPostCardProps {
  post: Post;
  currentUser: CommunityUser;
  onLike: () => void;
  onReport: (reason: string) => Promise<void>;
  onRequestStylist?: (post: Post) => void;
  showChallengeEntry?: boolean;
  onPostDeleted?: (postId: string) => void;
  onDeletePost?: (postId: number) => Promise<void>;
  onEditPost?: (post: Post) => void;
  onTagClick?: (tag: Hashtag) => void;
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
  onTagClick,
}: EnhancedPostCardProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedStylist, setSelectedStylist] = useState<UserMini | null>(null);
  const [isLikersDialogOpen, setIsLikersDialogOpen] = useState(false);
  const [likers, setLikers] = useState<PostLiker[]>([]);
  const [isLoadingLikers, setIsLoadingLikers] = useState(false);

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
    onDelete:
      isOwnPost && onDeletePost
        ? async () => {
            const postId = parseInt(post.id, 10);
            try {
              await onDeletePost(postId);
              onPostDeleted?.(post.id);
            } catch (error) {
              console.error("Error in onDelete:", error);
              throw error;
            }
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
      await communityAPI.toggleFollow(parseInt(user.id), parseInt(post.userId));

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

  const handleViewLikes = async () => {
    setIsLikersDialogOpen(true);
    setIsLoadingLikers(true);

    try {
      const { communityAPI } = await import("@/lib/api/community-api");
      const response = await communityAPI.getPostLikers(parseInt(post.id, 10));
      setLikers(response.data ?? []);
    } catch (error) {
      console.error("Error fetching post likers:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách lượt thích";
      toast.error(message);
    } finally {
      setIsLoadingLikers(false);
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
        onTagClick={onTagClick}
        onViewLikes={post.likes > 0 ? handleViewLikes : undefined}
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

      <Dialog
        open={isLikersDialogOpen}
        onOpenChange={(open) => {
          setIsLikersDialogOpen(open);
          if (!open) {
            setIsLoadingLikers(false);
          }
        }}
      >
        <DialogContent showCloseButton={false} className="max-w-sm sm:max-w-md backdrop-blur-xl bg-gradient-to-br from-cyan-950/70 via-blue-950/60 to-indigo-950/60 border border-cyan-400/20">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">
              {post.likes} {post.likes === 1 ? "Like" : "Likes"}
            </DialogTitle>
            <DialogDescription className="text-sm text-blue-100/80">
              People who liked this post
            </DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            <button className="absolute right-3 top-3 text-white hover:text-primary transition">
              <X className="h-5 w-5" />
            </button>
          </DialogClose>
          <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
            {isLoadingLikers ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-300" />
              </div>
            ) : likers.length === 0 ? (
              <p className="text-sm text-blue-100/70 text-center py-4">
                No one has liked this post yet.
              </p>
            ) : (
              likers.map((liker) => (
                <Link
                  key={`${liker.userId}-${post.id}`}
                  href={`/community/profile/${liker.userId}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-cyan-400/10 bg-white/5 px-3 py-2.5 shadow-inner shadow-cyan-500/5 transition hover:border-cyan-400/30 hover:bg-white/10"
                  onClick={() => setIsLikersDialogOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      {liker.avatarUrl ? (
                        <AvatarImage
                          src={liker.avatarUrl}
                          alt={liker.displayName}
                        />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white font-semibold">
                          {liker.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">
                        {liker.displayName}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
