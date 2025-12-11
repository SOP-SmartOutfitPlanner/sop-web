"use client";

import { useAuthStore } from "@/store/auth-store";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { UserDashboardScreen } from "@/components/dashboard/UserDashboardScreen";

export default function HomePage() {
  const { user, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized && !user) {
      redirect("/");
    }
  }, [isInitialized, user]);

  if (!isInitialized) {
    return null;
  }

  if (!user) {
    return null;
  }

  return <UserDashboardScreen />;
}
