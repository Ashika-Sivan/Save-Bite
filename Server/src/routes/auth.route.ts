import { Router } from "express";
import { authController, authMiddleware } from "../config/dependencies";
const router=Router()

router.post("/register",authController.register.bind(authController))//here we used bind to prevent losing this
router.post("/resend-otp", authController.resendOtp.bind(authController));
router.post('/verify-otp',authController.verifyOtp.bind(authController))
router.post('/login',authController.login.bind(authController))
router.post('/logout',authController.logout.bind(authController))
router.get("/me",authMiddleware.authenticate,authController.getMe.bind(authController))
router.post("/refresh",authController.refreshToken.bind(authController))
router.post("/forgot-password",authController.forgotPassword.bind(authController))
router.post('/reset-Password',authController.resetPassword.bind(authController))


export default router