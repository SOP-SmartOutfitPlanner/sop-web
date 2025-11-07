import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommunityUser } from "@/types/community";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, MoreHorizontal, Star, Trophy } from "lucide-react";

interface PostHeaderProps {
  user: CommunityUser;
  timestamp?: string;
  isAuthorStylist: boolean;
  showChallengeEntry?: boolean;
  onMessageAuthor: () => void;
  onReport: (reason: string) => void;
}

export function PostHeader({
  user,
  timestamp,
  isAuthorStylist,
  showChallengeEntry,
  onMessageAuthor,
  onReport,
}: PostHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link href={`/community/profile/${user.id}`}>
          <Avatar className="w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/community/profile/${user.id}`}>
              <p className="font-medium text-foreground hover:underline cursor-pointer">
                {user.name}
              </p>
            </Link>
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
            {isAuthorStylist && (
              <DropdownMenuItem onClick={onMessageAuthor}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Message author
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onReport("inappropriate")}>
              Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
