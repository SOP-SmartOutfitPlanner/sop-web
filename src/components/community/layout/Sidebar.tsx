"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { QuickChatModal } from "@/components/chat/QuickChatModal";
import { UserMini } from "@/types/chat";
import { useAuthStore } from "@/store/auth-store";
import { useTopContributors } from "@/hooks/community/useTopContributors";
import { TopContributorsList } from "./TopContributorsList";
import { Contributor } from "./types";

export function Sidebar() {
  const { user: currentUser } = useAuthStore();
  const { contributors, isLoading, handleFollow } = useTopContributors(
    currentUser?.id
  );

  const [selectedStylist, setSelectedStylist] = useState<UserMini | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const handleMessageStylist = (contributor: Contributor) => {
    const stylistData: UserMini = {
      id: contributor.userId.toString(),
      name: contributor.displayName,
      role: "stylist",
      isOnline: Math.random() > 0.5,
    };
    setSelectedStylist(stylistData);
    setIsChatModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Contributors Card */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold">Top Contributors</h3>
        </div>

        <TopContributorsList
          contributors={contributors}
          isLoading={isLoading}
          isLoggedIn={!!currentUser}
          onFollow={handleFollow}
          onMessage={handleMessageStylist}
        />
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
    </div>
  );
}
