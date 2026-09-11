import { Request, Response, NextFunction } from "express";
import { NotificationScheduleModel } from "../models/notification/notificationSchedule.model";
import { NotificationModel } from "../models/notification/notification.model";
import { getIO } from "../config/socket";
import { ResponseHelper } from "../utils/ResponseHelper";
import { StatusCode } from "../constants/statusCode";
import { AppError } from "../errors/AppError";

export class AdminNotificationController {
  // Get all automated notification schedules
  async getSchedules(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schedules = await NotificationScheduleModel.find().sort({ createdAt: -1 });
      ResponseHelper.success(res, StatusCode.OK, "Schedules fetched successfully", schedules);
    } catch (error) {
      next(error);
    }
  }

  // Create a new automated daily notification schedule
  async createSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, title, body, time24, targetRole, link, type } = req.body;

      if (!name || !title || !body || !time24) {
        throw new AppError("Name, title, body, and time24 are required", StatusCode.BAD_REQUEST);
      }

      const schedule = await NotificationScheduleModel.create({
        name,
        title,
        body,
        time24, // e.g. "08:30"
        targetRole: targetRole || "customer",
        link: link || "/home",
        type: type || "MEAL_REMINDER",
        isActive: true,
      });

      ResponseHelper.success(res, StatusCode.CREATED, "Schedule created successfully", schedule);
    } catch (error) {
      next(error);
    }
  }

  // Toggle active status of a schedule
  async toggleSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const schedule = await NotificationScheduleModel.findById(id);

      if (!schedule) {
        throw new AppError("Schedule not found", StatusCode.NOT_FOUND);
      }

      schedule.isActive = !schedule.isActive;
      await schedule.save();

      ResponseHelper.success(res, StatusCode.OK, `Schedule ${schedule.isActive ? "enabled" : "disabled"}`, schedule);
    } catch (error) {
      next(error);
    }
  }

  // Delete a schedule
  async deleteSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const schedule = await NotificationScheduleModel.findByIdAndDelete(id);

      if (!schedule) {
        throw new AppError("Schedule not found", StatusCode.NOT_FOUND);
      }

      ResponseHelper.success(res, StatusCode.OK, "Schedule deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  // Instant Test Trigger for an automated schedule
  async triggerScheduleNow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const schedule = await NotificationScheduleModel.findById(id);

      if (!schedule) {
        throw new AppError("Schedule not found", StatusCode.NOT_FOUND);
      }

      const notification = await NotificationModel.create({
        targetRole: schedule.targetRole,
        title: schedule.title,
        body: schedule.body,
        type: schedule.type,
        link: schedule.link || "/home",
        read: false,
      });

      try {
        const io = getIO();
        io.emit("broadcast_notification", {
          id: notification._id.toString(),
          title: notification.title,
          body: notification.body,
          link: notification.link,
          type: notification.type,
          createdAt: notification.createdAt,
        });

        io.emit("business_live", {
          hotelId: "system",
          hotelName: "SaveBite Meal Alert",
          title: notification.title,
          body: notification.body,
        });
      } catch (err) {
        console.error("Socket error on instant trigger:", err);
      }

      ResponseHelper.success(res, StatusCode.OK, "Automated reminder triggered live to all users", notification);
    } catch (error) {
      next(error);
    }
  }

  // Manual one-time broadcast notification
  async broadcastInstant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, body, targetRole, link, type } = req.body;

      if (!title || !body) {
        throw new AppError("Title and body are required", StatusCode.BAD_REQUEST);
      }

      const notification = await NotificationModel.create({
        targetRole: targetRole || "all",
        title,
        body,
        type: type || "PROMOTIONAL",
        link: link || "/home",
        read: false,
      });

      try {
        const io = getIO();
        io.emit("broadcast_notification", {
          id: notification._id.toString(),
          title: notification.title,
          body: notification.body,
          link: notification.link,
          type: notification.type,
          createdAt: notification.createdAt,
        });

        io.emit("business_live", {
          hotelId: "system",
          hotelName: "SaveBite Alert",
          title: notification.title,
          body: notification.body,
        });
      } catch (err) {
        console.error("Socket error on broadcast:", err);
      }

      ResponseHelper.success(res, StatusCode.CREATED, "Broadcast notification sent successfully", notification);
    } catch (error) {
      next(error);
    }
  }

  // Get recent notification history
  async getNotificationHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notifications = await NotificationModel.find().sort({ createdAt: -1 }).limit(50);
      ResponseHelper.success(res, StatusCode.OK, "History fetched successfully", notifications);
    } catch (error) {
      next(error);
    }
  }
}

export const adminNotificationController = new AdminNotificationController();
