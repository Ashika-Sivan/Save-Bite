import { Types, ClientSession } from "mongoose";
import { randomInt } from "crypto";
import { ICreateCheckoutDTO, ICheckoutResponseDTO, IOrderResponseDTO } from "../../dtos/order.dto";
import { AppError } from "../../errors/AppError";
import { StatusCode } from "../../constants/statusCode";
import { IOrder, IOrderItem, OrderStatus, PaymentStatus, SettlementStatus } from "../../interfaces/models/IOrder.model";
import { IDailyMenuRepository } from "../../interfaces/repository/IDailyMenuRepository";
import { IOrderRepository } from "../../interfaces/repository/IOrderRepository";
import { IOrderService } from "../../interfaces/service/order/IOrder.service";
import stripe from "../../config/stripe";

export class OrderService implements IOrderService {
    constructor(
        private readonly _orderRepository: IOrderRepository,
        private readonly _dailyMenuRepository: IDailyMenuRepository
    ) {}

     private async generateUniquePickupCode(session?:ClientSession):Promise<string>{
        for(let attempt:number=0;attempt<10;attempt++){
            const pickupCode:string=randomInt(100000,1000000).toString()
            const alreadyExist:boolean=await this._orderRepository.pickupCodeExists(pickupCode,session);

            if(!alreadyExist){
                return pickupCode
            }
        }
        throw new AppError('unable to generate a unique pickup code',StatusCode.BAD_REQUEST)
    }


    async createCheckout(customerId: string, data: ICreateCheckoutDTO): Promise<ICheckoutResponseDTO> {
        if (!Types.ObjectId.isValid(customerId)) {
            throw new AppError("Invalid customer ID", StatusCode.BAD_REQUEST);
        }

        if (!data || !Types.ObjectId.isValid(data.menuId)) {
            throw new AppError("Invalid menu ID", StatusCode.BAD_REQUEST);
        }

        if (!Array.isArray(data.items) || data.items.length === 0) {
            throw new AppError("Add at least one item to the cart", StatusCode.BAD_REQUEST);
        }

        const menu = await this._dailyMenuRepository.findById(data.menuId);

        if (!menu) {
            throw new AppError("Menu not found", StatusCode.NOT_FOUND);
        }

        if (!menu.isLive) {
            throw new AppError("This menu is currently unavailable", StatusCode.BAD_REQUEST);
        }

        const now: Date = new Date();
        const foodAvailableTime: Date = new Date(menu.pickupWindow.startTime);
        const pickupClosingTime: Date = new Date(menu.pickupWindow.endTime);
        const orderCutoffTime: Date = new Date(pickupClosingTime.getTime() - 30 * 60 * 1000);

        if (now < foodAvailableTime) {
            throw new AppError("Ordering has not started yet", StatusCode.BAD_REQUEST);
        }

        if (now >= orderCutoffTime) {
            throw new AppError("Ordering has already closed", StatusCode.BAD_REQUEST);
        }

        const uniqueItemIds: Set<string> = new Set<string>();//prevent duplicate id
        const orderItems: IOrderItem[] = [];
        let totalAmount: number = 0;

        for (const requestedItem of data.items) {
            if (!Types.ObjectId.isValid(requestedItem.itemId)) {//validate item id
                throw new AppError("Invalid item ID", StatusCode.BAD_REQUEST);
            }

            if (!Number.isInteger(requestedItem.quantity) || requestedItem.quantity < 1) {//validate quantity
                throw new AppError("Item quantity must be a positive whole number", StatusCode.BAD_REQUEST);
            }

            if (uniqueItemIds.has(requestedItem.itemId)) {
                throw new AppError("The same item cannot be added more than once", StatusCode.BAD_REQUEST);
            }

            uniqueItemIds.add(requestedItem.itemId);

            const menuItem = menu.items.find((item) => item._id.toString() === requestedItem.itemId);//find actual item inside menu

            if (!menuItem) {
                throw new AppError("An item in your cart is no longer available", StatusCode.NOT_FOUND);
            }

            if (!menuItem.isAvailable || menuItem.stockQuantity < 1) {
                throw new AppError(`${menuItem.itemName} is unavailable`, StatusCode.BAD_REQUEST);
            }

            if (requestedItem.quantity > menuItem.stockQuantity) {
                throw new AppError(`Only ${menuItem.stockQuantity} ${menuItem.itemName} available`, StatusCode.BAD_REQUEST);
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
            throw new AppError("Unable to create payment", StatusCode.BAD_REQUEST);
        }

        const updatedOrder = await this._orderRepository.updatePaymentIntent(
            order._id.toString(),
            new Types.ObjectId(customerId),
            paymentIntent.id
        );

        if (!updatedOrder) {
            throw new AppError("Unable to connect payment to order", StatusCode.BAD_REQUEST);
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
            throw new AppError("invalid orderId",StatusCode.BAD_REQUEST)
        }

        const order=await this._orderRepository.findByIdAndCustomerId(orderId,new Types.ObjectId(customerId))
        if(!order){
            throw new AppError("order not found",StatusCode.NOT_FOUND)
        }
        return this.mapOrderToResponse(order)
    }

    async verifyPayment(customerId: string, orderId: string): Promise<IOrderResponseDTO> {
        if (!Types.ObjectId.isValid(customerId) || !Types.ObjectId.isValid(orderId)) {
            throw new AppError("Invalid order ID", StatusCode.BAD_REQUEST);
        }

        const order = await this._orderRepository.findByIdAndCustomerId(orderId, new Types.ObjectId(customerId));
        if (!order) {
            throw new AppError("Order not found", StatusCode.NOT_FOUND);
        }

        // Already paid — return immediately
        if (order.paymentStatus === PaymentStatus.PAID) {
            return this.mapOrderToResponse(order);
        }

        // Only verify if order is still waiting for payment
        if (order.paymentStatus !== PaymentStatus.PENDING || !order.stripePaymentIntentId) {
            return this.mapOrderToResponse(order);
        }

        // Check the payment intent status directly with Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);

        if (paymentIntent.status === "succeeded") {
            // Payment succeeded on Stripe but webhook hasn't arrived yet — process it now
            await this.handlePaymentSucceeded(order.stripePaymentIntentId);

            // Re-fetch the updated order
            const updatedOrder = await this._orderRepository.findByIdAndCustomerId(orderId, new Types.ObjectId(customerId));
            if (!updatedOrder) {
                throw new AppError("Order not found after payment verification", StatusCode.NOT_FOUND);
            }
            return this.mapOrderToResponse(updatedOrder);
        }

        return this.mapOrderToResponse(order);
    }

    async getMyOrders(customerId: string): Promise<IOrderResponseDTO[]> {
        if (!Types.ObjectId.isValid(customerId)) {
            throw new AppError("Invalid customer ID", StatusCode.BAD_REQUEST);
        }

        const orders = await this._orderRepository.findAllByCustomerId(new Types.ObjectId(customerId));
        return orders.map((order) => this.mapOrderToResponse(order));
    }

    private mapOrderToResponse(order: IOrder): IOrderResponseDTO {
        const hotelObj = order.hotelId as unknown as { _id: Types.ObjectId; hotelName?: string };
        const hotelName = typeof hotelObj === "object" && hotelObj?.hotelName ? hotelObj.hotelName : "";

        return {
            id:order._id.toString(),
            customerId:order.customerId.toString(),
            vendorId:order.vendorId.toString(),
            hotelId: (hotelObj?._id ?? order.hotelId).toString(),
            hotelName,
            menuId:order.menuId.toString(),
                items:order.items.map((item)=>({
                    itemId:item.itemId.toString(),
                    itemName:item.itemName,
                    unitType:item.unitType,
                    price:item.price,
                    quantity:item.quantity,
                    subTotal:item.subtotal
                }),
            ),
            totalAmount:order.totalAmount,
            currency:order.currency,
            paymentStatus:order.paymentStatus,
            orderStatus:order.orderStatus,
            settlementStatus:order.settlementStatus,
            pickupCode:order.pickupCode,
            pickupWindow:order.pickupWindow?{
                startTime:order.pickupWindow.startTime.toISOString(),
                endTime:order.pickupWindow.endTime.toISOString()
            }
            :null,

            paidAt:order.paidAt?order.paidAt.toISOString():null,
            collectedAt:order.collectedAt?order.collectedAt.toISOString():null,
            createdAt:order.createdAt.toISOString(),
            updatedAt:order.updatedAt.toISOString()
       }
    }

    async handlePaymentSucceeded(paymentIntentId: string): Promise<void> {
    if (!paymentIntentId) {
        throw new AppError("Payment Intent ID is required", StatusCode.BAD_REQUEST);
    }

    const order = await this._orderRepository.findByPaymentIntentId(paymentIntentId);

    if (!order) {
        throw new AppError("Order not found for this payment", StatusCode.NOT_FOUND);
    }

    if (order.paymentStatus === PaymentStatus.PAID && order.orderStatus === OrderStatus.PLACED) {
        return;
    }

    if (
        order.paymentStatus !== PaymentStatus.PENDING ||
        order.orderStatus !== OrderStatus.PENDING_PAYMENT
    ) {
        throw new AppError("Order is not waiting for payment", StatusCode.BAD_REQUEST);
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
            "Unable to place the order because one or more items have insufficient stock",
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
        throw new AppError("Unable to mark the order as paid", StatusCode.BAD_REQUEST);
    }
    }

    async handlePaymentFailed(paymentIntentId: string): Promise<void> {
            if (!paymentIntentId) {
                throw new AppError("Payment Intent ID is required", StatusCode.BAD_REQUEST);
            }

            await this._orderRepository.markPaymentFailed(paymentIntentId);
    }

   
}