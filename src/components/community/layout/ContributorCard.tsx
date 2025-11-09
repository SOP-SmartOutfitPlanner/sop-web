"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, MessageCircle } from "lucide-react";
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
  onFollow: (contributor: Contributor) => void;
}

export function ContributorCard({
  contributor,
  index,
  isLoggedIn,
  onFollow,
}: ContributorCardProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-cyan-400/5 to-blue-400/5 hover:from-cyan-400/10 hover:to-blue-400/10 border border-cyan-400/10 hover:border-cyan-400/20 transition-all duration-300">
      {/* Profile Info */}
      <div className="flex items-center gap-3">
        <div className="relative">
          {/* Avatar */}
          <Avatar
            className="w-9 h-9 cursor-pointer ring-2 ring-cyan-400/30 hover:ring-cyan-400/50 transition-all"
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
            <p className="font-semibold text-sm bg-clip-text text-transparent bg-gradient-to-r from-cyan-100 to-blue-100 hover:underline cursor-pointer">
              {contributor.displayName}
            </p>
          </Link>
          <p className="text-xs text-blue-200/70">
            {contributor.postCount}{" "}
            {contributor.postCount === 1 ? "post" : "posts"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1">
        {isLoggedIn && !contributor.isFollowing && (
          <Button
            size="sm"
            className="h-7 px-2 bg-gradient-to-r from-cyan-500/60 to-blue-500/60 hover:from-cyan-500/80 hover:to-blue-500/80 text-white border border-cyan-400/30 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/30 transition-all rounded-md"
            onClick={() => onFollow(contributor)}
            title="Follow"
          >
            <UserPlus className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
