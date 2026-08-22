import { ClientSession, Types } from "mongoose";
import { IVendorWallet } from "../models/IVendorWallet.model";
import { IWalletTransaction } from "../models/IWalletTransaction.model";

export interface ICreateTransactionData {
    walletId: Types.ObjectId;
    vendorId: Types.ObjectId;
    orderId: Types.ObjectId;
    orderTotal: number;
    vendorAmount: number;
    platformCommission: number;
    description: string;
}

export interface IWalletRepository {
    getOrCreateWallet(vendorId: Types.ObjectId, session?: ClientSession): Promise<IVendorWallet>;
    findByVendorId(vendorId: Types.ObjectId): Promise<IVendorWallet | null>;
    creditVendorWallet(
        vendorId: Types.ObjectId,
        vendorAmount: number,
        commissionAmount: number,
        session?: ClientSession
    ): Promise<IVendorWallet | null>;
    createTransaction(
        data: ICreateTransactionData,
        session?: ClientSession
    ): Promise<IWalletTransaction>;
    getTransactionsByVendorId(vendorId: Types.ObjectId): Promise<IWalletTransaction[]>;
    transactionExistsForOrder(orderId: Types.ObjectId, session?: ClientSession): Promise<boolean>;
}
