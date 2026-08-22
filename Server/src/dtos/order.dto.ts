import { MenuUnitType } from "../interfaces/models/IDailyMenu.model";
import { OrderStatus, PaymentStatus, SettlementStatus } from "../interfaces/models/IOrder.model";

export interface ICheckoutItemDTO{
    itemId:string;
    quantity:number
}

/*
 * Request received when the customer
 * clicks Proceed to Payment.
 */
export interface ICreateCheckoutDTO{
    menuId:string;
    items:ICheckoutItemDTO[]
}


/*
 * Item returned in an order response.
 */
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

/*
 * Request payload for redeeming a pickup code.
 */
export interface IRedeemPickupCodeDTO {
    pickupCode: string;
}

/*
 * Response payload after successfully redeeming a pickup code.
 */
export interface IRedeemPickupCodeResponseDTO {
    message: string;
    order: IOrderResponseDTO;
}

