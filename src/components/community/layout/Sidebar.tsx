import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, Trophy, Bookmark, MessageCircle } from "lucide-react";
import { QuickChatModal } from "@/components/chat/QuickChatModal";
import { UserMini } from "@/types/chat";
import Image from "next/image";

export function Sidebar() {
  const [selectedStylist, setSelectedStylist] = useState<UserMini | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const handleMessageStylist = (stylist: {
    name: string;
    posts: number;
    likes: number;
    avatar: string;
  }) => {
    const stylistData: UserMini = {
      id: `s${stylist.name.split(" ")[0].toLowerCase()}`,
      name: stylist.name,
      role: "stylist",
      isOnline: Math.random() > 0.5,
    };
    setSelectedStylist(stylistData);
    setIsChatModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Contributors */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold">Top Contributors</h3>
        </div>
        <div className="space-y-4">
          {[
            { name: "Sarah Chen", posts: 23, likes: 456, avatar: "S" },
            { name: "Alex Rivera", posts: 18, likes: 342, avatar: "A" },
            { name: "Maya Patel", posts: 15, likes: 298, avatar: "M" },
            { name: "James Kim", posts: 12, likes: 234, avatar: "J" },
            { name: "Emma Wilson", posts: 9, likes: 187, avatar: "E" },
          ].map((user, index) => (
            <div key={user.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm">
                      {user.avatar}
                    </AvatarFallback>
                  </Avatar>
                  {index < 3 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">
                        {index + 1}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.posts} posts • {user.likes} likes
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="h-7 px-2">
                  <UserPlus className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 hover:bg-primary/10"
                  onClick={() => handleMessageStylist(user)}
                >
                  <MessageCircle className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
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
    </div>
  );
}
