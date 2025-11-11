import { useState, forwardRef, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface CommentInputProps {
  userName: string;
  onSubmit: (comment: string) => Promise<void>;
}

export const CommentInput = forwardRef<HTMLInputElement, CommentInputProps>(
  function CommentInput({ userName, onSubmit }, ref) {
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

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

    const handleEmojiClick = (emojiData: EmojiClickData) => {
      setComment((prev) => prev + emojiData.emoji);
      setShowEmojiPicker(false);
    };

    // Close emoji picker when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          emojiPickerRef.current &&
          !emojiPickerRef.current.contains(event.target as Node)
        ) {
          setShowEmojiPicker(false);
        }
      };

      if (showEmojiPicker) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [showEmojiPicker]);

    return (
      <div className="flex-shrink-0 border-t border-white/10 bg-gradient-to-r from-cyan-950/55 via-blue-950/55 to-indigo-950/95 backdrop-blur-lg px-4 py-3">
        <div className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-br from-cyan-400/15 to-blue-400/15 border border-cyan-400/20 group hover:border-cyan-400/40 transition-all">
          <Avatar className="h-8 w-8 flex-shrink-0 ring-1.5 ring-cyan-400/20">
            <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-cyan-400 to-blue-500 text-white">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <input
            ref={ref}
            type="text"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
            className="flex-1 outline-none bg-transparent text-sm text-blue-100 placeholder:text-cyan-400/50 to-blue-400/50   group hover:border-cyan-400/40 transition-colors disabled:opacity-50"
          />

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-full left-0 mb-2 z-50"
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width={320}
                height={400}
                searchDisabled
                skinTonesDisabled
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="h-auto p-1.5 text-cyan-400/70 hover:text-cyan-300 hover:bg-cyan-400/10 rounded-md transition-colors flex-shrink-0"
          >
            <Smile className="h-4 w-4" />
          </Button>

          {comment.trim() && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-cyan-300 hover:text-cyan-200 font-semibold hover:bg-transparent transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "..." : "Post"}
            </Button>
          )}
        </div>
      </div>
    );
  }
);
