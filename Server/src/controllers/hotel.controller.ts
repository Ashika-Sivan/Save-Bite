import { NextFunction, Response } from "express";
import { IHotelService } from "../interfaces/service/hotel/IHotelService";
import { AuthRequest } from "../types/authRequest";
import { AppError } from "../errors/AppError";
import { AUTH_MESSAGES, HOTEL_MESSAGES } from "../constants/messages";
import { StatusCode } from "../constants/statusCode";
import { ICreateHotelDTO } from "../dtos/hotel.dto";
import { ResponseHelper } from "../utils/ResponseHelper";
import App from "../app";

export class HotelController{
    constructor(private _hotelService:IHotelService){}
    async createHotel(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        try {
            const ownerId=req.user?.userId;
            if(!ownerId){
                throw new AppError(AUTH_MESSAGES.USER_NOT_AUTHENTICATED,StatusCode.UNAUTHORIZED)
            }

            if(!req.file){
                throw new AppError(HOTEL_MESSAGES.IMAGE_REQUIRED,StatusCode.BAD_REQUEST)
            }

            const latitude=req.body.latitude===undefined||req.body.latitude===""?Number.NaN:Number(req.body.latitude);
            const longitude=req.body.longitude===undefined||req.body.longitude===""?Number.NaN:Number(req.body.longitude);

            const hotelData:ICreateHotelDTO={
                hotelName:req.body.hotelName,
                businessType:req.body.businessType,
                place:req.body.place,
                address:req.body.address,
                latitude,
                longitude
            }
            const hotel=await this._hotelService.createHotel(ownerId,hotelData,req.file);

            ResponseHelper.success(res,StatusCode.CREATED,HOTEL_MESSAGES.CREATED,hotel);
        } catch (error) {
            
        }
    }
    async getVendorHotels(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        try {
            const ownerId=req.user?.userId;
            if(!ownerId){
                throw new AppError(AUTH_MESSAGES.USER_NOT_AUTHENTICATED,StatusCode.UNAUTHORIZED)
            }
            const hotels=await this._hotelService.getVendorHotels(ownerId)
            ResponseHelper.success(res,StatusCode.OK,HOTEL_MESSAGES.FETCHED,hotels)
            
        } catch (error) {
            next(error)
            
        }
    }
    async getHotelById(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        try {
            const ownerId=req.user?.userId;
            const hotelIdParam = req.params.hotelId;
            const hotelId=Array.isArray(hotelIdParam)?hotelIdParam[0]:hotelIdParam

            if(!ownerId){
                throw new AppError(AUTH_MESSAGES.USER_NOT_AUTHENTICATED,StatusCode.UNAUTHORIZED)
            }

            if(!hotelId){
                throw new AppError(HOTEL_MESSAGES.NOT_FOUND,StatusCode.NOT_FOUND)
            }
            const hotel=await this._hotelService.getHotelById(ownerId,hotelId)
            ResponseHelper.success(res,StatusCode.OK,HOTEL_MESSAGES.DETAILS_FETCHED,hotel)

            
        } catch (error) {
            next(error)
            
        }
    }
}