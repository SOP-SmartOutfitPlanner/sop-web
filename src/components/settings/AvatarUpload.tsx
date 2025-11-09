"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import Image from "next/image";

export function AvatarUpload() {
  const { user } = useAuthStore();
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview) return;

    try {
      setIsUploading(true);
      // TODO: Upload to API
      // const formData = new FormData();
      // formData.append('avatar', file);
      // await userAPI.uploadAvatar(formData);
      toast.success("Avatar uploaded successfully");
      setPreview(null);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Avatar Preview */}
      <div className="flex items-center gap-6">
        <Avatar className="w-20 h-20 ring-2 ring-cyan-400/30">
          <AvatarImage src={preview || user?.avatar} alt={user?.displayName} />
          <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-cyan-400 to-blue-500 text-white">
            {user?.displayName?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-white">{user?.displayName}</p>
          <p className="text-xs text-blue-200/60">
            JPG, PNG or GIF (Max 5MB)
          </p>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Actions */}
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700 shadow-lg shadow-cyan-500/30 font-semibold"
        >
          <Upload className="w-4 h-4 mr-2" />
          Change Photo
        </Button>

        {preview && (
          <>
            <Button 
              type="button" 
              onClick={handleUpload} 
              disabled={isUploading}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700 shadow-lg shadow-cyan-500/30 font-semibold"
            >
              {isUploading ? "Uploading..." : "Confirm"}
            </Button>
            <Button
              type="button"
              onClick={handleRemove}
              disabled={isUploading}
              className="border-2 border-cyan-400/30 text-cyan-200 hover:bg-cyan-400/10 hover:border-cyan-400/60 font-semibold"
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {preview && (
        <div className="mt-4 p-4 backdrop-blur-md bg-cyan-950/30 border border-cyan-400/20 rounded-lg">
          <p className="text-sm font-semibold text-white mb-2">Preview</p>
          <Image
            src={preview}
            alt="Preview"
            width={128}
            height={128}
            className="w-32 h-32 rounded-lg object-cover ring-2 ring-cyan-400/30"
          />
        </div>
      )}
    </div>
  );
}
