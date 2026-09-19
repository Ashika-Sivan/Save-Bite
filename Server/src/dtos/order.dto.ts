import { MenuUnitType } from "../interfaces/models/IDailyMenu.model";
import { OrderStatus, PaymentStatus, SettlementStatus } from "../interfaces/models/IOrder.model";

export interface ICheckoutItemDTO{
    itemId:string;
    quantity:number
}


export interface ICreateCheckoutDTO{
    menuId:string;
    items:ICheckoutItemDTO[]
}



export interface IOrderItemResponseDTO{
    itemId:string;
    itemName:string;
    unitType:MenuUnitType;
    price:number;
    quantity:number;
    subTotal:number
}
export interface ICheckoutResponseDTO {
    orderId: string
    clientSecret: string
    totalAmount: number
    currency: string
}
export interface IOrderResponseDTO {
    id: string

    customerId: string
    vendorId: string
    vendorLocation?: {
        lat: number;
        lng: number;
    }
    hotelId: string
    hotelName: string
    menuId: string

    items: IOrderItemResponseDTO[]

    totalAmount: number
    currency: string

    paymentStatus:
        PaymentStatus

    orderStatus:
        OrderStatus

    settlementStatus:
        SettlementStatus

    pickupCode:
        string | null

    pickupWindow: {
        startTime: string
        endTime: string
    } | null

    paidAt:
        string | null

    collectedAt:
        string | null

    createdAt: string
    updatedAt: string
}


export interface IRedeemPickupCodeDTO {
    pickupCode: string;
}


export interface IRedeemPickupCodeResponseDTO {
    message: string;
    order: IOrderResponseDTO;
}

