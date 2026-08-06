import { NextFunction, response, Response } from "express";
import { IDailyMenuService } from "../interfaces/service/vendor/IDailyMenuService";
import { AuthRequest } from "../types/authRequest";
import { AppError } from "../errors/AppError";
import { AUTH_MESSAGES, DAILY_MENU_MESSAGES } from "../constants/messages";
import { STATUS_CODES } from "node:http";
import { StatusCode } from "../constants/statusCode";
import { ResponseHelper } from "../utils/ResponseHelper";
import App from "../app";

export class DailyMenuController{
    constructor(private readonly _dailyMenuService:IDailyMenuService){}

    async createMenu(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        try {
            const ownerId=req.user?.userId;
            const hotelId=req.params.hotelId;

            if(!ownerId){
                throw new AppError(AUTH_MESSAGES.USER_NOT_AUTHENTICATED,StatusCode.UNAUTHORIZED)

            }

            if(typeof hotelId!=='string'){
                throw new AppError("invalid hotel id",StatusCode.BAD_REQUEST)
            }
            const menu=await this._dailyMenuService.createMenu(ownerId,hotelId,req.body)
            ResponseHelper.success(res,StatusCode.CREATED,DAILY_MENU_MESSAGES.CREATED,menu)
            
        } catch (error) {
            next(error)
            
        }
    }

    async addMenuItem(req: AuthRequest, res: Response,next: NextFunction): Promise<void> {
        try {
            const ownerId = req.user?.userId;
            const menuId = req.params.menuId;

            if (!ownerId) {
                throw new AppError(
                    AUTH_MESSAGES.USER_NOT_AUTHENTICATED,
                    StatusCode.UNAUTHORIZED
                );
            }

            if (typeof menuId !== "string") {
                throw new AppError(
                    "Invalid menu ID",
                    StatusCode.BAD_REQUEST
                );
            }

            const menu =
                await this._dailyMenuService.addMenuItem(
                    ownerId,
                    menuId,
                    req.body
                );

            ResponseHelper.success(
                res,
                StatusCode.CREATED,
                DAILY_MENU_MESSAGES.ITEM_ADDED,
                menu
            );
        } catch (error) {
            next(error);
        }
    }
    async goLive(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        try {
            const ownerId=req.user?.userId
            const menuId=req.params.menuId;

            if(!ownerId){
                throw new AppError(AUTH_MESSAGES.USER_NOT_AUTHENTICATED,StatusCode.UNAUTHORIZED)
            }

            if (typeof menuId !== "string") {
            throw new AppError("Invalid menu ID", StatusCode.BAD_REQUEST)
            }
            const menu=await this._dailyMenuService.goLive(ownerId,menuId);
            ResponseHelper.success(res,StatusCode.OK,DAILY_MENU_MESSAGES.GO_LIVE_SUCCESS,menu)
            
        } catch (error) {
            next(error)
            
        }
    }

    async getTodayMenu(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        try {
            const ownerId=req.user?.userId
            const hotelId=req.params.hotelId

            if(!ownerId){
                throw new AppError(AUTH_MESSAGES.USER_NOT_AUTHENTICATED,StatusCode.UNAUTHORIZED)
            }
            if(typeof hotelId!=='string'){
                throw new AppError("invalid hotel ID",StatusCode.BAD_REQUEST)
            }
            const menu=await this._dailyMenuService.getTodayMenu(ownerId,hotelId);
            ResponseHelper.success(res,StatusCode.OK,DAILY_MENU_MESSAGES.TODAY_MENU_FETCHED,menu)

            
        } catch (error) {
            next(error)
        }
    }
    async endLive(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        try {
            const ownerId=req.user?.userId
            const menuId=req.params.menuId

             if(!ownerId){
                throw new AppError(AUTH_MESSAGES.USER_NOT_AUTHENTICATED,StatusCode.UNAUTHORIZED)
            }
             if(typeof menuId!=='string'){
                throw new AppError("invalid menu ID",StatusCode.BAD_REQUEST)
            }
            const menu=await this._dailyMenuService.endLive(ownerId,menuId);
            ResponseHelper.success(res,StatusCode.OK,DAILY_MENU_MESSAGES.END_LIVE_SUCCESS,menu)


            
        } catch (error) {
            next(error)
            
        }
    }
    async updatePickupWindow(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        try {
            const ownerId = req.user?.userId;
             const menuId = req.params.menuId;

              if(!ownerId){
                throw new AppError(AUTH_MESSAGES.USER_NOT_AUTHENTICATED,StatusCode.UNAUTHORIZED)
            }
             if(typeof menuId!=='string'){
                throw new AppError("invalid menu ID",StatusCode.BAD_REQUEST)
            }
            const menu=await this._dailyMenuService.updatePickupWindow(ownerId,menuId,req.body);
            ResponseHelper.success(res,StatusCode.OK,DAILY_MENU_MESSAGES.PICKUP_WINDOW_UPDATED)
            
        } catch (error) {
             next(error);
            
        }
    }

    async updateMenuItem(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        try {
            const ownerId=req.user?.userId
            const{menuId,itemId}=req.params

            if(!ownerId){
                throw new AppError(AUTH_MESSAGES.USER_NOT_AUTHENTICATED,StatusCode.UNAUTHORIZED)
            }
            

            if(typeof menuId!=="string"||typeof itemId!=="string"){
                throw new AppError("invalid menu or item ID",StatusCode.BAD_REQUEST)
            }

            const menu=await this._dailyMenuService.updateMenuItem(ownerId,menuId,itemId,req.body)
            ResponseHelper.success(res,StatusCode.OK,DAILY_MENU_MESSAGES.ITEM_UPDATED)
        } catch (error) {
            next(error)
            
        }
    }

    

}