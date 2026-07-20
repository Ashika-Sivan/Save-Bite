import { createVendorDTO } from "../../dtos/vendor.dto";
import { IVendor, VendorStatus } from "../models/IVendor.model";

export interface IVendorService{
    registerVendor(
        ownerId:string,
        data:createVendorDTO,
        files:{
            [fieldName:string]:Express.Multer.File[]
        }
    ):Promise<IVendor>


    getAllVendors():Promise<IVendor[]>
    approveVendor(vendorId:string):Promise<IVendor>
    rejectVendor(vendorId:string,reason:string):Promise<IVendor>
    getVendorStatus(ownerId:string):Promise<{
        hasApplication:boolean;
        status?:VendorStatus,
        rejectReason?:string|null
    }>;

}