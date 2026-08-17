import { API_ROUTES } from "../constants/apiRoutes";
import api from "./api";

export interface CheckoutItemData{
    itemId:string;
    quantity:number
}
export interface CreateCheckoutData{
    menuId:string;
    items:CheckoutItemData[]
}
export interface CheckoutData{
    orderId:string;
    clientSecret:string;
    totalAmount:number;
    currency:string
}
export interface OrderItem{
    itemId:string;
    itemName:string;
    unitType:string;
    price:number;
    quantity:number
    subTotal:number

}

export interface Order{
    id:string;
    customerId:string;
    vendorId:string;
    hotelId:string;
    hotelName?:string;
    menuId:string;
    items:OrderItem[]
    totalAmount:number;
    currency:string;
    paymentStatus:"pending"|"paid"|"failed";
    orderStatus:"pending_payment"|"placed"|"collected"|"expired"|"cancelled";
    settlementStatus:"pending"|"released";
    pickupCode:string|null
      pickupWindow: {
        startTime: string;
        endTime: string;
    } | null;
    collectedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const createCheckout=async(data:CreateCheckoutData):Promise<ApiResponse<CheckoutData>>=>{
    const response=await api.post<ApiResponse<CheckoutData>>(API_ROUTES.ORDER.CREATE_CHECKOUT,data)
    return response.data
}
export const getOrderById=async(orderId:string):Promise<ApiResponse<Order>>=>{
    const response=await api.get<ApiResponse<Order>>(API_ROUTES.ORDER.GET_ORDER_BY_ID(orderId))
    return response.data
}
export const getMyOrders=async():Promise<ApiResponse<Order[]>>=>{
    const response=await api.get<ApiResponse<Order[]>>(API_ROUTES.ORDER.GET_MY_ORDERS)
    return response.data
}
export const verifyPayment=async(orderId:string):Promise<ApiResponse<Order>>=>{
    const response=await api.get<ApiResponse<Order>>(API_ROUTES.ORDER.VERIFY_PAYMENT(orderId))
    return response.data
}

export const getVendorOrders = async (): Promise<ApiResponse<Order[]>> => {
    const response = await api.get<ApiResponse<Order[]>>(API_ROUTES.ORDER.VENDOR_ORDERS);
    return response.data;
};

export const redeemPickupCode = async (pickupCode: string): Promise<ApiResponse<Order>> => {
    const response = await api.post<ApiResponse<Order>>(API_ROUTES.ORDER.REDEEM_PICKUP_CODE, { pickupCode });
    return response.data;
};