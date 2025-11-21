"use client";

import dynamic from "next/dynamic";
import { Post, CommunityUser } from "@/types/community";
import { Hashtag } from "@/lib/api/community-api";

const EnhancedPostCard = dynamic(
  () =>
    import("@/components/community/post/EnhancedPostCard").then(
      (m) => m.EnhancedPostCard
    ),
  { ssr: false }
);

interface FeedPostListProps {
  posts: Post[];
  currentUser: CommunityUser;
  onLike: (postId: string | number) => void;
  onReport: (postId: number, description: string) => Promise<void>;
  onDeletePost?: (postId: number) => Promise<void>;
  onEditPost?: (post: Post) => void;
  onTagClick?: (tag: Hashtag) => void;
}

export function FeedPostList({
  posts,
  currentUser,
  onLike,
  onReport,
  onDeletePost,
  onEditPost,
  onTagClick,
}: FeedPostListProps) {
  return (
    <div className="space-y-6 transition-opacity duration-300">
      {posts.map((post) => (
        <EnhancedPostCard
          key={post.id}
          post={post}
          currentUser={currentUser}
          onLike={() => onLike(post.id)}
          onReport={(reason) => onReport(parseInt(post.id, 10), reason)}
          onDeletePost={onDeletePost}
          onEditPost={onEditPost ? () => onEditPost(post) : undefined}
          onTagClick={onTagClick}
        />
      ))}
    </div>
  );
}

