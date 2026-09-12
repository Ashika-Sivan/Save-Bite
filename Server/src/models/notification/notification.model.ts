import mongoose, { Schema, Document, Types } from "mongoose";

export interface INotification extends Document {
  userId?: Types.ObjectId;
  targetRole: "all" | "customer" | "vendor";
  title: string;
  body: string;
  type: "MEAL_REMINDER" | "PROMOTIONAL" | "SYSTEM" | "ORDER_STATUS";
  link?: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    targetRole: { type: String, enum: ["all", "customer", "vendor"], default: "all" },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: ["MEAL_REMINDER", "PROMOTIONAL", "SYSTEM", "ORDER_STATUS"],
      default: "MEAL_REMINDER",
    },
    link: { type: String, default: "/home" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const NotificationModel = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
