import { Request, Response } from "express";
import { VendorNotificationService } from "../services/vendor/vendorNotification.service";
import { StatusCode } from "../constants/statusCode";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../errors/AppError";
import { AuthRequest } from "../types/authRequest";

export class VendorNotificationController {
    constructor(private readonly _notificationService: VendorNotificationService) {}

    getNotifications = catchAsync(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        
        if (!userId) {
            throw new AppError("Unauthorized access", StatusCode.UNAUTHORIZED);
        }

        const notifications = await this._notificationService.getNotificationsForVendor(userId);

        res.status(StatusCode.OK).json({
            success: true,
            message: "Notifications fetched successfully",
            data: notifications,
        });
    });
}
