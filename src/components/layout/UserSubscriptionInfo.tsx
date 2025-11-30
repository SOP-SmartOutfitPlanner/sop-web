"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Sparkles, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { useCurrentSubscription } from "@/hooks/subscription/useSubscription";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserSubscriptionInfo() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const { data: subscriptionData, refetch } = useCurrentSubscription();
  const isStylist = user?.role?.toUpperCase() === "STYLIST";

  // Listen for subscription refresh event
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleRefresh = () => {
      // Refetch current subscription data
      refetch();
      // Invalidate query cache to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["subscription", "current"] });
    };

    window.addEventListener("subscription:refresh", handleRefresh);
    return () => {
      window.removeEventListener("subscription:refresh", handleRefresh);
    };
  }, [refetch, queryClient]);

  if (!user) return null;

  const subscription = subscriptionData?.data;
  const subscriptionName = subscription?.subscriptionPlanName || "Free";
  const isPremium = subscriptionName.toLowerCase() !== "free";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Get user initials for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 px-3 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all cursor-pointer group"
        >
          {/* Avatar */}
          <Avatar className="w-9 h-9 border-2 border-white/30">
            <AvatarImage src={user.avatar || ""} alt={user.displayName || "User"} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-sm font-semibold">
              {getInitials(user.displayName)}
            </AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="flex flex-col items-start min-w-0 pe-2">
            <span className="text-white font-bricolage font-semibold text-sm truncate max-w-[120px]">
              {user.displayName || "User"}
            </span>
            <div className="flex items-center gap-1.5">
              {isPremium ? (
                <>
                  <Crown className="w-3 h-3 text-yellow-400" />
                  <span className="text-yellow-400 font-poppins text-xs font-medium">
                    {subscriptionName}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-gray-300 flex-shrink-0" />
                  <span className="text-gray-300 font-poppins text-xs leading-none">
                    Free Plan
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Premium Badge */}
          {isPremium && (
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 10 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 2,
              }}
              className="absolute -top-1 -right-1"
            >
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1">
                <Crown className="w-3 h-3 text-white" />
              </div>
            </motion.div>
          )}
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-white/95 backdrop-blur-md" align="end">
        {/* User Header */}
        <div className="flex items-center gap-3 p-3 border-b">
          <Avatar className="w-12 h-12 border-2 border-blue-500/30">
            <AvatarImage src={user.avatar || ""} alt={user.displayName || "User"} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-semibold">
              {getInitials(user.displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <p className="font-bricolage font-semibold text-sm truncate">
              {user.displayName || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>

        {/* Subscription Info */}
        {subscription && (
          <div
            onClick={() => router.push("/subscription?tab=current")}
            className="p-3 border-b bg-gradient-to-r from-blue-50 to-cyan-50 cursor-pointer hover:from-blue-100 hover:to-cyan-100 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Current subscription</span>
              {isPremium && <Crown className="w-4 h-4 text-yellow-500" />}
            </div>
            <p className="font-semibold text-sm text-blue-600">
              {subscription.subscriptionPlanName}
            </p>
            {subscription.dateExp && (
              <p className="text-xs text-muted-foreground mt-1">
                {isPremium ? "Expires" : "Renew"}: {new Date(subscription.dateExp).toLocaleDateString("en-US")}
              </p>
            )}
          </div>
        )}

        {/* Menu Items */}
        <DropdownMenuItem
          onClick={() => router.push(`/community/profile/${user.id}`)}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>

        {isStylist && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/stylist")}
              className="cursor-pointer"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Stylist Studio
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
