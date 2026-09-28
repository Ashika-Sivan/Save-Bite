import { Router } from "express";
import {authMiddleware, dailyMenuController, vendorController,walletController,} from "../config/dependencies";
import { ROUTES } from "../constants/routes";
import { upload } from "../middlewares/upload.middleware";
import hotelRouter from "./hotel.routes";
import { validateRequest } from "../middlewares/validate.middleware";
import { vendorVerificationSchema } from "../validations/vendor.validations";
import { createMenuSchema,  addMenuItemSchema, updatePickupWindowSchema,updateMenuItemSchema,} from "../validations/dailyMenu.validations";
import { subVendorController } from "../config/dependencies";
import { vendorDocumentUpload } from "../middlewares/upload.middleware";



const router = Router();
router.use("/hotels", hotelRouter);
router.get(
  ROUTES.VENDOR.WALLET,
  authMiddleware.authenticate,
  authMiddleware.authorize("vendor", "sub_vendor"),
  walletController.getVendorWalletSummary.bind(walletController),
);

router.post(
  ROUTES.VENDOR.REGISTER,
  authMiddleware.authenticate,
  authMiddleware.authorize("user"),
  vendorDocumentUpload,
  validateRequest(vendorVerificationSchema),
  vendorController.registerVendor.bind(vendorController),
);

router.post(
  ROUTES.VENDOR.REAPPLY,
  authMiddleware.authenticate,
  authMiddleware.authorize("user"),
  vendorDocumentUpload,
  validateRequest(vendorVerificationSchema),
  vendorController.reapplyVendor.bind(vendorController),
);

router.get(
  ROUTES.VENDOR.STATUS,
  authMiddleware.authenticate,
  authMiddleware.authorize("user", "vendor"),
  vendorController.getVendorStatus.bind(vendorController),
);


router.get(
  "/profile",
  authMiddleware.authenticate,
  authMiddleware.authorize("vendor", "sub_vendor"),
  vendorController.getVendorProfiles.bind(vendorController),
);

router.post(
  ROUTES.VENDOR.CREATE_DAILY_MENU,
  authMiddleware.authenticate,
  authMiddleware.authorize("vendor", "sub_vendor"),
  validateRequest(createMenuSchema),
  dailyMenuController.createMenu.bind(dailyMenuController),
);
router.post(
  ROUTES.VENDOR.ADD_DAILY_MENU_ITEM,
  authMiddleware.authenticate,
  authMiddleware.authorize("vendor", "sub_vendor"),
  upload.single("itemImage"),
  validateRequest(addMenuItemSchema),
  dailyMenuController.addMenuItem.bind(dailyMenuController),
);
router.patch(
  ROUTES.VENDOR.GO_LIVE,
  authMiddleware.authenticate,
  authMiddleware.authorize("vendor", "sub_vendor"),
  dailyMenuController.goLive.bind(dailyMenuController),
);
router.get(
  ROUTES.VENDOR.GET_TODAY_MENU,
  authMiddleware.authenticate,
  authMiddleware.authorize("vendor", "sub_vendor"),
  dailyMenuController.getTodayMenu.bind(dailyMenuController),
);
router.patch(
  ROUTES.VENDOR.END_LIVE,
  authMiddleware.authenticate,
  authMiddleware.authorize("vendor", "sub_vendor"),
  dailyMenuController.endLive.bind(dailyMenuController),
);
router.patch(
  ROUTES.VENDOR.UPDATE_PICKUP_WINDOW,
  authMiddleware.authenticate,
  authMiddleware.authorize("vendor", "sub_vendor"),
  validateRequest(updatePickupWindowSchema),
  dailyMenuController.updatePickupWindow.bind(dailyMenuController),
);
router.patch(
  ROUTES.VENDOR.UPDATE_DAILY_MENU_ITEM,
  authMiddleware.authenticate,
  authMiddleware.authorize("vendor", "sub_vendor"),
  validateRequest(updateMenuItemSchema),
  dailyMenuController.updateMenuItem.bind(dailyMenuController),
);
router.post(
  ROUTES.VENDOR.USE_PREVIOUS_MENU,
  authMiddleware.authenticate,
  authMiddleware.authorize("vendor", "sub_vendor"),
  dailyMenuController.usePreviousMenu.bind(dailyMenuController),
);



//manageing the subvendor routes
router.get(
  ROUTES.VENDOR.GET_SUB_VENDOR,
  authMiddleware.authenticate,
  authMiddleware.authorize("vendor", "sub_vendor"),
  subVendorController.getSubVendor.bind(subVendorController),
);

router.post(
  ROUTES.VENDOR.SUB_VENDOR_CREDENTIALS,
  authMiddleware.authenticate,
  authMiddleware.authorize("vendor", "sub_vendor"),
  subVendorController.createCredentials.bind(subVendorController),
);

router.put(
  ROUTES.VENDOR.SUB_VENDOR_PERMISSIONS,
  authMiddleware.authenticate,
  authMiddleware.authorize("vendor", "sub_vendor"),
  subVendorController.updatePermissions.bind(subVendorController),
);

router.put(
  ROUTES.VENDOR.SUB_VENDOR_PASSWORD,
  authMiddleware.authenticate,
  authMiddleware.authorize("vendor", "sub_vendor"),
  subVendorController.updatePassword.bind(subVendorController),
);

export default router;
