import { cn } from "@/lib/utils";
import type { ReportStatus } from "@/lib/api/admin-api";
import { statusMetadata } from "../constants";

interface StatusBadgeProps {
  status: ReportStatus;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({
  status,
  size = "md",
  className,
}: StatusBadgeProps) {
  const info = statusMetadata[status];
  const Icon = info?.icon;
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full backdrop-blur-sm",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
        info?.color,
        className
      )}
    >
      {Icon && <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />}
      {info?.label ?? status}
    </div>
  );
}
