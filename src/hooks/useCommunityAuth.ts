import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";

/**
 * Custom hook to handle authentication check for community
 * Redirects to login if user is not authenticated
 */
export function useCommunityAuth() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  useEffect(() => {
    // Wait for auth to initialize before checking authentication
    if (!isInitialized) return;

    if (!user) {
      console.warn("❌ No user found - redirecting to login");
      toast.error("Please login to view community posts");
      router.push("/login");
    }
  }, [user, isInitialized, router]);

  return {
    user,
    isInitialized,
    isAuthenticated: !!user,
  };
}
