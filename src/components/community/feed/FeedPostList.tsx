"use client";

import { motion } from "framer-motion";
import { EnhancedPostCard } from "@/components/community/post/EnhancedPostCard";
import { Post } from "@/types/community";
import { CommunityUser } from "@/types/community";

interface FeedPostListProps {
  posts: Post[];
  currentUser: CommunityUser;
  onLike: (postId: string | number) => void;
  onReport: (postId: number, description: string) => Promise<void>;
  onDeletePost?: (postId: number) => Promise<void>;
  onEditPost?: (post: Post) => void;
}

export function FeedPostList({
  posts,
  currentUser,
  onLike,
  onReport,
  onDeletePost,
  onEditPost,
}: FeedPostListProps) {
  return (
    <div className="space-y-6">
      {posts.map((post, index) => (
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
            onReport={(reason) => onReport(parseInt(post.id, 10), reason)}
            onDeletePost={onDeletePost}
            onEditPost={onEditPost ? () => onEditPost(post) : undefined}
          />
        </motion.div>
      ))}
    </div>
  );
}

