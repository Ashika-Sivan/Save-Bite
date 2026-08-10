export const ROUTES = {
  AUTH: {
    REGISTER: "/register",
    LOGIN: "/login",
    LOGOUT: "/logout",
    VERIFY_OTP: "/verify-otp",
    RESEND_OTP: "/resend-otp",
    REFRESH_TOKEN: "/refresh",
    GET_ME: "/me",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
  },

  OTP: {
    SEND_OTP: "/send-otp",
    VERIFY_OTP: "/verify-otp",
  },

  VENDOR: {
    REGISTER: "/register",
    REAPPLY: "/reapply",
    STATUS: "/status",
    CREATE_DAILY_MENU: "/hotels/:hotelId/daily-menu",
     ADD_DAILY_MENU_ITEM: "/daily-menus/:menuId/items",
      GO_LIVE:"/daily-menus/:menuId/go-live",
      GET_TODAY_MENU:"/hotels/:hotelId/daily-menu/today",
      END_LIVE:"/daily-menus/:menuId/end-live",
    UPDATE_PICKUP_WINDOW: "/daily-menus/:menuId/pickup-window",
    UPDATE_DAILY_MENU_ITEM:"/daily-menus/:menuId/items/:itemId",
    USE_PREVIOUS_MENU:"/daily-menus/:menuId/use-previous-menu"
  },
  ADMIN: {
    VENDORS: "/vendors",
    VENDOR_APPROVE: "/vendors/:vendorId/approve",
    VENDOR_REJECT: "/vendors/:vendorId/reject",
    VENDOR_BY_ID: "/vendors/:vendorId",
    USERS: "/users",
    USER_STATUS: "/users/:userId/status",
  },
};