import { NextFunction, Request, Response } from "express";
import { IVendorService } from "../interfaces/service/IVendorService";
import { Logger } from "../utils/logger";
import { StatusCode } from "../constants/statusCode";
import { AppError } from "../errors/AppError";



export class AdminController{
   constructor(
    private readonly _vendorService:IVendorService
   ){}

   async getAllVendors(req:Request,res:Response,next:NextFunction):Promise<void>{
    
    try {
        const vendors=await this._vendorService.getAllVendors();
        res.status(200).json({
            success:true,
            message:"Vendor fetched successfully",
            data:vendors
        })
        
    } catch (error) {
        next(error)
        
    }
   }

   async approveVendor(req:Request<{vendorId:string}>,res:Response,next:NextFunction){
    Logger.info("vendor controlller hit.........")
        try {
            const {vendorId}=req.params
            Logger.info('Approving vendor with ID:', {vendorId,length:vendorId.length});
            const vendor=await this._vendorService.approveVendor(vendorId);
            res.status(200).json({
                success:true,
                message:'vendor approved successfully',
                data:vendor
            })
        } catch (error) {
            next(error)
            
        }
   }


   async rejectVendor(req:Request<{vendorId:string}>,res:Response,next:NextFunction):Promise<void>{
    try {
        const {vendorId}=req.params;
        const {reason}=req.body
        const vendor=await this._vendorService.rejectVendor(
            vendorId,
            reason
        )

        res.status(200).json({
            success:true,
            message:"vendor rejected successfully",
            data:vendor,
        })
    } catch (error) {
        next(error)
        
    }

   }
   async getAllUsers(req:Request,res:Response,next:NextFunction){
    try {
        const users=await this._vendorService.getAllUsers()
        res.status(200).json({success:true,message:'user fetched successfully',data:users})
        
    } catch (error) {
        next(error)
        
    }
   }

   async toggleUserStatus(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            const {userId}=req.params
            if(!userId||Array.isArray(userId)){
                res.status(400).json({
                    success: false,
                    message: "Valid user ID is required"
                });
                return;

            }
            const updatedUser=await this._vendorService.toggleUserStatus(userId);
            res.status(200).json({
                success:true,
                message:updatedUser.isActive?"user unblocked successfully":"user blocked successfull",
                data:updatedUser
            })

            
        } catch (error) {
            next(error)
            
        }
   }
   async getVendorById(req:Request,res:Response,next:NextFunction):Promise<void>{
       try {
        const vendorId=req.params.vendorId
        if(!vendorId||Array.isArray(vendorId)){
            throw new AppError("vendor id is required",StatusCode.BAD_REQUEST)
        }
        const result=await this._vendorService.getVendorById(vendorId)
        res.status(StatusCode.OK).json({success:true,message:"vendor fetched successfully,",result})
        
       } catch (error) {
        next(error)
        
       }
   }
   
}