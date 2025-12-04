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
      <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/80">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
        <p>
          This report has been resolved. View details in the{" "}
          <button
            type="button"
            onClick={() => onTabChange("history")}
            className="font-medium text-cyan-400 hover:text-cyan-300 underline"
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
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-rose-500/30 bg-rose-500/10 text-rose-200"
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
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-100">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">{lastActionSummary.title}</p>
              <p className="text-sm text-cyan-200">
                {lastActionSummary.description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-cyan-300 hover:text-cyan-100 hover:bg-cyan-500/20"
            >
              Undo
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-6 pb-2">
        <Card className="border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <CardTitle className="text-lg font-bold text-white">
                Close as no violation
              </CardTitle>
            </div>
            <p className="text-sm text-white/60 mt-1.5">
              Close the report when the content does not break policy.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Add reviewer notes (required)..."
              value={noViolationNotes}
              onChange={(event) => onNoViolationNotesChange(event.target.value)}
              rows={4}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-emerald-400 focus:ring-emerald-400"
            />
          </CardContent>
        </Card>

        <Card className="border-2 border-white/10 bg-white/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-cyan-400" />
              <CardTitle className="text-lg font-bold text-white">
                Apply enforcement action
              </CardTitle>
            </div>
            <p className="text-sm text-white/60 mt-1.5">
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
              <div className="rounded-lg border-2 border-red-500/30 bg-red-500/10 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <p className="text-sm font-semibold text-red-200">
                    Suspension Period
                  </p>
                </div>
                <p className="text-xs text-red-300/80">
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
                    "bg-white/5 border-red-500/30 text-white placeholder:text-white/40 focus:border-red-400 focus:ring-red-400",
                    isSuspensionDaysInvalid && "border-red-500"
                  )}
                  placeholder="Enter days (1-365)"
                />
                {isSuspensionDaysInvalid && (
                  <p className="text-xs font-medium text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Please enter a valid number of days between 1 and 365.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-white/50" />
                <p className="text-sm font-semibold text-white">Action notes</p>
                <span className="text-xs text-white/40">(Optional)</span>
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
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-cyan-400 focus:ring-cyan-400"
              />
              <p className="text-xs text-white/50">
                These notes will be recorded in the report history and visible
                to other moderators.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="sticky bottom-0 -mx-6 mt-8 border-t-2 border-white/10 bg-slate-900/90 px-6 py-6 backdrop-blur-sm">
        <div className="flex items-start gap-3 mb-5 p-4 rounded-lg bg-white/5 border border-white/10">
          <Info className="h-5 w-5 text-cyan-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-white mb-1">
              {actionableReportActions.includes(
                actionForm.action as ResolveReportAction
              ) ? (
                <>
                  Ready to apply{" "}
                  <span className="font-bold text-cyan-300">
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
            <p className="text-xs text-white/60">
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
            className="gap-2 border-2 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400 hover:text-emerald-200 font-semibold bg-transparent"
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
            className="gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold shadow-md hover:shadow-lg transition-all"
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
