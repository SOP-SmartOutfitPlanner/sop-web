"use client";

import { useCallback } from "react";
import { Upload, CheckCircle2, AlertCircle, Camera } from "lucide-react";
import NextImage from "next/image";
import { toast } from "sonner";

interface HumanImageUploadProps {
  humanImage: File | null;
  humanImagePreview: string;
  isProcessing: boolean;
  onImageChange: (file: File | null, preview: string) => void;
  compact?: boolean;
}

export function HumanImageUpload({
  humanImage,
  humanImagePreview,
  isProcessing,
  onImageChange,
  compact = false,
}: HumanImageUploadProps) {
  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size must be less than 10MB");
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [onImageChange]
  );

  // Compact mode for side panel layout
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
        <label
          htmlFor="human-image-upload-compact"
          className="relative flex-shrink-0 w-14 h-14 rounded-lg border-2 border-dashed border-white/30 hover:border-white/50 bg-white/5 hover:bg-white/10 transition-all cursor-pointer overflow-hidden group"
        >
          {humanImagePreview ? (
            <NextImage
              src={humanImagePreview}
              alt="Your photo"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/60 group-hover:text-white/80 transition-colors">
              <Camera className="w-6 h-6" />
            </div>
          )}
          <input
            id="human-image-upload-compact"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            disabled={isProcessing}
          />
        </label>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white truncate">
              {humanImage ? "Photo uploaded" : "Upload your photo"}
            </p>
            {humanImage && <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />}
          </div>
          <p className="text-xs text-white/60 mt-0.5">
            {humanImage ? "Click to change" : "Required for virtual try-on"}
          </p>
        </div>
      </div>
    );
  }

  // Full mode (original)
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white font-bricolage">
          1. Upload Your Photo
        </h3>
        {humanImage && <CheckCircle2 className="w-4 h-4 text-green-400" />}
      </div>

      <label
        htmlFor="human-image-upload"
        className="block relative w-full h-100 rounded-xl border-2 border-dashed border-white/30 hover:border-white/50 bg-white/5 hover:bg-white/10 transition-all cursor-pointer overflow-hidden group"
      >
        {humanImagePreview ? (
          <NextImage
            src={humanImagePreview}
            alt="Your photo"
            fill
            className="object-contain"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/60 group-hover:text-white/80 transition-colors">
            <div className="p-4 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
              <Upload className="w-8 h-8" />
            </div>
            <div className="text-center px-4">
              <p className="font-semibold text-base">Click to upload</p>
              <p className="text-sm mt-1">PNG, JPG up to 10MB</p>
            </div>
          </div>
        )}
        <input
          id="human-image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          disabled={isProcessing}
        />
      </label>

      {humanImage && (
        <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-300">
            For best results, use a clear full-body photo with good lighting
          </p>
        </div>
      )}
    </div>
  );
}
