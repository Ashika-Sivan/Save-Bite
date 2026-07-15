//the main responsibily of this is save vendor and find vendor by owner id

import { createVendorDTO, VendorCreateData } from "../../dtos/vendor.dto";
import { IVendor, Vendor } from "../../models/vendor/vendor.model";
import { IVendorRepository } from "../../interfaces/repository/IVendorRepository";

export class VendorRepository implements IVendorRepository{//how we created the vendor
    async createVendor(data:VendorCreateData):Promise<IVendor>{
        return await Vendor.create(data)
    }

    async findByOwnerId(ownerId:string):Promise<IVendor|null>{
        return await Vendor.findOne({ownerId})
    }


}