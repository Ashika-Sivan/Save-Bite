import { Router } from "express";
import { authController, authMiddleware } from "../config/dependencies";
import { ROUTES } from "../constants/routes";

const router = Router();

router.post(
  ROUTES.AUTH.REGISTER,
  authController.register.bind(authController)
);

router.post(
  ROUTES.AUTH.RESEND_OTP,
  authController.resendOtp.bind(authController)
);

router.post(
  ROUTES.AUTH.VERIFY_OTP,
  authController.verifyOtp.bind(authController)
);

router.post(
  ROUTES.AUTH.LOGIN,
  authController.login.bind(authController)
);

router.post(
  ROUTES.AUTH.LOGOUT,
  authController.logout.bind(authController)
);

router.get(
  ROUTES.AUTH.GET_ME,
  authMiddleware.authenticate,
  authController.getMe.bind(authController)
);

router.post(
  ROUTES.AUTH.REFRESH_TOKEN,
  authController.refreshToken.bind(authController)
);

router.post(
  ROUTES.AUTH.FORGOT_PASSWORD,
  authController.forgotPassword.bind(authController)
);

router.post(
  ROUTES.AUTH.RESET_PASSWORD,
  authController.resetPassword.bind(authController)
);

export default router;