import { ClientSession } from "mongoose";
import { IUserWalletService } from "../../interfaces/service/wallet/IUserWalletService";
import { UserWalletRepository } from "../../repositories/wallet/userWallet.repository";
import { IUserWalletRepository } from "../../interfaces/repository/IUserWalletRepository";
import { IUserWalletTransaction, UserWalletTransactionType } from "../../interfaces/models/IUserWalletTransaction.model";

export class UserWalletService implements IUserWalletService {
    private _walletRepository: IUserWalletRepository;

    constructor(walletRepository: IUserWalletRepository) {
        this._walletRepository = walletRepository;
    }

    async getTransactionHistory(customerId: string, page: number = 1, limit: number = 10, search: string = "", type: string = ""): Promise<{ transactions: IUserWalletTransaction[], totalItems: number, totalPages: number, currentPage: number }> {
        let wallet = await this._walletRepository.getWalletByCustomerId(customerId);

        if (!wallet) {
            wallet = await this._walletRepository.createWallet(customerId);
        }

        return this._walletRepository.getTransactionsByWalletId(String(wallet._id), page, limit, search, type);
    }

    async logCredit(customerId: string, amount: number, description: string, orderId?: string, session?: ClientSession): Promise<void> {
        if (amount <= 0) return;

        let wallet = await this._walletRepository.getWalletByCustomerId(customerId);
        if (!wallet) {
            wallet = await this._walletRepository.createWallet(customerId);
        }


        await this._walletRepository.createTransaction(
            String(wallet._id),
            amount,
            UserWalletTransactionType.CREDIT,
            description,
            orderId,
            session
        );
    }
    /*
    we are actually lock the process 
    */

    async logDebit(customerId: string, amount: number, description: string, orderId?: string, session?: ClientSession): Promise<void> {
        if (amount <= 0) return;

        let wallet = await this._walletRepository.getWalletByCustomerId(customerId);
        if (!wallet) {
            wallet = await this._walletRepository.createWallet(customerId);
        }


        await this._walletRepository.createTransaction(
            String(wallet._id),
            amount,
            UserWalletTransactionType.DEBIT,
            description,
            orderId,
            session
        );
    }
}
