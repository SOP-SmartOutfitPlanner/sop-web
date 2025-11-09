"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useModalState } from "@/hooks/common/useModalState";
import { useFollowersData } from "@/hooks/community/useFollowersData";
import { FollowersList } from "@/components/community/followers/FollowersList";
import { useAuthStore } from "@/store/auth-store";

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  type: "followers" | "following";
  onFollowChange?: () => void;
  isOwnProfile?: boolean;
}

/**
 * ✅ OPTIMIZED: Followers/Following Modal
 * - Uses useFollowersData hook for data management
 * - Uses FollowersList component for rendering
 * - Reduced from ~280 lines to ~120 lines
 * - Clean separation of concerns
 */
export function FollowersModal({
  isOpen,
  onClose,
  userId,
  type,
  onFollowChange,
  isOwnProfile = false,
}: FollowersModalProps) {
  const { user: currentUser } = useAuthStore();

  // Use custom hook for followers data
  const {
    filteredUsers,
    searchQuery,
    setSearchQuery,
    isLoading,
    followingStatus,
    handleFollowToggle,
  } = useFollowersData({
    userId,
    type,
    isOwnProfile,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="text-center">
            {type === "followers" ? "Followers" : "Following"}
          </DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        <div className="px-4 py-2 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-0"
            />
          </div>
        </div>

        {/* User List */}
        <div className="max-h-[400px] overflow-y-auto">
          <FollowersList
            users={filteredUsers}
            isLoading={isLoading}
            followingStatus={followingStatus}
            currentUserId={currentUser?.id}
            isOwnProfile={isOwnProfile}
            type={type}
            onFollowToggle={handleFollowToggle}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
