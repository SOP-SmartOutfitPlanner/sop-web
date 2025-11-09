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
    <div className="flex items-center justify-between">
      {/* Profile Info */}
      <div className="flex items-center gap-3">
        <div className="relative">
          {/* Avatar */}
          <Avatar
            className="w-8 h-8 cursor-pointer hover:opacity-80 transition-opacity"
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
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm">
              {contributor.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Rank Badge */}
          {index < 3 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">{index + 1}</span>
            </div>
          )}
        </div>

        {/* Name & Post Count */}
        <div>
          <Link href={`/community/profile/${contributor.userId}`}>
            <p className="font-medium text-sm text-foreground hover:underline cursor-pointer">
              {contributor.displayName}
            </p>
          </Link>
          <p className="text-xs text-muted-foreground">
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
            variant="outline"
            className="h-7 px-2"
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
