import { Button } from "../ui/button";

interface AuthContainerProps {
  children: React.ReactNode;
}

export function AuthContainer({ children }: AuthContainerProps) {
  return (
    <div className="w-full lg:w-3/5 xl:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-[20px] rounded-[24px] shadow-[0_8px_32px_rgba(31,38,135,0.15)] p-8 lg:p-10 border border-white/30 relative overflow-hidden">
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
          <div className="relative z-10">{children}</div>
        </div>
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
