import { ArrowLeft, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  userName: string;
  onBack: () => void;
}

export function ProfileHeader({ userName, onBack }: ProfileHeaderProps) {
  return (
    <div className="sticky top-0 z-10 backdrop-blur-md ">
      <div className="flex items-center justify-center px-4 h-16">
        <h1 className="font-semibold text-xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-blue-200">
          {userName}
        </h1>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-cyan-400/20 transition-colors rounded-lg"
        >
          {/* <MoreHorizontal className="w-5 h-5 text-cyan-300" /> */}
        </Button>
      </div>
    </div>
  );
}
