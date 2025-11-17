"use client";

import { Users, UserPlus, ImageIcon } from "lucide-react";

interface UserProfileStatsProps {
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

/**
 * Profile Stats - Followers, Following, Posts count
 */
export function UserProfileStats({
  followersCount,
  followingCount,
  postsCount,
}: UserProfileStatsProps) {
  const stats = [
    {
      label: "Followers",
      value: followersCount,
      icon: Users,
    },
    {
      label: "Following",
      value: followingCount,
      icon: UserPlus,
    },
    {
      label: "Posts",
      value: postsCount,
      icon: ImageIcon,
    },
  ];

  return (
    <div className="flex gap-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {stat.value.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
