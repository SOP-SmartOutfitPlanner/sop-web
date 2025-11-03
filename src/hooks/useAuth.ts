import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { AUTH_MESSAGES, AUTH_ROUTES } from "@/lib/constants/auth";
import type { LoginFormValues, RegisterFormValues } from "@/lib/types";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, register } = useAuthStore();

  const handleLogin = useCallback(async (values: LoginFormValues, onAdminDetected?: (error: string) => void) => {
    setIsLoading(true);
    try {
      const result = await login(values.email, values.password);
      if (result.success) {
        toast.success(AUTH_MESSAGES.LOGIN_SUCCESS);

        // Check if user is first time and redirect to onboarding
        if (result.isFirstTime) {
          router.push('/onboarding');
        } else {
          router.push(AUTH_ROUTES.DASHBOARD);
        }
      } else {
        // Check if error is admin login attempt
        const { error } = useAuthStore.getState();
        if (error?.includes("admin login portal")) {
          if (onAdminDetected) {
            onAdminDetected(error);
          }
          toast.error("Admin accounts must use the admin login portal");
        } else {
          toast.error(error || AUTH_MESSAGES.LOGIN_ERROR);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(AUTH_MESSAGES.GENERAL_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [login, router]);

  const handleRegister = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const result = await register(values);
      
      if (result.success) {
        // Show message from API
        toast.success(result.message);
        
        // If requires email verification, redirect to verification page
        if (result.requiresVerification) {
          // You can create a verification page or show a modal
          // For now, just show the message
          router.push('/verify-email');
        } else {
          // Direct login, go to dashboard
          router.push(AUTH_ROUTES.DASHBOARD);
        }
      } else {
        toast.error(result.message || AUTH_MESSAGES.REGISTER_ERROR);
      }
    } catch (error) {
      console.error(error);
      toast.error(AUTH_MESSAGES.GENERAL_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleLogin,
    handleRegister,
  };
}
