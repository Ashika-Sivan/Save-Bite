import { API_ROUTES } from "../constants/apiRoutes";
import api from "./api";
import type { ApiResponse } from "./order.service";

export interface WalletData {
    id: string;
    vendorId: string;
    balance: number;
    totalEarnings: number;
    totalCommissionPaid: number;
    currency: string;
    updatedAt: string;
}

export interface WalletTransactionData {
    id: string;
    walletId: string;
    vendorId: string;
    orderId: string;
    type: string;
    orderTotal: number;
    vendorAmount: number;
    platformCommission: number;
    currency: string;
    description: string;
    status: string;
    createdAt: string;
}

export interface WalletSummaryData {
    wallet: WalletData;
    transactions: WalletTransactionData[];
}

export const getVendorWalletSummary = async (filters?: { startDate?: string; endDate?: string; sortDirection?: "asc" | "desc" }): Promise<ApiResponse<WalletSummaryData>> => {
    let url = API_ROUTES.VENDOR.WALLET;
    if (filters) {
        const params = new URLSearchParams();
        if (filters.startDate) params.append("startDate", filters.startDate);
        if (filters.endDate) params.append("endDate", filters.endDate);
        if (filters.sortDirection) params.append("sortDirection", filters.sortDirection);
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
    }
    const response = await api.get<ApiResponse<WalletSummaryData>>(url);
    return response.data;
};

export interface CustomerWalletData {
    id: string;
    customerId: string;
    balance: number;
    currency: string;
    updatedAt: string;
}

export interface CustomerWalletTransactionData {
    id: string;
    walletId: string;
    amount: number;
    type: "CREDIT" | "DEBIT";
    description: string;
    orderId?: string;
    hotelName?: string;
    createdAt: string;
}

export interface CustomerWalletSummaryData {
    transactions: CustomerWalletTransactionData[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
}

export const getCustomerWalletSummary = async (page = 1, limit = 10, search = "", type = ""): Promise<ApiResponse<CustomerWalletSummaryData>> => {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        type,
    });
    const response = await api.get<ApiResponse<CustomerWalletSummaryData>>(`${API_ROUTES.CUSTOMER.WALLET}?${params.toString()}`);
    return response.data;
};
