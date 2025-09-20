"use client";

import {
  TrendingUp,
  Package,
  Shirt,
  PaintBucket,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useWardrobeStats } from "@/hooks/useWardrobeStats";
import { TypeKind } from "@/types";
import { FillGoal } from "./fill-goal";
import { cn } from "@/lib/utils";

const typeColors: Record<TypeKind, string> = {
  top: "#3B82F6",
  bottom: "#10B981",
  shoes: "#F59E0B",
  outer: "#8B5CF6",
  accessory: "#EF4444",
};

interface SidebarStatsProps {
  className?: string;
}

export function SidebarStats({ className }: SidebarStatsProps) {
  const { counts, byColor, mostWorn, neverWorn, loading } = useWardrobeStats();

  if (loading) {
    return (
      <aside className={cn("w-full space-y-6", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-24 mb-4" />
              <div className="space-y-2">
                <div className="h-8 bg-muted rounded" />
                <div className="h-6 bg-muted rounded w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </aside>
    );
  }

  // Prepare chart data
  const typeData = Object.entries(counts)
    .filter(([key]) => key !== "total")
    .map(([type, count]) => ({
      name: type,
      value: count,
      color: typeColors[type as TypeKind],
    }));

  const colorData = byColor.slice(0, 6).map((item) => ({
    name: item.name,
    count: item.count,
    color: item.color,
  }));

  // Calculate items by category for FillGoal
  const itemsByCategory = Object.entries(counts)
    .filter(([key]) => key !== "total")
    .reduce((acc, [type, count]) => {
      acc[type] = count;
      return acc;
    }, {} as Record<string, number>);

  return (
    <aside className={cn("w-full space-y-6", className)}>
      {/* Fill Goal Component */}
      <FillGoal totalItems={counts.total} itemsByCategory={itemsByCategory} />

      {/* Wardrobe Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            Wardrobe Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Total Items */}
          <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
            <div className="text-3xl font-bold text-primary">
              {counts.total}
            </div>
            <div className="text-sm text-muted-foreground">Total Items</div>
          </div>

          {/* Type Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(counts)
              .filter(([key]) => key !== "total")
              .map(([type, count]) => (
                <div
                  key={type}
                  className="text-center p-3 bg-muted/30 rounded-lg"
                >
                  <div className="text-lg font-semibold">{count}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {type}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Type Distribution Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shirt className="w-5 h-5" />
            Type Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">
                              {data.name}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {data.value} item{data.value !== 1 ? "s" : ""}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {typeData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="capitalize">{entry.name}</span>
                <span className="text-muted-foreground">({entry.value})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <PaintBucket className="w-5 h-5" />
            Popular Colors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={colorData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: data.color }}
                            />
                            <span className="font-medium">{label}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {data.count} item{data.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {colorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Most Worn Items */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Most Worn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mostWorn.slice(0, 5).map((item, index) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-lg border"
                />
                <div className="absolute -top-1 -left-1 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Progress
                    value={((item.timesWorn || 0) / 40) * 100}
                    className="h-1 flex-1"
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {item.timesWorn || 0} wears
                  </span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </aside>
  );
}
