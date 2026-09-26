import cron from "node-cron";
import { OrderService } from "../services/customer/order.service";
import { OrderRepository } from "../repositories/order/order.repository";
import { DailyMenuRepository } from "../repositories/dailyMenu/dailyMenu.repository";
import { Logger } from "../utils/logger";

const orderRepository = new OrderRepository();
const dailyMenuRepository = new DailyMenuRepository();
const orderService = new OrderService(orderRepository, dailyMenuRepository);

/**
 * Initializes the background schedulers.
 */
export const initSchedulers = () => {
    // run at  every hour: "0 * * * *"

    cron.schedule("0 * * * *", async () => {
        Logger.info("Running Auto-Refund Scheduler...");
        try {
            const refundedCount = await orderService.processAutoRefunds();//check in order service
            if (refundedCount > 0) {
                Logger.info(`Auto-Refund Scheduler completed. Processed ${refundedCount} no-show refunds.`);
            }
        } catch (error) {
            Logger.error("Failed to run Auto-Refund Scheduler", error);
        }
    });

    Logger.info("Auto-Refund Scheduler initialized.");
};
