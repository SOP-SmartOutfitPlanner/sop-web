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
} from "@/hooks/useAdminCategories";
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
      toast.error("Vui lòng nhập tên category");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: formName,
        parentId: formParentId === "null" ? null : parseInt(formParentId),
      });
      toast.success("Tạo category thành công!");
      setIsCreateOpen(false);
      setFormName("");
      setFormParentId("null");
    } catch {
      toast.error("Có lỗi xảy ra khi tạo category");
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
      toast.success("Cập nhật category thành công!");
      setIsEditOpen(false);
      setSelectedCategory(null);
      setFormName("");
      setFormParentId("null");
    } catch {
      toast.error("Có lỗi xảy ra khi cập nhật category");
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      await deleteMutation.mutateAsync(selectedCategory.id);
      toast.success("Xóa category thành công!");
      setIsDeleteOpen(false);
      setSelectedCategory(null);
    } catch {
      toast.error("Có lỗi xảy ra khi xóa category");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    try {
      await bulkDeleteMutation.mutateAsync(Array.from(selectedIds));
      toast.success(`Đã xóa ${selectedIds.size} categories!`);
      setIsBulkDeleteOpen(false);
      setSelectedIds(new Set());
    } catch {
      toast.error("Có lỗi xảy ra khi xóa categories");
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
            className="flex items-center gap-2 py-2 px-4 hover:bg-gray-50 rounded-lg group"
            style={{ paddingLeft: `${level * 24 + 16}px` }}
          >
            {/* Checkbox */}
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleSelect(node.id)}
              className="mr-2"
            />

            {/* Expand/Collapse */}
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(node.id)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}

            {/* Category Info */}
            <div className="flex-1 flex items-center gap-3">
              <FolderTree
                className={`w-4 h-4 ${
                  level === 0 ? "text-blue-600" : "text-gray-400"
                }`}
              />
              <div>
                <p className="font-medium text-gray-900">{node.name}</p>
                {node.parentName && (
                  <p className="text-xs text-gray-500">
                    Parent: {node.parentName}
                  </p>
                )}
              </div>
            </div>

            {/* Usage Stats */}
            <div className="flex items-center gap-2 mr-2">
              <Badge variant="secondary">{node.children.length} children</Badge>
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
                className="h-8 w-8"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openDeleteDialog(node)}
                className="h-8 w-8 text-red-600 hover:text-red-700"
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
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý Categories
          </h1>
          <p className="text-gray-600 mt-2">
            Quản lý danh mục sản phẩm và phân loại
          </p>
        </div>
        <Button
          onClick={() => {
            setFormName("");
            setFormParentId("null");
            setIsCreateOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm Category
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">
              {data?.metaData.totalCount || 0}
            </div>
            <p className="text-sm text-gray-600 mt-1">Total Categories</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {parentCategories.length}
            </div>
            <p className="text-sm text-gray-600 mt-1">Parent Categories</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {(data?.metaData.totalCount || 0) - parentCategories.length}
            </div>
            <p className="text-sm text-gray-600 mt-1">Child Categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Selection Toolbar */}
      {selectedIds.size > 0 && (
        <Card className="border-blue-500 border-2 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckSquare className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">
                  {selectedIds.size} category selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  <XSquare className="w-4 h-4 mr-2" />
                  Clear Selection
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsBulkDeleteOpen(true)}
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
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Category Hierarchy</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
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
            <DialogTitle>Tạo Category Mới</DialogTitle>
            <DialogDescription>
              Thêm category mới vào hệ thống. Chọn parent nếu đây là
              subcategory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên Category</Label>
              <Input
                id="name"
                placeholder="Nhập tên category..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent">Parent Category</Label>
              <Select value={formParentId} onValueChange={setFormParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn parent category" />
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
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Tạo"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Category</DialogTitle>
            <DialogDescription>Cập nhật thông tin category</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tên Category</Label>
              <Input
                id="edit-name"
                placeholder="Nhập tên category..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-parent">Parent Category</Label>
              <Select value={formParentId} onValueChange={setFormParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn parent category" />
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
              Hủy
            </Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Single Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa category{" "}
              <strong>{selectedCategory?.name}</strong>? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa hàng loạt</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa{" "}
              <strong>{selectedIds.size} categories</strong>? Hành động này
              không thể hoàn tác và có thể ảnh hưởng đến dữ liệu liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                `Xóa ${selectedIds.size} categories`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
