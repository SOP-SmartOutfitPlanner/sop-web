import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex-shrink-0 border-t bg-background px-6 py-3">
      <div className="flex space-x-3 items-center">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 flex items-center gap-2">
          <Textarea
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[40px] max-h-[24px] resize-none rounded-full px-4 py-2 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSubmit}
            disabled={!comment.trim() || isSubmitting}
            className="h-8 w-8 rounded-full flex-shrink-0"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4 text-primary" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
