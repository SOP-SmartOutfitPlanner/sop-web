/**
 * Generic API Types
 * Shared across all API modules
 */

/**
 * Standard API Response Wrapper
 * All API endpoints return this format
 */
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  data: null | {
    errors?: Record<string, string[]>;
  };
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

