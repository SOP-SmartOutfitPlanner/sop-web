import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  adminAPI,
  type GetReportsParams,
  type AdminReportDetail,
  type AdminReport,
} from "@/lib/api/admin-api";

export function useAdminReports(params: GetReportsParams = {}) {
  return useQuery<AdminReport[]>({
    queryKey: ["admin", "reports", params],
    queryFn: async () => {
      const response = await adminAPI.getReports(params);
      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function usePendingReports(params: GetReportsParams = {}) {
  return useQuery<AdminReport[]>({
    queryKey: ["admin", "reports", "pending", params],
    queryFn: async () => {
      const response = await adminAPI.getPendingReports(params);
      return response.data;
    },
    staleTime: 15_000,
  });
}

export function useAdminReportDetails(reportId?: number) {
  return useQuery<AdminReportDetail>({
    queryKey: ["admin", "reports", "detail", reportId],
    queryFn: async () => {
      if (!reportId) {
        throw new Error("Report ID is required");
      }
      const response = await adminAPI.getReportDetails(reportId);
      return response.data;
    },
    enabled: !!reportId,
    staleTime: 0,
  });
}

