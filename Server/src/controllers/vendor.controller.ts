import {  Response } from "express";
import { IVendorService } from "../interfaces/service/IVendorService";
import { AuthRequest } from "../types/authRequest";



export class VendorController{
    constructor(
        private _vendorService:IVendorService
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

        // if(!req.file){
        //     res.status(400).json({
        //         success:false,
        //         message:"Vendor Certificate required"
        //     })
        //     return 
        // }
        const files=req.files as{
            [filedName:string]:Express.Multer.File[]
        }

        const data={
            businessInfo:JSON.parse(req.body.businessInfo),
            verification:JSON.parse(req.body.verification),
        };

        const vendor=await this._vendorService.registerVendor(
            ownerId,
            data,
            files
            
  
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