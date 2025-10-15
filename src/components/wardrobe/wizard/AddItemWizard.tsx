import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth-store';
import { useWardrobeStore } from '@/store/wardrobe-store';
import { wardrobeAPI } from '@/lib/api/wardrobe-api';
import { transformWizardDataToAPI, validateWizardFormData, getUserIdFromAuth } from '@/lib/utils/wizard-transform';
import { StepPhotoAI } from './StepPhotoAI';
import { StepBasics } from './StepBasics';
import { StepCategorize } from './StepCategorize';
import { WizardFooter } from './WizardFooter';
import type { WizardFormData, AISuggestions } from './types';

interface AddItemWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddItemWizard({ open, onOpenChange }: AddItemWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuthStore();
  const { fetchItems } = useWardrobeStore();

  const [formData, setFormData] = useState<WizardFormData>({
    uploadedImageURL: '',
    imageRemBgURL: '',
    name: '',
    categoryId: 0,
    categoryName: '',
    brand: '',
    notes: '',
    colors: [],
    seasons: [],
    pattern: '',
    fabric: '',
    condition: 'Mới',
    tags: [],
    wornToday: false,
  });

  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      if (e.key === 'Escape') {
        handleClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentStep, formData]);

  const handleClose = () => {
    if (hasChanges) {
      setShowConfirmClose(true);
    } else {
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setCurrentStep(1);
    setFormData({
      uploadedImageURL: '',
      imageRemBgURL: '',
      name: '',
      categoryId: 0,
      categoryName: '',
      brand: '',
      notes: '',
      colors: [],
      seasons: [],
      pattern: '',
      fabric: '',
      condition: 'Mới',
      tags: [],
      wornToday: false,
    });
    setAiSuggestions(null);
    setHasChanges(false);
    setShowConfirmClose(false);
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Warn if no AI analysis (but allow to proceed)
      if (!formData.imageRemBgURL) {
        toast.warning('⚠️ Chưa phân tích AI! Click "Phân tích AI" để có kết quả tốt nhất.');
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const errors = validateStep2();
      if (errors.length > 0) return;
      setCurrentStep(3);
    } else if (currentStep === 3) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep2 = (): string[] => {
    const errors = validateWizardFormData(formData);
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }
    return errors;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // 1. Validate
      const errors = validateWizardFormData(formData);
      if (errors.length > 0) {
        errors.forEach(error => toast.error(error));
        setIsSubmitting(false);
        return;
      }

      // 2. Get user ID
      const userId = await getUserIdFromAuth(user);

      // 3. Transform data
      const payload = transformWizardDataToAPI(formData, userId);

      console.log('Submitting item:', payload);

      // 4. Call API
      await wardrobeAPI.createItem(payload);

      // 5. Refresh items
      await fetchItems();

      // 6. Success
      toast.success('Đã thêm món đồ thành công!');
      resetAndClose();

    } catch (error) {
      console.error('Failed to create item:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Không thể thêm món đồ. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    // TODO: Implement draft save to localStorage
    toast.info('Tính năng lưu nháp đang phát triển');
  };

  const updateFormData = (updates: Partial<WizardFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-[760px] p-0 gap-0 h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div>
              <h2 className="text-xl font-semibold">Thêm món đồ mới</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {currentStep === 1 && 'Upload ảnh và phân tích bằng AI'}
                {currentStep === 2 && 'Nhập thông tin cơ bản'}
                {currentStep === 3 && 'Phân loại và thêm chi tiết'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="rounded-full p-1 hover:bg-accent transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {[1, 2, 3].map((step, idx) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        step <= currentStep
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {step}
                    </div>
                    <span className="text-xs mt-1 text-muted-foreground">
                      {step === 1 && 'Ảnh & AI'}
                      {step === 2 && 'Thông tin'}
                      {step === 3 && 'Chi tiết'}
                    </span>
                  </div>
                  {idx < 2 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 transition-colors ${
                        step < currentStep ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
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
            onSaveDraft={handleSaveDraft}
            isNextDisabled={isSubmitting || (currentStep === 2 && validateStep2().length > 0)}
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
            <AlertDialogAction onClick={resetAndClose}>Hủy bỏ</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


