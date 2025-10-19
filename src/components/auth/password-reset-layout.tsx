import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, LucideIcon } from "lucide-react";

interface PasswordResetLayoutProps {
  title: string;
  description: string;
  icon: LucideIcon;
  backHref?: string;
  children: ReactNode;
  email?: string;
}

export function PasswordResetLayout({
  title,
  description,
  icon: Icon,
  backHref = "/login",
  children,
  email,
}: PasswordResetLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-login-bg-start to-login-bg-end font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white/70 backdrop-blur-[12px] rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] p-8 lg:p-10 border border-white/20">
          {/* Back Button */}
          <Link
            href={backHref}
            className="mb-6 p-2 hover:bg-white/20 rounded-full transition-colors inline-flex"
          >
            <ArrowLeft className="w-5 h-5 text-login-gray" />
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-login-navy to-login-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-login-navy mb-2">
              {title}
            </h1>
            <p className="text-sm text-login-gray">{description}</p>
          </div>

          {/* Email Display */}
          {email && (
            <div className="bg-login-light-gray/50 rounded-lg p-3 mb-6 text-center border border-gray-200/50">
              <p className="text-xs text-login-gray mb-1">Email:</p>
              <p className="font-medium text-login-navy text-sm">{email}</p>
            </div>
          )}

          {/* Content */}
          {children}

          {/* Back to Login */}
          <div className="text-center mt-6">
            <Link
              href="/login"
              className="text-sm text-login-gray hover:text-login-navy transition-colors"
            >
              Nhớ mật khẩu?{" "}
              <span className="font-semibold text-login-blue hover:text-login-navy transition-colors">
                Đăng nhập ngay
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

