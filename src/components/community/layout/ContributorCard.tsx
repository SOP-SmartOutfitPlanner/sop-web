"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

interface Contributor {
  userId: number;
  displayName: string;
  avatarUrl: string;
  postCount: number;
  isFollowing?: boolean;
}

interface ContributorCardProps {
  contributor: Contributor;
  index: number;
  isLoggedIn: boolean;
  currentUserId?: string;
  onFollow: (contributor: Contributor) => void;
}

export function ContributorCard({
  contributor,
  index,
  isLoggedIn,
  currentUserId,
  onFollow,
}: ContributorCardProps) {
  const router = useRouter();

  // Check if this contributor is the current user (don't show follow button for self)
  const isCurrentUser =
    currentUserId && contributor.userId === parseInt(currentUserId);

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/30 hover:bg-slate-900/50 border border-slate-700/20 hover:border-slate-700/40 transition-all duration-300">
      {/* Profile Info */}
      <div className="flex items-center gap-3">
        <div className="relative">
          {/* Avatar */}
          <Avatar
            className="w-9 h-9 cursor-pointer ring-2 ring-cyan-400/20 hover:ring-cyan-400/40 transition-all"
            onClick={() =>
              router.push(`/community/profile/${contributor.userId}`)
            }
          >
            {contributor.avatarUrl && (
              <AvatarImage
                src={contributor.avatarUrl}
                alt={contributor.displayName}
              />
            )}
            <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white text-sm font-semibold">
              {contributor.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Rank Badge */}
          {index < 3 && (
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center border-2 border-background shadow-lg shadow-amber-500/50">
              <span className="text-xs text-white font-bold">{index + 1}</span>
            </div>
          )}
        </div>

        {/* Name & Post Count */}
        <div>
          <Link href={`/community/profile/${contributor.userId}`}>
            <p className="font-semibold text-sm text-white hover:text-white/80 hover:underline cursor-pointer transition-colors">
              {contributor.displayName}
            </p>
          </Link>
          <p className="text-xs text-slate-400">
            {contributor.postCount}{" "}
            {contributor.postCount === 1 ? "post" : "posts"}
          </p>
        </div>
      </div>

      {/* Actions - Follow Button */}
      {/* 
        Logic:
        - If contributor is current user: Don't show button (can't follow yourself)
        - If not following (isFollowing=false): Show "Follow" button with UserPlus icon
        - If already following (isFollowing=true): Don't show button
        - GUEST mode: Show "Follow" button, clicking will prompt login
      */}
      <div className="flex gap-1">
        {!isCurrentUser && !contributor.isFollowing && (
          <Button
            size="sm"
            className="h-7 px-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-white border border-cyan-400/20 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/20 transition-all rounded-md"
            onClick={() => onFollow(contributor)}
            title={isLoggedIn ? "Follow" : "Login to follow"}
          >
            <UserPlus className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
