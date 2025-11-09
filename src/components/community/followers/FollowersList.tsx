"use client";

import { Loader2 } from "lucide-react";
import { UserListItem } from "./UserListItem";

interface FollowerUser {
  id: number;
  userId: number;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  createdDate: string;
}

interface FollowersListProps {
  users: FollowerUser[];
  isLoading: boolean;
  followingStatus: Record<number, boolean>;
  currentUserId?: string;
  isOwnProfile?: boolean;
  type?: "followers" | "following";
  onFollowToggle: (userId: number) => void;
  onRemove?: (userId: number) => void;
}

/**
 * Extracted list rendering component
 * Handles empty states, loading, and list rendering
 */
export function FollowersList({
  users,
  isLoading,
  followingStatus,
  currentUserId,
  isOwnProfile = false,
  type = "followers",
  onFollowToggle,
  onRemove,
}: FollowersListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400/50" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-blue-200/60">
        {type === "followers" ? "No followers yet" : "Not following anyone"}
      </div>
    );
  }

  return (
    <div className="divide-y divide-cyan-400/10">
      {users.map((user) => {
        const isCurrentUser = currentUserId === user.userId.toString();
        const isFollowing = followingStatus[user.userId];

        return (
          <UserListItem
            key={user.id}
            user={user}
            isFollowing={isFollowing || false}
            isCurrentUser={isCurrentUser}
            isOwnProfile={isOwnProfile}
            type={type}
            onFollowToggle={onFollowToggle}
            onRemove={onRemove}
          />
        );
      })}
    </div>
  );
}

