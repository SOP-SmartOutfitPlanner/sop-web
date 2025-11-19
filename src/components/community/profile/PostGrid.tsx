"use client";

import { usePostGridData } from "@/hooks/community/usePostGridData";
import { useModalState } from "@/hooks/common/useModalState";
import { PostGridLayout } from "@/components/community/post-grid/PostGridLayout";
import { PostModal } from "./PostModal";

interface PostGridProps {
  userId: string;
}
export function PostGrid({ userId }: PostGridProps) {
  // Data management hook
  const {
    posts,
    isLoading,
    hasMore,
    selectedPost,
    setSelectedPost,
    observerTarget,
    handleLikePost,
  } = usePostGridData({ userId });

  // Modal state hook
  const { isOpen, close } = useModalState({
    initialOpen: !!selectedPost,
  });

  return (
    <div>
      {/* Grid layout with all rendering logic */}
      <PostGridLayout
        posts={posts}
        isLoading={isLoading}
        onSelectPost={setSelectedPost}
      />

      {/* Loading more indicator */}
      {isLoading && posts.length > 0 && (
        <div className="grid grid-cols-3 gap-1 mt-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse rounded" />
          ))}
        </div>
      )}

      {/* Infinite scroll trigger */}
      {hasMore && <div ref={observerTarget} className="h-20" />}

      {/* Post detail modal */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          isOpen={isOpen || !!selectedPost}
          onClose={() => {
            close();
            setSelectedPost(null);
          }}
          onLike={() => handleLikePost(selectedPost.id)}
        />
      )}
    </div>
  );
}
