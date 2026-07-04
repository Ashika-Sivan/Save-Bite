import { Request, Response } from "express";
import { IVendorService } from "../interfaces/service/IVendorService";
import { createVendorDTO } from "../dtos/vendor.dto";
import { AuthRequest } from "../types/authRequest";



export class VendorController{
    constructor(
        private vendorService:IVendorService
    ){}

    async registerVendor(req:AuthRequest,res:Response):Promise<void>{
       try {
        const ownerId=req.user?.userId;//jwt middlewre
        if(!ownerId){
            res.status(401).json({
                success:false,
                message:'user not authenticated'
            })
            return ;
        }

        const vendor=await this.vendorService.registerVendor(
            ownerId,
            req.body
        )
        res.status(201).json({
            success:true,
            message:'vendor application sumitted succesfully',
            vendor,
        })
        
       } catch (error) {
        res.status(400).json({
            success:false,
            message:error instanceof Error ? error.message : "Something went wrong",
        })
        
       }
    }
}