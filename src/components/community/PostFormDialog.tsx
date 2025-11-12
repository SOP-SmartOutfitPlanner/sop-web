"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useScrollLock } from "@/hooks/useScrollLock";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
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
    tags: string[];
    files?: File[];
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
          "prose prose-sm focus:outline-none min-h-[140px] max-w-none text-base p-0 pb-10 text-white placeholder:text-slate-500",
        style: "font-size: 16px;",
      },
    },
    onUpdate: ({ editor }) => {
      setCaption(editor.getText());
    },
  });

  const isEditMode = mode === "edit";

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

    if (!editor || !user) {
      console.error("Missing editor or user");
      return;
    }

    const fullCaption = editor.getText().trim();

    if (!fullCaption) {
      console.warn("Caption is empty");
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
        isSubmitting={isSubmitting}
        onImageUploadClick={handleImageUpload}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
