import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface CommentInputProps {
  userName: string;
  onSubmit: (comment: string) => Promise<void>;
}

export function CommentInput({ userName, onSubmit }: CommentInputProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(comment.trim());
      setComment("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex-shrink-0 border-t bg-background px-4 py-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-accent text-white">
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <input
          type="text"
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
          className="flex-1 outline-none bg-transparent text-sm placeholder:text-muted-foreground"
        />
        {comment.trim() && (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-primary font-semibold hover:bg-transparent"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        )}
      </div>
    </div>
  );
}
