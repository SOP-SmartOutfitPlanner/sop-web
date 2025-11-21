import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, LucideIcon } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import GlassBadge from "@/components/ui/glass-badge";

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
    <div className="flex min-h-full w-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <GlassCard
          borderRadius="36px"
          padding="2.5rem"
          blur="24px"
          brightness={1.1}
          glowColor="rgba(59,130,246,0.35)"
          glowIntensity={9}
          borderColor="rgba(255,255,255,0.2)"
          backgroundColor="rgba(15,23,42,0.55)"
          className="relative overflow-visible"
        >
          <div className="pointer-events-none absolute inset-[1px] rounded-[31px] bg-gradient-to-br from-white/10 via-transparent to-white/5" />

          {/* Back Button */}
          <Link
            href={backHref}
            className="relative z-10 mb-6 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {/* Header */}
          <div className="relative z-10 text-center mb-8 space-y-3">
            <GlassBadge variant="info" size="sm" dot pulse className="mx-auto uppercase tracking-[0.3em]">
              secure portal
            </GlassBadge>
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-[0_20px_60px_rgba(6,182,212,0.35)]">
              <Icon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-semibold text-white mb-2">{title}</h1>
            <p className="text-sm text-white/70">{description}</p>
          </div>

          {/* Email Display */}
          {email && (
            <div className="relative z-10 mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm text-white/80">
              <p className="text-[11px] uppercase tracking-[0.25em] text-white/50 mb-1">
                Email
              </p>
              <p className="font-medium text-white">{email}</p>
            </div>
          )}

          {/* Content */}
          <div className="relative z-10 space-y-5">
            {children}
          </div>

          {/* Back to Login */}
          <div className="relative z-10 mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 transition hover:text-white"
            >
              Back to login
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

