"use client";

import { useMemo, useState, type RefObject } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import type {
  AdminReport,
  AdminReportDetail,
  ResolveReportAction,
} from "@/lib/api/admin-api";
import type { ApiResponse } from "@/lib/types/api.types";
import type { UseMutationResult } from "@tanstack/react-query";
import { ReportHeader } from "./ReportHeader";
import { SummaryTab } from "./SummaryTab";
import { HistoryTab } from "./HistoryTab";
import { ActionsTab } from "./ActionsTab";
import { ImageGalleryModal } from "./ImageGalleryModal";
import { actionDefinitions } from "../constants";
import { formatDate } from "../utils";
import { MAX_VISIBLE_IMAGES } from "./constants";
import { AlertCircle, History, ShieldCheck, UserX, Info } from "lucide-react";

interface ReportDetailModalProps {
  reportId?: number;
  reportDetail?: AdminReportDetail;
  isLoading: boolean;
  activeTab: "summary" | "history" | "actions";
  onTabChange: (tab: "summary" | "history" | "actions") => void;
  onClose: () => void;
  noViolationNotes: string;
  onNoViolationNotesChange: (notes: string) => void;
  actionForm: {
    action: ResolveReportAction;
    notes: string;
    suspensionDays: number;
  };
  onActionFormChange: (form: {
    action: ResolveReportAction;
    notes: string;
    suspensionDays: number;
  }) => void;
  suspendDaysInputRef: RefObject<HTMLInputElement | null>;
  isResolveActionSuspension: boolean;
  isSuspensionDaysInvalid: boolean;
  inlineFeedback: {
    type: "success" | "error";
    message: string;
  } | null;
  onInlineFeedbackChange: (
    feedback: {
      type: "success" | "error";
      message: string;
    } | null
  ) => void;
  lastActionSummary: {
    title: string;
    description: string;
  } | null;
  canSubmitNoViolation: boolean;
  canSubmitAction: boolean;
  onResolveNoViolation: () => void;
  onResolveWithAction: () => void;
  resolveNoViolationMutation: UseMutationResult<
    ApiResponse<AdminReport>,
    Error,
    string
  >;
  resolveWithActionMutation: UseMutationResult<
    ApiResponse<AdminReport>,
    Error,
    {
      action: ResolveReportAction;
      notes: string;
      suspensionDays?: number;
    }
  >;
}

export function ReportDetailModal({
  reportId,
  reportDetail,
  isLoading,
  activeTab,
  onTabChange,
  onClose,
  noViolationNotes,
  onNoViolationNotesChange,
  actionForm,
  onActionFormChange,
  suspendDaysInputRef,
  isResolveActionSuspension,
  isSuspensionDaysInvalid,
  inlineFeedback,
  onInlineFeedbackChange,
  lastActionSummary,
  canSubmitNoViolation,
  canSubmitAction,
  onResolveNoViolation,
  onResolveWithAction,
  resolveNoViolationMutation,
  resolveWithActionMutation,
}: ReportDetailModalProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const visibleImages = useMemo(
    () => reportDetail?.content.images?.slice(0, MAX_VISIBLE_IMAGES) || [],
    [reportDetail?.content.images]
  );

  const hasMoreImages = useMemo(
    () => (reportDetail?.content.images?.length || 0) > MAX_VISIBLE_IMAGES,
    [reportDetail?.content.images]
  );

  const totalImagesCount = useMemo(
    () => reportDetail?.content.images?.length || 0,
    [reportDetail?.content.images]
  );

  const historyItems = useMemo(() => {
    if (!reportDetail) return [];
    const base = [
      {
        id: "created",
        title: "Report submitted",
        description: `Report submitted by ${reportDetail.originalReporter.displayName}`,
        time: formatDate(reportDetail.createdDate),
        icon: AlertCircle,
      },
    ];

    if (reportDetail.status === "IN_PROGRESS") {
      base.push({
        id: "in-progress",
        title: "Under review",
        description: "Report has been assigned for moderation.",
        time: formatDate(reportDetail.createdDate),
        icon: History,
      });
    }

    if (reportDetail.resolvedAt) {
      base.push({
        id: "resolved",
        title: "Resolved",
        description:
          reportDetail.status === "RESOLVED"
            ? "Report was processed and closed."
            : "Report status was updated.",
        time: formatDate(reportDetail.resolvedAt),
        icon: ShieldCheck,
      });
    }

    if (reportDetail.action !== "NONE") {
      const actionDef =
        actionDefinitions[reportDetail.action as ResolveReportAction];
      base.push({
        id: "action",
        title: `Action: ${actionDef?.title ?? reportDetail.action}`,
        description:
          actionDef?.consequence ??
          "An action was applied to the content/account.",
        time: reportDetail.resolvedAt
          ? formatDate(reportDetail.resolvedAt)
          : formatDate(reportDetail.createdDate),
        icon: UserX,
      });
    }

    if (reportDetail.resolutionNotes) {
      base.push({
        id: "notes",
        title: "Resolution notes",
        description: reportDetail.resolutionNotes,
        time: reportDetail.resolvedAt
          ? formatDate(reportDetail.resolvedAt)
          : formatDate(reportDetail.createdDate),
        icon: Info,
      });
    }

    return base;
  }, [reportDetail]);

  return (
    <>
      <Dialog open={!!reportId} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          className="min-w-4xl w-[95vw] max-h-[90vh] overflow-hidden p-0 flex flex-col border-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 58, 138, 0.95) 50%, rgba(15, 23, 42, 0.98) 100%)",
            backdropFilter: "blur(20px)",
            boxShadow:
              "0 0 60px rgba(6, 182, 212, 0.15), 0 0 100px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
          onInteractOutside={(e) => {
            const target = e.target as HTMLElement;
            if (
              target.closest(".ant-image-preview-wrap") ||
              target.closest(".ant-image-preview") ||
              target.closest('[class*="ant-image-preview"]')
            ) {
              e.preventDefault();
            }
          }}
        >
          {/* Decorative glow orbs */}
          <div
            className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
            }}
          />

          <VisuallyHidden>
            <DialogTitle>
              {reportDetail
                ? `Report #${reportDetail.id} Details`
                : "Report Details"}
            </DialogTitle>
          </VisuallyHidden>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 min-h-[400px] relative z-10">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
                <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-cyan-400/20" />
              </div>
              <p className="text-sm font-medium text-white/80 mt-4">
                Loading report details...
              </p>
              <p className="text-xs text-white/50 mt-1">
                Please wait while we fetch the information
              </p>
            </div>
          ) : reportDetail ? (
            <TooltipProvider>
              <div
                className="flex-1 overflow-y-auto overscroll-contain scroll-smooth relative z-10"
                onWheel={(e) => {
                  e.stopPropagation();
                }}
              >
                <Tabs
                  value={activeTab}
                  onValueChange={(value) =>
                    onTabChange(value as "summary" | "history" | "actions")
                  }
                  className="flex flex-col"
                >
                  <ReportHeader
                    reportDetail={reportDetail}
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                  />

                  <div className="px-6 pb-6 pt-6">
                    <TabsContent value="summary" className="mt-0">
                      <SummaryTab
                        reportDetail={reportDetail}
                        visibleImages={visibleImages}
                        hasMoreImages={hasMoreImages}
                        totalImagesCount={totalImagesCount}
                        onOpenImageModal={() => setIsImageModalOpen(true)}
                      />
                    </TabsContent>

                    <TabsContent value="history" className="mt-0">
                      <HistoryTab historyItems={historyItems} />
                    </TabsContent>

                    <TabsContent value="actions">
                      <ActionsTab
                        reportDetail={reportDetail}
                        actionForm={actionForm}
                        onActionFormChange={onActionFormChange}
                        suspendDaysInputRef={suspendDaysInputRef}
                        isResolveActionSuspension={isResolveActionSuspension}
                        isSuspensionDaysInvalid={isSuspensionDaysInvalid}
                        inlineFeedback={inlineFeedback}
                        onInlineFeedbackChange={onInlineFeedbackChange}
                        lastActionSummary={lastActionSummary}
                        noViolationNotes={noViolationNotes}
                        onNoViolationNotesChange={onNoViolationNotesChange}
                        canSubmitNoViolation={canSubmitNoViolation}
                        canSubmitAction={canSubmitAction}
                        onResolveNoViolation={onResolveNoViolation}
                        onResolveWithAction={onResolveWithAction}
                        onTabChange={onTabChange}
                        resolveNoViolationMutation={resolveNoViolationMutation}
                        resolveWithActionMutation={resolveWithActionMutation}
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </TooltipProvider>
          ) : (
            <p className="px-6 py-8 text-sm text-muted-foreground">
              No detail data found for this report.
            </p>
          )}
        </DialogContent>
      </Dialog>

      {reportDetail && totalImagesCount > 0 && (
        <ImageGalleryModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          reportDetail={reportDetail}
        />
      )}
    </>
  );
}
