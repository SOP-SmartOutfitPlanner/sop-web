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
import { Label } from "@/components/ui/label";
import { Copy, Check, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AISetting } from "@/lib/api/admin-api";

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-2xl">View Setting Value</DialogTitle>
              <DialogDescription className="text-base mt-1">
                {setting.name} • {setting.type.replace(/_/g, " ")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Full Value</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-8"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-2 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200">
              <pre className="whitespace-pre-wrap break-words text-sm font-mono text-gray-800 leading-relaxed">
                {setting.value}
              </pre>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-2">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

