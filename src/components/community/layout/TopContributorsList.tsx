"use client";

import { Contributor } from "./types";
import { ContributorCard } from "./ContributorCard";
import { TopContributorsSkeleton } from "./TopContributorsSkeleton";

interface TopContributorsListProps {
  contributors: Contributor[];
  isLoading: boolean;
  isLoggedIn: boolean;
  currentUserId?: string;
  onFollow: (contributor: Contributor) => void;
}

export function TopContributorsList({
  contributors,
  isLoading,
  isLoggedIn,
  currentUserId,
  onFollow,
}: TopContributorsListProps) {
  if (isLoading) {
    return <TopContributorsSkeleton />;
  }

  if (contributors.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No contributors yet</p>
      </div>
    );
  }

  const visibleContributors = contributors.slice(0, 5);

  return (
    <div className="space-y-4">
      {visibleContributors.map((contributor, index) => (
        <ContributorCard
          key={contributor.userId}
          contributor={contributor}
          index={index}
          isLoggedIn={isLoggedIn}
          currentUserId={currentUserId}
          onFollow={onFollow}
        />
      ))}
    </div>
  );
}
