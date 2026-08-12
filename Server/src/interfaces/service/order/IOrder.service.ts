import { ICheckoutResponseDTO, ICreateCheckoutDTO, IOrderResponseDTO } from "../../../dtos/order.dto";

export interface IOrderService{
    createCheckout(customerId:string,data:ICreateCheckoutDTO):Promise<ICheckoutResponseDTO>
    getOrderById(customerId:string,orderId:string):Promise<IOrderResponseDTO>
    getMyOrders(customerId:string):Promise<IOrderResponseDTO[]>
    verifyPayment(customerId:string,orderId:string):Promise<IOrderResponseDTO>
    handlePaymentSucceeded(paymentIntentId: string): Promise<void>;
    handlePaymentFailed(paymentIntentId: string): Promise<void>;
    
}