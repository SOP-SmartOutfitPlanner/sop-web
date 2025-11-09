"use client";

import { Post } from "@/types/community";
import { PostGridItem } from "./PostGridItem";
import { MessageCircle } from "lucide-react";

interface PostGridLayoutProps {
  posts: Post[];
  isLoading: boolean;
  onSelectPost: (post: Post) => void;
}

/**
 * Extracted grid rendering component
 * Handles empty states, loading, and grid layout
 */
export function PostGridLayout({
  posts,
  isLoading,
  onSelectPost,
}: PostGridLayoutProps) {
  // Loading skeleton
  if (isLoading && posts.length === 0) {
    return (
      <div className="grid grid-cols-3 gap-1">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-muted animate-pulse rounded"
          />
        ))}
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full border-2 border-foreground mx-auto mb-4 flex items-center justify-center">
          <MessageCircle className="w-8 h-8" />
        </div>
        <h3 className="font-semibold text-2xl mb-2">No Posts Yet</h3>
      </div>
    );
  }

  // Grid layout
  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post, index) => (
        <PostGridItem
          key={post.id}
          post={post}
          index={index}
          onSelect={onSelectPost}
        />
      ))}
    </div>
  );
}

