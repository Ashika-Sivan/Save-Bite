import { TokenService } from "../services/auth/token.service";
import { VendorService } from "../services/vendor/vendor.service";
import { AdminService } from "../services/admin/admin.service";

import { AuthController } from "../controllers/auth.controller";
import { VendorController } from "../controllers/vendor.controller";
import { AdminController } from "../controllers/admin.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

import { redisClient } from "./redis";
import { BcryptPasswordHasher } from "../services/auth/bcryptPasswordHasher";
import { RedisPasswordResetTokenService } from "../services/auth/redisPasswordResetToken.service";
import { UserRepository } from "../repositories/user/user.repository";
import OtpRepository from "../repositories/user/otp.repository";
import { EmailService } from "../services/auth/email.service";
import OtpService from "../services/auth/otp.service";
import { VendorRepository } from "../repositories/vendor/vendor.repository";
import { AuthService } from "../services/auth/auth.service";

const userRepository = new UserRepository();
const tokenService = new TokenService();
const otpRepository = new OtpRepository(redisClient.getClient());
const emailService = new EmailService();
const otpService = new OtpService(otpRepository, emailService);
const vendorRepository = new VendorRepository();
const passwordHasher = new BcryptPasswordHasher();
const resetTokenService = new RedisPasswordResetTokenService();

const authService = new AuthService(
  userRepository,
  otpService,
  tokenService,
  passwordHasher,
  resetTokenService,
  emailService
);

const vendorService = new VendorService(vendorRepository);
const adminService = new AdminService(vendorRepository, userRepository);

export const authController = new AuthController(authService);
export const vendorController = new VendorController(vendorService);
export const adminController = new AdminController(adminService);
export const authMiddleware = new AuthMiddleware(tokenService);