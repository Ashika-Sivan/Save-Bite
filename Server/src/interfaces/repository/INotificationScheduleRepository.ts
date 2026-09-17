import { INotificationSchedule } from "../../models/notification/notificationSchedule.model";
import { IBaseRepository } from "./IBaseRepository";

export interface INotificationScheduleRepository extends IBaseRepository<INotificationSchedule> {
    findAllSortedByDateDesc(): Promise<INotificationSchedule[]>;
}
