"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { pendingVerificationEmail, successMessage, requiresVerification } = useAuthStore();
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    // Get email from store or sessionStorage
    const storedEmail = pendingVerificationEmail || 
                       (typeof window !== 'undefined' ? sessionStorage.getItem('pendingVerificationEmail') : null);
    
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // If no pending email, redirect to register
      router.push('/register');
    }
  }, [pendingVerificationEmail, router]);

  const handleResendEmail = () => {
    // TODO: Implement resend verification email
    console.log("Resending verification email to:", email);
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
            Kiểm tra email của bạn
          </h1>
          
          {/* Description */}
          <p className="text-center text-gray-600 mb-6">
            {successMessage || "Chúng tôi đã gửi mã OTP đến email của bạn"}
          </p>

          {/* Email Display */}
          {email && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
              <p className="text-sm text-gray-500 mb-1">Email đã gửi đến:</p>
              <p className="font-medium text-gray-900">{email}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-2">Các bước tiếp theo:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  <li>Mở email từ chúng tôi</li>
                  <li>Nhập mã OTP hoặc nhấp vào link xác thực</li>
                  <li>Hoàn tất đăng ký tài khoản</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Resend Button */}
          <Button
            onClick={handleResendEmail}
            variant="outline"
            className="w-full mb-4"
          >
            Gửi lại email xác thực
          </Button>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Đã xác thực email?{" "}
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
              Không nhận được email? Kiểm tra thư mục spam hoặc{" "}
              <button
                onClick={handleResendEmail}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                gửi lại
              </button>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Link xác thực có hiệu lực trong 24 giờ
        </p>
      </div>
    </div>
  );
}

