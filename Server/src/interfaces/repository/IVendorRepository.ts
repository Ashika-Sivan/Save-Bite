import { createVendorDTO, VendorCreateData } from "../../dtos/vendor.dto";
import { IVendor } from "../../models/vendor/vendor.model";

export interface IVendorRepository{
   createVendor(data:VendorCreateData):Promise<IVendor>;
   findByOwnerId(ownerId:string):Promise<IVendor|null>
}