import type { ComponentType, SVGProps } from "react";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock3,
  EyeOff,
  FileText,
  History,
  MessageSquare,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import type {
  ReportStatus,
  ReportType,
  ResolveReportAction,
} from "@/lib/api/admin-api";

export const reportStatuses: ReportStatus[] = ["PENDING", "RESOLVED"];

export const reportTypes: ReportType[] = ["POST", "COMMENT"];

export const actionableReportActions: ResolveReportAction[] = [
  "HIDE",
  "DELETE",
  "WARN",
  "SUSPEND",
];

export const actionDefinitions: Record<
  ResolveReportAction,
  {
    title: string;
    description: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    consequence: string;
  }
> = {
  HIDE: {
    title: "Hide content",
    description: "Hide the content from the community without deleting it.",
    icon: EyeOff,
    consequence: "Can be restored later if needed.",
  },
  DELETE: {
    title: "Delete content",
    description: "Soft-delete the content so it is no longer visible.",
    icon: Trash2,
    consequence: "Author may still see it in their own history.",
  },
  WARN: {
    title: "Warn author",
    description: "Record a warning in the author's violation history.",
    icon: ShieldAlert,
    consequence: "Author receives a warning notification.",
  },
  SUSPEND: {
    title: "Suspend account",
    description: "Temporarily lock the account for a specific period.",
    icon: Ban,
    consequence: "Author cannot post or interact during the suspension.",
  },
};

export const reportTypeLabels: Record<ReportType, string> = {
  POST: "Post",
  COMMENT: "Comment",
};

export const statusMetadata: Record<
  ReportStatus,
  {
    label: string;
    color: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    tooltip: string;
  }
> = {
  PENDING: {
    label: "Pending review",
    color: "bg-amber-100 text-amber-900",
    icon: Clock3,
    tooltip: "Report is awaiting moderation",
  },
  RESOLVED: {
    label: "Resolved",
    color: "bg-emerald-100 text-emerald-900",
    icon: CheckCircle2,
    tooltip: "Report has been handled",
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-rose-100 text-rose-900",
    icon: AlertTriangle,
    tooltip: "Report was dismissed",
  },
  IN_PROGRESS: {
    label: "In progress",
    color: "bg-blue-100 text-blue-900",
    icon: History,
    tooltip: "Report is currently under review",
  },
};

export const statusAccentColors: Record<ReportStatus, string> = {
  PENDING: "bg-amber-400",
  RESOLVED: "bg-emerald-500",
  REJECTED: "bg-rose-500",
  IN_PROGRESS: "bg-blue-500",
};

export const reportTypeIcons: Record<
  ReportType,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  POST: FileText,
  COMMENT: MessageSquare,
};

