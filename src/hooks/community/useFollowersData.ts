import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { communityAPI, FollowerUser } from "@/lib/api/community-api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";

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
  const queryClient = useQueryClient();
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

      // Build followingStatus map from API's isFollowing field
      // This is more efficient than making N separate API calls
      if (userList.length > 0) {
        const statusMap: Record<number, boolean> = {};
        userList.forEach((user) => {
          // Use isFollowing from API response (already calculated by backend)
          statusMap[user.userId] = user.isFollowing ?? false;
        });
        setFollowingStatus(statusMap);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Không thể tải danh sách");
    } finally {
      setIsLoading(false);
    }
  }, [userId, type]);

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
        // Response structure: { statusCode, message, data }
        const message = response?.message || (isFollowing ? "Unfollowed successfully" : "Followed successfully");
        toast.success(message);

        // Broadcast to other components
        window.dispatchEvent(
          new CustomEvent("followStatusChanged", {
            detail: {
              userId: targetUserId,
              isFollowing: !isFollowing,
            },
          })
        );

        // 🔄 Invalidate React Query cache to refetch posts with updated isFollowing
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        queryClient.invalidateQueries({ queryKey: ["userPosts"] });
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });

        // Remove from following list ONLY if:
        // 1. This is OWN profile (isOwnProfile = true)
        // 2. AND we're in "following" tab
        // 3. AND we just unfollowed (isFollowing was true, now false)
        if (isOwnProfile && type === "following" && isFollowing) {
          setUsers((prev) => prev.filter((u) => u.userId !== targetUserId));
          setFilteredUsers((prev) => prev.filter((u) => u.userId !== targetUserId));
        }
      } catch (error) {
        console.error("Error toggling follow:", error);
        // Rollback optimistic update
        setFollowingStatus((prev) => ({
          ...prev,
          [targetUserId]: !prev[targetUserId],
        }));
        const errorMessage =
          error instanceof Error ? error.message : "Không thể thực hiện thao tác";
        toast.error(errorMessage);
      }
    },
    [currentUser?.id, followingStatus, type, isOwnProfile, queryClient]
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

