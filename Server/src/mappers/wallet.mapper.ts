import { IVendorWallet } from "../interfaces/models/IVendorWallet.model";
import { IWalletTransaction } from "../interfaces/models/IWalletTransaction.model";
import { IWalletResponseDTO, IWalletTransactionResponseDTO, IWalletSummaryResponseDTO } from "../dtos/wallet.dto";

export const toWalletResponseDTO = (wallet: IVendorWallet): IWalletResponseDTO => {
    return {
        id: wallet._id.toString(),
        vendorId: wallet.vendorId.toString(),
        balance: wallet.balance,
        totalEarnings: wallet.totalEarnings,
        totalCommissionPaid: wallet.totalCommissionPaid,
        currency: wallet.currency,
        updatedAt: wallet.updatedAt.toISOString(),
    };
};

export const toWalletTransactionResponseDTO = (transaction: IWalletTransaction): IWalletTransactionResponseDTO => {
    return {
        id: transaction._id.toString(),
        walletId: transaction.walletId.toString(),
        vendorId: transaction.vendorId.toString(),
        orderId: transaction.orderId ? transaction.orderId.toString() : "",
        type: transaction.type,
        orderTotal: transaction.orderTotal,
        vendorAmount: transaction.vendorAmount,
        platformCommission: transaction.platformCommission,
        currency: transaction.currency,
        description: transaction.description,
        status: transaction.status,
        createdAt: transaction.createdAt.toISOString(),
    };
};

export const toWalletSummaryResponseDTO = (wallet: IVendorWallet, transactions: IWalletTransaction[]): IWalletSummaryResponseDTO => {
    return {
        wallet: toWalletResponseDTO(wallet),
        transactions: transactions.map(toWalletTransactionResponseDTO),
    };
};
