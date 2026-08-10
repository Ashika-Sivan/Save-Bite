export interface IPaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface IPaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
