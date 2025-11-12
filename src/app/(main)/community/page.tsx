"use client";

import { useCallback, useState } from "react";
import { useCommunityAuth } from "@/hooks/useCommunityAuth";
import { useCommunityFilters } from "@/hooks/useCommunityFilters";
import { useCreatePost } from "@/hooks/useCreatePost";

import {
  CommunityLayout,
  CommunityHeader,
  CommunityFilters,
  InfiniteScrollFeed,
  LoadingScreen,
} from "@/components/community";

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

  const handleFeedRefresh = useCallback(() => {
    setFeedRefreshKey((prev) => prev + 1);
  }, []);

  // Handle post creation and close dialog
  const handleCreatePost = async (postData: {
    caption: string;
    tags: string[];
    files?: File[]; // Changed to File[] for upload
  }) => {
    const success = await createPost(postData);
    if (success) {
      setIsNewPostOpen(false);
    }
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
      />

      {/* All filters grouped together */}
      <CommunityFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Infinite scroll feed - Uses debounced search for performance */}
      <InfiniteScrollFeed
        searchQuery={debouncedSearchQuery}
        refreshKey={feedRefreshKey}
      />
    </CommunityLayout>
  );
}
