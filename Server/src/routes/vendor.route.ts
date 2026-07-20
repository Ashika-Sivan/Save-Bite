import { Router } from "express";
import { authMiddleware, vendorController } from "../config/dependencies";
import { ROUTES } from "../constants/routes";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

router.post(
  ROUTES.VENDOR.REGISTER,
  authMiddleware.authenticate,
  authMiddleware.authorize("user"),
  upload.fields([
    {name:'businessImage',maxCount:1},
    {name:"gstCertificate",maxCount:1},
    {name:"fssaiCertificate",maxCount:1},
    {name:"panCard",maxCount:1},
    {
      name:"businessRegistrationCertificate",
      maxCount:1
    }
  ]),
  vendorController.registerVendor.bind(vendorController)
);

router.get("/status",authMiddleware.authenticate,authMiddleware.authorize("user","vendor"),vendorController.getVendorStatus.bind(vendorController))
//when vendor making reg req check:-has already applied,application pending,was it approved,rehjected>?

export default router;