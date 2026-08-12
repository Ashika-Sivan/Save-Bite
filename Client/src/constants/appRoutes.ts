// Central registry of all UI page navigation routes used across the client application.

export const APP_ROUTES = {
  PUBLIC: {
    HOME: "/",
    LOGIN: "/login",
    SIGNUP: "/signup",
    OTP: "/otp",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
  },

  CUSTOMER: {
    HOME: "/home",
    LIVE_MENU: (hotelId: string) => `/customer/restaurants/${hotelId}/menu`,
    CART: "/cart",
    CHECKOUT:"/checkout",
    PAYMENT_SUCCESS:"/payment-success",
    MY_ORDERS: "/orders"
  },

  VENDOR: {
    REGISTER: "/vendor/register",
    REAPPLY: "/vendor/reapply",
    PENDING: "/vendor/pending",
    REJECTED: "/vendor/rejected",
    DASHBOARD: "/vendor/dashboard",
    HOTELS: "/vendor/hotels",
    ADD_HOTEL: "/vendor/hotels/add",
    HOTEL_MENU: (hotelId: string) => `/vendor/hotels/${hotelId}/menu`,
  },

  ADMIN: {
    LOGIN: "/admin/login",
    DASHBOARD: "/admin/dashboard",
    USER_LIST: "/admin/userList",
    VENDOR_LIST: "/admin/vendorList",
    VENDOR_DETAILS: (vendorId: string) => `/admin/vendors/${vendorId}`,
  },
} as const;
