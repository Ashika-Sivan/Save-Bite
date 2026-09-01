import mongoose, { Schema } from "mongoose";
import {
    IWalletTransaction,
    TransactionStatus,
    TransactionType,
} from "../../interfaces/models/IWalletTransaction.model";

const walletTransactionSchema = new Schema<IWalletTransaction>(
    {
        walletId: {
            type: Schema.Types.ObjectId,
            ref: "VendorWallet",
            required: true,
            index: true,
        },
        vendorId: {
            type: Schema.Types.ObjectId,
            ref: "vendor",
            required: true,
            index: true,
        },
        orderId: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            unique: true,
            index: true,
        },
        type: {
            type: String,
            enum: Object.values(TransactionType),
            required: true,
            default: TransactionType.CREDIT,
        },
        orderTotal: {
            type: Number,
            required: true,
            min: 0,
        },
        vendorAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        platformCommission: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            default: "inr",
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: Object.values(TransactionStatus),
            default: TransactionStatus.COMPLETED,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);


walletTransactionSchema.index({
    vendorId: 1,
    createdAt: -1,
});

export const WalletTransaction = mongoose.model<IWalletTransaction>(
    "WalletTransaction",
    walletTransactionSchema
);
