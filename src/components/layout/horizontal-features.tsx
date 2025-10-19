import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";
import { useRef } from "react";
import { wrap } from "motion";
import GlassCard from "../ui/glass-card";
import { LucideIcon } from "lucide-react";

interface HorizontalFeaturesProps {
  features: Array<{
    icon: LucideIcon;
    title: string;
    description: string;
  }>;
}

export default function HorizontalFeatures({ features }: HorizontalFeaturesProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false
  });

  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

  const directionFactor = useRef<number>(1);
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * -2 * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="relative overflow-hidden flex items-end pb-8">
      <motion.div
        className="flex gap-6 w-max h-100%"
        style={{ x }}
      >
        {[...features, ...features, ...features, ...features].map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="flex-shrink-0 w-80"
            >
              <GlassCard
                blur="2px"
                height="50vh"
                displacementScale={50}
                glowIntensity={10}
                brightness={1.2}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 w-full h-full"
                padding="2rem"
              >
                <div className="flex flex-col justify-center items-center text-center h-full">
                  <div className="w-24 h-24 mb-6 group-hover:scale-110 transition-transform duration-300">
                    <GlassCard
                      padding="1.25rem"
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
                      <Icon className="w-10 h-10 text-blue-600" />
                    </GlassCard>
                  </div>
                  <h3 className="font-bricolage text-xl font-semibold mb-4 text-white">
                    {feature.title}
                  </h3>
                  <p className="font-bricolage text-white/80 text-base leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </GlassCard>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}