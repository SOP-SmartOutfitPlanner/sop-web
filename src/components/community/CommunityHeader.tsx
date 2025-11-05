"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { NewPostDialog } from "./NewPostDialog";

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
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Style Community
        </h1>
        <p className="text-lg text-muted-foreground mt-1">
          Discover, share, and get inspired by fashion looks
        </p>
      </div>

      <Dialog open={isNewPostOpen} onOpenChange={onNewPostOpenChange}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/25 transition-all duration-200">
            <Plus className="w-5 h-5 mr-2" />
            Share Look
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <NewPostDialog onCreatePost={onCreatePost} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
