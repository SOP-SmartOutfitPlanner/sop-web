"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import GlassCard from "@/components/ui/glass-card";

export default function SuggestPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { isAuthenticated, user } = useAuthStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    // Give time for AuthProvider to initialize
    const timer = setTimeout(() => {
      if (!isAuthenticated && !user) {
        router.push("/login");
      } else {
        setIsCheckingAuth(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32">
      <div className="container max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h4 className="font-dela-gothic text-2xl md:text-3xl lg:text-4xl leading-tight">
              <span className="bg-clip-text text-transparent bg-linear-to-r from-white via-blue-100 to-cyan-200">
                AI Suggest
              </span>
            </h4>
            <p className="bg-clip-text text-transparent bg-linear-to-r from-white via-blue-100 to-cyan-200">
              Get personalized outfit suggestions powered by AI
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GlassCard
            padding="24px"
            borderRadius="24px"
            blur="10px"
            brightness={1.02}
            glowColor="rgba(34, 211, 238, 0.2)"
            borderColor="rgba(255, 255, 255, 0.2)"
            borderWidth="2px"
            className="bg-gradient-to-br from-cyan-300/20 via-blue-200/10 to-indigo-300/20"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Daily Suggestions
              </h3>
              <p className="text-white/70 text-sm">
                Get AI-powered outfit suggestions based on weather, occasion, and your style preferences
              </p>
            </div>
          </GlassCard>

          <GlassCard
            padding="24px"
            borderRadius="24px"
            blur="10px"
            brightness={1.02}
            glowColor="rgba(34, 211, 238, 0.2)"
            borderColor="rgba(255, 255, 255, 0.2)"
            borderWidth="2px"
            className="bg-gradient-to-br from-cyan-300/20 via-blue-200/10 to-indigo-300/20"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Smart Matching
              </h3>
              <p className="text-white/70 text-sm">
                Discover new outfit combinations from your wardrobe items
              </p>
            </div>
          </GlassCard>

          <GlassCard
            padding="24px"
            borderRadius="24px"
            blur="10px"
            brightness={1.02}
            glowColor="rgba(34, 211, 238, 0.2)"
            borderColor="rgba(255, 255, 255, 0.2)"
            borderWidth="2px"
            className="bg-gradient-to-br from-cyan-300/20 via-blue-200/10 to-indigo-300/20"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Trend Analysis
              </h3>
              <p className="text-white/70 text-sm">
                Stay updated with the latest fashion trends tailored to your style
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-12">
          <GlassCard
            padding="32px"
            borderRadius="24px"
            blur="10px"
            brightness={1.02}
            glowColor="rgba(147, 51, 234, 0.3)"
            borderColor="rgba(168, 85, 247, 0.3)"
            borderWidth="2px"
            className="bg-gradient-to-br from-purple-300/20 via-pink-200/10 to-purple-300/20"
          >
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 animate-pulse">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">
                AI Suggestions Coming Soon
              </h2>
              <p className="text-white/80 text-lg max-w-2xl mx-auto">
                We&apos;re working on bringing you intelligent outfit suggestions powered by advanced AI.
                Stay tuned for personalized recommendations based on your unique style!
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
