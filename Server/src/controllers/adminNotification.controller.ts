import { Request, Response, NextFunction } from "express";
import { IAdminNotificationService } from "../interfaces/service/adminNotification/IAdminNotificationService";
import { ResponseHelper } from "../utils/ResponseHelper";
import { StatusCode } from "../constants/statusCode";
import { ADMIN_MESSAGES } from "../constants/messages";
import { ICreateScheduleRequestDTO, IBroadcastRequestDTO } from "../dtos/adminNotification.dto";
import { catchAsync } from "../utils/catchAsync";

export class AdminNotificationController {
    constructor(private _adminNotificationService: IAdminNotificationService) { }

    getSchedules = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const schedules = await this._adminNotificationService.getSchedules();
        ResponseHelper.success(res, StatusCode.OK, ADMIN_MESSAGES.SCHEDULES_FETCHED_SUCCESS, schedules);
    });


    createSchedule = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const data: ICreateScheduleRequestDTO = req.body;
        const schedule = await this._adminNotificationService.createSchedule(data);
        ResponseHelper.success(res, StatusCode.CREATED, ADMIN_MESSAGES.SCHEDULES_CREATED_SUCCESS, schedule);
    });


    toggleSchedule = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const id = req.params.id as string;
        const schedule = await this._adminNotificationService.toggleSchedule(id);
        ResponseHelper.success(res, StatusCode.OK, `Schedule ${schedule.isActive ? "enabled" : "disabled"}`, schedule);
    });


    deleteSchedule = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const id = req.params.id as string;
        await this._adminNotificationService.deleteSchedule(id);
        ResponseHelper.success(res, StatusCode.OK, "Schedule deleted successfully");
    });


    broadcastInstant = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const data: IBroadcastRequestDTO = req.body;
        const notification = await this._adminNotificationService.broadcastInstant(data);
        ResponseHelper.success(res, StatusCode.CREATED, ADMIN_MESSAGES.BRODCAST_SUCCESSFULL, notification);
    });


    getNotificationHistory = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const notifications = await this._adminNotificationService.getNotificationHistory();
        ResponseHelper.success(res, StatusCode.OK, ADMIN_MESSAGES.HISTORY_FETCH_SUCCESS, notifications);
    });
}
