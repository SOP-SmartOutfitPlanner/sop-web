import { HeroSection } from "@/components/auth/hero-section";
import { AuthContainer } from "@/components/auth/auth-container";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-blue-50">
      <HeroSection />
      <AuthContainer>
        <RegisterForm />
      </AuthContainer>
    </div>
  );
}
