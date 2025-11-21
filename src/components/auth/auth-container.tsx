import { Button } from "../ui/button";
import GlassCard from "@/components/ui/glass-card";

interface AuthContainerProps {
  children: React.ReactNode;
}

export function AuthContainer({ children }: AuthContainerProps) {
  return (
    <div className="w-full lg:w-3/5 xl:w-1/2 flex items-center justify-center p-4 lg:p-8 relative overflow-y-auto">
      <div className="w-full max-w-lg my-auto">
        <GlassCard
          borderRadius="36px"
          padding="2.5rem"
          blur="24px"
          brightness={1.15}
          glowColor="rgba(34,211,238,0.4)"
          glowIntensity={10}
          borderColor="rgba(255,255,255,0.25)"
          shadowColor="rgba(15,23,42,0.65)"
          shadowIntensity={80}
          backgroundColor="rgba(12,23,42,0.55)"
          className="relative overflow-visible"
        >
          <div className="absolute -inset-px rounded-[38px]  blur-3xl opacity-80 pointer-events-none" />
          <div className="relative z-10">{children}</div>
        </GlassCard>
      </div>
    </div>
  );
}

// components/auth/social-login-button.tsx
interface SocialLoginButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export function SocialLoginButton({
  icon,
  label,
  onClick,
}: SocialLoginButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className="w-full h-12 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-sm"
    >
      {icon}
      {label}
    </Button>
  );
}
