"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Loader2,
  FolderTree,
  CheckSquare,
  XSquare,
} from "lucide-react";
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useBulkDeleteCategories,
  useCategoryStats,
} from "@/hooks/admin/useAdminCategories";
import type { Category } from "@/lib/api/admin-api";
import { toast } from "sonner";

interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export default function AdminCategoriesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set()
  );
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Form states
  const [formName, setFormName] = useState("");
  const [formParentId, setFormParentId] = useState<string>("null");

  // Fetch data
  const { data, isLoading } = useAdminCategories({ pageSize: 100 });
  const { data: statsData } = useCategoryStats();

  // Mutations
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const bulkDeleteMutation = useBulkDeleteCategories();

  // Suppress unused variable warning - statsData fetched for future use
  void statsData;

  // Build category tree
  const categoryTree = useMemo(() => {
    if (!data?.data) return [];

    const categories = data.data;
    const tree: CategoryTreeNode[] = [];
    const map = new Map<number, CategoryTreeNode>();

    // Create nodes
    categories.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    // Build tree
    categories.forEach((cat) => {
      const node = map.get(cat.id)!;
      if (cat.parentId === null) {
        tree.push(node);
      } else {
        const parent = map.get(cat.parentId);
        if (parent) {
          parent.children.push(node);
        }
      }
    });

    return tree;
  }, [data]);

  // Get parent categories
  const parentCategories = useMemo(() => {
    return data?.data.filter((cat) => cat.parentId === null) || [];
  }, [data]);

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
    if (data?.data) {
      setSelectedIds(new Set(data.data.map((cat) => cat.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCreate = async () => {
    if (!formName.trim()) {
      toast.error("Please enter category name");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: formName,
        parentId: formParentId === "null" ? null : parseInt(formParentId),
      });
      toast.success("Category created successfully!");
      setIsCreateOpen(false);
      setFormName("");
      setFormParentId("null");
    } catch {
      toast.error("An error occurred while creating category");
    }
  };

  const handleEdit = async () => {
    if (!selectedCategory || !formName.trim()) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedCategory.id,
        data: {
          name: formName,
          parentId: formParentId === "null" ? null : parseInt(formParentId),
        },
      });
      toast.success("Category updated successfully!");
      setIsEditOpen(false);
      setSelectedCategory(null);
      setFormName("");
      setFormParentId("null");
    } catch {
      toast.error("An error occurred while updating category");
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      await deleteMutation.mutateAsync(selectedCategory.id);
      toast.success("Category deleted successfully!");
      setIsDeleteOpen(false);
      setSelectedCategory(null);
    } catch {
      toast.error("An error occurred while deleting category");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    try {
      await bulkDeleteMutation.mutateAsync(Array.from(selectedIds));
      toast.success(`Deleted ${selectedIds.size} categories successfully!`);
      setIsBulkDeleteOpen(false);
      setSelectedIds(new Set());
    } catch {
      toast.error("An error occurred while deleting categories");
    }
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setFormName(category.name);
    setFormParentId(category.parentId?.toString() || "null");
    setIsEditOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  };

  // Render category tree recursively
  const renderCategoryTree = (nodes: CategoryTreeNode[], level: number = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedCategories.has(node.id);
      const hasChildren = node.children.length > 0;
      const isSelected = selectedIds.has(node.id);

      return (
        <div key={node.id}>
          <div
            className="flex items-center gap-2 py-3 px-4 hover:bg-white/10 rounded-lg group transition-all duration-200 border border-transparent hover:border-white/20"
            style={{ paddingLeft: `${level * 24 + 16}px` }}
          >
            {/* Checkbox */}
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleSelect(node.id)}
              className="mr-2 border-white/30 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
            />

            {/* Expand/Collapse */}
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(node.id)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-cyan-300" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-white/60" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}

            {/* Category Info */}
            <div className="flex-1 flex items-center gap-3">
              <FolderTree
                className={`w-4 h-4 ${
                  level === 0 ? "text-cyan-400" : "text-white/50"
                }`}
              />
              <div>
                <p className="font-medium text-white">{node.name}</p>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="flex items-center gap-2 mr-2">
              {node.children.length > 0 && (
                <Badge className="bg-white/10 text-white/80 border border-white/20">{node.children.length} children</Badge>
              )}
              {/* <Badge
                variant={itemCount > 0 ? "default" : "outline"}
                className={itemCount > 0 ? "bg-green-600" : ""}
              >
                {itemCount} items
              </Badge> */}
            </div>

            {/* Actions */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEditDialog(node)}
                className="h-8 w-8 hover:bg-white/20 text-white/70 hover:text-white"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openDeleteDialog(node)}
                className="h-8 w-8 hover:bg-red-500/20 text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Children */}
          {hasChildren &&
            isExpanded &&
            renderCategoryTree(node.children, level + 1)}
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-white/70">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
            Category Management
          </h1>
          <p className="text-white/70 mt-2">
            Manage product categories and classifications
          </p>
        </div>
        <Button
          onClick={() => {
            setFormName("");
            setFormParentId("null");
            setIsCreateOpen(true);
          }}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/40"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-white">
              {data?.metaData.totalCount || 0}
            </div>
            <p className="text-sm text-white/60 mt-1">Total Categories</p>
          </CardContent>
        </Card>
        <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-cyan-400">
              {parentCategories.length}
            </div>
            <p className="text-sm text-white/60 mt-1">Parent Categories</p>
          </CardContent>
        </Card>
        <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-400">
              {(data?.metaData.totalCount || 0) - parentCategories.length}
            </div>
            <p className="text-sm text-white/60 mt-1">Child Categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Selection Toolbar */}
      {selectedIds.size > 0 && (
        <Card className="border border-cyan-400/50 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-xl shadow-xl shadow-cyan-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckSquare className="w-5 h-5 text-cyan-300" />
                <span className="font-medium text-white">
                  {selectedIds.size} category selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={clearSelection} className="border-white/20 bg-white/10 text-white hover:bg-white/20">
                  <XSquare className="w-4 h-4 mr-2" />
                  Clear Selection
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkDeleteOpen(true)}
                  className="border-red-400/30 bg-red-500/20 text-red-300 hover:bg-red-500/30"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected ({selectedIds.size})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Tree */}
      <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Category Hierarchy</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll} className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                <CheckSquare className="w-4 h-4 mr-2" />
                Select All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">{renderCategoryTree(categoryTree)}</div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category to the system. Select a parent if this is a subcategory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                placeholder="Enter category name..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent">Parent Category</Label>
              <Select value={formParentId} onValueChange={setFormParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">None (Root Category)</SelectItem>
                  {parentCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Category Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter category name..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-parent">Parent Category</Label>
              <Select value={formParentId} onValueChange={setFormParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">None (Root Category)</SelectItem>
                  {parentCategories
                    .filter((cat) => cat.id !== selectedCategory?.id)
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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

      {/* Delete Single Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the category{" "}
              <strong>{selectedCategory?.name}</strong>? This action cannot be undone.
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
              <strong>{selectedIds.size} categories</strong>? This action
              cannot be undone and may affect related data.
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
                `Delete ${selectedIds.size} categories`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
