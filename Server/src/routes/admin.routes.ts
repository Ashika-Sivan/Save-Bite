import { Router } from "express";
import { adminController, authMiddleware } from "../config/dependencies";
const router=Router();

router.get('/vendors',authMiddleware.authenticate,authMiddleware.authorize("admin"),adminController.getAllVendors.bind(adminController))
router.patch("/vendors/:vendorId/approve",authMiddleware.authenticate,authMiddleware.authorize("admin"),adminController.approveVendor.bind(adminController))
router.patch('/vendors/:vendorId/reject',authMiddleware.authenticate,authMiddleware.authorize("admin"),adminController.rejectVendor.bind(adminController))

export default router