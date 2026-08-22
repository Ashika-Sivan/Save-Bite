// Central registry of all API route strings used across the client services.
// Keeping routes here prevents magic strings scattered across service files.

export const API_ROUTES = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    SEND_OTP: "/auth/send-otp",
    VERIFY_OTP: "/auth/verify-otp",
    RESEND_OTP: "/auth/resend-otp",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },

  VENDOR: {
    REGISTER: "/vendor/register",
    REAPPLY: "/vendor/reapply",
    STATUS: "/vendor/status",
    HOTELS: "/vendor/hotels",
    HOTEL_BY_ID: (hotelId: string) => `/vendor/hotels/${hotelId}`,
    GET_TODAY_MENU: (hotelId: string) => `/vendor/hotels/${hotelId}/daily-menu/today`,
    CREATE_DAILY_MENU: (hotelId: string) => `/vendor/hotels/${hotelId}/daily-menu`,
    ADD_DAILY_MENU_ITEM: (menuId: string) => `/vendor/daily-menus/${menuId}/items`,
    UPDATE_PICKUP_WINDOW: (menuId: string) => `/vendor/daily-menus/${menuId}/pickup-window`,
    GO_LIVE: (menuId: string) => `/vendor/daily-menus/${menuId}/go-live`,
    END_LIVE: (menuId: string) => `/vendor/daily-menus/${menuId}/end-live`,
    UPDATE_DAILY_MENU_ITEM: (menuId: string, itemId: string) => `/vendor/daily-menus/${menuId}/items/${itemId}`,
    USE_PREVIOUS_MENU:(menuId:string)=>`/vendor/daily-menus/${menuId}/use-previous-menu`,
    WALLET: "/vendor/wallet",
  },

  CUSTOMER: {
    LIVE_HOTELS: "/customer/live-hotels",
    LIVE_HOTEL_MENU: (hotelId: string) => `/customer/live-hotels/${hotelId}/menu`,
   
  },

  ADMIN: {
    VENDORS: "/admin/vendors",
    VENDOR_BY_ID: (vendorId: string) => `/admin/vendors/${vendorId}`,
    VENDOR_APPROVE: (vendorId: string) => `/admin/vendors/${vendorId}/approve`,
    VENDOR_REJECT: (vendorId: string) => `/admin/vendors/${vendorId}/reject`,
    USERS: "/admin/users",
    USER_STATUS: (userId: string) => `/admin/users/${userId}/status`,
  },
  ORDER:{
    CREATE_CHECKOUT:"/orders/checkout",
    GET_ORDER_BY_ID:(orderId:string)=>`/orders/${orderId}`,
    GET_MY_ORDERS:"/orders/my-orders",
    VERIFY_PAYMENT:(orderId:string)=>`/orders/${orderId}/verify-payment`,
    VENDOR_ORDERS: "/orders/vendor-orders",
    REDEEM_PICKUP_CODE: "/orders/redeem-pickup-code",
  },
  CONCERN: {
    RAISE: (orderId: string) => `/concerns/orders/${orderId}/concern`,
    ADMIN_LIST: "/concerns/admin/concerns",
    ADMIN_BY_ID: (concernId: string) => `/concerns/admin/concerns/${concernId}`,
    ADMIN_APPROVE: (concernId: string) => `/concerns/admin/concerns/${concernId}/approve`,
    ADMIN_REJECT: (concernId: string) => `/concerns/admin/concerns/${concernId}/reject`,
  },
} as const;
