"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles, AlertTriangle, Trash2 } from "lucide-react";
import {
  useAdminAISettings,
  useCreateAISetting,
  useUpdateAISetting,
  useDeleteAISetting,
  useBulkDeleteAISettings,
} from "@/hooks/admin/useAdminAISettings";
import type { AISetting, AISettingType } from "@/lib/api/admin-api";
import { toast } from "sonner";
import { StatsCards } from "./components/StatsCards";
import { SearchFilters } from "./components/SearchFilters";
import { SelectionToolbar } from "./components/SelectionToolbar";
import { SettingsTable } from "./components/SettingsTable";
import { AISettingFormDialog } from "./components/AISettingFormDialog";
import { ViewValueDialog } from "./components/ViewValueDialog";
import { AdminModal } from "@/components/admin/AdminModal";

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

  // Form states
  const [formName, setFormName] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formType, setFormType] = useState<string>("");

  // Fetch data
  const { data, isLoading } = useAdminAISettings();

  const allSettings = useMemo(() => data?.data || [], [data?.data]);

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

  const maskSensitiveValue = (value: string, id: number): string => {
    // Mask API keys and sensitive values
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
    if (type.includes("API"))
      return "bg-cyan-500/20 text-cyan-300 border-cyan-400/30";
    if (type.includes("MODEL"))
      return "bg-purple-500/20 text-purple-300 border-purple-400/30";
    if (type.includes("PROMPT"))
      return "bg-green-500/20 text-green-300 border-green-400/30";
    return "bg-white/10 text-white/70 border-white/20";
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-200 via-white to-blue-200 bg-clip-text text-transparent">
              AI Settings Management
            </h1>
          </div>
          <p className="text-white/70">
            Manage AI configuration settings, API keys, models, and prompts
          </p>
        </div>
      </div>

      {/* Stats */}
      <StatsCards isLoading={isLoading} allSettings={allSettings} />

      {/* Search & Filters */}
      <SearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        aiSettingTypes={AI_SETTING_TYPES}
      />

      {/* Selection Toolbar */}
      <SelectionToolbar
        selectedCount={selectedIds.size}
        onClearSelection={clearSelection}
      />

      {/* Table */}
      <Card className="border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
        <CardContent className="pt-6">
          <SettingsTable
            isLoading={isLoading}
            filteredSettings={filteredSettings}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onSelectAll={selectAll}
            onClearSelection={clearSelection}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            onViewValue={openViewValueDialog}
            maskSensitiveValue={maskSensitiveValue}
            getTypeColor={getTypeColor}
          />
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <AISettingFormDialog
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setFormName("");
          setFormValue("");
          setFormType("");
        }}
        title="Create New AI Setting"
        description="Add a new AI configuration setting to the system"
        formName={formName}
        formValue={formValue}
        formType={formType}
        onNameChange={setFormName}
        onValueChange={setFormValue}
        onTypeChange={setFormType}
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
        submitLabel="Create Setting"
        aiSettingTypes={AI_SETTING_TYPES}
      />

      {/* Edit Dialog */}
      <AISettingFormDialog
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedSetting(null);
          setFormName("");
          setFormValue("");
          setFormType("");
        }}
        title="Edit AI Setting"
        description="Update AI setting information"
        formName={formName}
        formValue={formValue}
        formType={formType}
        onNameChange={setFormName}
        onValueChange={setFormValue}
        onTypeChange={setFormType}
        onSubmit={handleEdit}
        isSubmitting={updateMutation.isPending}
        submitLabel="Save Changes"
        aiSettingTypes={AI_SETTING_TYPES}
      />

      {/* View Value Dialog */}
      <ViewValueDialog
        isOpen={isViewValueOpen}
        onClose={() => {
          setIsViewValueOpen(false);
          setSelectedSetting(null);
        }}
        setting={selectedSetting}
      />

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
        confirmButtonText="Delete Setting"
        confirmButtonIcon={<Trash2 className="w-4 h-4" />}
        isLoading={deleteMutation.isPending}
        loadingText="Deleting..."
        variant="danger"
      >
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="font-bricolage text-sm text-gray-200 leading-relaxed">
            Are you sure you want to delete the setting{" "}
            <strong className="text-white">{selectedSetting?.name}</strong>?
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
        confirmButtonText={`Delete ${selectedIds.size} Settings`}
        confirmButtonIcon={<Trash2 className="w-4 h-4" />}
        isLoading={bulkDeleteMutation.isPending}
        loadingText="Deleting..."
        variant="danger"
      >
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="font-bricolage text-sm text-gray-200 leading-relaxed">
            Are you sure you want to delete{" "}
            <strong className="text-white">
              {selectedIds.size} setting{selectedIds.size > 1 ? "s" : ""}
            </strong>
            ? This action cannot be undone.
          </p>
        </div>
      </AdminModal>
    </div>
  );
}
