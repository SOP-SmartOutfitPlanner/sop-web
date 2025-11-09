"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Grid3x3,
  User,
  Share2,
  MoreHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/auth-store";
import { communityAPI } from "@/lib/api/community-api";
import { userAPI } from "@/lib/api/user-api";
import { toast } from "sonner";
import { PostGrid } from "./PostGrid";
import { FollowersModal } from "./FollowersModal";

interface UserProfileProps {
  userId: string;
}

interface UserProfileData {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  location: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

/**
 * Instagram-style User Profile
 */
export function UserProfile({ userId }: UserProfileProps) {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);

  const isOwnProfile = currentUser?.id?.toString() === userId;

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);

        const numericUserId = parseInt(userId, 10);

        // Get user info from API
        const userResponse = await userAPI.getUserById(numericUserId);
        const userData = userResponse.data;

        // Get posts count
        const postsResponse = await communityAPI.getPostsByUser(
          numericUserId,
          1,
          1
        );

        // Get followers and following counts from API
        const [followersCount, followingCount] = await Promise.all([
          communityAPI.getFollowerCount(numericUserId),
          communityAPI.getFollowingCount(numericUserId),
        ]);

        setUserProfile({
          id: userId,
          name: userData.displayName,
          avatar:
            userData.avtUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              userData.displayName
            )}&background=3B82F6&color=fff`,
          bio: userData.bio || "",
          location: userData.location || "",
          followersCount,
          followingCount,
          postsCount: postsResponse.metaData.totalCount,
        });

        // Check if current user is following this profile
        if (currentUser?.id && !isOwnProfile) {
          const followStatus = await communityAPI.getFollowStatus(
            parseInt(currentUser.id),
            numericUserId
          );
          setIsFollowing(followStatus);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Không thể tải thông tin người dùng");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, currentUser?.id, isOwnProfile]);

  const handleFollowToggle = async () => {
    if (!currentUser?.id) {
      toast.error("Vui lòng đăng nhập để theo dõi");
      return;
    }

    try {
      const followerId = parseInt(currentUser.id);
      const followingId = parseInt(userId);

      // Optimistic update
      const wasFollowing = isFollowing;
      setIsFollowing(!isFollowing);
      setUserProfile((prev) =>
        prev
          ? {
              ...prev,
              followersCount: wasFollowing
                ? prev.followersCount - 1
                : prev.followersCount + 1,
            }
          : prev
      );

      // Call API
      const response = await communityAPI.toggleFollow(followerId, followingId);
      
      // Show success message
      if (response.message?.includes("Follow user successfully")) {
        toast.success("Đã theo dõi");
      } else if (response.message?.includes("Unfollow user successfully")) {
        toast.success("Đã bỏ theo dõi");
      }

      // Fetch updated counts from API
      const [followersCount, followingCount] = await Promise.all([
        communityAPI.getFollowerCount(followingId),
        communityAPI.getFollowingCount(followerId),
      ]);

      setUserProfile((prev) =>
        prev ? { ...prev, followersCount, followingCount } : prev
      );

    } catch (error) {
      console.error("Error toggling follow:", error);
      
      // Rollback on error
      setIsFollowing(isFollowing);
      setUserProfile((prev) => prev);
      
      toast.error("Không thể thực hiện thao tác");
    }
  };

  const handleMessage = () => {
    console.log("Open chat with", userId);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/community/profile/${userId}`;
    navigator.clipboard.writeText(url);
    toast.success("Đã copy link profile");
  };

  const handleFollowChange = async () => {
    // Refresh follower and following counts after follow/unfollow in modal
    try {
      const numericUserId = parseInt(userId);
      const [followersCount, followingCount] = await Promise.all([
        communityAPI.getFollowerCount(numericUserId),
        communityAPI.getFollowingCount(
          currentUser?.id ? parseInt(currentUser.id) : numericUserId
        ),
      ]);

      setUserProfile((prev) =>
        prev ? { ...prev, followersCount, followingCount } : prev
      );

    } catch (error) {
      console.error("Error refreshing counts:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Không tìm thấy người dùng</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <div className="flex items-center justify-between px-4 h-14">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold text-base">{userProfile.name}</h1>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-4 py-6">
          {/* Avatar + Stats Row */}
          <div className="flex items-center gap-6 mb-5">
            {/* Avatar */}
            <Avatar className="w-20 h-20 md:w-24 md:h-24">
              <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-accent text-white">
                {userProfile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Stats */}
            <div className="flex-1 flex justify-around">
              <div className="text-center">
                <div className="font-semibold text-sm md:text-base">
                  {userProfile.postsCount}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  posts
                </div>
              </div>
              <button
                onClick={() => setFollowersModalOpen(true)}
                className="text-center cursor-pointer hover:opacity-70 transition-opacity"
              >
                <div className="font-semibold text-sm md:text-base">
                  {userProfile.followersCount.toLocaleString()}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  followers
                </div>
              </button>
              <button
                onClick={() => setFollowingModalOpen(true)}
                className="text-center cursor-pointer hover:opacity-70 transition-opacity"
              >
                <div className="font-semibold text-sm md:text-base">
                  {userProfile.followingCount}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  following
                </div>
              </button>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1 mb-4">
            <div className="font-semibold text-sm">{userProfile.name}</div>
            {userProfile.bio && (
              <div className="text-sm whitespace-pre-wrap">
                {userProfile.bio}
              </div>
            )}
            {userProfile.location && (
              <div className="text-sm text-muted-foreground">
                📍 {userProfile.location}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!isOwnProfile ? (
              <>
                <Button
                  onClick={handleFollowToggle}
                  variant={isFollowing ? "outline" : "default"}
                  className="flex-1 h-8 text-sm font-semibold"
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                <Button
                  onClick={handleMessage}
                  variant="outline"
                  className="flex-1 h-8 text-sm font-semibold"
                >
                  Message
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="flex-1 h-8 text-sm font-semibold"
                >
                  Edit profile
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-8 text-sm font-semibold"
                >
                  Share profile
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full grid grid-cols-2 h-12 rounded-none border-t">
            <TabsTrigger value="posts" className="gap-2">
              <Grid3x3 className="w-4 h-4" />
              <span className="hidden sm:inline">POSTS</span>
            </TabsTrigger>
            <TabsTrigger value="tagged" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">TAGGED</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-0">
            <PostGrid userId={userId} />
          </TabsContent>

          <TabsContent value="tagged" className="mt-0 p-12 text-center">
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-full border-2 border-foreground mx-auto flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-lg">No tagged posts</h3>
              <p className="text-sm text-muted-foreground">
                Posts that {userProfile.name} has been tagged in will appear
                here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Followers Modal */}
      <FollowersModal
        isOpen={followersModalOpen}
        onClose={() => setFollowersModalOpen(false)}
        userId={parseInt(userId)}
        type="followers"
        onFollowChange={handleFollowChange}
        isOwnProfile={isOwnProfile}
      />

      {/* Following Modal */}
      <FollowersModal
        isOpen={followingModalOpen}
        onClose={() => setFollowingModalOpen(false)}
        userId={parseInt(userId)}
        type="following"
        onFollowChange={handleFollowChange}
        isOwnProfile={isOwnProfile}
      />
    </div>
  );
}
