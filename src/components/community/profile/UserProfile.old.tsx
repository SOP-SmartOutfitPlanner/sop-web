"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  UserPlus,
  UserMinus,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/ui/glass-card";
import { useAuthStore } from "@/store/auth-store";
import { UserProfileHeader } from "./UserProfileHeader";
import { UserProfileStats } from "./UserProfileStats";
import { UserProfilePosts } from "./UserProfilePosts";
import { communityAPI } from "@/lib/api/community-api";
import { userAPI } from "@/lib/api/user-api";
import { toast } from "sonner";

interface UserProfileProps {
  userId: string;
}

interface UserProfileData {
  id: string;
  name: string;
  avatar: string;
  coverPhoto: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

/**
 * User Profile Component - Similar to Facebook profile
 * Shows: Cover photo, avatar, name, followers, following, posts
 */
export function UserProfile({ userId }: UserProfileProps) {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);

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

        // TODO: Temporarily disabled follow API (has bugs)
        // const [followersCount, followingCount, isFollowingUser] =
        //   await Promise.all([
        //     communityAPI.getFollowerCount(numericUserId),
        //     communityAPI.getFollowingCount(numericUserId),
        //     currentUser?.id
        //       ? communityAPI.isFollowing(
        //           parseInt(currentUser.id.toString(), 10),
        //           numericUserId
        //         )
        //       : Promise.resolve(false),
        //   ]);

        setUserProfile({
          id: userId,
          name: userData.displayName,
          avatar:
            userData.avtUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              userData.displayName
            )}&background=3B82F6&color=fff`,
          coverPhoto:
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop",
          followersCount: 423, // Mock data - API temporarily disabled
          followingCount: 346, // Mock data - API temporarily disabled
          postsCount: postsResponse.metaData.totalCount,
        });

        // setIsFollowing(isFollowingUser);
        setIsFollowing(false); // Default to not following
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Không thể tải thông tin người dùng");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, currentUser?.id]);

  const handleFollowToggle = async () => {
    if (!currentUser?.id) {
      toast.error("Vui lòng đăng nhập để theo dõi");
      return;
    }

    // TODO: Temporarily disabled - follow API has bugs
    // Mock behavior for now
    setIsFollowing(!isFollowing);

    if (!isFollowing) {
      setUserProfile((prev) =>
        prev ? { ...prev, followersCount: prev.followersCount + 1 } : prev
      );
      toast.success("Đã theo dõi (mock)");
    } else {
      setUserProfile((prev) =>
        prev ? { ...prev, followersCount: prev.followersCount - 1 } : prev
      );
      toast.success("Đã bỏ theo dõi (mock)");
    }

    /* TODO: Enable when API is fixed
    try {
      const followerId = parseInt(currentUser.id.toString(), 10);
      const followingId = parseInt(userId, 10);

      if (isFollowing) {
        // Unfollow
        await communityAPI.unfollowUser(followerId, followingId);
        setIsFollowing(false);
        setUserProfile((prev) =>
          prev
            ? { ...prev, followersCount: prev.followersCount - 1 }
            : prev
        );
        toast.success("Đã bỏ theo dõi");
      } else {
        // Follow
        await communityAPI.followUser(followerId, followingId);
        setIsFollowing(true);
        setUserProfile((prev) =>
          prev
            ? { ...prev, followersCount: prev.followersCount + 1 }
            : prev
        );
        toast.success("Đã theo dõi");
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast.error("Không thể thực hiện hành động");
    }
    */
  };

  const handleMessage = () => {
    // TODO: Open chat with user
    console.log("Open chat with", userId);
  };

  // Loading state
  if (isLoading || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/10">
        <div className="container mx-auto max-w-5xl px-4 py-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Đang tải thông tin...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/10">
      <div className="container mx-auto max-w-5xl px-4 py-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <UserProfileHeader
            coverPhoto={userProfile.coverPhoto}
            avatar={userProfile.avatar}
            name={userProfile.name}
            isOwnProfile={isOwnProfile}
          />
        </motion.div>

        {/* Stats & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <GlassCard padding="1.5rem">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Stats */}
              <UserProfileStats
                followersCount={userProfile.followersCount}
                followingCount={userProfile.followingCount}
                postsCount={userProfile.postsCount}
              />

              {/* Action Buttons */}
              {!isOwnProfile && (
                <div className="flex gap-3">
                  <Button
                    onClick={handleFollowToggle}
                    variant={isFollowing ? "outline" : "default"}
                    className="gap-2"
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="w-4 h-4" />
                        Bỏ theo dõi
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Theo dõi
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleMessage}
                    variant="outline"
                    className="gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Nhắn tin
                  </Button>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* User Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <UserProfilePosts userId={userId} userName={userProfile.name} />
        </motion.div>
      </div>
    </div>
  );
}
