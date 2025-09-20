import { WardrobeItem } from "@/types";

export const mockWardrobeItems: WardrobeItem[] = [
  {
    id: "1",
    name: "Classic White Button-Down Shirt",
    type: "top",
    imageUrl:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop",
    brand: "Uniqlo",
    description: "A versatile white button-down shirt perfect for any occasion",
    colors: ["#FFFFFF"],
    seasons: ["spring", "summer", "fall", "winter"],
    occasions: ["formal", "casual", "work"],
    status: "ok",
    timesWorn: 15,
    lastWorn: "2024-01-14",
    tags: ["formal", "casual", "office", "versatile"],
    userId: "1",
    createdAt: "2024-01-15T00:00:00.000Z",
    updatedAt: "2024-01-15T00:00:00.000Z",
    // Backward compatibility
    category: "Shirts",
    color: "White",
    season: "all",
  },
  {
    id: "2",
    name: "Dark Wash Denim Jeans",
    type: "bottom",
    imageUrl:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
    brand: "Levi's",
    description: "Classic straight-leg jeans in dark wash",
    colors: ["#1B365D"],
    seasons: ["spring", "summer", "fall", "winter"],
    occasions: ["casual"],
    status: "ok",
    timesWorn: 25,
    lastWorn: "2024-01-13",
    tags: ["casual", "denim", "everyday"],
    userId: "1",
    createdAt: "2024-01-16T00:00:00.000Z",
    updatedAt: "2024-01-16T00:00:00.000Z",
    // Backward compatibility
    category: "Pants",
    color: "Blue",
    season: "all",
  },
  {
    id: "3",
    name: "Black Wool Blazer",
    type: "outer",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    brand: "Zara",
    description: "Elegant black wool blazer for formal occasions",
    colors: ["#000000"],
    seasons: ["fall", "winter"],
    occasions: ["formal", "work"],
    status: "ok",
    timesWorn: 8,
    lastWorn: "2024-01-10",
    tags: ["formal", "business", "elegant"],
    userId: "1",
    createdAt: "2024-01-17T00:00:00.000Z",
    updatedAt: "2024-01-17T00:00:00.000Z",
    // Backward compatibility
    category: "Jackets",
    color: "Black",
    season: "fall",
  },
  {
    id: "4",
    name: "Summer Floral Dress",
    type: "top",
    imageUrl:
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop",
    brand: "H&M",
    description: "Light and airy floral dress perfect for summer",
    colors: ["#FF69B4", "#90EE90", "#FFFFE0"],
    seasons: ["summer"],
    occasions: ["casual", "vacation"],
    status: "ok",
    timesWorn: 12,
    lastWorn: "2024-01-05",
    tags: ["summer", "floral", "casual", "light"],
    userId: "1",
    createdAt: "2024-01-18T00:00:00.000Z",
    updatedAt: "2024-01-18T00:00:00.000Z",
    // Backward compatibility
    category: "Dresses",
    color: "Multicolor",
    season: "summer",
  },
  {
    id: "5",
    name: "Cashmere Sweater",
    type: "top",
    imageUrl:
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop",
    brand: "Everlane",
    description: "Luxurious cashmere sweater for cold weather",
    colors: ["#808080"],
    seasons: ["fall", "winter"],
    occasions: ["casual", "work"],
    status: "ok",
    timesWorn: 20,
    lastWorn: "2024-01-12",
    tags: ["winter", "warm", "luxury", "cozy"],
    userId: "1",
    createdAt: "2024-01-19T00:00:00.000Z",
    updatedAt: "2024-01-19T00:00:00.000Z",
    // Backward compatibility
    category: "Sweaters",
    color: "Gray",
    season: "winter",
  },
  {
    id: "6",
    name: "White Sneakers",
    type: "shoes",
    imageUrl:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
    brand: "Adidas",
    description: "Clean white sneakers for everyday wear",
    colors: ["#FFFFFF"],
    seasons: ["spring", "summer", "fall"],
    occasions: ["casual", "sport"],
    status: "ok",
    timesWorn: 30,
    lastWorn: "2024-01-15",
    tags: ["casual", "comfortable", "athletic", "everyday"],
    userId: "1",
    createdAt: "2024-01-20T00:00:00.000Z",
    updatedAt: "2024-01-20T00:00:00.000Z",
    // Backward compatibility
    category: "Shoes",
    color: "White",
    season: "all",
  },
  {
    id: "7",
    name: "Red Silk Scarf",
    type: "accessory",
    imageUrl:
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=400&h=400&fit=crop",
    brand: "Hermès",
    description: "Elegant silk scarf in vibrant red",
    colors: ["#DC143C"],
    seasons: ["fall", "winter"],
    occasions: ["formal", "work"],
    status: "ok",
    timesWorn: 5,
    lastWorn: "2024-01-08",
    tags: ["luxury", "accessory", "silk"],
    userId: "1",
    createdAt: "2024-01-21T00:00:00.000Z",
    updatedAt: "2024-01-21T00:00:00.000Z",
    // Backward compatibility
    category: "Accessories",
    color: "Red",
    season: "fall",
  },
  {
    id: "8",
    name: "Navy Blue Chinos",
    type: "bottom",
    imageUrl:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop",
    brand: "J.Crew",
    description: "Smart casual chinos in navy blue",
    colors: ["#1B365D"],
    seasons: ["spring", "summer", "fall"],
    occasions: ["smart", "casual", "work"],
    status: "ok",
    timesWorn: 18,
    lastWorn: "2024-01-11",
    tags: ["smart casual", "chinos", "versatile"],
    userId: "1",
    createdAt: "2024-01-22T00:00:00.000Z",
    updatedAt: "2024-01-22T00:00:00.000Z",
    // Backward compatibility
    category: "Pants",
    color: "Navy",
    season: "spring",
  },
];

export const getItemsByUserId = (userId: string): WardrobeItem[] => {
  return mockWardrobeItems.filter((item) => item.userId === userId);
};

export const getItemById = (id: string): WardrobeItem | undefined => {
  return mockWardrobeItems.find((item) => item.id === id);
};

export const createItem = (
  itemData: Omit<WardrobeItem, "id" | "createdAt" | "updatedAt">
): WardrobeItem => {
  const newItem: WardrobeItem = {
    ...itemData,
    id: (mockWardrobeItems.length + 1).toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockWardrobeItems.push(newItem);
  return newItem;
};

export const updateItem = (
  id: string,
  updates: Partial<WardrobeItem>
): WardrobeItem | null => {
  const itemIndex = mockWardrobeItems.findIndex((item) => item.id === id);
  if (itemIndex === -1) return null;

  mockWardrobeItems[itemIndex] = {
    ...mockWardrobeItems[itemIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return mockWardrobeItems[itemIndex];
};

export const deleteItem = (id: string): boolean => {
  const itemIndex = mockWardrobeItems.findIndex((item) => item.id === id);
  if (itemIndex === -1) return false;

  mockWardrobeItems.splice(itemIndex, 1);
  return true;
};

export const categories = [
  "Shirts",
  "Pants",
  "Dresses",
  "Jackets",
  "Sweaters",
  "Shoes",
  "Accessories",
  "Underwear",
  "Sleepwear",
];

export const colors = [
  "White",
  "Black",
  "Gray",
  "Blue",
  "Red",
  "Green",
  "Yellow",
  "Orange",
  "Purple",
  "Pink",
  "Brown",
  "Multicolor",
];
