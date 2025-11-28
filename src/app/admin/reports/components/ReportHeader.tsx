"use client";

import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FileText,
  History,
  ShieldCheck,
  Info,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { reportTypeLabels, statusMetadata } from "../constants";
import { formatDate } from "../utils";
import type { AdminReportDetail } from "@/lib/api/admin-api";

interface ReportHeaderProps {
  reportDetail: AdminReportDetail;
  activeTab: "summary" | "history" | "actions";
  onTabChange: (tab: "summary" | "history" | "actions") => void;
}

export function ReportHeader({
  reportDetail,
  activeTab,
  onTabChange,
}: ReportHeaderProps) {
  return (
    <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/98 backdrop-blur-sm supports-[backdrop-filter]:bg-white/98 shadow-sm">
      <div className="px-6 pt-5 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Report #{reportDetail.id}
              </p>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1.5 line-clamp-2">
              {reportTypeLabels[reportDetail.type]} •{" "}
              {reportDetail.content?.contentId
                ? `Content #${reportDetail.content.contentId}`
                : `Report #${reportDetail.id}`}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Created {formatDate(reportDetail.createdDate)}</span>
              </div>
              {reportDetail.resolvedAt && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Resolved {formatDate(reportDetail.resolvedAt)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <StatusBadge
                  status={reportDetail.status}
                  className="shadow-sm transition-all hover:shadow-md"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {statusMetadata[reportDetail.status]?.tooltip}
            </TooltipContent>
          </Tooltip>
        </div>
        {reportDetail.status !== "RESOLVED" && (
          <div className="flex flex-wrap items-center gap-2 mb-4 p-3 rounded-lg bg-blue-50/50 border border-blue-100">
            <Info className="h-4 w-4 text-blue-600 shrink-0" />
            <p className="text-xs text-blue-900 flex-1">
              This report requires action. Review the content and apply
              appropriate measures.
            </p>
            <Button
              size="sm"
              variant={activeTab === "actions" ? "default" : "outline"}
              onClick={() => onTabChange("actions")}
              className="gap-1.5"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Go to actions
            </Button>
          </div>
        )}
        <TabsList className="w-full justify-start bg-slate-50/50">
          <TabsTrigger value="summary" className="gap-2">
            <FileText className="h-4 w-4" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="actions" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            Actions
          </TabsTrigger>
        </TabsList>
      </div>
    </div>
  );
}
