import { Router } from "express";
import { adminController, authMiddleware } from "../config/dependencies";
const router=Router();

router.get('/vendors',authMiddleware.authenticate,authMiddleware.authorize("admin"),adminController.getAllVendors.bind(adminController))
router.patch("/vendors/:vendorId/approve",authMiddleware.authenticate,authMiddleware.authorize("admin"),adminController.approveVendor.bind(adminController))
router.patch('/vendors/:vendorId/reject',authMiddleware.authenticate,authMiddleware.authorize("admin"),adminController.rejectVendor.bind(adminController))
//user list
router.get('/users',authMiddleware.authenticate,authMiddleware.authorize("admin"),adminController.getAllUsers.bind(adminController))
router.patch("/users/:userId/status",authMiddleware.authenticate,authMiddleware.authorize("admin"),adminController.toggleUserStatus.bind(adminController))
router.get("/vendors/:vendorId",authMiddleware.authenticate,authMiddleware.authorize("admin"),adminController.getVendorById.bind(adminController))

export default router