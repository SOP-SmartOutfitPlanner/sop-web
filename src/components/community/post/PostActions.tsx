import { Button } from "@/components/ui/button";
import { Heart, MessageCircle } from "lucide-react";

interface PostActionsProps {
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
  onLike: () => void;
  onComment: () => void;
}

export function PostActions({
  isLiked,
  likeCount,
  commentCount,
  onLike,
  onComment,
}: PostActionsProps) {
  return (
    <div className="space-y-3">
      {/* Stats - Only show if there are likes or comments */}
      {(likeCount > 0 || commentCount > 0) && (
        <div className="flex items-center justify-between gap-3 px-2 py-2 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-lg backdrop-blur-sm border border-cyan-400/20">
          {/* Likes Badge */}
          {likeCount > 0 && (
            <div className="flex items-center gap-2 group">
              <div className="relative flex -space-x-1">
                <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center border-2 border-background shadow-lg shadow-red-500/50 group-hover:shadow-red-500/80 transition-shadow">
                  <Heart className="w-3 h-3 text-white fill-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-red-400">{likeCount}</span>
                <span className="text-xs text-muted-foreground">{likeCount === 1 ? 'like' : 'likes'}</span>
              </div>
            </div>
          )}
          
          {/* Comments Badge */}
          {commentCount > 0 && (
            <div className="flex items-center gap-2 group ml-auto">
              <div className="relative flex">
                <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center border-2 border-background shadow-lg shadow-blue-500/50 group-hover:shadow-blue-500/80 transition-shadow">
                  <MessageCircle className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-blue-400">{commentCount}</span>
                <span className="text-xs text-muted-foreground">{commentCount === 1 ? 'comment' : 'comments'}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="border-y border-cyan-400/20 py-2">
        <div className="flex items-center justify-around gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLike}
            className={`flex-1 gap-2 font-semibold transition-all duration-300 rounded-lg backdrop-blur-sm ${
              isLiked
                ? "text-red-400 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/30 hover:border-red-400/50 hover:shadow-lg hover:shadow-red-500/30 hover:from-red-500/30 hover:to-pink-500/30"
                : "text-cyan-300 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/20 hover:from-cyan-500/20 hover:to-blue-500/20"
            }`}
          >
            <Heart className={`w-5 h-5 transition-all ${isLiked ? "fill-current scale-110" : ""}`} />
            <span>Like</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onComment}
            className="flex-1 gap-2 font-semibold text-blue-300 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/20 hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/20 hover:from-blue-500/20 hover:to-cyan-500/20 transition-all duration-300 rounded-lg backdrop-blur-sm"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Comment</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
