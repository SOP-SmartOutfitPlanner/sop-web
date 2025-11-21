import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminAPI } from "@/lib/api/admin-api";
import type { ResolveReportAction } from "@/lib/api/admin-api";
import { actionableReportActions } from "@/app/admin/reports/constants";
import { getErrorMessage } from "@/app/admin/reports/utils";

export interface ActionForm {
  action: ResolveReportAction;
  notes: string;
  suspensionDays: number;
}

export interface InlineFeedback {
  type: "success" | "error";
  message: string;
}

export interface LastActionSummary {
  title: string;
  description: string;
}

export function useReportDetailModal(selectedReportId?: number) {
  const [noViolationNotes, setNoViolationNotes] = useState("");
  const [actionForm, setActionForm] = useState<ActionForm>({
    action: actionableReportActions[0],
    notes: "",
    suspensionDays: 7,
  });
  const [activeTab, setActiveTab] = useState<
    "summary" | "history" | "actions"
  >("summary");
  const [inlineFeedback, setInlineFeedback] = useState<InlineFeedback | null>(
    null
  );
  const [lastActionSummary, setLastActionSummary] =
    useState<LastActionSummary | null>(null);
  const suspendDaysInputRef = useRef<HTMLInputElement | null>(null);

  const queryClient = useQueryClient();
  const isResolveActionSuspension = actionForm.action === "SUSPEND";

  // Reset form when report changes
  useEffect(() => {
    setNoViolationNotes("");
    setActionForm({
      action: actionableReportActions[0],
      notes: "",
      suspensionDays: 7,
    });
    setActiveTab("summary");
    setInlineFeedback(null);
    setLastActionSummary(null);
  }, [selectedReportId]);

  // Auto-focus suspension days input
  useEffect(() => {
    if (isResolveActionSuspension && suspendDaysInputRef.current) {
      suspendDaysInputRef.current.focus();
      suspendDaysInputRef.current.select();
    }
  }, [isResolveActionSuspension]);

  const invalidateReportQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
    queryClient.invalidateQueries({
      queryKey: ["admin", "reports", "pending"],
    });
    if (selectedReportId) {
      queryClient.invalidateQueries({
        queryKey: ["admin", "reports", "detail", selectedReportId],
      });
    }
  };

  const resolveNoViolationMutation = useMutation({
    mutationFn: async (notes: string) => {
      if (!selectedReportId) {
        throw new Error("No report selected");
      }
      return adminAPI.resolveReportNoViolation(selectedReportId, { notes });
    },
    onSuccess: (response) => {
      toast.success(response.message || "Report closed with no violation.");
      invalidateReportQueries();
      setNoViolationNotes("");
      setInlineFeedback({
        type: "success",
        message: response.message || "Report updated successfully.",
      });
      setLastActionSummary({
        title: "Report closed",
        description: response.message || "No policy violation detected.",
      });
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Unable to update report status");
      toast.error(message);
      setInlineFeedback({
        type: "error",
        message,
      });
    },
  });

  const resolveWithActionMutation = useMutation({
    mutationFn: async (payload: {
      action: ResolveReportAction;
      notes: string;
      suspensionDays?: number;
    }) => {
      if (!selectedReportId) {
        throw new Error("No report selected");
      }
      return adminAPI.resolveReportWithAction(selectedReportId, payload);
    },
    onSuccess: (response) => {
      toast.success(response.message || "Action applied successfully.");
      invalidateReportQueries();
      setActionForm((prev) => ({
        ...prev,
        notes: "",
        suspensionDays: 7,
      }));
      setInlineFeedback({
        type: "success",
        message: response.message || "Action has been recorded.",
      });
      setLastActionSummary({
        title: `Action applied: ${response.data?.action ?? actionForm.action}`,
        description: response.message || "Content/account has been handled.",
      });
    },
    onError: (error) => {
      const message = getErrorMessage(
        error,
        "Unable to apply action for this report"
      );
      toast.error(message);
      setInlineFeedback({
        type: "error",
        message,
      });
    },
  });

  const canSubmitNoViolation =
    !!noViolationNotes.trim() && !resolveNoViolationMutation.isPending;

  const isSuspensionDaysInvalid =
    isResolveActionSuspension &&
    (!actionForm.suspensionDays ||
      actionForm.suspensionDays < 1 ||
      actionForm.suspensionDays > 365);

  const canSubmitAction =
    !!actionForm.notes.trim() &&
    !isSuspensionDaysInvalid &&
    !resolveWithActionMutation.isPending;

  const handleResolveNoViolation = () => {
    if (!noViolationNotes.trim()) {
      toast.error("Please enter notes before confirming.");
      return;
    }
    resolveNoViolationMutation.mutate(noViolationNotes.trim());
  };

  const handleResolveWithAction = () => {
    if (!actionForm.notes.trim()) {
      toast.error("Please enter action notes.");
      return;
    }

    if (isSuspensionDaysInvalid) {
      toast.error("Suspension days must be between 1 and 365.");
      return;
    }

    resolveWithActionMutation.mutate({
      action: actionForm.action,
      notes: actionForm.notes.trim(),
      suspensionDays: isResolveActionSuspension
        ? actionForm.suspensionDays
        : undefined,
    });
  };

  return {
    // State
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
    // Computed
    isResolveActionSuspension,
    isSuspensionDaysInvalid,
    canSubmitNoViolation,
    canSubmitAction,
    // Mutations
    resolveNoViolationMutation,
    resolveWithActionMutation,
    // Handlers
    handleResolveNoViolation,
    handleResolveWithAction,
  };
}

