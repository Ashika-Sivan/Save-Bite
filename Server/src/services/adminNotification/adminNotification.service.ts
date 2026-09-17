import { IAdminNotificationService } from "../../interfaces/service/adminNotification/IAdminNotificationService";
import { INotificationScheduleRepository } from "../../interfaces/repository/INotificationScheduleRepository";
import { INotificationRepository } from "../../interfaces/repository/INotificationRepository";
import { INotificationSchedule } from "../../models/notification/notificationSchedule.model";
import { INotification } from "../../models/notification/notification.model";
import { ICreateScheduleRequestDTO, IBroadcastRequestDTO, INotificationResponseDTO, INotificationScheduleResponseDTO } from "../../dtos/adminNotification.dto";
import { toNotificationResponseDTO, toNotificationScheduleResponseDTO } from "../../mappers/notification.mapper";
import { AppError } from "../../errors/AppError";
import { StatusCode } from "../../constants/statusCode";
import { ADMIN_MESSAGES } from "../../constants/messages";
import { getIO } from "../../config/socket";

export class AdminNotificationService implements IAdminNotificationService {
    constructor(
        private _scheduleRepository: INotificationScheduleRepository,
        private _notificationRepository: INotificationRepository
    ) { }

    async getSchedules(): Promise<INotificationScheduleResponseDTO[]> {
        const schedules = await this._scheduleRepository.findAllSortedByDateDesc();
        return schedules.map(toNotificationScheduleResponseDTO);
    }

    async createSchedule(data: ICreateScheduleRequestDTO): Promise<INotificationScheduleResponseDTO> {
        if (!data.name || !data.title || !data.body || !data.time24) {
            throw new AppError(ADMIN_MESSAGES.DATA_MISSING, StatusCode.BAD_REQUEST);
        }

        const scheduleData = {
            name: data.name,
            title: data.title,
            body: data.body,
            time24: data.time24,
            targetRole: data.targetRole || "customer",
            link: data.link || "/home",
            type: data.type || "MEAL_REMINDER",
            isActive: true,
        };

        const created = await this._scheduleRepository.create(scheduleData);
        return toNotificationScheduleResponseDTO(created);
    }

    async toggleSchedule(id: string): Promise<INotificationScheduleResponseDTO> {
        const schedule = await this._scheduleRepository.findById(id);

        if (!schedule) {
            throw new AppError(ADMIN_MESSAGES.SCHEDULES_NOTFOUND, StatusCode.NOT_FOUND);
        }

        const updated = await this._scheduleRepository.updateById(id, { isActive: !schedule.isActive });
        return toNotificationScheduleResponseDTO(updated as INotificationSchedule);
    }

    async deleteSchedule(id: string): Promise<void> {
        const schedule = await this._scheduleRepository.deleteById(id);

        if (!schedule) {
            throw new AppError(ADMIN_MESSAGES.SCHEDULES_NOTFOUND, StatusCode.NOT_FOUND);
        }
    }



    async broadcastInstant(data: IBroadcastRequestDTO): Promise<INotificationResponseDTO> {
        if (!data.title || !data.body) {
            throw new AppError(ADMIN_MESSAGES.DATA_MISSING, StatusCode.BAD_REQUEST);
        }

        const notificationData = {
            targetRole: data.targetRole || "all",
            title: data.title,
            body: data.body,
            type: data.type || "PROMOTIONAL",
            link: data.link || "/home",
            read: false,
        };

        const notification = await this._notificationRepository.create(notificationData);
        this.emitNotificationBroadcast(notification);

        return toNotificationResponseDTO(notification);
    }

    async getNotificationHistory(): Promise<INotificationResponseDTO[]> {
        const history = await this._notificationRepository.findRecent(50);
        return history.map(toNotificationResponseDTO);
    }

    private emitNotificationBroadcast(notification: INotification): void {
        try {
            const io = getIO();
            io.emit("broadcast_notification", {
                id: notification._id.toString(),
                title: notification.title,
                body: notification.body,
                link: notification.link,
                type: notification.type,
                targetRole: notification.targetRole,
                createdAt: notification.createdAt,
            });
        } catch (err) {
            console.error("Socket error on instant trigger:", err);
        }
    }
}
