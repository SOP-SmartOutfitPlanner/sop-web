import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, Sparkles, Check, X, Crop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { wardrobeAPI } from "@/lib/api/wardrobe-api";
import {
  parseAIResponseToFormData,
  base64ToFile,
} from "@/lib/utils/ai-suggestions-parser";
import { ImageCropper } from "@/components/wardrobe/image-cropper";
import type { WizardFormData, AISuggestions } from "./types";

interface StepPhotoAIProps {
  formData: WizardFormData;
  updateFormData: (updates: Partial<WizardFormData>) => void;
  aiSuggestions: AISuggestions | null;
  setAiSuggestions: (suggestions: AISuggestions | null) => void;
  // New props for external file handling
  onFileSelect?: (file: File) => void;
  onClearFile?: () => void;
  selectedFile?: File | null;
  previewUrl?: string;
}

export function StepPhotoAI({
  formData,
  updateFormData,
  aiSuggestions,
  setAiSuggestions,
  onFileSelect,
  onClearFile,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedFile: _selectedFile,
  previewUrl,
}: StepPhotoAIProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Use external handler if provided (new flow)
    if (onFileSelect) {
      onFileSelect(file);
      return;
    }

    // Otherwise use old flow with cropper
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setTempImage(imageUrl);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImage: string) => {
    updateFormData({ uploadedImageURL: croppedImage });
    setShowCropper(false);
    setTempImage(null);
    toast.success("Image cropped successfully!");
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setTempImage(null);
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
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) handleFileSelect(file);
        break;
      }
    }
  };

  const handleAIAnalyze = async () => {
    // In new flow, this button is not used (analysis is triggered externally)
    if (onFileSelect) return;

    if (!formData.uploadedImageURL) return;

    setIsAnalyzing(true);

    try {
      // Convert base64 to file
      const file = await base64ToFile(formData.uploadedImageURL, "item.jpg");

      // Call AI analysis API
      const response = await wardrobeAPI.getImageSummary(file);

      // Save AI response (wardrobeAPI already returns the data object)
      setAiSuggestions(response);

      toast.success("Analysis successful! ✅");
    } catch (error) {
      console.error("AI analysis failed:", error);
      toast.error("Cannot analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClearImage = () => {
    // Use external handler if provided (new flow)
    if (onClearFile) {
      onClearFile();
      return;
    }

    // Otherwise use old flow
    updateFormData({ uploadedImageURL: "", imageRemBgURL: "" });
    setAiSuggestions(null);
  };

  const applyAllSuggestions = () => {
    if (!aiSuggestions) return;

    const formUpdates = parseAIResponseToFormData(aiSuggestions);
    updateFormData(formUpdates);

    toast.success("All suggestions applied!");
  };

  return (
    <>
      {/* Image Cropper Dialog */}
      {tempImage && (
        <ImageCropper
          image={tempImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          open={showCropper}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dropzone */}
        <div className="space-y-4">
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-border"
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onPaste={handlePaste}
            tabIndex={0}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && handleFileSelect(e.target.files[0])
              }
            />

            {!(previewUrl || formData.uploadedImageURL) ? (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Drag and drop image here</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to select file, or paste from clipboard
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select File
                </Button>
              </div>
            ) : (
              <div className="relative w-full h-64">
                <Image
                  src={previewUrl || formData.uploadedImageURL}
                  alt="Uploaded item"
                  fill
                  className="object-contain rounded-lg"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  {!previewUrl && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setTempImage(formData.uploadedImageURL);
                        setShowCropper(true);
                      }}
                    >
                      <Crop className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleClearImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
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
              <h4 className="font-medium mb-3">Preview</h4>
              <div className="aspect-square rounded-lg overflow-hidden bg-muted relative">
                <Image
                  src={formData.uploadedImageURL}
                  alt="Preview"
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
            </Card>
          )}

          {aiSuggestions && (
            <Card className="p-4 border-emerald-200 bg-emerald-50/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  AI Analysis Result
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={applyAllSuggestions}
                >
                  Apply all
                </Button>
              </div>

              <div className="space-y-2 text-sm">
                {/* Color */}
                <SuggestionRow
                  label="Color"
                  value={aiSuggestions.colors?.map(c => c.name).join(', ') || 'Unknown'}
                  onApply={() => {
                    const formUpdates =
                      parseAIResponseToFormData(aiSuggestions);
                    updateFormData({ colors: formUpdates.colors });
                  }}
                />

                {/* Weather */}
                <SuggestionRow
                  label="Weather"
                  value={aiSuggestions.weatherSuitable}
                  onApply={() => {
                    const formUpdates =
                      parseAIResponseToFormData(aiSuggestions);
                    updateFormData({ seasons: formUpdates.seasons });
                  }}
                />

                {/* Fabric */}
                <SuggestionRow
                  label="Fabric"
                  value={aiSuggestions.fabric}
                  onApply={() =>
                    updateFormData({ fabric: aiSuggestions.fabric })
                  }
                />

                {/* Pattern */}
                <SuggestionRow
                  label="Pattern"
                  value={aiSuggestions.pattern}
                  onApply={() =>
                    updateFormData({ pattern: aiSuggestions.pattern })
                  }
                />

                {/* Condition */}
                <SuggestionRow
                  label="Condition"
                  value={aiSuggestions.condition}
                  onApply={() =>
                    updateFormData({ condition: aiSuggestions.condition })
                  }
                />

                {/* Description */}
                <div className="p-2 rounded bg-background border">
                  <span className="text-xs font-medium text-muted-foreground block mb-1">
                    Description:
                  </span>
                  <p className="text-sm line-clamp-3">
                    {aiSuggestions.aiDescription}
                  </p>
                  {/* <Button 
                  size="sm" 
                  variant="ghost" 
                  className="mt-2 h-7"
                  onClick={() => updateFormData({ notes: aiSuggestions.aiDescription })}
                >
                  <Check className="w-3 h-3 mr-1" />
                  Use this description
                </Button> */}
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-3">
                💡 You can edit this information in the next step.
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function SuggestionRow({
  label,
  value,
  onApply,
}: {
  label: string;
  value: string;
  onApply: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-2 rounded bg-background border">
      <div className="flex items-center gap-2 flex-1">
        <span className="text-xs font-medium text-muted-foreground min-w-20">
          {label}:
        </span>
        <span className="text-sm">{value}</span>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={onApply}
        className="h-7 w-7 p-0"
      >
        <Check className="w-3 h-3" />
      </Button>
    </div>
  );
}
