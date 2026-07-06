import { Router } from "express";
import OtpController from "../controllers/otp.controller";
import { redisClient } from "../config/redis";
import OtpService from "../services/auth/otp.service";
import OtpRepository from "../repositories/user/otp.repository";
import EmailServce from "../services/auth/email.service"

const router=Router()
//dependency
const otpRepository=new OtpRepository(redisClient.getClient())
const emailService=new EmailServce()
const otpService=new OtpService(otpRepository,emailService)
const otpController=new OtpController(otpService)
router.post('/send-otp',otpController.sendOtp)
router.post('/verify-otp',otpController.verifyOtp)


export default router;