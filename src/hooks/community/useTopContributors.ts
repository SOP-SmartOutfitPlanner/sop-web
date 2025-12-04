import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { communityAPI } from "@/lib/api/community-api";
import { Contributor } from "@/components/community/layout/types";
import { toast } from "sonner";

export function useTopContributors(currentUserId?: string) {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Fetch contributors
  useEffect(() => {
    const fetchContributors = async () => {
      try {
        setIsLoading(true);
        const data = await communityAPI.getTopContributors(
          currentUserId ? parseInt(currentUserId) : undefined
        );
        setContributors(data);
      } catch (error) {
        console.error("Error fetching top contributors:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách top contributors";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContributors();
  }, [currentUserId]);

  // Listen for follow status changes from other components (PostCard, ProfilePage, etc.)
  useEffect(() => {
    const handleFollowStatusChange = (event: Event) => {
      const customEvent = event as CustomEvent<{
        userId: number;
        isFollowing: boolean;
      }>;
      const { userId, isFollowing } = customEvent.detail;

      // Update contributor follow status
      setContributors((prev) =>
        prev.map((c) => (c.userId === userId ? { ...c, isFollowing } : c))
      );
    };

    window.addEventListener("followStatusChanged", handleFollowStatusChange);

    return () => {
      window.removeEventListener(
        "followStatusChanged",
        handleFollowStatusChange
      );
    };
  }, []);

  const handleFollow = useCallback(
    async (contributor: Contributor) => {
      if (!currentUserId) {
        toast.error("Please log in to follow users.");
        return;
      }

      try {
        const response = await communityAPI.toggleFollow(
          parseInt(currentUserId),
          contributor.userId
        );

        const newFollowStatus = !contributor.isFollowing;

        // Optimistic update
        setContributors((prev) =>
          prev.map((c) =>
            c.userId === contributor.userId
              ? { ...c, isFollowing: newFollowStatus }
              : c
          )
        );

        // Broadcast to other components
        window.dispatchEvent(
          new CustomEvent("followStatusChanged", {
            detail: {
              userId: contributor.userId,
              isFollowing: newFollowStatus,
            },
          })
        );

        // Invalidate React Query cache to refetch posts with updated isFollowing
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        queryClient.invalidateQueries({ queryKey: ["userPosts"] });
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });

        if (response.message) {
          toast.success(response.message);
        }
      } catch (error) {
        console.error("Error following user:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Không thể thực hiện thao tác";
        toast.error(errorMessage);
      }
    },
    [currentUserId, queryClient]
  );

  return { contributors, isLoading, handleFollow };
}

