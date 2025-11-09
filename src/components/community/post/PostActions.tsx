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
      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center border-2 border-background">
              <Heart className="w-3 h-3 text-white fill-white" />
            </div>
          </div>
          <span className="ml-1">{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-y py-1">
        <div className="flex items-center justify-around">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLike}
            className={`flex-1 gap-2 hover:bg-muted transition-colors rounded-md ${
              isLiked ? "text-red-500" : "text-muted-foreground"
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            <span className="font-medium">Like</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onComment}
            className="flex-1 gap-2 text-muted-foreground hover:bg-muted transition-colors rounded-md"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">Comment</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
