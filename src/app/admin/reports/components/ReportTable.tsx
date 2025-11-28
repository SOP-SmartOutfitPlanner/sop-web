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
        "bg-red-100 text-red-700 border-red-300 hover:bg-red-200 font-semibold",
      iconColor: "text-red-600",
    },
    DELETE: {
      icon: Trash2,
      className:
        "bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200 font-semibold",
      iconColor: "text-orange-600",
    },
    HIDE: {
      icon: EyeOff,
      className:
        "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200 font-semibold",
      iconColor: "text-yellow-600",
    },
    NONE: {
      icon: Minus,
      className: "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200",
      iconColor: "text-gray-500",
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
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Report table</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Displaying {pageSize} reports per page.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
            <p className="font-medium text-gray-900 mb-2">
              Failed to load reports
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Please try again or check your network connection.
            </p>
            <Button onClick={onRetry}>Retry</Button>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <ShieldAlert className="h-10 w-10 text-blue-500 mb-4" />
            <p className="font-medium text-gray-900 mb-2">
              No reports match the current filters
            </p>
            <p className="text-sm text-muted-foreground">
              Adjust the filters to see different results.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Reporter(s)</th>
                  <th className="px-6 py-3">Author</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b last:border-b-0 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      #{report.id}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{report.type}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {report.originalReporter ? (
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium text-slate-900">
                              {report.originalReporter.displayName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {report.originalReporter.email}
                            </p>
                          </div>
                          {report.reporterCount > 1 && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-blue-100 text-blue-700 border-blue-300 font-semibold"
                            >
                              +{report.reporterCount - 1}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {report.author ? (
                        <div>
                          <p className="font-medium text-slate-900">
                            {report.author.displayName}
                          </p>
                          <p className="text-xs text-muted-foreground">
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
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(report.createdDate)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
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
