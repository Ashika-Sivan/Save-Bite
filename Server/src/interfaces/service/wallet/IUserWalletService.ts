import { ClientSession } from "mongoose";
import { IUserWalletTransaction } from "../../models/IUserWalletTransaction.model";

export interface IUserWalletService {
    getTransactionHistory(customerId: string, page?: number, limit?: number, search?: string, type?: string): Promise<{ transactions: IUserWalletTransaction[], totalItems: number, totalPages: number, currentPage: number }>;
    logCredit(customerId: string, amount: number, description: string, orderId?: string, session?: ClientSession): Promise<void>;
    logDebit(customerId: string, amount: number, description: string, orderId?: string, session?: ClientSession): Promise<void>;
}
