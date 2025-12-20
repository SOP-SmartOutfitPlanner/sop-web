"use client";

import { useCallback, useEffect, useState } from "react";
import { Upload, CheckCircle2, AlertCircle, Camera } from "lucide-react";
import NextImage from "next/image";
import { toast } from "sonner";
import { minioAPI } from "@/lib/api/minio-api";
import { userAPI } from "@/lib/api/user-api";

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
  const [isUploading, setIsUploading] = useState(false);
  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(null);

  // Load user.tryOnImageUrl from localStorage on mount
  useEffect(() => {
    if (!humanImagePreview && !savedImageUrl) {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.tryOnImageUrl) {
            setSavedImageUrl(user.tryOnImageUrl);
            // Set the preview to the saved URL
            onImageChange(null, user.tryOnImageUrl);
          }
        }
      } catch (error) {
        console.error("Failed to load tryOnImageUrl from localStorage:", error);
      }
    }
  }, [humanImagePreview, savedImageUrl, onImageChange]);

  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      // Create local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(file, reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to MinIO and save to profile (no validation)
      setIsUploading(true);
      const uploadToast = toast.loading("Uploading your photo...");

      try {
        // Step 1: Upload to MinIO
        const url = await minioAPI.uploadImage(file);

        // Step 2: Update user profile with tryOnImageUrl (skip validation)
        toast.loading("Saving to your profile...", { id: uploadToast });
        await userAPI.updateProfile({ tryOnImageUrl: url });

        // Step 3: Update localStorage
        try {
          const userStr = localStorage.getItem("user");
          if (userStr) {
            const user = JSON.parse(userStr);
            user.tryOnImageUrl = url;
            localStorage.setItem("user", JSON.stringify(user));
          }
        } catch (error) {
          console.error("Failed to update localStorage:", error);
        }

        setSavedImageUrl(url);
        toast.success("Photo uploaded successfully!", {
          id: uploadToast,
        });
      } catch (error) {
        console.error("Failed to upload image:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to upload photo",
          { id: uploadToast }
        );
        // Revert the preview
        onImageChange(null, savedImageUrl || "");
      } finally {
        setIsUploading(false);
      }
    },
    [onImageChange, savedImageUrl]
  );

  const handleRemove = useCallback(() => {
    onImageChange(null, "");
    setSavedImageUrl(null);
  }, [onImageChange]);

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
            disabled={isProcessing || isUploading}
          />
        </label>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white truncate">
              {humanImage || savedImageUrl
                ? "Photo uploaded"
                : "Upload your photo"}
            </p>
            {(humanImage || savedImageUrl) && (
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-white/60 mt-0.5">
            {humanImage || savedImageUrl
              ? "Click to change"
              : "Required for virtual try-on"}
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
        {(humanImage || savedImageUrl) && (
          <CheckCircle2 className="w-4 h-4 text-green-400" />
        )}
      </div>

      {humanImagePreview ? (
        // Uploaded Image Preview with Change/Remove buttons
        <div className="relative w-full h-100 rounded-xl overflow-hidden border-2 border-cyan-400/30 bg-white/5 group">
          <NextImage
            src={humanImagePreview}
            alt="Your photo"
            fill
            className="object-contain"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <label htmlFor="human-image-change" className="cursor-pointer">
              <div className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-colors text-sm font-medium text-white">
                Change Photo
              </div>
            </label>
          </div>
          <input
            id="human-image-change"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            disabled={isProcessing || isUploading}
          />
        </div>
      ) : (
        // Upload Area
        <label
          htmlFor="human-image-upload"
          className="block relative w-full h-100 rounded-xl border-2 border-dashed border-white/30 hover:border-white/50 bg-white/5 hover:bg-white/10 transition-all cursor-pointer overflow-hidden group"
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/60 group-hover:text-white/80 transition-colors">
            <div className="p-4 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
              <Upload className="w-8 h-8" />
            </div>
            <div className="text-center px-4">
              <p className="font-semibold text-base">Click to upload</p>
              <p className="text-sm mt-1">PNG, JPG up to 10MB</p>
            </div>
          </div>
          <input
            id="human-image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            disabled={isProcessing || isUploading}
          />
        </label>
      )}

      {(humanImage || savedImageUrl) && (
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
