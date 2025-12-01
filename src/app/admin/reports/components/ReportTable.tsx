"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Eye,
  Loader2,
  AlertCircle,
  ShieldAlert,
  Ban,
  Trash2,
  EyeOff,
  Minus,
} from "lucide-react";
import type { AdminReport } from "@/lib/api/admin-api";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "../utils";
import { cn } from "@/lib/utils";

interface ReportTableProps {
  reports: AdminReport[];
  isLoading: boolean;
  error: unknown;
  pageSize: number;
  onSelectReport: (report: AdminReport) => void;
  onRetry: () => void;
}

function ActionBadge({ action }: { action: string }) {
  const actionConfig = {
    SUSPEND: {
      icon: Ban,
      className:
        "bg-red-500/20 text-red-300 border-red-400/30 hover:bg-red-500/30 font-semibold",
      iconColor: "text-red-400",
    },
    DELETE: {
      icon: Trash2,
      className:
        "bg-orange-500/20 text-orange-300 border-orange-400/30 hover:bg-orange-500/30 font-semibold",
      iconColor: "text-orange-400",
    },
    WARN: {
      icon: ShieldAlert,
      className:
        "bg-yellow-500/20 text-yellow-300 border-yellow-400/30 hover:bg-yellow-500/30 font-semibold",
      iconColor: "text-yellow-400",
    },
    HIDE: {
      icon: EyeOff,
      className:
        "bg-purple-500/20 text-purple-300 border-purple-400/30 hover:bg-purple-500/30 font-semibold",
      iconColor: "text-purple-400",
    },
    NONE: {
      icon: Minus,
      className: "bg-white/10 text-white/60 border-white/20 hover:bg-white/20",
      iconColor: "text-white/50",
    },
  };

  const config =
    actionConfig[action as keyof typeof actionConfig] || actionConfig.NONE;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 border-2 shadow-sm transition-colors",
        config.className
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", config.iconColor)} />
      <span className="font-medium">{action}</span>
    </Badge>
  );
}

export function ReportTable({
  reports,
  isLoading,
  error,
  pageSize,
  onSelectReport,
  onRetry,
}: ReportTableProps) {
  return (
    <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white">Report table</CardTitle>
        <p className="text-sm text-white/60 mt-1">
          Displaying {pageSize} reports per page.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 text-cyan-400 animate-spin mb-4" />
            <p className="text-white/70">Loading data...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <AlertCircle className="h-10 w-10 text-red-400 mb-4" />
            <p className="font-medium text-white mb-2">
              Failed to load reports
            </p>
            <p className="text-sm text-white/60 mb-4">
              Please try again or check your network connection.
            </p>
            <Button 
              onClick={onRetry}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              Retry
            </Button>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <ShieldAlert className="h-10 w-10 text-cyan-400 mb-4" />
            <p className="font-medium text-white mb-2">
              No reports match the current filters
            </p>
            <p className="text-sm text-white/60">
              Adjust the filters to see different results.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/90 font-semibold">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Reporter(s)</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      #{report.id}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-white/10 border-white/20 text-white/80">{report.type}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/70">
                      {report.originalReporter ? (
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium text-white">
                              {report.originalReporter.displayName}
                            </p>
                            <p className="text-xs text-white/50">
                              {report.originalReporter.email}
                            </p>
                          </div>
                          {report.reporterCount > 1 && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-cyan-500/20 text-cyan-300 border-cyan-400/30 font-semibold"
                            >
                              +{report.reporterCount - 1}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-white/70">
                      {report.author ? (
                        <div>
                          <p className="font-medium text-white">
                            {report.author.displayName}
                          </p>
                          <p className="text-xs text-white/50">
                            {report.author.email}
                          </p>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={report.status} size="sm" />
                    </td>
                    <td className="px-6 py-4">
                      <ActionBadge action={report.action} />
                    </td>
                    <td className="px-6 py-4 text-sm text-white/70">
                      {formatDate(report.createdDate)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 text-cyan-400 hover:text-cyan-300 hover:bg-white/10"
                        onClick={() => onSelectReport(report)}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
