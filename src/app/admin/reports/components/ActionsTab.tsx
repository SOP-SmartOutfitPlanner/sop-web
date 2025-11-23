"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Info,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ActionCard } from "./ActionCard";
import { actionableReportActions, actionDefinitions } from "../constants";
import type {
  ResolveReportAction,
  AdminReportDetail,
} from "@/lib/api/admin-api";
import type { RefObject } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import type { ApiResponse } from "@/lib/types/api.types";
import type { AdminReport } from "@/lib/api/admin-api";

interface ActionsTabProps {
  reportDetail: AdminReportDetail;
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
  noViolationNotes: string;
  onNoViolationNotesChange: (notes: string) => void;
  canSubmitNoViolation: boolean;
  canSubmitAction: boolean;
  onResolveNoViolation: () => void;
  onResolveWithAction: () => void;
  onTabChange: (tab: "summary" | "history" | "actions") => void;
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

export function ActionsTab({
  reportDetail,
  actionForm,
  onActionFormChange,
  suspendDaysInputRef,
  isResolveActionSuspension,
  isSuspensionDaysInvalid,
  inlineFeedback,
  onInlineFeedbackChange,
  lastActionSummary,
  noViolationNotes,
  onNoViolationNotesChange,
  canSubmitNoViolation,
  canSubmitAction,
  onResolveNoViolation,
  onResolveWithAction,
  onTabChange,
  resolveNoViolationMutation,
  resolveWithActionMutation,
}: ActionsTabProps) {
  if (reportDetail.status === "RESOLVED") {
    return (
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
    );
  }

  return (
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
              <p className="font-semibold">{lastActionSummary.title}</p>
              <p className="text-sm text-blue-800">
                {lastActionSummary.description}
              </p>
            </div>
            <Button variant="ghost" size="sm">
              Undo
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-6 pb-2">
        <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-lg font-bold text-slate-900">
                Close as no violation
              </CardTitle>
            </div>
            <p className="text-sm text-slate-600 mt-1.5">
              Close the report when the content does not break policy.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Add reviewer notes (required)..."
              value={noViolationNotes}
              onChange={(event) => onNoViolationNotesChange(event.target.value)}
              rows={4}
              className="border-slate-300 focus:border-emerald-400 focus:ring-emerald-400"
            />
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg font-bold text-slate-900">
                Apply enforcement action
              </CardTitle>
            </div>
            <p className="text-sm text-slate-600 mt-1.5">
              Choose the appropriate measure for the content/account.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {actionableReportActions.map((action) => (
                <ActionCard
                  key={action}
                  action={action as ResolveReportAction}
                  isSelected={actionForm.action === action}
                  onSelect={(selectedAction) =>
                    onActionFormChange({
                      ...actionForm,
                      action: selectedAction,
                    })
                  }
                />
              ))}
            </div>

            {isResolveActionSuspension && (
              <div className="rounded-lg border-2 border-red-200 bg-red-50/50 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm font-semibold text-red-900">
                    Suspension Period
                  </p>
                </div>
                <p className="text-xs text-red-700">
                  Enter the number of days to suspend the account (1 - 365 days)
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
                      suspensionDays: Number(event.target.value),
                    })
                  }
                  className={cn(
                    "border-red-300 focus:border-red-500 focus:ring-red-500",
                    isSuspensionDaysInvalid && "border-red-500"
                  )}
                  placeholder="Enter days (1-365)"
                />
                {isSuspensionDaysInvalid && (
                  <p className="text-xs font-medium text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Please enter a valid number of days between 1 and 365.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                <p className="text-sm font-semibold text-slate-900">
                  Action notes
                </p>
                <span className="text-xs text-slate-400">(Optional)</span>
              </div>
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
                className="border-slate-300 focus:border-blue-400 focus:ring-blue-400"
              />
              <p className="text-xs text-slate-500">
                These notes will be recorded in the report history and visible to
                other moderators.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="sticky bottom-0 -mx-6 mt-8 border-t-2 border-slate-200 bg-white/98 px-6 py-6 backdrop-blur-sm shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex items-start gap-3 mb-5 p-4 rounded-lg bg-slate-50 border border-slate-200">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900 mb-1">
              {actionableReportActions.includes(
                actionForm.action as ResolveReportAction
              ) ? (
                <>
                  Ready to apply{" "}
                  <span className="font-bold text-blue-700">
                    {
                      actionDefinitions[
                        actionForm.action as ResolveReportAction
                      ]?.title
                    }
                  </span>
                </>
              ) : (
                "Review and confirm your action"
              )}
            </p>
            <p className="text-xs text-slate-600">
              {actionableReportActions.includes(
                actionForm.action as ResolveReportAction
              )
                ? "Please review your notes before confirming. This action will be recorded in the report history."
                : "Select an action and add notes above to proceed."}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            size="lg"
            disabled={
              !canSubmitNoViolation || resolveNoViolationMutation.isPending
            }
            onClick={onResolveNoViolation}
            className="gap-2 border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-800 font-semibold"
          >
            {resolveNoViolationMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Close as no violation
              </>
            )}
          </Button>
          <Button
            size="lg"
            disabled={!canSubmitAction || resolveWithActionMutation.isPending}
            onClick={onResolveWithAction}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
          >
            {resolveWithActionMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Apply action
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

