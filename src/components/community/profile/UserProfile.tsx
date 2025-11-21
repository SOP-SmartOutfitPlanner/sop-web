"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { communityAPI, Hashtag } from "@/lib/api/community-api";
import { toast } from "sonner";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileInfo } from "./ProfileInfo";
import { useUserProfile } from "@/hooks/community/useUserProfile";
import { useUserPosts } from "@/hooks/community/useUserPosts";
import { useFollowUser } from "@/hooks/community/useFollowUser";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Post } from "@/types/community";
import { LoadingScreen } from "@/components/community";
import { USER_ROLES } from "@/lib/constants/auth";

const EnhancedPostCard = dynamic(
  () =>
    import("@/components/community/post/EnhancedPostCard").then(
      (m) => m.EnhancedPostCard
    ),
  {
    ssr: false,
  }
);

const FollowersModal = dynamic(
  () => import("./FollowersModal").then((m) => m.FollowersModal),
  {
    ssr: false,
  }
);

const UserCollectionsScreen = dynamic(
  () =>
    import("@/components/collections/UserCollectionsScreen").then(
      (m) => m.UserCollectionsScreen
    ),
  {
    ssr: false,
  }
);

const EditPostDialog = dynamic(
  () =>
    import("@/components/community/EditPostDialog").then(
      (m) => m.EditPostDialog
    ),
  {
    ssr: false,
  }
);

interface UserProfileProps {
  userId: string;
}

/**
 * Optimized User Profile Component
 * - Uses custom hooks for separation of concerns
 * - Split into smaller sub-components
 * - Better performance with memoization
 */
export function UserProfile({ userId }: UserProfileProps) {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [activeSection, setActiveSection] = useState<"posts" | "collections">(
    "posts"
  );

  const isOwnProfile = currentUser?.id?.toString() === userId;
  const numericUserId = parseInt(userId, 10);
  const normalizedCurrentRole = currentUser?.role?.toUpperCase();

  // Custom hooks
  const { userProfile, isLoading, refreshCounts, setUserProfile } =
    useUserProfile(userId);
  const {
    posts,
    isInitialLoading,
    isFetching,
    observerTarget,
    handleLike,
    refetch,
  } = useUserPosts(userId, currentUser?.id);
  const { isFollowing, setIsFollowing, toggleFollow } = useFollowUser(
    userId,
    currentUser?.id,
    refreshCounts
  );

  // Check follow status on mount
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (currentUser?.id && !isOwnProfile) {
        try {
          const followStatus = await communityAPI.getFollowStatus(
            parseInt(currentUser.id),
            parseInt(userId)
          );
          setIsFollowing(followStatus);
        } catch (error) {
          console.error("Error checking follow status:", error);
        }
      }
    };

    checkFollowStatus();
  }, [userId, currentUser?.id, isOwnProfile, setIsFollowing]);

  // Handlers
  const handleShare = () => {
    const url = `${window.location.origin}/community/profile/${userId}`;
    navigator.clipboard.writeText(url);
    toast.success("Profile link copied");
  };

  const handleReportPost = async (post: Post, reason: string) => {
    if (!currentUser?.id) {
      const message = "Please login";
      toast.error(message);
      throw new Error(message);
    }

    try {
      const response = await communityAPI.createReport({
        postId: parseInt(post.id, 10),
        userId: parseInt(currentUser.id, 10),
        type: "POST",
        description: reason,
      });

      toast.success("Thank you for reporting", {
        description: response?.message,
      });
    } catch (error) {
      console.error("Error reporting post:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Cannot send report";
      toast.error(errorMessage);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
  };

  const handleTagClick = (tag: Hashtag) => {
    // Navigate to community page with tag filter
    router.push(`/community?hashtag=${tag.id}`);
  };

  const handleDeletePost = async (postId: number) => {
    if (!currentUser?.id) {
      toast.error("Please login");
      return;
    }

    try {
      await communityAPI.deletePost(postId);
      toast.success("Post deleted");

      // Refetch posts to update the list
      await refetch();
    } catch (error) {
      console.error("Error deleting post:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Cannot delete post";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleFollowToggleWithUpdate = async () => {
    await toggleFollow();

    // Update follower count optimistically
    if (userProfile) {
      setUserProfile((prev) =>
        prev
          ? {
              ...prev,
              followersCount: isFollowing
                ? prev.followersCount - 1
                : prev.followersCount + 1,
            }
          : prev
      );
    }
  };

  // Loading state
  useEffect(() => {
    setActiveSection("posts");
  }, [userId]);

  // Check if the viewed user is a stylist
  const viewedUserRole = userProfile?.role;
  const isViewedUserStylist = 
    Boolean(userProfile?.isStylist) || 
    Boolean(userProfile?.isStylistVerified) ||
    (typeof viewedUserRole === 'number' && viewedUserRole === 2);
  
  const showCollectionsTab = useMemo(() => {
    return (
      isViewedUserStylist ||
      (isOwnProfile && normalizedCurrentRole === USER_ROLES.STYLIST)
    );
  }, [isViewedUserStylist, isOwnProfile, normalizedCurrentRole]);

  useEffect(() => {
    if (!showCollectionsTab && activeSection === "collections") {
      setActiveSection("posts");
    }
  }, [showCollectionsTab, activeSection]);

  if (isLoading || isInitialLoading) {
    return <LoadingScreen message="Loading profile..." />;
  }

  // Error state
  if (!userProfile) {
    return <LoadingScreen message="User not found" />;
  }

  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen relative z-0 pt-32">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <ProfileHeader
            userName={userProfile.name}
            onBack={() => router.back()}
          />

          {/* Profile Info */}
          <ProfileInfo
            userProfile={userProfile}
            isOwnProfile={isOwnProfile}
            isFollowing={isFollowing}
            isStylist={showCollectionsTab}
            onFollowToggle={handleFollowToggleWithUpdate}
            onShare={handleShare}
            onFollowersClick={() => setFollowersModalOpen(true)}
            onFollowingClick={() => setFollowingModalOpen(true)}
            activeSection={activeSection}
            onSectionChange={
              showCollectionsTab ? setActiveSection : undefined
            }
          />

          {/* Feed */}
          <div className="border-t border-border">
            {activeSection === "collections" && showCollectionsTab ? (
              <div className="py-10">
                <UserCollectionsScreen
                  userId={numericUserId}
                  variant="embedded"
                />
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-muted-foreground">No posts found</p>
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {posts.map((post) => (
                  <EnhancedPostCard
                    key={post.id}
                    post={post}
                    currentUser={{
                      id: userProfile.id,
                      name: userProfile.name,
                      avatar: userProfile.avatar,
                    }}
                    onLike={() => handleLike(parseInt(post.id))}
                    onReport={(reason) => handleReportPost(post, reason)}
                    onDeletePost={isOwnProfile ? handleDeletePost : undefined}
                    onEditPost={
                      isOwnProfile ? () => handleEditPost(post) : undefined
                    }
                    onTagClick={handleTagClick}
                  />
                ))}

                {/* Infinite scroll trigger */}
                <div
                  ref={observerTarget}
                  className="h-10 flex items-center justify-center"
                >
                  {isFetching && (
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <FollowersModal
        isOpen={followersModalOpen}
        onClose={() => setFollowersModalOpen(false)}
        userId={parseInt(userId)}
        type="followers"
        onFollowChange={refreshCounts}
        isOwnProfile={isOwnProfile}
      />

      <FollowersModal
        isOpen={followingModalOpen}
        onClose={() => setFollowingModalOpen(false)}
        userId={parseInt(userId)}
        type="following"
        onFollowChange={refreshCounts}
        isOwnProfile={isOwnProfile}
      />

      {/* Edit Post Dialog */}
      {editingPost && (
        <Dialog
          open={!!editingPost}
          onOpenChange={(open) => !open && setEditingPost(null)}
        >
          <DialogContent
            showCloseButton={false}
            className="max-w-2xl max-h-[90vh] !overflow-hidden p-0 flex flex-col backdrop-blur-xl bg-gradient-to-br from-cyan-950/60 via-blue-950/50 to-indigo-950/60 border-2 border-cyan-400/25 shadow-2xl shadow-cyan-500/20"
          >
            <EditPostDialog
              post={editingPost}
              onSuccess={async () => {
                setEditingPost(null);
                // Refetch posts to show updated post
                await refetch();
              }}
              onClose={() => setEditingPost(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
