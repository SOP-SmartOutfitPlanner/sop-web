"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Post, apiPostToPost } from "@/types/community";
import { getCurrentUser } from "@/lib/mock/community";
import { communityAPI } from "@/lib/api/community-api";
import { useAuthStore } from "@/store/auth-store";

import { StatsBar } from "@/components/community/StatsBar";
import { HashtagCloud } from "@/components/community/HashtagCloud";
import { CommunityTabs } from "@/components/community/CommunityTabs";
import { SearchFilters } from "@/components/community/SearchFilters";
import { EnhancedPostCard } from "@/components/community/EnhancedPostCard";

import { Sidebar } from "@/components/community/Sidebar";
import { NewPostDialog } from "@/components/community/NewPostDialog";
import { PostSkeleton } from "@/components/community/PostSkeleton";

export default function Community() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("latest");
  const [selectedTag, setSelectedTag] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const { user, isInitialized } = useAuthStore();
  const currentUser = getCurrentUser();

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

    // Load posts when user is authenticated
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isInitialized, activeTab, selectedTag, searchQuery, timeFilter]);

  const loadPosts = async () => {
    setIsLoading(true);

    try {
      console.log("🔐 Current user:", user);
      if (!user) {
        console.warn("❌ No user found - redirecting to login");
        toast.error("Please login to view community posts");
        setPosts([]);
        setIsLoading(false);
        return;
      }

      // Load posts from real API
      const userId = parseInt(user.id);
      console.log("🔍 Loading posts for userId:", userId);
      console.log("🌐 API Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL);

      let feedResponse;
      try {
        feedResponse = await communityAPI.getFeed(userId, 1, 50);
        console.log("✅ Feed API Response:", feedResponse);
        console.log("📊 Posts count:", feedResponse?.data?.length || 0);
        console.log("📋 Metadata:", feedResponse?.metaData);
      } catch (apiError) {
        console.error("❌ API Error:", apiError);
        throw apiError;
      }

      // Transform API posts to UI posts
      let filteredPosts: Post[] = feedResponse.data.map(apiPostToPost);

      // Apply filters
      if (selectedTag) {
        filteredPosts = filteredPosts.filter((post) =>
          post.tags.includes(selectedTag)
        );
      }

      if (searchQuery) {
        filteredPosts = filteredPosts.filter(
          (post) =>
            post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.tags.some((tag) =>
              tag.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
      }

      if (timeFilter !== "all") {
        const now = new Date();
        const filterTime =
          timeFilter === "week"
            ? 7 * 24 * 60 * 60 * 1000
            : timeFilter === "month"
            ? 30 * 24 * 60 * 60 * 1000
            : 24 * 60 * 60 * 1000; // today

        filteredPosts = filteredPosts.filter(
          (post) =>
            post.timestamp &&
            now.getTime() - new Date(post.timestamp).getTime() < filterTime
        );
      }

      // Sort based on active tab
      if (activeTab === "trending") {
        filteredPosts.sort(
          (a, b) =>
            b.likes + b.comments.length * 2 - (a.likes + a.comments.length * 2)
        );
      } else {
        filteredPosts.sort(
          (a, b) =>
            new Date(b.timestamp || 0).getTime() -
            new Date(a.timestamp || 0).getTime()
        );
      }

      setPosts(filteredPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
      toast.error("Failed to load posts", {
        description: "Please try again later",
      });
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;

    // Optimistic update
    const updatedPosts = posts.map((post) =>
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    );
    setPosts(updatedPosts);

    try {
      await communityAPI.likePost(parseInt(postId), parseInt(user.id));
      toast.success("Post liked!", {
        description: "Your like has been added",
      });
    } catch (error) {
      // Revert on error
      setPosts(posts);
      toast.error("Failed to like post");
    }
  };

  const handleReportPost = async (postId: string, reason: string) => {
    if (!user) return;

    try {
      await communityAPI.reportPost(
        parseInt(postId),
        parseInt(user.id),
        reason
      );
      toast.success("Post reported", {
        description: "Thank you for reporting. We'll review this content.",
      });
    } catch (error) {
      toast.error("Failed to report post");
    }
  };

  const handleCreatePost = async (postData: {
    caption: string;
    tags: string[];
    image?: string;
  }) => {
    if (!user) return;

    try {
      const createdPost = await communityAPI.createPost({
        userId: parseInt(user.id),
        body: postData.caption,
        hashtags: postData.tags,
        imageUrls: postData.image ? [postData.image] : [],
      });

      // Add to local state
      const newPost = apiPostToPost(createdPost);
      setPosts([newPost, ...posts]);
      setIsNewPostOpen(false);

      toast.success("Post created!", {
        description: "Your outfit has been shared with the community",
      });
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

            {/* Posts Feed */}
            <div className="space-y-6">
              {isLoading ? (
                // Skeleton Loading
                Array.from({ length: 3 }).map((_, index) => (
                  <PostSkeleton key={index} />
                ))
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <EnhancedPostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    onLike={() => handleLikePost(post.id)}
                    onReport={(reason) => handleReportPost(post.id, reason)}
                  />
                ))
              ) : (
                // Empty State
                <div className="text-center py-16">
                  <div className="space-y-6 max-w-md mx-auto">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mx-auto">
                        <ImageIcon className="w-12 h-12 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-foreground">
                        No posts found
                      </h3>
                      <p className="text-muted-foreground text-lg">
                        {searchQuery || selectedTag || timeFilter !== "all"
                          ? "Try adjusting your filters or search terms"
                          : "Be the first to share your amazing style with the community!"}
                      </p>
                    </div>
                    <Button
                      onClick={() => setIsNewPostOpen(true)}
                      className="bg-gradient-to-r from-primary to-accent"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Share your first look
                    </Button>
                  </div>
                </div>
              )}
            </div>
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
