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
    <Card className="border-0 shadow">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Filters</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
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
          <Button variant="ghost" className="gap-2" onClick={onReset}>
            <Filter className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Content type</p>
          <Select
            value={filters.type ?? "ALL"}
            onValueChange={(value) =>
              onFilterChange("type", value === "ALL" ? undefined : (value as ReportType))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              {reportTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {reportTypeLabels[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Status</p>
          <Select
            value={filters.status ?? "ALL"}
            onValueChange={(value) =>
              onFilterChange(
                "status",
                value === "ALL" ? undefined : (value as ReportStatus)
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              {reportStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {statusMetadata[status]?.label ?? status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">From date</p>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              className="pl-10"
              value={filters.fromDate ?? ""}
              onChange={(event) => {
                onDatePresetChange("custom");
                onFilterChange("fromDate", event.target.value || undefined);
              }}
            />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">To date</p>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              className="pl-10"
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

