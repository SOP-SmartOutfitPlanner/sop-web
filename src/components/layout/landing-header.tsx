"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/glass-card";
import GlassButton from "@/components/ui/glass-button";
import { Menu, X } from "lucide-react";

interface NavigationTab {
  id: string;
  label: string;
  sectionId: string;
}

const navigationTabs: NavigationTab[] = [
  { id: "hero", label: "Home", sectionId: "hero-section" },
  { id: "features", label: "Features", sectionId: "features-section" },
  { id: "how-it-works", label: "How It Works", sectionId: "how-it-works-section" },
  { id: "pricing", label: "Pricing", sectionId: "pricing-section" },
  { id: "testimonials", label: "Testimonials", sectionId: "testimonials-section" },
  { id: "faq", label: "FAQ", sectionId: "faq-section" },
];

export default function LandingHeader() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("hero");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tabPositions, setTabPositions] = useState<{ [key: string]: { left: number; width: number } }>({});

  useEffect(() => {
    const handleScroll = () => {
      // Check if page is scrolled
      setIsScrolled(window.scrollY > 50);

      // Determine active section based on scroll position
      const sections = navigationTabs.map(tab => ({
        id: tab.id,
        element: document.getElementById(tab.sectionId)
      }));

      const scrollPosition = window.scrollY + 200; // Offset for better detection

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.element) {
          const sectionTop = section.element.offsetTop;
          if (scrollPosition >= sectionTop) {
            setActiveTab(section.id);
            break;
          }
        }
      }
    };

    // Calculate tab positions for the indicator
    const calculateTabPositions = () => {
      const positions: { [key: string]: { left: number; width: number } } = {};
      navigationTabs.forEach(tab => {
        const element = document.getElementById(`nav-tab-${tab.id}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          const parent = element.parentElement?.getBoundingClientRect();
          if (parent) {
            positions[tab.id] = {
              left: rect.left - parent.left,
              width: rect.width
            };
          }
        }
      });
      setTabPositions(positions);
    };

    handleScroll();
    calculateTabPositions();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", calculateTabPositions);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", calculateTabPositions);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100; // Header height offset
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth"
      });
    }
    setIsMobileMenuOpen(false);
  };

  const handleGetStarted = () => {
    router.push("/register");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
          isScrolled ? "py-4" : "py-6"
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-10 flex items-center justify-between gap-20">
          {/* Logo - Left Corner */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-1 cursor-pointer flex-shrink-0"
            onClick={() => scrollToSection("hero-section")}
          >
            <div className="relative w-80 h-28 md:w-72 md:h-24" style={{
              filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.4)) drop-shadow(0 0 10px rgba(59, 130, 246, 0.3))'
            }}>
              <Image
                src="/SOP-logo (2).png"
                alt="SOP Logo"
                fill
                className="object-contain transition-opacity duration-300"
                priority
              />
            </div>

          </motion.div>

          {/* Desktop Navigation - Center */}
          <nav className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <GlassCard
                padding="0.75rem"
                blur="5px"
                brightness={1.2}
                glowColor="rgba(255, 255, 255, 0.5)"
                glowIntensity={12}
                borderColor="rgba(210, 206, 206, 0.5)"
                borderWidth="2px"
                borderRadius="50px"
                displacementScale={20}
                className="relative shadow-xl shadow-white/20 bg-white/50"
              >
                <div className="flex items-center justify-center gap-2 relative">
                  {/* Animated indicator - Darker background that moves */}
                  {tabPositions[activeTab] && (
                    <>
                      <motion.div
                        className="absolute h-11 rounded-full z-10 pointer-events-none"
                        initial={false}
                        animate={{
                          left: tabPositions[activeTab].left,
                          width: tabPositions[activeTab].width
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30
                        }}
                        style={{
                          backdropFilter: "brightness(1.3) blur(15px) url(#indicatorDisplacementFilter)",
                          boxShadow: "inset 15px 15px 0px -15px rgba(59, 130, 246, 0.8), inset 0 0 8px 1px rgba(59, 130, 246, 0.8), 0 20px 40px rgba(37, 99, 235, 0.5)",
                          border: "2px solid rgba(59, 130, 246, 0.6)",
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-600 via-blue-700 to-blue-800 rounded-full" />
                      </motion.div>

                      <svg style={{ display: 'none' }}>
                        <filter id="indicatorDisplacementFilter">
                          <feTurbulence
                            type="turbulence"
                            baseFrequency="0.01"
                            numOctaves={2}
                            result="turbulence"
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
                    </>
                  )}

                  {/* Navigation tabs */}
                  {navigationTabs.map((tab, index) => (
                    <motion.button
                      key={tab.id}
                      id={`nav-tab-${tab.id}`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
                      onClick={() => scrollToSection(tab.sectionId)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative z-20 px-6 py-2.5 rounded-full font-bricolage font-bold text-sm transition-all duration-300 ease-out whitespace-nowrap ${
                        activeTab === tab.id
                          ? "text-white"
                          : "text-gray-700 hover:text-blue-600 hover:bg-white/40"
                      }`}
                    >
                      {tab.label}
                    </motion.button>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </nav>

          {/* CTA Buttons - Right Corner (Desktop) */}
          <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
            <GlassButton
              className="font-bricolage font-bold text-base"
              size="md"
              variant="ghost"
              onClick={handleLogin}
              borderRadius="100px"
              blur="8px"
              brightness={1.05}
              glowColor="rgba(255, 255, 255, 0.65)"
              glowIntensity={6}
              backgroundColor="rgb(6, 182, 212)"
              borderColor="rgba(100, 100, 100, 0.3)"
              borderWidth="1px"
              textColor="rgba(55, 65, 81, 1)"
              displacementScale={15}
            >
              Log In
            </GlassButton>
            <GlassButton
              className="font-bricolage font-bold text-base"
              size="md"
              variant="primary"
              onClick={handleGetStarted}
              borderRadius="100px"
              blur="8px"
              brightness={1.08}
              glowColor="rgba(59, 130, 246, 0.5)"
              glowIntensity={8}
              borderColor="rgba(255, 255, 255, 0.3)"
              borderWidth="1px"
              backgroundColor="rgba(20, 58, 164, 0.84)"
              displacementScale={5}
            >
              Get Started
            </GlassButton>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-24 left-0 right-0 z-40 px-4 lg:hidden"
          >
            <GlassCard
              padding="1.5rem"
              blur="20px"
              brightness={1.15}
              glowColor="rgba(59, 130, 246, 0.4)"
              glowIntensity={10}
              borderColor="rgba(255, 255, 255, 0.3)"
              borderWidth="1px"
              borderRadius="24px"
              backgroundColor="rgba(255, 255, 255, 0.95)"
              displacementScale={15}
              className="backdrop-blur-xl max-w-md mx-auto"
            >
              {/* Mobile Navigation */}
              <nav className="space-y-2 mb-4">
                {navigationTabs.map((tab) => (
                  <div key={tab.id} className="relative">
                    {activeTab === tab.id ? (
                      <GlassCard
                        padding="0"
                        blur="12px"
                        brightness={1.25}
                        glowColor="rgba(59, 130, 246, 0.6)"
                        glowIntensity={10}
                        borderColor="rgba(59, 130, 246, 0.7)"
                        borderWidth="2px"
                        borderRadius="12px"
                        displacementScale={15}
                        className="absolute inset-0 pointer-events-none bg-blue-500/15"
                      >
                        <div />
                      </GlassCard>
                    ) : null}
                    <button
                      onClick={() => scrollToSection(tab.sectionId)}
                      className={`relative w-full text-left px-4 py-3 rounded-xl font-bricolage font-semibold transition-all duration-200 ${
                        activeTab === tab.id
                          ? "text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {tab.label}
                    </button>
                  </div>
                ))}
              </nav>

              {/* Mobile CTA Buttons */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <GlassButton
                  className="font-bricolage font-semibold w-full"
                  size="md"
                  variant="ghost"
                  onClick={handleLogin}
                  borderRadius="12px"
                  blur="8px"
                  brightness={1.08}
                  glowColor="rgba(100, 100, 100, 0.3)"
                  glowIntensity={6}
                  borderColor="rgba(100, 100, 100, 0.2)"
                  borderWidth="1px"
                  textColor="rgba(55, 65, 81, 1)"
                  displacementScale={12}
                >
                  Log In
                </GlassButton>
                <GlassButton
                  className="font-bricolage font-bold w-full"
                  size="md"
                  variant="primary"
                  onClick={handleGetStarted}
                  borderRadius="12px"
                  blur="8px"
                  brightness={1.15}
                  glowColor="rgba(59, 130, 246, 0.5)"
                  glowIntensity={8}
                  borderColor="rgba(255, 255, 255, 0.3)"
                  borderWidth="1px"
                  backgroundColor="rgba(37, 99, 235, 1)"
                  displacementScale={12}
                >
                  Get Started
                </GlassButton>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop overlay for mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}
