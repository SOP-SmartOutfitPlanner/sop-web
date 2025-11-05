import { useState, useCallback, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Post, CommunityUser } from "@/types/community";
import { UserMini } from "@/types/chat";
import { QuickChatModal } from "@/components/chat/QuickChatModal";
import CommentSection from "@/components/community/CommentSection";
import { PostHeader } from "@/components/community/PostHeader";
import { PostImage } from "@/components/community/PostImage";
import { PostContent } from "@/components/community/PostContent";
import { PostActions } from "@/components/community/PostActions";
import { CommentInput } from "@/components/community/CommentInput";
import { communityAPI } from "@/lib/api/community-api";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

interface EnhancedPostCardProps {
  post: Post;
  currentUser: CommunityUser;
  onLike: () => void;
  onShare?: () => void;
  onReport: (reason: string) => void;
  onRequestStylist?: (post: Post) => void;
  showChallengeEntry?: boolean;
}

export function EnhancedPostCard({
  post,
  currentUser,
  onLike,
  onShare,
  onReport,
  showChallengeEntry,
}: EnhancedPostCardProps) {
  const { user } = useAuthStore();

  // State - Use post props directly with local state for optimistic updates
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [commentCount, setCommentCount] = useState(post.comments.length);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedStylist, setSelectedStylist] = useState<UserMini | null>(null);

  // Sync isLiked and likeCount state with post prop when it changes from React Query
  // This ensures UI updates when mutation invalidates the query
  useEffect(() => {
    setIsLiked(post.isLiked ?? false);
    setLikeCount(post.likes);
  }, [post.isLiked, post.likes, post.id]); // Add post.id to deps to ensure update on refetch

  // Computed values
  const images = useMemo(
    () =>
      post.images?.length > 0 ? post.images : post.image ? [post.image] : [],
    [post.images, post.image]
  );

  const isAuthorStylist = useMemo(
    () =>
      currentUser.name.includes("Chen") ||
      currentUser.name.includes("Rivera") ||
      currentUser.name.includes("Patel"),
    [currentUser.name]
  );

  // Handlers
  const handleLike = useCallback(() => {
    if (!user || isLiking) return;

    setIsLiking(true);
    
    try {
      // Call parent handler which triggers the mutation
      // The mutation handles:
      // - API call
      // - Optimistic updates in React Query cache
      // - Toast notifications
      // - Error rollback
      onLike();
    } finally {
      // Reset loading state after a short delay to prevent double-click
      setTimeout(() => setIsLiking(false), 300);
    }
  }, [user, isLiking, onLike]);

  const handleDoubleClick = useCallback(() => {
    if (!isLiked) {
      handleLike();
    }
  }, [isLiked, handleLike]);

  const handleMessageAuthor = useCallback(() => {
    if (!isAuthorStylist) return;

    const stylistData: UserMini = {
      id: `s${currentUser.name.split(" ")[0].toLowerCase()}`,
      name: currentUser.name,
      role: "stylist",
      isOnline: Math.random() > 0.5,
    };
    setSelectedStylist(stylistData);
    setIsChatModalOpen(true);
  }, [isAuthorStylist, currentUser.name]);

  const handleCommentSubmit = useCallback(
    async (comment: string) => {
      if (!user) return;

      await communityAPI.createComment({
        postId: parseInt(post.id),
        userId: parseInt(user.id),
        comment,
        parentCommentId: null,
      });

      setCommentCount((prev) => prev + 1);
      toast.success("Comment added!");

      // Trigger refresh
      window.dispatchEvent(
        new CustomEvent("refreshComments", { detail: { postId: post.id } })
      );
    },
    [user, post.id]
  );

  return (
    <>
      <Card className="group overflow-hidden bg-card border-0 shadow-sm hover:shadow-lg transition-all duration-300">
        {/* Header */}
        <div className="p-4 pb-3">
          <PostHeader
            user={currentUser}
            timestamp={post.timestamp}
            isAuthorStylist={isAuthorStylist}
            showChallengeEntry={showChallengeEntry}
            onMessageAuthor={handleMessageAuthor}
            onReport={onReport}
          />
        </div>

        {/* Image */}
        {images.length > 0 && (
          <div className="mx-4 mb-4">
            <PostImage
              images={images}
              isLiked={isLiked}
              onDoubleClick={handleDoubleClick}
            />
          </div>
        )}

        {/* Content & Actions */}
        <div className="px-4 pb-4 space-y-3">
          <PostActions
            isLiked={isLiked}
            likeCount={likeCount}
            commentCount={commentCount}
            onLike={handleLike}
            onComment={() => setIsCommentModalOpen(true)}
            onShare={onShare}
          />

          <PostContent caption={post.caption} tags={post.tags} />
        </div>
      </Card>

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
      <Dialog open={isCommentModalOpen} onOpenChange={setIsCommentModalOpen}>
        <DialogContent className="max-w-3xl h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
            <DialogTitle className="text-lg font-semibold">
              {currentUser.name}&apos;s post
            </DialogTitle>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <PostHeader
              user={currentUser}
              timestamp={post.timestamp}
              isAuthorStylist={isAuthorStylist}
              showChallengeEntry={showChallengeEntry}
              onMessageAuthor={handleMessageAuthor}
              onReport={onReport}
            />

            <PostContent caption={post.caption} tags={post.tags} />

            {images.length > 0 && (
              <PostImage
                images={images}
                isLiked={isLiked}
                onDoubleClick={handleDoubleClick}
              />
            )}

            <PostActions
              isLiked={isLiked}
              likeCount={likeCount}
              commentCount={commentCount}
              onLike={handleLike}
              onComment={() => {}}
              onShare={onShare}
            />

            <div className="space-y-4 pt-4">
              <h3 className="font-semibold text-lg">Comments</h3>
              <CommentSection
                postId={post.id}
                commentCount={commentCount}
                onCommentCountChange={setCommentCount}
              />
            </div>
          </div>

          {/* Sticky Comment Input */}
          <CommentInput
            userName={user?.displayName || currentUser.name}
            onSubmit={handleCommentSubmit}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
