import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function SearchFilters({
  searchQuery,
  onSearchChange,
}: SearchFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posts... (Cmd+K)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
}
