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
import { Search, Eye, Trash2, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useAdminItems } from "@/hooks/admin/useAdminItem";
import Image from "next/image";

export default function AdminItemsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch items using the hook
  const { data, isLoading, error } = useAdminItems({
    PageIndex: currentPage,
    PageSize: pageSize,
    Search: debouncedSearch || undefined,
  });

  // Debug logging
  useEffect(() => {
    console.log('Fetching with params:', {
      PageIndex: currentPage,
      PageSize: pageSize,
      Search: debouncedSearch || undefined,
    });
  }, [currentPage, pageSize, debouncedSearch]);

  const items = data?.data.data || [];
  const metaData = data?.data.metaData;

  // Category counts (you can calculate from items or fetch separately)
  const categoryStats = {
    total: metaData?.totalCount || 0,
    tops: items.filter(item => item.categoryName.toLowerCase().includes('top') || item.categoryName.toLowerCase().includes('áo')).length,
    bottoms: items.filter(item => item.categoryName.toLowerCase().includes('bottom') || item.categoryName.toLowerCase().includes('quần')).length,
    footwear: items.filter(item => item.categoryName.toLowerCase().includes('shoe') || item.categoryName.toLowerCase().includes('giày')).length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Item Management</h1>
          <p className="text-gray-600 mt-2">
            Manage all user wardrobe items
          </p>
        </div>
        {/* <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button> */}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : categoryStats.total.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600 mt-1">Total Items</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : categoryStats.tops}
            </div>
            <p className="text-sm text-gray-600 mt-1">Tops</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : categoryStats.bottoms}
            </div>
            <p className="text-sm text-gray-600 mt-1">Bottoms</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : categoryStats.footwear}
            </div>
            <p className="text-sm text-gray-600 mt-1">Footwear</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
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
            <Select value={pageSize.toString()} onValueChange={(value: string) => {
              setPageSize(parseInt(value));
              setCurrentPage(1); // Reset to first page when changing page size
            }}>
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="9">9 / page</SelectItem>
                <SelectItem value="18">18 / page</SelectItem>
                <SelectItem value="30">30 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading items...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-600">An error occurred while loading items. Please try again.</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No items found.</p>
        </div>
      )}

      {/* Items Grid */}
      {!isLoading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      by {item.userDisplayName}
                    </p>
                  </div>
                  <Badge variant={item.isAnalyzed ? "default" : "secondary"}>
                    {item.isAnalyzed ? "Analyzed" : "Manual"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Item Image */}
                <div className="aspect-square bg-linear-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden relative">
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
                      <Search className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{item.categoryName}</span>
                  </div>
                  {item.brand && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Brand:</span>
                      <span className="font-medium">{item.brand}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Color:</span>
                    <span className="font-medium">{item.color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condition:</span>
                    <span className="font-medium">{item.condition}</span>
                  </div>
                  {item.styles.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Styles:</span>
                      <div className="flex flex-wrap gap-1">
                        {item.styles.map((style) => (
                          <Badge key={style.id} variant="outline" className="text-xs">
                            {style.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {metaData && metaData.totalPages > 0 && (
        <Card className="border-0 shadow">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Pagination Info */}
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, metaData.totalCount)}
                </span>{" "}
                of <span className="font-medium">{metaData.totalCount}</span> items
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                {/* First Page */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="hidden sm:flex"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>

                {/* Previous Page */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!metaData.hasPrevious}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: metaData.totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage =
                      page === 1 ||
                      page === metaData.totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);

                    if (!showPage) {
                      // Show ellipsis for skipped pages (only once)
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <span key={page} className="px-2 text-gray-400">
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
                        className={
                          page === currentPage
                            ? "bg-blue-600 hover:bg-blue-700 text-white min-w-9"
                            : "min-w-9"
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
                  disabled={!metaData.hasNext}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>

                {/* Last Page */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === metaData.totalPages}
                  onClick={() => setCurrentPage(metaData.totalPages)}
                  className="hidden sm:flex"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Page Jump (Optional - Desktop only) */}
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-sm text-gray-600">Go to page:</span>
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
                  className="w-16 h-9 text-center"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

