"use client";

import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { PostSkeleton } from "./PostSkeleton";
import { useFeed } from "@/hooks/useFeed";
import { Post, apiPostToPost } from "@/types/community";
import { useAuthStore } from "@/store/auth-store";
import {
  FeedLoading,
  FeedError,
  FeedEmpty,
  FeedEndIndicator,
  FeedLoadingMore,
} from "./FeedStates";
import { FeedPostList } from "./FeedPostList";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EditPostDialog } from "@/components/community/EditPostDialog";

interface InfiniteScrollFeedProps {
  searchQuery?: string;
}

/**
 * Infinite scroll feed component similar to TikTok/Instagram/Facebook
 * ✅ OPTIMIZED:
 * - Extracted follow status logic to custom hook
 * - Separated state components for cleaner code
 * - Separated post list rendering
 * - Better performance with memoization
 * - Single responsibility principle
 */
export function InfiniteScrollFeed({
  searchQuery = "",
}: InfiniteScrollFeedProps) {
  const { user } = useAuthStore();
  const observerTarget = useRef<HTMLDivElement>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const {
    posts,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    toggleLike,
    reportPost,
    deletePost,
    refetch,
  } = useFeed(10);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Memoize filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (searchQuery) {
        const matchesSearch =
          post.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.hashtags.some((tag) =>
            tag.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [posts, searchQuery]);

  // Memoize sorted posts
  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredPosts]);

  // Get current user for EnhancedPostCard
  const currentUser = user
    ? {
        id: user.id,
        name: user.email || "User",
        avatar: undefined,
      }
    : { id: "0", name: "Guest", avatar: undefined };

  // Handle report
  const handleReport = useCallback(
    (postId: number, reason: string) => {
      if (!user) return;
      reportPost({
        postId,
        userId: parseInt(user.id),
        reason,
      });
    },
    [user, reportPost]
  );

  // Handle edit post
  const handleEditPost = useCallback(
    (post: Post) => {
      setEditingPost(post);
    },
    []
  );

  // Loading state
  if (isLoading) {
    return (
      <FeedLoading>
        {[1, 2, 3].map((i) => (
          <PostSkeleton key={i} />
        ))}
      </FeedLoading>
    );
  }

  // Error state
  if (isError) {
    return <FeedError message={error?.message} />;
  }

  // Empty state
  if (sortedPosts.length === 0) {
    return <FeedEmpty searchQuery={searchQuery} />;
  }

  return (
    <div className="space-y-6">
      {/* Posts */}
      <FeedPostList
        posts={sortedPosts.map(apiPostToPost)}
        currentUser={currentUser}
        onLike={(postId) =>
          toggleLike(typeof postId === "string" ? parseInt(postId) : postId)
        }
        onReport={handleReport}
        onDeletePost={async (postId) => deletePost(postId)}
        onEditPost={handleEditPost}
      />

      {/* Intersection observer sentinel */}
      <div ref={observerTarget} className="h-10" />

      {/* Loading more posts */}
      {isFetchingNextPage && <FeedLoadingMore />}

      {/* End of feed */}
      {!hasNextPage && sortedPosts.length > 0 && <FeedEndIndicator />}

      {/* Edit Post Dialog */}
      {editingPost && (
        <Dialog open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
          <DialogContent 
            showCloseButton={false}
            className="max-w-2xl max-h-[90vh] !overflow-hidden p-0 flex flex-col backdrop-blur-xl bg-gradient-to-br from-cyan-950/60 via-blue-950/50 to-indigo-950/60 border-2 border-cyan-400/25 shadow-2xl shadow-cyan-500/20"
          >
            <EditPostDialog
              post={editingPost}
              onSuccess={async () => {
                setEditingPost(null);
                // Refetch the feed to show updated post
                await refetch();
              }}
              onClose={() => setEditingPost(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
