import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, TrendingUp, UserCheck } from 'lucide-react';

interface CommunityTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function CommunityTabs({ activeTab, onTabChange }: CommunityTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-3">
        <TabsTrigger value="latest" className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Latest
        </TabsTrigger>
        <TabsTrigger value="trending" className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Trending
        </TabsTrigger>
        <TabsTrigger value="following" className="flex items-center gap-2">
          <UserCheck className="w-4 h-4" />
          Following
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

