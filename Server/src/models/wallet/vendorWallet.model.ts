import mongoose, { Schema } from "mongoose";
import { IVendorWallet } from "../../interfaces/models/IVendorWallet.model";

const vendorWalletSchema = new Schema<IVendorWallet>(
    {
        vendorId: {
            type: Schema.Types.ObjectId,
            ref: "vendor",
            required: true,
            unique: true,
            index: true,
        },
        balance: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        totalEarnings: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        totalCommissionPaid: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        currency: {
            type: String,
            default: "inr",
            lowercase: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export const VendorWallet = mongoose.model<IVendorWallet>(
    "VendorWallet",
    vendorWalletSchema
);
