"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";

/**
 * AuthProvider - Initialize auth state from localStorage on app mount
 * This ensures user stays logged in after page refresh
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // Initialize auth from localStorage when app mounts
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}

