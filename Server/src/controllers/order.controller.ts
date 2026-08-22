import { NextFunction, Response } from "express";
import stripe from "../config/stripe";
import Stripe from "stripe";
import { IOrderService } from "../interfaces/service/order/IOrder.service";
import { AuthRequest } from "../types/authRequest";
import { AppError } from "../errors/AppError";
import { AUTH_MESSAGES, ORDER_MESSAGES } from "../constants/messages";
import { StatusCode } from "../constants/statusCode";
import { ResponseHelper } from "../utils/ResponseHelper";

export class OrderController{
    constructor(private readonly _orderService:IOrderService){}

    async createCheckout(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        try {
            const customerId=req.user?.userId//authenticated user
            if(!customerId){
                throw new AppError(AUTH_MESSAGES.USER_NOT_AUTHENTICATED,StatusCode.UNAUTHORIZED);
            }
            const checkout=await this._orderService.createCheckout(customerId,req.body);
            ResponseHelper.success(res,StatusCode.CREATED,ORDER_MESSAGES.CHECKOUT_CREATED,checkout)
            
        } catch (error) {
            next(error)
            
        }
    }
    async getOrderById(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        try {
            const customerId=req.user?.userId//authentixated user
            const orderId=req.params.orderId

            if(!customerId){
                throw new AppError(AUTH_MESSAGES.USER_NOT_AUTHENTICATED,StatusCode.UNAUTHORIZED)
            }
            if(typeof orderId!=="string"){
                throw new AppError("Invalid order ID",StatusCode.BAD_REQUEST)
            }
            const order=await this._orderService.getOrderById(customerId,orderId);
            ResponseHelper.success(
                res,
                StatusCode.OK,
                ORDER_MESSAGES.ORDER_FETCHED,
                order
            ) 
        } catch (error) {
            next(error)
            
        }
    }
    async getMyOrders(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        try {
            const customerId=req.user?.userId
            if(!customerId){
                throw new AppError(AUTH_MESSAGES.USER_NOT_AUTHENTICATED,StatusCode.UNAUTHORIZED)
            }
            const orders=await this._orderService.getMyOrders(customerId);
            ResponseHelper.success(
                res,
                StatusCode.OK,
                ORDER_MESSAGES.CUSTOMER_ORDERS_FETCHED,
                orders
            )
        } catch (error) {
            next(error)
        }
    }
    async verifyPayment(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        try {
            const customerId=req.user?.userId
            const orderId=req.params.orderId

            if(!customerId){
                throw new AppError(AUTH_MESSAGES.USER_NOT_AUTHENTICATED,StatusCode.UNAUTHORIZED)
            }
            if(typeof orderId!=="string"){
                throw new AppError("Invalid order ID",StatusCode.BAD_REQUEST)
            }
            const order=await this._orderService.verifyPayment(customerId,orderId);
            ResponseHelper.success(
                res,
                StatusCode.OK,
                ORDER_MESSAGES.PAYMENT_VERIFIED,
                order
            ) 
        } catch (error) {
            next(error)
            
        }
    }
    async handleWebhook(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        try {
            const signature=req.headers["stripe-signature"]
            const webhookSecret:string|undefined=process.env.STRIPE_WEBHOOK_SECRET;
            if(typeof signature!=='string'){
                throw new AppError("Stripe signature is missing", StatusCode.BAD_REQUEST);
            }
            if(!webhookSecret){
                  throw new AppError("Stripe webhook secret is missing", StatusCode.BAD_REQUEST);
            }
            let event:Stripe.Event
            try {
                 event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
                
            } catch {
                throw new AppError("Invalid Stripe webhook signature", StatusCode.BAD_REQUEST);
                
            }
            switch(event.type){
                case "payment_intent.succeeded":{
                    const paymentIntent=event.data.object as Stripe.PaymentIntent
                    await this._orderService.handlePaymentSucceeded(paymentIntent.id)
                    break;
                }
                case "payment_intent.payment_failed":{
                    const paymentIntent=event.data.object as Stripe.PaymentIntent
                    await this._orderService.handlePaymentFailed(paymentIntent.id)
                    break;
                }
                default:
                break
            }
            res.status(StatusCode.OK).json({recieved:true})
            
        } catch (error) {
            next(error)
            
        }
    }

    async redeemPickupCode(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const ownerId = req.user?.userId;
            if (!ownerId) {
                throw new AppError(AUTH_MESSAGES.USER_NOT_AUTHENTICATED, StatusCode.UNAUTHORIZED);
            }
            const result = await this._orderService.redeemPickupCode(ownerId, req.body);
            ResponseHelper.success(res, StatusCode.OK, result.message, result.order);
        } catch (error) {
            next(error);
        }
    }

    async getVendorOrders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const ownerId = req.user?.userId;
            if (!ownerId) {
                throw new AppError(AUTH_MESSAGES.USER_NOT_AUTHENTICATED, StatusCode.UNAUTHORIZED);
            }
            const orders = await this._orderService.getVendorOrders(ownerId);
            ResponseHelper.success(res, StatusCode.OK, "Vendor orders fetched successfully", orders);
        } catch (error) {
            next(error);
        }
    }
}