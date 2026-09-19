import { Document, Types } from "mongoose";

export interface IUserWallet extends Document {
    customerId: Types.ObjectId;
    balance: number;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
}
