"use client";

import { Loader2 } from "lucide-react";
import { Contributor, ContributorCardProps } from "./types";
import { ContributorCard } from "./ContributorCard";

interface TopContributorsListProps {
  contributors: Contributor[];
  isLoading: boolean;
  isLoggedIn: boolean;
  onFollow: (contributor: Contributor) => void;
}

export function TopContributorsList({
  contributors,
  isLoading,
  isLoggedIn,
  onFollow,
}: TopContributorsListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (contributors.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No contributors yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contributors.map((contributor, index) => (
        <ContributorCard
          key={contributor.userId}
          contributor={contributor}
          index={index}
          isLoggedIn={isLoggedIn}
          onFollow={onFollow}
        />
      ))}
    </div>
  );
}
