"use client";

import { Card } from "@/components/ui/card";
import { Post } from "@/types/community";
import { PostHeader } from "./PostHeader";
import { PostImage } from "./PostImage";
import { PostContent } from "./PostContent";
import { PostActions } from "./PostActions";

interface PostCardContainerProps {
  post: Post;
  images: string[];
  isOwnPost: boolean;
  isAuthorStylist: boolean;
  showChallengeEntry?: boolean;
  isFollowing?: boolean;
  onDoubleClick: () => void;
  onImageClick: () => void;
  onLike: () => void;
  onComment: () => void;
  onReport: (reason: string) => void;
  onMessageAuthor: () => void;
  onFollow?: () => void;
  onDelete?: () => Promise<void>;
  onEdit?: () => void;
  authorInfo: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export function PostCardContainer({
  post,
  images,
  isOwnPost,
  isAuthorStylist,
  showChallengeEntry,
  isFollowing,
  onDoubleClick,
  onImageClick,
  onLike,
  onComment,
  onReport,
  onMessageAuthor,
  onFollow,
  onDelete,
  onEdit,
  authorInfo,
}: PostCardContainerProps) {
  return (
    <Card className="group overflow-hidden bg-card border-0 shadow-sm hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="p-4 pb-3">
        <PostHeader
          user={authorInfo}
          timestamp={post.timestamp}
          isAuthorStylist={isAuthorStylist}
          showChallengeEntry={showChallengeEntry}
          isOwnPost={isOwnPost}
          isFollowing={isFollowing}
          onMessageAuthor={onMessageAuthor}
          onReport={onReport}
          onFollow={onFollow}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      </div>

      {/* Content */}
      <PostContent caption={post.caption} tags={post.tags} />

      {/* Image */}
      {images.length > 0 && (
        <div
          className="mx-4 mb-4 cursor-pointer"
          onClick={onImageClick}
        >
          <PostImage images={images} onDoubleClick={onDoubleClick} />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pb-4 space-y-3">
        <PostActions
          isLiked={post.isLiked ?? false}
          likeCount={post.likes}
          commentCount={post.commentCount}
          onLike={onLike}
          onComment={onComment}
        />
      </div>
    </Card>
  );
}

