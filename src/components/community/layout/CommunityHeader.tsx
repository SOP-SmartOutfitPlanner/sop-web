"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { NewPostDialog } from "../NewPostDialog";
import ShareLookButton3D from "@/components/ui/ShareLookButton3D";

interface CommunityHeaderProps {
  isNewPostOpen: boolean;
  onNewPostOpenChange: (open: boolean) => void;
  onCreatePost: (postData: {
    caption: string;
    tags: string[];
    files?: File[]; // Changed to File[] for upload
  }) => Promise<void>;
}

/**
 * Community page header with title and "Share Look" button
 */
export function CommunityHeader({
  isNewPostOpen,
  onNewPostOpenChange,
  onCreatePost,
}: CommunityHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-dela-gothic text-2xl md:text-3xl lg:text-4xl leading-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
            Style Community
          </span>
          <p className="text-lg text-blue-100 mt-1">
            Discover, share, and get inspired by fashion looks
          </p>
        </h1>
      </div>

      <Dialog open={isNewPostOpen} onOpenChange={onNewPostOpenChange}>
        <DialogTrigger asChild>
          <ShareLookButton3D />
        </DialogTrigger>

        <DialogContent className="max-w-2xl max-h-[90vh] !overflow-hidden flex flex-col backdrop-blur-xl bg-gradient-to-br from-cyan-950/60 via-blue-950/50 to-indigo-950/60 border-2 border-cyan-400/25 shadow-2xl shadow-cyan-500/20">
          <div className="flex-1 overflow-y-auto">
            <NewPostDialog onCreatePost={onCreatePost} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
