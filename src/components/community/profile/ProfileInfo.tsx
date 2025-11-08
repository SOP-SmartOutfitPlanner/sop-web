import { Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ProfileInfoProps {
  userProfile: {
    name: string;
    avatar: string;
    bio: string;
    location: string;
    postsCount: number;
    followersCount: number;
    followingCount: number;
  };
  isOwnProfile: boolean;
  isFollowing: boolean;
  onFollowToggle: () => void;
  onMessage: () => void;
  onShare: () => void;
  onFollowersClick: () => void;
  onFollowingClick: () => void;
}

export function ProfileInfo({
  userProfile,
  isOwnProfile,
  isFollowing,
  onFollowToggle,
  onMessage,
  onShare,
  onFollowersClick,
  onFollowingClick,
}: ProfileInfoProps) {
  const router = useRouter();
  const stats = [
    { k: "posts", v: userProfile.postsCount, onClick: undefined },
    {
      k: "followers",
      v: userProfile.followersCount,
      onClick: onFollowersClick,
    },
    {
      k: "following",
      v: userProfile.followingCount,
      onClick: onFollowingClick,
    },
  ];

  return (
    <div className="px-4 py-6">
      {/* Avatar + Stats Row */}
      <div className="flex items-center gap-6 mb-5">
        {/* Avatar */}
        <Avatar className="w-20 h-20 md:w-24 md:h-24">
          <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
          <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-accent text-white">
            {userProfile.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        {/* Stats */}
        <div className="flex-1 grid grid-cols-3 gap-3">
          {stats.map(({ k, v, onClick }) => (
            <button
              key={k}
              onClick={onClick}
              className="rounded-2xl   py-3 text-center hover:shadow-md transition-shadow"
            >
              <div className="text-lg font-semibold text-slate-900">
                {k === "followers" ? v.toLocaleString() : v}
              </div>
              <div className="text-[11px] tracking-wide uppercase text-slate-600">
                {k}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-1 mb-4">
        <div className="font-semibold text-sm">{userProfile.name}</div>
        {userProfile.bio && (
          <div className="text-sm whitespace-pre-wrap">{userProfile.bio}</div>
        )}
        {userProfile.location && (
          <div className="text-sm text-muted-foreground">
            📍 {userProfile.location}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {!isOwnProfile ? (
          <>
            <Button
              onClick={onFollowToggle}
              variant={isFollowing ? "outline" : "default"}
              className="flex-1 h-8 text-sm font-semibold"
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
            <Button
              onClick={onMessage}
              variant="outline"
              className="flex-1 h-8 text-sm font-semibold"
            >
              Message
            </Button>
            <Button
              onClick={onShare}
              variant="outline"
              size="icon"
              className="h-8 w-8"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => router.push("/settings/profile")}
              className="flex-1 h-8 text-sm font-semibold"
            >
              Edit profile
            </Button>
            <Button
              onClick={onShare}
              variant="outline"
              className="flex-1 h-8 text-sm font-semibold"
            >
              Share profile
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
