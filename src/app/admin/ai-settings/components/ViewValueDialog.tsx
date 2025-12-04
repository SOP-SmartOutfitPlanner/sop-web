"use client";

import { Copy, Check, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AISetting } from "@/lib/api/admin-api";
import { AdminModal } from "@/components/admin/AdminModal";
import GlassButton from "@/components/ui/glass-button";

interface ViewValueDialogProps {
  isOpen: boolean;
  onClose: () => void;
  setting: AISetting | null;
}

export function ViewValueDialog({
  isOpen,
  onClose,
  setting,
}: ViewValueDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!setting?.value) return;
    try {
      await navigator.clipboard.writeText(setting.value);
      setCopied(true);
      toast.success("Value copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy value");
    }
  };

  if (!setting) return null;

  return (
    <AdminModal
      open={isOpen}
      onOpenChange={onClose}
      title="View Setting Value"
      subtitle={`${setting.name} • ${setting.type.replace(/_/g, " ")}`}
      icon={<FileText className="w-5 h-5" />}
      iconClassName="from-green-500 to-emerald-600"
      maxWidth="900px"
      maxHeight="90vh"
      showConfirmButton={false}
      cancelButtonText="Close"
      contentClassName="overflow-y-auto"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-white/90">
            Full Value
          </label>
          <GlassButton
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </GlassButton>
        </div>
        <div className="p-5 rounded-xl bg-white/5 border border-white/10 min-h-[300px] max-h-[60vh] overflow-y-auto">
          <pre className="whitespace-pre-wrap break-words text-sm font-mono text-white/90 leading-relaxed">
            {setting.value}
          </pre>
        </div>
      </div>
    </AdminModal>
  );
}
