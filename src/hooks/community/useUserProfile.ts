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
  styles: string[];
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
          isStylist: Boolean(userData.isStylist),
          styles,
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

