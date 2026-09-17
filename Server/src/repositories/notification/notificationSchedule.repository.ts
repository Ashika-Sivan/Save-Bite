import { NotificationScheduleModel, INotificationSchedule } from "../../models/notification/notificationSchedule.model";
import { INotificationScheduleRepository } from "../../interfaces/repository/INotificationScheduleRepository";
import { BaseRepository } from "../base.repository";

export class NotificationScheduleRepository extends BaseRepository<INotificationSchedule> implements INotificationScheduleRepository {
    constructor() {
        super(NotificationScheduleModel);
    }

    async findAllSortedByDateDesc(): Promise<INotificationSchedule[]> {
        return await this._model.find().sort({ createdAt: -1 });
    }
}
