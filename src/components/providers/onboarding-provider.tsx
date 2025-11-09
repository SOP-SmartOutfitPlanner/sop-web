"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { OnboardingDialog } from "@/components/wardrobe/onboarding-dialog";

/**
 * OnboardingProvider - Shows onboarding modal for first-time users
 * This provider relies on the auth store's isFirstTime flag which is fetched during login
 */
export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isInitialized, isFirstTime, setIsFirstTime } = useAuthStore();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    // Only show onboarding when:
    // 1. Auth is initialized
    // 2. User is authenticated
    // 3. User exists
    // 4. User is first time (fetched during login)
    if (!isInitialized || !isAuthenticated || !user) {
      return;
    }

    // Show onboarding modal if user is first time
    if (isFirstTime) {
      setIsOnboardingOpen(true);
    }
  }, [isAuthenticated, user, isInitialized, isFirstTime]);

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
