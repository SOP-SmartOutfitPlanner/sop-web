import { useState } from "react";
import { addDays, startOfMonth, startOfWeek, startOfYear } from "date-fns";
import type { ReportStatus, ReportType } from "@/lib/api/admin-api";

export interface ReportFilters {
  pageIndex: number;
  pageSize: number;
  type?: ReportType;
  status?: ReportStatus;
  fromDate?: string;
  toDate?: string;
}

export type DatePreset = "week" | "month" | "year" | "custom";

export function useReportFilters(defaultFromDate: string) {
  const [filters, setFilters] = useState<ReportFilters>({
    pageIndex: 1,
    pageSize: 10,
    type: undefined,
    status: undefined,
    fromDate: defaultFromDate,
    toDate: undefined,
  });

  const [datePreset, setDatePreset] = useState<DatePreset>("year");

  const handleFilterChange = <K extends keyof ReportFilters>(
    key: K,
    value: ReportFilters[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      pageIndex: key === "pageIndex" ? (value as number) : 1,
      [key]: value,
    }));
  };

  const clearFilter = (key: "type" | "status" | "fromDate" | "toDate") => {
    setFilters((prev) => {
      const next = { ...prev, pageIndex: 1 };
      if (key === "type") next.type = undefined;
      if (key === "status") next.status = undefined;
      if (key === "fromDate") next.fromDate = undefined;
      if (key === "toDate") next.toDate = undefined;
      return next;
    });
  };

  const clearAllFilters = () => {
    setFilters((prev) => ({
      ...prev,
      pageIndex: 1,
      type: undefined,
      status: undefined,
      fromDate: undefined,
      toDate: undefined,
    }));
    setDatePreset("custom");
  };

  const handleResetFilters = () => {
    setFilters({
      pageIndex: 1,
      pageSize: 10,
      type: undefined,
      status: undefined,
      fromDate: defaultFromDate,
      toDate: undefined,
    });
    setDatePreset("year");
  };

  const applyDatePreset = (preset: DatePreset) => {
    setDatePreset(preset);
    if (preset === "custom") {
      return;
    }

    const today = new Date();
    let fromDate: Date;
    if (preset === "week") {
      fromDate = startOfWeek(today, { weekStartsOn: 1 });
    } else if (preset === "month") {
      fromDate = startOfMonth(today);
    } else {
      fromDate = startOfYear(today);
    }

    setFilters((prev) => ({
      ...prev,
      pageIndex: 1,
      fromDate: fromDate.toISOString().slice(0, 10),
      toDate: addDays(today, 1).toISOString().slice(0, 10),
    }));
  };

  return {
    filters,
    datePreset,
    setFilters,
    setDatePreset,
    handleFilterChange,
    clearFilter,
    clearAllFilters,
    handleResetFilters,
    applyDatePreset,
  };
}

