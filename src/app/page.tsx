"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Eye,
  Calendar,
  History,
  Heart,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import GlassButton from "@/components/ui/glass-button";

export default function WelcomePage() {
  const router = useRouter();
  const featuresRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 } // Trigger when 20% of the element is visible
    );

    const currentRef = featuresRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const handleGetStarted = () => {
    router.push("/login");
  };

  const handleTryFree = () => {
    // Navigate to wardrobe without login (guest mode)
    router.push("/wardrobe");
  };

  const handleViewCollections = () => {
    // Navigate to wardrobe to see items
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
    <div className="min-h-screen">
      <div className="">
        {/* Hero Section */}
        <div className="w-full h-screen flex items-center justify-center">
          <div className="text-center w-full">
            <div className="mb-20">
              <h1 className="font-dela-gothic text-5xl md:text-[150px] mb-10">
                {["Smart", "Outfit", "Planner"].map((word, index) => (
                  <span
                    key={index}
                    className="inline-block bg-clip-text text-transparent bg-gradient-to-br from-white/100 to-white/80 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] [text-shadow:_0_0_20px_rgba(255,255,255,0.3),_0_0_20px_rgba(255,255,255,0.2)] mr-4"
                    style={{
                      backdropFilter: 'blur(2px)',
                      filter: 'url(#textDisplacementFilter)'
                    }}
                  >
                    {word}
                  </span>
                ))}
              </h1>
              <p className="font-bricolage font-semibold text-xl text-white leading-relaxed">
                Your digital wardrobe assistant. <br />Add your clothes, let our AI suggest what to wear, and get inspired by others' looks.
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
                Try free
              </GlassButton>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16 w-full h-screen" ref={featuresRef}>
          <h2 className="font-dela-gothic text-3xl md:text-6xl text-center mb-12">
            {["Discover", "Our", "Features"].map((word, index) => (
              <span
                key={index}
                className={`inline-block bg-clip-text text-transparent bg-gradient-to-br from-white/100 to-white/80 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] mr-3 ${isVisible ? 'animate-word-wipe' : 'opacity-0'
                  }`}
                style={{
                  animationDelay: isVisible ? `${index * 0.2}s` : '0s',
                  animationFillMode: 'forwards'
                }}
              >
                {word}
              </span>
            ))}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <GlassCard
                  key={index}
                  blur="2px"
                  displacementScale={50}
                  glowIntensity={10}
                  brightness={1.2}
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  padding="1.5rem"
                >
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <GlassCard
                        padding="1rem"
                        borderRadius="50%"
                        blur="2px"
                        brightness={1.1}
                        glowColor="rgba(255, 255, 255, 0.5)"
                        glowIntensity={8}
                        borderColor="rgba(255, 255, 255, 0.3)"
                        borderWidth="2px"
                        displacementScale={50}
                        width="100%"
                        height="100%"
                        className="flex items-center justify-center bg-white/80"
                      >
                        <Icon className="w-8 h-8 text-blue-600" />
                      </GlassCard>
                    </div>
                    <h3 className="font-bricolage text-lg font-semibold mb-3 text-white">
                      {feature.title}
                    </h3>
                    <p className="font-bricolage text-white/80 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16 w-full h-screen" ref={featuresRef}>
          <h2 className="font-dela-gothic text-3xl md:text-6xl text-center mb-50">
            {["Why", "Choose", "SOP"].map((word, index) => (
              <span
                key={index}
                className={` bg-clip-text text-transparent bg-gradient-to-br from-white/100 to-white/80 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] mr-3 ${isVisible ? 'animate-word-wipe' : 'opacity-0'
                  }`}
                style={{
                  animationDelay: isVisible ? `${index * 0.2}s` : '0s',
                  animationFillMode: 'forwards'
                }}
              >
                {word}
              </span>
            ))}
          </h2>

          <GlassCard
            className="mb-8 mx-50"
            padding="2rem"
            blur="2px"
            brightness={1.1}
            glowColor="rgba(255, 255, 255, 0.5)"
            glowIntensity={8}
            borderColor="rgba(255, 255, 255, 0.3)"
            borderWidth="2px"
            displacementScale={10}
          >
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <GlassButton
                variant="custom"
                size="sm"
                backgroundColor="rgba(59, 130, 246, 0.3)"
                borderColor="rgba(59, 130, 246, 0.5)"
                borderWidth="2px"
                borderRadius="20px"
                textColor="white"
              >
                Smart AI
              </GlassButton>
              <GlassButton
                variant="custom"
                size="sm"
                backgroundColor="rgba(99, 102, 241, 0.3)"
                borderColor="rgba(99, 102, 241, 0.5)"
                borderWidth="2px"
                borderRadius="20px"
                textColor="white"
              >
                Easy to Use
              </GlassButton>
              <GlassButton
                variant="custom"
                size="sm"
                backgroundColor="rgba(168, 85, 247, 0.3)"
                borderColor="rgba(168, 85, 247, 0.5)"
                borderWidth="2px"
                borderRadius="20px"
                textColor="white"
              >
                Time Saving
              </GlassButton>
              <GlassButton
                variant="custom"
                size="sm"
                backgroundColor="rgba(236, 72, 153, 0.3)"
                borderColor="rgba(236, 72, 153, 0.5)"
                borderWidth="2px"
                borderRadius="20px"
                textColor="white"
              >
                Personal Style
              </GlassButton>
            </div>
            <p className="font-bricolage text-white/90 text-lg leading-relaxed text-center max-w-3xl mx-auto">
              No more worrying about &ldquo;what to wear today&rdquo;. SOP helps you stay confident with your personal style.
            </p>
          </GlassCard>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p className="text-sm">
            © 2024 Smart Outfit Planner. Made with ❤️ for fashion lovers.
          </p>
        </div>
      </div>
    </div>
  );
}
