"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import type { AISettingType } from "@/lib/api/admin-api";

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-2xl">{title}</DialogTitle>
              <DialogDescription className="text-base mt-1">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-5 py-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              Setting Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., OpenAI API Key, GPT-4 Model..."
              value={formName}
              onChange={(e) => onNameChange(e.target.value)}
              className="h-11 border-2 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-semibold">
              Type <span className="text-red-500">*</span>
            </Label>
            <Select value={formType} onValueChange={onTypeChange}>
              <SelectTrigger className="h-11 border-2 focus:border-blue-400">
                <SelectValue placeholder="Select setting type" />
              </SelectTrigger>
              <SelectContent>
                {aiSettingTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="value" className="text-sm font-semibold">
              Value <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="value"
              placeholder="Enter setting value (API key, model name, prompt, etc.)..."
              value={formValue}
              onChange={(e) => onValueChange(e.target.value)}
              rows={12}
              className="font-mono text-sm border-2 focus:border-blue-400 focus:ring-blue-400 resize-none"
            />
            <p className="text-xs text-gray-500">
              For API keys, paste the full key. For prompts, use clear and
              descriptive text.
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-2"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

