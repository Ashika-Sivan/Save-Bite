import { ICheckoutResponseDTO, ICreateCheckoutDTO, IOrderResponseDTO, IRedeemPickupCodeDTO, IRedeemPickupCodeResponseDTO } from "../../../dtos/order.dto";

export interface IOrderService{
    createCheckout(customerId:string,data:ICreateCheckoutDTO):Promise<ICheckoutResponseDTO>
    getOrderById(customerId:string,orderId:string):Promise<IOrderResponseDTO>
    getMyOrders(customerId:string):Promise<IOrderResponseDTO[]>
    verifyPayment(customerId:string,orderId:string):Promise<IOrderResponseDTO>
    handlePaymentSucceeded(paymentIntentId: string): Promise<void>;
    handlePaymentFailed(paymentIntentId: string): Promise<void>;
    redeemPickupCode(ownerId: string, dto: IRedeemPickupCodeDTO): Promise<IRedeemPickupCodeResponseDTO>;
    getVendorOrders(ownerId: string): Promise<IOrderResponseDTO[]>;
}