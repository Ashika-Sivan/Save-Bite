export interface IWalletResponseDTO {
    id: string;
    vendorId: string;
    balance: number;
    totalEarnings: number;
    totalCommissionPaid: number;
    currency: string;
    updatedAt: string;
}

export interface IWalletTransactionResponseDTO {
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

export interface IWalletSummaryResponseDTO {
    wallet: IWalletResponseDTO;
    transactions: IWalletTransactionResponseDTO[];
}
