"use client";

import { useCallback, useState, Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useCommunityAuth } from "@/hooks/useCommunityAuth";
import { useCommunityFilters } from "@/hooks/useCommunityFilters";
import { useCreatePost } from "@/hooks/useCreatePost";
import { LoadingScreen } from "@/components/community";
import { useSharePostStore } from "@/store/share-post-store";

const CommunityLayout = dynamic(
  () => import("@/components/community").then((mod) => mod.CommunityLayout),
  { ssr: false }
);

const CommunityHeader = dynamic(
  () => import("@/components/community").then((mod) => mod.CommunityHeader),
  { ssr: false }
);

const CommunityFilters = dynamic(
  () => import("@/components/community").then((mod) => mod.CommunityFilters),
  { ssr: false }
);

const InfiniteScrollFeed = dynamic(
  () => import("@/components/community").then((mod) => mod.InfiniteScrollFeed),
  { ssr: false }
);

/**
 * Component that reads search params - needs to be wrapped in Suspense
 */
function CommunityFeedContent({
  searchQuery,
  refreshKey,
}: {
  searchQuery: string;
  refreshKey: number;
}) {
  const searchParams = useSearchParams();
  const hashtagId = searchParams.get("hashtag");

  return (
    <InfiniteScrollFeed
      searchQuery={searchQuery}
      refreshKey={refreshKey}
      initialHashtagId={hashtagId ? parseInt(hashtagId, 10) : undefined}
    />
  );
}

/**
 * Community page - Social feed for outfit sharing
 * Refactored into smaller, reusable components and custom hooks
 */
export default function Community() {
  // Authentication
  const { isInitialized } = useCommunityAuth();

  // Filter state management
  const {
    searchQuery,
    debouncedSearchQuery, // ✅ Get debounced version
    setSearchQuery,
  } = useCommunityFilters();

  // Post creation
  const { createPost, isCreating } = useCreatePost();
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);

  // Share post store for external sharing (e.g., virtual try-on)
  const { shareData, clearShareData } = useSharePostStore();

  const handleFeedRefresh = useCallback(() => {
    setFeedRefreshKey((prev) => prev + 1);
  }, []);

  // Check URL params to auto-open post creation modal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("openPost") === "true" && shareData) {
      setIsNewPostOpen(true);
      // Clean up URL
      window.history.replaceState({}, "", "/community");
    }
  }, [shareData]);

  // Handle post creation and close dialog
  const handleCreatePost = async (postData: {
    caption: string;
    captionHtml: string;
    tags: string[];
    files?: File[]; // Changed to File[] for upload
    itemIds?: number[];
    outfitId?: number;
  }) => {
    const success = await createPost(postData);
    if (success) {
      setIsNewPostOpen(false);
      clearShareData(); // Clear share data after successful post
    }
    return success;
  };

  // Show loading while auth is initializing
  if (!isInitialized) {
    return <LoadingScreen message="Initializing..." />;
  }

  return (
    <CommunityLayout>
      {/* Header with Create Post button */}
      <CommunityHeader
        isNewPostOpen={isNewPostOpen}
        onNewPostOpenChange={setIsNewPostOpen}
        onCreatePost={handleCreatePost}
        isSubmitting={isCreating}
        onRefreshFeed={handleFeedRefresh}
        initialShareData={shareData}
      />

      {/* All filters grouped together */}
      <CommunityFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Infinite scroll feed - Uses debounced search for performance */}
      <Suspense fallback={<LoadingScreen message="Loading feed..." />}>
        <CommunityFeedContent
          searchQuery={debouncedSearchQuery}
          refreshKey={feedRefreshKey}
        />
      </Suspense>
    </CommunityLayout>
  );
}
