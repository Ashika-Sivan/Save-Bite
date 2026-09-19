import express, { Application } from "express"
import authRoutes from './routes/auth.route'
import otpRoutes from './routes/otp.routes'
import cors from "cors"
import cookieParser from "cookie-parser"
import vendorRoute from "./routes/vendor.route";
import { errorMiddleware } from "./middlewares/error.middleware"
import adminRoute from "./routes/admin.routes"
import customerBrowseRouter from "./routes/customerBrowse.routes"
import orderRouter from "./routes/order.routes"
import concernRoutes from "./routes/concern.routes"
import userWalletRoutes from "./routes/userWallet.routes"
import adminNotificationRoutes from "./routes/adminNotification.routes"
import customerNotificationRoutes from "./routes/customerNotification.routes"
import vendorNotificationRoutes from "./routes/vendorNotification.routes"
import reviewRoutes from "./routes/review.routes"
import adminReviewRoutes from "./routes/adminReview.routes"
import adminTransactionRoutes from "./routes/adminTransaction.routes"
import { metricsEndpoint, metricsMiddleware } from "./utils/metrics"
import { ROUTES } from "./constants/routes";



export default class App {
  public app: Application;

  constructor() {
    this.app = express()
    this.middleware()
    this.routes()
    this.errorHandler()
  }
  private middleware(): void {
    const allowedOrigins = (process.env.CLIENT_URL || "")
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);

    if (!allowedOrigins.includes("http://localhost:5173")) {
      allowedOrigins.push("http://localhost:5173");
    }
    if (!allowedOrigins.includes("http://localhost:3000")) {
      allowedOrigins.push("http://localhost:3000");
    }

    this.app.use(
      cors({
        origin: (origin, callback) => {
          if (
            !origin ||
            allowedOrigins.includes(origin) ||
            origin.endsWith(".loca.lt") ||
            origin.endsWith(".ngrok-free.app")
          ) {
            callback(null, true);
          } else {
            callback(null, true);
          }
        },
        credentials: true,
      })
    );
    this.app.use("/api/orders/webhook", express.raw({ type: "application/json" }))
    this.app.use(express.json())
    this.app.use(cookieParser());

    // Add Prometheus API tracking middleware
    this.app.use(metricsMiddleware);
  }
  private routes(): void {
    this.app.use(ROUTES.BASE.AUTH, authRoutes)
    this.app.use(ROUTES.BASE.OTP, otpRoutes)
    this.app.use(ROUTES.BASE.VENDOR, vendorRoute)
    this.app.use(ROUTES.BASE.ADMIN_NOTIFICATIONS, adminNotificationRoutes)
    this.app.use(ROUTES.BASE.ADMIN_REVIEWS, adminReviewRoutes)
    this.app.use(ROUTES.BASE.ADMIN_TRANSACTIONS, adminTransactionRoutes)
    this.app.use(ROUTES.BASE.ADMIN, adminRoute)
    this.app.use(ROUTES.BASE.CUSTOMER, customerBrowseRouter)
    this.app.use(ROUTES.BASE.CUSTOMER_NOTIFICATIONS, customerNotificationRoutes)
    this.app.use(ROUTES.BASE.VENDOR_NOTIFICATIONS, vendorNotificationRoutes)
    this.app.use(ROUTES.BASE.CUSTOMER_WALLET, userWalletRoutes)
    this.app.use(ROUTES.BASE.ORDERS, orderRouter)
    this.app.use(ROUTES.BASE.CONCERNS, concernRoutes)
    this.app.use(ROUTES.BASE.REVIEWS, reviewRoutes)
    
    // Prometheus metrics route
    this.app.get(ROUTES.BASE.METRICS, metricsEndpoint)

  }

  private errorHandler(): void {
    this.app.use(errorMiddleware)
  }

}
