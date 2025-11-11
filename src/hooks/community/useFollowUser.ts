import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { communityAPI } from "@/lib/api/community-api";
import { toast } from "sonner";

export function useFollowUser(
  targetUserId: string,
  currentUserId?: string,
  onFollowChange?: () => void
) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const toggleFollow = useCallback(async () => {
    if (!currentUserId) {
      toast.error("Vui lòng đăng nhập để theo dõi");
      return;
    }

    // Save current state for rollback
    const prevFollowingState = isFollowing;

    try {
      setIsLoading(true);
      const followerId = parseInt(currentUserId);
      const followingId = parseInt(targetUserId);

      // Optimistic update
      setIsFollowing(!isFollowing);

      // Call API
      const response = await communityAPI.toggleFollow(followerId, followingId);

      // Show API response message
      if (response.message) {
        toast.success(response.message);
      }

      // Broadcast to other components
      window.dispatchEvent(
        new CustomEvent("followStatusChanged", {
          detail: {
            userId: followingId,
            isFollowing: !prevFollowingState,
          },
        })
      );

      // Invalidate React Query cache to refetch posts with updated isFollowing
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });

      // Refresh counts if callback provided
      if (onFollowChange) {
        onFollowChange();
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      // Rollback on error
      setIsFollowing(prevFollowingState);
      // Show error message from API or generic message
      const errorMessage = error instanceof Error ? error.message : "Không thể thực hiện thao tác";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, targetUserId, isFollowing, onFollowChange, queryClient]);

  return {
    isFollowing,
    setIsFollowing,
    toggleFollow,
    isLoading,
  };
}
