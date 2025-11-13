import { useCallback } from "react";
import { CommunityUser, Post } from "@/types/community";
import { UserMini } from "@/types/chat";

interface UsePostAuthorProps {
  post: Post;
  currentUser?: CommunityUser;
  onStylistChat: (stylist: UserMini) => void;
}

export function usePostAuthor({ post, onStylistChat }: UsePostAuthorProps) {
  const normalizedRole = post.userRole?.toUpperCase() ?? "";
  const isAuthorStylist = normalizedRole === "STYLIST";

  const handleMessageAuthor = useCallback(() => {
    if (!isAuthorStylist) return;

    const stylistData: UserMini = {
      id: post.userId,
      name: post.userDisplayName,
      role: "stylist",
      avatar: post.userAvatarUrl,
    };

    onStylistChat(stylistData);
  }, [
    isAuthorStylist,
    onStylistChat,
    post.userAvatarUrl,
    post.userDisplayName,
    post.userId,
  ]);

  return {
    isAuthorStylist,
    handleMessageAuthor,
    authorInfo: {
      id: post.userId,
      name: post.userDisplayName,
      avatar: post.userAvatarUrl,
      role: post.userRole,
    },
  };
}

