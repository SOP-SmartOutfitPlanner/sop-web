"use client";

import { useMemo, type RefObject } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertCircle,
  CheckCircle2,
  History,
  Info,
  Loader2,
  ShieldCheck,
  UserX,
} from "lucide-react";
import { Image } from "antd";
import { cn } from "@/lib/utils";
import type {
  AdminReport,
  AdminReportDetail,
  ResolveReportAction,
} from "@/lib/api/admin-api";
import type { ApiResponse } from "@/lib/types/api.types";
import type { UseMutationResult } from "@tanstack/react-query";
import { StatusBadge } from "./StatusBadge";
import {
  actionDefinitions,
  actionableReportActions,
  reportTypeLabels,
  statusMetadata,
} from "../constants";
import { formatDate, getInitials } from "../utils";

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
  onInlineFeedbackChange: (feedback: {
    type: "success" | "error";
    message: string;
  } | null) => void;
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
  const historyItems = useMemo(() => {
    if (!reportDetail) return [];
    const base = [
      {
        id: "created",
        title: "Report submitted",
        description: reportDetail.description,
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
    <Dialog open={!!reportId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="min-w-4xl w-[95vw] max-h-[90vh] overflow-hidden p-0 flex flex-col"
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
        {isLoading ? (
          <div className="flex flex-col items-center justify-center px-6 py-12">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-3" />
            <p className="text-sm text-muted-foreground">
              Loading report details...
            </p>
          </div>
        ) : reportDetail ? (
          <TooltipProvider>
            <div
              className="flex-1 overflow-y-auto overscroll-contain scroll-smooth"
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
                <div className="sticky top-0 z-20 border-b bg-white/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-white/95">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Report #{reportDetail.id}
                      </p>
                      <p className="text-lg font-semibold text-slate-900">
                        {reportTypeLabels[reportDetail.type]} •{" "}
                        {reportDetail.postId
                          ? `Content #${reportDetail.postId}`
                          : reportDetail.commentId
                          ? `Content #${reportDetail.commentId}`
                          : `Report #${reportDetail.id}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Created at {formatDate(reportDetail.createdDate)}
                      </p>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <StatusBadge
                          status={reportDetail.status}
                          className="shadow-sm"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        {statusMetadata[reportDetail.status]?.tooltip}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  {reportDetail.status !== "RESOLVED" && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant={
                          activeTab === "actions" ? "default" : "secondary"
                        }
                        onClick={() => onTabChange("actions")}
                      >
                        Go to actions
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onTabChange("summary")}
                      >
                        View summary
                      </Button>
                    </div>
                  )}
                  <TabsList className="mt-4">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                  </TabsList>
                </div>

                <div className="px-6 pb-6">
                  <TabsContent value="summary">
                    <div className="space-y-4">
                      {/* Priority 1: Flagged Content */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-900">
                            Flagged Content
                          </p>
                          <span className="text-xs text-muted-foreground">
                            ID #{reportDetail.content.contentId} •{" "}
                            {reportTypeLabels[reportDetail.content.contentType]}
                          </span>
                        </div>
                        <div className="rounded-xl border-2 border-red-200 bg-red-50/50 p-4 space-y-3">
                          {reportDetail.content.body && (
                            <div
                              className="prose prose-sm max-w-none text-slate-800"
                              dangerouslySetInnerHTML={{
                                __html: reportDetail.content.body ?? "",
                              }}
                            />
                          )}
                          {reportDetail.content.images &&
                            reportDetail.content.images.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {reportDetail.content.images.map(
                                  (image, index) => (
                                    <div key={image}>
                                      <Image
                                        preview={{
                                          mask: (
                                            <div className="text-xs uppercase tracking-[0.3em] text-white">
                                              Preview
                                            </div>
                                          ),
                                        }}
                                        src={image}
                                        alt={`Content #${reportDetail.content.contentId} - image ${index + 1}`}
                                        className="h-48 w-full object-cover"
                                      />
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Priority 2: Report Description */}
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-slate-900">
                          Report Reason
                        </p>
                        <blockquote className="border-l-4 border-blue-500 bg-blue-50/50 pl-4 py-3 pr-4 rounded-r-lg text-sm text-slate-700 italic">
                          {reportDetail.description}
                        </blockquote>
                      </div>

                      {/* Priority 3: Compact Metadata */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                          <p className="text-xs text-muted-foreground mb-1">
                            Type
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {reportTypeLabels[reportDetail.type]}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            #{reportDetail.id}
                          </p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                          <p className="text-xs text-muted-foreground mb-1">
                            Status
                          </p>
                          <StatusBadge
                            status={reportDetail.status}
                            size="sm"
                            className="mt-1"
                          />
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                          <p className="text-xs text-muted-foreground mb-1">
                            Action
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {actionDefinitions[
                              reportDetail.action as ResolveReportAction
                            ]?.title ?? "None"}
                          </p>
                        </div>
                      </div>

                      {/* Priority 4: Reporter & Author */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                          <p className="text-xs text-muted-foreground mb-2">
                            Reporter
                          </p>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              {reportDetail.reporter.avatarUrl && (
                                <AvatarImage
                                  src={reportDetail.reporter.avatarUrl}
                                  alt={reportDetail.reporter.displayName}
                                />
                              )}
                              <AvatarFallback className="bg-slate-100 text-xs font-semibold text-slate-700">
                                {getInitials(reportDetail.reporter.displayName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {reportDetail.reporter.displayName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {reportDetail.reporter.email}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                          <p className="text-xs text-muted-foreground mb-2">
                            Content Author
                          </p>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              {reportDetail.author.avatarUrl && (
                                <AvatarImage
                                  src={reportDetail.author.avatarUrl}
                                  alt={reportDetail.author.displayName}
                                />
                              )}
                              <AvatarFallback className="bg-blue-100 text-xs font-semibold text-blue-700">
                                {getInitials(reportDetail.author.displayName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {reportDetail.author.displayName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {reportDetail.authorWarningCount} warnings •{" "}
                                {reportDetail.authorSuspensionCount}{" "}
                                suspensions
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Priority 5: Dates & Resolution Notes */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                          <p className="text-xs text-muted-foreground mb-1">
                            Created
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {formatDate(reportDetail.createdDate)}
                          </p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                          <p className="text-xs text-muted-foreground mb-1">
                            Resolved
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {reportDetail.resolvedAt
                              ? formatDate(reportDetail.resolvedAt)
                              : "—"}
                          </p>
                        </div>
                      </div>

                      {reportDetail.resolutionNotes && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                          <p className="text-xs text-muted-foreground mb-1">
                            Resolution Notes
                          </p>
                          <p className="text-sm text-slate-700">
                            {reportDetail.resolutionNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="history">
                    {historyItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No history data recorded for this report yet.
                      </p>
                    ) : (
                      <ol className="relative border-l border-slate-200 pl-6">
                        {historyItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <li key={item.id} className="mb-8 last:mb-0">
                              <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-500 ring-2 ring-slate-200">
                                <Icon className="h-3.5 w-3.5" />
                              </span>
                              <p className="text-sm font-semibold text-slate-900">
                                {item.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.time}
                              </p>
                              <p className="mt-1 text-sm text-slate-700">
                                {item.description}
                              </p>
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </TabsContent>

                  <TabsContent value="actions">
                    {reportDetail.status === "RESOLVED" ? (
                      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-700">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                        <p>
                          This report has been resolved. View details in the{" "}
                          <button
                            type="button"
                            onClick={() => onTabChange("history")}
                            className="font-medium text-blue-600 hover:text-blue-700 underline"
                          >
                            History tab
                          </button>
                          .
                        </p>
                      </div>
                    ) : (
                      <>
                        {inlineFeedback && (
                          <div
                            className={cn(
                              "rounded-2xl border p-3 text-sm",
                              inlineFeedback.type === "success"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                                : "border-rose-200 bg-rose-50 text-rose-900"
                            )}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p>{inlineFeedback.message}</p>
                              <button
                                type="button"
                                className="text-xs font-medium underline"
                                onClick={() => onInlineFeedbackChange(null)}
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        )}
                        {lastActionSummary && (
                          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                              <div>
                                <p className="font-semibold">
                                  {lastActionSummary.title}
                                </p>
                                <p className="text-sm text-blue-800">
                                  {lastActionSummary.description}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // Undo functionality
                                }}
                              >
                                Undo
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="space-y-4 pb-2">
                          <Card className="border border-slate-200">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">
                                Close as no violation
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                Close the report when the content does not break
                                policy.
                              </p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <Textarea
                                placeholder="Add reviewer notes (required)..."
                                value={noViolationNotes}
                                onChange={(event) =>
                                  onNoViolationNotesChange(event.target.value)
                                }
                                rows={4}
                              />
                            </CardContent>
                          </Card>

                          <Card className="border border-slate-200">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">
                                Apply enforcement action
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                Choose the appropriate measure for the
                                content/account.
                              </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <RadioGroup
                                value={actionForm.action}
                                onValueChange={(value) =>
                                  onActionFormChange({
                                    ...actionForm,
                                    action: value as ResolveReportAction,
                                  })
                                }
                                className="space-y-3"
                              >
                                {actionableReportActions.map((action) => {
                                  const definition =
                                    actionDefinitions[action];
                                  return (
                                    <label
                                      key={action}
                                      className={cn(
                                        "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition hover:border-blue-200",
                                        actionForm.action === action
                                          ? "border-blue-500 bg-blue-50 shadow-sm"
                                          : "border-slate-200 bg-white"
                                      )}
                                      onKeyDown={(event) => {
                                        if (
                                          event.key === "Enter" ||
                                          event.key === " "
                                        ) {
                                          event.preventDefault();
                                          onActionFormChange({
                                            ...actionForm,
                                            action,
                                          });
                                        }
                                      }}
                                    >
                                      <RadioGroupItem
                                        value={action}
                                        className="mt-1"
                                      />
                                      <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className="rounded-full bg-slate-100 p-2 text-slate-600">
                                            <definition.icon className="h-4 w-4" />
                                          </span>
                                          <span className="font-semibold text-slate-900">
                                            {definition.title}
                                          </span>
                                        </div>
                                        <p className="text-sm text-slate-600">
                                          {definition.description}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                          {definition.consequence}
                                        </p>
                                      </div>
                                    </label>
                                  );
                                })}
                              </RadioGroup>

                              {isResolveActionSuspension && (
                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground">
                                    Suspension days (1 - 365)
                                  </p>
                                  <Input
                                    ref={suspendDaysInputRef}
                                    type="number"
                                    min={1}
                                    max={365}
                                    value={actionForm.suspensionDays}
                                    onChange={(event) =>
                                      onActionFormChange({
                                        ...actionForm,
                                        suspensionDays: Number(
                                          event.target.value
                                        ),
                                      })
                                    }
                                  />
                                  {isSuspensionDaysInvalid && (
                                    <p className="text-xs text-rose-500">
                                      Please enter a valid number of days.
                                    </p>
                                  )}
                                </div>
                              )}

                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">
                                  Action notes
                                </p>
                                <Textarea
                                  placeholder="Provide details for this action..."
                                  value={actionForm.notes}
                                  onChange={(event) =>
                                    onActionFormChange({
                                      ...actionForm,
                                      notes: event.target.value,
                                    })
                                  }
                                  rows={4}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="sticky bottom-0 -mx-6 mt-4 border-t bg-white/95 px-6 py-4 backdrop-blur">
                          <p className="text-xs text-muted-foreground">
                            Confirm the selected action with the notes above.
                          </p>
                          <div className="mt-3 flex flex-col gap-2 md:flex-row md:justify-end">
                            <Button
                              variant="outline"
                              disabled={!canSubmitNoViolation}
                              onClick={onResolveNoViolation}
                              className="gap-2"
                            >
                              {resolveNoViolationMutation.isPending && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              )}
                              Close as no violation
                            </Button>
                            <Button
                              disabled={!canSubmitAction}
                              onClick={onResolveWithAction}
                              className="gap-2"
                            >
                              {resolveWithActionMutation.isPending && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              )}
                              Apply action
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
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
  );
}

