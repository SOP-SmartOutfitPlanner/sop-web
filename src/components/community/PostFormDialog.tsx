"use client";

import { useState, useEffect } from "react";
import {
  ImageIcon,
  Smile,
  MapPin,
  Users,
  MoreHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth-store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Post } from "@/types/community";
import { cn } from "@/lib/utils";

export type PostFormMode = "create" | "edit";

interface PostFormDialogProps {
  mode: PostFormMode;
  post?: Post; // Required for edit mode
  onSubmit: (data: {
    caption: string;
    tags: string[];
    files?: File[];
  }) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function PostFormDialog({
  mode,
  post,
  onSubmit,
  isSubmitting = false,
}: PostFormDialogProps) {
  const { user } = useAuthStore();
  const [selectedImages, setSelectedImages] = useState<string[]>(
    mode === "edit" && post ? post.images || [] : []
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [caption, setCaption] = useState("");

  const isEditMode = mode === "edit";
  const title = isEditMode ? "Edit post" : "Create Post";
  const buttonText = isSubmitting ? (isEditMode ? "Updating..." : "Posting...") : (isEditMode ? "Update" : "Post");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        bulletList: false,
        orderedList: false,
        horizontalRule: false,
        blockquote: false,
      }),
      Placeholder.configure({
        placeholder: "What's on your mind?",
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm focus:outline-none min-h-[120px] max-w-none text-base p-0 pb-10 text-white placeholder:text-cyan-300/70",
        style: "font-size: 16px;",
      },
    },
    onUpdate: ({ editor }) => {
      setCaption(editor.getText());
    },
  });

  // Initialize editor with post data in edit mode
  useEffect(() => {
    if (isEditMode && editor && post?.caption) {
      // Reconstruct caption with hashtags
      const hashtagsText = post.tags?.map((tag) => `#${tag.name}`).join(" ");
      const fullCaption = hashtagsText
        ? `${post.caption} ${hashtagsText}`
        : post.caption;
      editor.commands.setContent(fullCaption);
      setCaption(editor.getText());
    }
  }, [editor, isEditMode, post]);

  const addEmoji = (emojiData: EmojiClickData) => {
    editor?.chain().focus().insertContent(emojiData.emoji).run();
    setShowEmojiPicker(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    // Store File objects for new uploads
    setSelectedFiles((prev) => [...prev, ...fileArray]);

    // Create preview URLs
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImages((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));

    // In edit mode, only remove from files if it's a newly added image
    if (isEditMode && post) {
      if (index >= post.images.length) {
        setSelectedFiles((prev) =>
          prev.filter((_, i) => i !== index - post.images.length)
        );
      }
    } else {
      // In create mode, simply remove from files
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor || !user) return;

    const fullCaption = editor.getText().trim();
    if (!fullCaption) {
      return;
    }

    // Extract hashtags from caption
    const hashtags =
      fullCaption.match(/#\w+/g)?.map((tag) => tag.slice(1)) || [];

    // Remove hashtags from caption
    const captionWithoutHashtags = fullCaption.replace(/#\w+/g, "").trim();

    await onSubmit({
      caption: captionWithoutHashtags,
      tags: hashtags,
      files: selectedFiles.length > 0 ? selectedFiles : undefined,
    });

    // Reset form for create mode
    if (!isEditMode) {
      editor.commands.setContent("");
      setSelectedImages([]);
      setSelectedFiles([]);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col h-full">
      <DialogHeader className="pb-4 flex-shrink-0 border-b border-cyan-400/15 px-4">
        <DialogTitle className="text-xl font-bold text-center pb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-100 to-blue-100">
          {title}
        </DialogTitle>
      </DialogHeader>

      <form
        id={`${mode}-post-form`}
        onSubmit={handleSubmit}
        className="space-y-5 flex-1 overflow-y-auto px-4"
      >
        {/* User Info */}
        <div className="flex items-center gap-3 pt-2">
          <Avatar className="w-10 h-10 ring-2 ring-cyan-400/30">
            <AvatarImage src={user?.avatar || "/api/placeholder/40/40"} />
            <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white font-semibold">
              {user?.displayName?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-bold text-sm text-white">
              {user?.displayName || "User Name"}
            </div>
            <div className="text-xs text-blue-200/70">Public</div>
          </div>
        </div>

        {/* Editor */}
        <div className="relative backdrop-blur-sm bg-cyan-950/20 border-2 border-cyan-400/20 rounded-lg p-3 transition-all focus-within:border-cyan-400/40 focus-within:bg-cyan-950/30">
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
                  onEmojiClick={addEmoji}
                  autoFocusSearch={false}
                  width={350}
                  height={400}
                  previewConfig={{ showPreview: false }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Images Gallery */}
        {selectedImages.length > 0 && (
          <div className="relative rounded-lg overflow-hidden border-2 border-cyan-400/20 bg-cyan-950/30">
            {selectedImages.length === 1 && (
              <div className="relative w-full h-96">
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
                  onClick={() => removeImage(0)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {selectedImages.length === 2 && (
              <div className="grid grid-cols-2 gap-1">
                {selectedImages.map((img, index) => (
                  <div key={index} className="relative aspect-square">
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
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {selectedImages.length === 3 && (
              <div className="grid grid-cols-2 gap-1">
                <div className="relative row-span-2 aspect-square">
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
                    onClick={() => removeImage(0)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                {selectedImages.slice(1).map((img, index) => (
                  <div key={index + 1} className="relative aspect-square">
                    <Image
                      src={img}
                      alt={`Image ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 bg-red-500/80 hover:bg-red-600 text-white border-0 shadow-lg"
                      onClick={() => removeImage(index + 1)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {selectedImages.length >= 4 && (
              <div className="grid grid-cols-2 gap-1">
                {selectedImages.slice(0, 4).map((img, index) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={img}
                      alt={`Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    {index === 3 && selectedImages.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-2xl font-semibold">
                          +{selectedImages.length - 4}
                        </span>
                      </div>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 bg-red-500/80 hover:bg-red-600 text-white border-0 shadow-lg z-10"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add to post */}
        <div className="border-2 border-cyan-400/15 rounded-lg p-4 bg-cyan-950/15 backdrop-blur-sm">
          <div className="text-sm font-bold mb-3 text-cyan-100">Add to your post</div>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-green-500/10 hover:bg-green-500/20 group-hover:shadow-lg group-hover:shadow-green-500/30 transition-all">
                <ImageIcon className="w-5 h-5 text-green-400 group-hover:text-green-300" />
              </div>
            </label>

            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-500/10 hover:bg-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all cursor-pointer">
              <Users className="w-5 h-5 text-blue-400 hover:text-blue-300" />
            </div>

            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-red-500/10 hover:bg-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all cursor-pointer">
              <MapPin className="w-5 h-5 text-red-400 hover:text-red-300" />
            </div>

            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/30 transition-all cursor-pointer">
              <MoreHorizontal className="w-5 h-5 text-cyan-300 hover:text-cyan-200" />
            </div>
          </div>
        </div>
      </form>

      {/* Submit Button */}
      <div className="flex-shrink-0 py-4 border-t border-cyan-400/15 px-4">
        <Button
          type="submit"
          form={`${mode}-post-form`}
          disabled={!caption.trim() || isSubmitting}
          className={cn(
            "w-full font-bold text-base transition-all duration-300 rounded-lg",
            caption.trim() && !isSubmitting
              ? "bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-600 text-white hover:from-cyan-600 hover:via-blue-600 hover:to-cyan-700 shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60 scale-100 hover:scale-105"
              : "bg-cyan-950/50 border-2 border-cyan-400/25 text-cyan-200/70 cursor-not-allowed"
          )}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}

