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
        <div className="relative flex-1 group">
          {/* Glass background */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-300/10 via-blue-300/5 to-indigo-300/10 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
          
          {/* Input container */}
          <div className="relative backdrop-blur-md bg-gradient-to-r from-cyan-400/15 via-blue-400/10 to-indigo-400/15 border-2 border-cyan-400/25 group-focus-within:border-cyan-400/50 rounded-2xl transition-all duration-300 shadow-lg shadow-cyan-500/10 group-focus-within:shadow-cyan-500/30">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-300 transition-colors duration-300" />
            <Input
              placeholder="Search posts... (Cmd+K)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 bg-transparent border-0 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-0 font-medium"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
