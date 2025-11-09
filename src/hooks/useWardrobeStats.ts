import { useMemo } from 'react';
import { useWardrobeStore } from '@/store/wardrobe-store';
import { WardrobeItem } from '@/types';
import { validateHexColor } from '@/lib/utils/color-mapping';

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

    // Calculate color distribution (supports JSON string in item.color)
    const colorAgg: Record<string, { name: string; hex: string; count: number }> = {};
    items.forEach((item) => {
      // Prefer item.color (API JSON string). Fall back to item.colors (legacy)
      if (item.color) {
        try {
          const parsed = JSON.parse(item.color as unknown as string);
          if (Array.isArray(parsed)) {
            parsed.forEach((c: { name?: string; hex?: string }) => {
              const name = (c?.name || 'Unknown').toLowerCase();
              const hex = validateHexColor(c?.hex || '#808080');
              const key = `${name}|${hex}`;
              if (!colorAgg[key]) colorAgg[key] = { name, hex, count: 0 };
              colorAgg[key].count += 1;
            });
            return;
          }
        } catch {
          // not JSON, fall through
        }
        // Legacy: single name string
        const name = String(item.color).toLowerCase();
        const hex = colorMap[name] || '#6B7280';
        const key = `${name}|${hex}`;
        if (!colorAgg[key]) colorAgg[key] = { name, hex, count: 0 };
        colorAgg[key].count += 1;
      } else if (item.colors && item.colors.length > 0) {
        item.colors.forEach((colorInfo) => {
          const name = colorInfo.name.toLowerCase();
          const hex = colorInfo.hex || '#6B7280';
          const key = `${name}|${hex}`;
          if (!colorAgg[key]) colorAgg[key] = { name, hex, count: 0 };
          colorAgg[key].count += 1;
        });
      }
    });

    const byColor = Object.values(colorAgg)
      .map(({ name, hex, count }) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count,
        color: hex,
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
