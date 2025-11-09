import { useState, useEffect, useCallback } from "react";
import { communityAPI } from "@/lib/api/community-api";
import { Contributor } from "@/components/community/layout/types";
import { toast } from "sonner";

export function useTopContributors(currentUserId?: string) {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        const errorMessage = error instanceof Error ? error.message : "Không thể tải danh sách top contributors";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContributors();
  }, [currentUserId]);

  // Handle follow/unfollow
  const handleFollow = useCallback(
    async (contributor: Contributor) => {
      if (!currentUserId) {
        toast.error("Vui lòng đăng nhập để theo dõi");
        return;
      }

      try {
        const response = await communityAPI.toggleFollow(parseInt(currentUserId), contributor.userId);

        // Optimistic update
        setContributors((prev) =>
          prev.map((c) =>
            c.userId === contributor.userId
              ? { ...c, isFollowing: !c.isFollowing }
              : c
          )
        );

        // Show API response message
        if (response.message) {
          toast.success(response.message);
        }
      } catch (error) {
        console.error("Error following user:", error);
        const errorMessage = error instanceof Error ? error.message : "Không thể thực hiện thao tác";
        toast.error(errorMessage);
      }
    },
    [currentUserId]
  );

  return { contributors, isLoading, handleFollow };
}

