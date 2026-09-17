import { Request, Response } from "express";
import { CustomerNotificationService } from "../services/customer/customerNotification.service";
import { StatusCode } from "../constants/statusCode";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../errors/AppError";
import { AuthRequest } from "../types/authRequest";

export class CustomerNotificationController {
    constructor(private readonly _notificationService: CustomerNotificationService) {}

    getNotifications = catchAsync(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        
        if (!userId) {
            throw new AppError("Unauthorized access", StatusCode.UNAUTHORIZED);
        }

        const notifications = await this._notificationService.getNotificationsForUser(userId);

        res.status(StatusCode.OK).json({
            success: true,
            message: "Notifications fetched successfully",
            data: notifications,
        });
    });
}
