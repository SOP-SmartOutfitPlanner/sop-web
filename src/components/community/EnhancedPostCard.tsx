import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  Star,
  Trophy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Post } from "@/types/community";
import { CommunityUser } from "@/types/community";
import { UserMini } from "@/types/chat";
import { formatDistanceToNow } from "date-fns";
import { QuickChatModal } from "@/components/chat/QuickChatModal";
import CommentSection from "@/components/community/CommentSection";
import Image from "next/image";

interface EnhancedPostCardProps {
  post: Post;
  currentUser: CommunityUser;
  onLike: () => void;
  onSave?: () => void;
  onShare?: () => void;
  onReport: (reason: string) => void;
  onRequestStylist?: (post: Post) => void;
  showChallengeEntry?: boolean;
}

export function EnhancedPostCard({
  post,
  currentUser,
  onLike,
  onSave,
  onShare,
  onReport,
  showChallengeEntry,
}: EnhancedPostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedStylist, setSelectedStylist] = useState<UserMini | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments.length);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get images array (use new images field or fallback to legacy image field)
  const images = post.images?.length > 0 ? post.images : post.image ? [post.image] : [];
  const hasMultipleImages = images.length > 1;

  // Check if post author is a stylist (mock logic)
  const isAuthorStylist =
    currentUser.name.includes("Chen") ||
    currentUser.name.includes("Rivera") ||
    currentUser.name.includes("Patel");

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike();
  };

  const handleDoubleClick = () => {
    if (!isLiked) {
      handleLike();
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.();
  };

  const handleMessageAuthor = () => {
    if (!isAuthorStylist) return;

    const stylistData: UserMini = {
      id: `s${currentUser.name.split(" ")[0].toLowerCase()}`,
      name: currentUser.name,
      role: "stylist",
      isOnline: Math.random() > 0.5,
    };
    setSelectedStylist(stylistData);
    setIsChatModalOpen(true);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <Card className="group overflow-hidden bg-card border-0 shadow-sm hover:shadow-lg transition-all duration-300">
        {/* Post Header */}
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                  {currentUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-foreground">
                    {currentUser.name}
                  </p>
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
                  {post.timestamp
                    ? formatDistanceToNow(new Date(post.timestamp), {
                        addSuffix: true,
                      })
                    : "Recently"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Message button for stylists - shown on hover */}
              {isAuthorStylist && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10"
                  onClick={handleMessageAuthor}
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
                    <DropdownMenuItem onClick={handleMessageAuthor}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message author
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onReport("inappropriate")}>
                    Report
                  </DropdownMenuItem>
                  <DropdownMenuItem>Hide</DropdownMenuItem>
                  <DropdownMenuItem>Copy link</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Post Image(s) - Support multiple images with carousel */}
        {images.length > 0 && (
          <div
            className="relative mx-4 mb-4 aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-muted/30 to-background group cursor-pointer"
            onDoubleClick={handleDoubleClick}
          >
            <div className="relative w-full h-full">
              <Image
                src={images[currentImageIndex]}
                alt={`Post image ${currentImageIndex + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Navigation arrows for multiple images */}
            {hasMultipleImages && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handlePrevImage}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleNextImage}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Image counter */}
            {hasMultipleImages && (
              <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/60 text-white text-xs font-medium">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}

            {/* Dot indicators */}
            {hasMultipleImages && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentImageIndex
                        ? "bg-white w-4"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Like animation overlay */}
            {isLiked && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Heart className="w-16 h-16 text-red-500 fill-red-500 animate-scale-in" />
              </div>
            )}
          </div>
        )}

        {/* Post Content */}
        <div className="px-4 pb-4 space-y-3">
          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`gap-2 hover:text-red-500 transition-all duration-200 ${
                  isLiked ? "text-red-500 animate-scale-in" : ""
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                <span className="font-medium">{post.likes}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="gap-2 hover:text-blue-500 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">{commentCount}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onShare}
                className="gap-2 hover:text-green-500 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className={`hover:text-amber-500 transition-colors ${
                isSaved ? "text-amber-500" : ""
              }`}
            >
              <Bookmark
                className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`}
              />
            </Button>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <p className="text-foreground leading-relaxed">{post.caption}</p>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="pt-2">
            <CommentSection
              postId={post.id}
              commentCount={commentCount}
              onCommentCountChange={setCommentCount}
            />
          </div>
        </div>
      </Card>

      {/* Quick Chat Modal */}
      {selectedStylist && (
        <QuickChatModal
          isOpen={isChatModalOpen}
          onClose={() => {
            setIsChatModalOpen(false);
            setSelectedStylist(null);
          }}
          stylist={selectedStylist}
        />
      )}
    </>
  );
}
