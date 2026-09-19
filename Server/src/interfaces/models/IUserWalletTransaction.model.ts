import { Document, Types } from "mongoose";

export enum UserWalletTransactionType {
    CREDIT = "CREDIT",
    DEBIT = "DEBIT",
}

export interface IUserWalletTransaction extends Document {
    walletId: Types.ObjectId;
    amount: number;
    type: UserWalletTransactionType;
    description: string;
    orderId?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
