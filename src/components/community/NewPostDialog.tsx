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

interface NewPostDialogProps {
  onCreatePost: (data: {
    caption: string;
    tags: string[];
    files?: File[]; // Changed to File[] instead of string[]
  }) => void;
}

export function NewPostDialog({ onCreatePost }: NewPostDialogProps) {
  const { user } = useAuthStore();
  const [selectedImages, setSelectedImages] = useState<string[]>([]); // For preview (base64)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // Store actual File objects
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [caption, setCaption] = useState(""); // Track caption for button state

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
          "prose prose-sm focus:outline-none min-h-[120px] max-w-none text-base p-0 pb-10",
        style: "font-size: 16px;",
      },
    },
    onUpdate: ({ editor }) => {
      // Update caption state when editor content changes
      setCaption(editor.getText());
    },
  });

  const addEmoji = (emojiData: EmojiClickData) => {
    editor?.chain().focus().insertContent(emojiData.emoji).run();
    setShowEmojiPicker(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;

    const fullCaption = editor.getText().trim();
    if (!fullCaption) return;

    // Extract hashtags from caption
    const hashtags =
      fullCaption.match(/#\w+/g)?.map((tag) => tag.slice(1)) || [];

    // Remove hashtags from caption (keep only text)
    const captionWithoutHashtags = fullCaption.replace(/#\w+/g, "").trim();

    onCreatePost({
      caption: captionWithoutHashtags, // Send caption without hashtags
      tags: hashtags, // Send hashtags separately
      files: selectedFiles.length > 0 ? selectedFiles : undefined,
    });

    editor.commands.setContent("");
    setSelectedImages([]);
    setSelectedFiles([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    // Store File objects
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
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <DialogHeader className="pb-4">
        <DialogTitle className="text-lg font-semibold text-center border-b pb-3">
          Create Post
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.avatar || "/api/placeholder/40/40"} />
            <AvatarFallback>
              {user?.displayName?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-sm">
              {user?.displayName || "User Name"}
            </div>
            <div className="text-xs text-muted-foreground">Public</div>
          </div>
        </div>

        <div className="relative">
          <EditorContent editor={editor} />
          <div className="absolute bottom-2 right-2">
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="p-1.5 hover:bg-muted rounded-full transition-colors"
                >
                  <Smile className="w-5 h-5 text-muted-foreground hover:text-foreground" />
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

        {selectedImages.length > 0 && (
          <div className="relative rounded-lg overflow-hidden border bg-muted">
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
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0 bg-background/80 hover:bg-background border shadow-sm"
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
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 bg-background/80 hover:bg-background border shadow-sm"
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
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 bg-background/80 hover:bg-background border shadow-sm"
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
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 bg-background/80 hover:bg-background border shadow-sm"
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
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 bg-background/80 hover:bg-background border shadow-sm z-10"
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

        <div className="border rounded-lg p-3">
          <div className="text-sm font-medium mb-2">Add to your post</div>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
              <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors">
                <ImageIcon className="w-5 h-5 text-green-500" />
              </div>
            </label>

            <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors cursor-pointer">
              <Users className="w-5 h-5 text-blue-500" />
            </div>

            <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors cursor-pointer">
              <MapPin className="w-5 h-5 text-red-500" />
            </div>

            <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors cursor-pointer">
              <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={!caption.trim()}>
          Post
        </Button>
      </form>
    </div>
  );
}
