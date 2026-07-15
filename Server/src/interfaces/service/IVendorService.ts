import { createVendorDTO } from "../../dtos/vendor.dto";
import { IVendor } from "../../models/vendor/vendor.model";

export interface IVendorService{
    registerVendor(
        ownerId:string,
        data:createVendorDTO,
        files:{
            [fieldName:string]:Express.Multer.File[]
        }
    ):Promise<IVendor>

}