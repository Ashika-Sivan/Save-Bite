import { Types } from "mongoose";

export interface IVendorWallet {
    _id: Types.ObjectId;
    vendorId: Types.ObjectId;
    balance: number;
    totalEarnings: number;
    totalCommissionPaid: number;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
}
