import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { useWardrobeStore } from "@/store/wardrobe-store";
import { wardrobeAPI } from "@/lib/api/wardrobe-api";
import {
  transformWizardDataToAPI,
  validateWizardFormData,
  getUserIdFromAuth,
} from "@/lib/utils/wizard-transform";
import { StepPhotoAI } from "./StepPhotoAI";
import { StepBasics } from "./StepBasics";
import { StepCategorize } from "./StepCategorize";
import { WizardFooter } from "./WizardFooter";
import type { WizardFormData, AISuggestions } from "./types";

interface AddItemWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Initial form state
const INITIAL_FORM_DATA: WizardFormData = {
  uploadedImageURL: "",
  imageRemBgURL: "",
  name: "",
  categoryId: 0,
  categoryName: "",
  brand: "",
  notes: "",
  colors: [],
  seasons: [],
  pattern: "",
  fabric: "",
  condition: "Mới",
  tags: [],
  wornToday: false,
};

export function AddItemWizard({ open, onOpenChange }: AddItemWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<WizardFormData>(INITIAL_FORM_DATA);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(null);

  const { user } = useAuthStore();
  const { fetchItems } = useWardrobeStore();

  // Reset form to initial state
  const resetAndClose = useCallback(() => {
    setCurrentStep(1);
    setFormData(INITIAL_FORM_DATA);
    setAiSuggestions(null);
    setHasChanges(false);
    setShowConfirmClose(false);
    setIsSubmitting(false);
    onOpenChange(false);
  }, [onOpenChange]);

  // Handle dialog close with unsaved changes confirmation
  const handleClose = useCallback(() => {
    if (hasChanges) {
      setShowConfirmClose(true);
    } else {
      resetAndClose();
    }
  }, [hasChanges, resetAndClose]);

  // Submit form to API
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);

    try {
      const errors = validateWizardFormData(formData);
      if (errors.length > 0) {
        errors.forEach((error) => toast.error(error));
        return;
      }

      const userId = await getUserIdFromAuth(user);
      const payload = transformWizardDataToAPI(formData, userId);

      await wardrobeAPI.createItem(payload);
      await fetchItems();

      toast.success("Đã thêm món đồ thành công!");
      resetAndClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể thêm món đồ. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, user, fetchItems, resetAndClose]);

  // Navigate to next step or submit
  const handleNext = useCallback(() => {
    if (currentStep === 1) {
      if (!formData.imageRemBgURL) {
        toast.warning('⚠️ Chưa phân tích AI! Click "Phân tích AI" để có kết quả tốt nhất.');
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const errors = validateWizardFormData(formData);
      if (errors.length > 0) {
        errors.forEach((error) => toast.error(error));
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      handleSubmit();
    }
  }, [currentStep, formData, handleSubmit]);

  // Navigate to previous step
  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Update form data and mark as changed
  const updateFormData = useCallback((updates: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !isSubmitting) {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleClose, handleNext, isSubmitting]);

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-[95vw] sm:max-w-[760px] p-0 gap-0 h-[90vh] flex flex-col overflow-hidden" showCloseButton={false}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div>
              <DialogTitle className="text-xl font-semibold">Thêm món đồ mới</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {currentStep === 1 && "Upload ảnh và phân tích bằng AI"}
                {currentStep === 2 && "Nhập thông tin cơ bản"}
                {currentStep === 3 && "Phân loại và thêm chi tiết"}
              </p>
            </div>
          </div>

          {/* Stepper */}
          <div className="px-6 py-4 border-b">
            <div className="max-w-lg mx-auto">
              <div className="flex items-start justify-between relative">
                {[
                  { step: 1, label: "Ảnh & AI" },
                  { step: 2, label: "Thông tin" },
                  { step: 3, label: "Chi tiết" }
                ].map((item) => (
                  <div key={item.step} className="flex flex-col items-center relative z-10" style={{ width: '33.333%' }}>
                    {/* Step Circle */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
                        item.step === currentStep
                          ? "bg-gradient-to-r from-login-navy to-login-blue text-white ring-4 ring-login-blue/20 scale-110"
                          : item.step < currentStep
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.step}
                    </div>
                    <span className={`text-xs mt-2 text-center font-medium transition-colors ${
                      item.step === currentStep ? "text-login-navy" : "text-muted-foreground"
                    }`}>
                      {item.label}
                    </span>
                  </div>
                ))}

                {/* Connector Lines - Absolute positioned */}
                <div className="absolute top-5 left-0 right-0 flex justify-between px-[16.666%] z-0">
                  <div 
                    className="h-0.5 transition-colors duration-200" 
                    style={{
                      width: '33.333%',
                      background: currentStep > 1 
                        ? "linear-gradient(to right, hsl(var(--login-navy)), hsl(var(--login-blue)))"
                        : "hsl(var(--muted))"
                    }}
                  />
                  <div 
                    className="h-0.5 transition-colors duration-200" 
                    style={{
                      width: '33.333%',
                      background: currentStep > 2
                        ? "linear-gradient(to right, hsl(var(--login-navy)), hsl(var(--login-blue)))"
                        : "hsl(var(--muted))"
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="animate-fade-in">
              {currentStep === 1 && (
                <StepPhotoAI
                  formData={formData}
                  updateFormData={updateFormData}
                  aiSuggestions={aiSuggestions}
                  setAiSuggestions={setAiSuggestions}
                />
              )}
              {currentStep === 2 && (
                <StepBasics
                  formData={formData}
                  updateFormData={updateFormData}
                  aiSuggestions={aiSuggestions}
                />
              )}
              {currentStep === 3 && (
                <StepCategorize
                  formData={formData}
                  updateFormData={updateFormData}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <WizardFooter
            currentStep={currentStep}
            onBack={handleBack}
            onNext={handleNext}
            onCancel={handleClose}
            isNextDisabled={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm Close Dialog */}
      <AlertDialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy thay đổi?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có thay đổi chưa được lưu. Bạn có chắc muốn đóng?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục chỉnh sửa</AlertDialogCancel>
            <AlertDialogAction onClick={resetAndClose}>
              Hủy bỏ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
