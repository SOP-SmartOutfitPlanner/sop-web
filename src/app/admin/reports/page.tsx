"use client";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import {
  useAdminReports,
  usePendingReports,
  useAdminReportDetails,
} from "@/hooks/admin/useAdminReports";
import type {
  AdminReport,
  ReportType,
  ReportStatus,
} from "@/lib/api/admin-api";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useReportFilters } from "@/hooks/admin/useReportFilters";
import { useReportDetailModal } from "@/hooks/admin/useReportDetailModal";
import { useActiveFilterChips } from "@/hooks/admin/useActiveFilterChips";
import { ReportFilters } from "./components/ReportFilters";
import { ActiveFilterChips } from "./components/ActiveFilterChips";
import { StatsCards } from "./components/StatsCards";
import { ReportTable } from "./components/ReportTable";
import { Pagination } from "./components/Pagination";
import { ReportDetailModal } from "./components/ReportDetailModal";

export default function AdminReportsPage() {
  const defaultFromDate = useMemo(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), 0, 1);
    return firstDay.toISOString().slice(0, 10);
  }, []);

  // Filters hook
  const {
    filters,
    datePreset,
    handleFilterChange,
    clearFilter,
    clearAllFilters,
    handleResetFilters,
    applyDatePreset,
  } = useReportFilters(defaultFromDate);

  // Selected report state
  const [selectedReportId, setSelectedReportId] = useState<
    number | undefined
  >();

  // Detail modal hook
  const {
    noViolationNotes,
    setNoViolationNotes,
    actionForm,
    setActionForm,
    activeTab,
    setActiveTab,
    inlineFeedback,
    setInlineFeedback,
    lastActionSummary,
    suspendDaysInputRef,
    isResolveActionSuspension,
    isSuspensionDaysInvalid,
    canSubmitNoViolation,
    canSubmitAction,
    resolveNoViolationMutation,
    resolveWithActionMutation,
    handleResolveNoViolation,
    handleResolveWithAction,
  } = useReportDetailModal(selectedReportId);

  // Scroll lock when modal is open
  useScrollLock(!!selectedReportId);

  // Data fetching
  const {
    data: reportsData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useAdminReports(filters);
  const { data: pendingData } = usePendingReports({
    type: filters.type,
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    pageSize: 10,
    pageIndex: 1,
  });
  const { data: reportDetail, isLoading: isDetailLoading } =
    useAdminReportDetails(selectedReportId);

  // Transform data
  const reports = (reportsData ?? []) as AdminReport[];
  const pendingReports = (pendingData ?? []) as AdminReport[];

  // Active filter chips
  const activeFilterChips = useActiveFilterChips({
    type: filters.type,
    status: filters.status,
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    defaultFromDate,
  });

  // Pagination helpers - based on pageIndex and pageSize
  // Logic: Only allow next if current page has exactly pageSize items
  // If current page has fewer items than pageSize, there's no next page
  // This is the correct logic: if we get less than pageSize, we've reached the end
  const canGoNext = reports.length === filters.pageSize && reports.length > 0;
  const canGoPrev = filters.pageIndex > 1;

  // Auto-reset to page 1 if current page returns empty array and we're not on page 1
  // This handles the case where user navigates to a page that doesn't exist
  useEffect(() => {
    if (
      !isLoading &&
      !isFetching &&
      reports.length === 0 &&
      filters.pageIndex > 1
    ) {
      // Page doesn't exist (returned empty array), reset to page 1
      const timer = setTimeout(() => {
        handleFilterChange("pageIndex", 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [
    isLoading,
    isFetching,
    reports.length,
    filters.pageIndex,
    handleFilterChange,
  ]);

  // Handlers
  const handleSelectReport = (report: AdminReport) => {
    setSelectedReportId(report.id);
  };

  const handleCloseDetail = () => {
    setSelectedReportId(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-wide">
            Moderation
          </p>
          <h1 className="text-3xl font-semibold text-gray-900">
            Community Reports
          </h1>
          <p className="text-gray-600 mt-1">
            Review and resolve reports submitted by the community.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching || isLoading}
          className="gap-2"
        >
          {isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh data
        </Button>
      </div>

      <ReportFilters
        filters={{
          type: filters.type,
          status: filters.status,
          fromDate: filters.fromDate,
          toDate: filters.toDate,
        }}
        datePreset={datePreset}
        onFilterChange={(key, value) => {
          if (key === "type") {
            handleFilterChange("type", value as ReportType | undefined);
          } else if (key === "status") {
            handleFilterChange("status", value as ReportStatus | undefined);
          } else if (key === "fromDate") {
            handleFilterChange("fromDate", value as string | undefined);
          } else if (key === "toDate") {
            handleFilterChange("toDate", value as string | undefined);
          }
        }}
        onDatePresetChange={applyDatePreset}
        onReset={handleResetFilters}
      />

      <ActiveFilterChips
        chips={activeFilterChips}
        onClearFilter={clearFilter}
        onClearAll={clearAllFilters}
      />

      <StatsCards
        reports={reports}
        pendingReports={pendingReports}
        currentPage={filters.pageIndex}
      />

      <ReportTable
        reports={reports}
        isLoading={isLoading}
        error={error}
        pageSize={filters.pageSize}
        onSelectReport={handleSelectReport}
        onRetry={() => refetch()}
      />

      {!isLoading && !error && (
        <Pagination
          pageIndex={filters.pageIndex}
          pageSize={filters.pageSize}
          totalItems={reports.length}
          canGoNext={canGoNext}
          canGoPrev={canGoPrev}
          onPageChange={(page) => handleFilterChange("pageIndex", page)}
        />
      )}

      <ReportDetailModal
        reportId={selectedReportId}
        reportDetail={reportDetail}
        isLoading={isDetailLoading}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onClose={handleCloseDetail}
        noViolationNotes={noViolationNotes}
        onNoViolationNotesChange={setNoViolationNotes}
        actionForm={actionForm}
        onActionFormChange={setActionForm}
        suspendDaysInputRef={suspendDaysInputRef}
        isResolveActionSuspension={isResolveActionSuspension}
        isSuspensionDaysInvalid={isSuspensionDaysInvalid}
        inlineFeedback={inlineFeedback}
        onInlineFeedbackChange={setInlineFeedback}
        lastActionSummary={lastActionSummary}
        canSubmitNoViolation={canSubmitNoViolation}
        canSubmitAction={canSubmitAction}
        onResolveNoViolation={handleResolveNoViolation}
        onResolveWithAction={handleResolveWithAction}
        resolveNoViolationMutation={resolveNoViolationMutation}
        resolveWithActionMutation={resolveWithActionMutation}
      />
    </div>
  );
}
