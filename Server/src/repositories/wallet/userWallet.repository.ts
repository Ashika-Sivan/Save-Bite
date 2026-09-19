import mongoose, { ClientSession } from "mongoose";
import { IUserWalletRepository } from "../../interfaces/repository/IUserWalletRepository";
import { IUserWallet } from "../../interfaces/models/IUserWallet.model";
import { IUserWalletTransaction, UserWalletTransactionType } from "../../interfaces/models/IUserWalletTransaction.model";
import { UserWallet } from "../../models/wallet/userWallet.model";
import { UserWalletTransaction } from "../../models/wallet/userWalletTransaction.model";
import { AppError } from "../../errors/AppError";
import { StatusCode } from "../../constants/statusCode";

export class UserWalletRepository implements IUserWalletRepository {
    async getWalletByCustomerId(customerId: string): Promise<IUserWallet | null> {
        return UserWallet.findOne({ customerId });
    }

    async createWallet(customerId: string): Promise<IUserWallet> {
        const wallet = new UserWallet({ customerId });
        return wallet.save();
    }

    async creditWallet(customerId: string, amount: number, session?: ClientSession): Promise<IUserWallet> {
        const wallet = await UserWallet.findOneAndUpdate(
            { customerId },
            { $inc: { balance: amount } },
            { new: true, upsert: true, session }
        );
        return wallet;
    }

    async debitWallet(customerId: string, amount: number, session?: ClientSession): Promise<IUserWallet> {
        const wallet = await UserWallet.findOneAndUpdate(
            { customerId, balance: { $gte: amount } }, // ensure sufficient balance
            { $inc: { balance: -amount } },
            { new: true, session }
        );
        
        if (!wallet) {
            throw new AppError("Insufficient wallet balance or wallet not found", StatusCode.BAD_REQUEST);
        }
        return wallet;
    }

    async createTransaction(
        walletId: string,
        amount: number,
        type: UserWalletTransactionType,
        description: string,
        orderId?: string,
        session?: ClientSession
    ): Promise<IUserWalletTransaction> {
        const transaction = new UserWalletTransaction({
            walletId,
            amount,
            type,
            description,
            orderId,
        });
        
        const savedTransactions = await UserWalletTransaction.create([transaction], { session });
        return savedTransactions[0] as unknown as IUserWalletTransaction;
    }

    async getTransactionsByWalletId(
        walletId: string,
        page: number = 1,
        limit: number = 10,
        search: string = "",
        type: string = ""
    ): Promise<{ transactions: IUserWalletTransaction[], totalItems: number, totalPages: number, currentPage: number }> {
        interface WalletQuery {
            walletId: string;
            type?: string;
            $or?: Array<Record<string, unknown>>;
        }

        const query: WalletQuery = { walletId };

        if (type && (type === UserWalletTransactionType.CREDIT || type === UserWalletTransactionType.DEBIT)) {
            query.type = type;
        }

        if (search) {
            const orConditions: Array<Record<string, unknown>> = [
                { description: { $regex: search, $options: "i" } }
            ];

            // Only query orderId if search is a valid ObjectId
            if (mongoose.Types.ObjectId.isValid(search)) {
                orConditions.push({ orderId: search });
            }

            query.$or = orConditions;
        }

        const skip = (page - 1) * limit;

        const [transactions, totalItems] = await Promise.all([
            UserWalletTransaction.find(query as unknown as Record<string, unknown>)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'orderId',
                    select: 'hotelId', 
                    populate: {
                        path: 'hotelId',
                        select: 'hotelName'
                    }
                })
                .lean(),
            UserWalletTransaction.countDocuments(query as unknown as Record<string, unknown>)
        ]);

        const mappedTransactions = transactions.map((tx) => {
            const txObj = tx as unknown as Record<string, unknown>;
            const orderObj = txObj.orderId as Record<string, unknown>;
            const hotelObj = orderObj?.hotelId as Record<string, unknown>;
            
            const hotelName = hotelObj?.hotelName || null;
            const orderIdStr = orderObj?._id ? String(orderObj._id) : tx.orderId;
            return {
                ...tx,
                orderId: orderIdStr,
                hotelName
            };
        });

        return {
            transactions: mappedTransactions as unknown as IUserWalletTransaction[],
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page
        };
    }
}
