import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, ChevronsLeft } from "lucide-react";

interface PaginationProps {
  pageIndex: number;
  pageSize: number;
  totalCount?: number;
  totalPages?: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({
  pageIndex,
  pageSize,
  totalCount,
  totalPages,
  canGoNext,
  canGoPrev,
  onPageChange,
}: PaginationProps) {
  const startItem =
    totalCount && totalCount > 0 ? (pageIndex - 1) * pageSize + 1 : 0;
  const endItem =
    totalCount && totalCount > 0
      ? Math.min(pageIndex * pageSize, totalCount)
      : 0;

  return (
    <Card className="border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-white/70">
            {totalCount && totalCount > 0 ? (
              <>
                Showing <span className="font-medium text-white">{startItem}</span> to{" "}
                <span className="font-medium text-white">{endItem}</span> of{" "}
                <span className="font-medium text-white">{totalCount}</span> reports
              </>
            ) : (
              <span>No reports found</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pageIndex === 1}
              onClick={() => onPageChange(1)}
              className="hidden sm:flex border-white/20 bg-white/5 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={!canGoPrev}
              onClick={() => onPageChange(pageIndex - 1)}
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="flex items-center gap-1">
              <Button
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white min-w-9 shadow-lg shadow-cyan-500/30 border-0"
                disabled
              >
                {pageIndex}
              </Button>
              {totalPages && totalPages > pageIndex && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-w-9 border-white/20 bg-white/5 text-white hover:bg-white/10"
                    onClick={() => onPageChange(pageIndex + 1)}
                  >
                    {pageIndex + 1}
                  </Button>
                  {totalPages > pageIndex + 1 && (
                    <span className="px-2 text-white/40">...</span>
                  )}
                  {totalPages > pageIndex + 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-w-9 border-white/20 bg-white/5 text-white hover:bg-white/10"
                      onClick={() => onPageChange(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  )}
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={!canGoNext}
              onClick={() => onPageChange(pageIndex + 1)}
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
