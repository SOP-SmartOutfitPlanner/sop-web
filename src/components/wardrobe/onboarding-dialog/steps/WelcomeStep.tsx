import Image from "next/image";
import { Wand2, Shirt, Palette, Heart } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";

export function WelcomeStep() {
  return (
    <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
      <div className="text-center space-y-3 max-w-4xl">
        <div className="relative inline-block">
          <div className="absolute inset-0 blur-2xl opacity-40 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
          <div
            className="relative w-80 h-32 flex items-center justify-center"
            style={{
              filter: 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.6)) drop-shadow(0 0 15px rgba(59, 130, 246, 0.4))'
            }}
          >
            <Image
              src="/SOP-logo (2).png"
              alt="SOP Logo"
              width={200}
              height={100}
              priority
            />
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-3">
          <h1 className="font-dela-gothic text-4xl md:text-5xl lg:text-6xl leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
              Welcome to
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300">
              Smart Outfit Planner
            </span>
          </h1>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-cyan-500 to-transparent rounded-full"></div>
          <p className="font-bricolage text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Let&apos;s set up your profile so our AI can create the perfect outfits for you
          </p>
        </div>

        {/* Feature Cards - 2x2 Grid */}
        <div className="grid grid-cols-4 gap-6 max-w-5xl mx-auto pt-6">
          <GlassCard
            padding="2rem"
            borderRadius="20px"
            className="hover:scale-105 transition-transform"
            backgroundColor="rgba(255, 255, 255, 0.4)"
            borderColor="rgba(255, 255, 255, 0.6)"
            width="100%"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Wand2 className="w-7 h-7 text-white" />
            </div>
            <p className="text-base font-semibold text-gray-700">AI-Powered</p>
          </GlassCard>

          <GlassCard
            padding="2rem"
            borderRadius="20px"
            className="hover:scale-105 transition-transform"
            backgroundColor="rgba(255, 255, 255, 0.4)"
            borderColor="rgba(255, 255, 255, 0.6)"
            width="100%"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shirt className="w-7 h-7 text-white" />
            </div>
            <p className="text-base font-semibold text-gray-700">Smart Wardrobe</p>
          </GlassCard>

          <GlassCard
            padding="2rem"
            borderRadius="20px"
            className="hover:scale-105 transition-transform"
            backgroundColor="rgba(255, 255, 255, 0.4)"
            borderColor="rgba(255, 255, 255, 0.6)"
            width="100%"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Palette className="w-7 h-7 text-white" />
            </div>
            <p className="text-base font-semibold text-gray-700">Style Matching</p>
          </GlassCard>

          <GlassCard
            padding="2rem"
            borderRadius="20px"
            className="hover:scale-105 transition-transform"
            backgroundColor="rgba(255, 255, 255, 0.4)"
            borderColor="rgba(255, 255, 255, 0.6)"
            width="100%"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <p className="text-base font-semibold text-gray-700">Personalized</p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
