"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Shirt,
  Sparkles,
  Calendar,
  CalendarDays,
  CreditCard,
  Heart,
  Users,
  Trophy,
  Image as ImgIcon,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/auth-store";
import { Logo } from "@/components/ui/logo";
import { NavbarAuthSection } from "@/components/layout/navbar-auth-section";
import { motion, useReducedMotion } from "framer-motion";

// -------------------- nav data --------------------
const mainNavigationItems = [
  { path: "/wardrobe", label: "Wardrobe", icon: Shirt, enabled: true },
  { path: "/suggest", label: "Suggest", icon: Sparkles, enabled: false },
  { path: "/daily", label: "Daily", icon: Calendar, enabled: false },
  { path: "/weekly", label: "Weekly", icon: CalendarDays, enabled: false },
  { path: "/community", label: "Community", icon: Users, enabled: true },
  { path: "/challenges", label: "Favorites", icon: Heart, enabled: false },
];

const personalNavigationItems = [
  {
    path: "/subscription",
    label: "Subscription",
    icon: CreditCard,
    enabled: false,
  },
  { path: "/collections", label: "Collections", icon: ImgIcon, enabled: false },
];

// -------------------- component --------------------
export function Navbar() {
  const pathname = usePathname();
  const { user, isInitialized, isFirstTime } = useAuthStore();

  const NavItem = ({
    item,
    showLabel = true,
  }: {
    item: (typeof mainNavigationItems)[number];
    showLabel?: boolean;
  }) => {
    const Icon = item.icon;
    const isActive = pathname === item.path;
    const prefersReduced = useReducedMotion();

    const baseClasses =
      "relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium font-poppins overflow-hidden transition-all duration-300 border"; // <- always has border
    const activeClasses =
      "text-white bg-white/15 border-white/25 shadow-[0_8px_24px_rgba(0,0,0,0.25),inset_0_1px_6px_rgba(255,255,255,0.15)] [text-shadow:0_0_12px_rgba(255,255,255,0.8)]";
    const hoverClasses =
      "border-transparent text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 hover:backdrop-blur-md hover:shadow-[0_6px_18px_rgba(0,0,0,0.20)]";
    const disabledClasses =
      "border-transparent text-white/40 cursor-not-allowed";

    const node = (
      <motion.div
        whileHover={!prefersReduced ? { scale: 1.04 } : undefined}
        whileTap={!prefersReduced ? { scale: 0.985 } : undefined}
        // Bạn có thể tách transition ra nếu muốn 'scale' và 'backgroundColor'
        // có tốc độ khác nhau, nhưng hiện tại dùng chung vẫn ổn.
        transition={{ type: "spring", stiffness: 340, damping: 30, mass: 0.35 }}
        className={cn(
          baseClasses,
          isActive
            ? activeClasses
            : item.enabled
            ? hoverClasses
            : disabledClasses,
          "transform-gpu"
        )}
        // Dùng 'animate' để kiểm soát trạng thái
        animate={
          isActive
            ? {
                // Trạng thái 'active':
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                opacity: 1, // Hiển thị rõ
              }
            : {
                // Trạng thái 'inactive':
                backgroundColor: "rgba(255, 255, 255, 0.0)",
                opacity: 0.7, // Làm mờ toàn bộ element đi một chút
              }
        }
      >
        {/* active pill that morphs between tabs */}
        {isActive && (
          <motion.span
            layoutId="nav-active-pill"
            className="absolute inset-0 rounded-full"
            transition={{ type: "spring", stiffness: 500, damping: 34 }}
          />
        )}

        <Icon className="w-4 h-4 relative z-10" />
        {showLabel && <span className="relative z-10">{item.label}</span>}

        {/* glossy + glow overlays on top of pill */}
        {isActive && (
          <>
            <span
              className="pointer-events-none absolute -top-1 left-0 w-full h-[45%]
              bg-gradient-to-b from-white/60 to-transparent opacity-70 rounded-full"
            />
            <span className="pointer-events-none absolute inset-0 blur-xl opacity-10 bg-white" />
            <span
              className="pointer-events-none absolute inset-0 opacity-[0.12]
              bg-[radial-gradient(120px_60px_at_30%_10%,#fff,transparent)]"
            />
          </>
        )}
      </motion.div>
    );

    return item.enabled ? (
      <Link key={item.path} href={item.path}>
        {node}
      </Link>
    ) : (
      <Tooltip key={item.path}>
        <TooltipTrigger asChild>{node}</TooltipTrigger>
        <TooltipContent>
          <p>Đang hoàn thiện</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider>
      <motion.nav
        role="navigation"
        aria-label="Primary"
        className="sticky top-0 z-50 border-b border-white/10
          bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900
          backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/wardrobe"
              className="flex items-center space-x-3 group relative py-2"
              suppressHydrationWarning
            >
              <div className="ml-10 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Logo
                  variant="rectangle"
                  width={70}
                  height={48}
                  className="filter drop-shadow-md group-hover:drop-shadow-lg"
                />
              </div>
            </Link>

            {/* Main navigation */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="hidden lg:flex items-center space-x-1"
            >
              {mainNavigationItems
                .filter((item) => {
                  // First-time users can only see wardrobe
                  if (isFirstTime) {
                    return item.path === "/wardrobe";
                  }
                  return true;
                })
                .map((item, i) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * i, duration: 0.22 }}
                  >
                    <NavItem item={item} />
                  </motion.div>
                ))}
            </motion.div>

            {/* Right side */}
            <div className="flex items-center space-x-2">
              {/* Hide personal navigation for first-time users */}
              {!isFirstTime && (
                <div className="hidden md:flex items-center space-x-1">
                  {personalNavigationItems.map((item) => (
                    <NavItem key={item.path} item={item} showLabel={false} />
                  ))}
                </div>
              )}

              {/* Hide messages for first-time users */}
              {isInitialized && user && !isFirstTime && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative text-white/60 hover:text-white hover:bg-white/10 rounded-full"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Đang hoàn thiện</p>
                  </TooltipContent>
                </Tooltip>
              )}

              <div suppressHydrationWarning>
                <NavbarAuthSection />
              </div>
            </div>
          </div>
        </div>
      </motion.nav>
    </TooltipProvider>
  );
}
