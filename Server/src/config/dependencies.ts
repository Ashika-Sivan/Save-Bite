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
import { HotelRepository } from "../repositories/hotel/hotel.repository";
import { DailyMenuRepository } from "../repositories/dailyMenu/dailyMenu.repository";
import { DailyMenuService } from "../services/vendor/dailyMenu.service";
import { DailyMenuController } from "../controllers/dailyMenu.controller";
import { OrderRepository } from "../repositories/order/order.repository";
import { WalletRepository } from "../repositories/wallet/wallet.repository";
import { OrderService } from "../services/customer/order.service";
import { OrderController } from "../controllers/order.controller";

const userRepository = new UserRepository();
const tokenService = new TokenService();
const otpRepository = new OtpRepository(redisClient.getClient());
const emailService = new EmailService();
const otpService = new OtpService(otpRepository, emailService);
const vendorRepository = new VendorRepository();
const hotelRepository=new HotelRepository()
const dailyMenuRepository=new DailyMenuRepository()
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
const vendorService = new VendorService(vendorRepository)
const dailyMenuService=new DailyMenuService(dailyMenuRepository,hotelRepository,vendorRepository)
const adminService = new AdminService(vendorRepository, userRepository);

export const authController = new AuthController(authService);
export const vendorController = new VendorController(vendorService);
export const adminController = new AdminController(adminService);
export const authMiddleware = new AuthMiddleware(tokenService);

import { WalletService } from "../services/vendor/wallet.service";
import { WalletController } from "../controllers/wallet.controller";

//daily menu
export const dailyMenuController=new DailyMenuController(dailyMenuService)


//order & wallet
const orderRepository=new OrderRepository()
const walletRepository=new WalletRepository()
const walletService=new WalletService(walletRepository,vendorRepository)
const orderService=new OrderService(orderRepository,dailyMenuRepository,vendorRepository,walletRepository)

import { ConcernRepository } from "../repositories/concern/concern.repository";
import { ConcernService } from "../services/concern/concern.service";
import { ConcernController } from "../controllers/concern.controller";

const concernRepository = new ConcernRepository();
const concernService = new ConcernService(concernRepository, orderRepository);

export const orderController = new OrderController(orderService);
export const walletController = new WalletController(walletService);
export const concernController = new ConcernController(concernService);