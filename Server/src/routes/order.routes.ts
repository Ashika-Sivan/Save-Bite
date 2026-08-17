import { Router } from "express";
import { authMiddleware, orderController } from "../config/dependencies";
import { ROUTES } from "../constants/routes";

const orderRouter = Router();

orderRouter.post(ROUTES.ORDER.WEBHOOK, orderController.handleWebhook.bind(orderController));
orderRouter.post(ROUTES.ORDER.CHECKOUT, authMiddleware.authenticate, authMiddleware.authorize("user"), orderController.createCheckout.bind(orderController));
orderRouter.get(ROUTES.ORDER.MY_ORDERS, authMiddleware.authenticate, authMiddleware.authorize("user"), orderController.getMyOrders.bind(orderController));
orderRouter.get(ROUTES.ORDER.VENDOR_ORDERS, authMiddleware.authenticate, authMiddleware.authorize("vendor"), orderController.getVendorOrders.bind(orderController));
orderRouter.post(ROUTES.ORDER.REDEEM_PICKUP_CODE, authMiddleware.authenticate, authMiddleware.authorize("vendor"), orderController.redeemPickupCode.bind(orderController));
orderRouter.get(ROUTES.ORDER.VERIFY_PAYMENT, authMiddleware.authenticate, authMiddleware.authorize("user"), orderController.verifyPayment.bind(orderController));
orderRouter.get(ROUTES.ORDER.GET_BY_ID, authMiddleware.authenticate, authMiddleware.authorize("user"), orderController.getOrderById.bind(orderController));

export default orderRouter;