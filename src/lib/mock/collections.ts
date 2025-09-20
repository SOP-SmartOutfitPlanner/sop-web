import { Collection } from "@/types/wardrobe";

export const mockCollections: Collection[] = [
  {
    id: "all",
    name: "All Items",
    color: "#6B7280",
    count: 0, // Will be dynamically calculated
  },
  {
    id: "work",
    name: "Work",
    color: "#1F2937",
    count: 8,
  },
  {
    id: "casual",
    name: "Casual",
    color: "#3B82F6",
    count: 12,
  },
  {
    id: "formal",
    name: "Formal",
    color: "#8B5CF6",
    count: 5,
  },
  {
    id: "workout",
    name: "Workout",
    color: "#10B981",
    count: 7,
  },
  {
    id: "vacation",
    name: "Vacation",
    color: "#F59E0B",
    count: 4,
  },
];

export function getCollectionsWithCounts(totalItems: number): Collection[] {
  return mockCollections.map((collection) => ({
    ...collection,
    count: collection.id === "all" ? totalItems : collection.count,
  }));
}
