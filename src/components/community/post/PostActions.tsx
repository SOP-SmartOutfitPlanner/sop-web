import { KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle } from "lucide-react";

interface PostActionsProps {
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
  onLike: () => void;
  onComment: () => void;
  onViewLikes?: () => void;
}

export function PostActions({
  isLiked,
  likeCount,
  commentCount,
  onLike,
  onComment,
  onViewLikes,
}: PostActionsProps) {
  const handleLikesKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onViewLikes) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onViewLikes();
    }
  };

  return (
    <div className="space-y-3">
      {/* Stats - Only show if there are likes or comments */}
      {(likeCount > 0 || commentCount > 0) && (
        <div className="flex items-center justify-between gap-3 px-2 py-2">
          {/* Likes Badge */}
          {likeCount > 0 && (
            <div
              className={`flex items-center gap-2 group ${
                onViewLikes ? "cursor-pointer" : ""
              }`}
              role={onViewLikes ? "button" : undefined}
              tabIndex={onViewLikes ? 0 : undefined}
              onClick={onViewLikes}
              onKeyDown={handleLikesKeyDown}
            >
              <div className="relative flex -space-x-1">
                <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center border-2 border-background shadow-lg shadow-red-500/50 group-hover:shadow-red-500/80 transition-shadow">
                  <Heart className="w-3.5 h-3.5 text-white fill-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">
                  {likeCount}
                  <span className="ml-1 text-xs text-slate-400 font-medium">
                    {likeCount === 1 ? "like" : "likes"}
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Comments Badge */}
          {commentCount > 0 && (
            <div className="flex items-center gap-2 group ml-auto">
              <div className="relative flex">
                <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center border-2 border-background shadow-lg shadow-blue-500/50 group-hover:shadow-blue-500/80 transition-shadow">
                  <MessageCircle className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">
                  {commentCount}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {/* {commentCount === 1 ? "comment" : "comments"} */}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons - Separate Dark Glass Block */}
      <div className="border-t border-slate-700/30 py-3 px-4 mt-auto backdrop-blur-lg bg-slate-900/40 rounded-b-3xl">
        <div className="flex items-center justify-around gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLike}
            className={`flex-1 gap-2 font-semibold transition-all duration-300 rounded-lg ${
              isLiked
                ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                : "text-white hover:text-cyan-300 hover:bg-cyan-500/10"
            }`}
          >
            <Heart
              className={`w-5 h-5 transition-all ${
                isLiked ? "fill-current scale-110" : ""
              }`}
            />
            <span>Like</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onComment}
            className="flex-1 gap-2 font-semibold text-white hover:text-cyan-300 hover:bg-cyan-500/10 transition-all duration-300 rounded-lg"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Comment</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
