import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface WizardFooterProps {
  currentStep: number;
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
  isNextDisabled?: boolean;
}

export function WizardFooter({
  currentStep,
  onBack,
  onNext,
  onCancel,
  isNextDisabled,
}: WizardFooterProps) {
  return (
    <div className="sticky bottom-0 px-6 py-4 border-t bg-background flex items-center justify-between gap-3">
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>

      <div className="flex items-center gap-2">
        {currentStep > 1 && (
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        )}

        <Button onClick={onNext} disabled={isNextDisabled}>
          {currentStep === 3 ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Finish
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}


