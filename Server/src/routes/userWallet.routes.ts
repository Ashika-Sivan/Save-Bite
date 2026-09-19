import { Router } from "express";
import { UserWalletController } from "../controllers/userWallet.controller";
import { authMiddleware } from "../config/dependencies";
import { ROUTES } from "../constants/routes";

const router = Router();
const userWalletController = new UserWalletController();

router.use(authMiddleware.authenticate, authMiddleware.authorize("user"));

router.get(ROUTES.CUSTOMER_WALLET.GET_WALLET, userWalletController.getWallet);

export default router;
