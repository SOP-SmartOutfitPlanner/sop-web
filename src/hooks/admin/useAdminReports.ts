import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  adminAPI,
  type GetReportsParams,
  type GetReportersParams,
  type AdminReportDetail,
  type AdminReport,
  type Reporter,
  type PaginationMetaData,
} from "@/lib/api/admin-api";

export interface ReportsQueryResult {
  reports: AdminReport[];
  metaData: PaginationMetaData;
}

export function useAdminReports(params: GetReportsParams = {}) {
  return useQuery<ReportsQueryResult>({
    queryKey: ["admin", "reports", params],
    queryFn: async () => {
      const response = await adminAPI.getReports(params);
      return {
        reports: response.data.data,
        metaData: response.data.metaData,
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function usePendingReports(params: GetReportsParams = {}) {
  return useQuery<ReportsQueryResult>({
    queryKey: ["admin", "reports", "pending", params],
    queryFn: async () => {
      const response = await adminAPI.getPendingReports(params);
      return {
        reports: response.data.data,
        metaData: response.data.metaData,
      };
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

export interface ReportersQueryResult {
  reporters: Reporter[];
  metaData: PaginationMetaData;
}

export function useReportReporters(
  reportId?: number,
  params: GetReportersParams = {}
) {
  return useQuery<ReportersQueryResult>({
    queryKey: ["admin", "reports", "reporters", reportId, params],
    queryFn: async () => {
      if (!reportId) {
        throw new Error("Report ID is required");
      }
      const response = await adminAPI.getReportReporters(reportId, params);
      return {
        reporters: response.data.data,
        metaData: response.data.metaData,
      };
    },
    enabled: !!reportId,
    staleTime: 30_000,
  });
}

