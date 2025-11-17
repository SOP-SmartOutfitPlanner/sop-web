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
import { format, formatDistanceToNow } from "date-fns";
import {
  MessageCircle,
  MoreHorizontal,
  Star,
  Trophy,
  Trash2,
  Edit,
  Flag,
} from "lucide-react";
import { useState } from "react";
import { ReportDialog } from "../report/ReportDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PostHeaderProps {
  user: CommunityUser;
  timestamp?: string;
  isAuthorStylist: boolean;
  showChallengeEntry?: boolean;
  isOwnPost?: boolean;
  isFollowing?: boolean;
  onMessageAuthor: () => void;
  onReport: (reason: string) => Promise<void>;
  onFollow?: () => void;
  onDelete?: () => Promise<void>;
  onEdit?: () => void;
  onTimestampClick?: () => void;
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
  onTimestampClick,
}: PostHeaderProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const showStylistBadge =
    isAuthorStylist || user.role?.toUpperCase() === "STYLIST";

  const relativeTimestamp = timestamp
    ? formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    : "Recently";

  const absoluteTimestamp =
    timestamp && format(new Date(timestamp), "PPP 'at' HH:mm");

  const handleDeleteConfirm = async () => {
    if (!onDelete) return;

    try {
      setIsDeleting(true);
      await onDelete();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error during delete:", error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReportSubmit = async (reason: string) => onReport(reason);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex items-center justify-between gap-4">
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
                <p className="font-semibold text-white hover:text-white/80 hover:underline cursor-pointer transition-colors">
                  {user.name}
                </p>
              </Link>
              {showStylistBadge && (
                <Badge
                  variant="secondary"
                  className="text-xs uppercase tracking-wide bg-gradient-to-r from-cyan-500/25 via-blue-500/25 to-purple-500/25 text-cyan-100 border border-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.35)]"
                >
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Stylist
                </Badge>
              )}
              {!isOwnPost && !isFollowing && onFollow && (
                <button
                  className="px-3 py-1 ml-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-cyan-500/60 to-blue-500/60 hover:from-cyan-500/80 hover:to-blue-500/80 border border-cyan-400/30 hover:border-cyan-400/50 transition-all hover:shadow-lg hover:shadow-cyan-500/30"
                  onClick={onFollow}
                >
                  + Follow
                </button>
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

            {timestamp ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onTimestampClick}
                    className={`text-sm font-medium transition-colors text-slate-400 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 rounded ${
                      onTimestampClick ? "cursor-pointer" : "cursor-default"
                    }`}
                    aria-label={
                      onTimestampClick
                        ? "Open post details"
                        : "Post publication time"
                    }
                  >
                    {relativeTimestamp}
                  </button>
                </TooltipTrigger>
                {absoluteTimestamp && (
                  <TooltipContent className="backdrop-blur-md bg-slate-900/80 border border-cyan-400/20 text-white/90">
                    {absoluteTimestamp}
                  </TooltipContent>
                )}
              </Tooltip>
            ) : (
              <p className="text-sm text-slate-400 font-medium">{relativeTimestamp}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full text-blue-200/70 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Open post options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-[180px] backdrop-blur-xl bg-gradient-to-br from-cyan-950/60 via-blue-950/50 to-indigo-950/60 border-2 border-cyan-400/25 shadow-2xl shadow-cyan-500/20 text-white/90"
            >
              {isOwnPost && onEdit && (
                <DropdownMenuItem
                  onClick={onEdit}
                  className="focus:bg-cyan-500/20 focus:text-white cursor-pointer"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit post
                </DropdownMenuItem>
              )}
              {isOwnPost && onDelete && (
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-red-400 focus:text-red-300 focus:bg-red-500/20 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete post
                </DropdownMenuItem>
              )}
              {!isOwnPost && (
                <DropdownMenuItem
                  onClick={() => setIsReportDialogOpen(true)}
                  className="focus:bg-cyan-500/20 focus:text-white cursor-pointer"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Report
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ReportDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        onSubmit={handleReportSubmit}
        title="Report Post"
        description="Select a reason for reporting this post. Our team will review it as soon as possible."
        confirmLabel="Submit report"
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
    </TooltipProvider>
  );
}
