"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Image } from "antd";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Clock,
  User,
  MessageSquare,
  Images,
  ChevronRight,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { actionDefinitions, reportTypeLabels } from "../constants";
import { formatDate, getInitials } from "../utils";
import { ReportersListSection } from "./ReportersListSection";
import type {
  AdminReportDetail,
  ResolveReportAction,
} from "@/lib/api/admin-api";

interface SummaryTabProps {
  reportDetail: AdminReportDetail;
  visibleImages: string[];
  hasMoreImages: boolean;
  totalImagesCount: number;
  onOpenImageModal: () => void;
}

export function SummaryTab({
  reportDetail,
  visibleImages,
  hasMoreImages,
  totalImagesCount,
  onOpenImageModal,
}: SummaryTabProps) {
  return (
    <div className="space-y-6">
      {/* Priority 1: Flagged Content */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
            <p className="text-base font-bold text-white">Flagged Content</p>
          </div>
          <Badge
            variant="outline"
            className="text-xs font-medium bg-white/5 text-white/80 border-white/20"
          >
            ID #{reportDetail.content.contentId} •{" "}
            {reportTypeLabels[reportDetail.content.contentType]}
          </Badge>
        </div>
        <div className="rounded-xl border-2 border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-500/5 p-5 space-y-4 shadow-sm">
          {reportDetail.content.body && (
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              <div
                className="prose prose-sm max-w-none text-white/90 prose-invert"
                dangerouslySetInnerHTML={{
                  __html: reportDetail.content.body ?? "",
                }}
              />
            </div>
          )}
          {totalImagesCount > 0 && (
            <div className="space-y-3">
              <Image.PreviewGroup>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {visibleImages.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="relative group overflow-hidden rounded-lg"
                    >
                      <Image
                        src={image}
                        alt={`Content #${
                          reportDetail.content.contentId
                        } - image ${index + 1}`}
                        className="h-48 w-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                        preview={{
                          mask: (
                            <div className="text-xs uppercase tracking-[0.3em] text-white">
                              Preview
                            </div>
                          ),
                        }}
                      />
                    </div>
                  ))}
                </div>
              </Image.PreviewGroup>
              {hasMoreImages && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto gap-2 border-2 border-white/20 hover:border-cyan-400/50 hover:bg-cyan-500/10 text-white/80 hover:text-cyan-300 font-medium transition-all bg-white/5"
                  onClick={onOpenImageModal}
                >
                  <Images className="h-4 w-4" />
                  <span>View all {totalImagesCount} images</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Priority 2: All Reporters List */}
      <ReportersListSection
        reportId={reportDetail.id}
        totalReporters={reportDetail.reporterCount}
      />

      {/* Priority 3: Report Description */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-cyan-400" />
          <p className="text-base font-bold text-white">
            Original Report Reason
          </p>
        </div>
        <blockquote className="border-l-4 border-cyan-500 bg-gradient-to-r from-cyan-500/10 to-transparent pl-5 py-4 pr-5 rounded-r-lg text-sm text-white/80 leading-relaxed">
          <p className="not-italic">
            Submitted by {reportDetail.originalReporter.displayName}
          </p>
        </blockquote>
      </div>

      {/* Priority 4: Compact Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm shadow-sm hover:bg-white/10 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-white/50" />
              <p className="text-xs font-medium text-white/50 uppercase tracking-wide">
                Type
              </p>
            </div>
            <p className="text-sm font-bold text-white mb-1">
              {reportTypeLabels[reportDetail.type]}
            </p>
            <p className="text-xs text-white/40">#{reportDetail.id}</p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm shadow-sm hover:bg-white/10 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-white/50" />
              <p className="text-xs font-medium text-white/50 uppercase tracking-wide">
                Status
              </p>
            </div>
            <StatusBadge
              status={reportDetail.status}
              size="sm"
              className="mt-1"
            />
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm shadow-sm hover:bg-white/10 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-white/50" />
              <p className="text-xs font-medium text-white/50 uppercase tracking-wide">
                Action
              </p>
            </div>
            <p className="text-sm font-bold text-white">
              {actionDefinitions[reportDetail.action as ResolveReportAction]
                ?.title ?? "None"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Priority 5: Original Reporter & Author */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm shadow-sm hover:bg-white/10 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-white/50" />
              <p className="text-xs font-medium text-white/50 uppercase tracking-wide">
                Original Reporter
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-white/20">
                {reportDetail.originalReporter.avatarUrl && (
                  <AvatarImage
                    src={reportDetail.originalReporter.avatarUrl}
                    alt={reportDetail.originalReporter.displayName}
                  />
                )}
                <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-xs font-bold text-white">
                  {getInitials(reportDetail.originalReporter.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">
                  {reportDetail.originalReporter.displayName}
                </p>
                <p className="text-xs text-white/50 truncate mt-0.5">
                  {reportDetail.originalReporter.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-cyan-500/30 bg-cyan-500/10 backdrop-blur-sm shadow-sm hover:bg-cyan-500/15 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-cyan-400" />
              <p className="text-xs font-medium text-cyan-300 uppercase tracking-wide">
                Content Author
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-cyan-500/30">
                {reportDetail.author.avatarUrl && (
                  <AvatarImage
                    src={reportDetail.author.avatarUrl}
                    alt={reportDetail.author.displayName}
                  />
                )}
                <AvatarFallback className="bg-gradient-to-br from-cyan-600 to-cyan-700 text-xs font-bold text-white">
                  {getInitials(reportDetail.author.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">
                  {reportDetail.author.displayName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {reportDetail.authorWarningCount > 0 && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-amber-500/20 text-amber-300 border-amber-500/30"
                    >
                      {reportDetail.authorWarningCount} warnings
                    </Badge>
                  )}
                  {reportDetail.authorSuspensionCount > 0 && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-red-500/20 text-red-300 border-red-500/30"
                    >
                      {reportDetail.authorSuspensionCount} suspensions
                    </Badge>
                  )}
                  {reportDetail.authorWarningCount === 0 &&
                    reportDetail.authorSuspensionCount === 0 && (
                      <span className="text-xs text-white/40">
                        No violations
                      </span>
                    )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority 6: Dates & Resolution Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-white/50" />
              <p className="text-xs font-medium text-white/50 uppercase tracking-wide">
                Created
              </p>
            </div>
            <p className="text-sm font-bold text-white">
              {formatDate(reportDetail.createdDate)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <p className="text-xs font-medium text-white/50 uppercase tracking-wide">
                Resolved
              </p>
            </div>
            <p className="text-sm font-bold text-white">
              {reportDetail.resolvedAt ? (
                formatDate(reportDetail.resolvedAt)
              ) : (
                <span className="text-white/40">Not resolved</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {reportDetail.resolutionNotes && (
        <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-emerald-400" />
              <p className="text-xs font-medium text-emerald-300 uppercase tracking-wide">
                Resolution Notes
              </p>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              {reportDetail.resolutionNotes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
