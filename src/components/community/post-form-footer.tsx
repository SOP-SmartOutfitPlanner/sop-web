"use client";

import { Button } from "@/components/ui/button";
import { ImageIcon, Users, MapPin, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export type PostFormMode = "create" | "edit";

interface PostFormFooterProps {
  mode: PostFormMode;
  caption: string;
  isSubmitting?: boolean;
  onImageUploadClick?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (e: React.FormEvent) => void;
}

export function PostFormFooter({
  mode,
  caption,
  isSubmitting = false,
  onImageUploadClick,
  onSubmit,
}: PostFormFooterProps) {
  const isEditMode = mode === "edit";
  const buttonText = isSubmitting
    ? isEditMode
      ? "Updating..."
      : "Posting..."
    : isEditMode
    ? "Update"
    : "Post";

  return (
    <div className="flex-shrink-0 border-t border-cyan-400/15 px-6 py-4 bg-gradient-to-r from-cyan-950/50 via-blue-950/50 to-indigo-950/50 backdrop-blur-lg space-y-3">
      {/* Add to post */}
      <div className="border-2 border-cyan-400/15 rounded-lg p-3 bg-cyan-950/20 backdrop-blur-sm">
        <div className="text-xs font-bold mb-2.5 text-cyan-100">
          Add to your post
        </div>
        <div className="flex items-center gap-4">
          <label className="cursor-pointer group">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onImageUploadClick}
            />
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 hover:bg-green-500/20 group-hover:shadow-lg group-hover:shadow-green-500/30 transition-all">
              <ImageIcon className="w-4 h-4 text-green-400 group-hover:text-green-300" />
            </div>
          </label>
        </div>
      </div>

      {/* Post Button */}
      <Button
        type="submit"
        form="post-form-content"
        disabled={!caption.trim() || isSubmitting}
        className={cn(
          "w-full font-bold text-base transition-all duration-300 rounded-lg",
          caption.trim() && !isSubmitting
            ? "bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-600 text-white hover:from-cyan-600 hover:via-blue-600 hover:to-cyan-700 shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60 scale-100 hover:scale-105"
            : "bg-cyan-950/50 border-2 border-cyan-400/25 text-cyan-200/70 cursor-not-allowed"
        )}
      >
        {buttonText}
      </Button>
    </div>
  );
}
