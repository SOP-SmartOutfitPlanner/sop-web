"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema } from "@/lib/validations/auth";
import type { LoginFormValues } from "@/lib/types";
import { GoogleLoginButton } from "./google-login-button";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifiedBanner, setShowVerifiedBanner] = useState(false);
  const { isLoading, handleLogin } = useAuth();
  const searchParams = useSearchParams();

  // Check if redirected from OTP verification
  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified === "true") {
      setShowVerifiedBanner(true);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowVerifiedBanner(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    await handleLogin(data);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Link href="/" className="mr-4">
          <ArrowLeft className="w-5 h-5 text-gray-500 hover:text-gray-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome Back 👋
          </h1>
          <p className="text-sm text-gray-500">
            Đăng nhập để tiếp tục hành trình thời trang
          </p>
        </div>
      </div>

      {/* Success Banner - Email Verified */}
      {showVerifiedBanner && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-green-900 mb-1">
                ✅ Email đã được xác thực thành công!
              </h3>
              <p className="text-xs text-green-800">
                Tài khoản của bạn đã được kích hoạt. Vui lòng đăng nhập để tiếp tục.
              </p>
            </div>
            <button
              onClick={() => setShowVerifiedBanner(false)}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 rounded-xl"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            Mật khẩu
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••"
              className="pr-10 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 rounded-xl"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Forgot Password */}
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] shadow-lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Đang đăng nhập...
            </div>
          ) : (
            "Đăng nhập"
          )}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Hoặc</span>
          </div>
        </div>

        {/* Google Login */}
        <GoogleLoginButton />

        {/* Register Link */}
        <div className="text-center pt-4">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>

        {/* Demo Account */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-sm font-medium text-blue-800 mb-2">
            Tài khoản demo:
          </p>
          <p className="text-xs text-blue-600">
            Email: test@example.com
            <br />
            Password: 123456
          </p>
        </div>
      </form>
    </div>
  );
}
