import cron from "node-cron";
import { NotificationScheduleModel } from "../models/notification/notificationSchedule.model";
import { NotificationModel } from "../models/notification/notification.model";
import { getIO } from "../config/socket";
import { Logger } from "./logger";

const DEFAULT_SCHEDULES = [
  {
    name: "Daily Breakfast Reminder",
    title: "Breakfast is First Priority! 🥐",
    body: "Fuel up your morning with fresh surplus breakfast deals starting at ₹49!",
    targetRole: "customer",
    time24: "08:30",
    link: "/customer/live-hotels",
    isActive: true,
    type: "MEAL_REMINDER",
  },
  {
    name: "Daily Lunch Reminder",
    title: "Hungry? Lunch Time! 🍛",
    body: "Rescue delicious hotel lunch meals nearby and save up to 60% today!",
    targetRole: "customer",
    time24: "12:30",
    link: "/customer/live-hotels",
    isActive: true,
    type: "MEAL_REMINDER",
  },
  {
    name: "Evening Dinner Surplus Alert",
    title: "Don't let good food go to waste! 🍕",
    body: "Evening surplus bags are live! Grab your dinner before stock runs out.",
    targetRole: "customer",
    time24: "19:30",
    link: "/customer/live-hotels",
    isActive: true,
    type: "MEAL_REMINDER",
  },
];

export async function seedDefaultNotificationSchedules(): Promise<void> {
  try {
    const count = await NotificationScheduleModel.countDocuments();
    if (count === 0) {
      await NotificationScheduleModel.insertMany(DEFAULT_SCHEDULES);
      Logger.info("Seeded default daily meal reminder schedules.");
    }
  } catch (error) {
    Logger.error("Failed to seed default notification schedules:", error);
  }
}

export function initNotificationScheduler(): void {
  seedDefaultNotificationSchedules();


  cron.schedule("* * * * *", async () => {
    try {
    
      const now = new Date();
      const istDateStr = now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // YYYY-MM-DD
      const istTimeStr = now.toLocaleTimeString("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }); 

      const activeSchedules = await NotificationScheduleModel.find({
        isActive: true,
        time24: istTimeStr,
        lastTriggeredDate: { $ne: istDateStr },
      });

      if (activeSchedules.length === 0) return;

      for (const schedule of activeSchedules) {
        Logger.info(`Triggering automated daily reminder: "${schedule.title}" (${schedule.time24} IST)`);

        const notification = await NotificationModel.create({
          targetRole: schedule.targetRole,
          title: schedule.title,
          body: schedule.body,
          type: schedule.type,
          link: schedule.link || "/home",
          read: false,
        });

       
        schedule.lastTriggeredDate = istDateStr;
        await schedule.save();

       
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
        } catch (socketError) {
          Logger.error("Socket broadcast failed for automated notification:", socketError);
        }
      }
    } catch (error) {
      Logger.error("Error running automated notification scheduler:", error);
    }
  });

  Logger.info("Automated Notification Scheduler initialized (runs every minute).");
}
