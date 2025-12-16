"use client";

import { useState, useCallback, useEffect } from "react";
import { Upload, X, User, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { minioAPI } from "@/lib/api/minio-api";
import { userAPI } from "@/lib/api/user-api";

interface BodyImageUploadProps {
  onImageUrlChange: (url: string | null) => void;
  imageUrl: string | null;
  className?: string;
}

export function BodyImageUpload({
  onImageUrlChange,
  imageUrl,
  className = "",
}: BodyImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  // Load user.tryOnImageUrl from localStorage on mount
  useEffect(() => {
    if (!imageUrl) {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.tryOnImageUrl) {
            onImageUrlChange(user.tryOnImageUrl);
          }
        }
      } catch (error) {
        console.error("Failed to load tryOnImageUrl from localStorage:", error);
      }
    }
  }, [imageUrl, onImageUrlChange]);

  const handleFileSelect = useCallback(
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
        setLocalPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to MinIO
      setIsUploading(true);
      const uploadToast = toast.loading("Uploading your photo...");

      try {
        // Step 1: Upload to MinIO
        const url = await minioAPI.uploadImage(file);
        
        // Step 2: Validate full body image
        toast.loading("Validating your photo...", { id: uploadToast });
        const validationResponse = await userAPI.validateFullBodyImage(url);
        
        if (validationResponse.statusCode === 200 && validationResponse.data?.isValid) {
          // Step 3: Update user profile with tryOnImageUrl
          toast.loading("Saving to your profile...", { id: uploadToast });
          await userAPI.updateProfile({ tryOnImageUrl: url });
          
          // Step 4: Update localStorage
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
          
          onImageUrlChange(url);
          toast.success("Photo uploaded and validated successfully!", { id: uploadToast });
        } else {
          // Validation failed - show error message
          const errorMessage = validationResponse.data?.message || "Image validation failed";
          toast.error(errorMessage, { id: uploadToast });
          setLocalPreview(null);
        }
      } catch (error) {
        console.error("Failed to upload/validate image:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to upload photo",
          { id: uploadToast }
        );
        setLocalPreview(null);
      } finally {
        setIsUploading(false);
      }
    },
    [onImageUrlChange]
  );

  const handleRemove = useCallback(() => {
    onImageUrlChange(null);
    setLocalPreview(null);
  }, [onImageUrlChange]);

  const displayImage = imageUrl || localPreview;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-cyan-300" />
          <h3 className="text-base font-semibold text-white font-bricolage">
            Your Full Body Photo
          </h3>
          {imageUrl && <CheckCircle2 className="w-4 h-4 text-green-400" />}
        </div>
      </div>

      {displayImage ? (
        // Uploaded Image Preview
        <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-cyan-400/30 bg-white/5 group">
          <Image
            src={displayImage}
            alt="Your full body photo"
            fill
            className="object-contain"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <label htmlFor="body-image-change" className="cursor-pointer">
              <div className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-colors text-sm font-medium text-white">
                Change Photo
              </div>
            </label>
            <button
              onClick={handleRemove}
              disabled={isUploading}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove photo"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <input
            id="body-image-change"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      ) : (
        // Upload Area
        <label
          htmlFor="body-image-upload"
          className="block relative w-full h-64 rounded-xl border-2 border-dashed border-cyan-400/30 hover:border-cyan-400/50 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 hover:from-cyan-500/10 hover:to-blue-500/10 transition-all cursor-pointer overflow-hidden group"
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/60 group-hover:text-white/80 transition-colors">
            <div className="p-4 rounded-full bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors border border-cyan-400/30">
              <Upload className="w-8 h-8 text-cyan-300" />
            </div>
            <div className="text-center px-4">
              <p className="font-semibold text-base text-white">
                Click to upload your photo
              </p>
              <p className="text-sm mt-1 text-white/60">PNG, JPG up to 10MB</p>
            </div>
          </div>
          <input
            id="body-image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      )}

      {/* Info Message */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
        <AlertCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-cyan-300">
          For best results, use a clear full-body photo with good lighting. This
          photo will be used for all virtual try-ons.
        </p>
      </div>

      {isUploading && (
        <div className="flex items-center justify-center gap-2 text-cyan-300">
          <div className="w-4 h-4 border-2 border-cyan-300/30 border-t-cyan-300 rounded-full animate-spin" />
          <span className="text-sm">Uploading...</span>
        </div>
      )}
    </div>
  );
}
