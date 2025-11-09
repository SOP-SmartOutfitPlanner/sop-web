"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Loader2 } from "lucide-react";
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

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  type: "followers" | "following";
  onFollowChange?: () => void; // Callback when follow status changes
  isOwnProfile?: boolean; // Whether viewing own profile
}

export function FollowersModal({
  isOpen,
  onClose,
  userId,
  type,
  onFollowChange,
  isOwnProfile = false,
}: FollowersModalProps) {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<FollowerUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<FollowerUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [followingStatus, setFollowingStatus] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, userId, type]);

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

  const fetchUsers = async () => {
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
        console.error('[FollowersModal] API error:', apiError);
        userList = [];
      }

      
      setUsers(userList);
      setFilteredUsers(userList);

      // Set following status based on list type
      if (currentUser?.id && userList.length > 0) {
        const currentUserId = parseInt(currentUser.id);
        
        if (type === "following") {
          // In "following" list, we're already following all users
          const statusMap: Record<number, boolean> = {};
          userList.forEach((u) => {
            statusMap[u.userId] = true;
          });
          setFollowingStatus(statusMap);
        } else {
          // In "followers" list, need to check if we follow them back
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
  };

  const handleFollowToggle = async (targetUserId: number) => {
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

      // Show toast based on response
      if (response.message?.includes("Follow user successfully")) {
        toast.success("Đã theo dõi");
      } else if (response.message?.includes("Unfollow user successfully")) {
        toast.success("Đã bỏ theo dõi");
        
        // If unfollowing in "following" list, remove from list
        if (type === "following") {
          setUsers((prev) => prev.filter((u) => u.userId !== targetUserId));
          setFilteredUsers((prev) => prev.filter((u) => u.userId !== targetUserId));
        }
      }

      // Notify parent to refresh counts
      onFollowChange?.();
    } catch (error) {
      console.error("Error toggling follow:", error);
      // Rollback
      setFollowingStatus((prev) => ({
        ...prev,
        [targetUserId]: !prev[targetUserId],
      }));
      toast.error("Không thể thực hiện thao tác");
    }
  };

  const handleRemove = async (targetUserId: number) => {
    // TODO: Implement remove follower API
    toast.info("Chức năng đang phát triển");
  };

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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? "No users found" : "No users yet"}
            </div>
          ) : (
            <div className="divide-y">
              {filteredUsers.map((user) => {
                const isCurrentUser = currentUser?.id === user.userId.toString();
                const isFollowing = followingStatus[user.userId];

                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="w-11 h-11 ring-2 ring-gradient-to-br from-primary to-accent">
                        <AvatarImage
                          src={
                            user.avatarUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              user.displayName
                            )}&background=random`
                          }
                          alt={user.displayName}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                          {user.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {user.displayName}
                        </p>
                        {user.bio && (
                          <p className="text-xs text-muted-foreground truncate">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    {!isCurrentUser && (
                      <div className="ml-3">
                        {type === "followers" && isOwnProfile ? (
                          // Only show "Remove" button if viewing own followers
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(user.userId)}
                            className="text-sm font-semibold"
                          >
                            Remove
                          </Button>
                        ) : (
                          // Show Follow/Following button for everyone else
                          <Button
                            variant={isFollowing ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleFollowToggle(user.userId)}
                            className="text-sm font-semibold min-w-[90px]"
                          >
                            {isFollowing ? "Following" : "Follow"}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

