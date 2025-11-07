import { useState, useCallback, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Post, CommunityUser } from "@/types/community";
import { UserMini } from "@/types/chat";
import { QuickChatModal } from "@/components/chat/QuickChatModal";
import { PostHeader } from "./PostHeader";
import { PostImage } from "./PostImage";
import { PostContent } from "./PostContent";
import { PostActions } from "./PostActions";
import { PostModal } from "@/components/community/profile/PostModal";
import { useAuthStore } from "@/store/auth-store";

interface EnhancedPostCardProps {
  post: Post;
  currentUser: CommunityUser;
  onLike: () => void;
  onReport: (reason: string) => void;
  onRequestStylist?: (post: Post) => void;
  showChallengeEntry?: boolean;
}

export function EnhancedPostCard({
  post,
  currentUser,
  onLike,
  onReport,
  showChallengeEntry,
}: EnhancedPostCardProps) {
  const { user } = useAuthStore();

  // State - Use post props directly with local state for optimistic updates
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likes);
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

  return (
    <>
      <Card className="group overflow-hidden bg-card border-0 shadow-sm hover:shadow-lg transition-all duration-300">
        {/* Header */}
        <div className="p-4 pb-3">
          <PostHeader
            user={{
              id: post.userId,
              name: post.userDisplayName,
              avatar: undefined, // Will use fallback in PostHeader
            }}
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
            <PostImage images={images} onDoubleClick={handleDoubleClick} />
          </div>
        )}

        {/* Content & Actions */}
        <div className="px-4 pb-4 space-y-3">
          <PostActions
            isLiked={isLiked}
            likeCount={likeCount}
            commentCount={post.comments.length}
            onLike={handleLike}
            onComment={() => setIsCommentModalOpen(true)}
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

      {/* Instagram-style Post Modal */}
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
