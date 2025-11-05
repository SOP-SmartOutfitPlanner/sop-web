"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { communityAPI } from "@/lib/api/community-api";
import { useAuthStore } from "@/store/auth-store";

import { StatsBar } from "@/components/community/StatsBar";
import { HashtagCloud } from "@/components/community/HashtagCloud";
import { CommunityTabs } from "@/components/community/CommunityTabs";
import { SearchFilters } from "@/components/community/SearchFilters";
import { InfiniteScrollFeed } from "@/components/community/InfiniteScrollFeed";

import { Sidebar } from "@/components/community/Sidebar";
import { NewPostDialog } from "@/components/community/NewPostDialog";

export default function Community() {
  const router = useRouter();
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("latest");
  const [selectedTag, setSelectedTag] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const { user, isInitialized } = useAuthStore();

  // Check authentication on mount
  useEffect(() => {
    // Wait for auth to initialize before checking authentication
    if (!isInitialized) return;

    if (!user) {
      console.warn("❌ No user found - redirecting to login");
      toast.error("Please login to view community posts");
      router.push("/login");
      return;
    }
  }, [user, isInitialized, router]);

  const handleCreatePost = async (postData: {
    caption: string;
    tags: string[];
    image?: string;
  }) => {
    if (!user) return;

    try {
      await communityAPI.createPost({
        userId: parseInt(user.id),
        body: postData.caption,
        hashtags: postData.tags,
        imageUrls: postData.image ? [postData.image] : [],
      });

      setIsNewPostOpen(false);

      toast.success("Post created!", {
        description: "Your outfit has been shared with the community",
      });

      // React Query will auto-refetch via useFeed invalidation
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post", {
        description: "Please try again",
      });
    }
  };

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setSelectedTag("");
    setTimeFilter("all");
  };

  // Show loading while auth is initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/10">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Main Grid Layout */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Header Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    Style Community
                  </h1>
                  <p className="text-lg text-muted-foreground mt-1">
                    Discover, share, and get inspired by fashion looks
                  </p>
                </div>

                <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/25 transition-all duration-200">
                      <Plus className="w-5 h-5 mr-2" />
                      Share Look
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <NewPostDialog onCreatePost={handleCreatePost} />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Stats Bar */}
              <StatsBar />

              {/* Hashtag Cloud */}
              <HashtagCloud
                selectedTag={selectedTag}
                onTagClick={setSelectedTag}
              />

              {/* Tabs */}
              <CommunityTabs activeTab={activeTab} onTabChange={setActiveTab} />

              {/* Search & Filters */}
              <SearchFilters
                searchQuery={searchQuery}
                selectedTag={selectedTag}
                timeFilter={timeFilter}
                onSearchChange={setSearchQuery}
                onTagChange={setSelectedTag}
                onTimeFilterChange={setTimeFilter}
                onClearAll={handleClearAllFilters}
              />
            </div>

            {/* Posts Feed with Infinite Scroll */}
            <InfiniteScrollFeed
              searchQuery={searchQuery}
              selectedTag={selectedTag}
              timeFilter={timeFilter}
              activeTab={activeTab}
            />
          </div>

          {/* Sidebar - Shows on medium screens and up */}
          <aside className="hidden md:block md:w-[340px] md:flex-shrink-0  top-24 self-start">
            <Sidebar />
          </aside>
        </div>
      </div>
    </div>
  );
}
