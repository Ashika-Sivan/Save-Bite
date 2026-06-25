import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { UserRepository } from "../repositories/user.repository";
import { AuthService } from "../services/auth.service";
import OtpService from "../services/otp.service";
import OtpRepository from "../repositories/otp.repository";
import EmailServce from "../services/email.service";
import { redisClient } from "../config/redis";
import { TokenService } from "../services/token.service";
import { AuthMiddleware } from "../middlewares/auth.middleware";
const router=Router()
const userRepository = new UserRepository();
const tokenService=new TokenService()

const otpRepository = new OtpRepository(redisClient.getClient());
const emailService = new EmailServce();
const otpService = new OtpService(otpRepository, emailService);

const authService = new AuthService(userRepository, otpService,tokenService);
const authController = new AuthController(authService);
const authMiddleware=new AuthMiddleware(tokenService)

router.post("/register",authController.register.bind(authController))//here we used bind to prevent losing this
router.post("/resend-otp", authController.resendOtp.bind(authController));
router.post('/verify-otp',authController.verifyOtp.bind(authController))
router.post('/login',authController.login.bind(authController))
router.post('/logout',authController.logout.bind(authController))
router.get("/me",authMiddleware.authenticate,authController.getMe.bind(authController))
router.post("/refresh",authController.refreshToken.bind(authController))

export default router