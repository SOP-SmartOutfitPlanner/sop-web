"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, Mail, User } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema } from "@/lib/validations/auth";
import type { RegisterFormValues } from "@/lib/types";
import GlassButton from "@/components/ui/glass-button";
import { FormField } from "@/components/auth/FormField";
import { Input } from "@/components/ui/input";

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

  const inputClasses =
    "h-11 w-full rounded-2xl bg-white/5 border border-white/15 text-white placeholder-white/40 text-sm transition focus:bg-white/10 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/40 focus:outline-none";

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
            Create new account
          </h1>
          <p className="text-sm text-white/60">Start your fashion journey</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          label="Full name"
          htmlFor="displayName"
          error={errors.displayName?.message}
        >
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45 w-4 h-4" />
            <Input
              id="displayName"
              type="text"
              placeholder="John Doe"
              className={`pl-11 ${inputClasses}`}
              {...register("displayName")}
            />
          </div>
        </FormField>

        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-black/45 w-4 h-4" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className={`pl-11 ${inputClasses}`}
              {...register("email")}
            />
          </div>
        </FormField>

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
              className={`pr-11 ${inputClasses}`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-black/50 hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </FormField>

        <FormField
          label="Confirm password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••"
              className={`pr-11 ${inputClasses}`}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </FormField>

        {/* Terms */}
        <div className="flex items-start space-x-2 text-white/70">
          <input
            type="checkbox"
            id="terms"
            className="mt-1 h-4 w-4 rounded border-white/30 bg-transparent text-cyan-300 focus:ring-cyan-400/60"
            required
          />
          <label htmlFor="terms" className="text-xs leading-tight">
            I agree to the{" "}
            <Link href="/terms" className="text-cyan-200 hover:text-white">
              Terms of service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-cyan-200 hover:text-white">
              Privacy policy
            </Link>
          </label>
        </div>

        {/* Submit Button */}
        <GlassButton
          type="submit"
          fullWidth
          disabled={isLoading}
          backgroundColor="linear-gradient(90deg,#2563eb 0%,#38bdf8 100%)"
          glowColor="rgba(125,211,252,0.4)"
          glowIntensity={8}
          borderRadius="999px"
          className="h-11 text-base uppercase tracking-[0.18em] md:tracking-[0.32em]"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              <span>Creating account...</span>
            </div>
          ) : (
            "Create account"
          )}
        </GlassButton>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-[0.35em] text-white/50">
            <span className="px-3 bg-transparent">or</span>
          </div>
        </div>

        {/* Google Register */}
        {/* <SocialLoginButton
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
          label="Register with Google"
          onClick={handleGoogleRegister}
        /> */}

        {/* Login Link */}
        <div className="text-center pt-2">
          <p className="text-sm text-white/60">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-cyan-200 hover:text-white font-semibold"
            >
              Login now
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
