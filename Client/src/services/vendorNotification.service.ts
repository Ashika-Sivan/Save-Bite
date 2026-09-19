import api from "./api";
import type { NotificationItem } from "../redux/notificationSlice";

export const VendorNotificationService = {
  fetchNotifications: async (): Promise<NotificationItem[]> => {
    const response = await api.get("/vendor/notifications");
    if (response.data?.success) {
      return response.data.data;
    }
    return [];
  },
};
