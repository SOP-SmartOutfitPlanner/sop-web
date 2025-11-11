"use client";

import { DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { X } from "lucide-react";

export type PostFormMode = "create" | "edit";

interface PostFormUser {
  avatar?: string;
  displayName?: string;
}

interface PostFormHeaderProps {
  mode: PostFormMode;
  user?: PostFormUser;
}

export function PostFormHeader({ mode, user }: PostFormHeaderProps) {
  const isEditMode = mode === "edit";
  const title = isEditMode ? "Edit post" : "Create Post";

  return (
    <DialogHeader className="relative flex-shrink-0 bg-gradient-to-br from-cyan-950/60 via-blue-950/50 to-indigo-950/60 pb-3 border-b border-cyan-400/15 px-6 pt-4 space-y-3">
      {/* Close Button */}
      <DialogClose className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-blue-200/70 hover:text-white hover:bg-white/10 transition-all duration-200">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogClose>

      <DialogTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-100 to-blue-100">
        {title}
      </DialogTitle>

      {/* User Info */}
      {user && (
        <div className="flex items-center gap-3 pt-2">
          <Avatar className="w-10 h-10 ring-2 ring-cyan-400/30">
            <AvatarImage src={user?.avatar || "/api/placeholder/40/40"} />
            <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white font-semibold">
              {user?.displayName?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-bold text-sm text-white">
              {user?.displayName || "User Name"}
            </div>
            <div className="text-xs text-blue-200/70">Public</div>
          </div>
        </div>
      )}
    </DialogHeader>
  );
}
