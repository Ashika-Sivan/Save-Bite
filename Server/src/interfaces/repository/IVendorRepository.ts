import { createVendorDTO, VendorCreateData } from "../../dtos/vendor.dto";
import { IVendor} from "../models/IVendor.model";

export interface IVendorRepository{
   createVendor(data:VendorCreateData):Promise<IVendor>;
   findByOwnerId(ownerId:string):Promise<IVendor|null>
   findAll():Promise<IVendor[]>
   approveVendor(vendorId:string):Promise<IVendor|null>
   rejectVendor(vendorId:string,reason:string):Promise<IVendor|null>
   findById(vendorId:string):Promise<IVendor|null>
}