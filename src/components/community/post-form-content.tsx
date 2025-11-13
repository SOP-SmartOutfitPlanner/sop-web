"use client";

import { useState } from "react";
import {
  ImageIcon,
  Smile,
  MapPin,
  Users,
  MoreHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

interface PostFormContentProps {
  user: unknown;
  editor: Editor | null;
  selectedImages: string[];
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onAddEmoji: (emojiClickData: EmojiClickData) => void;
  caption: string;
  onCaptionChange?: (caption: string) => void;
  onSubmit?: (e: React.FormEvent) => void;
}

export function PostFormContent({
  user,
  editor,
  selectedImages,
  onImageUpload,
  onRemoveImage,
  onAddEmoji,
  caption,
  onCaptionChange,
  onSubmit,
}: PostFormContentProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  return (
    <form
      id="post-form-content"
      onSubmit={onSubmit}
      className="px-6 py-5 space-y-5 modal-scrollbar scrollbar-thin scrollbar-track-transparent scrollbar-thumb-cyan-400/20 hover:scrollbar-thumb-cyan-400/35"
    >
      {/* Editor */}
      <div className="relative backdrop-blur-md bg-cyan-950/25 border-2 border-cyan-400/25 rounded-lg p-4 transition-all focus-within:border-cyan-400/45 focus-within:bg-cyan-950/35 focus-within:shadow-lg focus-within:shadow-cyan-500/20">
        <EditorContent editor={editor} />
        <div className="absolute bottom-2 right-2">
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="p-1.5 hover:bg-cyan-400/10 rounded-full transition-colors"
              >
                <Smile className="w-5 h-5 text-cyan-300 hover:text-cyan-200" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 border-0 shadow-lg"
              align="end"
              sideOffset={5}
            >
              <EmojiPicker
                onEmojiClick={onAddEmoji}
                autoFocusSearch={false}
                width={350}
                height={400}
                previewConfig={{ showPreview: false }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Images Gallery - Smart Grid Layout */}
      {selectedImages.length > 0 && (
        <div className="relative rounded-lg overflow-hidden border-2 border-cyan-400/20 bg-cyan-950/30">
          {/* 1 Image: Full width */}
          {selectedImages.length === 1 && (
            <div className="relative w-full h-56">
              <Image
                src={selectedImages[0]}
                alt="Selected image"
                fill
                className="object-cover"
              />
              <Button
                type="button"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0 bg-red-500/80 hover:bg-red-600 text-white border-0 shadow-lg"
                onClick={() => onRemoveImage(0)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* 2 Images: Split horizontally */}
          {selectedImages.length === 2 && (
            <div className="grid grid-cols-2 gap-1 h-48">
              {selectedImages.map((img, index) => (
                <div key={index} className="relative w-full h-full">
                  <Image
                    src={img}
                    alt={`Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 bg-red-500/80 hover:bg-red-600 text-white border-0 shadow-lg"
                    onClick={() => onRemoveImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* 3 Images: 1 large left, 2 stacked right (Facebook style) */}
          {selectedImages.length === 3 && (
            <div className="grid grid-cols-5 gap-1 h-56">
              {/* Large image on left (3/5 width) */}
              <div className="col-span-3 relative w-full h-full">
                <Image
                  src={selectedImages[0]}
                  alt="Image 1"
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0 bg-red-500/80 hover:bg-red-600 text-white border-0 shadow-lg"
                  onClick={() => onRemoveImage(0)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              {/* Two stacked images on right (2/5 width) */}
              <div className="col-span-2 flex flex-col gap-1 h-full">
                {selectedImages.slice(1).map((img, index) => (
                  <div key={index + 1} className="relative w-full flex-1">
                    <Image
                      src={img}
                      alt={`Image ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="absolute top-1 right-1 h-5 w-5 p-0 bg-red-500/80 hover:bg-red-600 text-white border-0 shadow-lg"
                      onClick={() => onRemoveImage(index + 1)}
                    >
                      <X className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4+ Images: 2x2 grid for best layout */}
          {selectedImages.length >= 4 && (
            <div className="grid grid-cols-2 gap-1 h-60">
              {selectedImages.slice(0, 4).map((img, index) => (
                <div key={index} className="relative w-full h-full">
                  <Image
                    src={img}
                    alt={`Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {index === 3 && selectedImages.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        +{selectedImages.length - 4}
                      </span>
                    </div>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    className="absolute top-1.5 right-1.5 h-5 w-5 p-0 bg-red-500/80 hover:bg-red-600 text-white border-0 shadow-lg z-10"
                    onClick={() => onRemoveImage(index)}
                  >
                    <X className="h-2.5 w-2.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </form>
  );
}
