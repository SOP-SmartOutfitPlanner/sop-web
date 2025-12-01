"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Filter } from "lucide-react";
import type { ReportStatus, ReportType } from "@/lib/api/admin-api";
import { reportStatuses, reportTypes, reportTypeLabels, statusMetadata } from "../constants";

interface ReportFiltersProps {
  filters: {
    type?: ReportType;
    status?: ReportStatus;
    fromDate?: string;
    toDate?: string;
  };
  datePreset: "week" | "month" | "year" | "custom";
  onFilterChange: <K extends keyof ReportFiltersProps["filters"]>(
    key: K,
    value: ReportFiltersProps["filters"][K] | undefined
  ) => void;
  onDatePresetChange: (preset: "week" | "month" | "year" | "custom") => void;
  onReset: () => void;
}

export function ReportFilters({
  filters,
  datePreset,
  onFilterChange,
  onDatePresetChange,
  onReset,
}: ReportFiltersProps) {
  return (
    <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-white">Filters</CardTitle>
          <p className="text-sm text-white/60 mt-1">
            Combine filters to narrow down the report list.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["week", "month", "year", "custom"] as const).map((preset) => (
            <Button
              key={preset}
              variant={datePreset === preset ? "default" : "outline"}
              size="sm"
              onClick={() => onDatePresetChange(preset)}
              className={
                datePreset === preset
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 border-0"
                  : "border-white/20 bg-white/5 text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/50"
              }
            >
              {preset === "week"
                ? "This week"
                : preset === "month"
                ? "This month"
                : preset === "year"
                ? "This year"
                : "Custom"}
            </Button>
          ))}
          <Button variant="ghost" className="gap-2 text-white hover:bg-white/10" onClick={onReset}>
            <Filter className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-white/60">Content type</p>
          <Select
            value={filters.type ?? "ALL"}
            onValueChange={(value) =>
              onFilterChange("type", value === "ALL" ? undefined : (value as ReportType))
            }
          >
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-white/10">
              <SelectItem value="ALL" className="text-white hover:bg-white/10 focus:bg-white/10">All</SelectItem>
              {reportTypes.map((type) => (
                <SelectItem key={type} value={type} className="text-white hover:bg-white/10 focus:bg-white/10">
                  {reportTypeLabels[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-white/60">Status</p>
          <Select
            value={filters.status ?? "ALL"}
            onValueChange={(value) =>
              onFilterChange(
                "status",
                value === "ALL" ? undefined : (value as ReportStatus)
              )
            }
          >
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-white/10">
              <SelectItem value="ALL" className="text-white hover:bg-white/10 focus:bg-white/10">All</SelectItem>
              {reportStatuses.map((status) => (
                <SelectItem key={status} value={status} className="text-white hover:bg-white/10 focus:bg-white/10">
                  {statusMetadata[status]?.label ?? status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-white/60">From date</p>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              type="date"
              className="pl-10 bg-white/5 border-white/20 text-white"
              value={filters.fromDate ?? ""}
              onChange={(event) => {
                onDatePresetChange("custom");
                onFilterChange("fromDate", event.target.value || undefined);
              }}
            />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-white/60">To date</p>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              type="date"
              className="pl-10 bg-white/5 border-white/20 text-white"
              value={filters.toDate ?? ""}
              onChange={(event) => {
                onDatePresetChange("custom");
                onFilterChange("toDate", event.target.value || undefined);
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

