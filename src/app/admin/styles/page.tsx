"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
} from "lucide-react";
import {
  useAdminStyles,
  useCreateStyle,
  useUpdateStyle,
  useDeleteStyle,
  useBulkDeleteStyles,
} from "@/hooks/admin/useAdminStyles";
import type { Style } from "@/lib/api/admin-api";
import { toast } from "sonner";

export default function AdminStylesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch data
  const { data, isLoading } = useAdminStyles({
    pageIndex: currentPage,
    pageSize,
    search: debouncedSearch || undefined,
  });

  const styles = data?.data.data || [];
  const metaData = data?.data.metaData;

  // Mutations
  const createMutation = useCreateStyle();
  const updateMutation = useUpdateStyle();
  const deleteMutation = useDeleteStyle();
  const bulkDeleteMutation = useBulkDeleteStyles();

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
    setSelectedIds(new Set(styles.map((style) => style.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleCreate = async () => {
    if (!formName.trim()) {
      toast.error("Please enter style name");
      return;
    }
    if (!formDescription.trim()) {
      toast.error("Please enter style description");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: formName,
        description: formDescription,
      });
      setIsCreateOpen(false);
      setFormName("");
      setFormDescription("");
    } catch {
      // Error handled by mutation
    }
  };

  const handleEdit = async () => {
    if (!selectedStyle || !formName.trim()) return;
    if (!formDescription.trim()) {
      toast.error("Please enter style description");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: selectedStyle.id,
        name: formName,
        description: formDescription,
      });
      setIsEditOpen(false);
      setSelectedStyle(null);
      setFormName("");
      setFormDescription("");
    } catch {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!selectedStyle) return;

    try {
      await deleteMutation.mutateAsync(selectedStyle.id);
      setIsDeleteOpen(false);
      setSelectedStyle(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    try {
      await bulkDeleteMutation.mutateAsync(Array.from(selectedIds));
      toast.success(`Deleted ${selectedIds.size} styles successfully!`);
      setIsBulkDeleteOpen(false);
      setSelectedIds(new Set());
    } catch {
      // Error handled by mutation
    }
  };

  const openEditDialog = (style: Style) => {
    setSelectedStyle(style);
    setFormName(style.name);
    setFormDescription(style.description);
    setIsEditOpen(true);
  };

  const openDeleteDialog = (style: Style) => {
    setSelectedStyle(style);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Style Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage styles for wardrobe items
          </p>
        </div>
        <Button
          onClick={() => {
            setFormName("");
            setFormDescription("");
            setIsCreateOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Style
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                metaData?.totalCount || 0
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">Total Styles</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                metaData?.currentPage || 0
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">Current Page</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                metaData?.totalPages || 0
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">Total Pages</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="border-0 shadow">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {selectedIds.size > 0 && (
              <Button
                variant="destructive"
                onClick={() => setIsBulkDeleteOpen(true)}
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
        <Card className="border-blue-500 border-2 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckSquare className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">
                  {selectedIds.size} style(s) selected
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                <XSquare className="w-4 h-4 mr-2" />
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading styles...</span>
            </div>
          ) : styles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No styles found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        styles.length > 0 &&
                        styles.every((style) => selectedIds.has(style.id))
                      }
                      onCheckedChange={(checked: boolean) =>
                        checked ? selectAll() : clearSelection()
                      }
                    />
                  </TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Updated Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {styles.map((style: Style) => (
                  <TableRow key={style.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(style.id)}
                        onCheckedChange={() => toggleSelect(style.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{style.id}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{style.name}</TableCell>
                    <TableCell className="text-gray-600 max-w-xs truncate">
                      {style.description}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          style.createdBy === "SYSTEM" ? "default" : "secondary"
                        }
                      >
                        {style.createdBy || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {style.createdDate
                        ? new Date(style.createdDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {style.updatedDate
                        ? new Date(style.updatedDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(style)}
                          className="h-8 w-8"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(style)}
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {metaData && metaData.totalPages > 0 && (
        <Card className="border-0 shadow">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Pagination Info */}
              <div className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, metaData.totalCount)}
                </span>{" "}
                of <span className="font-medium">{metaData.totalCount}</span>{" "}
                styles
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="hidden sm:flex"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={!metaData.hasPrevious}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
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
                          <span key={`ellipsis-${page}`} className="px-2">
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

                <Button
                  variant="outline"
                  size="sm"
                  disabled={!metaData.hasNext}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>

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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Style</DialogTitle>
            <DialogDescription>Add a new style to the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Style Name</Label>
              <Input
                id="name"
                placeholder="Enter style name..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) handleCreate();
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter style description..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Style</DialogTitle>
            <DialogDescription>Update style information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Style Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter style name..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) handleEdit();
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Enter style description..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the style{" "}
              <strong>{selectedStyle?.name}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{selectedIds.size} styles</strong>? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                `Delete ${selectedIds.size} styles`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

