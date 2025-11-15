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
          <div className="absolute inset-0 bg-slate-950/20 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />

          {/* Input container */}
          <div className="relative backdrop-blur-xl bg-white/90 border border-slate-700/30 group-focus-within:border-slate-700/60 rounded-2xl transition-all duration-300 shadow-lg shadow-slate-900/20 group-focus-within:shadow-slate-900/40">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors duration-300" />
            <Input
              placeholder="Search posts... (Cmd+K)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 bg-transparent border-0 text-black placeholder:text-slate-500 focus:outline-none focus:ring-0 font-medium"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
