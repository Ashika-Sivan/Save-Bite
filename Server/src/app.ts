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
import adminNotificationRoutes from "./routes/adminNotification.routes"
import reviewRoutes from "./routes/review.routes"
import adminReviewRoutes from "./routes/adminReview.routes"
import adminTransactionRoutes from "./routes/adminTransaction.routes"
import { metricsEndpoint, metricsMiddleware } from "./utils/metrics"



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
    this.app.use('/api/auth', authRoutes)
    this.app.use('/api/auth', otpRoutes)
    this.app.use("/api/vendor", vendorRoute)
    this.app.use("/api/admin/notifications", adminNotificationRoutes)
    this.app.use("/api/admin/reviews", adminReviewRoutes)
    this.app.use("/api/admin/transactions", adminTransactionRoutes)
    this.app.use("/api/admin", adminRoute)
    this.app.use("/api/customer", customerBrowseRouter)
    this.app.use("/api/orders", orderRouter)
    this.app.use("/api/concerns", concernRoutes)
    this.app.use("/api/reviews", reviewRoutes)
    
    // Prometheus metrics route
    this.app.get("/metrics", metricsEndpoint)

  }

  private errorHandler(): void {
    this.app.use(errorMiddleware)
  }

}
