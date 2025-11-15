"use client";

import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { toast } from "sonner";
import { Hashtag } from "@/lib/api/community-api";
import { communityAPI } from "@/lib/api/community-api";

interface InfiniteScrollFeedProps {
  searchQuery?: string;
  refreshKey?: number;
  initialHashtagId?: number;
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
  refreshKey = 0,
  initialHashtagId,
}: InfiniteScrollFeedProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const observerTarget = useRef<HTMLDivElement>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [activeHashtag, setActiveHashtag] = useState<Hashtag | null>(null);
  const [taggedPosts, setTaggedPosts] = useState<Post[]>([]);
  const [isTagLoading, setIsTagLoading] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);

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
    resetFeed,
  } = useFeed(10, searchQuery);

  useEffect(() => {
    if (!refreshKey) {
      return;
    }

    let isCancelled = false;

    const performRefresh = async () => {
      setIsManualRefreshing(true);

      try {
        await resetFeed();
        if (isCancelled) return;

        const result = await refetch();

        if (result?.error) {
          throw result.error;
        }
      } catch (error) {
        console.error("Failed to refresh community feed", error);
      } finally {
        if (!isCancelled) {
          setIsManualRefreshing(false);
        }
      }
    };

    performRefresh();

    return () => {
      isCancelled = true;
    };
  }, [refreshKey, resetFeed, refetch]);

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

  const fetchPostsForHashtag = useCallback(
    async (tag: Hashtag) => {
      setIsTagLoading(true);
      setTagError(null);

      try {
        const userId = user?.id ? parseInt(user.id, 10) : undefined;
        const response = await communityAPI.getPostsByHashtag(
          tag.id,
          1,
          20,
          userId
        );
        const postsByTag = response.data?.map(apiPostToPost) ?? [];
        const sortedByTimestamp = [...postsByTag].sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setTaggedPosts(sortedByTimestamp);
      } catch (error) {
        console.error("Failed to fetch posts by hashtag:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Không thể tải bài viết theo hashtag";
        setTaggedPosts([]);
        setTagError(message);
        toast.error(message);
      } finally {
        setIsTagLoading(false);
      }
    },
    [user?.id]
  );

  const clearTagFilter = useCallback(() => {
    // Clear state first
    setActiveHashtag(null);
    setTaggedPosts([]);
    setTagError(null);

    // Clear hashtag from URL params
    const params = new URLSearchParams(searchParams.toString());
    params.delete("hashtag");
    const newUrl = params.toString()
      ? `/community?${params.toString()}`
      : "/community";

    // Use push instead of replace to ensure URL updates
    router.push(newUrl);
  }, [router, searchParams]);

  const handleTagClick = useCallback(
    async (tag: Hashtag) => {
      if (activeHashtag?.id === tag.id) {
        clearTagFilter();
        return;
      }

      // Update URL params when clicking tag - let useEffect handle the state update
      const params = new URLSearchParams(searchParams.toString());
      params.set("hashtag", tag.id.toString());
      const newUrl = `/community?${params.toString()}`;

      // Just update URL, useEffect will handle setting activeHashtag
      router.push(newUrl);
    },
    [activeHashtag?.id, clearTagFilter, router, searchParams]
  );

  // Initialize hashtag from URL params
  useEffect(() => {
    const urlHashtag = searchParams.get("hashtag");
    const urlHashtagId = urlHashtag ? parseInt(urlHashtag, 10) : undefined;

    // Initialize if URL has hashtag but activeHashtag doesn't match or doesn't exist
    if (urlHashtagId && activeHashtag?.id !== urlHashtagId) {
      // Fetch posts for the hashtag and extract tag name from response
      const initializeHashtag = async () => {
        try {
          setIsTagLoading(true);
          setTagError(null);

          const userId = user?.id ? parseInt(user.id, 10) : undefined;
          const response = await communityAPI.getPostsByHashtag(
            urlHashtagId,
            1,
            20,
            userId
          );

          // Extract tag name from first post's hashtags or use a placeholder
          const postsByTag = response.data?.map(apiPostToPost) ?? [];
          const tagName =
            postsByTag[0]?.tags?.find((t) => t.id === urlHashtagId)?.name || "";

          const tag: Hashtag = { id: urlHashtagId, name: tagName };

          setActiveHashtag(tag);

          const sortedByTimestamp = [...postsByTag].sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setTaggedPosts(sortedByTimestamp);
        } catch (error) {
          console.error("Failed to initialize hashtag from URL:", error);
          // Still set the tag with ID only if name not found
          const tag: Hashtag = { id: urlHashtagId, name: "" };
          setActiveHashtag(tag);
          setTaggedPosts([]);
          setTagError("Không thể tải bài viết theo hashtag");
        } finally {
          setIsTagLoading(false);
        }
      };
      initializeHashtag();
    }
    // Clear activeHashtag if URL doesn't have hashtag and activeHashtag exists
    else if (!urlHashtag && activeHashtag) {
      setActiveHashtag(null);
      setTaggedPosts([]);
      setTagError(null);
    }
  }, [initialHashtagId, activeHashtag, user?.id, searchParams]);

  const refreshActiveHashtag = useCallback(async () => {
    if (activeHashtag) {
      await fetchPostsForHashtag(activeHashtag);
    }
  }, [activeHashtag, fetchPostsForHashtag]);

  // API already handles search filtering, so we just need to transform posts
  const feedPosts = useMemo(() => posts.map(apiPostToPost), [posts]);

  const displayedPosts = activeHashtag ? taggedPosts : feedPosts;

  const handleLikePost = useCallback(
    (postId: string | number) => {
      const numericId =
        typeof postId === "string" ? Number.parseInt(postId, 10) : postId;

      if (Number.isNaN(numericId)) {
        return;
      }

      if (activeHashtag) {
        setTaggedPosts((prev) =>
          prev.map((post) =>
            post.id === numericId.toString()
              ? {
                  ...post,
                  isLiked: !post.isLiked,
                  likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                }
              : post
          )
        );
      }

      toggleLike(numericId);
    },
    [activeHashtag, toggleLike]
  );

  const handleDeletePost = useCallback(
    async (postId: number) => {
      try {
        await deletePost(postId);

        if (activeHashtag) {
          setTaggedPosts((prev) =>
            prev.filter((post) => post.id !== postId.toString())
          );
        }
      } catch (error) {
        console.error("Error in handleDeletePost:", error);
        throw error;
      }
    },
    [deletePost, activeHashtag]
  );

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
    async (postId: number, description: string) => {
      if (!user?.id) {
        const message = "You need to sign in to report content.";
        toast.error(message);
        throw new Error(message);
      }

      await reportPost({
        postId,
        userId: parseInt(user.id, 10),
        description,
      });
    },
    [user, reportPost]
  );

  // Handle edit post
  const handleEditPost = useCallback((post: Post) => {
    setEditingPost(post);
  }, []);

  const activeHashtagBanner = activeHashtag ? (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-sm text-slate-100">
      <span>
        Viewing posts with hashtag{" "}
        <span className="font-semibold text-cyan-200">
          #{activeHashtag.name}
        </span>
      </span>
      <button
        onClick={clearTagFilter}
        className="rounded-lg border border-cyan-400/30 px-3 py-1 text-xs font-semibold text-cyan-200 transition hover:border-cyan-300/60 hover:text-cyan-100"
      >
        Clear filter
      </button>
    </div>
  ) : null;

  // Loading state
  if (!activeHashtag && (isLoading || isManualRefreshing)) {
    const skeletonCount = isManualRefreshing ? 4 : 3;

    return (
      <FeedLoading>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <PostSkeleton key={index} />
        ))}
      </FeedLoading>
    );
  }

  if (activeHashtag && isTagLoading) {
    return (
      <div className="space-y-6">
        {activeHashtagBanner}
        <FeedLoading>
          {Array.from({ length: 3 }).map((_, index) => (
            <PostSkeleton key={index} />
          ))}
        </FeedLoading>
      </div>
    );
  }

  // Error state
  if (!activeHashtag && isError) {
    return <FeedError message={error?.message} />;
  }

  if (activeHashtag && tagError) {
    return (
      <div className="space-y-6">
        {activeHashtagBanner}
        <FeedError message={tagError} />
      </div>
    );
  }

  // Empty state
  if (!activeHashtag && feedPosts.length === 0) {
    return <FeedEmpty searchQuery={searchQuery} />;
  }

  if (activeHashtag && !isTagLoading && displayedPosts.length === 0) {
    return (
      <div className="space-y-6">
        {activeHashtagBanner}
        <FeedEmpty searchQuery={`#${activeHashtag.name}`} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activeHashtagBanner}
      {/* Posts */}
      <FeedPostList
        posts={displayedPosts}
        currentUser={currentUser}
        onLike={handleLikePost}
        onReport={handleReport}
        onDeletePost={handleDeletePost}
        onEditPost={handleEditPost}
        onTagClick={handleTagClick}
      />

      {!activeHashtag && (
        <>
          {/* Intersection observer sentinel */}
          <div ref={observerTarget} className="h-10" />

          {/* Loading more posts */}
          {isFetchingNextPage && <FeedLoadingMore />}

          {/* End of feed */}
          {!hasNextPage && feedPosts.length > 0 && <FeedEndIndicator />}
        </>
      )}

      {/* Edit Post Dialog */}
      {editingPost && (
        <Dialog
          open={!!editingPost}
          onOpenChange={(open) => !open && setEditingPost(null)}
        >
          <DialogContent
            showCloseButton={false}
            className="max-w-2xl  max-h-[90vh] !overflow-hidden p-0 flex flex-col backdrop-blur-xl bg-gradient-to-br from-cyan-950/60 via-blue-950/50 to-indigo-950/60 border-2 border-cyan-400/25 shadow-2xl shadow-cyan-500/20"
          >
            <EditPostDialog
              post={editingPost}
              onSuccess={async () => {
                setEditingPost(null);
                // Refetch the feed to show updated post
                await refetch();
                await refreshActiveHashtag();
              }}
              onClose={() => setEditingPost(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
