import {
  Shirt,
  Package,
  Footprints,
  Watch,
  Wind,
  Minus,
  Crown,
  Glasses,
  User,
  type LucideIcon,
} from "lucide-react";

/**
 * Get Lucide icon component for a category ID
 * Maps 46 wardrobe categories to appropriate icons
 */
export function getCategoryIcon(categoryId: number): LucideIcon {
  const iconMap: Record<number, LucideIcon> = {
    // Top (1-12)
    1: Shirt, // T-Shirt
    2: Shirt, // Shirt
    3: Shirt, // Blouse
    4: Shirt, // Tank Top
    5: Shirt, // Polo Shirt
    6: Shirt, // Sweater
    7: Shirt, // Hoodie
    8: Shirt, // Cardigan
    9: Shirt, // Jacket
    10: Shirt, // Coat
    11: Shirt, // Blazer
    12: Shirt, // Vest

    // Bottom (13-19)
    13: Package, // Jeans
    14: Package, // Trousers
    15: Package, // Shorts
    16: Package, // Skirt
    17: Package, // Leggings
    18: Package, // Joggers
    19: Package, // Cargo Pants

    // Footwear (20-27)
    20: Footprints, // Sneakers
    21: Footprints, // Boots
    22: Footprints, // Sandals
    23: Footprints, // Heels
    24: Footprints, // Flats
    25: Footprints, // Loafers
    26: Footprints, // Slippers
    27: Footprints, // Formal Shoes

    // Accessories (28-38)
    28: Watch, // Watch
    29: Glasses, // Sunglasses
    30: Crown, // Hat
    31: Wind, // Scarf
    32: Minus, // Belt
    33: Package, // Bag
    34: Package, // Backpack
    35: Watch, // Jewelry
    36: Glasses, // Eyeglasses
    37: Wind, // Tie
    38: Wind, // Bow Tie

    // Outerwear (39-42)
    39: Wind, // Raincoat
    40: Wind, // Trench Coat
    41: Wind, // Puffer Jacket
    42: Wind, // Windbreaker

    // Underwear (43-46)
    43: User, // Underwear
    44: User, // Bra
    45: User, // Socks
    46: User, // Tights
  };

  return iconMap[categoryId] || Shirt; // Default to Shirt icon
}

/**
 * Get category name from ID (optional helper for display)
 */
export function getCategoryName(categoryId: number): string {
  const nameMap: Record<number, string> = {
    1: "T-Shirt",
    2: "Shirt",
    3: "Blouse",
    4: "Tank Top",
    5: "Polo Shirt",
    6: "Sweater",
    7: "Hoodie",
    8: "Cardigan",
    9: "Jacket",
    10: "Coat",
    11: "Blazer",
    12: "Vest",
    13: "Jeans",
    14: "Trousers",
    15: "Shorts",
    16: "Skirt",
    17: "Leggings",
    18: "Joggers",
    19: "Cargo Pants",
    20: "Sneakers",
    21: "Boots",
    22: "Sandals",
    23: "Heels",
    24: "Flats",
    25: "Loafers",
    26: "Slippers",
    27: "Formal Shoes",
    28: "Watch",
    29: "Sunglasses",
    30: "Hat",
    31: "Scarf",
    32: "Belt",
    33: "Bag",
    34: "Backpack",
    35: "Jewelry",
    36: "Eyeglasses",
    37: "Tie",
    38: "Bow Tie",
    39: "Raincoat",
    40: "Trench Coat",
    41: "Puffer Jacket",
    42: "Windbreaker",
    43: "Underwear",
    44: "Bra",
    45: "Socks",
    46: "Tights",
  };

  return nameMap[categoryId] || "Unknown";
}
