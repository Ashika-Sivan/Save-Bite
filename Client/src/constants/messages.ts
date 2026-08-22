// Central registry of all user-facing notification messages, toast alerts, and system prompts used across the client application.

export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: "Login successful!",
  LOGOUT_SUCCESS: "Logged out successfully",
  LOGOUT_FAILED: "Logout failed. Please try again.",
  REGISTER_SUCCESS: "Registration successful!",
  OTP_SENT: "OTP sent successfully to your email",
  OTP_VERIFIED: "OTP verified successfully!",
  PASSWORD_RESET_SUCCESS: "Password reset successfully!",
  FORGOT_PASSWORD_SENT: "Password reset link sent to your email",
  PLEASE_LOGIN: "Please log in to continue",
} as const;

export const CART_MESSAGES = {
  ITEM_ADDED: (name: string) => `Added ${name} to cart`,
  ITEM_REMOVED: "Item removed from cart",
  CART_CLEARED: "Cart cleared successfully",
  CART_EMPTY: "Your cart is empty",
  MUST_LOGIN_TO_CART: "Please log in to add items to your cart",
  ORDERING_CLOSED: "The ordering cutoff for this menu has passed.",
  REPLACE_CART_TITLE: "Replace current cart?",
  REPLACE_CART_DESC: (name: string) => `Your cart contains food from another restaurant. Clear it and add food from ${name}?`,
} as const;

export const VENDOR_MESSAGES = {
  APPLICATION_SUBMITTED: "Vendor application submitted successfully",
  REAPPLY_SUBMITTED: "Vendor re-application submitted successfully",
  PREFILLED_ALERT: "Previous application details prefilled automatically!",
  LOCATION_SUCCESS: "Location set successfully",
  LOCATION_DENIED: "Please allow location access",
  HOTEL_ADDED: "Hotel added successfully",
  MENU_SAVED: "Menu saved successfully",
  MENU_LIVE: "Menu is now live!",
  MENU_END_LIVE: "Live menu session ended",
} as const;

export const ADMIN_MESSAGES = {
  VENDOR_APPROVED: "Vendor approved successfully",
  VENDOR_REJECTED: "Vendor rejected successfully",
  REJECTION_REASON_REQUIRED: "Please enter rejection reason",
  USER_STATUS_UPDATED: "User status updated successfully",
} as const;

export const ORDER_MESSAGES = {
  ORDER_PLACED: "Order placed successfully!",
  PAYMENT_VERIFIED: "Payment verified successfully!",
  PAYMENT_PENDING: "Payment confirmation pending...",
  PAYMENT_FAILED: "Payment failed. Please try again.",
  FETCH_FAILED: "Unable to load orders",
} as const;
