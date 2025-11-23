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
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <p className="text-base font-bold text-slate-900">
              Flagged Content
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-medium">
            ID #{reportDetail.content.contentId} •{" "}
            {reportTypeLabels[reportDetail.content.contentType]}
          </Badge>
        </div>
        <div className="rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50/80 to-red-50/40 p-5 space-y-4 shadow-sm">
          {reportDetail.content.body && (
            <div
              className="prose prose-sm max-w-none text-slate-800"
              dangerouslySetInnerHTML={{
                __html: reportDetail.content.body ?? "",
              }}
            />
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
                  className="w-full sm:w-auto gap-2 border-2 border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-medium transition-all shadow-sm hover:shadow-md"
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

      {/* Priority 2: Report Description */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <p className="text-base font-bold text-slate-900">Report Reason</p>
        </div>
        <blockquote className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50/80 to-blue-50/40 pl-5 py-4 pr-5 rounded-r-lg text-sm text-slate-700 leading-relaxed shadow-sm">
          <p className="not-italic">{reportDetail.description}</p>
        </blockquote>
      </div>

      {/* Priority 3: Compact Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-slate-400" />
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Type
              </p>
            </div>
            <p className="text-sm font-bold text-slate-900 mb-1">
              {reportTypeLabels[reportDetail.type]}
            </p>
            <p className="text-xs text-slate-400">#{reportDetail.id}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-slate-400" />
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
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
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-slate-400" />
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Action
              </p>
            </div>
            <p className="text-sm font-bold text-slate-900">
              {actionDefinitions[reportDetail.action as ResolveReportAction]
                ?.title ?? "None"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Priority 4: Reporter & Author */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-slate-400" />
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Reporter
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-slate-200">
                {reportDetail.reporter.avatarUrl && (
                  <AvatarImage
                    src={reportDetail.reporter.avatarUrl}
                    alt={reportDetail.reporter.displayName}
                  />
                )}
                <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-bold text-slate-700">
                  {getInitials(reportDetail.reporter.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {reportDetail.reporter.displayName}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {reportDetail.reporter.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 shadow-sm hover:shadow-md transition-shadow bg-blue-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                Content Author
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-blue-200">
                {reportDetail.author.avatarUrl && (
                  <AvatarImage
                    src={reportDetail.author.avatarUrl}
                    alt={reportDetail.author.displayName}
                  />
                )}
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-xs font-bold text-blue-700">
                  {getInitials(reportDetail.author.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {reportDetail.author.displayName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {reportDetail.authorWarningCount > 0 && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-amber-50 text-amber-700 border-amber-300"
                    >
                      {reportDetail.authorWarningCount} warnings
                    </Badge>
                  )}
                  {reportDetail.authorSuspensionCount > 0 && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-red-50 text-red-700 border-red-300"
                    >
                      {reportDetail.authorSuspensionCount} suspensions
                    </Badge>
                  )}
                  {reportDetail.authorWarningCount === 0 &&
                    reportDetail.authorSuspensionCount === 0 && (
                      <span className="text-xs text-slate-400">
                        No violations
                      </span>
                    )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority 5: Dates & Resolution Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Created
              </p>
            </div>
            <p className="text-sm font-bold text-slate-900">
              {formatDate(reportDetail.createdDate)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Resolved
              </p>
            </div>
            <p className="text-sm font-bold text-slate-900">
              {reportDetail.resolvedAt ? (
                formatDate(reportDetail.resolvedAt)
              ) : (
                <span className="text-slate-400">Not resolved</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {reportDetail.resolutionNotes && (
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-emerald-50/40 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide">
                Resolution Notes
              </p>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {reportDetail.resolutionNotes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
