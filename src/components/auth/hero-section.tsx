import { Logo } from "@/components/ui/logo";
import GlassBadge from "@/components/ui/glass-badge";
import GlassCard from "@/components/ui/glass-card";
import { Sparkles, Shirt, Calendar, Heart } from "lucide-react";

const featureCards = [
  {
    icon: Sparkles,
    label: "AI suggestion",
    colors: "from-cyan-400 to-blue-500",
  },
  {
    icon: Shirt,
    label: "Wardrobe curation",
    colors: "from-blue-500 to-indigo-500",
  },
  {
    icon: Calendar,
    label: "Smart scheduling",
    colors: "from-sky-500 to-blue-500",
  },
  {
    icon: Heart,
    label: "Favorites & mood",
    colors: "from-indigo-500 to-purple-500",
  },
];

export function HeroSection() {
  return (
    <div className="hidden lg:flex lg:w-2/5 xl:w-1/2 relative overflow-hidden h-full px-8 py-10">
      {/* Aurora gradient */}

      <div className="relative z-10 w-full h-full flex flex-col justify-center">
        <div className="max-w-xl space-y-8 text-center mx-auto">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute -inset-10 rounded-full bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-indigo-500/30 blur-3xl animate-pulse" />
            <Logo
              variant="icon"
              width={140}
              height={140}
              showGlow={false}
              className="mx-auto drop-shadow-[0_15px_35px_rgba(15,118,230,0.45)]"
            />
          </div>

          <div className="space-y-4">
            <GlassBadge
              variant="info"
              size="lg"
              dot
              pulse
              className="mx-auto uppercase tracking-[0.4em]"
            >
              SMART OUTFIT PLANNER
            </GlassBadge>
            <h1 className="text-4xl xl:text-5xl font-semibold leading-tight text-white">
              Manifest your{" "}
              <span className="text-transparent bg-gradient-to-r from-cyan-200 via-white to-indigo-200 bg-clip-text">
                signature style
              </span>{" "}
              with glassy precision.
            </h1>
            <p className="text-base text-white/70 leading-relaxed">
              Smart Outfit Planner blends AI-driven recommendations with tactile
              wardrobe management so every session feels like a curated atelier
              visit.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            {featureCards.map(({ icon: Icon, label, colors }) => (
              <GlassCard
                key={label}
                borderRadius="30px"
                padding="1.5rem"
                blur="18px"
                brightness={1.2}
                glowColor="rgba(255,255,255,0.25)"
                glowIntensity={6}
                borderColor="rgba(255,255,255,0.18)"
                backgroundColor="rgba(255,255,255,0.05)"
                className="group transition hover:-translate-y-1"
              >
                <div
                  className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${colors} text-white shadow-[0_12px_30px_rgba(14,165,233,0.25)]`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-white/80 group-hover:text-white">
                  {label}
                </p>
                <div className="mt-3 h-px bg-white/10" />
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
