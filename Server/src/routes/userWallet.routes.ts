import { Router } from "express";
import { authMiddleware, userWalletController } from "../config/dependencies";
import { ROUTES } from "../constants/routes";

const router = Router();

router.use(authMiddleware.authenticate, authMiddleware.authorize("user"));

router.get(ROUTES.CUSTOMER_WALLET.GET_WALLET, userWalletController.getWallet);

export default router;
