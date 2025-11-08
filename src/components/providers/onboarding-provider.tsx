"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { userAPI } from "@/lib/api/user-api";
import { OnboardingDialog } from "@/components/wardrobe/onboarding-dialog";

/**
 * OnboardingProvider - Shows onboarding modal for first-time users
 * This provider checks if the user needs onboarding and displays the modal globally
 */
export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isInitialized, isFirstTime, setIsFirstTime } = useAuthStore();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Only check onboarding when:
    // 1. Auth is initialized
    // 2. User is authenticated
    // 3. User exists
    // 4. We haven't already checked
    if (!isInitialized || !isAuthenticated || !user || isChecking) {
      return;
    }

    // If we already know the user is first time from the store, show modal immediately
    if (isFirstTime) {
      setIsOnboardingOpen(true);
      return;
    }

    // Otherwise, check with the API
    const checkOnboarding = async () => {
      setIsChecking(true);
      try {
        const profileResponse = await userAPI.getUserProfile();
        const needsOnboarding = profileResponse.data.isFirstTime;

        if (needsOnboarding) {
          setIsFirstTime(true);
          setIsOnboardingOpen(true);
        }
      } catch (error) {
        console.error("Failed to check onboarding status:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkOnboarding();
  }, [isAuthenticated, user, isInitialized, isFirstTime, setIsFirstTime]);

  const handleOnboardingComplete = (open: boolean) => {
    setIsOnboardingOpen(open);

    // When onboarding is completed (modal closed after submission)
    if (!open && isFirstTime) {
      // Update the store to mark onboarding as complete
      setIsFirstTime(false);
    }
  };

  return (
    <>
      {children}
      <OnboardingDialog
        open={isOnboardingOpen}
        onOpenChange={handleOnboardingComplete}
      />
    </>
  );
}
