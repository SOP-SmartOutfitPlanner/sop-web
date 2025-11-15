"use client";

import { useEffect } from "react";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

/**
 * Component to listen for realtime notifications
 * Should be added to the root layout
 * Uses Ant Design notification displayed from top with glassmorphism style
 * 
 * Glassmorphism styles are applied via CSS in globals.css
 */
export function RealtimeNotificationListener() {
  useEffect(() => {
    console.log("🔔 RealtimeNotificationListener mounted - Starting to listen for notifications");
  }, []);

  // Use notification hook with placement
  // Options: "top" | "topLeft" | "topRight" | "bottom" | "bottomLeft" | "bottomRight"
  const contextHolder = useRealtimeNotifications("top");
  
  return <>{contextHolder}</>;
}

