"use client";

import { motion } from "framer-motion";
import { EnhancedPostCard } from "@/components/community/post/EnhancedPostCard";
import { Post } from "@/types/community";
import { CommunityUser } from "@/types/community";

interface FeedPostListProps {
  posts: Post[];
  currentUser: CommunityUser;
  followingStatus: Record<string, boolean>;
  onLike: (postId: string | number) => void;
  onReport: (postId: number, reason: string) => void;
  onFollow: (userId: string) => void;
  onDeletePost?: (postId: number) => Promise<void>;
  onEditPost?: (post: Post) => void;
}

export function FeedPostList({
  posts,
  currentUser,
  followingStatus,
  onLike,
  onReport,
  onFollow,
  onDeletePost,
  onEditPost,
}: FeedPostListProps) {
  return (
    <div className="space-y-6">
      {posts.map((post, index) => {
        const isFollowing = followingStatus[post.userId] ?? false;

        return (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <EnhancedPostCard
              post={post}
              currentUser={currentUser}
              onLike={() => onLike(post.id)}
              onReport={(reason) => onReport(parseInt(post.id), reason)}
              onFollow={onFollow}
              isFollowing={isFollowing}
              onDeletePost={onDeletePost}
              onEditPost={onEditPost ? () => onEditPost(post) : undefined}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

