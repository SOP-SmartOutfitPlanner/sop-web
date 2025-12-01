"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Eye,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useAdminItems } from "@/hooks/admin/useAdminItem";
import Image from "next/image";

export default function AdminItemsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch items using the hook
  const { data, isLoading, error, isFetching } = useAdminItems({
    PageIndex: currentPage,
    PageSize: pageSize,
    Search: debouncedSearch || undefined,
  });

  const items = data?.data.data || [];
  const metaData = data?.data.metaData;

  // Auto-reset to page 1 if current page returns empty array and we're not on page 1
  useEffect(() => {
    if (
      !isLoading &&
      !isFetching &&
      items.length === 0 &&
      currentPage > 1 &&
      metaData
    ) {
      // Page doesn't exist (returned empty array), reset to page 1
      const timer = setTimeout(() => {
        setCurrentPage(1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isFetching, items.length, currentPage, metaData]);

  // Category counts (you can calculate from items or fetch separately)
  const categoryStats = {
    total: metaData?.totalCount || 0,
    tops: items.filter(
      (item) =>
        item.categoryName.toLowerCase().includes("top") ||
        item.categoryName.toLowerCase().includes("áo")
    ).length,
    bottoms: items.filter(
      (item) =>
        item.categoryName.toLowerCase().includes("bottom") ||
        item.categoryName.toLowerCase().includes("quần")
    ).length,
    footwear: items.filter(
      (item) =>
        item.categoryName.toLowerCase().includes("shoe") ||
        item.categoryName.toLowerCase().includes("giày")
    ).length,
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
            Item Management
          </h1>
          <p className="text-white/70 mt-2">Manage all user wardrobe items</p>
        </div>
        {/* <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/40">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button> */}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-white">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                categoryStats.total.toLocaleString()
              )}
            </div>
            <p className="text-sm text-white/60 mt-1">Total Items</p>
          </CardContent>
        </Card>
        <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-cyan-400">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                categoryStats.tops
              )}
            </div>
            <p className="text-sm text-white/60 mt-1">Tops</p>
          </CardContent>
        </Card>
        <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-400">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                categoryStats.bottoms
              )}
            </div>
            <p className="text-sm text-white/60 mt-1">Bottoms</p>
          </CardContent>
        </Card>
        <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-400">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                categoryStats.footwear
              )}
            </div>
            <p className="text-sm text-white/60 mt-1">Footwear</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-cyan-400/50"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Tops">Tops</SelectItem>
                <SelectItem value="Bottoms">Bottoms</SelectItem>
                <SelectItem value="Outerwear">Outerwear</SelectItem>
                <SelectItem value="Footwear">Footwear</SelectItem>
                <SelectItem value="Accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={pageSize.toString()}
              onValueChange={(value: string) => {
                setPageSize(parseInt(value));
                setCurrentPage(1); // Reset to first page when changing page size
              }}
            >
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 / page</SelectItem>
                <SelectItem value="30">30 / page</SelectItem>
                <SelectItem value="45">45 / page</SelectItem>
                <SelectItem value="60">60 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <span className="ml-3 text-white/70">Loading items...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-400">
            An error occurred while loading items. Please try again.
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/70">No items found.</p>
        </div>
      )}

      {/* Items Grid */}
      {!isLoading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className="border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white/5 backdrop-blur-xl"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold text-white truncate">{item.name}</CardTitle>
                    <p className="text-xs text-white/50 mt-1 truncate">
                      by {item.userDisplayName}
                    </p>
                  </div>
                  <Badge className={item.isAnalyzed ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-lg shadow-cyan-500/20" : "bg-white/10 text-white/70 border border-white/20"}>
                    {item.isAnalyzed ? "Analyzed" : "Manual"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Item Image */}
                <div className="aspect-square bg-gradient-to-br from-white/5 to-white/10 rounded-lg overflow-hidden relative border border-white/10">
                  {item.imgUrl ? (
                    <Image
                      src={item.imgUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Search className="w-16 h-16 text-white/20" />
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-white/50">Category:</span>
                    <span className="font-medium text-white/90 text-right">{item.categoryName}</span>
                  </div>
                  {item.brand && (
                    <div className="flex justify-between items-center">
                      <span className="text-white/50">Brand:</span>
                      <span className="font-medium text-white/90">{item.brand}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-white/50 flex-shrink-0">Color:</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {(() => {
                        try {
                          const colors = JSON.parse(item.color);
                          return Array.isArray(colors) ? colors.map((color: { name: string; hex: string }, idx: number) => (
                            <div key={idx} className="flex items-center gap-1 bg-white/10 border border-white/20 rounded px-1.5 py-0.5">
                              <div className="w-3 h-3 rounded-full border border-white/30" style={{ backgroundColor: color.hex }} />
                              <span className="text-white/80 text-[10px]">{color.name}</span>
                            </div>
                          )) : <span className="text-white/70">{item.color}</span>;
                        } catch {
                          return <span className="text-white/70">{item.color}</span>;
                        }
                      })()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/50">Condition:</span>
                    <span className="font-medium text-white/90">{item.condition}</span>
                  </div>
                  {item.styles.length > 0 && (
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-white/50 flex-shrink-0">Styles:</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {item.styles.map((style) => (
                          <Badge
                            key={style.id}
                            className="bg-white/10 text-white/80 border border-white/20 text-[10px] px-1.5 py-0"
                          >
                            {style.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 border-white/20 bg-white/5 text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/50">
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-400/50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {metaData && metaData.totalPages > 0 && (
        <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Pagination Info */}
              <div className="text-sm text-white/70">
                {items.length > 0 ? (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-cyan-300">
                      {(currentPage - 1) * pageSize + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-cyan-300">
                      {Math.min(currentPage * pageSize, metaData.totalCount)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-cyan-300">{metaData.totalCount}</span>{" "}
                    items
                  </>
                ) : (
                  <span>No items found</span>
                )}
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                {/* First Page */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1 || isFetching}
                  onClick={() => setCurrentPage(1)}
                  className="hidden sm:flex border-white/20 bg-white/5 text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/50 disabled:opacity-30"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>

                {/* Previous Page */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!metaData.hasPrevious || isFetching}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="border-white/20 bg-white/5 text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/50 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: metaData.totalPages },
                    (_, i) => i + 1
                  ).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage =
                      page === 1 ||
                      page === metaData.totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);

                    if (!showPage) {
                      // Show ellipsis for skipped pages (only once)
                      if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="px-2 text-white/40">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        disabled={isFetching}
                        className={
                          page === currentPage
                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 border-0 hover:from-cyan-600 hover:to-blue-700 min-w-9"
                            : "border-white/20 bg-white/5 text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/50 min-w-9"
                        }
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                {/* Next Page */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!metaData.hasNext || isFetching}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="border-white/20 bg-white/5 text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/50 disabled:opacity-30"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>

                {/* Last Page */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === metaData.totalPages || isFetching}
                  onClick={() => setCurrentPage(metaData.totalPages)}
                  className="hidden sm:flex border-white/20 bg-white/5 text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/50 disabled:opacity-30"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Page Jump (Optional - Desktop only) */}
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-sm text-white/70">Go to page:</span>
                <Input
                  type="number"
                  min={1}
                  max={metaData.totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= metaData.totalPages) {
                      setCurrentPage(page);
                    }
                  }}
                  className="w-16 h-9 text-center bg-white/5 border-white/20 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
