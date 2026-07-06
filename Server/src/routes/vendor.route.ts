import { Router } from "express";
import { authMiddleware, vendorController } from "../config/dependencies";

const router = Router();

router.post(
  "/register",
  authMiddleware.authenticate,
  authMiddleware.authorize("user"),
  vendorController.registerVendor.bind(vendorController)//allowed user can become the vendor
);

export default router;