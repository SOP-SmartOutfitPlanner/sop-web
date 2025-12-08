import type { Bell } from "lucide-react";

export interface NotificationItem {
  id: number;
  title: string;
  description: string;
  date: string;
  type: string;
  read: boolean;
  icon: typeof Bell;
  href?: string;
  imageUrl?: string | null;
  actorUserId?: number | null;
  actorName?: string | null;
  actorAvatar?: string | null;
}

export type FilterType = "all" | "unread" | "system" | "user";


