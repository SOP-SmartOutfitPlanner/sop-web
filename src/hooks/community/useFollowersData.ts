import { useState, useEffect, useCallback } from "react";
import { communityAPI } from "@/lib/api/community-api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";

interface FollowerUser {
  id: number;
  userId: number;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  createdDate: string;
}

interface UseFollowersDataProps {
  userId: number;
  type: "followers" | "following";
  isOwnProfile?: boolean;
}

/**
 * Custom hook for followers/following list data management
 * Handles fetching, filtering, searching, and follow status
 */
export function useFollowersData({
  userId,
  type,
  isOwnProfile = false,
}: UseFollowersDataProps) {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<FollowerUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<FollowerUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [followingStatus, setFollowingStatus] = useState<Record<number, boolean>>({});

  // Fetch users list
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);

      let userList: FollowerUser[] = [];

      try {
        if (type === "followers") {
          const result = await communityAPI.getFollowersList(userId, 1, 50);
          userList = Array.isArray(result) ? result : [];
        } else {
          const result = await communityAPI.getFollowingList(userId, 1, 50);
          userList = Array.isArray(result) ? result : [];
        }
      } catch (apiError) {
        console.error("[useFollowersData] API error:", apiError);
        userList = [];
      }

      setUsers(userList);
      setFilteredUsers(userList);

      // Set follow status
      if (currentUser?.id && userList.length > 0) {
        const currentUserId = parseInt(currentUser.id);

        if (type === "following") {
          // In "following" list, already following all
          const statusMap: Record<number, boolean> = {};
          userList.forEach((u) => {
            statusMap[u.userId] = true;
          });
          setFollowingStatus(statusMap);
        } else {
          // In "followers" list, check follow status
          const statusPromises = userList.map((u) =>
            communityAPI
              .getFollowStatus(currentUserId, u.userId)
              .then((status) => ({ userId: u.userId, status }))
              .catch(() => ({ userId: u.userId, status: false }))
          );
          const statuses = await Promise.all(statusPromises);
          const statusMap: Record<number, boolean> = {};
          statuses.forEach(({ userId, status }) => {
            statusMap[userId] = status;
          });
          setFollowingStatus(statusMap);
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Không thể tải danh sách");
    } finally {
      setIsLoading(false);
    }
  }, [userId, type, currentUser?.id]);

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users by search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (user) =>
          user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  // Handle follow/unfollow
  const handleFollowToggle = useCallback(
    async (targetUserId: number) => {
      if (!currentUser?.id) {
        toast.error("Vui lòng đăng nhập");
        return;
      }

      try {
        const followerId = parseInt(currentUser.id);
        const isFollowing = followingStatus[targetUserId];

        // Optimistic update
        setFollowingStatus((prev) => ({
          ...prev,
          [targetUserId]: !isFollowing,
        }));

        const response = await communityAPI.toggleFollow(followerId, targetUserId);

        // Show API response message
        if (response.message) {
          toast.success(response.message);
        }

        // Remove from following list if unfollowing
        if (!isFollowing === false && type === "following") {
          setUsers((prev) => prev.filter((u) => u.userId !== targetUserId));
          setFilteredUsers((prev) => prev.filter((u) => u.userId !== targetUserId));
        }
      } catch (error) {
        console.error("Error toggling follow:", error);
        // Rollback
        setFollowingStatus((prev) => ({
          ...prev,
          [targetUserId]: !prev[targetUserId],
        }));
        const errorMessage =
          error instanceof Error ? error.message : "Không thể thực hiện thao tác";
        toast.error(errorMessage);
      }
    },
    [currentUser?.id, followingStatus, type]
  );

  return {
    users,
    filteredUsers,
    searchQuery,
    setSearchQuery,
    isLoading,
    followingStatus,
    handleFollowToggle,
    isOwnProfile,
  };
}

