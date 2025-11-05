import { Sparkles, Shirt, Heart, Wand2, Check } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

interface WhySopStepProps {
  selectedBenefits: string[];
  onToggleBenefit: (benefit: string) => void;
}

const BENEFITS = [
  {
    id: "ai-recommendations",
    title: "AI-Powered Recommendations",
    description: "Get personalized outfit suggestions based on weather, occasion, and your personal style preferences.",
    icon: Sparkles,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "wardrobe-management",
    title: "Smart Wardrobe Management",
    description: "Organize your clothes digitally, track what you wear, and discover new combinations you never thought of.",
    icon: Shirt,
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    id: "style-profile",
    title: "Personalized Style Profile",
    description: "Build a profile that reflects your unique taste, favorite colors, and lifestyle needs.",
    icon: Heart,
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    id: "save-time",
    title: "Save Time Every Morning",
    description: "No more staring at your closet wondering what to wear. Get instant outfit suggestions that work.",
    icon: Wand2,
    gradient: "from-blue-500 to-indigo-500",
  },
] as const;

export function WhySopStep({ selectedBenefits, onToggleBenefit }: WhySopStepProps) {
  return (
    <div className="h-full flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-8 max-w-6xl mx-auto w-full">
        <div className="text-center space-y-3">
          <h2 className="font-dela-gothic text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
            What You Use SOP For?
          </h2>
          <p className="font-bricolage text-lg text-gray-200">Select what matters most to you (optional)</p>
        </div>

        {/* 2x2 Grid for Benefits */}
        <div className="grid grid-cols-2 gap-6">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            const isSelected = selectedBenefits.includes(benefit.id);

            return (
              <button
                key={benefit.id}
                type="button"
                onClick={() => onToggleBenefit(benefit.id)}
                className="text-left"
              >
                <GlassCard
                  padding="2rem"
                  borderRadius="24px"
                  className={cn(
                    "hover:shadow-lg transition-all hover:scale-[1.02] duration-300 relative",
                    isSelected && "ring-2 ring-blue-500 shadow-lg shadow-blue-200/50"
                  )}
                  backgroundColor={isSelected ? "rgba(59, 130, 246, 0.15)" : "rgba(255, 255, 255, 0.4)"}
                  borderColor="rgba(255, 255, 255, 0.6)"
                  width="100%"
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="flex items-start gap-4 h-full">
                    <div className={cn(
                      "flex-shrink-0 w-14 h-14 bg-gradient-to-br rounded-xl flex items-center justify-center transition-transform duration-300 hover:rotate-12",
                      benefit.gradient
                    )}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className={cn(
                        "font-bricolage text-xl font-semibold mb-2 transition-colors duration-300",
                        isSelected ? "text-white" : "text-gray-800"
                      )}>
                        {benefit.title}
                      </h3>
                      <p className={cn(
                        "font-bricolage transition-colors duration-300",
                        isSelected ? "text-white/90" : "text-gray-600"
                      )}>
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
