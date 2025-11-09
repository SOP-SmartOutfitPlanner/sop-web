import { ArrowLeft, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  userName: string;
  onBack: () => void;
}

export function ProfileHeader({ userName, onBack }: ProfileHeaderProps) {
  return (
    <div className="border-b border-border sticky top-0 backdrop-blur-sm z-10 ">
      <div className="flex items-center justify-between px-4 h-14">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-semibold text-base">{userName}</h1>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
