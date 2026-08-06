
export const AUTH_MESSAGES = {
  REGISTER_SUCCESS: "User registered successfully",
  LOGIN_SUCCESS: "User login successful",
  LOGOUT_SUCCESS: "Logout successful",
  OTP_RESEND_SUCCESS: "OTP resent successfully",
  OTP_VERIFY_SUCCESS: "OTP verified successfully",
  EMAIL_EXISTS: "Email already exists",
  USER_NOT_FOUND: "User not found",
  INVALID_CREDENTIALS: "Invalid email or password",
  VERIFY_EMAIL_FIRST: "Please verify your email first",
  RESET_LINK_SENT: "Password reset link sent to your email",
  PASSWORD_RESET_SUCCESS: "Password reset successfully",
  INVALID_RESET_TOKEN: "Invalid or expired reset token",
  REFRESH_TOKEN_MISSING: "Refresh token is missing",
  ACCESS_TOKEN_REFRESHED: "Access token refreshed successfully",
  INVALID_REFRESH_TOKEN: "Invalid or expired refresh token",
  SOMETHING_WENT_WRONG:"something went wrong",
  INTERNAL_SERVER_ERROR:"internal server error",
  INVALID_TOKEN_FORMAT:"invalid token format",
  ACCESS_DENIED:"Access denied",
  TOKEN_MISSING:"Token missing",
  INVALID_OR_EXPIRED_TOKEN:"Invalid or expired token",

  OTP_RESENT_SUCCESS: "OTP resend successfully",
  OTP_VERIFIED_SUCCESS: "OTP verified successfully",
  INVALID_OTP:"Invalid otp",
  USER_ALREADY_VERIFIED:'user already verified',

  USER_FETCHED_SUCCESS: "User fetched successfully",
  USER_NOT_AUTHENTICATED: "User not authenticated",
  USER_EXIST:"User already exist",
  OTP_EXPIRED:"OTP Expired",
  OTP_NOT_FOUND:'otp not found',

  EMAIL_ALREADY_EXISTS: "Email already exists",
   OTP_GENERATED_SUCCESS: "OTP generated successfully",

}


export const VENDOR_MESSAGES = {
  APPLICATION_SUBMITTED: "Vendor application submitted successfully",
  APPLICATION_PENDING: "Your vendor application is already pending",
  ALREADY_APPROVED: "You are already an approved vendor",
  APPLICATION_REJECTED: "Your vendor application was rejected",
  VENDOR_NOT_FOUND: "Vendor not found",
  APPROVED_SUCCESS: "Vendor approved successfully",
  REJECTED_SUCCESS: "Vendor rejected successfully",
  STATUS_FETCHED: "Vendor status fetched successfully",
  VENDOR_FETCHED: "Vendor fetched successfully",
  VENDOR_ALREADY_APPROVED:"vendor already approved",
  ALL_FILES_REQUIRED:"all files required"
};
/*
for admin
*/

export const ADMIN_MESSAGES = {
  VENDORS_FETCHED: "Vendors fetched successfully",
  USERS_FETCHED: "Users fetched successfully",
  VENDOR_ID_REQUIRED: "Vendor ID is required",
  VALID_USER_ID_REQUIRED: "Valid user ID is required",
  USER_BLOCKED: "User blocked successfully",
  USER_UNBLOCKED: "User unblocked successfully",
  REJECTED_VENDOR_CANNOT_APPROVE:"Cannot approve for rejected vendors",
  VENDOR_APPROVE_FAILED:"vendor message failed",
  REJECTION_REASON_REQUIRED:"rejection reason required",
  VENDOR_ALREADY_REJECTED:"Vendor already rejected",
  APPROVED_VENDOR_CANNOT_REJECT: "Approved vendor cannot be rejected directly",
  USER_NOT_FOUND: "User not found",
  USER_STATUS_UPDATE_FAILED: "Failed to update user status",
  VENDOR_APPLICATION_NOT_FOUND: "Vendor application not found",
};
/*
For hotels
*/
export const HOTEL_MESSAGES = {
    CREATED: "Hotel added successfully",
    FETCHED: "Hotels fetched successfully",
    DETAILS_FETCHED: "Hotel details fetched successfully",
    NOT_FOUND: "Hotel not found",
    IMAGE_REQUIRED: "Hotel image is required",
    INVALID_DATA: "Please provide valid hotel information",
    INVALID_LOCATION: "Please provide valid latitude and longitude",
    VENDOR_NOT_FOUND: "Vendor account not found",
    VENDOR_NOT_APPROVED: "Only approved vendors can manage hotels",
};
//for menu
export const DAILY_MENU_MESSAGES = {
    CREATED: "Daily menu created successfully",
    ITEM_ADDED: "Menu item added successfully",
    GO_LIVE_SUCCESS: "Menu is now live",
    TODAY_MENU_FETCHED: "Today's menu fetched successfully",
    END_LIVE_SUCCESS:"Menu live session ended successfully",
    PICKUP_WINDOW_UPDATED:"pickup widnow has been updated successfully",
    ITEM_UPDATED:"Item updated successfully"
} as const;
  