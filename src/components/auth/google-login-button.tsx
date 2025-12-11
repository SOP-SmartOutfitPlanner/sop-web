"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";

export function GoogleLoginButton() {
  const router = useRouter();
  const { loginWithGoogle } = useAuthStore();

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    try {
      if (!credentialResponse.credential) {
        toast.error("Không nhận được thông tin từ Google");
        return;
      }

      // credentialResponse.credential is the Google ID Token
      const result = await loginWithGoogle(credentialResponse.credential);

      if (result.success) {
        if (result.requiresVerification) {
          // New user - needs email verification
          // Store Google credential for auto-login after OTP verification
          if (typeof window !== "undefined") {
            sessionStorage.setItem(
              "googleCredential",
              credentialResponse.credential
            );
          }

          toast.success(result.message);
          router.push("/verify-email");
        } else {
          // Existing user - login success
          toast.success("Login successful!");

          // Always redirect to home - onboarding dialog will show if needed
          router.push("/home");
        }
      } else {
        // Handle error from result
        if (result.message.includes("must login with email and password")) {
          toast.error(
            "This account was registered with email/password. Please log in with email and password.",
            { duration: 5000 }
          );
        } else {
          toast.error(result.message);
        }
      }
    } catch (error: unknown) {
      console.error("Google login error:", error);

      // Handle specific error messages
      const errorMessage = (error as Error)?.message || "Google login failed";

      if (errorMessage.includes("must login with email and password")) {
        toast.error(
          "This account was registered with email/password. Please log in with email and password.",
          { duration: 5000 }
        );
      } else if (errorMessage.includes("Token not valid")) {
        toast.error("Invalid Google Token. Please try again.");
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleGoogleError = () => {
    console.error("Google OAuth error");
    toast.error("ĐGoogle login failed");
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={false}
        theme="outline"
        size="large"
        text="signin_with"
        shape="rectangular"
        width="100%"
      />
    </div>
  );
}
