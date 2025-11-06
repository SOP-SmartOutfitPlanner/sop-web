"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Mention from "@tiptap/extension-mention";
import { useState } from "react";
import { Smile } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface PostEditorProps {
  placeholder?: string;
  onUpdate?: (content: string) => void;
  className?: string;
}

// Popular hashtags for suggestions
const POPULAR_HASHTAGS = [
  { tag: "ASD", posts: "1.7M" },
  { tag: "fashion", posts: "2.5M" },
  { tag: "ootd", posts: "1.8M" },
  { tag: "style", posts: "3.2M" },
  { tag: "streetwear", posts: "890K" },
  { tag: "casual", posts: "650K" },
  { tag: "formal", posts: "420K" },
];

export function PostEditor({ placeholder = "What's on your mind?", onUpdate, className }: PostEditorProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable some features we don't need
        heading: false,
        codeBlock: false,
        bulletList: false,
        orderedList: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Mention.configure({
        HTMLAttributes: {
          class: "mention font-semibold text-primary",
        },
        suggestion: {
          items: ({ query }) => {
            // For hashtags
            return POPULAR_HASHTAGS
              .filter((item) =>
                item.tag.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 5)
              .map((item) => item.tag);
          },
          render: () => {
            let component: HTMLDivElement | null = null;
            let popup: HTMLDivElement | null = null;

            return {
              onStart: (props: { items: string[]; command: (args: { id: string }) => void }) => {
                component = document.createElement("div");
                component.className =
                  "hashtag-suggestions bg-popover border rounded-lg shadow-lg overflow-hidden";

                const suggestions = props.items.map(
                  (item: string) => `
                  <button class="hashtag-item w-full px-4 py-2 text-left hover:bg-muted transition-colors">
                    <div class="font-medium">#${item}</div>
                  </button>
                `
                );

                component.innerHTML = suggestions.join("");

                // Add click handlers
                const buttons = component.querySelectorAll(".hashtag-item");
                buttons.forEach((button: Element, index: number) => {
                  button.addEventListener("click", () => {
                    props.command({ id: props.items[index] });
                  });
                });

                document.body.appendChild(component);

                popup = component;
              },

              onUpdate(props: { items: string[]; command: (args: { id: string }) => void }) {
                const suggestions = props.items.map(
                  (item: string) => `
                  <button class="hashtag-item w-full px-4 py-2 text-left hover:bg-muted transition-colors">
                    <div class="font-medium">#${item}</div>
                  </button>
                `
                );

                if (popup) {
                  popup.innerHTML = suggestions.join("");

                  const buttons = popup.querySelectorAll(".hashtag-item");
                  buttons.forEach((button: Element, index: number) => {
                    button.addEventListener("click", () => {
                      props.command({ id: props.items[index] });
                    });
                  });
                }
              },

              onKeyDown(props: { event: KeyboardEvent }) {
                if (props.event.key === "Escape") {
                  popup?.remove();
                  return true;
                }
                return false;
              },

              onExit() {
                popup?.remove();
              },
            };
          },
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base focus:outline-none min-h-[120px] p-0",
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      onUpdate?.(text);
    },
  });

  const addEmoji = (emojiData: EmojiClickData) => {
    editor?.chain().focus().insertContent(emojiData.emoji).run();
    setShowEmojiPicker(false);
  };

  return (
    <div className={className}>
      <EditorContent editor={editor} />
      
      {/* Emoji Picker Button */}
      <div className="mt-2">
        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Smile className="w-4 h-4" />
              <span>Emoji</span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 border-0 shadow-lg"
            align="start"
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
  );
}
