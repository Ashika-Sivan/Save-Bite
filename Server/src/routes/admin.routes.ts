import { Router } from "express";
import { adminController, authMiddleware } from "../config/dependencies";
import { ROUTES } from "../constants/routes";

const router = Router();

router.get(
  ROUTES.ADMIN.VENDORS,
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  adminController.getAllVendors.bind(adminController)
);

router.patch(
  ROUTES.ADMIN.VENDOR_APPROVE,
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  adminController.approveVendor.bind(adminController)
);

router.patch(
  ROUTES.ADMIN.VENDOR_REJECT,
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  adminController.rejectVendor.bind(adminController)
);

// user list
router.get(
  ROUTES.ADMIN.USERS,
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  adminController.getAllUsers.bind(adminController)
);

router.patch(
  ROUTES.ADMIN.USER_STATUS,
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  adminController.toggleUserStatus.bind(adminController)
);

router.get(
  ROUTES.ADMIN.VENDOR_BY_ID,
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  adminController.getVendorById.bind(adminController)
);

export default router;