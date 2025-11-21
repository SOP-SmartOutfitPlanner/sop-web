import type { CollectionRecord } from "@/lib/api";

/**
 * Parse color names from JSON string
 */
export function parseColorNames(
  colorString: string | null
): string | undefined {
  if (!colorString) return undefined;
  try {
    const parsed = JSON.parse(colorString) as Array<{ name?: string }>;
    const names = parsed
      .map((entry) => entry?.name)
      .filter((name): name is string => Boolean(name));
    return names.length > 0 ? names.join(", ") : undefined;
  } catch (error) {
    console.warn("Failed to parse color string", error);
    return undefined;
  }
}

/**
 * Get author initials from display name
 */
export function getAuthorInitials(name: string): string {
  const matches = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return matches.slice(0, 2) || "ST";
}

/**
 * Get thumbnail URL from collection
 */
export function getCollectionThumbnail(
  collection: CollectionRecord
): string | undefined {
  if (collection.thumbnailURL) return collection.thumbnailURL;
  const firstOutfit = collection.outfits?.[0]?.outfit;
  const firstItemWithImage = firstOutfit?.items.find((item) => item.imgUrl);
  return firstItemWithImage?.imgUrl ?? undefined;
}

/**
 * Get fallback images from collection items
 */
export function getCollectionFallbackImages(
  collection: CollectionRecord,
  limit = 4
): string[] {
  const images: string[] = [];
  for (const outfit of collection.outfits ?? []) {
    for (const item of outfit.outfit.items) {
      if (item.imgUrl && !images.includes(item.imgUrl)) {
        images.push(item.imgUrl);
        if (images.length >= limit) {
          return images;
        }
      }
    }
  }
  return images;
}

/**
 * Get hero image for collection detail page
 */
export function getCollectionHeroImage(
  collection: CollectionRecord
): string | undefined {
  if (collection.thumbnailURL) {
    return collection.thumbnailURL;
  }
  const outfitWithImage = collection.outfits?.find((entry) =>
    entry.outfit?.items?.some((item) => item.imgUrl)
  );
  return (
    outfitWithImage?.outfit?.items.find((item) => item.imgUrl)?.imgUrl ??
    undefined
  );
}

/**
 * Get weather suitable tags from collection
 */
export function getWeatherSuitableFromCollection(
  collection: CollectionRecord
): string[] {
  const weatherSet = new Set<string>();
  collection.outfits?.forEach((entry) => {
    entry.outfit?.items?.forEach((item) => {
      if (item.weatherSuitable) {
        weatherSet.add(item.weatherSuitable);
      }
    });
  });
  return Array.from(weatherSet);
}

/**
 * Filter collections by publish status
 */
export function filterCollectionsByStatus(
  collections: CollectionRecord[],
  status: "all" | "published" | "drafts"
): CollectionRecord[] {
  switch (status) {
    case "published":
      return collections.filter((collection) => collection.isPublished);
    case "drafts":
      return collections.filter((collection) => !collection.isPublished);
    default:
      return collections;
  }
}

/**
 * Format date with Vietnamese locale
 */
export function formatDate(
  date: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  return new Date(date).toLocaleDateString("vi-VN", options || defaultOptions);
}

