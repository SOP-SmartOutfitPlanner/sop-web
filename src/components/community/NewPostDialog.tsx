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
    image?: string;
  }) => void;
}

export function NewPostDialog({ onCreatePost }: NewPostDialogProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // Preview URL (base64)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null); // Filename for API
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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
  });

  const addEmoji = (emojiData: EmojiClickData) => {
    editor?.chain().focus().insertContent(emojiData.emoji).run();
    setShowEmojiPicker(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;

    const caption = editor.getText().trim();
    if (!caption) return;

    const hashtags = caption.match(/#\w+/g)?.map((tag) => tag.slice(1)) || [];

    onCreatePost({
      caption,
      tags: hashtags,
      image: selectedFileName || undefined, // Send filename instead of base64
    });

    editor.commands.setContent("");
    setSelectedImage(null);
    setSelectedFileName(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Save filename for API
      setSelectedFileName(file.name);
      
      // Create preview for UI
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const caption = editor?.getText() || "";

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
            <AvatarImage src="/api/placeholder/40/40" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-sm">User Name</div>
            <div className="text-xs text-muted-foreground">Public</div>
          </div>
        </div>

        {/* TipTap Editor - No border, clean like Facebook */}
        <div className="relative">
          <EditorContent editor={editor} />

          {/* Emoji Picker - Below textarea like Facebook */}
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

        {selectedImage && (
          <div className="relative rounded-lg overflow-hidden border bg-muted">
            <div className="relative w-full h-96">
              <Image
                src={selectedImage}
                alt="Selected"
                fill
                className="object-cover"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0 bg-background/80 hover:bg-background border shadow-sm"
              onClick={() => {
                setSelectedImage(null);
                setSelectedFileName(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="absolute top-2 left-2 bg-background/80 hover:bg-background border shadow-sm"
            >
              ✏️ Edit all
            </Button>
          </div>
        )}

        <div className="border rounded-lg p-3">
          <div className="text-sm font-medium mb-2">Add to your post</div>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
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
