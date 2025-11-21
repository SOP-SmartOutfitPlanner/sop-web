"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Shirt,
  Sparkles,
  Calendar,
  CalendarDays,
  CreditCard,
  Heart,
  Users,
  Image as ImgIcon,
  MessageSquare,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/auth-store";
import GlassCard from "@/components/ui/glass-card";
import { NavbarAuthSection } from "@/components/layout/navbar-auth-section";
import { useUnreadCount } from "@/hooks/notifications/useUnreadCount";

// -------------------- nav data --------------------
const mainNavigationItems = [
  { path: "/wardrobe", label: "Wardrobe", icon: Shirt, enabled: true },
  { path: "/outfit", label: "Outfit", icon: Sparkles, enabled: true },
  { path: "/suggest", label: "Suggest", icon: Sparkles, enabled: false },
  { path: "/daily", label: "Daily", icon: Calendar, enabled: false },
  { path: "/calendar", label: "Calendar", icon: CalendarDays, enabled: true },
  { path: "/community", label: "Community", icon: Users, enabled: true },
  { path: "/collections", label: "Collections", icon: ImgIcon, enabled: true },
];

const personalNavigationItems = [
  {
    path: "/subscription",
    label: "Subscription",
    icon: CreditCard,
    enabled: true,
  },
  { path: "/notifications", label: "Notifications", icon: Bell, enabled: true },
  { path: "/collections", label: "Collections", icon: ImgIcon, enabled: false },
];

// -------------------- component --------------------
export function Navbar() {
  const pathname = usePathname();
  const { user, isInitialized, isFirstTime } = useAuthStore();
  const [tabPositions, setTabPositions] = useState<{
    [key: string]: { left: number; width: number };
  }>({});
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Fetch unread notification count (only for badge display)
  const { data: unreadCount } = useUnreadCount(user?.id, {
    poll: !!user?.id && !isFirstTime,
  });

  useEffect(() => {
    // Calculate tab positions for the indicator
    const calculateTabPositions = () => {
      const positions: { [key: string]: { left: number; width: number } } = {};
      const filteredItems = mainNavigationItems.filter((item) => {
        if (isFirstTime) {
          return item.path === "/wardrobe";
        }
        return true;
      });

      filteredItems.forEach((item) => {
        const element = document.getElementById(`nav-tab-${item.path}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          const container = element.parentElement?.parentElement;
          if (container) {
            const containerRect = container.getBoundingClientRect();
            positions[item.path] = {
              left: rect.left - containerRect.left,
              width: rect.width,
            };
          }
        }
      });
      setTabPositions(positions);
    };

    // Use requestAnimationFrame for better timing
    const timer = requestAnimationFrame(calculateTabPositions);
    window.addEventListener("resize", calculateTabPositions);

    return () => {
      cancelAnimationFrame(timer);
      window.removeEventListener("resize", calculateTabPositions);
    };
  }, [isFirstTime, pathname]);

  useEffect(() => {
    // Handle scroll to show/hide navbar
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      }
      // Hide navbar when scrolling down (and not at the top)
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  const filteredMainItems = mainNavigationItems.filter((item) => {
    if (isFirstTime) {
      return item.path === "/wardrobe";
    }
    return true;
  });

  return (
    <TooltipProvider>
      <header
        className="fixed top-0 left-0 right-0 z-[49] transition-all duration-300 py-4"
        style={{
          transform: isVisible ? "translateY(0)" : "translateY(-100%)",
        }}
      >
        <div className="max-w-[1600px] mx-auto  flex items-center justify-between gap-20">
          {/* PART 1: Logo - Left Corner */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-1 cursor-pointer flex-shrink-0"
          >
            <Link href="/wardrobe">
              <div
                className="relative w-80 h-28 md:w-72 md:h-24"
                style={{
                  filter:
                    "drop-shadow(0 0 20px rgba(59, 130, 246, 0.4)) drop-shadow(0 0 10px rgba(59, 130, 246, 0.3))",
                }}
              >
                <Image
                  src="/SOP-logo (2).png"
                  alt="SOP Logo"
                  fill
                  className="object-contain transition-opacity duration-300"
                  priority
                />
              </div>
            </Link>
          </motion.div>

          {/* PART 2: Desktop Navigation - Center */}
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
                  {/* Animated indicator */}
                  {tabPositions[pathname] && (
                    <>
                      <motion.div
                        className="absolute h-11 rounded-full z-10 pointer-events-none"
                        initial={false}
                        animate={{
                          left: tabPositions[pathname].left,
                          width: tabPositions[pathname].width,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                        style={{
                          backdropFilter:
                            "brightness(1.3) blur(15px) url(#indicatorDisplacementFilter)",
                          boxShadow:
                            "inset 15px 15px 0px -15px rgba(59, 130, 246, 0.8), inset 0 0 8px 1px rgba(59, 130, 246, 0.8), 0 20px 40px rgba(37, 99, 235, 0.5)",
                          border: "2px solid rgba(59, 130, 246, 0.6)",
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-600 via-blue-700 to-blue-800 rounded-full" />
                      </motion.div>

                      <svg style={{ display: "none" }}>
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
                  {filteredMainItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;

                    const tabButton = (
                      <motion.button
                        key={item.path}
                        id={`nav-tab-${item.path}`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.5,
                          delay: 0.3 + index * 0.05,
                        }}
                        onClick={() => (item.enabled ? null : null)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative z-20 px-6 py-2.5 rounded-full font-bricolage font-bold text-sm transition-all duration-300 ease-out whitespace-nowrap flex items-center gap-2 ${
                          isActive
                            ? "text-white"
                            : item.enabled
                            ? "text-gray-700 hover:text-blue-600 hover:bg-white/40"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={!item.enabled}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </motion.button>
                    );

                    return item.enabled ? (
                      <Link key={item.path} href={item.path}>
                        {tabButton}
                      </Link>
                    ) : (
                      <Tooltip key={item.path}>
                        <TooltipTrigger asChild>{tabButton}</TooltipTrigger>
                        <TooltipContent>
                          <p>Đang hoàn thiện</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </GlassCard>
            </motion.div>
          </nav>

          {/* PART 3: User Information - Right Corner */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Personal Navigation Icons */}
            {!isFirstTime && (
              <div className="flex items-center gap-2">
                {personalNavigationItems.map((item) => {
                  const Icon = item.icon;
                  const navItem = (
                    <Button
                      key={item.path}
                      variant="ghost"
                      size="sm"
                      className="relative text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2.5 cursor-pointer"
                      disabled={!item.enabled}
                    >
                      <Icon className="w-5 h-5" />
                      {item.path === "/notifications" &&
                        item.enabled &&
                        typeof unreadCount === "number" &&
                        unreadCount > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[10px] font-semibold text-white flex items-center justify-center"
                          >
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </motion.span>
                        )}
                    </Button>
                  );

                  return item.enabled ? (
                    <Link key={item.path} href={item.path}>
                      {navItem}
                    </Link>
                  ) : (
                    <Tooltip key={item.path}>
                      <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                      <TooltipContent>
                        <p>Đang hoàn thiện</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            )}

            {/* Auth Section */}
            <div suppressHydrationWarning>
              <NavbarAuthSection />
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
