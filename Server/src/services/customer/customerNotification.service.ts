import { INotificationRepository } from "../../interfaces/repository/INotificationRepository";
import { AppError } from "../../errors/AppError";
import { StatusCode } from "../../constants/statusCode";
import { INotificationResponseDTO } from "../../dtos/adminNotification.dto";
import { toNotificationResponseDTO } from "../../mappers/notification.mapper";

export class CustomerNotificationService {
    constructor(private readonly _notificationRepository: INotificationRepository) {}

    async getNotificationsForUser(userId: string): Promise<INotificationResponseDTO[]> {
        if (!userId) {
            throw new AppError("User ID is required", StatusCode.BAD_REQUEST);
        }

        const notifications = await this._notificationRepository.findByUserId(userId);
        
        return notifications.map(toNotificationResponseDTO);
    }
}
