import { useState, useEffect } from "react";
import { communityAPI } from "@/lib/api/community-api";
import { userAPI } from "@/lib/api/user-api";
import { toast } from "sonner";

interface UserProfileData {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  location: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isStylist: boolean;
  role?: number; // Add role to check if user is stylist
  styles: string[];
  isStylistVerified?: boolean; // Additional check via stylist endpoint
}

export function useUserProfile(userId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const numericUserId = parseInt(userId, 10);

        // Parallel API calls
        const [userResponse, postsResponse, followersCount, followingCount] =
          await Promise.all([
            userAPI.getUserById(numericUserId),
            communityAPI.getPostsByUser(numericUserId, 1, 1),
            communityAPI.getFollowerCount(numericUserId),
            communityAPI.getFollowingCount(numericUserId),
          ]);

        const userData = userResponse.data;

        const styles =
          userData.userStyles?.map((style) => style.styleName) ?? [];

        // Try to verify if user is stylist by calling stylist endpoint
        // If endpoint succeeds, user is definitely a stylist
        let isStylistVerified = Boolean(userData.isStylist);
        try {
          // Try to fetch stylist profile - if successful, user is a stylist
          await userAPI.getStylistProfile(numericUserId);
          isStylistVerified = true;
        } catch (error) {
          // If endpoint fails, user might not be a stylist
          // But we still check isStylist flag and role
          isStylistVerified = Boolean(userData.isStylist);
        }

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
          followersCount: followersCount || 0,
          followingCount: followingCount || 0,
          postsCount: postsResponse.metaData.totalCount || 0,
          isStylist: isStylistVerified || Boolean(userData.isStylist),
          role: userData.role, // Add role from API
          styles,
          isStylistVerified,
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Không thể tải thông tin người dùng");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const refreshCounts = async () => {
    try {
      const numericUserId = parseInt(userId);
      const [followersCount, followingCount] = await Promise.all([
        communityAPI.getFollowerCount(numericUserId),
        communityAPI.getFollowingCount(numericUserId),
      ]);

      setUserProfile((prev) =>
        prev ? { ...prev, followersCount, followingCount } : prev
      );
    } catch (error) {
      console.error("Error refreshing counts:", error);
    }
  };

  return { userProfile, isLoading, refreshCounts, setUserProfile };
}

