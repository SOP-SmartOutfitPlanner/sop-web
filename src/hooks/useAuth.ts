import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { AUTH_MESSAGES, AUTH_ROUTES } from "@/lib/constants/auth";
import type { LoginFormValues, RegisterFormValues } from "@/lib/types/auth";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, register } = useAuthStore();

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const success = await login(values.email, values.password);
      if (success) {
        toast.success(AUTH_MESSAGES.LOGIN_SUCCESS);
        router.push(AUTH_ROUTES.DASHBOARD);
      } else {
        toast.error(AUTH_MESSAGES.LOGIN_ERROR);
      }
    } catch (error) {
      console.error(error);
      toast.error(AUTH_MESSAGES.GENERAL_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const result = await register(
        values.displayName,
        values.email,
        values.password,
        values.confirmPassword
      );
      
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
