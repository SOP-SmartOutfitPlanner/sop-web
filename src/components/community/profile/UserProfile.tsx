"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { communityAPI } from "@/lib/api/community-api";
import { toast } from "sonner";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { EnhancedPostCard } from "@/components/community/post/EnhancedPostCard";
import { FollowersModal } from "./FollowersModal";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileInfo } from "./ProfileInfo";
import { useUserProfile } from "@/hooks/community/useUserProfile";
import { useUserPosts } from "@/hooks/community/useUserPosts";
import { useFollowUser } from "@/hooks/community/useFollowUser";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EditPostDialog } from "@/components/community/EditPostDialog";
import { Post } from "@/types/community";

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

  const isOwnProfile = currentUser?.id?.toString() === userId;

  // Custom hooks
  const { userProfile, isLoading, refreshCounts, setUserProfile } =
    useUserProfile(userId);
  const { posts, isInitialLoading, isFetching, observerTarget, handleLike, refetch } =
    useUserPosts(userId, currentUser?.id);
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
  const handleMessage = () => {
    console.log("Open chat with", userId);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/community/profile/${userId}`;
    navigator.clipboard.writeText(url);
    toast.success("Đã copy link profile");
  };

  const handleReportPost = () => {
    if (!currentUser?.id) {
      toast.error("Vui lòng đăng nhập");
      return;
    }
    toast.success("Cảm ơn bạn đã báo cáo");
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
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
  if (isLoading || isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F8FF] via-[#F5F8FF] to-[#EAF0FF] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F8FF] via-[#F5F8FF] to-[#EAF0FF] flex items-center justify-center">
        <p className="text-muted-foreground">Không tìm thấy người dùng</p>
      </div>
    );
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
            onFollowToggle={handleFollowToggleWithUpdate}
            onMessage={handleMessage}
            onShare={handleShare}
            onFollowersClick={() => setFollowersModalOpen(true)}
            onFollowingClick={() => setFollowingModalOpen(true)}
          />

          {/* Feed */}
          <div className="border-t border-border">
            {posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-muted-foreground">Chưa có bài viết nào</p>
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
                    onReport={handleReportPost}
                    onEditPost={isOwnProfile ? () => handleEditPost(post) : undefined}
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
        <Dialog open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto p-0">
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
