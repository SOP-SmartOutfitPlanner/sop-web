"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useReportReporters } from "@/hooks/admin/useAdminReports";
import { getInitials, formatDate } from "../utils";

interface ReportersListSectionProps {
  reportId: number;
  totalReporters: number;
}

export function ReportersListSection({
  reportId,
  totalReporters,
}: ReportersListSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Reset to page 1 when reportId changes
  useEffect(() => {
    setCurrentPage(1);
  }, [reportId]);

  const { data, isLoading } = useReportReporters(reportId, {
    pageIndex: currentPage,
    pageSize,
  });

  const reporters = data?.reporters ?? [];
  const metaData = data?.metaData;

  if (totalReporters <= 1) {
    return null;
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-3 pb-2 border-b-2 border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-100">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">All Reporters</p>
            <p className="text-xs text-slate-500">
              Community reports from multiple users
            </p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className="text-xs bg-blue-100 text-blue-700 border-blue-300 font-semibold ml-auto"
        >
          {totalReporters} total
        </Badge>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
          ) : reporters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-slate-600">No reporters found</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-200">
                {reporters.map((reporter, index) => (
                  <div
                    key={reporter.id}
                    className="p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 relative">
                        <Avatar className="h-10 w-10 ring-2 ring-slate-200">
                          {reporter.reporter.avatarUrl && (
                            <AvatarImage
                              src={reporter.reporter.avatarUrl}
                              alt={reporter.reporter.displayName}
                            />
                          )}
                          <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-bold text-slate-700">
                            {getInitials(reporter.reporter.displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-sm">
                          {index + 1 + (currentPage - 1) * pageSize}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-sm font-bold text-slate-900">
                            {reporter.reporter.displayName}
                          </p>
                          <span className="text-xs text-slate-400">•</span>
                          <p className="text-xs text-slate-500">
                            {reporter.reporter.email}
                          </p>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed mb-2 bg-slate-50 px-3 py-2 rounded-md border border-slate-200">
                          {reporter.description}
                        </p>
                        <p className="text-xs text-slate-400">
                          Reported on {formatDate(reporter.createdDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {metaData && metaData.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
                  <p className="text-xs text-slate-600 font-medium">
                    Showing page {currentPage} of {metaData.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!metaData.hasPrevious || currentPage === 1}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-3 w-3" />
                      Prev
                    </Button>
                    <div className="px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded border border-blue-200">
                      {currentPage}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={
                        !metaData.hasNext || currentPage >= metaData.totalPages
                      }
                      className="gap-1"
                    >
                      Next
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
