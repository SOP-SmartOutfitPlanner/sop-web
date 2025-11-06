import { Badge } from "@/components/ui/badge";
import { Hashtag } from "@/lib/api/community-api";

interface PostContentProps {
  caption: string;
  tags: Hashtag[];
}

export function PostContent({ caption, tags }: PostContentProps) {
  return (
    <div className="space-y-2">
      <p className="text-foreground leading-relaxed">{caption}</p>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="text-xs px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
            >
              #{tag.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
