/**
 * Query keys for collections-related queries
 */
export const COLLECTION_QUERY_KEYS = {
  collections: ["collections"] as const,
  userCollections: (userId: number) => ["user-collections", userId] as const,
  savedCollections: (userId: number) =>
    ["collections", "saved", userId] as const,
  collection: (id: number) => ["collection", id] as const,
  collectionComments: (id: number, pageIndex?: number) =>
    pageIndex !== undefined
      ? (["collection-comments", id, pageIndex] as const)
      : (["collection-comments", id] as const),
  collectionCommentsCount: (id: number) =>
    ["collection-comments-count", id] as const,
  stylistProfile: (userId: number) => ["stylist-profile", userId] as const,
} as const;

/**
 * Invalidate all collection-related queries
 */
export const INVALIDATE_COLLECTION_QUERIES = {
  all: ["collections"] as const,
  user: (userId: number) => ["user-collections", userId] as const,
  collection: (id: number) => ["collection", id] as const,
} as const;

