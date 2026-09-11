import { Router } from "express";
import { adminNotificationController } from "../controllers/adminNotification.controller";
import { authMiddleware } from "../config/dependencies";

const router = Router();

// Protect all routes: Admin authentication required
router.use(authMiddleware.authenticate, authMiddleware.authorize("admin"));

// Automated Schedules Management
router.get("/schedules", adminNotificationController.getSchedules.bind(adminNotificationController));
router.post("/schedules", adminNotificationController.createSchedule.bind(adminNotificationController));
router.patch("/schedules/:id/toggle", adminNotificationController.toggleSchedule.bind(adminNotificationController));
router.delete("/schedules/:id", adminNotificationController.deleteSchedule.bind(adminNotificationController));
router.post("/schedules/:id/trigger", adminNotificationController.triggerScheduleNow.bind(adminNotificationController));

// Instant One-Time Broadcast
router.post("/broadcast", adminNotificationController.broadcastInstant.bind(adminNotificationController));

// Notification History
router.get("/history", adminNotificationController.getNotificationHistory.bind(adminNotificationController));

export default router;
