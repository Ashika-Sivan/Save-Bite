import api from "./api";
import { API_ROUTES } from "../constants/apiRoutes";
import type {
  VendorDTO,
  UserDTO,
  PaginatedResult,
  VendorQueryParams,
  UserQueryParams,
} from "../types/admin.types";


type AdminLoginData = {
  email: string;
  password: string;
};

export const adminLogin = async (data: AdminLoginData) => {
  const response = await api.post(API_ROUTES.AUTH.LOGIN, data);
  return response.data;
};


const toVendorDTO = (raw: Record<string, unknown>): VendorDTO => ({
  id: raw._id as string ?? raw.id as string,
  ownerName: raw.ownerName as string ?? "",
  ownerEmail: raw.ownerEmail as string ?? "",
  businessName: raw.businessName as string ?? "",
  businessType: raw.businessType as string ?? "",
  place: raw.place as string ?? "",
  status: raw.status as VendorDTO["status"],
  isLive: Boolean(raw.isLive),
  createdAt: raw.createdAt as string ?? "",
  revenue: raw.revenue as number | undefined,
});



export const getAllVendors = async (
  params?: VendorQueryParams
): Promise<PaginatedResult<VendorDTO>> => {
  const response = await api.get(API_ROUTES.ADMIN.VENDORS, { params });
  const raw = response.data?.data ?? response.data;
  return {
    items: (raw?.items ?? []).map(toVendorDTO),
    total: raw?.total ?? 0,
    page: raw?.page ?? 1,
    limit: raw?.limit ?? 10,
    totalPages: raw?.totalPages ?? 1,
  };
};

export const getVendorById = async (vendorId: string) => {
  const response = await api.get(API_ROUTES.ADMIN.VENDOR_BY_ID(vendorId));
  return response.data;
};

export const approveVendor = async (vendorId: string) => {
  const response = await api.patch(API_ROUTES.ADMIN.VENDOR_APPROVE(vendorId));
  return response.data;
};

export const rejectVendor = async (vendorId: string, reason: string) => {
  const response = await api.patch(API_ROUTES.ADMIN.VENDOR_REJECT(vendorId), {
    reason,
  });
  return response.data;
};



const toUserDTO = (raw: Record<string, unknown>): UserDTO => ({
  id: raw._id as string ?? raw.id as string,
  name: raw.name as string ?? "",
  email: raw.email as string ?? "",
  role: raw.role as string ?? "",
  isActive: Boolean(raw.isActive),
  createdAt: raw.createdAt as string ?? "",
});


export const getAllUsers = async (
  params?: UserQueryParams
): Promise<PaginatedResult<UserDTO>> => {
  const response = await api.get(API_ROUTES.ADMIN.USERS, { params });
  const raw = response.data?.data ?? response.data;
  return {
    items: (raw?.items ?? []).map(toUserDTO),
    total: raw?.total ?? 0,
    page: raw?.page ?? 1,
    limit: raw?.limit ?? 10,
    totalPages: raw?.totalPages ?? 1,
  };
};

export const toggleUserStatus = async (userId: string): Promise<UserDTO> => {
  const response = await api.patch(API_ROUTES.ADMIN.USER_STATUS(userId));
  const raw = response.data?.data ?? response.data;
  return toUserDTO(raw);
};