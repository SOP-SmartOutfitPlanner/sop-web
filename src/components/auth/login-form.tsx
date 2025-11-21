"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema } from "@/lib/validations/auth";
import type { LoginFormValues } from "@/lib/types";
import { GoogleLoginButton } from "./google-login-button";
import GlassButton from "@/components/ui/glass-button";
import { FormField } from "@/components/auth/FormField";
import { Input } from "@/components/ui/input";

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

  const inputClasses =
    "h-12 w-full rounded-2xl bg-white/5 border border-white/15 text-white placeholder-white/40 transition focus:bg-white/10 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/40 focus:outline-none";

  const Banner = ({
    variant,
    message,
    onDismiss,
  }: {
    variant: "success" | "info" | "danger";
    message: string;
    onDismiss: () => void;
  }) => {
    const styles = {
      success: "border-emerald-400/60 bg-emerald-400/15 text-emerald-100",
      info: "border-cyan-300/60 bg-cyan-400/10 text-cyan-100",
      danger: "border-rose-400/60 bg-rose-500/15 text-rose-100",
    }[variant];

    const Icon = variant === "danger" ? AlertTriangle : CheckCircle;

    return (
      <div
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium tracking-wide backdrop-blur-xl ${styles}`}
      >
        <Icon className="h-4 w-4" />
        <span className="flex-1">{message}</span>
        <button
          type="button"
          onClick={onDismiss}
          className="text-white/70 transition hover:text-white"
        >
          ×
        </button>
      </div>
    );
  };

  return (
    <div className="w-full text-white">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Link
          href="/"
          className="mr-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-semibold text-white mb-1">
            Welcome Back 👋
          </h1>
          <p className="text-sm text-white/60">
            Login to continue your fashion journey
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {showVerifiedBanner && (
          <Banner
            variant="success"
            message="Email verified successfully. Please log in."
            onDismiss={() => setShowVerifiedBanner(false)}
          />
        )}
        {showResetBanner && (
          <Banner
            variant="info"
            message="Password reset. Use your new password to sign in."
            onDismiss={() => setShowResetBanner(false)}
          />
        )}
        {showErrorBanner && (
          <Banner
            variant="danger"
            message={
              errorMessage ||
              "Admin accounts must use the admin portal at /admin/login."
            }
            onDismiss={() => setShowErrorBanner(false)}
          />
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <FormField
          label="Email address"
          htmlFor="email"
          error={errors.email?.message}
        >
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45 w-5 h-5" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className={`pl-12 ${inputClasses}`}
              {...register("email")}
            />
          </div>
        </FormField>

        {/* Password Field */}
        <FormField
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
        >
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••"
              className={`pr-12 ${inputClasses}`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </FormField>

        {/* Forgot Password */}
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-cyan-100 underline decoration-transparent underline-offset-4 hover:decoration-cyan-100"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <GlassButton
          type="submit"
          fullWidth
          disabled={isLoading}
          backgroundColor="linear-gradient(90deg,#2563eb 0%,#38bdf8 100%)"
          glowColor="rgba(125,211,252,0.45)"
          glowIntensity={8}
          borderRadius="999px"
          className="h-12 text-base uppercase tracking-[0.18em] md:tracking-[0.35em]"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Logging in...
            </div>
          ) : (
            "Login"
          )}
        </GlassButton>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-[0.4em] text-white/50">
            <span className="bg-transparent px-3">Or</span>
          </div>
        </div>

        {/* Google Login */}
        <GoogleLoginButton />

        {/* Register Link */}
        <div className="text-center pt-4">
          <p className="text-sm text-white/60">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-cyan-200 hover:text-white font-semibold"
            >
              Register now
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
