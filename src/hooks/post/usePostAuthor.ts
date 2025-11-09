import { useCallback } from "react";
import { CommunityUser, Post } from "@/types/community";
import { UserMini } from "@/types/chat";

interface UsePostAuthorProps {
  post: Post;
  currentUser: CommunityUser;
  onStylistChat: (stylist: UserMini) => void;
}

export function usePostAuthor({
  post,
  currentUser,
  onStylistChat,
}: UsePostAuthorProps) {
  // Check if author is a stylist (based on name patterns)
  const isAuthorStylist =
    currentUser.name.includes("Chen") ||
    currentUser.name.includes("Rivera") ||
    currentUser.name.includes("Patel");

  // Handle message to author
  const handleMessageAuthor = useCallback(() => {
    if (!isAuthorStylist) return;

    const stylistData: UserMini = {
      id: `s${currentUser.name.split(" ")[0].toLowerCase()}`,
      name: currentUser.name,
      role: "stylist",
      isOnline: Math.random() > 0.5,
    };
    onStylistChat(stylistData);
  }, [isAuthorStylist, currentUser.name, onStylistChat]);

  return {
    isAuthorStylist,
    handleMessageAuthor,
    authorInfo: {
      id: post.userId,
      name: post.userDisplayName,
      avatar: post.userAvatarUrl,
    },
  };
}

