import { Badge } from "@/components/ui/badge";
import { Hashtag } from "@/lib/api/community-api";

interface PostContentProps {
  caption: string;
  tags: Hashtag[];
}

export function PostContent({ caption, tags }: PostContentProps) {
  return (
    <div className="space-y-3 px-4">
      <p className="text-foreground leading-relaxed font-medium">{caption}</p>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 py-2">
          {tags.map((tag, index) => (
            <div
              key={`${tag.id}-${index}`}
              className="group relative"
            >
              {/* Glow background */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Badge */}
              <Badge
                className="relative text-xs px-3 py-1.5 bg-gradient-to-r from-cyan-400/30 via-blue-400/20 to-indigo-400/30 text-cyan-100 border border-cyan-400/50 hover:border-cyan-400/80 transition-all duration-300 cursor-pointer backdrop-blur-sm group-hover:from-cyan-400/40 group-hover:to-indigo-400/40 group-hover:shadow-lg group-hover:shadow-cyan-500/30"
              >
                #{tag.name}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
