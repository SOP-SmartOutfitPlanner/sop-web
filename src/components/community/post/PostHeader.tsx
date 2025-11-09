import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CommunityUser } from "@/types/community";
import { formatDistanceToNow } from "date-fns";
import {
  MessageCircle,
  MoreHorizontal,
  Star,
  Trophy,
  Trash2,
  Edit,
} from "lucide-react";
import { useState } from "react";

interface PostHeaderProps {
  user: CommunityUser;
  timestamp?: string;
  isAuthorStylist: boolean;
  showChallengeEntry?: boolean;
  isOwnPost?: boolean;
  isFollowing?: boolean;
  onMessageAuthor: () => void;
  onReport: (reason: string) => void;
  onFollow?: () => void;
  onDelete?: () => Promise<void>;
  onEdit?: () => void;
}

export function PostHeader({
  user,
  timestamp,
  isAuthorStylist,
  showChallengeEntry,
  isOwnPost = false,
  isFollowing = false,
  onMessageAuthor,
  onReport,
  onFollow,
  onDelete,
  onEdit,
}: PostHeaderProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!onDelete) return;

    try {
      setIsDeleting(true);
      await onDelete();
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link href={`/community/profile/${user.id}`}>
          <div className="relative group">
            <Avatar className="w-12 h-12 cursor-pointer transition-all duration-300 ring-2 ring-cyan-400/0 group-hover:ring-cyan-400/50 shadow-lg group-hover:shadow-cyan-500/30">
              {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
              <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white font-semibold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-cyan-400/0 group-hover:bg-cyan-400/10 transition-colors duration-300" />
          </div>
        </Link>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/community/profile/${user.id}`}>
              <p className="font-semibold text-foreground hover:underline cursor-pointer bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300">
                {user.name}
              </p>
            </Link>
            {!isOwnPost && !isFollowing && onFollow && (
              <span
                className="text-primary font-semibold text-sm cursor-pointer hover:text-primary/80 transition-colors ml-1"
                onClick={onFollow}
              >
                • Follow
              </span>
            )}
            {isAuthorStylist && (
              <Badge
                variant="secondary"
                className="text-xs bg-primary/10 text-primary border-primary/20"
              >
                <Star className="w-3 h-3 mr-1 fill-current" />
                Stylist
              </Badge>
            )}
            {showChallengeEntry && (
              <Badge
                variant="outline"
                className="text-xs bg-gradient-to-r from-accent/10 to-primary/10 text-primary border-primary/30"
              >
                <Trophy className="w-3 h-3 mr-1" />
                Challenge Entry
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {timestamp
              ? formatDistanceToNow(new Date(timestamp), { addSuffix: true })
              : "Recently"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Follow Button - show only if not own post and not following */}

        {isAuthorStylist && (
          <Button
            size="sm"
            variant="ghost"
            className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10"
            onClick={onMessageAuthor}
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isAuthorStylist && !isOwnPost && (
              <DropdownMenuItem onClick={onMessageAuthor}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Message author
              </DropdownMenuItem>
            )}
            {isOwnPost && onEdit && (
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit post
              </DropdownMenuItem>
            )}
            {isOwnPost && onDelete && (
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete post
              </DropdownMenuItem>
            )}
            {!isOwnPost && (
              <DropdownMenuItem onClick={() => onReport("inappropriate")}>
                Report
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
