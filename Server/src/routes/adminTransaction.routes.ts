import { Router } from "express";
import { adminTransactionController, authMiddleware } from "../config/dependencies";

const router = Router();

router.use(authMiddleware.authenticate, authMiddleware.authorize("admin"));
router.get("/overview", adminTransactionController.getOverview.bind(adminTransactionController));
router.get("/vendors", adminTransactionController.getVendorBreakdown.bind(adminTransactionController));
router.get("/recent", adminTransactionController.getRecentTransactions.bind(adminTransactionController));
router.get("/refunds", adminTransactionController.getRefunds.bind(adminTransactionController));

export default router;
