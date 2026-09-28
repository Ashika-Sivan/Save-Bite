import { Router } from "express";
import {
  adminNotificationController,
  authMiddleware,
} from "../config/dependencies";

const router = Router();

router.use(authMiddleware.authenticate, authMiddleware.authorize("admin"));

router.get(
  "/schedules",
  adminNotificationController.getSchedules.bind(adminNotificationController),
);
router.post(
  "/schedules",
  adminNotificationController.createSchedule.bind(adminNotificationController),
);
router.patch(
  "/schedules/:id/toggle",
  adminNotificationController.toggleSchedule.bind(adminNotificationController),
);
router.delete(
  "/schedules/:id",
  adminNotificationController.deleteSchedule.bind(adminNotificationController),
);

router.post(
  "/broadcast",
  adminNotificationController.broadcastInstant.bind(
    adminNotificationController,
  ),
);

router.get(
  "/history",
  adminNotificationController.getNotificationHistory.bind(
    adminNotificationController,
  ),
);

export default router;
