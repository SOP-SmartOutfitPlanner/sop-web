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
}

/**
 * Profile Header - Cover photo + Avatar similar to Facebook
 */
export function UserProfileHeader({
  coverPhoto,
  avatar,
  name,
  isOwnProfile,
}: UserProfileHeaderProps) {
  return (
    <GlassCard padding="0" className="overflow-hidden">
      {/* Cover Photo */}
      <div className="relative h-[240px] md:h-[320px] bg-gradient-to-br from-primary/20 to-primary/10">
        <Image
          src={coverPhoto}
          alt="Cover"
          fill
          className="object-cover"
          priority
        />

        {/* Edit Cover Button */}
      </div>

      {/* Avatar & Name Section */}
      <div className="relative px-6 pb-4">
        {/* Avatar */}
        <div className="relative -mt-20 mb-4">
          <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="text-3xl font-bold">
              {name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          {/* Edit Avatar Button */}
          {isOwnProfile && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute bottom-2 right-2 rounded-full w-10 h-10"
            >
              <Camera className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Name */}
        <div>
          <h1 className="text-3xl font-bricolage font-bold text-foreground">
            {name}
          </h1>
        </div>
      </div>
    </GlassCard>
  );
}
