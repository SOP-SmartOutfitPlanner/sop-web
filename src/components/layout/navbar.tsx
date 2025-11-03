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
  Image,
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

const mainNavigationItems = [
  { path: "/wardrobe", label: "Wardrobe", icon: Shirt, enabled: true },
  { path: "/suggest", label: "Suggest", icon: Sparkles, enabled: false },
  { path: "/daily", label: "Daily", icon: Calendar, enabled: false },
  { path: "/weekly", label: "Weekly", icon: CalendarDays, enabled: false },
  { path: "/community", label: "Community", icon: Users, enabled: true },
  { path: "/challenges", label: "Challenges", icon: Trophy, enabled: false },
];

const personalNavigationItems = [
  {
    path: "/subscription",
    label: "Subscription",
    icon: CreditCard,
    enabled: false,
  },
  { path: "/favorites", label: "Favorites", icon: Heart, enabled: false },
  { path: "/collections", label: "Collections", icon: Image, enabled: false },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, isInitialized } = useAuthStore();



  const NavItem = ({
    item,
    showLabel = true,
  }: {
    item: (typeof mainNavigationItems)[0];
    showLabel?: boolean;
  }) => {
    const Icon = item.icon;
    const isActive = pathname === item.path;

    const navElement = (
      <div
        className={cn(
          "relative flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 group font-poppins",
          isActive
            ? "text-blue-600 bg-blue-50 shadow-sm"
            : item.enabled
            ? "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            : "text-gray-400 cursor-not-allowed"
        )}
      >
        <Icon className="w-4 h-4" />
        {showLabel && <span>{item.label}</span>}
        {isActive && (
          // <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 rounded-full transform scale-x-75" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-15 mb-0.5 bg-blue-600 rounded-full" />
        )}
      </div>
    );

    if (item.enabled) {
      return (
        <Link key={item.path} href={item.path}>
          {navElement}
        </Link>
      );
    }

    return (
      <Tooltip key={item.path}>
        <TooltipTrigger asChild>{navElement}</TooltipTrigger>
        <TooltipContent>
          <p>Đang hoàn thiện</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider>
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-gray-200/50 shadow-md">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Left */}
            <Link
              href="/wardrobe"
              className="flex items-center space-x-3 group relative py-2"
              suppressHydrationWarning
            >
              <div
                className="transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                suppressHydrationWarning
              >
                <Logo
                  variant="rectangle"
                  width={85}
                  height={48}
                  className="filter drop-shadow-md group-hover:drop-shadow-lg"
                />
              </div>
            </Link>

            {/* Main Navigation - Center */}
            <div className="hidden lg:flex items-center space-x-1">
              {mainNavigationItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </div>

            {/* Personal Navigation & Actions - Right */}
            <div className="flex items-center space-x-2">
              {/* Personal nav items */}
              <div className="hidden md:flex items-center space-x-1">
                {personalNavigationItems.map((item) => (
                  <NavItem key={item.path} item={item} showLabel={false} />
                ))}
              </div>

              {/* Inbox - Only show when logged in */}
              {isInitialized && user && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 cursor-not-allowed text-gray-400"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Đang hoàn thiện</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* User Menu - Auth Section */}
              <div suppressHydrationWarning>
                <NavbarAuthSection />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </TooltipProvider>
  );
}
