"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authAPI, ApiError } from "@/lib/api";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { pendingVerificationEmail, successMessage } = useAuthStore();
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpInfo, setOtpInfo] = useState<{
    expiryMinutes: number;
    remainingAttempts: number;
  } | null>(null);

  useEffect(() => {
    // Get email from store or sessionStorage
    const storedEmail =
      pendingVerificationEmail ||
      (typeof window !== "undefined"
        ? sessionStorage.getItem("pendingVerificationEmail")
        : null);

    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // If no pending email, redirect to register
      router.push("/register");
    }
  }, [pendingVerificationEmail, router]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-verify when OTP is complete
  useEffect(() => {
    if (otp.length === 6) {
      handleVerifyOtp();
    }
  }, [otp]);

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Vui lòng nhập đủ 6 số OTP");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await authAPI.verifyOtp({ email, otp });

      // Success! OTP verified
      toast.success(response.message || "Xác thực thành công!");

      // Clear verification state
      useAuthStore.setState({
        requiresVerification: false,
        pendingVerificationEmail: null,
      });

      // Check if this was a Google login registration
      const googleCredential = sessionStorage.getItem("googleCredential");

      if (googleCredential) {
        // Auto-login with Google after OTP verification
        toast.loading("Đang đăng nhập...", { duration: 1000 });

        // Import loginWithGoogle from store
        const { loginWithGoogle } = useAuthStore.getState();

        setTimeout(async () => {
          try {
            const result = await loginWithGoogle(googleCredential);

            // Clear stored credential
            sessionStorage.removeItem("googleCredential");

            if (result.success && !result.requiresVerification) {
              toast.success("Đăng nhập thành công!");
              router.push("/wardrobe");
            } else {
              // Fallback to login page
              router.push("/login?verified=true");
            }
          } catch (error) {
            console.error("Auto-login failed:", error);
            // Fallback to login page
            router.push("/login?verified=true");
          }
        }, 1500);
      } else {
        // Regular email/password registration - redirect to login
        setTimeout(() => {
          router.push("/login?verified=true");
        }, 1500);
      }
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : "Xác thực thất bại";
      toast.error(errorMessage);
      setOtp(""); // Clear OTP on error
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    try {
      const response = await authAPI.resendOtp({ email });

      // Success - show info
      if (response.statusCode === 200 && response.data) {
        setOtpInfo(response.data);
        toast.success(
          response.message || "Mã OTP mới đã được gửi đến email của bạn"
        );
        setCountdown(60); // Start 60 second countdown
        setOtp(""); // Clear current OTP
      }
    } catch (error) {
      // Handle rate limiting (400)
      if (error instanceof ApiError) {
        if (error.statusCode === 400) {
          // Rate limited - show specific message
          toast.error(error.message, {
            duration: 5000,
          });
          // Set longer countdown for rate limit (15 minutes = 900 seconds)
          setCountdown(900);
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error("Không thể gửi lại OTP");
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link
          href="/login"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại đăng nhập
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Nhập mã xác thực
          </h1>

          {/* Description */}
          <p className="text-center text-gray-600 mb-6">
            {successMessage || "Chúng tôi đã gửi mã OTP gồm 6 số đến email của bạn"}
          </p>

          {/* Email Display */}
          {email && (
            <div className="bg-gray-50 rounded-lg p-3 mb-6 text-center">
              <p className="text-xs text-gray-500 mb-1">Email:</p>
              <p className="font-medium text-gray-900 text-sm">{email}</p>
            </div>
          )}

          {/* OTP Info Display */}
          {otpInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center text-blue-900">
                  <span className="font-medium">⏱️ Thời hạn OTP:</span>
                  <span className="ml-1">{otpInfo.expiryMinutes} phút</span>
                </div>
                <div className="flex items-center text-blue-900">
                  <span className="font-medium">🔄 Lượt gửi lại:</span>
                  <span className="ml-1">{otpInfo.remainingAttempts} lần</span>
                </div>
              </div>
            </div>
          )}

          {/* OTP Input */}
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={isVerifying}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {/* Status Messages */}
            {isVerifying && (
              <div className="flex items-center justify-center text-sm text-blue-600">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xác thực...
              </div>
            )}

            {otp.length === 6 && !isVerifying && (
              <p className="text-center text-sm text-green-600">
                ✓ Đã nhập đủ mã OTP
              </p>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-2">Hướng dẫn:</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• Kiểm tra email (có thể trong thư mục spam)</li>
                  <li>• Nhập 6 số OTP vào ô bên trên</li>
                  <li>• Hệ thống tự động xác thực khi nhập đủ</li>
                  <li>• Sau xác thực, đăng nhập để sử dụng</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Manual Verify Button (if needed) */}
          <Button
            onClick={handleVerifyOtp}
            disabled={otp.length !== 6 || isVerifying}
            className="w-full mb-4 bg-blue-600 hover:bg-blue-700"
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

          {/* Resend Button */}
          <Button
            onClick={handleResendOtp}
            disabled={countdown > 0 || isResending}
            variant="outline"
            className="w-full mb-4"
          >
            {isResending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang gửi...
              </>
            ) : countdown > 0 ? (
              countdown > 300 ? (
                `Gửi lại sau ${Math.floor(countdown / 60)} phút ${countdown % 60}s`
              ) : (
                `Gửi lại sau ${countdown}s`
              )
            ) : (
              "Gửi lại mã OTP"
            )}
          </Button>

          {/* Rate Limit Warning */}
          {countdown > 300 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-red-900 text-center">
                ⚠️ Bạn đã yêu cầu gửi OTP quá nhiều lần. Vui lòng đợi{" "}
                {Math.floor(countdown / 60)} phút trước khi thử lại.
              </p>
            </div>
          )}

          {/* Info */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-amber-900 text-center">
              💡 Sau khi xác thực OTP thành công, bạn sẽ được chuyển đến trang đăng nhập
            </p>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Đã xác thực?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Không nhận được email? Kiểm tra thư mục spam
              {countdown > 0 && (
                <span>
                  {" "}
                  hoặc chờ{" "}
                  {countdown > 300
                    ? `${Math.floor(countdown / 60)} phút`
                    : `${countdown}s`}{" "}
                  để gửi lại
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {otpInfo ? (
            <>Mã OTP có hiệu lực trong {otpInfo.expiryMinutes} phút</>
          ) : (
            <>Mã OTP có hiệu lực trong 5 phút</>
          )}
        </p>
      </div>
    </div>
  );
}

