export interface Contributor {
  userId: number;
  displayName: string;
  avatarUrl: string;
  postCount: number;
  isFollowing?: boolean;
}

export interface ContributorCardProps {
  contributor: Contributor;
  index: number;
  isLoggedIn: boolean;
  onFollow: (contributor: Contributor) => void;
  onMessage: (contributor: Contributor) => void;
}

