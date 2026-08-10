// DTOs (Data Transfer Objects) for admin-facing data.
// The service layer maps raw API responses into these types before
// returning them to components, so components never touch raw payloads.

export type VendorStatus = "pending" | "approved" | "rejected" | "suspended";

export interface VendorDTO {
  id: string;
  ownerName: string;
  ownerEmail: string;
  businessName: string;
  businessType: string;
  place: string;
  status: VendorStatus;
  isLive: boolean;
  createdAt: string;
  revenue?: number;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type VendorQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

export type UserQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};
