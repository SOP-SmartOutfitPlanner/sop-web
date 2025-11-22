"use client";

import { useState, useMemo } from "react";
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
  Eye,
  EyeOff,
} from "lucide-react";
import {
  useAdminAISettings,
  useCreateAISetting,
  useUpdateAISetting,
  useDeleteAISetting,
  useBulkDeleteAISettings,
} from "@/hooks/admin/useAdminAISettings";
import type { AISetting, AISettingType } from "@/lib/api/admin-api";
import { toast } from "sonner";

const AI_SETTING_TYPES: AISettingType[] = [
  "API_ITEM_ANALYZING",
  "MODEL_ANALYZING",
  "DESCRIPTION_ITEM_PROMPT",
  "VALIDATE_ITEM_PROMPT",
  "MODEL_EMBEDDING",
  "API_EMBEDDING",
  "CATEGORY_ITEM_ANALYSIS_PROMPT",
  "API_SUGGESTION",
  "OUTFIT_GENERATION_PROMPT",
  "OUTFIT_CHOOSE_PROMPT",
  "MODEL_SUGGESTION",
];

export default function AdminAISettingsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isViewValueOpen, setIsViewValueOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<AISetting | null>(
    null
  );
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showSensitiveValues, setShowSensitiveValues] = useState<
    Set<number>
  >(new Set());

  // Form states
  const [formName, setFormName] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formType, setFormType] = useState<string>("");

  // Fetch data
  const { data, isLoading, refetch } = useAdminAISettings();

  const allSettings = data?.data || [];

  // Filter and search
  const filteredSettings = useMemo(() => {
    let filtered = allSettings;

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((setting) => setting.type === typeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (setting) =>
          setting.name.toLowerCase().includes(query) ||
          setting.type.toLowerCase().includes(query) ||
          setting.value.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allSettings, typeFilter, searchQuery]);

  // Mutations
  const createMutation = useCreateAISetting();
  const updateMutation = useUpdateAISetting();
  const deleteMutation = useDeleteAISetting();
  const bulkDeleteMutation = useBulkDeleteAISettings();

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
    setSelectedIds(new Set(filteredSettings.map((setting) => setting.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const toggleShowValue = (id: number) => {
    const newSet = new Set(showSensitiveValues);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setShowSensitiveValues(newSet);
  };

  const maskSensitiveValue = (value: string, id: number): string => {
    // Mask API keys and sensitive values
    if (showSensitiveValues.has(id)) {
      return value;
    }
    // Check if it looks like an API key (starts with common prefixes)
    if (
      value.startsWith("AIza") ||
      value.startsWith("sk-") ||
      value.length > 50
    ) {
      return value.substring(0, 8) + "..." + value.substring(value.length - 4);
    }
    // For long prompts, show first 100 chars
    if (value.length > 100) {
      return value.substring(0, 100) + "...";
    }
    return value;
  };

  const handleCreate = async () => {
    if (!formName.trim()) {
      toast.error("Please enter setting name");
      return;
    }
    if (!formValue.trim()) {
      toast.error("Please enter setting value");
      return;
    }
    if (!formType) {
      toast.error("Please select setting type");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: formName,
        value: formValue,
        type: formType,
      });
      setIsCreateOpen(false);
      setFormName("");
      setFormValue("");
      setFormType("");
    } catch {
      // Error handled by mutation
    }
  };

  const handleEdit = async () => {
    if (!selectedSetting || !formName.trim()) return;
    if (!formValue.trim()) {
      toast.error("Please enter setting value");
      return;
    }
    if (!formType) {
      toast.error("Please select setting type");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: selectedSetting.id,
        data: {
          name: formName,
          value: formValue,
          type: formType,
        },
      });
      setIsEditOpen(false);
      setSelectedSetting(null);
      setFormName("");
      setFormValue("");
      setFormType("");
    } catch {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!selectedSetting) return;

    try {
      await deleteMutation.mutateAsync(selectedSetting.id);
      setIsDeleteOpen(false);
      setSelectedSetting(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    try {
      await bulkDeleteMutation.mutateAsync(Array.from(selectedIds));
      toast.success(`Deleted ${selectedIds.size} settings successfully!`);
      setIsBulkDeleteOpen(false);
      setSelectedIds(new Set());
    } catch {
      // Error handled by mutation
    }
  };

  const openEditDialog = (setting: AISetting) => {
    setSelectedSetting(setting);
    setFormName(setting.name);
    setFormValue(setting.value);
    setFormType(setting.type);
    setIsEditOpen(true);
  };

  const openDeleteDialog = (setting: AISetting) => {
    setSelectedSetting(setting);
    setIsDeleteOpen(true);
  };

  const openViewValueDialog = (setting: AISetting) => {
    setSelectedSetting(setting);
    setIsViewValueOpen(true);
  };

  const getTypeColor = (type: string) => {
    if (type.includes("API")) return "bg-blue-100 text-blue-800";
    if (type.includes("MODEL")) return "bg-purple-100 text-purple-800";
    if (type.includes("PROMPT")) return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            AI Settings Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage AI configuration settings, API keys, models, and prompts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <Loader2 className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => {
              setFormName("");
              setFormValue("");
              setFormType("");
              setIsCreateOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Setting
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                allSettings.length
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">Total Settings</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                allSettings.filter((s) => s.type.includes("API")).length
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">API Keys</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                allSettings.filter((s) => s.type.includes("MODEL")).length
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">Models</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                allSettings.filter((s) => s.type.includes("PROMPT")).length
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">Prompts</p>
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
                placeholder="Search settings by name, type, or value..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {AI_SETTING_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  {selectedIds.size} setting(s) selected
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
              <span className="ml-3 text-gray-600">Loading AI settings...</span>
            </div>
          ) : filteredSettings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No settings found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          filteredSettings.length > 0 &&
                          filteredSettings.every((setting) =>
                            selectedIds.has(setting.id)
                          )
                        }
                        onCheckedChange={(checked: boolean) =>
                          checked ? selectAll() : clearSelection()
                        }
                      />
                    </TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Updated Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSettings.map((setting: AISetting) => (
                    <TableRow key={setting.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(setting.id)}
                          onCheckedChange={() => toggleSelect(setting.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{setting.id}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {setting.name}
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(setting.type)}>
                          {setting.type.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 truncate">
                            {maskSensitiveValue(setting.value, setting.id)}
                          </span>
                          {setting.value.length > 100 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => openViewValueDialog(setting)}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          )}
                          {(setting.value.startsWith("AIza") ||
                            setting.value.startsWith("sk-") ||
                            setting.value.length > 50) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleShowValue(setting.id)}
                            >
                              {showSensitiveValues.has(setting.id) ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {setting.createdDate
                          ? new Date(setting.createdDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {setting.updatedDate
                          ? new Date(setting.updatedDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(setting)}
                            className="h-8 w-8"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(setting)}
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New AI Setting</DialogTitle>
            <DialogDescription>
              Add a new AI configuration setting
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Setting Name</Label>
              <Input
                id="name"
                placeholder="Enter setting name..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select setting type" />
                </SelectTrigger>
                <SelectContent>
                  {AI_SETTING_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Textarea
                id="value"
                placeholder="Enter setting value (API key, model name, prompt, etc.)..."
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                rows={10}
                className="font-mono text-sm"
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit AI Setting</DialogTitle>
            <DialogDescription>Update AI setting information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Setting Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter setting name..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Type</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select setting type" />
                </SelectTrigger>
                <SelectContent>
                  {AI_SETTING_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-value">Value</Label>
              <Textarea
                id="edit-value"
                placeholder="Enter setting value..."
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                rows={10}
                className="font-mono text-sm"
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

      {/* View Value Dialog */}
      <Dialog open={isViewValueOpen} onOpenChange={setIsViewValueOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Setting Value</DialogTitle>
            <DialogDescription>
              {selectedSetting?.name} - {selectedSetting?.type}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Value</Label>
              <div className="p-4 bg-gray-50 rounded-md border">
                <pre className="whitespace-pre-wrap break-words text-sm font-mono">
                  {selectedSetting?.value}
                </pre>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewValueOpen(false)}>
              Close
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
              Are you sure you want to delete the setting{" "}
              <strong>{selectedSetting?.name}</strong>? This action cannot be
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
              <strong>{selectedIds.size} settings</strong>? This action cannot
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
                `Delete ${selectedIds.size} settings`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

