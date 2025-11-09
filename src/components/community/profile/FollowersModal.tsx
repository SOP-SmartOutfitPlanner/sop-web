"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
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
      <DialogContent className="sm:max-w-md p-0 gap-0 backdrop-blur-xl bg-gradient-to-br from-cyan-950/60 via-blue-950/50 to-indigo-950/60 border-2 border-cyan-400/25 shadow-2xl shadow-cyan-500/20">
        <DialogHeader className="px-4 py-4 border-b border-cyan-400/10">
          <DialogTitle className="text-center text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-blue-200">
            {type === "followers" ? "Followers" : "Following"}
          </DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        <div className="px-4 py-3 border-b border-cyan-400/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-300/60" />
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-cyan-950/30 border border-cyan-400/20 hover:border-cyan-400/40 text-white placeholder:text-cyan-300/50 focus:placeholder:text-cyan-300/70 rounded-lg transition-all focus:ring-2 focus:ring-cyan-400/30"
            />
          </div>
        </div>

        {/* User List */}
        <div className="max-h-[480px] overflow-y-auto">
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
