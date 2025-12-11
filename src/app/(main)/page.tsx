"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LandingHeader from "@/components/layout/landing-header";
import HeroSection from "@/components/layout/hero-section";
import FeaturesSection from "@/components/layout/features-section";
import HowItWorksSection from "@/components/layout/how-it-works-section";
import PricingSection from "@/components/layout/pricing-section";
import TestimonialsSection from "@/components/layout/testimonials-section";
import FAQSection from "@/components/layout/faq-section";
import CTASection from "@/components/layout/cta-section";
import LandingFooter from "@/components/layout/landing-footer";
import { useAuthStore } from "@/store/auth-store";

export default function WelcomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/home");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <LandingHeader />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
