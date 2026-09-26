import { Types, ClientSession } from "mongoose";
import { randomInt } from "crypto";
import { ICreateCheckoutDTO, ICheckoutResponseDTO, IOrderResponseDTO, IRedeemPickupCodeDTO, IRedeemPickupCodeResponseDTO } from "../../dtos/order.dto";
import { AppError } from "../../errors/AppError";
import { StatusCode } from "../../constants/statusCode";
import { ORDER_MESSAGES } from "../../constants/messages";
import { IOrder, IOrderItem, OrderStatus, PaymentStatus, SettlementStatus } from "../../interfaces/models/IOrder.model";
import { IDailyMenuRepository } from "../../interfaces/repository/IDailyMenuRepository";
import { IOrderRepository } from "../../interfaces/repository/IOrderRepository";
import { IVendorRepository } from "../../interfaces/repository/IVendorRepository";
import { IWalletRepository } from "../../interfaces/repository/IWalletRepository";
import { VendorStatus } from "../../interfaces/models/IVendor.model";
import { IOrderService } from "../../interfaces/service/order/IOrder.service";
import stripe from "../../config/stripe";
import mongoose from "mongoose";
import { toOrderResponseDTO } from "../../mappers/order.mapper";
import { getIO, getUserSocketId } from "../../config/socket";

import { IUserWalletService } from "../../interfaces/service/wallet/IUserWalletService";

export class OrderService implements IOrderService {
    constructor(
        private readonly _orderRepository: IOrderRepository,
        private readonly _dailyMenuRepository: IDailyMenuRepository,
        private readonly _vendorRepository?: IVendorRepository,
        private readonly _walletRepository?: IWalletRepository,
        private readonly _userWalletService?: IUserWalletService
    ) { }

     private async generateUniquePickupCode(session?:ClientSession):Promise<string>{
        for(let attempt:number=0;attempt<10;attempt++){
            const pickupCode:string=randomInt(100000,1000000).toString()
            const alreadyExist:boolean=await this._orderRepository.pickupCodeExists(pickupCode,session);

            if(!alreadyExist){
                return pickupCode
            }
        }
        throw new AppError(ORDER_MESSAGES.UNIQUE_PICKUP_CODE_FAILED,StatusCode.BAD_REQUEST)
    }


    async createCheckout(customerId: string, data: ICreateCheckoutDTO): Promise<ICheckoutResponseDTO> {
        if (!Types.ObjectId.isValid(customerId)) {
            throw new AppError(ORDER_MESSAGES.INVALID_CUSTOMER_ID, StatusCode.BAD_REQUEST);
        }

        if (!data || !Types.ObjectId.isValid(data.menuId)) {
            throw new AppError(ORDER_MESSAGES.INVALID_MENU_ID, StatusCode.BAD_REQUEST);
        }

        if (!Array.isArray(data.items) || data.items.length === 0) {
            throw new AppError(ORDER_MESSAGES.EMPTY_CART, StatusCode.BAD_REQUEST);
        }

        const menu = await this._dailyMenuRepository.findById(data.menuId);

        if (!menu) {
            throw new AppError(ORDER_MESSAGES.MENU_NOT_FOUND, StatusCode.NOT_FOUND);
        }

        if (!menu.isLive) {
            throw new AppError(ORDER_MESSAGES.MENU_UNAVAILABLE, StatusCode.BAD_REQUEST);
        }
       

        const now: Date = new Date();
        const foodAvailableTime: Date = new Date(menu.pickupWindow.startTime);
        const pickupClosingTime: Date = new Date(menu.pickupWindow.endTime);
        const orderCutoffTime: Date = new Date(pickupClosingTime.getTime() - 30 * 60 * 1000);

        if (now < foodAvailableTime) {
            throw new AppError(ORDER_MESSAGES.ORDERING_NOT_STARTED, StatusCode.BAD_REQUEST);
        }

        if (now >= orderCutoffTime) {
            throw new AppError(ORDER_MESSAGES.ORDERING_CLOSED, StatusCode.BAD_REQUEST);
        }

        const uniqueItemIds: Set<string> = new Set<string>();//prevent duplicate id
        const orderItems: IOrderItem[] = [];
        let totalAmount: number = 0;

        for (const requestedItem of data.items) {
            if (!Types.ObjectId.isValid(requestedItem.itemId)) {//validate item id
                throw new AppError(ORDER_MESSAGES.INVALID_ITEM_ID, StatusCode.BAD_REQUEST);
            }

            if (!Number.isInteger(requestedItem.quantity) || requestedItem.quantity < 1) {//validate quantity
                throw new AppError(ORDER_MESSAGES.INVALID_QUANTITY, StatusCode.BAD_REQUEST);
            }

            if (uniqueItemIds.has(requestedItem.itemId)) {
                throw new AppError(ORDER_MESSAGES.DUPLICATE_ITEM, StatusCode.BAD_REQUEST);
            }

            uniqueItemIds.add(requestedItem.itemId);

            const menuItem = menu.items.find((item) => item._id.toString() === requestedItem.itemId);//find actual item inside menu

            if (!menuItem) {
                throw new AppError(ORDER_MESSAGES.ITEM_UNAVAILABLE, StatusCode.NOT_FOUND);
            }

            if (!menuItem.isAvailable || menuItem.stockQuantity < 1) {
                throw new AppError(ORDER_MESSAGES.ITEM_OUT_OF_STOCK(menuItem.itemName), StatusCode.BAD_REQUEST);
            }

            if (requestedItem.quantity > menuItem.stockQuantity) {
                throw new AppError(ORDER_MESSAGES.INSUFFICIENT_STOCK(menuItem.stockQuantity, menuItem.itemName), StatusCode.BAD_REQUEST);
            }

            const price: number = menuItem.discountedPrice;
            const subtotal: number = Number((price * requestedItem.quantity).toFixed(2));

            totalAmount += subtotal;

            orderItems.push({
                itemId: menuItem._id,
                itemName: menuItem.itemName,
                unitType: menuItem.unitType,
                price,
                quantity: requestedItem.quantity,
                subtotal,
            });
        }

        totalAmount = Number(totalAmount.toFixed(2));

        const platformCommissionRate: number = 10;
        const platformCommissionAmount: number = Number((totalAmount * (platformCommissionRate / 100)).toFixed(2));
        const vendorAmount: number = Number((totalAmount - platformCommissionAmount).toFixed(2));

        const order = await this._orderRepository.createOrder({
            customerId: new Types.ObjectId(customerId),
            vendorId: menu.vendorId,
            hotelId: menu.hotelId,
            menuId: menu._id,
            items: orderItems,
            totalAmount,
            currency: "inr",
            platformCommissionRate,
            platformCommissionAmount,
            vendorAmount,
            stripePaymentIntentId: null,
            paymentStatus: PaymentStatus.PENDING,
            orderStatus: OrderStatus.PENDING_PAYMENT,
            pickupCode: null,
            pickupWindow: null,
            paidAt: null,
            collectedAt: null,
            settlementStatus: SettlementStatus.PENDING,
            settledAt: null,
            stripeTransferId: null,
        });

        const amountInPaise: number = Math.round(totalAmount * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInPaise,
            currency: "inr",
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                orderId: order._id.toString(),
                customerId,
                menuId: menu._id.toString(),
            },
        });

        if (!paymentIntent.client_secret) {
            throw new AppError(ORDER_MESSAGES.PAYMENT_CREATE_FAILED, StatusCode.BAD_REQUEST);
        }

        const updatedOrder = await this._orderRepository.updatePaymentIntent(
            order._id.toString(),
            new Types.ObjectId(customerId),
            paymentIntent.id
        );

        if (!updatedOrder) {
            throw new AppError(ORDER_MESSAGES.PAYMENT_CONNECT_FAILED, StatusCode.BAD_REQUEST);
        }

        return {
            orderId: updatedOrder._id.toString(),
            clientSecret: paymentIntent.client_secret,
            totalAmount: updatedOrder.totalAmount,
            currency: updatedOrder.currency,
        };
    }

    async getOrderById(customerId: string, orderId: string): Promise<IOrderResponseDTO> {
        if(!Types.ObjectId.isValid(customerId)||!Types.ObjectId.isValid(orderId)){
            throw new AppError(ORDER_MESSAGES.INVALID_ORDER_ID,StatusCode.BAD_REQUEST)
        }

        const order=await this._orderRepository.findByIdAndCustomerId(orderId,new Types.ObjectId(customerId))
        if(!order){
            throw new AppError(ORDER_MESSAGES.ORDER_NOT_FOUND,StatusCode.NOT_FOUND)
        }
        return toOrderResponseDTO(order)
    }

    async verifyPayment(customerId: string, orderId: string): Promise<IOrderResponseDTO> {
        if (!Types.ObjectId.isValid(customerId) || !Types.ObjectId.isValid(orderId)) {
            throw new AppError(ORDER_MESSAGES.INVALID_ORDER_ID, StatusCode.BAD_REQUEST);
        }

        const order = await this._orderRepository.findByIdAndCustomerId(orderId, new Types.ObjectId(customerId));
        if (!order) {
            throw new AppError(ORDER_MESSAGES.ORDER_NOT_FOUND, StatusCode.NOT_FOUND);
        }

        // Already paid — return immediately
        if (order.paymentStatus === PaymentStatus.PAID) {
            return toOrderResponseDTO(order);
        }

        // Only verify if order is still waiting for payment
        if (order.paymentStatus !== PaymentStatus.PENDING || !order.stripePaymentIntentId) {
            return toOrderResponseDTO(order);
        }

        // Check the payment intent status directly with Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);

        if (paymentIntent.status === "succeeded") {
            // Payment succeeded on Stripe but webhook hasn't arrived yet — process it now
            await this.handlePaymentSucceeded(order.stripePaymentIntentId);

            // Re-fetch the updated order
            const updatedOrder = await this._orderRepository.findByIdAndCustomerId(orderId, new Types.ObjectId(customerId));
            if (!updatedOrder) {
                throw new AppError(ORDER_MESSAGES.ORDER_NOT_FOUND_AFTER_PAYMENT, StatusCode.NOT_FOUND);
            }
            return toOrderResponseDTO(updatedOrder);
        }

        return toOrderResponseDTO(order);
    }

    async getMyOrders(customerId: string): Promise<IOrderResponseDTO[]> {
        if (!Types.ObjectId.isValid(customerId)) {
            throw new AppError(ORDER_MESSAGES.INVALID_CUSTOMER_ID, StatusCode.BAD_REQUEST);
        }

        const orders = await this._orderRepository.findAllByCustomerId(new Types.ObjectId(customerId));
        return orders.map((order) => toOrderResponseDTO(order));
    }


    async handlePaymentSucceeded(paymentIntentId: string): Promise<void> {//function actevely talk stripe to check
    if (!paymentIntentId) {
        throw new AppError(ORDER_MESSAGES.INVALID_PAYMENT_INTENT, StatusCode.BAD_REQUEST);
    }

    const order = await this._orderRepository.findByPaymentIntentId(paymentIntentId);

    if (!order) {
        throw new AppError(ORDER_MESSAGES.ORDER_NOT_FOUND_FOR_PAYMENT, StatusCode.NOT_FOUND);
    }

    if (order.paymentStatus === PaymentStatus.PAID && order.orderStatus === OrderStatus.PLACED) {
        return;
    }

    if (
        order.paymentStatus !== PaymentStatus.PENDING ||
        order.orderStatus !== OrderStatus.PENDING_PAYMENT
    ) {
        throw new AppError(ORDER_MESSAGES.ORDER_NOT_WAITING_PAYMENT, StatusCode.BAD_REQUEST);
    }

    const updatedMenu = await this._dailyMenuRepository.decrementItemStock(
        order.menuId,
        order.items.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
        }))
    );

    if (!updatedMenu) {
        throw new AppError(
            ORDER_MESSAGES.UNABLE_TO_PLACE,
            StatusCode.BAD_REQUEST
        );
    }

    const pickupCode: string = await this.generateUniquePickupCode();

    const updatedOrder = await this._orderRepository.markOrderPaid(
        paymentIntentId,
        {
            pickupCode,
            pickupWindow: {
                startTime: new Date(),
                endTime: updatedMenu.pickupWindow.endTime,
            },
            paidAt: new Date(),
        }
    );

    if (!updatedOrder) {
        throw new AppError(ORDER_MESSAGES.UNABLE_TO_MARK_PAID, StatusCode.BAD_REQUEST);
    }
    
    try {
        const io = getIO();
        
        // The socket is registered using the user's ID (ownerId), not the vendor document ID
        const { Vendor } = await import("../../models/vendor/vendor.model");
        const { NotificationModel } = await import("../../models/notification/notification.model");
        const vendor = await Vendor.findById(updatedOrder.vendorId);
        
        if (vendor && vendor.ownerId) {
            const title = "🎉 New Order Received!";
            const body = `Order #${updatedOrder._id.toString().slice(-5).toUpperCase()} has just been placed.`;
            const link = "/vendor/orders";

            // Save notification in database
            const notification = await NotificationModel.create({
                userId: vendor.ownerId,
                targetRole: "vendor",
                title,
                body,
                type: "SYSTEM",
                link,
            });

            const vendorSocketId = await getUserSocketId(vendor.ownerId.toString());
            if (vendorSocketId) {
                io.to(vendorSocketId).emit("new_order", {
                    id: notification._id.toString(),
                    title,
                    body,
                    link,
                    orderId: updatedOrder._id.toString()
                });
            }
        }
    } catch (socketError) {
        console.error("Failed to emit new_order socket event:", socketError);
    }
    
    if (this._userWalletService) {
        try {
            await this._userWalletService.logDebit(
                order.customerId.toString(),
                order.totalAmount,
                `Payment for Order #${updatedOrder._id.toString().substring(19).toUpperCase()}`,
                updatedOrder._id.toString()
            );
        } catch (err) {
            console.error("Failed to log payment transaction:", err);
        }
    }
    }

    async handlePaymentFailed(paymentIntentId: string): Promise<void> {
            if (!paymentIntentId) {
                throw new AppError(ORDER_MESSAGES.INVALID_PAYMENT_INTENT, StatusCode.BAD_REQUEST);
            }

            await this._orderRepository.markPaymentFailed(paymentIntentId);
    }

    async redeemPickupCode(ownerId: string, dto: IRedeemPickupCodeDTO): Promise<IRedeemPickupCodeResponseDTO> {
        if (!dto || typeof dto.pickupCode !== "string" || !dto.pickupCode.trim()) {
            throw new AppError(ORDER_MESSAGES.PICKUP_CODE_REQUIRED, StatusCode.BAD_REQUEST);
        }

        const normalizedCode = dto.pickupCode.trim();

        if (!this._vendorRepository) {
            throw new AppError(ORDER_MESSAGES.VENDOR_REPO_NOT_CONFIGURED, StatusCode.INTERNAL_SERVER_ERROR);
        }

        const vendor = await this._vendorRepository.findByOwnerId(ownerId);
        if (!vendor || vendor.status !== VendorStatus.APPROVED) {
            throw new AppError(ORDER_MESSAGES.ONLY_APPROVED_VENDORS_REDEEM, StatusCode.FORBIDDEN);
        }

        const order = await this._orderRepository.findByPickupCode(normalizedCode);
        if (!order) {
            throw new AppError(ORDER_MESSAGES.INVALID_PICKUP_CODE, StatusCode.NOT_FOUND);
        }

        if (order.vendorId.toString() !== vendor._id.toString()) {
            throw new AppError(ORDER_MESSAGES.ORDER_NOT_BELONG_TO_VENDOR, StatusCode.FORBIDDEN);
        }

        if (order.paymentStatus !== PaymentStatus.PAID) {
            throw new AppError(ORDER_MESSAGES.ORDER_NOT_PAID, StatusCode.BAD_REQUEST);
        }

        if (order.orderStatus === OrderStatus.COLLECTED) {
            throw new AppError(
                ORDER_MESSAGES.PICKUP_CODE_ALREADY_REDEEMED(order.collectedAt ? " on " + new Date(order.collectedAt).toLocaleString() : ""),
                StatusCode.BAD_REQUEST
            );
        }

        if (order.orderStatus === OrderStatus.EXPIRED || (order.pickupWindow?.endTime && new Date() > new Date(order.pickupWindow.endTime))) {
            throw new AppError(ORDER_MESSAGES.PICKUP_WINDOW_EXPIRED, StatusCode.BAD_REQUEST);
        }

        if (order.orderStatus === OrderStatus.CANCELLED) {
            throw new AppError(ORDER_MESSAGES.ORDER_CANCELLED, StatusCode.BAD_REQUEST);
        }

        if (order.orderStatus !== OrderStatus.PLACED) {
            throw new AppError(ORDER_MESSAGES.ORDER_NOT_ELIGIBLE_PICKUP, StatusCode.BAD_REQUEST);
        }

        let updatedOrder: IOrder;

        if (this._walletRepository) {
            let session: ClientSession | null = null;
            let transactionStarted = false;
            try {
                session = await mongoose.startSession();
                session.startTransaction();
                transactionStarted = true;

                const alreadySettled = await this._walletRepository.transactionExistsForOrder(order._id, session);
                if (alreadySettled) {
                    throw new AppError(ORDER_MESSAGES.WALLET_SETTLEMENT_PROCESSED, StatusCode.BAD_REQUEST);
                }

                const result = await this._orderRepository.markOrderCollected(order._id.toString(), new Date(), session);
                if (!result) {
                    throw new AppError(ORDER_MESSAGES.UNABLE_TO_REDEEM, StatusCode.BAD_REQUEST);
                }
                updatedOrder = result;

                const wallet = await this._walletRepository.getOrCreateWallet(order.vendorId, session);
                const vendorAmount = order.vendorAmount;
                const commissionAmount = order.platformCommissionAmount;

                await this._walletRepository.creditVendorWallet(order.vendorId, vendorAmount, commissionAmount, session);

                await this._walletRepository.createTransaction(
                    {
                        walletId: wallet._id,
                        vendorId: order.vendorId,
                        orderId: order._id,
                        orderTotal: order.totalAmount,
                        vendorAmount,
                        platformCommission: commissionAmount,
                        description: `Order pickup redemption (90% vendor payout: ₹${vendorAmount}, 10% platform commission: ₹${commissionAmount})`,
                    },
                    session
                );

                await session.commitTransaction();
                session.endSession();
            } catch (err: unknown) {
                if (session) {
                    if (transactionStarted) {
                        try {
                            await session.abortTransaction();
                        } catch {
                            // ignore
                        }
                    }
                    session.endSession();
                }

                const errMessage = err instanceof Error ? err.message : String(err);
                const isReplicaSetError = errMessage.includes("replica set") || errMessage.includes("Transaction numbers");
                if (isReplicaSetError) {
                    return await this.executeSettlementWithoutTransaction(order);
                }

                throw err;
            }
        } else {
            const result = await this._orderRepository.markOrderCollected(order._id.toString(), new Date());
            if (!result) {
                throw new AppError(ORDER_MESSAGES.UNABLE_TO_REDEEM, StatusCode.BAD_REQUEST);
            }
            updatedOrder = result;
        }

        return {
            message: ORDER_MESSAGES.PICKUP_CODE_REDEEMED,
            order: toOrderResponseDTO(updatedOrder),
        };
    }

    private async executeSettlementWithoutTransaction(order: IOrder): Promise<IRedeemPickupCodeResponseDTO> {
        if (!this._walletRepository) {
            throw new AppError(ORDER_MESSAGES.WALLET_REPO_NOT_CONFIGURED, StatusCode.INTERNAL_SERVER_ERROR);
        }

        const alreadySettled = await this._walletRepository.transactionExistsForOrder(order._id);
        if (alreadySettled) {
            throw new AppError(ORDER_MESSAGES.WALLET_SETTLEMENT_PROCESSED, StatusCode.BAD_REQUEST);
        }

        const updatedOrder = await this._orderRepository.markOrderCollected(order._id.toString(), new Date());
        if (!updatedOrder) {
            throw new AppError(ORDER_MESSAGES.UNABLE_TO_REDEEM, StatusCode.BAD_REQUEST);
        }

        const wallet = await this._walletRepository.getOrCreateWallet(order.vendorId);
        const vendorAmount = order.vendorAmount;
        const commissionAmount = order.platformCommissionAmount;

        await this._walletRepository.creditVendorWallet(order.vendorId, vendorAmount, commissionAmount);

        await this._walletRepository.createTransaction({
            walletId: wallet._id,
            vendorId: order.vendorId,
            orderId: order._id,
            orderTotal: order.totalAmount,
            vendorAmount,
            platformCommission: commissionAmount,
            description: `Order pickup redemption (90% vendor payout: ₹${vendorAmount}, 10% platform commission: ₹${commissionAmount})`,
        });

        return {
            message: ORDER_MESSAGES.PICKUP_CODE_REDEEMED,
            order: toOrderResponseDTO(updatedOrder),
        };
    }

    async getVendorOrders(ownerId: string, filters?: { startDate?: Date, endDate?: Date, sortDirection?: 'asc' | 'desc' }): Promise<IOrderResponseDTO[]> {
        if (!ownerId) {
            throw new AppError(ORDER_MESSAGES.VENDOR_NOT_AUTHENTICATED, StatusCode.UNAUTHORIZED);
        }

        if (!this._vendorRepository) {
            throw new AppError(ORDER_MESSAGES.VENDOR_REPO_NOT_CONFIGURED, StatusCode.INTERNAL_SERVER_ERROR);
        }

        const vendor = await this._vendorRepository.findByOwnerId(ownerId);
        if (!vendor) {
            throw new AppError(ORDER_MESSAGES.VENDOR_NOT_FOUND, StatusCode.NOT_FOUND);
        }

        const orders = await this._orderRepository.findAllByVendorId(vendor._id, filters);
        return orders.map((order) => toOrderResponseDTO(order));
    }
    //refund
    async processAutoRefunds(): Promise<number> {
    
        const date24HoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const oldOrders = await this._orderRepository.findPlacedOrdersOlderThan(date24HoursAgo);

        let refundedCount = 0;//chevk whether refund has complted 

        for (const order of oldOrders) {
            try {
                if (!order.stripePaymentIntentId) {
                    continue; 
                }

                // 70% refund
                const refundRatio = 0.70;
                const refundAmount = Number((order.totalAmount * refundRatio).toFixed(2));
                const refundAmountInPaise = Math.round(refundAmount * 100);

                
                await stripe.refunds.create({
                    payment_intent: order.stripePaymentIntentId,
                    amount: refundAmountInPaise,
                    reason: "requested_by_customer" 
                });

                // Update order status to AUTO_REFUNDED
                await this._orderRepository.updateOrderStatus(order._id.toString(), OrderStatus.AUTO_REFUNDED);
                
                if (this._userWalletService) {
                    try {
                        await this._userWalletService.logCredit(
                            order.customerId.toString(),
                            refundAmount,
                            `Auto-refund (70%) for uncollected Order #${order._id.toString().substring(19).toUpperCase()}`,
                            order._id.toString()
                        );
                    } catch (err) {
                        console.error("Failed to log auto-refund transaction:", err);
                    }
                }

                refundedCount++;
            } catch (error) {
                // We log and continue so one failing refund doesn't break the whole batch
                console.error(`Failed to auto-refund order ${order._id}:`, error);
            }
        }

        return refundedCount;
    }

    async cancelOrder(customerId: string, orderId: string): Promise<IOrderResponseDTO> {
        if (!Types.ObjectId.isValid(customerId) || !Types.ObjectId.isValid(orderId)) {
            throw new AppError(ORDER_MESSAGES.INVALID_ORDER_ID, StatusCode.BAD_REQUEST);
        }

        const order = await this._orderRepository.findByIdAndCustomerId(orderId, new Types.ObjectId(customerId));
        if (!order) {
            throw new AppError(ORDER_MESSAGES.ORDER_NOT_FOUND, StatusCode.NOT_FOUND);
        }

        if (order.orderStatus !== OrderStatus.PLACED) {
            throw new AppError(ORDER_MESSAGES.CANNOT_CANCEL_STATUS(order.orderStatus), StatusCode.BAD_REQUEST);
        }

        if (order.paymentStatus !== PaymentStatus.PAID) {
            throw new AppError(ORDER_MESSAGES.ONLY_PAID_CANCELLED, StatusCode.BAD_REQUEST);
        }

      

        const now = Date.now();
        const orderTime = order.createdAt.getTime();
        const diffMinutes = (now - orderTime) / (1000 * 60);//calcul of time 5

        if (diffMinutes > 5) {
            throw new AppError(ORDER_MESSAGES.CANCEL_GRACE_EXPIRED, StatusCode.BAD_REQUEST);
        }

        //refund operatios
        if (order.stripePaymentIntentId) {
            try {
                await stripe.refunds.create({
                    payment_intent: order.stripePaymentIntentId,
                    reason: "requested_by_customer"
                });

                if (this._userWalletService) {
                    try {
                        await this._userWalletService.logCredit(
                            order.customerId.toString(),
                            order.totalAmount,
                            `Refund for cancelled Order #${order._id.toString().substring(19).toUpperCase()}`,
                            order._id.toString()
                        );
                    } catch (err) {
                        console.error("Failed to log refund transaction:", err);
                    }
                }
            } catch (error: unknown) {
                console.error("Stripe refund failed during cancellation:", error);
                throw new AppError(`Refund failed: ${error instanceof Error ? error.message : "Unknown error"}`, StatusCode.INTERNAL_SERVER_ERROR);
            }
        }

        const itemsToIncrement = order.items.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity
        }));

        await this._dailyMenuRepository.incrementItemStock(order.menuId, itemsToIncrement);

        const updatedOrder = await this._orderRepository.updateOrderStatus(order._id.toString(), OrderStatus.CANCELLED);
        if (!updatedOrder) {
            throw new AppError(ORDER_MESSAGES.UPDATE_STATUS_FAILED, StatusCode.INTERNAL_SERVER_ERROR);
        }

        return toOrderResponseDTO(updatedOrder);
    }
}