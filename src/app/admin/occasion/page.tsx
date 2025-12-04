"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Search,
  CheckSquare,
  XSquare,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertTriangle,
  Save,
  Calendar,
} from "lucide-react";
import {
  useAdminOccasions,
  useCreateOccasion,
  useUpdateOccasion,
  useDeleteOccasion,
  useBulkDeleteOccasions,
} from "@/hooks/admin/useAdminOccasion";
import type { Occasion } from "@/types/occasion";
import { toast } from "sonner";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminInput } from "@/components/admin/AdminFormInputs";
import { Input } from "@/components/ui/input";

export default function AdminOccasionsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | null>(
    null
  );
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Form states
  const [formName, setFormName] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch data
  const { data, isLoading } = useAdminOccasions({
    PageIndex: currentPage,
    PageSize: pageSize,
    Search: debouncedSearch || undefined,
  });

  const occasions = data?.data.data || [];
  const metaData = data?.data.metaData;

  // Mutations
  const createMutation = useCreateOccasion();
  const updateMutation = useUpdateOccasion();
  const deleteMutation = useDeleteOccasion();
  const bulkDeleteMutation = useBulkDeleteOccasions();

  // Selection handlers
  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    setSelectedIds(new Set(occasions.map((occ) => occ.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleCreate = async () => {
    if (!formName.trim()) {
      toast.error("Please enter occasion name");
      return;
    }

    try {
      await createMutation.mutateAsync({ name: formName });
      setIsCreateOpen(false);
      setFormName("");
    } catch {
      // Error handled by mutation
    }
  };

  const handleEdit = async () => {
    if (!selectedOccasion || !formName.trim()) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedOccasion.id,
        name: formName,
      });
      setIsEditOpen(false);
      setSelectedOccasion(null);
      setFormName("");
    } catch {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!selectedOccasion) return;

    try {
      await deleteMutation.mutateAsync(selectedOccasion.id);
      setIsDeleteOpen(false);
      setSelectedOccasion(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    try {
      await bulkDeleteMutation.mutateAsync(Array.from(selectedIds));
      toast.success(`Deleted ${selectedIds.size} occasions successfully!`);
      setIsBulkDeleteOpen(false);
      setSelectedIds(new Set());
    } catch {
      // Error handled by mutation
    }
  };

  const openEditDialog = (occasion: Occasion) => {
    setSelectedOccasion(occasion);
    setFormName(occasion.name);
    setIsEditOpen(true);
  };

  const openDeleteDialog = (occasion: Occasion) => {
    setSelectedOccasion(occasion);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
            Occasion Management
          </h1>
          <p className="text-white/70 mt-2">
            Manage occasions for wardrobe items
          </p>
        </div>
        <Button
          onClick={() => {
            setFormName("");
            setIsCreateOpen(true);
          }}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/40"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Occasion
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-white">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                metaData?.totalCount || 0
              )}
            </div>
            <p className="text-sm text-white/60 mt-1">Total Occasions</p>
          </CardContent>
        </Card>
        <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-cyan-400">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                metaData?.currentPage || 0
              )}
            </div>
            <p className="text-sm text-white/60 mt-1">Current Page</p>
          </CardContent>
        </Card>
        <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-400">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                metaData?.totalPages || 0
              )}
            </div>
            <p className="text-sm text-white/60 mt-1">Total Pages</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <Input
                placeholder="Search occasions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-cyan-400/50"
              />
            </div>
            {selectedIds.size > 0 && (
              <Button
                variant="destructive"
                onClick={() => setIsBulkDeleteOpen(true)}
                className="bg-red-500/20 text-red-300 border-red-400/30 hover:bg-red-500/30"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedIds.size})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selection Toolbar */}
      {selectedIds.size > 0 && (
        <Card className="border-cyan-400/50 border-2 bg-cyan-500/10 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckSquare className="w-5 h-5 text-cyan-400" />
                <span className="font-medium text-white">
                  {selectedIds.size} occasion(s) selected
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <XSquare className="w-4 h-4 mr-2" />
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              <span className="ml-3 text-white/70">Loading occasions...</span>
            </div>
          ) : occasions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/70">No occasions found.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-white/10 overflow-hidden bg-white/5">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-white/10 bg-white/5 hover:bg-white/10">
                      <TableHead className="w-12 text-white/90">
                        <Checkbox
                          checked={
                            occasions.length > 0 &&
                            occasions.every((occ) => selectedIds.has(occ.id))
                          }
                          onCheckedChange={(checked: boolean) =>
                            checked ? selectAll() : clearSelection()
                          }
                          className="border-white/30 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                        />
                      </TableHead>
                      <TableHead className="text-white/90 text-xs uppercase tracking-wider font-semibold">
                        ID
                      </TableHead>
                      <TableHead className="text-white/90 text-xs uppercase tracking-wider font-semibold">
                        Name
                      </TableHead>
                      <TableHead className="text-white/90 text-xs uppercase tracking-wider font-semibold">
                        Created Date
                      </TableHead>
                      <TableHead className="text-white/90 text-xs uppercase tracking-wider font-semibold">
                        Updated Date
                      </TableHead>
                      <TableHead className="text-right text-white/90 text-xs uppercase tracking-wider font-semibold">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {occasions.map((occasion) => (
                      <TableRow
                        key={occasion.id}
                        className="border-b border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(occasion.id)}
                            onCheckedChange={() => toggleSelect(occasion.id)}
                            className="border-white/30 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                          />
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-white/10 text-white/80 border border-white/20">
                            {occasion.id}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-white">
                          {occasion.name}
                        </TableCell>
                        <TableCell className="text-white/70 text-sm">
                          {new Date(occasion.createdDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </TableCell>
                        <TableCell className="text-white/70 text-sm">
                          {new Date(occasion.updatedDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(occasion)}
                              className="h-8 w-8 hover:bg-white/20 text-white/70 hover:text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(occasion)}
                              className="h-8 w-8 hover:bg-red-500/20 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {metaData && metaData.totalPages > 0 && (
        <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Pagination Info */}
              <div className="text-sm text-white/70">
                Showing{" "}
                <span className="font-semibold text-cyan-300">
                  {(currentPage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-cyan-300">
                  {Math.min(currentPage * pageSize, metaData.totalCount)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-cyan-300">
                  {metaData.totalCount}
                </span>{" "}
                occasions
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="hidden sm:flex border-white/20 bg-white/5 text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/50 disabled:opacity-30"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={!metaData.hasPrevious}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="border-white/20 bg-white/5 text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/50 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: metaData.totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      return (
                        page === 1 ||
                        page === metaData.totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      );
                    })
                    .map((page, index, array) => {
                      if (index > 0 && array[index - 1] !== page - 1) {
                        return (
                          <span
                            key={`ellipsis-${page}`}
                            className="px-2 text-white/40"
                          >
                            ...
                          </span>
                        );
                      }
                      return (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
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

                <Button
                  variant="outline"
                  size="sm"
                  disabled={!metaData.hasNext}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="border-white/20 bg-white/5 text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/50 disabled:opacity-30"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === metaData.totalPages}
                  onClick={() => setCurrentPage(metaData.totalPages)}
                  className="hidden sm:flex border-white/20 bg-white/5 text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/50 disabled:opacity-30"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <AdminModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onConfirm={handleCreate}
        title="Create New Occasion"
        subtitle="Add a new occasion to the system"
        icon={<Calendar className="w-5 h-5" />}
        iconClassName="from-cyan-500 to-blue-600"
        maxWidth="480px"
        confirmButtonText="Create Occasion"
        confirmButtonIcon={<Plus className="w-4 h-4" />}
        confirmButtonColor="rgba(59, 130, 246, 0.8)"
        confirmButtonBorderColor="rgba(59, 130, 246, 1)"
        isLoading={createMutation.isPending}
        loadingText="Creating..."
      >
        <div className="space-y-5">
          <AdminInput
            id="name"
            label="Occasion Name"
            placeholder="Enter occasion name..."
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            required
          />
        </div>
      </AdminModal>

      {/* Edit Dialog */}
      <AdminModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onConfirm={handleEdit}
        title="Edit Occasion"
        subtitle="Update occasion information"
        icon={<Edit className="w-5 h-5" />}
        iconClassName="from-cyan-500 to-blue-600"
        maxWidth="480px"
        confirmButtonText="Save Changes"
        confirmButtonIcon={<Save className="w-4 h-4" />}
        confirmButtonColor="rgba(59, 130, 246, 0.8)"
        confirmButtonBorderColor="rgba(59, 130, 246, 1)"
        isLoading={updateMutation.isPending}
        loadingText="Saving..."
      >
        <div className="space-y-5">
          <AdminInput
            id="edit-name"
            label="Occasion Name"
            placeholder="Enter occasion name..."
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleEdit();
            }}
            required
          />
        </div>
      </AdminModal>

      {/* Delete Confirmation */}
      <AdminModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        subtitle="This action cannot be undone"
        icon={<AlertTriangle className="w-5 h-5" />}
        iconClassName="from-red-500 to-red-600"
        maxWidth="480px"
        confirmButtonText="Delete Occasion"
        confirmButtonIcon={<Trash2 className="w-4 h-4" />}
        isLoading={deleteMutation.isPending}
        loadingText="Deleting..."
        variant="danger"
      >
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="font-bricolage text-sm text-gray-200 leading-relaxed">
            Are you sure you want to delete the occasion{" "}
            <strong className="text-white">{selectedOccasion?.name}</strong>?
            This action cannot be undone.
          </p>
        </div>
      </AdminModal>

      {/* Bulk Delete Confirmation */}
      <AdminModal
        open={isBulkDeleteOpen}
        onOpenChange={setIsBulkDeleteOpen}
        onConfirm={handleBulkDelete}
        title="Confirm Bulk Deletion"
        subtitle="This action cannot be undone"
        icon={<AlertTriangle className="w-5 h-5" />}
        iconClassName="from-red-500 to-red-600"
        maxWidth="480px"
        confirmButtonText={`Delete ${selectedIds.size} Occasions`}
        confirmButtonIcon={<Trash2 className="w-4 h-4" />}
        isLoading={bulkDeleteMutation.isPending}
        loadingText="Deleting..."
        variant="danger"
      >
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="font-bricolage text-sm text-gray-200 leading-relaxed">
            Are you sure you want to delete{" "}
            <strong className="text-white">{selectedIds.size} occasions</strong>
            ? This action cannot be undone.
          </p>
        </div>
      </AdminModal>
    </div>
  );
}
