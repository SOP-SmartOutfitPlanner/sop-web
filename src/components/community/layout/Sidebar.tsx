"use client";

import { useState } from "react";
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
      {/* Top Contributors Card - Glassmorphism Style */}
      <div className="relative group">
        {/* Glass Container */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/10 via-blue-300/5 to-indigo-300/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Main Card */}
        <div className="relative backdrop-blur-md bg-gradient-to-br from-cyan-400/15 via-blue-400/10 to-indigo-400/15 border-2 border-cyan-400/25 hover:border-cyan-400/40 rounded-2xl p-6 transition-all duration-300 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20">
          {/* Inner glow overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/5 via-transparent to-white/5 rounded-2xl pointer-events-none" />
          
          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/30 to-orange-500/20 border border-amber-400/30">
                <Trophy className="w-5 h-5 text-amber-300" />
              </div>
              <h3 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-blue-200">
                Top Contributors
              </h3>
            </div>

            <TopContributorsList
              contributors={contributors}
              isLoading={isLoading}
              isLoggedIn={!!currentUser}
              onFollow={handleFollow}
            />
          </div>
        </div>
      </div>

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
