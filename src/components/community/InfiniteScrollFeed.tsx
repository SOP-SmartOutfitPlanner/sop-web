"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { EnhancedPostCard } from "./EnhancedPostCard";
import { PostSkeleton } from "./PostSkeleton";
import { useFeed } from "@/hooks/useFeed";
import { apiPostToPost } from "@/types/community";
import { useAuthStore } from "@/store/auth-store";

interface InfiniteScrollFeedProps {
  searchQuery?: string;
  selectedTag?: string;
  timeFilter?: string;
  activeTab?: string;
}

/**
 * Infinite scroll feed component similar to TikTok/Instagram/Facebook
 * Uses React Query's useInfiniteQuery with intersection observer
 */
export function InfiniteScrollFeed({
  searchQuery = "",
  selectedTag = "",
  timeFilter = "all",
  activeTab = "latest",
}: InfiniteScrollFeedProps) {
  const { user } = useAuthStore();
  const observerTarget = useRef<HTMLDivElement>(null);
  
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
    metadata,
  } = useFeed(10); // 10 posts per page

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // When the sentinel div is visible and we have more pages
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: "100px", // Start loading 100px before reaching the bottom
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

  // Filter posts based on search, tags, and time
  const filteredPosts = posts.filter((post) => {
    // Search filter
    if (searchQuery) {
      const matchesSearch =
        post.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.hashtags.some((tag) =>
          tag.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      if (!matchesSearch) return false;
    }

    // Tag filter
    if (selectedTag && !post.hashtags.some((tag) => tag.name === selectedTag)) {
      return false;
    }

    // Time filter
    if (timeFilter !== "all") {
      const now = new Date();
      const postDate = new Date(post.createdAt);
      const diffMs = now.getTime() - postDate.getTime();
      
      const filterTime =
        timeFilter === "week"
          ? 7 * 24 * 60 * 60 * 1000
          : timeFilter === "month"
          ? 30 * 24 * 60 * 60 * 1000
          : 24 * 60 * 60 * 1000; // today

      if (diffMs > filterTime) return false;
    }

    return true;
  });

  // Sort based on active tab
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (activeTab === "trending") {
      // Sort by engagement (likes + comments * 2)
      const scoreA = a.likeCount + a.commentCount * 2;
      const scoreB = b.likeCount + b.commentCount * 2;
      return scoreB - scoreA;
    } else {
      // Sort by date (latest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // Get current user for EnhancedPostCard
  const currentUser = user
    ? {
        id: user.id,
        name: user.email || "User",
        avatar: undefined,
      }
    : { id: "0", name: "Guest", avatar: undefined };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-red-500 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bricolage font-bold mb-2">
          Failed to load feed
        </h3>
        <p className="text-muted-foreground mb-4">
          {error?.message || "Something went wrong"}
        </p>
      </div>
    );
  }

  // Empty state
  if (sortedPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-muted-foreground mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bricolage font-bold mb-2">No posts found</h3>
        <p className="text-muted-foreground">
          {searchQuery || selectedTag
            ? "Try adjusting your filters"
            : "Be the first to share something!"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feed metadata */}
      {metadata && (
        <div className="text-sm text-muted-foreground text-center py-2">
          Showing {sortedPosts.length} of {metadata.totalCount} posts
        </div>
      )}

      {/* Posts */}
      {sortedPosts.map((post, index) => {
        // Transform CommunityPost to UI Post format
        const uiPost = apiPostToPost(post);
        
        return (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <EnhancedPostCard
              post={uiPost}
              currentUser={currentUser}
              onLike={() => toggleLike(post.id)}
              onReport={(reason) => {
                if (!user) return;
                reportPost({
                  postId: post.id,
                  userId: parseInt(user.id),
                  reason,
                });
              }}
            />
          </motion.div>
        );
      })}

      {/* Intersection observer sentinel */}
      <div ref={observerTarget} className="h-10" />

      {/* Loading next page indicator */}
      {isFetchingNextPage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-8"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading more posts...</span>
        </motion.div>
      )}

      {/* End of feed indicator */}
      {!hasNextPage && sortedPosts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-muted-foreground"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="font-medium">You&apos;re all caught up!</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
