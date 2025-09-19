import { WardrobeItem } from "@/types";

export const mockWardrobeItems: WardrobeItem[] = [
  {
    id: "1",
    name: "Classic White Button-Down Shirt",
    category: "Shirts",
    color: "White",
    brand: "Uniqlo",
    season: "all-season",
    imageUrl:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop",
    description: "A versatile white button-down shirt perfect for any occasion",
    tags: ["formal", "casual", "office", "versatile"],
    userId: "1",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Dark Wash Denim Jeans",
    category: "Pants",
    color: "Blue",
    brand: "Levi's",
    season: "all-season",
    imageUrl:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
    description: "Classic straight-leg jeans in dark wash",
    tags: ["casual", "denim", "everyday"],
    userId: "1",
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-16"),
  },
  {
    id: "3",
    name: "Black Wool Blazer",
    category: "Jackets",
    color: "Black",
    brand: "Zara",
    season: "fall",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    description: "Elegant black wool blazer for formal occasions",
    tags: ["formal", "business", "elegant"],
    userId: "1",
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-17"),
  },
  {
    id: "4",
    name: "Summer Floral Dress",
    category: "Dresses",
    color: "Multicolor",
    brand: "H&M",
    season: "summer",
    imageUrl:
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop",
    description: "Light and airy floral dress perfect for summer",
    tags: ["summer", "floral", "casual", "light"],
    userId: "1",
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-18"),
  },
  {
    id: "5",
    name: "Cashmere Sweater",
    category: "Sweaters",
    color: "Gray",
    brand: "Everlane",
    season: "winter",
    imageUrl:
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop",
    description: "Luxurious cashmere sweater for cold weather",
    tags: ["winter", "warm", "luxury", "cozy"],
    userId: "1",
    createdAt: new Date("2024-01-19"),
    updatedAt: new Date("2024-01-19"),
  },
  {
    id: "6",
    name: "White Sneakers",
    category: "Shoes",
    color: "White",
    brand: "Adidas",
    season: "all-season",
    imageUrl:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
    description: "Clean white sneakers for everyday wear",
    tags: ["casual", "comfortable", "athletic", "everyday"],
    userId: "1",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    updatedAt: new Date(),
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
