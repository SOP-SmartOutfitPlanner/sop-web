"use client";

import GlassCard from "@/components/ui/glass-card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  type TooltipProps,
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

type RechartsTooltipPayload = ReadonlyArray<{ payload: PulseChartPoint }>;

interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: RechartsTooltipPayload;
  extraLabel: string;
}

const ChartTooltip = ({
  active,
  payload,
  label,
  extraLabel,
}: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as PulseChartPoint;
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/90 p-3 text-xs text-white shadow-lg">
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-1 text-base font-bold">
        {point.engagement} interactions
      </p>
      <p className="text-white/80">👍 {point.likes} likes</p>
      <p className="text-white/80">💬 {point.comments} comments</p>
      <p className="text-white/80">
        {extraLabel} {point.extra}
      </p>
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

type TooltipPropsWithData = TooltipProps<number, string> & {
  payload?: RechartsTooltipPayload;
  label?: string | number;
};

const renderChartTooltip = (extraLabel: string) => {
  const TooltipContent = (props: TooltipProps<number, string>) => (
    <ChartTooltip
      active={props.active}
      payload={(props as TooltipPropsWithData).payload}
      label={(props as TooltipPropsWithData).label}
      extraLabel={extraLabel}
    />
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

  return (
    <GlassCard
      padding="1.75rem"
      blur="16px"
      glowColor="rgba(59, 130, 246, 0.2)"
      className="border border-white/10 bg-slate-950/60 text-white"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-sm text-white/60">Past 12 months</p>
        </div>
        {icon}
      </div>
      {chartData.length === 0 ? (
        <p className="text-sm text-white/70">{emptyMessage}</p>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="15%"
                    stopColor={color.gradientFrom}
                    stopOpacity={0.6}
                  />
                  <stop
                    offset="100%"
                    stopColor={color.gradientTo}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                stroke="rgba(255,255,255,0.4)"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                content={renderChartTooltip(extraLabel)}
                wrapperStyle={{ outline: "none" }}
                cursor={{ stroke: "rgba(255,255,255,0.2)" }}
              />
              <Area
                type="monotone"
                dataKey="engagement"
                stroke={color.stroke}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </GlassCard>
  );
}

MonthlyPulseChart.displayName = "MonthlyPulseChart";
