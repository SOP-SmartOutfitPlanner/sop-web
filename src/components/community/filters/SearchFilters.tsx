import { Search, X, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SearchFiltersProps {
  searchQuery: string;
  selectedTag: string;
  timeFilter: string;
  onSearchChange: (query: string) => void;
  onTagChange: (tag: string) => void;
  onTimeFilterChange: (filter: string) => void;
  onClearAll: () => void;
}

export function SearchFilters({
  searchQuery,
  selectedTag,
  timeFilter,
  onSearchChange,
  onTagChange,
  onTimeFilterChange,
  onClearAll
}: SearchFiltersProps) {
  const hasActiveFilters = searchQuery || selectedTag || timeFilter !== 'all';

  return (
    <div className="space-y-4">
      {/* Search and Time Filter */}
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
        <Select value={timeFilter} onValueChange={onTimeFilterChange}>
          <SelectTrigger className="w-48">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Time filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="week">This week</SelectItem>
            <SelectItem value="month">This month</SelectItem>
            <SelectItem value="today">Today</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: &quot;{searchQuery}&quot;
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => onSearchChange('')}
              />
            </Badge>
          )}
          
          {selectedTag && (
            <Badge variant="secondary" className="gap-1">
              #{selectedTag}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => onTagChange('')}
              />
            </Badge>
          )}
          
          {timeFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {timeFilter === 'week' ? 'This week' : timeFilter === 'month' ? 'This month' : 'Today'}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => onTimeFilterChange('all')}
              />
            </Badge>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearAll}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

