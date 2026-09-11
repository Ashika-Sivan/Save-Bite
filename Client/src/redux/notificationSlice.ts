import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  link: string;
  hotelId: string;
  vendorId: string;
  read: boolean;
  createdAt: number;
}

interface NotificationState {
  notifications: NotificationItem[];
  liveHotelIds: string[];
}

const initialState: NotificationState = {
  notifications: [],
  liveHotelIds: [],
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<NotificationItem, 'id' | 'read' | 'createdAt'>>) => {
      const newNotification: NotificationItem = {
        ...action.payload,
        id: Math.random().toString(36).substring(2, 9),
        read: false,
        createdAt: Date.now(),
      };
      // Add to start of array
      state.notifications.unshift(newNotification);
      
      // Add to live hotels if not already there
      if (!state.liveHotelIds.includes(action.payload.hotelId)) {
        state.liveHotelIds.push(action.payload.hotelId);
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.read = true;
      });
    },
    removeNotificationById: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
    removeNotificationByHotelId: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.hotelId !== action.payload);
      state.liveHotelIds = state.liveHotelIds.filter((id) => id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.liveHotelIds = [];
    },
  },
});

export const { 
  addNotification, 
  markAsRead, 
  markAllAsRead, 
  removeNotificationById, 
  removeNotificationByHotelId, 
  clearNotifications 
} = notificationSlice.actions;

export default notificationSlice.reducer;
