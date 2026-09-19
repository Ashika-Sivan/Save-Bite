import { ClientSession } from "mongoose";
import { IUserWallet } from "../models/IUserWallet.model";
import { IUserWalletTransaction, UserWalletTransactionType } from "../models/IUserWalletTransaction.model";

export interface IUserWalletRepository {
    getWalletByCustomerId(customerId: string): Promise<IUserWallet | null>;
    createWallet(customerId: string): Promise<IUserWallet>;
    creditWallet(customerId: string, amount: number, session?: ClientSession): Promise<IUserWallet>;
    debitWallet(customerId: string, amount: number, session?: ClientSession): Promise<IUserWallet>;
    createTransaction(
        walletId: string,
        amount: number,
        type: UserWalletTransactionType,
        description: string,
        orderId?: string,
        session?: ClientSession
    ): Promise<IUserWalletTransaction>;
    getTransactionsByWalletId(
        walletId: string, 
        page?: number, 
        limit?: number, 
        search?: string, 
        type?: string
    ): Promise<{ transactions: IUserWalletTransaction[], totalItems: number, totalPages: number, currentPage: number }>;
}
