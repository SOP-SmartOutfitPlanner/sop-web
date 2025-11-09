"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/ui/glass-card";

interface UserProfileHeaderProps {
  coverPhoto: string;
  avatar: string;
  name: string;
  isOwnProfile: boolean;
  stats?: {
    posts: number;
    followers: number;
    following: number;
  };
}

/**
 * Profile Header - Cover photo + Avatar with centered layout
 */
export function UserProfileHeader({
  coverPhoto,
  avatar,
  name,
  isOwnProfile,
  stats,
}: UserProfileHeaderProps) {
  return (
    <GlassCard padding="0" className="overflow-hidden">
      {/* Cover Photo */}
      <div className="relative h-[240px] md:h-[320px] bg-gradient-to-br from-cyan-900/20 via-blue-900/10 to-indigo-900/5">
        <Image
          src={coverPhoto}
          alt="Cover"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Avatar & Info Section - Centered */}
      <div className="relative px-6 py-8 flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="relative -mt-24 mb-6 group">
          <Avatar className="w-36 h-36 md:w-44 md:h-44 border-4 border-cyan-400/30 shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-400/30 group-hover:ring-cyan-400/50 transition-all">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="text-5xl font-bold bg-gradient-to-br from-cyan-400 to-blue-500 text-white">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Edit Avatar Button */}
          {isOwnProfile && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute bottom-3 right-3 rounded-full w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-2 border-white shadow-lg"
            >
              <Camera className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Name */}
        <div className="mb-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 via-blue-200 to-cyan-200 mb-1">
            {name}
          </h1>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-6 mb-6 w-full max-w-xs">
            <div className="text-center">
              <div className="text-white font-bold text-2xl mb-1">
                {stats.posts}
              </div>
              <div className="text-white/70 text-xs font-semibold uppercase tracking-wide">
                Posts
              </div>
            </div>
            <div className="text-center">
              <div className="text-white font-bold text-2xl mb-1">
                {stats.followers}
              </div>
              <div className="text-white/70 text-xs font-semibold uppercase tracking-wide">
                Followers
              </div>
            </div>
            <div className="text-center">
              <div className="text-white font-bold text-2xl mb-1">
                {stats.following}
              </div>
              <div className="text-white/70 text-xs font-semibold uppercase tracking-wide">
                Following
              </div>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
