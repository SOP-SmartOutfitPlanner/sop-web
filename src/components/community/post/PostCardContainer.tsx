"use client";

import { Hashtag } from "@/lib/api/community-api";
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
  onReport: (reason: string) => Promise<void>;
  onMessageAuthor: () => void;
  onFollow?: () => void;
  onDelete?: () => Promise<void>;
  onEdit?: () => void;
  onTagClick?: (tag: Hashtag) => void;
  onViewLikes?: () => void;
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
  onTagClick,
  onViewLikes,
  authorInfo,
}: PostCardContainerProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        boxShadow: `0 8px 32px ${isHovered ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)'}`,
        transition: 'box-shadow 0.3s ease-out'
      }}
    >
      <GlassCard
        padding="0"
        borderRadius="24px"
        blur="24px"
        brightness={1.85}
        glowColor={
          isHovered ? "rgba(103, 232, 249, 0.08)" : "rgba(103, 232, 249, 0.04)"
        }
        borderColor={
          isHovered ? "rgba(103, 232, 249, 0.15)" : "rgba(103, 232, 249, 0.08)"
        }
        borderWidth="1px"
        shadowColor="rgba(0, 0, 0, 0.4)"
        shadowIntensity={32}
        className={`relative h-full flex flex-col 
          bg-slate-950/30 
          transition-all duration-300 group ${
            isHovered &&
            "bg-slate-950/40"
          }`}
      >
        {/* Inner gradient overlay for extra depth with cyan accent */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-cyan-900/5 via-transparent to-white/5 pointer-events-none" />

        <div className="w-full flex flex-col relative z-10">
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
          <PostContent caption={post.caption} tags={post.tags} onTagClick={onTagClick} />

          {/* Image */}
          {images.length > 0 && (
            <div className="mx-2 mb-4 cursor-pointer" onClick={onImageClick}>
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
              onViewLikes={onViewLikes}
            />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
