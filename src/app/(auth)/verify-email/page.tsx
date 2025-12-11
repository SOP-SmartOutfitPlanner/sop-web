"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authAPI, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { PasswordResetLayout } from "@/components/auth/password-reset-layout";
import { HelpText } from "@/components/auth/help-text";
import { useOtpVerification } from "@/hooks/useOtpVerification";

export const dynamic = 'force-dynamic';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { pendingVerificationEmail } = useAuthStore();
  const [email, setEmail] = useState("");
  const [otpInfo, setOtpInfo] = useState<{
    expiryMinutes: number;
    remainingAttempts: number;
  } | null>(null);

  useEffect(() => {
    const storedEmail =
      pendingVerificationEmail ||
      sessionStorage.getItem("pendingVerificationEmail");

    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      router.push("/register");
    }
  }, [pendingVerificationEmail, router]);

  const handleVerify = async (otp: string) => {
    try {
      const response = await authAPI.verifyOtp({ email, otp });
      toast.success(response.message || "Email verification successful!");

      // Clear verification state
      useAuthStore.setState({
        requiresVerification: false,
        pendingVerificationEmail: null,
      });

      // Check for Google login auto-redirect
      const googleCredential = sessionStorage.getItem("googleCredential");

      if (googleCredential) {
        toast.loading("Logging in...", { duration: 1000 });
        const { loginWithGoogle } = useAuthStore.getState();

        setTimeout(async () => {
          try {
            const result = await loginWithGoogle(googleCredential);
            sessionStorage.removeItem("googleCredential");

            if (result.success && !result.requiresVerification) {
              toast.success("Login successful!");
              router.push("/home");
            } else {
              router.push("/login?verified=true");
            }
          } catch (error) {
            console.error("Auto-login failed:", error);
            router.push("/login?verified=true");
          }
        }, 1500);
      } else {
        setTimeout(() => router.push("/login?verified=true"), 1500);
      }
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Email verification failed"
      );
      throw error;
    }
  };

  const handleResend = async () => {
    try {
      const response = await authAPI.resendOtp({ email });

      if (response.statusCode === 200 && response.data) {
        setOtpInfo(response.data);
        toast.success(response.message || "New OTP has been sent");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message, {
          duration: error.statusCode === 400 ? 5000 : 3000,
        });
      } else {
        toast.error("Cannot send new OTP");
      }
      throw error;
    }
  };

  const {
    otp,
    setOtp,
    isVerifying,
    isResending,
    countdown,
    handleVerify: verify,
    handleResend: resend,
  } = useOtpVerification({
    onVerify: handleVerify,
    onResend: handleResend,
  });

  return (
    <PasswordResetLayout
      title="Email verification ✉️"
      description="Enter the 6-digit OTP sent to your email"
      icon={Mail}
      email={email}
    >
      {/* OTP Info Display */}
      {otpInfo && (
        <div className="bg-login-light-gray/50 border border-gray-200/50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-login-navy">
              <span className="font-medium">⏱️ Expiry:</span>
              <span className="ml-1">{otpInfo.expiryMinutes} minutes</span>
            </div>
            <div className="flex items-center text-login-navy">
              <span className="font-medium">🔄 Resend attempts:</span>
              <span className="ml-1">{otpInfo.remainingAttempts} times</span>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-center mb-4">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            disabled={isVerifying}
          >
            <InputOTPGroup>
              {[...Array(6)].map((_, i) => (
                <InputOTPSlot key={i} index={i} className="w-12 h-12 text-lg" />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {isVerifying && (
          <div className="flex items-center justify-center text-sm text-blue-600">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Verifying...
          </div>
        )}
      </div>

      <HelpText text="The system will automatically verify when you enter 6 digits" />

      <Button
        onClick={verify}
        disabled={otp.length !== 6 || isVerifying}
        className="w-full h-12 mb-4 bg-gradient-to-r from-login-navy to-login-blue hover:from-login-navy/90 hover:to-login-blue/90 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg"
      >
        {isVerifying ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify OTP"
        )}
      </Button>

      <Button
        onClick={resend}
        disabled={countdown > 0 || isResending}
        variant="outline"
        className="w-full h-12 mb-4 rounded-xl border-login-gray/30 text-login-gray hover:bg-login-light-gray/50 transition-all duration-200"
      >
        {isResending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : countdown > 0 ? (
          countdown > 300 ? (
            `Resend after ${Math.floor(countdown / 60)} minutes ${countdown % 60}s`
          ) : (
            `Resend after ${countdown}s`
          )
        ) : (
          "Resend OTP"
        )}
      </Button>

      {/* Rate Limit Warning */}
      {countdown > 300 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-red-900 text-center">
            ⚠️ Please wait {Math.floor(countdown / 60)} minutes before trying again
          </p>
        </div>
      )}

      {/* Success Info */}
      {/* <div className="bg-green-50/50 border border-green-200/50 rounded-lg p-3">
        <p className="text-xs text-green-900 text-center">
          ✅ After successful verification, you will be redirected to the login page
        </p>
      </div> */}
    </PasswordResetLayout>
  );
}

