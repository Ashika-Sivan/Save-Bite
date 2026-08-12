import mongoose, {
    Schema,
} from "mongoose"

import {
    IOrder,
    IOrderItem,
    OrderStatus,
    PaymentStatus,
    SettlementStatus,
} from "../../interfaces/models/IOrder.model"

import {
    MenuUnitType,
} from "../../interfaces/models/IDailyMenu.model"

const orderItemSchema =
    new Schema<IOrderItem>(
        {
            itemId: {
                type: Schema.Types.ObjectId,
                required: true,
            },

            itemName: {
                type: String,
                required: true,
                trim: true,
            },

            unitType: {
                type: String,
                enum: Object.values(
                    MenuUnitType
                ),
                required: true,
            },

            price: {
                type: Number,
                required: true,
                min: 0,
            },

            quantity: {
                type: Number,
                required: true,
                min: 1,
            },

            subtotal: {
                type: Number,
                required: true,
                min: 0,
            },
        },
        {
            _id: false,
        }
    )

const pickupWindowSchema =
    new Schema(
        {
            startTime: {
                type: Date,
                required: true,
            },

            endTime: {
                type: Date,
                required: true,
            },
        },
        {
            _id: false,
        }
    )

const orderSchema =
    new Schema<IOrder>(
        {
            customerId: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
                index: true,
            },

            vendorId: {
                type: Schema.Types.ObjectId,
                ref: "vendor",
                required: true,
                index: true,
            },

            hotelId: {
                type: Schema.Types.ObjectId,
                ref: "hotel",
                required: true,
                index: true,
            },

            menuId: {
                type: Schema.Types.ObjectId,
                ref: "DailyMenu",
                required: true,
                index: true,
            },

            items: {
                type: [orderItemSchema],
                required: true,

                validate: {
                    validator: (
                        items: IOrderItem[]
                    ) =>
                        items.length > 0,

                    message:
                        "Order must contain at least one item",
                },
            },

            totalAmount: {
                type: Number,
                required: true,
                min: 0,
            },

            currency: {
                type: String,
                default: "inr",
                lowercase: true,
                trim: true,
            },

            platformCommissionRate: {
                type: Number,
                required: true,
                default: 10,
                min: 0,
                max: 100,
            },

            platformCommissionAmount: {
                type: Number,
                required: true,
                min: 0,
            },

            vendorAmount: {
                type: Number,
                required: true,
                min: 0,
            },

            stripePaymentIntentId: {
                type: String,
                default: null,
                trim: true,
            },

            paymentStatus: {
                type: String,
                enum: Object.values(
                    PaymentStatus
                ),
                default:
                    PaymentStatus.PENDING,
                required: true,
            },

            orderStatus: {
                type: String,
                enum: Object.values(
                    OrderStatus
                ),
                default:
                    OrderStatus
                        .PENDING_PAYMENT,
                required: true,
            },

            pickupCode: {
                type: String,
                default: null,
                trim: true,
            },

            pickupWindow: {
                type: pickupWindowSchema,
                default: null,
            },

            paidAt: {
                type: Date,
                default: null,
            },

            collectedAt: {
                type: Date,
                default: null,
            },

            settlementStatus: {
                type: String,
                enum: Object.values(
                    SettlementStatus
                ),
                default:
                    SettlementStatus.PENDING,
                required: true,
            },

            settledAt: {
                type: Date,
                default: null,
            },

            stripeTransferId: {
                type: String,
                default: null,
                trim: true,
            },
        },
        {
            timestamps: true,
        }
    )

/*
 * Customer order-history query.
 */
orderSchema.index({
    customerId: 1,
    createdAt: -1,
})

/*
 * Vendor incoming-orders query.
 */
orderSchema.index({
    vendorId: 1,
    orderStatus: 1,
    createdAt: -1,
})

/*
 * Prevent the same Stripe payment
 * intent from linking to two orders.
 */
orderSchema.index(
    {
        stripePaymentIntentId: 1,
    },
    {
        unique: true,

        partialFilterExpression: {
            stripePaymentIntentId: {
                $type: "string",
            },
        },
    }
)

/*
 * every generted pickup code must
 * be unique.
 */
orderSchema.index(
    {
        pickupCode: 1,
    },
    {
        unique: true,

        partialFilterExpression: {
            pickupCode: {
                $type: "string",
            },
        },
    }
)

export const Order =
    mongoose.model<IOrder>(
        "Order",
        orderSchema
    )