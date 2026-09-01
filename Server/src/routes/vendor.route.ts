import { Router } from "express";
import { authMiddleware, dailyMenuController, vendorController, walletController } from "../config/dependencies";
import { ROUTES } from "../constants/routes";
import { upload } from "../middlewares/upload.middleware";
import hotelRouter from "./hotel.routes";


const router = Router();
router.use("/hotels",hotelRouter)
router.get(ROUTES.VENDOR.WALLET, authMiddleware.authenticate, authMiddleware.authorize("vendor"), walletController.getVendorWalletSummary.bind(walletController));

router.post(
  ROUTES.VENDOR.REGISTER,
  authMiddleware.authenticate,
  authMiddleware.authorize("user"),
  upload.fields([
    { name: "businessImage", maxCount: 1 },
    { name: "gstCertificate", maxCount: 1 },
    { name: "fssaiCertificate", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "businessRegistrationCertificate", maxCount: 1 },
  ]),
  vendorController.registerVendor.bind(vendorController)
);

router.post(
  ROUTES.VENDOR.REAPPLY,
  authMiddleware.authenticate,
  authMiddleware.authorize("user"),
  upload.fields([
    { name: "businessImage", maxCount: 1 },
    { name: "gstCertificate", maxCount: 1 },
    { name: "fssaiCertificate", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "businessRegistrationCertificate", maxCount: 1 },
  ]),
  vendorController.reapplyVendor.bind(vendorController)
);

router.get(ROUTES.VENDOR.STATUS,authMiddleware.authenticate,authMiddleware.authorize("user", "vendor"),vendorController.getVendorStatus.bind(vendorController));
// when vendor making reg req check:- has already applied, application pending, was it approved, rejected?

router.get("/profile", authMiddleware.authenticate, authMiddleware.authorize("vendor"), vendorController.getVendorProfiles.bind(vendorController));

router.post(ROUTES.VENDOR.CREATE_DAILY_MENU,authMiddleware.authenticate,authMiddleware.authorize("vendor"),dailyMenuController.createMenu.bind(dailyMenuController))
router.post(ROUTES.VENDOR.ADD_DAILY_MENU_ITEM,authMiddleware.authenticate,authMiddleware.authorize("vendor"),upload.single('itemImage'),dailyMenuController.addMenuItem.bind(dailyMenuController))
router.patch(ROUTES.VENDOR.GO_LIVE,authMiddleware.authenticate,authMiddleware.authorize("vendor"),dailyMenuController.goLive.bind(dailyMenuController))
router.get(ROUTES.VENDOR.GET_TODAY_MENU,authMiddleware.authenticate,authMiddleware.authorize("vendor"),dailyMenuController.getTodayMenu.bind(dailyMenuController))
router.patch(ROUTES.VENDOR.END_LIVE,authMiddleware.authenticate,authMiddleware.authorize("vendor"),dailyMenuController.endLive.bind(dailyMenuController))
router.patch(ROUTES.VENDOR.UPDATE_PICKUP_WINDOW,authMiddleware.authenticate,authMiddleware.authorize("vendor"),dailyMenuController.updatePickupWindow.bind(dailyMenuController))
router.patch(ROUTES.VENDOR.UPDATE_DAILY_MENU_ITEM,authMiddleware.authenticate,authMiddleware.authorize("vendor"),dailyMenuController.updateMenuItem.bind(dailyMenuController))
router.post(ROUTES.VENDOR.USE_PREVIOUS_MENU,authMiddleware.authenticate,authMiddleware.authorize("vendor"),dailyMenuController.usePreviousMenu.bind(dailyMenuController))
export default router;