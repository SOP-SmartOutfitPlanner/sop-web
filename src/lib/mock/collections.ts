import { Collection } from "@/types/wardrobe";
import { WardrobeItem } from "@/types";

export const baseCollections: Omit<Collection, "count">[] = [
  {
    id: "all",
    name: "All Items",
    color: "#6B7280",
  },
  {
    id: "work",
    name: "Work",
    color: "#1F2937",
  },
  {
    id: "casual", 
    name: "Casual",
    color: "#3B82F6",
  },
  {
    id: "formal",
    name: "Formal",
    color: "#8B5CF6",
  },
  {
    id: "sport",
    name: "Sport",
    color: "#10B981",
  },
  {
    id: "vacation",
    name: "Vacation",
    color: "#F59E0B",
  },
];

export function getCollectionsWithCounts(wardrobeItems: WardrobeItem[]): Collection[] {
  const totalItems = wardrobeItems.length;
  
  return baseCollections.map((collection) => {
    let count = 0;
    
    if (collection.id === "all") {
      count = totalItems;
    } else {
      // Count items that have the collection in their occasions/tags
      count = wardrobeItems.filter((item) => {
        // Check occasions - could be string array or object array
        const hasOccasion = item.occasions?.some(occasion =>
          typeof occasion === 'string'
            ? occasion === collection.id
            : occasion.name?.toLowerCase() === collection.id.toLowerCase()
        );
        const hasTag = item.tags?.includes(collection.id);
        return hasOccasion || hasTag;
      }).length;
    }
    
    return {
      ...collection,
      count,
    };
  });
}

// Helper function to get unique colors from wardrobe items
export function getUniqueColorsFromItems(wardrobeItems: WardrobeItem[]): { value: string; label: string }[] {
  const colorSet = new Set<string>();
  
  wardrobeItems.forEach(item => {
    if (item.colors && Array.isArray(item.colors)) {
      item.colors.forEach(color => colorSet.add(color.name));
    }
  });
  
  const colorLabels: Record<string, string> = {
    "#FFFFFF": "White",
    "#000000": "Black", 
    "#1B365D": "Navy",
    "#F5DEB3": "Beige",
    "#8B4513": "Brown",
    "#808080": "Grey",
    "#DC143C": "Red",
    "#228B22": "Green",
    "#FFFF00": "Yellow",
    "#FFA500": "Orange",
    "#800080": "Purple",
    "#FF69B4": "Pink",
    "#90EE90": "Light Green",
    "#FFFFE0": "Light Yellow",
  };
  
  return Array.from(colorSet).map(color => ({
    value: color,
    label: colorLabels[color] || color
  }));
}
