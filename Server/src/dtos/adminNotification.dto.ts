export interface ICreateScheduleRequestDTO {
  name: string;
  title: string;
  body: string;
  targetRole?: "all" | "customer" | "vendor";
  time24: string;
  link?: string;
  type?: "MEAL_REMINDER" | "PROMOTIONAL" | "SYSTEM";
}

export interface IBroadcastRequestDTO {
  title: string;
  body: string;
  targetRole?: "all" | "customer" | "vendor";
  link?: string;
  type?: "MEAL_REMINDER" | "PROMOTIONAL" | "SYSTEM";
}

export interface INotificationScheduleResponseDTO {
  id: string;
  name: string;
  title: string;
  body: string;
  targetRole: "all" | "customer" | "vendor";
  time24: string;
  link: string;
  isActive: boolean;
  type: "MEAL_REMINDER" | "PROMOTIONAL" | "SYSTEM";
  lastTriggeredDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface INotificationResponseDTO {
  id: string;
  userId?: string;
  targetRole: "all" | "customer" | "vendor";
  title: string;
  body: string;
  type: "MEAL_REMINDER" | "PROMOTIONAL" | "SYSTEM" | "ORDER_STATUS";
  link?: string;
  read: boolean;
  createdAt: string;
}
