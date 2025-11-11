import { Badge } from "@/components/ui/badge";
import { Hashtag } from "@/lib/api/community-api";

interface PostContentProps {
  caption: string;
  tags: Hashtag[];
}

export function PostContent({ caption, tags }: PostContentProps) {
  return (
    <div className="space-y-2 px-4">
      <p className="text-white font-semibold text-base leading-relaxed">
        {caption}
      </p>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-2">
          {tags.map((tag, index) => (
            <Badge
              key={`${tag.id}-${index}`}
              className="text-xs px-3 py-1 bg-slate-800/25 hover:bg-slate-800/40 border border-slate-400/45 hover:border-cyan-400/50 text-slate-200 hover:text-cyan-300 font-medium transition-all duration-300 cursor-pointer"
            >
              #{tag.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
