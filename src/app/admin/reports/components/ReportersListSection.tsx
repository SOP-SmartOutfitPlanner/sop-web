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
      <div className="flex items-center gap-3 pb-2 border-b-2 border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-500/20">
            <Users className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">All Reporters</p>
            <p className="text-xs text-white/50">
              Community reports from multiple users
            </p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className="text-xs bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-semibold ml-auto"
        >
          {totalReporters} total
        </Badge>
      </div>

      <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
            </div>
          ) : reporters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-white/60">No reporters found</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-white/10">
                {reporters.map((reporter, index) => (
                  <div
                    key={reporter.id}
                    className="p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 relative">
                        <Avatar className="h-10 w-10 ring-2 ring-white/20">
                          {reporter.reporter.avatarUrl && (
                            <AvatarImage
                              src={reporter.reporter.avatarUrl}
                              alt={reporter.reporter.displayName}
                            />
                          )}
                          <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-xs font-bold text-white">
                            {getInitials(reporter.reporter.displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 bg-cyan-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-slate-900 shadow-sm">
                          {index + 1 + (currentPage - 1) * pageSize}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-sm font-bold text-white">
                            {reporter.reporter.displayName}
                          </p>
                          <span className="text-xs text-white/40">•</span>
                          <p className="text-xs text-white/50">
                            {reporter.reporter.email}
                          </p>
                        </div>
                        <p className="text-sm text-white/80 leading-relaxed mb-2 bg-white/5 px-3 py-2 rounded-md border border-white/10">
                          {reporter.description}
                        </p>
                        <p className="text-xs text-white/40">
                          Reported on {formatDate(reporter.createdDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {metaData && metaData.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-white/5">
                  <p className="text-xs text-white/60 font-medium">
                    Showing page {currentPage} of {metaData.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!metaData.hasPrevious || currentPage === 1}
                      className="gap-1 border-white/20 text-white/70 hover:bg-white/10 hover:text-white bg-transparent"
                    >
                      <ChevronLeft className="h-3 w-3" />
                      Prev
                    </Button>
                    <div className="px-2 py-1 text-xs font-semibold text-cyan-300 bg-cyan-500/20 rounded border border-cyan-500/30">
                      {currentPage}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={
                        !metaData.hasNext || currentPage >= metaData.totalPages
                      }
                      className="gap-1 border-white/20 text-white/70 hover:bg-white/10 hover:text-white bg-transparent"
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
