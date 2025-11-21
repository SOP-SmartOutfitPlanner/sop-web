"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { AdminReport } from "@/lib/api/admin-api";

interface StatsCardsProps {
  reports: AdminReport[];
  pendingReports: AdminReport[];
  currentPage: number;
}

export function StatsCards({
  reports,
  pendingReports,
  currentPage,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Total reports</p>
          <p className="text-3xl font-semibold text-gray-900 mt-1">
            {reports.length}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Showing page {currentPage}
          </p>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Pending in filters</p>
          <p className="text-3xl font-semibold text-amber-600 mt-1">
            {pendingReports.filter((report) => report.status === "PENDING")
              .length}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Based on current filters
          </p>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Resolved in table</p>
          <p className="text-3xl font-semibold text-emerald-600 mt-1">
            {reports.filter((report) => report.status === "RESOLVED").length}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Counted in current page only
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

