"use client";

import { useState } from "react";
import { useCommunityAuth } from "@/hooks/useCommunityAuth";
import { useCommunityFilters } from "@/hooks/useCommunityFilters";
import { useCreatePost } from "@/hooks/useCreatePost";

import { CommunityLayout } from "@/components/community/CommunityLayout";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { CommunityFilters } from "@/components/community/CommunityFilters";
import { InfiniteScrollFeed } from "@/components/community/InfiniteScrollFeed";
import { LoadingScreen } from "@/components/community/LoadingScreen";

/**
 * Community page - Social feed for outfit sharing
 * Refactored into smaller, reusable components and custom hooks
 */
export default function Community() {
  // Authentication
  const { isInitialized } = useCommunityAuth();

  // Filter state management
  const {
    activeTab,
    selectedTag,
    searchQuery,
    timeFilter,
    setActiveTab,
    setSelectedTag,
    setSearchQuery,
    setTimeFilter,
    clearAllFilters,
  } = useCommunityFilters();

  // Post creation
  const { createPost } = useCreatePost();
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);

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
      />

      {/* All filters grouped together */}
      <CommunityFilters
        activeTab={activeTab}
        selectedTag={selectedTag}
        searchQuery={searchQuery}
        timeFilter={timeFilter}
        onTabChange={setActiveTab}
        onTagClick={setSelectedTag}
        onSearchChange={setSearchQuery}
        onTagChange={setSelectedTag}
        onTimeFilterChange={setTimeFilter}
        onClearAll={clearAllFilters}
      />

      {/* Infinite scroll feed */}
      <InfiniteScrollFeed
        searchQuery={searchQuery}
        selectedTag={selectedTag}
        timeFilter={timeFilter}
        activeTab={activeTab}
      />
    </CommunityLayout>
  );
}
