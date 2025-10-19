"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default function VerifyOtpResetPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("passwordResetEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      router.push("/forgot-password");
    }
  }, [router]);

  const handleVerify = async (otp: string) => {
    try {
      const response = await authAPI.verifyOtpReset({ email, otp });
      toast.success(response.message || "Xác thực thành công!");
      setTimeout(() => router.push("/reset-password"), 1000);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Xác thực OTP thất bại"
      );
      throw error;
    }
  };

  const handleResend = async () => {
    try {
      const response = await authAPI.forgotPassword({ email });
      toast.success(response.message || "Mã OTP mới đã được gửi");
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Không thể gửi lại OTP"
      );
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
      title="Xác thực OTP 🔑"
      description="Nhập mã OTP gồm 6 số đã được gửi đến email của bạn"
      icon={KeyRound}
      backHref="/forgot-password"
      email={email}
    >
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
            Đang xác thực...
          </div>
        )}

        {/* {otp.length === 6 && !isVerifying && (
          <p className="text-center text-sm text-green-600">
            ✓ Đã nhập đủ mã OTP
          </p>
        )} */}
      </div>

      <HelpText text="Hệ thống sẽ tự động xác thực khi bạn nhập đủ 6 số" />

      <Button
        onClick={verify}
        disabled={otp.length !== 6 || isVerifying}
        className="w-full h-12 mb-4 bg-gradient-to-r from-login-navy to-login-blue hover:from-login-navy/90 hover:to-login-blue/90 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg"
      >
        {isVerifying ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Đang xác thực...
          </>
        ) : (
          "Xác thực OTP"
        )}
      </Button>

      <Button
        onClick={resend}
        disabled={countdown > 0 || isResending}
        variant="outline"
        className="w-full h-12 rounded-xl border-login-gray/30 text-login-gray hover:bg-login-light-gray/50 transition-all duration-200"
      >
        {isResending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Đang gửi...
          </>
        ) : countdown > 0 ? (
          `Gửi lại sau ${countdown}s`
        ) : (
          "Gửi lại mã OTP"
        )}
      </Button>
    </PasswordResetLayout>
  );
}

