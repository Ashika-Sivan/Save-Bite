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
import { NotificationScheduleRepository } from "../repositories/notification/notificationSchedule.repository";
import { NotificationRepository } from "../repositories/notification/notification.repository";
import { AdminNotificationService } from "../services/adminNotification/adminNotification.service";
import { AdminNotificationController } from "../controllers/adminNotification.controller";
import { CustomerNotificationService } from "../services/customer/customerNotification.service";
import { CustomerNotificationController } from "../controllers/customerNotification.controller";

import { ReviewRepository } from "../repositories/review/review.repository";
import { WalletTransactionRepository } from "../repositories/wallet/walletTransaction.repository";
import { ReviewService } from "../services/review/review.service";
import { AdminReviewService } from "../services/adminReview/adminReview.service";
import { AdminTransactionService } from "../services/adminTransaction/adminTransaction.service";
import { ReviewController } from "../controllers/review.controller";
import { AdminReviewController } from "../controllers/adminReview.controller";
import { AdminTransactionController } from "../controllers/adminTransaction.controller";

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
const orderRepository = new OrderRepository();
const walletRepository = new WalletRepository();
const notificationScheduleRepository = new NotificationScheduleRepository();
const notificationRepository = new NotificationRepository();
const reviewRepository = new ReviewRepository();
const walletTransactionRepository = new WalletTransactionRepository();

const authService = new AuthService(
  userRepository,
  otpService,
  tokenService,
  passwordHasher,
  resetTokenService,
  emailService
);
const vendorService = new VendorService(vendorRepository)
const dailyMenuService=new DailyMenuService(dailyMenuRepository,hotelRepository,vendorRepository,userRepository,notificationRepository)
const adminService = new AdminService(vendorRepository, userRepository, orderRepository);
const adminNotificationService = new AdminNotificationService(notificationScheduleRepository, notificationRepository);
const reviewService = new ReviewService(reviewRepository, orderRepository, userRepository);
const adminReviewService = new AdminReviewService(reviewRepository, hotelRepository);
const adminTransactionService = new AdminTransactionService(orderRepository, hotelRepository, walletTransactionRepository);

export const authController = new AuthController(authService);
export const vendorController = new VendorController(vendorService);
export const adminController = new AdminController(adminService);
export const adminNotificationController = new AdminNotificationController(adminNotificationService);
export const reviewController = new ReviewController(reviewService);
export const adminReviewController = new AdminReviewController(adminReviewService);
export const adminTransactionController = new AdminTransactionController(adminTransactionService);
export const authMiddleware = new AuthMiddleware(tokenService);

import { WalletService } from "../services/vendor/wallet.service";
import { WalletController } from "../controllers/wallet.controller";

//daily menu
export const dailyMenuController=new DailyMenuController(dailyMenuService)


import { UserWalletService } from "../services/wallet/userWallet.service";
const userWalletService = new UserWalletService();

//order & wallet
const walletService=new WalletService(walletRepository,vendorRepository)
const orderService=new OrderService(orderRepository,dailyMenuRepository,vendorRepository,walletRepository, userWalletService)

import { ConcernRepository } from "../repositories/concern/concern.repository";
import { ConcernService } from "../services/concern/concern.service";
import { ConcernController } from "../controllers/concern.controller";

const concernRepository = new ConcernRepository();
const concernService = new ConcernService(concernRepository, orderRepository);
const customerNotificationService = new CustomerNotificationService(notificationRepository);

export const orderController = new OrderController(orderService);
export const walletController = new WalletController(walletService);
export const concernController = new ConcernController(concernService);
export const customerNotificationController = new CustomerNotificationController(customerNotificationService);