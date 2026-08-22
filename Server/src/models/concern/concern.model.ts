import mongoose, { Schema } from "mongoose";
import { IConcern, ConcernStatus } from "../../interfaces/models/IConcern.model";

const concernSchema = new Schema<IConcern>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    photoUrl: {
      type: String,
      required: true,
    },
    photoCapturedAt: {
      type: Date,
      default: null,
    },
    pickupWindowStart: {
      type: Date,
      required: true,
    },
    pickupWindowEnd: {
      type: Date,
      required: true,
    },
    isTimestampValid: {
      type: Boolean,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(ConcernStatus),
      default: ConcernStatus.PENDING,
    },
    adminNote: {
      type: String,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const Concern = mongoose.model<IConcern>("Concern", concernSchema);
