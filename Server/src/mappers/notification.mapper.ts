import { INotification } from "../models/notification/notification.model";
import { INotificationSchedule } from "../models/notification/notificationSchedule.model";
import { INotificationResponseDTO, INotificationScheduleResponseDTO } from "../dtos/adminNotification.dto";

export const toNotificationResponseDTO = (notification: INotification): INotificationResponseDTO => {
    return {
        id: notification._id.toString(),
        userId: notification.userId ? notification.userId.toString() : undefined,
        targetRole: notification.targetRole,
        title: notification.title,
        body: notification.body,
        type: notification.type,
        link: notification.link,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
    };
};

export const toNotificationScheduleResponseDTO = (schedule: INotificationSchedule): INotificationScheduleResponseDTO => {
    return {
        id: schedule._id.toString(),
        name: schedule.name,
        title: schedule.title,
        body: schedule.body,
        targetRole: schedule.targetRole,
        time24: schedule.time24,
        link: schedule.link,
        isActive: schedule.isActive,
        type: schedule.type,
        lastTriggeredDate: schedule.lastTriggeredDate,
        createdAt: schedule.createdAt.toISOString(),
        updatedAt: schedule.updatedAt.toISOString(),
    };
};
