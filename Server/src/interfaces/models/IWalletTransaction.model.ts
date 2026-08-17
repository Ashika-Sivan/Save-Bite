import { Types } from "mongoose";

export enum TransactionType {
    CREDIT = "credit",
    DEBIT = "debit",
    COMMISSION = "commission",
    PAYOUT = "payout",
}

export enum TransactionStatus {
    COMPLETED = "completed",
    PENDING = "pending",
    FAILED = "failed",
}

export interface IWalletTransaction {
    _id: Types.ObjectId;
    walletId: Types.ObjectId;
    vendorId: Types.ObjectId;
    orderId: Types.ObjectId;
    type: TransactionType;
    orderTotal: number;
    vendorAmount: number;
    platformCommission: number;
    currency: string;
    description: string;
    status: TransactionStatus;
    createdAt: Date;
    updatedAt: Date;
}
