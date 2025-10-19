"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Sparkles,
  Eye,
  Calendar,
  History,
  Heart,
  Users,
} from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import GlassButton from "@/components/ui/glass-button";
import HorizontalFeatures from "@/components/layout/horizontal-features";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export default function WelcomePage() {
  const router = useRouter();
  const featuresRef = useRef<HTMLDivElement>(null);
  const benefitsSectionRef = useRef<HTMLDivElement>(null);
  const benefitsTextRef = useRef<HTMLDivElement>(null);
  const benefitsContentRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);

  useEffect(() => {
    const preloaderDelay = setTimeout(() => {
      setHeroVisible(true);
    }, 2500);

    return () => clearTimeout(preloaderDelay);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === featuresRef.current) {
              setFeaturesVisible(true);
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    const currentFeaturesRef = featuresRef.current;

    if (currentFeaturesRef) {
      observer.observe(currentFeaturesRef);
    }

    return () => {
      if (currentFeaturesRef) {
        observer.unobserve(currentFeaturesRef);
      }
    };
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1,
      smoothWheel: true,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!benefitsSectionRef.current || !benefitsTextRef.current || !benefitsContentRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: benefitsSectionRef.current,
          start: "top top",
          end: "+=200%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        }
      });

      // Phase 1: Large text appears and stays
      tl.fromTo(benefitsTextRef.current,
        {
          opacity: 0,
          scale: 0.8,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.3,
        }
      );

      tl.to(benefitsTextRef.current, {
        scale: 0.3,
        opacity: 0,
        duration: 0.5,
      }, "+=0.2")
        .fromTo(benefitsContentRef.current,
          {
            scale: 0.5,
            opacity: 0,
          },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
          },
          "<"
        );
    }, benefitsSectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  const handleGetStarted = () => {
    router.push("/login");
  };

  const handleTryFree = () => {
    router.push("/wardrobe");
  };

  const handleViewCollections = () => {
    router.push("/wardrobe");
  };

  const features = [
    {
      icon: Eye,
      title: "Smart Wardrobe",
      description: "Organize and manage your closet intelligently",
    },
    {
      icon: Sparkles,
      title: "AI Suggestions",
      description: "Get outfit recommendations based on weather and events",
    },
    {
      icon: Calendar,
      title: "Daily Planner",
      description: "Plan your daily outfits with ease",
    },
    {
      icon: History,
      title: "Outfit History",
      description: "Track your outfit history and avoid repetition",
    },
    {
      icon: Heart,
      title: "Favorites",
      description: "Save and revisit your favorite outfits",
    },
    {
      icon: Users,
      title: "Community",
      description: "Share and discover new styles together",
    },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: 'linear-gradient(rgba(0, 38, 255, 0.5), rgba(0, 26, 255, 0.5)), url("/main-theme.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="">
        {/* Hero Section */}
        <div className="w-full h-screen flex items-center justify-center">
          <div className="text-center w-full">
            <div className="mb-20">
              <h1
                className="font-dela-gothic text-5xl md:text-[150px] mb-10 text-white/70 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] [text-shadow:_0_0_10px_rgba(255,255,255,0.3),_0_0_15px_rgba(255,255,255,0.2)]"
              >
                {["Smart", "Outfit", "Planner"].map((word, index) => (
                  <span
                    key={index}
                    className={`inline-block bg-clip-text text-transparent bg-gradient-to-br from-white/100 to-white/80 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] mr-3 ${heroVisible ? 'animate-word-wipe' : 'opacity-0'
                      }`}
                    style={{
                      animationDelay: heroVisible ? `${index * 0.2}s` : '0s',
                      animationFillMode: 'forwards'
                    }}
                  >
                    {word}
                  </span>
                ))}
              </h1>
              <p className="font-bricolage font-semibold text-xl text-white leading-relaxed">
                Your digital wardrobe assistant. <br />Add your clothes, let our AI suggest what to wear, and get inspired by others looks.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GlassButton
                className="font-bricolage font-bold"
                size="lg"
                variant="primary"
                onClick={handleGetStarted}
                borderRadius="100px"
                blur="7px"
                brightness={1.1}
                glowColor="rgba(0, 183, 255, 0.5)"
                glowIntensity={8}
                borderColor="rgba(255, 255, 255, 0.3)"
                borderWidth="2px"
                displacementScale={10}
                backgroundColor="rgba(60, 16, 255, 1)"
              >
                Start Now
              </GlassButton>
              <GlassButton
                className="font-bricolage font-bold"
                textColor="rgba(70, 69, 77, 0.97)"
                size="lg"
                variant="outline"
                onClick={handleViewCollections}
                borderRadius="100px"
                blur="2px"
                brightness={1.1}
                glowColor="rgba(255, 255, 255, 0.5)"
                glowIntensity={8}
                borderColor="rgba(255, 255, 255, 0.3)"
                borderWidth="2px"
                backgroundColor="rgba(255, 255, 255, 0.6)"
                displacementScale={10}
              >
                View Collection
              </GlassButton>
              <GlassButton
                className="font-bricolage font-bold"
                size="lg"
                variant="ghost"
                onClick={handleTryFree}
                borderRadius="100px"
                blur="2px"
                brightness={1.1}
                glowColor="rgba(255, 255, 255, 0.5)"
                glowIntensity={8}
                borderColor="rgba(255, 255, 255, 0.3)"
                borderWidth="2px"
                displacementScale={10}
              >
                Free Trial
              </GlassButton>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16 w-full h-screen" ref={featuresRef}>
          <h2 className="font-dela-gothic text-6xl md:text-8xl text-center mb-50">
            {["Discover", "Our", "Features"].map((word, index) => (
              <span
                key={index}
                className={`inline-block bg-clip-text text-transparent bg-gradient-to-br from-white/100 to-white/80 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] mr-3 ${featuresVisible ? 'animate-word-wipe' : 'opacity-0'
                  }`}
                style={{
                  animationDelay: featuresVisible ? `${index * 0.2}s` : '0s',
                  animationFillMode: 'forwards'
                }}
              >
                {word}
              </span>
            ))}
          </h2>
          <HorizontalFeatures features={features} />
        </div>

        {/* Benefits Section with GSAP Animation */}
        <div className="relative w-full h-screen" ref={benefitsSectionRef}>
          {/* Large Text Overlay */}
          <div
            ref={benefitsTextRef}
            className="absolute inset-0 flex flex-col justify-between p-8 md:p-16 pointer-events-none"
          >
            <div className="text-left h-full">
              <h2 className="font-dela-gothic text-[13vw] md:text-[10vw] leading-none h-full">
                <span className="block bg-clip-text h-full text-transparent bg-gradient-to-br from-white/100 to-white/80 drop-shadow-[0_0_30px_rgba(255,255,255,0.6)]">
                  Why Choose
                </span>
              </h2>
            </div>
            <div className="text-right">
              <h2 className="font-dela-gothic text-[13vw] md:text-[10vw] leading-none">
                <span className="block bg-clip-text text-transparent bg-gradient-to-br from-white/100 to-white/80 drop-shadow-[0_0_30px_rgba(255,255,255,0.6)]">
                  Smart Outfit
                </span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-br from-white/100 to-white/80 drop-shadow-[0_0_30px_rgba(255,255,255,0.6)]">
                  Planner
                </span>
              </h2>
            </div>
          </div>

          {/* Content that zooms in */}
          <div
            ref={benefitsContentRef}
            className="absolute inset-0 flex items-center justify-center px-4"
          >
            <div className="max-w-4xl w-full">
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <GlassCard
                  padding="0.75rem 1.5rem"
                  blur="2px"
                  brightness={1.1}
                  glowColor="rgba(255, 255, 255, 1)"
                  glowIntensity={4}
                  borderColor="rgba(0, 225, 255, 1)"
                  borderWidth="2px"
                  borderRadius="20px"
                  displacementScale={10}
                  width="auto"
                  height="auto"
                  draggable
                >
                  <span className="font-bricolage text-5xl font-semibold text-white">Smart AI</span>
                </GlassCard>

                <GlassCard
                  padding="0.75rem 1.5rem"
                  blur="2px"
                  brightness={1.1}
                  glowColor="rgba(255, 255, 255, 1)"
                  glowIntensity={4}
                  borderColor="rgba(0, 225, 255, 1)"
                  borderWidth="2px"
                  borderRadius="20px"
                  displacementScale={10}
                  width="auto"
                  height="auto"
                  draggable
                >
                  <span className="font-bricolage text-5xl font-semibold text-white">Easy to Use</span>
                </GlassCard>

                <GlassCard
                  padding="0.75rem 1.5rem"
                  blur="2px"
                  brightness={1.1}
                  glowColor="rgba(255, 255, 255, 1)"
                  glowIntensity={4}
                  borderColor="rgba(0, 225, 255, 1)"
                  borderWidth="2px"
                  borderRadius="20px"
                  displacementScale={10}
                  width="auto"
                  height="auto"
                  draggable
                >
                  <span className="font-bricolage text-5xl font-semibold text-white">Time Saving</span>
                </GlassCard>

                <GlassCard
                  padding="0.75rem 1.5rem"
                  blur="2px"
                  brightness={1.1}
                  glowColor="rgba(255, 255, 255, 1)"
                  glowIntensity={4}
                  borderColor="rgba(0, 225, 255, 1)"
                  borderWidth="2px"
                  borderRadius="20px"
                  displacementScale={10}
                  width="auto"
                  height="auto"
                  draggable
                >
                  <span className="font-bricolage text-5xl font-semibold text-white">Personal Style</span>
                </GlassCard>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-50">
                <GlassButton
                  size="lg"
                  variant="primary"
                  onClick={handleGetStarted}
                  borderRadius="100px"
                  blur="7px"
                  brightness={1.1}
                  glowColor="rgba(0, 183, 255, 0.5)"
                  glowIntensity={8}
                  borderColor="rgba(255, 255, 255, 0.3)"
                  borderWidth="2px"
                  displacementScale={10}
                  backgroundColor="rgba(60, 16, 255, 1)"
                >
                  <span className="font-bricolage text-3xl font-semibold text-white">Start Now</span>
                </GlassButton>

                <GlassButton
                  size="lg"
                  variant="ghost"
                  onClick={handleTryFree}
                  borderRadius="100px"
                  blur="2px"
                  brightness={1.1}
                  glowColor="rgba(255, 255, 255, 0.5)"
                  glowIntensity={8}
                  borderColor="rgba(255, 255, 255, 0.3)"
                  borderWidth="2px"
                  displacementScale={10}
                >
                  <span className="font-bricolage text-3xl font-semibold text-white">Free Trial</span>
                </GlassButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Filter for Text Turbulence */}
      <svg style={{ display: 'none' }}>
        <filter id="textDisplacementFilter">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.02"
            numOctaves={3}
            result="turbulence"
            seed={1}
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="turbulence"
            scale={20}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
    </div>
  );
}

