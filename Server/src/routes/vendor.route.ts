import { Router } from "express";
import { authMiddleware, vendorController } from "../config/dependencies";
import { ROUTES } from "../constants/routes";

const router = Router();

router.post(
  ROUTES.VENDOR.REGISTER,
  authMiddleware.authenticate,
  authMiddleware.authorize("user"),
  vendorController.registerVendor.bind(vendorController)
);

export default router;