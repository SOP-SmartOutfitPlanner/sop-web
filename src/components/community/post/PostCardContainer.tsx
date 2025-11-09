"use client";

import { Post } from "@/types/community";
import { PostHeader } from "./PostHeader";
import { PostImage } from "./PostImage";
import { PostContent } from "./PostContent";
import { PostActions } from "./PostActions";
import GlassCard from "@/components/ui/glass-card";
import { useState } from "react";

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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <GlassCard
        padding="0"
        borderRadius="24px"
        blur="12px"
        brightness={1.1}
        glowColor={isHovered ? "rgba(34, 211, 238, 0.35)" : "rgba(34, 211, 238, 0.2)"}
        borderColor={isHovered ? "rgba(34, 211, 238, 0.4)" : "rgba(255, 255, 255, 0.2)"}
        borderWidth="2px"
        className="relative overflow-hidden bg-gradient-to-br from-cyan-300/30 via-blue-200/10 to-indigo-300/30 transition-all duration-300 group"
      >
        {/* Inner gradient overlay for depth */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-cyan-900/5 via-transparent to-white/5 pointer-events-none" />

        <div className="relative z-10 w-full flex flex-col">
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
        </div>
      </GlassCard>
    </div>
  );
}

