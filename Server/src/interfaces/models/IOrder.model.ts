import { Types } from "mongoose"

import {
    MenuUnitType,
} from "./IDailyMenu.model"

export enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    FAILED = "failed",
}

export enum OrderStatus {
    PENDING_PAYMENT =
        "pending_payment",

    PLACED = "placed",
    COLLECTED = "collected",
    EXPIRED = "expired",
    CANCELLED = "cancelled",
    CONCERN_RAISED = "concern_raised",
    RESOLVED = "resolved",
}

export enum SettlementStatus {
    PENDING = "pending",
    RELEASED = "released",
}

export interface IOrderItem {
    itemId: Types.ObjectId
    itemName: string
    unitType: MenuUnitType
    price: number
    quantity: number
    subtotal: number
}

export interface IOrder {
    _id: Types.ObjectId

    customerId: Types.ObjectId
    vendorId: Types.ObjectId
    hotelId: Types.ObjectId
    menuId: Types.ObjectId
    items: IOrderItem[]
    totalAmount: number
    currency: string
    platformCommissionRate: number
    platformCommissionAmount: number
    vendorAmount:number
    stripePaymentIntentId:string | null
    paymentStatus:PaymentStatus
    orderStatus:OrderStatus
    pickupCode:string | null
    pickupWindow: {
        startTime: Date
        endTime: Date
    } | null

    paidAt:Date | null
    collectedAt:Date | null
    settlementStatus:SettlementStatus
    settledAt:Date | null
    stripeTransferId:string | null
    createdAt: Date
    updatedAt: Date
}