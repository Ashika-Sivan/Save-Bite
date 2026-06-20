import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { UserRepository } from "../repositories/user.repository";
import { AuthService } from "../services/auth.service";
import OtpService from "../services/otp.service";
import OtpRepository from "../repositories/otp.repository";
import EmailServce from "../services/email.service";
import { redisClient } from "../config/redis";
const router=Router()
const userRepository = new UserRepository();

const otpRepository = new OtpRepository(redisClient.getClient());
const emailService = new EmailServce();
const otpService = new OtpService(otpRepository, emailService);

const authService = new AuthService(userRepository, otpService);
const authController = new AuthController(authService);

router.post("/register",authController.register.bind(authController))//here we used bind to prevent losing this
router.post("/resend-otp", authController.resendOtp.bind(authController));
router.post('/verify-otp',authController.verifyOtp.bind(authController))

export default router