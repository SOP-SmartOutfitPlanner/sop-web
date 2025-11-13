"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";
import { QuickChatModal } from "@/components/chat/QuickChatModal";
import { UserMini } from "@/types/chat";
import { useAuthStore } from "@/store/auth-store";
import { useTopContributors } from "@/hooks/community/useTopContributors";
import { TopContributorsList } from "./TopContributorsList";

export function Sidebar() {
  const { user: currentUser } = useAuthStore();
  const { contributors, isLoading, handleFollow } = useTopContributors(
    currentUser?.id
  );

  const [selectedStylist, setSelectedStylist] = useState<UserMini | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  return (
    <div className="sticky top-4 space-y-6 max-h-[calc(100vh-32px)] overflow-y-auto">
      {/* Top Contributors Card - Glassmorphism Style */}
      <div className="relative group">
        <div className="absolute inset-0 rounded-2xl blur-xl bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative backdrop-blur-2xl bg-gradient-to-br from-cyan-500/18 via-blue-500/12 to-indigo-500/18 border border-cyan-300/35 hover:border-cyan-200/50 rounded-2xl p-6 transition-all duration-300 shadow-xl shadow-cyan-900/20 hover:shadow-cyan-800/35">
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/5 via-transparent to-white/5 rounded-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-amber-400/25 border border-amber-300/40 shadow-inner shadow-amber-400/30">
                <Trophy className="w-5 h-5 text-amber-100" />
              </div>
              <h3 className="font-bold text-lg text-white drop-shadow-sm">
                Top Contributors
              </h3>
            </div>

            <TopContributorsList
              contributors={contributors}
              isLoading={isLoading}
              isLoggedIn={!!currentUser}
              currentUserId={currentUser?.id}
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
