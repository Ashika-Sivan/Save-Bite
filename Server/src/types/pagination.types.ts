export interface IPaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  totalRevenue?:number|0
  totalCount?:number|0
}

export interface IPaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totalRevenue?:number|0
  totalCount?:number|0
}
