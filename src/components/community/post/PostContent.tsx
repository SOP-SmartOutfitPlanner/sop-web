import { KeyboardEvent, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Hashtag } from "@/lib/api/community-api";
import DOMPurify from "isomorphic-dompurify";

interface PostContentProps {
  caption: string;
  tags: Hashtag[];
  onTagClick?: (tag: Hashtag) => void;
  isModal?: boolean; // When true, uses modal-specific styling
}

const MAX_LENGTH = 200; // Max characters before truncating
const MAX_LENGTH_MODAL = 400; // Higher limit for modal view

export function PostContent({
  caption,
  tags,
  onTagClick,
  isModal = false,
}: PostContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTagKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    tag: Hashtag
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onTagClick?.(tag);
    }
  };

  const sanitizedCaption = useMemo(
    () =>
      DOMPurify.sanitize(caption, {
        ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "span", "p", "br"],
        ALLOWED_ATTR: ["style"],
      }),
    [caption]
  );

  // Lấy text thuần từ HTML để kiểm tra độ dài
  const plainText = useMemo(() => {
    const temp = document.createElement("div");
    temp.innerHTML = sanitizedCaption;
    return temp.textContent || temp.innerText || "";
  }, [sanitizedCaption]);

  const maxLength = isModal ? MAX_LENGTH_MODAL : MAX_LENGTH;
  const isLongContent = plainText.length > maxLength;
  const shouldTruncate = isLongContent && !isExpanded;

  return (
    <div className={`space-y-2`}>
      <div className="space-y-1">
        <div
          className={`text-white font-semibold text-base leading-relaxed prose prose-invert prose-sm max-w-none break-words ${
            shouldTruncate ? "max-h-20 overflow-hidden" : ""
          } ${isModal && shouldTruncate ? "max-h-24" : ""}`}
          dangerouslySetInnerHTML={{ __html: sanitizedCaption }}
        />

        {isLongContent && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors duration-200 mb-1"
          >
            {isExpanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-2">
          {tags.map((tag, index) => (
            <Badge
              key={`${tag.id}-${index}`}
              className="text-xs px-3 py-1 bg-slate-800/25 hover:bg-slate-800/40 border border-slate-400/45 hover:border-cyan-400/50 text-slate-200 hover:text-cyan-300 font-medium transition-all duration-300 cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => onTagClick?.(tag)}
              onKeyDown={(event) => handleTagKeyDown(event, tag)}
            >
              #{tag.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
