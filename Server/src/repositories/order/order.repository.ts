import { ClientSession, Types } from "mongoose";
import { IOrder, OrderStatus, PaymentStatus, SettlementStatus } from "../../interfaces/models/IOrder.model";
import { IMarkOrderPaidData, IOrderCreateData, IOrderRepository } from "../../interfaces/repository/IOrderRepository";
import { Order } from "../../models/order/order.model";
import { BaseRepository } from "../base.repository";

export class OrderRepository extends BaseRepository<IOrder> implements IOrderRepository {
    constructor() {
        super(Order)
    }
    async createOrder(data: IOrderCreateData): Promise<IOrder> {
        return await this.create(data)
    }

    async updatePaymentIntent(orderId: string, customerId: Types.ObjectId, paymentIntentId: string): Promise<IOrder | null> {
        return await Order.findOneAndUpdate({
            _id: new Types.ObjectId(orderId),
            customerId,
            paymentStatus: PaymentStatus.PENDING,
            orderStatus: OrderStatus.PENDING_PAYMENT
        },
            {
                $set: {
                    stripePaymentIntentId: paymentIntentId,
                },

            },
            {
                new: true,
                runValidators: true
            }
        )

    }

    async findByIdAndCustomerId(orderId: string, customerId: Types.ObjectId): Promise<IOrder | null> {
        return await Order.findOne({
            _id: new Types.ObjectId(orderId),
            customerId,
        }).populate("hotelId", "hotelName")
    }

    async findAllByCustomerId(customerId: Types.ObjectId): Promise<IOrder[]> {
        return await Order.find({
            customerId,
            paymentStatus: { $ne: PaymentStatus.PENDING },
        })
            .populate("hotelId", "hotelName")
            .sort({ createdAt: -1 })
    }

    async findByPaymentIntentId(paymentIntentId: string, session?: ClientSession): Promise<IOrder | null> {
        const query = Order.findOne({ stripePaymentIntentId: paymentIntentId })
        return session ? query.session(session) : query
    }
    async pickupCodeExists(pickupCode: string, session?: ClientSession): Promise<boolean> {
        const query = Order.exists({
            pickupCode,
        })
        const existingOrder = session ? await query.session(session) : await query
        return existingOrder !== null
    }

    async markPaymentFailed(paymentIntentId: string): Promise<IOrder | null> {
        return await Order.findOneAndUpdate(
            {
                stripePaymentIntentId: paymentIntentId,
                paymentStatus: PaymentStatus.PENDING,
                orderStatus: OrderStatus.PENDING_PAYMENT
            },
            {
                $set: {
                    paymentStatus: PaymentStatus.FAILED,
                    orderStatus: OrderStatus.CANCELLED

                }
            },
            {
                new: true,
                runValidators: true
            }
        )

    }

    async markOrderPaid(paymentIntentId: string, data: IMarkOrderPaidData, session?: ClientSession): Promise<IOrder | null> {
        const options: Record<string, unknown> = {
            new: true,
            runValidators: true,
        }
        if (session) {
            options.session = session
        }
        return await Order.findOneAndUpdate(
            {
                stripePaymentIntentId: paymentIntentId,
                paymentStatus: PaymentStatus.PENDING,
                orderStatus: OrderStatus.PENDING_PAYMENT,
            },
            {
                $set: {
                    paymentStatus: PaymentStatus.PAID,
                    orderStatus: OrderStatus.PLACED,
                    pickupCode: data.pickupCode,
                    pickupWindow: data.pickupWindow,
                    paidAt: data.paidAt,
                }
            },
            options
        )
    }
    //find pickupcode:populate vendor name
    async findByPickupCode(pickupCode: string): Promise<IOrder | null> {
        return await Order.findOne({ pickupCode })
            .populate("hotelId", "hotelName");
    }

    async markOrderCollected(orderId: string, collectedAt: Date, session?: ClientSession): Promise<IOrder | null> {
        const options: Record<string, unknown> = {
            new: true,
            runValidators: true,
        };
        if (session) {
            options.session = session;
        }

        return await Order.findOneAndUpdate(
            {
                _id: new Types.ObjectId(orderId),
                orderStatus: OrderStatus.PLACED,
                paymentStatus: PaymentStatus.PAID,
            },
            {
                $set: {
                    orderStatus: OrderStatus.COLLECTED,
                    collectedAt,
                    settlementStatus: SettlementStatus.RELEASED,
                    settledAt: collectedAt,
                },
            },
            options
        ).populate("hotelId", "hotelName");
    }
    /*
    //find the orders belong to the loggedin vendor
    only the respective vendir can seethe respective oder
    if the customer payment failed so the order remain pending

    */

    async findById(orderId: string): Promise<IOrder | null> {
        return await Order.findById(orderId).populate("hotelId", "hotelName");
    }

    async updateOrderStatus(orderId: string, orderStatus: OrderStatus): Promise<IOrder | null> {
        return await Order.findByIdAndUpdate(
            orderId,
            { $set: { orderStatus } },
            { new: true }
        );
    }

    async findAllByVendorId(vendorId: Types.ObjectId): Promise<IOrder[]> {
        return await Order.find({
            vendorId,
            paymentStatus: { $ne: PaymentStatus.PENDING },
        })
        .populate("hotelId", "hotelName")
        .sort({ createdAt: -1 });
    }
}