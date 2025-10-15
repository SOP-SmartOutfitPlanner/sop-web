"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, Mail, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema } from "@/lib/validations/auth";
import { SocialLoginButton } from "./auth-container";
import type { RegisterFormValues } from "@/lib/types";

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, handleRegister } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    await handleRegister(data);
  };

  const handleGoogleRegister = () => {
    console.log("Google register");
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link href="/" className="mr-3">
          <ArrowLeft className="w-5 h-5 text-gray-500 hover:text-gray-700" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-0.5">
            Tạo tài khoản mới
          </h1>
          <p className="text-xs text-gray-500">
            Bắt đầu hành trình thời trang của bạn
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div className="space-y-1.5">
          <Label htmlFor="displayName" className="text-xs font-medium text-gray-700">
            Họ và tên
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="displayName"
              type="text"
              placeholder="Nguyễn Văn A"
              className="pl-9 h-10 text-sm bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 rounded-xl"
              {...register("displayName")}
            />
          </div>
          {errors.displayName && (
            <p className="text-xs text-red-600">{errors.displayName.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium text-gray-700">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="pl-9 h-10 text-sm bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 rounded-xl"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="text-xs font-medium text-gray-700"
          >
            Mật khẩu
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••"
              className="pr-9 h-10 text-sm bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 rounded-xl"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1.5">
          <Label
            htmlFor="confirmPassword"
            className="text-xs font-medium text-gray-700"
          >
            Xác nhận mật khẩu
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••"
              className="pr-9 h-10 text-sm bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 rounded-xl"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="terms"
            className="mt-0.5 w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            required
          />
          <label htmlFor="terms" className="text-xs text-gray-600 leading-tight">
            Tôi đồng ý với{" "}
            <Link href="/terms" className="text-blue-600 hover:text-blue-500">
              Điều khoản sử dụng
            </Link>{" "}
            và{" "}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
              Chính sách bảo mật
            </Link>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] shadow-lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Đang tạo tài khoản...
            </div>
          ) : (
            "Tạo tài khoản"
          )}
        </Button>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white text-gray-500">hoặc</span>
          </div>
        </div>

        {/* Google Register */}
        <SocialLoginButton
          icon={
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285f4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34a853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#fbbc05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#ea4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          }
          label="Đăng ký với Google"
          onClick={handleGoogleRegister}
        />

        {/* Login Link */}
        <div className="text-center pt-2">
          <p className="text-xs text-gray-600">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
