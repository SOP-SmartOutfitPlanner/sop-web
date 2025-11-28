"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  type TooltipContentProps,
} from "recharts";
import {
  StylistCollectionsMonthlyStat,
  StylistPostsMonthlyStat,
} from "@/lib/api";
import { ReactNode } from "react";

interface PulseChartPoint {
  label: string;
  engagement: number;
  likes: number;
  comments: number;
  extra: number;
}

type ChartTooltipProps = Pick<
  TooltipContentProps<number, string>,
  "active" | "payload" | "label"
> & {
  extraLabel: string;
};

const ChartTooltip = ({
  active,
  payload,
  label,
  extraLabel,
}: ChartTooltipProps) => {
  const tooltipPayload = payload ?? [];
  if (!active || tooltipPayload.length === 0) return null;
  const point = tooltipPayload[0]?.payload as PulseChartPoint | undefined;
  if (!point) return null;
  return (
    <div className="rounded-xl border border-white/20 bg-slate-950/95 p-4 text-xs text-white shadow-2xl backdrop-blur-xl">
      <p className="text-sm font-bold text-white/90">{label}</p>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-6">
          <span className="text-white/60">Total</span>
          <span className="text-lg font-bold">{point.engagement}</span>
        </div>
        <div className="flex items-center justify-between gap-6 border-t border-white/10 pt-2">
          <span className="text-white/60">👍 Likes</span>
          <span className="font-semibold">{point.likes}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-white/60">💬 Comments</span>
          <span className="font-semibold">{point.comments}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-white/60">{extraLabel}</span>
          <span className="font-semibold">{point.extra}</span>
        </div>
      </div>
    </div>
  );
};

ChartTooltip.displayName = "ChartTooltip";

export interface MonthlyPulseChartProps {
  title: string;
  icon: ReactNode;
  color: {
    stroke: string;
    gradientFrom: string;
    gradientTo: string;
  };
  emptyMessage: string;
  extraLabel: string;
  stats:
    | StylistCollectionsMonthlyStat[]
    | StylistPostsMonthlyStat[]
    | undefined;
  mapExtra: (
    stat: StylistCollectionsMonthlyStat | StylistPostsMonthlyStat
  ) => number;
}

const renderChartTooltip = (extraLabel: string) => {
  const TooltipContent = (props: TooltipContentProps<number, string>) => (
    <ChartTooltip {...props} extraLabel={extraLabel} />
  );
  TooltipContent.displayName = "MonthlyPulseChartTooltip";
  return TooltipContent;
};

export function MonthlyPulseChart({
  title,
  icon,
  color,
  emptyMessage,
  extraLabel,
  stats,
  mapExtra,
}: MonthlyPulseChartProps) {
  const chartData: PulseChartPoint[] =
    stats?.map((stat) => ({
      label: `${stat.monthName.slice(0, 3)} ${stat.year}`,
      engagement: stat.totalEngagement,
      likes: stat.likesReceived,
      comments: stat.commentsReceived,
      extra: mapExtra(stat),
    })) ?? [];

  const gradientId = `${title.replace(/\s+/g, "-")}-gradient`;
  const totalEngagement = chartData.reduce((sum, point) => sum + point.engagement, 0);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/50 to-slate-950/80 p-6 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/10">
      <div className="absolute right-0 top-0 h-32 w-32 translate-x-16 -translate-y-16 rounded-full bg-gradient-to-br from-cyan-500/10 to-purple-500/10 blur-3xl transition-all group-hover:scale-150" />
      
      <div className="relative space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-xs text-white/50">12-month performance overview</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
            {icon}
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5">
            <p className="text-sm text-white/50">{emptyMessage}</p>
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{totalEngagement}</span>
              <span className="text-sm text-white/60">total interactions</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={color.gradientFrom}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={color.gradientTo}
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="rgba(255,255,255,0.05)"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    stroke="rgba(255,255,255,0.3)"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "rgba(255,255,255,0.5)" }}
                  />
                  <Tooltip
                    content={renderChartTooltip(extraLabel)}
                    wrapperStyle={{ outline: "none" }}
                    cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="engagement"
                    stroke={color.stroke}
                    strokeWidth={3}
                    fill={`url(#${gradientId})`}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: color.stroke }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

MonthlyPulseChart.displayName = "MonthlyPulseChart";
