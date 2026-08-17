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

export const getVendorWalletSummary = async (): Promise<ApiResponse<WalletSummaryData>> => {
    const response = await api.get<ApiResponse<WalletSummaryData>>(API_ROUTES.VENDOR.WALLET);
    return response.data;
};
