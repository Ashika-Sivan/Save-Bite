import { NextFunction, Request, Response } from "express";
import { IVendorService } from "../interfaces/service/IVendorService";
import { Logger } from "../utils/logger";


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
    // Logger.info("vendor controlller hit.........")
    console.log('vendor hirt')
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
   
}