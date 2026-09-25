// Generic shape for any paginated list result — not User-specific, so it
// lives here rather than in a domain schema/service file.
export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
