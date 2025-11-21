"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Loader2, AlertCircle, ShieldAlert } from "lucide-react";
import type { AdminReport } from "@/lib/api/admin-api";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "../utils";

interface ReportTableProps {
  reports: AdminReport[];
  isLoading: boolean;
  error: unknown;
  pageSize: number;
  onSelectReport: (report: AdminReport) => void;
  onRetry: () => void;
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
                  <th className="px-6 py-3">Reporter</th>
                  <th className="px-6 py-3">Author</th>
                  <th className="px-6 py-3">Description</th>
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
                      {report.reporter ? (
                        <div>
                          <p className="font-medium text-slate-900">
                            {report.reporter.displayName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {report.reporter.email}
                          </p>
                        </div>
                      ) : (
                        `User #${report.userId}`
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
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                      <p className="line-clamp-2">{report.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={report.status} size="sm" />
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary">{report.action}</Badge>
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

