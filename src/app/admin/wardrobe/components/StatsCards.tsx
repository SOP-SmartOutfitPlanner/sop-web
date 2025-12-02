"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Shirt, Sparkles, Database, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  isLoading: boolean;
  totalItems: number;
  analyzedItems: number;
  totalUsers: number;
}

export function StatsCards({
  isLoading,
  totalItems,
  analyzedItems,
  totalUsers,
}: StatsCardsProps) {
  const stats = [
    {
      label: "Total Items",
      value: totalItems,
      icon: Shirt,
      iconColor: "text-white",
      bgGradient: "from-white/10 to-white/5",
    },
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      iconColor: "text-cyan-400",
      bgGradient: "from-cyan-500/20 to-blue-500/20",
    },
    {
      label: "AI Analyzed",
      value: analyzedItems,
      icon: Sparkles,
      iconColor: "text-purple-400",
      bgGradient: "from-purple-500/20 to-pink-500/20",
    },
    {
      label: "Analysis Rate",
      value:
        totalItems > 0
          ? `${Math.round((analyzedItems / totalItems) * 100)}%`
          : "0%",
      icon: Database,
      iconColor: "text-green-400",
      bgGradient: "from-green-500/20 to-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className={cn(
              "border border-white/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 backdrop-blur-xl shadow-lg",
              `bg-gradient-to-br ${stat.bgGradient}`
            )}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={cn("h-5 w-5", stat.iconColor)} />
                    <p className="text-sm font-medium text-white/70">
                      {stat.label}
                    </p>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {isLoading ? (
                      <Loader2 className="w-7 h-7 animate-spin" />
                    ) : (
                      stat.value
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
