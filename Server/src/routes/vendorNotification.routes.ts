import { Router } from "express";
import { VendorNotificationController } from "../controllers/vendorNotification.controller";
import { VendorNotificationService } from "../services/vendor/vendorNotification.service";
import { NotificationRepository } from "../repositories/notification/notification.repository";
import { authMiddleware } from "../config/dependencies";

const router = Router();

const notificationRepository = new NotificationRepository();
const vendorNotificationService = new VendorNotificationService(notificationRepository);
const vendorNotificationController = new VendorNotificationController(vendorNotificationService);

router.use(authMiddleware.authenticate, authMiddleware.authorize("vendor"));

router.get("/", vendorNotificationController.getNotifications);

export default router;
