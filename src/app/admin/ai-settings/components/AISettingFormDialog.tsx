"use client";

import { Sparkles, Save, Plus } from "lucide-react";
import type { AISettingType } from "@/lib/api/admin-api";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  AdminInput,
  AdminTextarea,
  AdminSelect,
} from "@/components/admin/AdminFormInputs";

interface AISettingFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  formName: string;
  formValue: string;
  formType: string;
  onNameChange: (name: string) => void;
  onValueChange: (value: string) => void;
  onTypeChange: (type: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitLabel: string;
  aiSettingTypes: AISettingType[];
}

export function AISettingFormDialog({
  isOpen,
  onClose,
  title,
  description,
  formName,
  formValue,
  formType,
  onNameChange,
  onValueChange,
  onTypeChange,
  onSubmit,
  isSubmitting,
  submitLabel,
  aiSettingTypes,
}: AISettingFormDialogProps) {
  const isCreate = title.toLowerCase().includes("create");

  return (
    <AdminModal
      open={isOpen}
      onOpenChange={onClose}
      onConfirm={onSubmit}
      title={title}
      subtitle={description}
      icon={<Sparkles className="w-5 h-5" />}
      iconClassName="from-purple-500 to-pink-600"
      maxWidth="900px"
      maxHeight="90vh"
      confirmButtonText={submitLabel}
      confirmButtonIcon={
        isCreate ? <Plus className="w-4 h-4" /> : <Save className="w-4 h-4" />
      }
      confirmButtonColor="rgba(139, 92, 246, 0.8)"
      confirmButtonBorderColor="rgba(139, 92, 246, 1)"
      isLoading={isSubmitting}
      loadingText="Processing..."
      contentClassName="overflow-y-auto"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AdminInput
            id="name"
            label="Setting Name"
            placeholder="e.g., OpenAI API Key, GPT-4 Model..."
            value={formName}
            onChange={(e) => onNameChange(e.target.value)}
            required
          />
          <AdminSelect
            id="type"
            label="Type"
            value={formType}
            onChange={onTypeChange}
            placeholder="Select setting type"
            options={aiSettingTypes.map((type) => ({
              value: type,
              label: type.replace(/_/g, " "),
            }))}
            required
          />
        </div>
        <AdminTextarea
          id="value"
          label="Value"
          placeholder="Enter setting value (API key, model name, prompt, etc.)..."
          value={formValue}
          onChange={(e) => onValueChange(e.target.value)}
          rows={16}
          className="font-mono text-sm min-h-[350px]"
          required
        />
        <p className="text-xs text-white/50">
          For API keys, paste the full key. For prompts, use clear and
          descriptive text.
        </p>
      </div>
    </AdminModal>
  );
}
