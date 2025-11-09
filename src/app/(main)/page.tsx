"use client";

import LandingHeader from "@/components/layout/landing-header";
import HeroSection from "@/components/layout/hero-section";
import FeaturesSection from "@/components/layout/features-section";
import HowItWorksSection from "@/components/layout/how-it-works-section";
import PricingSection from "@/components/layout/pricing-section";
import TestimonialsSection from "@/components/layout/testimonials-section";
import FAQSection from "@/components/layout/faq-section";
import CTASection from "@/components/layout/cta-section";
import LandingFooter from "@/components/layout/landing-footer";

export default function WelcomePage() {
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
