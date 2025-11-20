import { Share2 } from "lucide-react";
import { Image as AntImage } from "antd";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type ProfileSection = "posts" | "collections";

interface ProfileInfoProps {
  userProfile: {
    name: string;
    avatar: string;
    bio: string;
    location: string;
    postsCount: number;
    followersCount: number;
    followingCount: number;
    styles?: string[];
  };
  isOwnProfile: boolean;
  isFollowing: boolean;
  isStylist: boolean;
  onFollowToggle: () => void;
  onShare: () => void;
  onFollowersClick: () => void;
  onFollowingClick: () => void;
  activeSection?: ProfileSection;
  onSectionChange?: (section: ProfileSection) => void;
}

export function ProfileInfo(props: ProfileInfoProps) {
  const {
    userProfile,
    isOwnProfile,
    isFollowing,
    isStylist,
    onFollowToggle,
    onShare,
    onFollowersClick,
    onFollowingClick,
    activeSection = "posts",
    onSectionChange,
  } = props;
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
    <div className="px-4 py-10 space-y-10">
      {/* Avatar + Stats Row */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="w-24 h-24 md:w-28 md:h-28 ring-4 ring-cyan-400/30 group-hover:ring-cyan-400/50 transition-all shadow-lg shadow-cyan-500/20 rounded-full overflow-hidden bg-slate-900/70 border border-white/10">
              {userProfile.avatar ? (
                <AntImage
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="h-full w-full"
                  style={{
                    height: "100%",
                    width: "100%",
                    objectFit: "cover",
                    borderRadius: "9999px",
                  }}
                  preview={{
                    mask: (
                      <div className="text-xs uppercase tracking-[0.3em] text-white">
                        Preview
                      </div>
                    ),
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl font-bold bg-gradient-to-br from-cyan-400 to-blue-500 text-white">
                  {userProfile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white">
              {userProfile.name}
            </div>
            {userProfile.location && (
              <p className="text-sm text-slate-300 flex items-center gap-2">
                📍 {userProfile.location}
              </p>
            )}
          </div>
        </div>
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map(({ k, v, onClick }) => (
            <button
              key={k}
              onClick={onClick}
              className="rounded-2xl px-4 py-3 bg-slate-900/60 border border-white/10 hover:border-cyan-400/40 transition-all duration-300 text-left shadow-lg shadow-indigo-900/40"
            >
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                {k}
              </p>
              <p className="text-2xl font-bold text-white">
                {k === "followers" ? v.toLocaleString() : v}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Bio Section */}
      <div className="space-y-4">
        {userProfile.bio && (
          <div className="text-sm text-slate-100 leading-relaxed whitespace-pre-wrap">
            {userProfile.bio}
          </div>
        )}
        {userProfile.styles && userProfile.styles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {userProfile.styles.map((style) => (
              <span
                key={style}
                className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-100"
              >
                {style}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        {!isOwnProfile ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              onClick={onFollowToggle}
              className={cn(
                "h-12 rounded-xl text-sm font-semibold transition-all duration-300",
                isFollowing
                  ? "bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-white border border-cyan-400/50 hover:from-cyan-500/50 hover:to-blue-500/50"
                  : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700"
              )}
            >
              {isFollowing ? "Following" : "Follow Stylist"}
            </Button>
            <Button
              onClick={onShare}
              variant="outline"
              className="h-12 rounded-xl border-cyan-400/40 bg-slate-900/40 text-cyan-100 hover:bg-slate-900/60"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Profile
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              onClick={() => router.push("/settings/profile")}
              className="h-12 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700"
            >
              Edit Profile
            </Button>
            <Button
              onClick={onShare}
              variant="outline"
              className="h-12 rounded-xl border-cyan-400/40 bg-slate-900/40 text-cyan-100 hover:bg-slate-900/60"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Profile
            </Button>
          </div>
        )}
      </div>

      {isStylist && onSectionChange && (
        <div className="pt-4">
          <div className="flex overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-900/30 shadow-lg shadow-cyan-500/15">
            {(["posts", "collections"] as ProfileSection[]).map((section) => {
              const isActive = activeSection === section;
              return (
                <button
                  key={section}
                  onClick={() => onSectionChange(section)}
                  className={cn(
                    "relative flex-1 py-3 text-sm font-semibold uppercase tracking-[0.4em] transition-all duration-300",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50",
                    isActive
                      ? "text-white bg-gradient-to-r from-cyan-500/20 to-blue-500/20"
                      : "text-slate-300 hover:text-white"
                  )}
                >
                  {section === "posts" ? "Posts" : "Collections"}
                  <span
                    className={cn(
                      "pointer-events-none absolute inset-x-10 bottom-2 w-30 mx-auto h-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300",
                      isActive
                        ? "opacity-100 scale-x-100"
                        : "opacity-0 scale-x-75"
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
