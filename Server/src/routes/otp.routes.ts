import { Router } from "express";
import OtpController from "../controllers/otp.controller";
import { redisClient } from "../config/redis";
import OtpService from "../services/otp.service";
import OtpRepository from "../repositories/otp.repository";

const router=Router()
//dependency
const otpRepository=new OtpRepository(redisClient.getClient())
const otpService=new OtpService(otpRepository)
const otpController=new OtpController(otpService)
router.post('/send-otp',otpController.sendOtp)
router.post('/verify-otp',otpController.verifyOtp)
