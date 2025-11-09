"use client";

import { useState, useRef } from "react";
import { Upload, X, Edit2, Plus } from "lucide-react";
import { Image as AntImage } from "antd";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TuiImageEditor } from "./TuiImageEditor";

const MAX_IMAGES = 10;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

interface StepPhotoAIProps {
  onFilesSelect?: (files: File[]) => void;
  onClearFiles?: () => void;
}

export function StepPhotoAI({
  onFilesSelect,
  onClearFiles,
}: StepPhotoAIProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [editingImage, setEditingImage] = useState<{ url: string; index: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) {
      return "File must be an image";
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File size must be less than ${MAX_FILE_SIZE_MB}MB`;
    }
    return null;
  };

  // Handle file selection
  const handleFileSelect = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const currentCount = imageFiles.length;

    if (currentCount + fileArray.length > MAX_IMAGES) {
      toast.error(`You can only upload up to ${MAX_IMAGES} images`);
      return;
    }

    const validFiles: ImageFile[] = [];
    const errors: string[] = [];

    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push({
          file,
          preview: URL.createObjectURL(file),
          id: `${Date.now()}-${Math.random()}`,
        });
      }
    });

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
    }

    if (validFiles.length > 0) {
      const newImageFiles = [...imageFiles, ...validFiles];
      setImageFiles(newImageFiles);

      // Notify parent component
      if (onFilesSelect) {
        onFilesSelect(newImageFiles.map((img) => img.file));
      }

      toast.success(`Added ${validFiles.length} image${validFiles.length > 1 ? 's' : ''}`);
    }
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const files: File[] = [];

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }

    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    const newImageFiles = imageFiles.filter((_, i) => i !== index);

    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imageFiles[index].preview);

    setImageFiles(newImageFiles);

    if (onFilesSelect) {
      onFilesSelect(newImageFiles.map((img) => img.file));
    }

    toast.success("Image removed");
  };

  // Clear all images
  const handleClearAll = () => {
    imageFiles.forEach((img) => URL.revokeObjectURL(img.preview));
    setImageFiles([]);

    if (onClearFiles) {
      onClearFiles();
    }

    toast.success("All images cleared");
  };

  // Handle edit complete
  const handleEditComplete = (editedFile: File, index: number) => {
    const newImageFiles = [...imageFiles];

    // Revoke old preview URL
    URL.revokeObjectURL(newImageFiles[index].preview);

    // Update with new file
    newImageFiles[index] = {
      file: editedFile,
      preview: URL.createObjectURL(editedFile),
      id: `${Date.now()}-${Math.random()}`,
    };

    setImageFiles(newImageFiles);

    if (onFilesSelect) {
      onFilesSelect(newImageFiles.map((img) => img.file));
    }

    setEditingImage(null);
    toast.success("Image updated");
  };

  const canAddMore = imageFiles.length < MAX_IMAGES;

  return (
    <>
      {/* TUI Image Editor */}
      {editingImage && (
        <TuiImageEditor
          open={true}
          imageUrl={editingImage.url}
          onComplete={(file) => handleEditComplete(file, editingImage.index)}
          onCancel={() => setEditingImage(null)}
        />
      )}

      <div
        className="h-full flex flex-col"
        onPaste={handlePaste}
        tabIndex={0}
      >
        {/* Image Grid - At Top */}
        {imageFiles.length > 0 ? (
          <>
            {/* Header - Fixed height */}
            <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
              <h3 className="font-bricolage font-bold text-sm text-white">
                Selected ({imageFiles.length}/{MAX_IMAGES})
              </h3>
              <button
                onClick={handleClearAll}
                className="px-3 py-2 bg-gradient-to-r from-blue-500/60 to-cyan-500/60 hover:from-blue-600/70 hover:to-cyan-600/70 backdrop-blur-sm text-white rounded-lg font-bricolage font-semibold shadow-lg transition-all duration-200 border border-blue-400/50 text-xs h-8 flex items-center"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Clear
              </button>
            </div>

            {/* Image Grid - Fixed height to fit in dialog */}
            <div className="flex-shrink-0 mb-2">
              <div className="grid grid-cols-5 gap-2">
                <AntImage.PreviewGroup>
                  {imageFiles.map((imageFile, index) => (
                    <div
                      key={imageFile.id}
                      className="relative group aspect-square rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200"
                    >
                      <AntImage
                        src={imageFile.preview}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        preview={{
                          mask: (
                            <div className="flex items-center justify-center">
                              <span className="text-white font-bricolage font-medium text-xs">
                                Preview
                              </span>
                            </div>
                          ),
                        }}
                      />

                      {/* Edit and Remove buttons */}
                      <div className="absolute top-0.5 right-0.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingImage({ url: imageFile.preview, index });
                          }}
                          className="w-7 h-7 rounded bg-blue-500 hover:bg-blue-600 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                          title="Edit image"
                        >
                          <Edit2 className="w-3 h-3 text-white" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(index);
                          }}
                          className="w-7 h-7 rounded bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                          title="Remove image"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>

                      {/* File info overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <p className="text-[8px] text-white font-bricolage font-medium truncate">
                          {imageFile.file.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </AntImage.PreviewGroup>
              </div>
            </div>

            {/* Add More Button - Fixed at bottom */}
            {canAddMore && (
              <div className="flex justify-center flex-shrink-0 mt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileSelect(e.target.files);
                    }
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500/60 to-cyan-500/60 hover:from-blue-600/70 hover:to-cyan-600/70 backdrop-blur-sm text-white rounded-lg font-bricolage font-semibold shadow-lg transition-all duration-200 border border-blue-400/50 flex items-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add More Images ({imageFiles.length}/{MAX_IMAGES})
                </button>
              </div>
            )}
          </>
        ) : (
          /* Upload Area - Takes full height when no images */
          <div
            className={cn(
              "relative border-2 border-dashed rounded-2xl text-center transition-all duration-300 h-full flex items-center justify-center",
              isDragging
                ? "border-blue-400 bg-blue-50/50 scale-[1.02]"
                : "border-gray-300 bg-white/70 hover:border-gray-400",
              "backdrop-blur-sm shadow-lg"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelect(e.target.files);
                }
              }}
            />

            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Upload className="w-8 h-8 text-white" />
              </div>

              <div>
                <p className="font-bricolage font-bold text-base text-gray-800">
                  Drag and drop images here
                </p>
                <p className="font-bricolage text-xs text-gray-600 mt-1">
                  or click the button below to select files
                </p>
                <p className="font-bricolage text-[10px] text-gray-500 mt-1">
                  Max {MAX_IMAGES} images, {MAX_FILE_SIZE_MB}MB each • PNG, JPG, WEBP
                </p>
              </div>

              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bricolage font-semibold shadow-md"
                size="default"
              >
                <Upload className="w-4 h-4 mr-2" />
                Select Images
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
