import { Suspense } from "react";
import { HeroSection } from "@/components/auth/hero-section";
import { AuthContainer } from "@/components/auth/auth-container";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden lg:flex-row">
      <HeroSection />
      <AuthContainer>
        <Suspense fallback={<div className="text-white">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </AuthContainer>
    </div>
  );
}
