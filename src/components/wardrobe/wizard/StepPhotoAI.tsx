import { useState, useRef } from 'react';
import { Upload, Sparkles, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { wardrobeAPI } from '@/lib/api/wardrobe-api';
import { parseAIResponseToFormData, base64ToFile } from '@/lib/utils/ai-suggestions-parser';
import type { WizardFormData, AISuggestions } from './types';

interface StepPhotoAIProps {
  formData: WizardFormData;
  updateFormData: (updates: Partial<WizardFormData>) => void;
  aiSuggestions: AISuggestions | null;
  setAiSuggestions: (suggestions: AISuggestions | null) => void;
}

export function StepPhotoAI({ formData, updateFormData, aiSuggestions, setAiSuggestions }: StepPhotoAIProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      updateFormData({ uploadedImageURL: imageUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) handleFileSelect(file);
        break;
      }
    }
  };

  const handleAIAnalyze = async () => {
    if (!formData.uploadedImageURL) return;

    setIsAnalyzing(true);
    
    try {
      // Convert base64 to file
      const file = await base64ToFile(formData.uploadedImageURL, 'item.jpg');
      
      // Call AI analysis API
      const response = await wardrobeAPI.getImageSummary(file);
      
      // Save AI response (wardrobeAPI already returns the data object)
      setAiSuggestions(response);
      
      toast.success('Phân tích thành công! ✅');
      
    } catch (error) {
      console.error('AI analysis failed:', error);
      toast.error('Không thể phân tích ảnh. Vui lòng thử lại.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyAllSuggestions = () => {
    if (!aiSuggestions) return;

    const formUpdates = parseAIResponseToFormData(aiSuggestions);
    updateFormData(formUpdates);

    toast.success('Đã áp dụng tất cả gợi ý!');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Dropzone */}
      <div className="space-y-4">
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onPaste={handlePaste}
          tabIndex={0}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />

          {!formData.uploadedImageURL ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Kéo thả ảnh vào đây</p>
                <p className="text-sm text-muted-foreground mt-1">
                  hoặc nhấn để chọn file, hoặc paste từ clipboard
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Chọn File
              </Button>
            </div>
          ) : (
            <div className="relative">
              <img
                src={formData.uploadedImageURL}
                alt="Uploaded item"
                className="w-full h-64 object-contain rounded-lg"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={() => updateFormData({ uploadedImageURL: '', imageRemBgURL: '' })}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {formData.uploadedImageURL && (
          <Button
            className="w-full"
            onClick={handleAIAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Đang phân tích...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Phân tích bằng AI
              </>
            )}
          </Button>
        )}
      </div>

      {/* Preview & AI Suggestions */}
      <div className="space-y-4">
        {formData.uploadedImageURL && (
          <Card className="p-4">
            <h4 className="font-medium mb-3">Xem trước</h4>
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={formData.uploadedImageURL}
                alt="Preview"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
              />
            </div>
          </Card>
        )}

        {aiSuggestions && (
          <Card className="p-4 border-emerald-200 bg-emerald-50/50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Kết quả phân tích AI
              </h4>
              <Button size="sm" variant="outline" onClick={applyAllSuggestions}>
                Áp dụng tất cả
              </Button>
            </div>

            <div className="space-y-2 text-sm">
              {/* Color */}
              <SuggestionRow
                label="Màu sắc"
                value={aiSuggestions.color}
                onApply={() => {
                  const formUpdates = parseAIResponseToFormData(aiSuggestions);
                  updateFormData({ colors: formUpdates.colors });
                }}
              />

              {/* Weather */}
              <SuggestionRow
                label="Thời tiết"
                value={aiSuggestions.weatherSuitable}
                onApply={() => {
                  const formUpdates = parseAIResponseToFormData(aiSuggestions);
                  updateFormData({ seasons: formUpdates.seasons });
                }}
              />

              {/* Fabric */}
              <SuggestionRow
                label="Chất liệu"
                value={aiSuggestions.fabric}
                onApply={() => updateFormData({ fabric: aiSuggestions.fabric })}
              />

              {/* Pattern */}
              <SuggestionRow
                label="Họa tiết"
                value={aiSuggestions.pattern}
                onApply={() => updateFormData({ pattern: aiSuggestions.pattern })}
              />

              {/* Condition */}
              <SuggestionRow
                label="Tình trạng"
                value={aiSuggestions.condition}
                onApply={() => updateFormData({ condition: aiSuggestions.condition })}
              />

              {/* Description */}
              <div className="p-2 rounded bg-background border">
                <span className="text-xs font-medium text-muted-foreground block mb-1">Mô tả:</span>
                <p className="text-sm line-clamp-3">{aiSuggestions.aiDescription}</p>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="mt-2 h-7"
                  onClick={() => updateFormData({ notes: aiSuggestions.aiDescription })}
                >
                  <Check className="w-3 h-3 mr-1" />
                  Sử dụng mô tả này
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-3">
              💡 Bạn có thể chỉnh sửa các thông tin này ở bước tiếp theo.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

function SuggestionRow({ label, value, onApply }: { 
  label: string; 
  value: string;
  onApply: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-2 rounded bg-background border">
      <div className="flex items-center gap-2 flex-1">
        <span className="text-xs font-medium text-muted-foreground min-w-20">{label}:</span>
        <span className="text-sm">{value}</span>
      </div>
      <Button size="sm" variant="ghost" onClick={onApply} className="h-7 w-7 p-0">
        <Check className="w-3 h-3" />
      </Button>
    </div>
  );
}


