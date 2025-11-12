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
    <div className="px-4 py-8 space-y-6">
      {/* Avatar + Stats Row */}
      <div className="flex items-center gap-8 mb-6">
        {/* Avatar */}
        <div className="relative group">
          <Avatar className="w-24 h-24 md:w-28 md:h-28 ring-4 ring-cyan-400/30 group-hover:ring-cyan-400/50 transition-all shadow-lg shadow-cyan-500/20">
            <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
            <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-cyan-400 to-blue-500 text-white">
              {userProfile.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 rounded-full bg-cyan-400/0 group-hover:bg-cyan-400/10 transition-colors" />
        </div>

        {/* Stats */}
        <div className="flex-1 grid grid-cols-3 gap-4">
          {stats.map(({ k, v, onClick }) => (
            <button
              key={k}
              onClick={onClick}
              className="rounded-2xl p-3 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 hover:from-cyan-400/20 hover:to-blue-400/20 border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-300 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 group cursor-pointer"
            >
              <div className="text-2xl font-bold text-white">
                {k === "followers" ? v.toLocaleString() : v}
              </div>
              <div className="text-[10px] tracking-widest uppercase text-blue-200/70 font-semibold group-hover:text-blue-200 transition-colors">
                {k}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bio Section */}
      <div className="space-y-2 mb-8">
        <div className="font-bold text-2xl md:text-3xl text-white">
          {userProfile.name}
        </div>
        {userProfile.bio && (
          <div className="text-sm text-slate-100 leading-relaxed whitespace-pre-wrap">
            {userProfile.bio}
          </div>
        )}
        {userProfile.location && (
          <div className="text-sm text-slate-200 flex items-center gap-2">
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
              className={`flex-1 h-10 text-sm font-semibold rounded-lg transition-all duration-300 ${
                isFollowing
                  ? "bg-gradient-to-r from-cyan-500/40 to-blue-500/40 text-white border border-cyan-400/50 hover:from-cyan-500/60 hover:to-blue-500/60 hover:border-cyan-400/70 hover:shadow-lg hover:shadow-cyan-500/30"
                  : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700 hover:shadow-lg hover:shadow-cyan-500/40"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
            {/* <Button
              onClick={onMessage}
              className="flex-1 h-10 text-sm font-semibold rounded-lg bg-gradient-to-r from-cyan-500/40 to-blue-500/40 text-white border border-cyan-400/50 hover:from-cyan-500/60 hover:to-blue-500/60 hover:border-cyan-400/70 hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
            >
              Message
            </Button> */}
            <Button
              onClick={onShare}
              className="h-10 w-10 rounded-lg bg-gradient-to-r from-cyan-500/40 to-blue-500/40 text-cyan-200 border border-cyan-400/50 hover:from-cyan-500/60 hover:to-blue-500/60 hover:border-cyan-400/70 hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 p-0 flex items-center justify-center"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => router.push("/settings/profile")}
              className="flex-1 h-10 text-sm font-semibold rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700 hover:shadow-lg hover:shadow-cyan-500/40 transition-all duration-300"
            >
              Edit Profile
            </Button>
            <Button
              onClick={onShare}
              className="flex-1 h-10 text-sm font-semibold rounded-lg bg-gradient-to-r from-cyan-500/40 to-blue-500/40 text-white border border-cyan-400/50 hover:from-cyan-500/60 hover:to-blue-500/60 hover:border-cyan-400/70 hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
            >
              Share Profile
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
