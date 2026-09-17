import api from "./api";
import type { NotificationItem } from "../redux/notificationSlice";

export const CustomerNotificationService = {
  fetchNotifications: async (): Promise<NotificationItem[]> => {
    const response = await api.get("/customer/notifications");
    if (response.data?.success) {
      return response.data.data;
    }
    return [];
  },
};
