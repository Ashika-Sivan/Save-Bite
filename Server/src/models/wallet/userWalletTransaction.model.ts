import mongoose, { Schema } from "mongoose";
import { IUserWalletTransaction, UserWalletTransactionType } from "../../interfaces/models/IUserWalletTransaction.model";

const userWalletTransactionSchema = new Schema<IUserWalletTransaction>(
    {
        walletId: {
            type: Schema.Types.ObjectId,
            ref: "UserWallet",
            required: true,
            index: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        type: {
            type: String,
            enum: Object.values(UserWalletTransactionType),
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        orderId: {
            type: Schema.Types.ObjectId,
            ref: "Order",
        },
    },
    {
        timestamps: true,
    }
);

export const UserWalletTransaction = mongoose.model<IUserWalletTransaction>(
    "UserWalletTransaction",
    userWalletTransactionSchema
);
