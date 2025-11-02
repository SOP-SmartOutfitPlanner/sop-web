"use client";

import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Check } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import GlassButton from "@/components/ui/glass-button";
import { motion } from "framer-motion";

export default function CTASection() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/register");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <section className="py-32 px-4 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-1/2 -left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/40 to-cyan-500/40 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-1/2 -right-1/4 w-[700px] h-[700px] bg-gradient-to-tl from-indigo-500/30 to-purple-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md border border-blue-400/30 rounded-full text-sm font-bricolage font-semibold mb-8 shadow-lg shadow-blue-500/20 text-blue-200"
          >
            <Sparkles size={16} className="text-cyan-400" />
            Join 50,000+ Style Enthusiasts
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-dela-gothic text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
              Ready to Transform
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300">
              Your Style?
            </span>
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="font-bricolage text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Never struggle with outfit decisions again. Get AI-powered suggestions tailored to your style, weather, and calendar.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <GlassButton
              className="font-bricolage font-bold text-lg group"
              size="lg"
              variant="primary"
              onClick={handleGetStarted}
              borderRadius="12px"
              blur="7px"
              brightness={1.1}
              glowColor="rgba(6, 182, 212, 0.5)"
              glowIntensity={10}
              borderColor="rgba(255, 255, 255, 0.3)"
              borderWidth="2px"
              displacementScale={10}
              backgroundColor="rgba(6, 182, 212, 1)"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 inline-block group-hover:translate-x-1 transition-transform" size={20} />
            </GlassButton>
            <GlassButton
              className="font-bricolage font-bold text-lg"
              textColor="rgba(255, 255, 255, 1)"
              size="lg"
              variant="outline"
              onClick={handleLogin}
              borderRadius="12px"
              blur="10px"
              brightness={1.1}
              glowColor="rgba(255, 255, 255, 0.3)"
              glowIntensity={6}
              borderColor="rgba(255, 255, 255, 0.5)"
              borderWidth="2px"
              backgroundColor="rgba(255, 255, 255, 0.1)"
              displacementScale={10}
            >
              Already Have an Account?
            </GlassButton>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex items-center justify-center gap-8 flex-wrap text-white/80"
          >
            <div className="flex items-center gap-2">
              <Check className="text-green-400" size={20} />
              <span className="font-bricolage text-sm">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-green-400" size={20} />
              <span className="font-bricolage text-sm">14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-green-400" size={20} />
              <span className="font-bricolage text-sm">Cancel anytime</span>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto"
          >
            <div className="text-center">
              <GlassCard
                padding="2rem"
                blur="20px"
                brightness={1.15}
                glowColor="rgba(255, 255, 255, 0.2)"
                glowIntensity={8}
                borderColor="rgba(255, 255, 255, 0.3)"
                borderWidth="1px"
                borderRadius="20px"
                displacementScale={15}
                className="bg-white/10"
              >
                <div className="font-dela-gothic text-5xl text-white mb-2">50K+</div>
                <div className="font-bricolage text-blue-100">Happy Users</div>
              </GlassCard>
            </div>
            <div className="text-center">
              <GlassCard
                padding="2rem"
                blur="20px"
                brightness={1.15}
                glowColor="rgba(255, 255, 255, 0.2)"
                glowIntensity={8}
                borderColor="rgba(255, 255, 255, 0.3)"
                borderWidth="1px"
                borderRadius="20px"
                displacementScale={15}
                className="bg-white/10"
              >
                <div className="font-dela-gothic text-5xl text-white mb-2">1M+</div>
                <div className="font-bricolage text-blue-100">Outfits Created</div>
              </GlassCard>
            </div>
            <div className="text-center">
              <GlassCard
                padding="2rem"
                blur="20px"
                brightness={1.15}
                glowColor="rgba(255, 255, 255, 0.2)"
                glowIntensity={8}
                borderColor="rgba(255, 255, 255, 0.3)"
                borderWidth="1px"
                borderRadius="20px"
                displacementScale={15}
                className="bg-white/10"
              >
                <div className="font-dela-gothic text-5xl text-white mb-2">4.9/5</div>
                <div className="font-bricolage text-blue-100">User Rating</div>
              </GlassCard>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
