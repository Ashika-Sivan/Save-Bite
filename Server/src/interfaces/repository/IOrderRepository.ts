import { ClientSession, Types } from "mongoose";

import {
    IOrder,
    IOrderItem,
    OrderStatus,
    PaymentStatus,
    SettlementStatus,
} from "../models/IOrder.model";

export interface IOrderCreateData {
    customerId: Types.ObjectId;
    vendorId: Types.ObjectId;
    hotelId: Types.ObjectId;
    menuId: Types.ObjectId;

    items: IOrderItem[];

    totalAmount: number;
    currency: string;

    platformCommissionRate: number;
    platformCommissionAmount: number;
    vendorAmount: number;

    stripePaymentIntentId: string | null;

    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;

    pickupCode: string | null;

    pickupWindow: {
        startTime: Date;
        endTime: Date;
    } | null;

    paidAt: Date | null;
    collectedAt: Date | null;

    settlementStatus: SettlementStatus;
    settledAt: Date | null;

    stripeTransferId: string | null;
}

export interface IMarkOrderPaidData {
    pickupCode: string;

    pickupWindow: {
        startTime: Date;
        endTime: Date;
    };

    paidAt: Date;
}

export interface IOrderRepository {
    createOrder(data: IOrderCreateData): Promise<IOrder>;
    updatePaymentIntent(orderId: string, customerId: Types.ObjectId, paymentIntentId: string): Promise<IOrder | null>;
    findByIdAndCustomerId(orderId: string, customerId: Types.ObjectId): Promise<IOrder | null>;
    findAllByCustomerId(customerId: Types.ObjectId): Promise<IOrder[]>;
    findByPaymentIntentId(paymentIntentId: string, session?: ClientSession): Promise<IOrder | null>;
    pickupCodeExists(pickupCode: string, session?: ClientSession): Promise<boolean>
    markPaymentFailed(paymentIntentId: string): Promise<IOrder | null>;
    markOrderPaid(paymentIntentId: string, data: IMarkOrderPaidData, session?: ClientSession): Promise<IOrder | null>;
    findByPickupCode(pickupCode: string): Promise<IOrder | null>;
    markOrderCollected(orderId: string, collectedAt: Date, session?: ClientSession): Promise<IOrder | null>;
    findAllByVendorId(vendorId: Types.ObjectId): Promise<IOrder[]>;
}