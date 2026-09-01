import { ClientSession, Types } from "mongoose";
import { IVendorWallet } from "../../interfaces/models/IVendorWallet.model";
import { IWalletTransaction, TransactionStatus, TransactionType } from "../../interfaces/models/IWalletTransaction.model";
import { ICreateTransactionData, IWalletRepository } from "../../interfaces/repository/IWalletRepository";
import { VendorWallet } from "../../models/wallet/vendorWallet.model";
import { WalletTransaction } from "../../models/wallet/walletTransaction.model";
import { BaseRepository } from "../base.repository";

export class WalletRepository extends BaseRepository<IVendorWallet> implements IWalletRepository {
    constructor() {
        super(VendorWallet);
    }

    async getOrCreateWallet(vendorId: Types.ObjectId, session?: ClientSession): Promise<IVendorWallet> {
        const query = VendorWallet.findOne({ vendorId });
        let wallet = session ? await query.session(session) : await query;

        if (!wallet) {
            const options = session ? { session } : {};
            const newWallet = new VendorWallet({
                vendorId,
                balance: 0,
                totalEarnings: 0,
                totalCommissionPaid: 0,
                currency: "inr",
            });
            wallet = await newWallet.save(options);
        }

        return wallet;
    }

    async findByVendorId(vendorId: Types.ObjectId): Promise<IVendorWallet | null> {
        return await VendorWallet.findOne({ vendorId });
    }

    async creditVendorWallet(
        vendorId: Types.ObjectId,
        vendorAmount: number,
        commissionAmount: number,
        session?: ClientSession
    ): Promise<IVendorWallet | null> {
        const options: Record<string, unknown> = {
            new: true,
            runValidators: true,
        };
        if (session) {
            options.session = session;
        }

        return await VendorWallet.findOneAndUpdate(
            { vendorId },
            {
                $inc: {
                    balance: vendorAmount,
                    totalEarnings: vendorAmount,
                    totalCommissionPaid: commissionAmount,
                },
            },
            options
        );
    }

    async createTransaction(
        data: ICreateTransactionData,
        session?: ClientSession
    ): Promise<IWalletTransaction> {
        const options = session ? { session } : {};
        const transaction = new WalletTransaction({
            walletId: data.walletId,
            vendorId: data.vendorId,
            orderId: data.orderId,
            type: TransactionType.CREDIT,
            orderTotal: data.orderTotal,
            vendorAmount: data.vendorAmount,
            platformCommission: data.platformCommission,
            currency: "inr",
            description: data.description,
            status: TransactionStatus.COMPLETED,
        });

        return await transaction.save(options);
    }

    async getTransactionsByVendorId(vendorId: Types.ObjectId): Promise<IWalletTransaction[]> {
        return await WalletTransaction.find({ vendorId })
            .populate("orderId", "totalAmount items createdAt")
            .sort({ createdAt: -1 });
    }

    async transactionExistsForOrder(orderId: Types.ObjectId, session?: ClientSession): Promise<boolean> {
        const query = WalletTransaction.exists({ orderId });
        const existing = session ? await query.session(session) : await query;
        return existing !== null;//check if a ledger recod already exist for order.
    }
}
