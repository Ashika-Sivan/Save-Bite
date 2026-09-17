import { INotification } from "../../models/notification/notification.model";
import { IBaseRepository } from "./IBaseRepository";

export interface INotificationRepository extends IBaseRepository<INotification> {
    findRecent(limit: number): Promise<INotification[]>;
    findByUserId(userId: string): Promise<INotification[]>;
}
