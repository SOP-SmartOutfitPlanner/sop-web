/**
 * WizardFooter Component
 * Footer with action buttons for the wizard
 */

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { StatusType } from "./wizard-config";

interface WizardFooterProps {
  status: StatusType;
  onBack?: () => void;
  onNext?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  showBackButton?: boolean;
  showNextButton?: boolean;
  showSaveButton?: boolean;
  showCancelButton?: boolean;
  nextButtonText?: string;
  nextButtonDisabled?: boolean;
}

export function WizardFooter({
  status,
  onBack,
  onNext,
  onSave,
  onCancel,
  isSubmitting = false,
  showBackButton = false,
  showNextButton = false,
  showSaveButton = false,
  showCancelButton = false,
  nextButtonText = "Next",
  nextButtonDisabled = false,
}: WizardFooterProps) {
  // Don't show footer during analysis or when saved
  if (status === "analyzing" || status === "saved") {
    return null;
  }

  return (
    <div className="flex items-center justify-between border-t border-white/10 bg-gradient-to-r from-blue-500/5 to-purple-500/5 px-6 py-4">
      {/* Left Side - Back/Cancel */}
      <div className="flex gap-2">
        {showBackButton && onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        {showCancelButton && onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Right Side - Next/Save */}
      <div className="flex gap-2">
        {showNextButton && onNext && (
          <Button
            onClick={onNext}
            disabled={nextButtonDisabled || isSubmitting}
            className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            {nextButtonText}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
        {showSaveButton && onSave && (
          <Button
            onClick={onSave}
            disabled={isSubmitting}
            className="gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Item"}
          </Button>
        )}
      </div>
    </div>
  );
}


