"use client";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const mainNavigationItems = [
  { path: "/wardrobe", label: "Wardrobe", icon: Shirt, enabled: true },
  { path: "/suggest", label: "Suggest", icon: Sparkles, enabled: false },
  { path: "/daily", label: "Daily", icon: Calendar, enabled: false },
  { path: "/weekly", label: "Weekly", icon: CalendarDays, enabled: false },
  { path: "/community", label: "Community", icon: Users, enabled: false },
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
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo - Left */}
            <Link
              href="/wardrobe"
              className="flex items-center space-x-3 group"
            >
              <div className="text-2xl font-bold tracking-tight">
                <span className="text-blue-600">So</span>
                <span className="text-orange-500">P</span>
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

              {/* Inbox */}
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

              {/* User Avatar */}
              <Avatar className="h-8 w-8">
                <AvatarImage src="/api/placeholder/32/32" alt="User" />
                <AvatarFallback className="bg-blue-600 text-white text-sm">
                  M
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </nav>
    </TooltipProvider>
  );
}
