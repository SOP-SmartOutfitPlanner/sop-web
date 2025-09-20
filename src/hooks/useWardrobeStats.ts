import { useMemo } from 'react';
import { useWardrobeStore } from '@/store/wardrobe-store';
import { WardrobeItem } from '@/types';

interface WardrobeStats {
  counts: {
    total: number;
    top: number;
    bottom: number;
    shoes: number;
    outer: number;
    accessory: number;
  };
  byColor: Array<{
    name: string;
    count: number;
    color: string;
  }>;
  mostWorn: WardrobeItem[];
  neverWorn: WardrobeItem[];
  loading: boolean;
}

const colorMap: Record<string, string> = {
  red: '#EF4444',
  blue: '#3B82F6',
  green: '#10B981',
  yellow: '#F59E0B',
  orange: '#F97316',
  purple: '#8B5CF6',
  pink: '#EC4899',
  black: '#1F2937',
  white: '#F9FAFB',
  gray: '#6B7280',
  grey: '#6B7280',
  brown: '#A3A3A3',
  multicolor: '#FBBF24',
};

export function useWardrobeStats(): WardrobeStats {
  const { items, isLoading } = useWardrobeStore();

  return useMemo(() => {
    // Calculate type counts
    const counts = items.reduce(
      (acc, item) => {
        acc.total++;
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      },
      {
        total: 0,
        top: 0,
        bottom: 0,
        shoes: 0,
        outer: 0,
        accessory: 0,
      }
    );

    // Calculate color distribution
    const colorCounts: Record<string, number> = {};
    items.forEach(item => {
      if (item.colors && item.colors.length > 0) {
        item.colors.forEach(color => {
          const colorName = color.toLowerCase();
          colorCounts[colorName] = (colorCounts[colorName] || 0) + 1;
        });
      } else if (item.color) {
        const colorName = item.color.toLowerCase();
        colorCounts[colorName] = (colorCounts[colorName] || 0) + 1;
      }
    });

    const byColor = Object.entries(colorCounts)
      .map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count,
        color: colorMap[name] || '#6B7280',
      }))
      .sort((a, b) => b.count - a.count);

    // Most worn items (sorted by timesWorn)
    const mostWorn = [...items]
      .filter(item => (item.timesWorn || 0) > 0)
      .sort((a, b) => (b.timesWorn || 0) - (a.timesWorn || 0));

    // Never worn or rarely worn items
    const neverWorn = [...items]
      .filter(item => (item.timesWorn || 0) <= 2)
      .sort((a, b) => (a.timesWorn || 0) - (b.timesWorn || 0));

    return {
      counts,
      byColor,
      mostWorn,
      neverWorn,
      loading: isLoading,
    };
  }, [items, isLoading]);
}
