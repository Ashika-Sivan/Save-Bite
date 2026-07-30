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
    STATUS: "/status",
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