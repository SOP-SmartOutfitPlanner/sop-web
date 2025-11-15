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
}

export type FilterType = "all" | "unread" | "system" | "social" | "ai" | "calendar" | "weather" | "achievement";


