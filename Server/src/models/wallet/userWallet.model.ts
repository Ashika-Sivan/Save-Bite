import mongoose, { Schema } from "mongoose";
import { IUserWallet } from "../../interfaces/models/IUserWallet.model";

const userWalletSchema = new Schema<IUserWallet>(
    {
        customerId: {
            type: Schema.Types.ObjectId,
            ref: "Customer",
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

export const UserWallet = mongoose.model<IUserWallet>(
    "UserWallet",
    userWalletSchema
);
