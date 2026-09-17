import { NotificationModel, INotification } from "../../models/notification/notification.model";
import { INotificationRepository } from "../../interfaces/repository/INotificationRepository";
import { BaseRepository } from "../base.repository";

export class NotificationRepository extends BaseRepository<INotification> implements INotificationRepository {
    constructor() {
        super(NotificationModel);
    }

    async findRecent(limit: number): Promise<INotification[]> {
        return await this._model.find().sort({ createdAt: -1 }).limit(limit);
    }

    async findByUserId(userId: string): Promise<INotification[]> {
        return await this._model.find({ userId }).sort({ createdAt: -1 });
    }
}
