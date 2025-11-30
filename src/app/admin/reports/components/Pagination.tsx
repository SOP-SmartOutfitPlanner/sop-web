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
    <Card className="border-0 shadow">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            {totalCount && totalCount > 0 ? (
              <>
                Showing <span className="font-medium">{startItem}</span> to{" "}
                <span className="font-medium">{endItem}</span> of{" "}
                <span className="font-medium">{totalCount}</span> reports
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
              className="hidden sm:flex"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={!canGoPrev}
              onClick={() => onPageChange(pageIndex - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="flex items-center gap-1">
              <Button
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-9"
                disabled
              >
                {pageIndex}
              </Button>
              {totalPages && totalPages > pageIndex && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-w-9"
                    onClick={() => onPageChange(pageIndex + 1)}
                  >
                    {pageIndex + 1}
                  </Button>
                  {totalPages > pageIndex + 1 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}
                  {totalPages > pageIndex + 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-w-9"
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
