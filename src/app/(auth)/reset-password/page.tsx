"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authAPI, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { PasswordResetLayout } from "@/components/auth/password-reset-layout";
import { HelpText } from "@/components/auth/help-text";
import type { ResetPasswordRequest } from "@/lib/types";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ResetPasswordRequest>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("passwordResetEmail");
    const storedToken = sessionStorage.getItem("passwordResetToken");

    if (storedEmail && storedToken) {
      setEmail(storedEmail);
      setValue("email", storedEmail);
      setValue("resetToken", storedToken);
    } else {
      toast.error("Invalid password reset session");
      router.push("/forgot-password");
    }
  }, [router, setValue]);

  const onSubmit = async (data: ResetPasswordRequest) => {
    setIsLoading(true);
    try {
      const response = await authAPI.resetPassword(data);
      toast.success(response.message || "Đặt lại mật khẩu thành công!");
      setTimeout(() => router.push("/login?reset=success"), 1000);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Không thể đặt lại mật khẩu"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) return null;

  const PasswordInput = ({
    id,
    placeholder,
    show,
    toggle,
    error,
    ...props
  }: {
    id: string;
    placeholder: string;
    show: boolean;
    toggle: () => void;
    error?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }) => (
    <div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock className="h-5 w-5 text-login-gray" />
        </div>
        <Input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="pl-10 pr-10 h-12 bg-white border-0 focus:ring-2 focus:ring-login-input-focus focus:border-transparent rounded-xl shadow-sm transition-all duration-200"
          disabled={isLoading}
          {...props}
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-login-gray hover:text-login-navy transition-colors"
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );

  return (
    <PasswordResetLayout
      title="Đặt lại mật khẩu 🔐"
      description="Nhập mật khẩu mới cho tài khoản của bạn"
      icon={KeyRound}
      email={email}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register("email")} />
        <input type="hidden" {...register("resetToken")} />

        <PasswordInput
          id="newPassword"
          placeholder="Mật khẩu mới"
          show={showPassword}
          toggle={() => setShowPassword(!showPassword)}
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />

        <PasswordInput
          id="confirmPassword"
          placeholder="Xác nhận mật khẩu"
          show={showConfirmPassword}
          toggle={() => setShowConfirmPassword(!showConfirmPassword)}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-gradient-to-r from-login-navy to-login-blue hover:from-login-navy/90 hover:to-login-blue/90 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing ...
            </>
          ) : (
            "Đặt lại mật khẩu"
          )}
        </Button>
      </form>

      <HelpText text="Mật khẩu phải có ít nhất 6 ký tự và khớp nhau" />
    </PasswordResetLayout>
  );
}
