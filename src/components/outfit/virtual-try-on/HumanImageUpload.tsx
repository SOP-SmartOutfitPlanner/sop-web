"use client";

import { useCallback } from "react";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
import NextImage from "next/image";
import { toast } from "sonner";

interface HumanImageUploadProps {
  humanImage: File | null;
  humanImagePreview: string;
  isProcessing: boolean;
  onImageChange: (file: File | null, preview: string) => void;
}

export function HumanImageUpload({
  humanImage,
  humanImagePreview,
  isProcessing,
  onImageChange,
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
