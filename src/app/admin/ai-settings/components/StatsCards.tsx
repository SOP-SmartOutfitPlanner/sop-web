"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Settings, Key, Cpu, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AISetting } from "@/lib/api/admin-api";

interface StatsCardsProps {
  isLoading: boolean;
  allSettings: AISetting[];
}

export function StatsCards({ isLoading, allSettings }: StatsCardsProps) {
  const stats = [
    {
      label: "Total Settings",
      value: allSettings.length,
      icon: Settings,
      color: "text-slate-700",
      bgGradient: "from-slate-50 to-slate-100",
      borderColor: "border-slate-200",
    },
    {
      label: "API Keys",
      value: allSettings.filter((s) => s.type.includes("API")).length,
      icon: Key,
      color: "text-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
    },
    {
      label: "Models",
      value: allSettings.filter((s) => s.type.includes("MODEL")).length,
      icon: Cpu,
      color: "text-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      borderColor: "border-purple-200",
    },
    {
      label: "Prompts",
      value: allSettings.filter((s) => s.type.includes("PROMPT")).length,
      icon: FileText,
      color: "text-green-600",
      bgGradient: "from-green-50 to-green-100",
      borderColor: "border-green-200",
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
              "border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
              stat.borderColor,
              `bg-gradient-to-br ${stat.bgGradient}`
            )}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={cn("h-5 w-5", stat.color)} />
                    <p className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                  </div>
                  <div className={cn("text-3xl font-bold", stat.color)}>
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
