"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useScrollLock } from "@/hooks/useScrollLock";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { Post } from "@/types/community";
import { PostFormHeader, type PostFormMode } from "./post-form-header";
import { PostFormContent } from "./post-form-content";
import { PostFormFooter } from "./post-form-footer";

interface PostFormDialogProps {
  mode: PostFormMode;
  post?: Post; // Required for edit mode
  isOpen?: boolean; // To lock/unlock body scroll
  onSubmit: (data: {
    caption: string;
    captionHtml: string;
    tags: string[];
    files?: File[];
    existingImageUrls?: string[];
  }) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function PostFormDialog({
  mode,
  post,
  isOpen = true,
  onSubmit,
  isSubmitting = false,
}: PostFormDialogProps) {
  const { user } = useAuthStore();

  // Lock body scroll when dialog is open
  useScrollLock(isOpen);

  const [selectedImages, setSelectedImages] = useState<string[]>(
    mode === "edit" && post ? post.images || [] : []
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");

  const isEditMode = mode === "edit";

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
      Underline,
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm focus:outline-none min-h-[140px] max-w-none text-base p-0 pb-10 text-white placeholder:text-slate-500",
        style: "font-size: 16px;",
      },
    },
    onUpdate: ({ editor }) => {
      setCaption(editor.getText());
    },
  });

  // Initialize editor with post data in edit mode
  useEffect(() => {
    if (isEditMode && editor && post) {
      // Reconstruct caption with hashtags
      const hashtagsText = post.tags?.map((tag) => `#${tag.name}`).join(" ");
      const fullCaption = hashtagsText
        ? `${post.caption} ${hashtagsText}`
        : post.caption;

      editor.commands.setContent(fullCaption);
      setCaption(editor.getText());

      // Initialize selected images
      if (post.images && post.images.length > 0) {
        setSelectedImages(post.images);
      }
    }
  }, [editor, isEditMode, post]);

  const addEmoji = (emojiData: EmojiClickData) => {
    editor?.chain().focus().insertContent(emojiData.emoji).run();
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
        const fileIndex = index - post.images.length;
        setSelectedFiles((prev) => prev.filter((_, i) => i !== fileIndex));
      }
    } else {
      // In create mode, simply remove from files
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editor || !user) {
      console.error("Missing editor or user");
      return;
    }

    const plainTextCaption = editor.getText().trim();
    const captionHtmlRaw = editor.getHTML().trim();

    if (!plainTextCaption) {
      return;
    }

    // Extract hashtags (support Unicode letters/numbers)
    const HASHTAG_REGEX = /#([\p{L}\p{N}_]+)/gu;
    const hashtags =
      Array.from(plainTextCaption.matchAll(HASHTAG_REGEX), (match) => match[1]) ||
      [];

    // Remove hashtags from caption
    const captionWithoutHashtags = plainTextCaption.replace(
      /#([\p{L}\p{N}_]+)/gu,
      ""
    ).trim();
    const captionHtmlWithoutHashtags = captionHtmlRaw.replace(
      /#([\p{L}\p{N}_]+)/gu,
      ""
    ).trim();

    // Calculate remaining original images (images that are still selected but not new files)
    // In edit mode: selectedImages = [original images...] + [new file previews...]
    // We need to find which images are original (URLs) vs new (data URLs from FileReader)
    const originalImages = isEditMode && post ? post.images || [] : [];
    const remainingOriginalImages: string[] = [];
    
    if (isEditMode && post && originalImages.length > 0) {
      selectedImages.forEach((img) => {
        // Original images are URLs (start with http/https), new images are data URLs (start with data:)
        if (
          (img.startsWith("http://") || img.startsWith("https://")) &&
          originalImages.includes(img)
        ) {
          remainingOriginalImages.push(img);
        }
      });
    }

    const submitData = {
      caption: captionWithoutHashtags,
      captionHtml: captionHtmlWithoutHashtags,
      tags: hashtags,
      files: selectedFiles.length > 0 ? selectedFiles : undefined,
      existingImageUrls: isEditMode ? remainingOriginalImages : undefined,
    };

    await onSubmit(submitData);

    // Reset form for create mode
    if (!isEditMode) {
      editor.commands.setContent("");
      setSelectedImages([]);
      setSelectedFiles([]);
    }
  };

  return (
    <div className="w-full h-full max-h-[90vh] flex flex-col gap-0 overflow-hidden z-999">
      {/* Fixed Header */}
      <PostFormHeader
        mode={mode}
        user={
          user
            ? { avatar: user.avatar, displayName: user.displayName }
            : undefined
        }
      />

      {/* Scrollable Content - Only this scrolls */}
      <div className="flex-1 overflow-y-auto modal-scrollbar scrollbar-thin scrollbar-track-transparent scrollbar-thumb-cyan-400/20 hover:scrollbar-thumb-cyan-400/35">
        <PostFormContent
          user={user}
          editor={editor}
          selectedImages={selectedImages}
          onImageUpload={handleImageUpload}
          onRemoveImage={removeImage}
          onAddEmoji={addEmoji}
          caption={caption}
          onCaptionChange={setCaption}
          onSubmit={handleSubmit}
        />
      </div>

      {/* Fixed Footer */}
      <PostFormFooter
        mode={mode}
        caption={caption}
        editor={editor}
        isSubmitting={isSubmitting}
        onImageUploadClick={handleImageUpload}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
