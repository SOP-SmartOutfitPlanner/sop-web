import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { communityAPI, CommunityPost } from "@/lib/api/community-api";
import { toast } from "sonner";

export function useFeedFollowStatus(
  posts: CommunityPost[],
  currentUserId?: string
) {
  const queryClient = useQueryClient();
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});

  // Fetch follow status for all unique users in posts
  useEffect(() => {
    const fetchFollowStatuses = async () => {
      if (!currentUserId || posts.length === 0) return;

      try {
        const userId = parseInt(currentUserId);

        // Get unique user IDs from posts (exclude own posts)
        const uniqueUserIds = Array.from(
          new Set(
            posts
              .map((post) => post.userId)
              .filter((postUserId) => postUserId !== userId)
          )
        );

        if (uniqueUserIds.length === 0) return;

        // Fetch follow status for each unique user
        const statusPromises = uniqueUserIds.map(async (targetUserId) => {
          try {
            const status = await communityAPI.getFollowStatus(
              userId,
              targetUserId
            );
            return { userId: targetUserId.toString(), status };
          } catch (error) {
            console.error(
              `Error fetching follow status for user ${targetUserId}:`,
              error
            );
            return { userId: targetUserId.toString(), status: false };
          }
        });

        const statuses = await Promise.all(statusPromises);

        // Build status map
        const statusMap: Record<string, boolean> = {};
        statuses.forEach(({ userId, status }) => {
          statusMap[userId] = status;
        });

        setFollowingStatus(statusMap);
      } catch (error) {
        console.error("Error fetching follow statuses:", error);
      }
    };

    fetchFollowStatuses();
  }, [posts, currentUserId]);

  // Handle follow toggle
  const handleFollow = useCallback(
    async (targetUserId: string) => {
      if (!currentUserId) {
        toast.error("Vui lòng đăng nhập để follow");
        return;
      }

      try {
        const followerId = parseInt(currentUserId);
        const followingId = parseInt(targetUserId);

        // Optimistic update
        const prevStatus = followingStatus[targetUserId];
        setFollowingStatus((prev) => ({ ...prev, [targetUserId]: !prevStatus }));

        const response = await communityAPI.toggleFollow(
          followerId,
          followingId
        );

        // Show API response message
        if (response.message) {
          toast.success(response.message);
        }

        // Broadcast to other components
        window.dispatchEvent(
          new CustomEvent("followStatusChanged", {
            detail: {
              userId: followingId,
              isFollowing: !prevStatus,
            },
          })
        );

        // 🔄 Invalidate React Query cache to refetch posts with updated isFollowing
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        queryClient.invalidateQueries({ queryKey: ["userPosts"] });
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      } catch (error) {
        console.error("Error following user:", error);
        // Rollback
        setFollowingStatus((prev) => ({
          ...prev,
          [targetUserId]: !followingStatus[targetUserId],
        }));
        const errorMessage =
          error instanceof Error ? error.message : "Không thể theo dõi";
        toast.error(errorMessage);
      }
    },
    [currentUserId, followingStatus, queryClient]
  );

  return { followingStatus, handleFollow };
}

