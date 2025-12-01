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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        <CardContent className="pt-6">
          <p className="text-sm text-white/60 font-medium">Total reports</p>
          <p className="text-3xl font-bold text-white mt-1">
            {reports.length}
          </p>
          <p className="text-xs text-white/50 mt-2">
            Showing page {currentPage}
          </p>
        </CardContent>
      </Card>
      <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        <CardContent className="pt-6">
          <p className="text-sm text-white/60 font-medium">Pending in filters</p>
          <p className="text-3xl font-bold text-amber-400 mt-1">
            {pendingReports.filter((report) => report.status === "PENDING")
              .length}
          </p>
          <p className="text-xs text-white/50 mt-2">
            Based on current filters
          </p>
        </CardContent>
      </Card>
      <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        <CardContent className="pt-6">
          <p className="text-sm text-white/60 font-medium">Resolved in table</p>
          <p className="text-3xl font-bold text-emerald-400 mt-1">
            {reports.filter((report) => report.status === "RESOLVED").length}
          </p>
          <p className="text-xs text-white/50 mt-2">
            Counted in current page only
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

