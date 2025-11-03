import { Badge } from '@/components/ui/badge';

interface HashtagCloudProps {
  selectedTag?: string;
  onTagClick: (tag: string) => void;
}

export function HashtagCloud({ selectedTag, onTagClick }: HashtagCloudProps) {
  const popularTags = [
    { name: 'casual', count: 234 },
    { name: 'weekend', count: 156 },
    { name: 'cozy', count: 142 },
    { name: 'office', count: 128 },
    { name: 'minimal', count: 98 },
    { name: 'fall', count: 87 },
    { name: 'smart-casual', count: 76 },
    { name: 'comfort', count: 65 }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant={!selectedTag ? "default" : "outline"}
        className="cursor-pointer hover:bg-primary/90 transition-colors"
        onClick={() => onTagClick('')}
      >
        All
      </Badge>
      {popularTags.map((tag) => (
        <Badge
          key={tag.name}
          variant={selectedTag === tag.name ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/90 transition-colors"
          onClick={() => onTagClick(tag.name)}
        >
          #{tag.name} <span className="ml-1 text-xs opacity-70">({tag.count})</span>
        </Badge>
      ))}
    </div>
  );
}

