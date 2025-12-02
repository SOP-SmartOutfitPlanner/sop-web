"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { ApiWardrobeItem } from "@/lib/api/wardrobe-api";

interface ItemsTableProps {
  items: ApiWardrobeItem[];
  isLoading: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onViewItem: (item: ApiWardrobeItem) => void;
  onDeleteItem?: (item: ApiWardrobeItem) => void;
}

export function ItemsTable({
  items,
  isLoading,
  currentPage,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onViewItem,
  onDeleteItem,
}: ItemsTableProps) {
  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  // Parse colors helper
  const parseColors = (colorString?: string): string => {
    if (!colorString) return "N/A";
    try {
      const colors = JSON.parse(colorString);
      if (Array.isArray(colors)) {
        return colors.map((c) => c.name || c).join(", ");
      }
      return colorString;
    } catch {
      return colorString;
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-sm font-medium text-white/70">
                  Image
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/70">
                  Name & Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/70">
                  User
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/70">
                  Colors
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/70">
                  AI Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/70">
                  Created Date
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-white/70">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="px-6 py-4">
                    <Skeleton className="w-16 h-16 rounded-lg" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-6 w-20" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <Skeleton className="h-9 w-9 rounded-lg" />
                      <Skeleton className="h-9 w-9 rounded-lg" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-12 text-center">
        <AlertCircle className="w-16 h-16 text-white/30 mx-auto mb-4" />
        <p className="text-white/70 text-lg">No items found</p>
        <p className="text-white/40 text-sm mt-2">
          Try adjusting your search or filters
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-left text-sm font-medium text-white/70">
                  Image
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/70">
                  Name & Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/70">
                  User
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/70">
                  Colors
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/70">
                  AI Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/70">
                  Created Date
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-white/70">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  {/* Image */}
                  <td className="px-6 py-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white/5">
                      <Image
                        src={item.imgUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  </td>

                  {/* Name & Category */}
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-white font-medium truncate">
                        {item.name}
                      </p>
                      <Badge
                        variant="outline"
                        className="mt-1 border-cyan-400/30 text-cyan-300 text-xs"
                      >
                        {item.categoryName || "N/A"}
                      </Badge>
                    </div>
                  </td>

                  {/* User */}
                  <td className="px-6 py-4">
                    <p className="text-white/70 text-sm">
                      {item.userDisplayName || `User #${item.userId}`}
                    </p>
                  </td>

                  {/* Colors */}
                  <td className="px-6 py-4">
                    <p className="text-white/70 text-sm max-w-[150px] truncate">
                      {parseColors(item.color)}
                    </p>
                  </td>

                  {/* AI Status */}
                  <td className="px-6 py-4">
                    {item.isAnalyzed ? (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Analyzed
                        {item.aiConfidence && (
                          <span className="ml-1 text-xs">
                            ({Math.round(item.aiConfidence * 100)}%)
                          </span>
                        )}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-white/20 text-white/50"
                      >
                        Not Analyzed
                      </Badge>
                    )}
                  </td>

                  {/* Created Date */}
                  <td className="px-6 py-4">
                    <p className="text-white/70 text-sm">
                      {formatDate(item.createdAt)}
                    </p>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewItem(item)}
                        className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {onDeleteItem && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteItem(item)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/70">Rows per page:</span>
          <Select value={pageSize.toString()} onValueChange={(val) => onPageSizeChange(Number(val))}>
            <SelectTrigger className="w-20 bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-white/10">
              {[10, 15, 20, 50].map((size) => (
                <SelectItem
                  key={size}
                  value={size.toString()}
                  className="text-white hover:bg-white/10"
                >
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-white/70 ml-4">
            {totalCount > 0
              ? `${(currentPage - 1) * pageSize + 1}-${Math.min(
                  currentPage * pageSize,
                  totalCount
                )} of ${totalCount}`
              : "0 items"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="text-white hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="text-white hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="px-4 py-2 text-sm text-white bg-white/5 rounded-lg border border-white/10">
            Page {currentPage} of {totalPages || 1}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="text-white hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            className="text-white hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Import Select components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
