import { HeroSection } from "@/components/auth/hero-section";
import { AuthContainer } from "@/components/auth/auth-container";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden lg:flex-row">
      <HeroSection />
      <AuthContainer>
        <RegisterForm />
      </AuthContainer>
    </div>
  );
}
