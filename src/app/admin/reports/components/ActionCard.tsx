"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResolveReportAction } from "@/lib/api/admin-api";
import { actionDefinitions } from "../constants";
import { ACTION_COLORS, DEFAULT_ACTION_COLORS } from "./constants";

interface ActionCardProps {
  action: ResolveReportAction;
  isSelected: boolean;
  onSelect: (action: ResolveReportAction) => void;
}

export function ActionCard({ action, isSelected, onSelect }: ActionCardProps) {
  const definition = actionDefinitions[action];
  const colors =
    ACTION_COLORS[action as keyof typeof ACTION_COLORS] ||
    DEFAULT_ACTION_COLORS;

  return (
    <button
      type="button"
      onClick={() => onSelect(action)}
      className={cn(
        "group relative flex flex-col items-start gap-4 rounded-2xl border-2 p-6 text-left transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900",
        isSelected ? colors.selected : cn(colors.default, "focus:ring-white/30")
      )}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(action);
        }
      }}
    >
      {isSelected && (
        <div className="absolute top-3 right-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/80 shadow-sm">
            <CheckCircle2 className={cn("h-4 w-4", colors.iconColor)} />
          </div>
        </div>
      )}

      <div
        className={cn(
          "flex items-center justify-center rounded-2xl p-4 transition-all duration-200",
          isSelected
            ? cn(colors.iconBg, colors.iconColor)
            : "bg-white/10 text-white/60 group-hover:bg-white/15"
        )}
      >
        <definition.icon className="h-8 w-8" />
      </div>

      <div className="flex-1 space-y-2 w-full">
        <div className="flex items-center justify-between gap-2">
          <h3
            className={cn(
              "text-lg font-bold",
              isSelected ? colors.titleColor : "text-white"
            )}
          >
            {definition.title}
          </h3>
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-semibold",
              isSelected
                ? colors.badgeColor
                : "bg-white/10 text-white/70 border-white/20"
            )}
          >
            {action}
          </Badge>
        </div>
        <p
          className={cn(
            "text-sm leading-relaxed",
            isSelected ? "text-white/80" : "text-white/60"
          )}
        >
          {definition.description}
        </p>
        <div className="flex items-start gap-2 pt-1">
          <Info
            className={cn(
              "h-4 w-4 mt-0.5 shrink-0",
              isSelected ? colors.iconColor : "text-white/40"
            )}
          />
          <p
            className={cn(
              "text-xs leading-relaxed",
              isSelected ? "text-white/70" : "text-white/50"
            )}
          >
            {definition.consequence}
          </p>
        </div>
      </div>
    </button>
  );
}
