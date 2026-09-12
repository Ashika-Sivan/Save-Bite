import mongoose, { Schema, Document } from "mongoose";

export interface INotificationSchedule extends Document {
  name: string;
  title: string;
  body: string;
  targetRole: "all" | "customer" | "vendor";
  time24: string; // e.g. "08:30", "12:30", "19:30"
  link: string;
  isActive: boolean;
  type: "MEAL_REMINDER" | "PROMOTIONAL" | "SYSTEM";
  lastTriggeredDate?: string; // YYYY-MM-DD to avoid duplicate triggers on same day
  createdAt: Date;
  updatedAt: Date;
}

const NotificationScheduleSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    targetRole: { type: String, enum: ["all", "customer", "vendor"], default: "all" },
    time24: { type: String, required: true }, //  24hr format
    link: { type: String, default: "/home" },
    isActive: { type: Boolean, default: true },
    type: { type: String, enum: ["MEAL_REMINDER", "PROMOTIONAL", "SYSTEM"], default: "MEAL_REMINDER" },
    lastTriggeredDate: { type: String, default: "" },
  },
  { timestamps: true }
);

export const NotificationScheduleModel = mongoose.model<INotificationSchedule>(
  "NotificationSchedule",
  NotificationScheduleSchema
);
