import { Router } from "express";
import { adminTransactionController, authMiddleware } from "../config/dependencies";

const router = Router();

// Protect all admin transaction routes
router.use(authMiddleware.authenticate, authMiddleware.authorize("admin"));

// Financial Overview (Total Sales, Admin Commission, Vendor Payouts, Transaction Count)
router.get("/overview", adminTransactionController.getOverview.bind(adminTransactionController));

// Vendor Financial Breakdown (Amount Received Per Vendor)
router.get("/vendors", adminTransactionController.getVendorBreakdown.bind(adminTransactionController));

// Recent Transactions Ledger
router.get("/recent", adminTransactionController.getRecentTransactions.bind(adminTransactionController));

// Refund Reports
router.get("/refunds", adminTransactionController.getRefunds.bind(adminTransactionController));

export default router;
