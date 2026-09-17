import { ICreateScheduleRequestDTO, IBroadcastRequestDTO, INotificationScheduleResponseDTO, INotificationResponseDTO } from "../../../dtos/adminNotification.dto";

export interface IAdminNotificationService {
    getSchedules(): Promise<INotificationScheduleResponseDTO[]>;
    createSchedule(data: ICreateScheduleRequestDTO): Promise<INotificationScheduleResponseDTO>;
    toggleSchedule(id: string): Promise<INotificationScheduleResponseDTO>;
    deleteSchedule(id: string): Promise<void>;
  
    broadcastInstant(data: IBroadcastRequestDTO): Promise<INotificationResponseDTO>;
    getNotificationHistory(): Promise<INotificationResponseDTO[]>;
}
