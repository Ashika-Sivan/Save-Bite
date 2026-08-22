import { Types } from "mongoose";

export enum ConcernStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface IConcern {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  customerId: Types.ObjectId;
  vendorId: Types.ObjectId;
  reason: string;
  photoUrl: string;
  photoCapturedAt: Date | null;
  pickupWindowStart: Date;
  pickupWindowEnd: Date;
  isTimestampValid: boolean | null;
  status: ConcernStatus;
  adminNote?: string | null;
  resolvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
