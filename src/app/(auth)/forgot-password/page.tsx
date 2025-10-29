"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authAPI, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { PasswordResetLayout } from "@/components/auth/password-reset-layout";
import { HelpText } from "@/components/auth/help-text";
import type { ForgotPasswordRequest } from "@/lib/types";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordRequest>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordRequest) => {
    setIsLoading(true);
    try {
      const response = await authAPI.forgotPassword(data);
      toast.success(response.message || "OTP has been sent to your email");
      setTimeout(() => router.push("/verify-otp-reset"), 1000);
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Cannot send password reset request"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PasswordResetLayout
      title="Forgot password? 🔐"
      description="Enter your email to receive OTP for password reset"
      icon={Mail}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-login-gray" />
          </div>
          <Input
            type="email"
            placeholder="Email address"
            className="pl-10 h-12 bg-white border-0 focus:ring-2 focus:ring-login-input-focus focus:border-transparent rounded-xl shadow-sm transition-all duration-200"
            disabled={isLoading}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-gradient-to-r from-login-navy to-login-blue hover:from-login-navy/90 hover:to-login-blue/90 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg"
        >
          {isLoading ? (
            "Sending..."
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              Send OTP
            </span>
          )}
        </Button>
      </form>

      <HelpText text="OTP will be valid for 15 minutes" />
    </PasswordResetLayout>
  );
}

