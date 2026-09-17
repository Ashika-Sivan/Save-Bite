import express from "express";
import { customerNotificationController, authMiddleware } from "../config/dependencies";

const router = express.Router();

router.use(authMiddleware.authenticate.bind(authMiddleware));

router.get("/", customerNotificationController.getNotifications);

export default router;
