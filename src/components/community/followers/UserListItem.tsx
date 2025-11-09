"use client";

import { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface FollowerUser {
  id: number;
  userId: number;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
}

interface UserListItemProps {
  user: FollowerUser;
  isFollowing: boolean;
  isCurrentUser: boolean;
  onFollowToggle: (userId: number) => void;
  onRemove?: (userId: number) => void;
  isOwnProfile?: boolean;
  type?: "followers" | "following";
}

/**
 * Reusable list item component for followers/following lists
 * Memoized to prevent unnecessary re-renders
 */
export const UserListItem = memo(function UserListItem({
  user,
  isFollowing,
  isCurrentUser,
  onFollowToggle,
  onRemove,
  isOwnProfile = false,
  type = "followers",
}: UserListItemProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-cyan-400/5 transition-colors">
      {/* User Info */}
      <Link href={`/community/profile/${user.userId}`} className="flex-1">
        <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:opacity-90 transition-opacity">
          <Avatar className="w-11 h-11 ring-2 ring-cyan-400/30 hover:ring-cyan-400/50 transition-all">
            {user.avatarUrl && (
              <AvatarImage
                src={user.avatarUrl}
                alt={user.displayName}
              />
            )}
            <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white font-semibold">
              {user.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate text-white">
              {user.displayName}
            </p>
            {user.bio && (
              <p className="text-xs text-blue-200/60 truncate">
                {user.bio}
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* Action Button */}
      {!isCurrentUser && (
        <div className="ml-3">
          {type === "followers" && isOwnProfile && onRemove ? (
            // Remove button for own followers
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(user.userId)}
              className="text-sm font-semibold text-cyan-300 hover:text-cyan-200 hover:bg-cyan-400/10 transition-colors"
            >
              Remove
            </Button>
          ) : (
            // Follow/Following button
            <Button
              variant={isFollowing ? "outline" : "default"}
              size="sm"
              onClick={() => onFollowToggle(user.userId)}
              className={`text-sm font-semibold min-w-[90px] transition-all ${
                isFollowing
                  ? "bg-transparent border-2 border-cyan-400/50 text-cyan-200 hover:border-cyan-400/70 hover:bg-cyan-400/10"
                  : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700 shadow-lg shadow-cyan-500/30"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
});

UserListItem.displayName = "UserListItem";

