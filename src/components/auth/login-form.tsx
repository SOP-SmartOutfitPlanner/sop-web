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
  const [showResetBanner, setShowResetBanner] = useState(false);
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { isLoading, handleLogin } = useAuth();
  const searchParams = useSearchParams();

  // Check if redirected from OTP verification or password reset
  useEffect(() => {
    const verified = searchParams.get("verified");
    const reset = searchParams.get("reset");
    
    if (verified === "true") {
      setShowVerifiedBanner(true);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowVerifiedBanner(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
    
    if (reset === "success") {
      setShowResetBanner(true);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowResetBanner(false);
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
    await handleLogin(data, (error: string) => {
      setErrorMessage(error);
      setShowErrorBanner(true);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowErrorBanner(false);
      }, 10000);
      return () => clearTimeout(timer);
    });
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
            Login to continue your fashion journey
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
                ✅ Email has been verified successfully!
              </h3>
              <p className="text-xs text-green-800">
                Your account has been activated. Please login to continue.
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

      {/* Success Banner - Password Reset */}
      {showResetBanner && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-green-900 mb-1">
                ✅ Password has been reset successfully!
              </h3>
              <p className="text-xs text-green-800">
                Please login with your new password.
              </p>
            </div>
            <button
              onClick={() => setShowResetBanner(false)}
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

      {/* Error Banner - Admin Login Attempt */}
      {showErrorBanner && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                ⚠️ Admin Account Detected
              </h3>
              <p className="text-xs text-red-800">
                {errorMessage || "Admin accounts must use the admin login portal at /admin/login"}
              </p>
            </div>
            <button
              onClick={() => setShowErrorBanner(false)}
              className="ml-auto text-red-600 hover:text-red-800"
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
            Password
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
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-gradient-to-r from-login-navy to-login-blue hover:from-login-navy/90 hover:to-login-blue/90 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Logging in...
            </div>
          ) : (
            "Login"
          )}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or</span>
          </div>
        </div>

        {/* Google Login */}
        <GoogleLoginButton />

        {/* Register Link */}
        <div className="text-center pt-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Register now
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
