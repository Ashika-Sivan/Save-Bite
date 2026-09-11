import api from "./api";
import { API_ROUTES } from "../constants/apiRoutes";

export interface NotificationSchedule {
  _id: string;
  name: string;
  title: string;
  body: string;
  targetRole: "all" | "customer" | "vendor";
  time24: string; // e.g. "08:30"
  link: string;
  isActive: boolean;
  type: "MEAL_REMINDER" | "PROMOTIONAL" | "SYSTEM";
  lastTriggeredDate?: string;
  createdAt: string;
}

export interface BroadcastDTO {
  title: string;
  body: string;
  targetRole?: "all" | "customer" | "vendor";
  link?: string;
  type?: "MEAL_REMINDER" | "PROMOTIONAL" | "SYSTEM";
}

export interface CreateScheduleDTO {
  name: string;
  title: string;
  body: string;
  time24: string;
  targetRole?: "all" | "customer" | "vendor";
  link?: string;
  type?: "MEAL_REMINDER" | "PROMOTIONAL" | "SYSTEM";
}

export const getNotificationSchedules = async () => {
  const response = await api.get(API_ROUTES.ADMIN.NOTIFICATIONS_SCHEDULES);
  return response.data;
};

export const createNotificationSchedule = async (data: CreateScheduleDTO) => {
  const response = await api.post(API_ROUTES.ADMIN.NOTIFICATIONS_SCHEDULES, data);
  return response.data;
};

export const toggleNotificationSchedule = async (id: string) => {
  const response = await api.patch(`${API_ROUTES.ADMIN.NOTIFICATIONS_SCHEDULES}/${id}/toggle`);
  return response.data;
};

export const deleteNotificationSchedule = async (id: string) => {
  const response = await api.delete(`${API_ROUTES.ADMIN.NOTIFICATIONS_SCHEDULES}/${id}`);
  return response.data;
};

export const triggerScheduleNow = async (id: string) => {
  const response = await api.post(`${API_ROUTES.ADMIN.NOTIFICATIONS_SCHEDULES}/${id}/trigger`);
  return response.data;
};

export const sendBroadcastNotification = async (data: BroadcastDTO) => {
  const response = await api.post(API_ROUTES.ADMIN.NOTIFICATIONS_BROADCAST, data);
  return response.data;
};

export const getNotificationHistory = async () => {
  const response = await api.get(API_ROUTES.ADMIN.NOTIFICATIONS_HISTORY);
  return response.data;
};
