import { UserRepository } from "../repositories/user/user.repository";
import OtpRepository from "../repositories/user/otp.repository";
import { VendorRepository } from "../repositories/vendor/vendor.repository";

import { AuthService } from "../services/auth/auth.service";
import OtpService from "../services/auth/otp.service";
import EmailServce from "../services/auth/email.service";
import { TokenService } from "../services/auth/token.service";
import { VendorService } from "../services/vendor/vendor.service";

import { AuthController } from "../controllers/auth.controller";
import { VendorController } from "../controllers/vendor.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

import { redisClient } from "./redis";

const userRepository = new UserRepository();
const tokenService = new TokenService();
const otpRepository = new OtpRepository(redisClient.getClient());
const emailService = new EmailServce();
const otpService = new OtpService(otpRepository, emailService);
const vendorRepository = new VendorRepository();
const authService = new AuthService(userRepository, otpService, tokenService);
const vendorService = new VendorService(vendorRepository);
export const authController = new AuthController(authService);
export const vendorController = new VendorController(vendorService);
export const authMiddleware = new AuthMiddleware(tokenService);