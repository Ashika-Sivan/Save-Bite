import { Router } from "express";
import OtpController from "../controllers/otp.controller";
import { redisClient } from "../config/redis";
import OtpService from "../services/auth/otp.service";
import OtpRepository from "../repositories/user/otp.repository";
import { EmailService } from "../services/auth/email.service";
import { ROUTES } from "../constants/routes";

const router = Router();

const otpRepository = new OtpRepository(redisClient.getClient());
const emailService = new EmailService();
const otpService = new OtpService(otpRepository, emailService);
const otpController = new OtpController(otpService);

router.post(     
  ROUTES.OTP.SEND_OTP,
  otpController.sendOtp
);

router.post(
  ROUTES.OTP.VERIFY_OTP,
  otpController.verifyOtp
);

export default router;