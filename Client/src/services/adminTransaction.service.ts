import api from "./api";
import { API_ROUTES } from "../constants/apiRoutes";

export interface TransactionOverview {
  totalGrossSales: number;
  totalAdminCommission: number;
  totalVendorEarnings: number;
  totalTransactions: number;
}

export interface VendorFinancialItem {
  hotelId: string;
  vendorId: string;
  hotelName: string;
  businessName: string;
  place: string;
  businessType: string;
  totalOrders: number;
  grossSales: number;
  adminCommission: number;
  vendorNetPayout: number;
}

export interface VendorFinancialResponse {
  items: VendorFinancialItem[];
  businessTypes?: string[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RecentTransactionItem {
  _id: string;
  orderId: string;
  pickupCode: string;
  customerName: string;
  customerEmail: string;
  hotelName: string;
  vendorBusinessName: string;
  totalAmount: number;
  platformCommissionAmount: number;
  vendorAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
}

export interface RecentTransactionsResponse {
  items: RecentTransactionItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface VendorBreakdownParams {
  page?: number;
  limit?: number;
  search?: string;
  businessType?: string;
  sortAdminEarned?: "desc" | "asc" | "";
}

export interface RecentTransactionsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const getAdminTransactionOverview = async (): Promise<TransactionOverview> => {
  const response = await api.get(API_ROUTES.ADMIN.TRANSACTIONS_OVERVIEW);
  return response.data?.data || response.data;
};

export const getVendorFinancialBreakdown = async (
  params?: VendorBreakdownParams
): Promise<VendorFinancialResponse> => {
  const response = await api.get(API_ROUTES.ADMIN.TRANSACTIONS_VENDORS, { params });
  return response.data?.data || response.data;
};

export const getRecentTransactions = async (
  params?: RecentTransactionsParams
): Promise<RecentTransactionsResponse> => {
  const response = await api.get(API_ROUTES.ADMIN.TRANSACTIONS_RECENT, { params });
  return response.data?.data || response.data;
};
