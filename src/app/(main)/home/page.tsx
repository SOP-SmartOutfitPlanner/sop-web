"use client";

import { useAuthStore } from "@/store/auth-store";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { UserDashboardScreen } from "@/components/dashboard/UserDashboardScreen";

export default function HomePage() {
  const { user, isInitialized, isFirstTime } = useAuthStore();

  useEffect(() => {
    if (isInitialized && !user) {
      redirect("/");
    }
    if (isInitialized && isFirstTime) {
      redirect("/wardrobe");
    }
  }, [isInitialized, user, isFirstTime]);

  if (!isInitialized) {
    return null;
  }

  if (!user || isFirstTime) {
    return null;
  }

  return <UserDashboardScreen />;
}
