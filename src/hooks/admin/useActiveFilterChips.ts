import { useMemo } from "react";
import type { ReportStatus, ReportType } from "@/lib/api/admin-api";
import { reportTypeLabels, statusMetadata } from "@/app/admin/reports/constants";

export interface FilterChip {
  key: "type" | "status" | "fromDate" | "toDate";
  label: string;
}

interface UseActiveFilterChipsParams {
  type?: ReportType;
  status?: ReportStatus;
  fromDate?: string;
  toDate?: string;
  defaultFromDate: string;
}

export function useActiveFilterChips({
  type,
  status,
  fromDate,
  toDate,
  defaultFromDate,
}: UseActiveFilterChipsParams) {
  const activeFilterChips = useMemo(
    () =>
      [
        type
          ? {
              key: "type" as const,
              label: `Type: ${reportTypeLabels[type]}`,
            }
          : null,
        status
          ? {
              key: "status" as const,
              label: `Status: ${statusMetadata[status]?.label ?? status}`,
            }
          : null,
        fromDate && fromDate !== defaultFromDate
          ? {
              key: "fromDate" as const,
              label: `From: ${fromDate}`,
            }
          : null,
        toDate
          ? {
              key: "toDate" as const,
              label: `To: ${toDate}`,
            }
          : null,
      ].filter(Boolean) as FilterChip[],
    [type, status, fromDate, toDate, defaultFromDate]
  );

  return activeFilterChips;
}

