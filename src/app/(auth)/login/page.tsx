import { Suspense } from "react";
import { HeroSection } from "@/components/auth/hero-section";
import { AuthContainer } from "@/components/auth/auth-container";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="h-full flex bg-gradient-to-br from-slate-50 to-blue-50">
      <HeroSection />
      <AuthContainer>
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </AuthContainer>
    </div>
  );
}
