import { NextFunction, Response } from "express";
import { ICustomerBrowseService, ILiveHotelBrowseQuery } from "../interfaces/service/customer/ICustomerBrowseService";
import { AuthRequest } from "../types/authRequest";
import { ResponseHelper } from "../utils/ResponseHelper";
import { StatusCode } from "../constants/statusCode";
import { AppError } from "../errors/AppError";

export class CustomerBrowseController{
    constructor(private readonly _customerBrowseService:ICustomerBrowseService){}
    async getLiveHotels(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        try {
            const query: ILiveHotelBrowseQuery = {};

            if(req.query.page!==undefined){
                query.page=Number(req.query.page);
            }
            if (req.query.limit !== undefined) {
                query.limit = Number(req.query.limit);
            }
            if (req.query.latitude !== undefined) {
                query.latitude = Number(
                    req.query.latitude
                );
            }
            if (req.query.longitude !== undefined) {
                query.longitude = Number(
                    req.query.longitude
                );
            }
            const result=await this._customerBrowseService.getLiveHotels(query);
            ResponseHelper.success(res,StatusCode.OK,"live hotels fetched successfully",result)
            
            
        } catch (error) {
            next(error)
        }
    }

    async getLiveHotelMenu(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        try {
            const {hotelId}=req.params
            if(typeof hotelId!=="string"){
                throw new AppError("innvalid hotel id",StatusCode.BAD_REQUEST)
            }
            const result=await this._customerBrowseService.getLiveHotelMenu(hotelId)
            ResponseHelper.success(res,StatusCode.OK,"live hotel menu fetched successfully",result)
        } catch (error){

        next(error)
            
        }
    }
}