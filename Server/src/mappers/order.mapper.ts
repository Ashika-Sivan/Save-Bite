import { Types } from "mongoose";
import { IOrderResponseDTO, IOrderItemResponseDTO } from "../dtos/order.dto";
import { IOrder, IOrderItem } from "../interfaces/models/IOrder.model";

export const toOrderItemResponseDTO = (item: IOrderItem): IOrderItemResponseDTO => {
    return {
        itemId: item.itemId.toString(),
        itemName: item.itemName,
        unitType: item.unitType,
        price: item.price,
        quantity: item.quantity,
        subTotal: item.subtotal
    };
};

export const toOrderResponseDTO = (order: IOrder): IOrderResponseDTO => {
    const hotelObj = order.hotelId as unknown as { _id: Types.ObjectId; hotelName?: string };
    const hotelName = typeof hotelObj === "object" && hotelObj?.hotelName ? hotelObj.hotelName : "";
    
    const vendorObj = order.vendorId as unknown as any;
    let vendorLocation;
    if (vendorObj && typeof vendorObj === "object" && vendorObj.businessInfo?.location?.coordinates) {
        const [lng, lat] = vendorObj.businessInfo.location.coordinates;
        vendorLocation = { lat, lng };
    }

    return {
        id: order._id.toString(),
        customerId: order.customerId.toString(),
        vendorId: (vendorObj?._id ?? order.vendorId).toString(),
        vendorLocation,
        hotelId: (hotelObj?._id ?? order.hotelId).toString(),
        hotelName,
        menuId: order.menuId.toString(),
        items: order.items.map(toOrderItemResponseDTO),
        totalAmount: order.totalAmount,
        currency: order.currency,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        settlementStatus: order.settlementStatus,
        pickupCode: order.pickupCode,
        pickupWindow: order.pickupWindow ? {
            startTime: order.pickupWindow.startTime.toISOString(),
            endTime: order.pickupWindow.endTime.toISOString()
        } : null,
        paidAt: order.paidAt ? order.paidAt.toISOString() : null,
        collectedAt: order.collectedAt ? order.collectedAt.toISOString() : null,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString()
    };
};
