import cron from "node-cron";
import { OrderService } from "../services/customer/order.service";
import { OrderRepository } from "../repositories/order/order.repository";
import { DailyMenuRepository } from "../repositories/dailyMenu/dailyMenu.repository";
import { Logger } from "../utils/logger";

// Instantiate the service (ideally this comes from a DI container in a larger app, 
// but we'll instantiate it here for the job scope based on existing patterns)
const orderRepository = new OrderRepository();
const dailyMenuRepository = new DailyMenuRepository();
const orderService = new OrderService(orderRepository, dailyMenuRepository);

/**
 * Initializes the background schedulers.
 */
export const initSchedulers = () => {
    // Run at the top of every hour: "0 * * * *"
    // For testing purposes, you could change this to "* * * * *" (every minute)
    cron.schedule("0 * * * *", async () => {
        Logger.info("Running Auto-Refund Scheduler...");
        try {
            const refundedCount = await orderService.processAutoRefunds();
            if (refundedCount > 0) {
                Logger.info(`Auto-Refund Scheduler completed. Processed ${refundedCount} no-show refunds.`);
            }
        } catch (error) {
            Logger.error("Failed to run Auto-Refund Scheduler", error);
        }
    });

    Logger.info("Auto-Refund Scheduler initialized.");
};
