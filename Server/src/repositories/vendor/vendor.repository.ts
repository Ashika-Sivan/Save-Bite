//the main responsibily of this is save vendor and find vendor by owner id

import { createVendorDTO, VendorCreateData } from "../../dtos/vendor.dto";
import { Vendor } from "../../models/vendor/vendor.model";
import { IVendor, VendorStatus } from "../../interfaces/models/IVendor.model";
import { IVendorRepository } from "../../interfaces/repository/IVendorRepository";
import { Logger } from "../../utils/logger";

export class VendorRepository implements IVendorRepository{//how we created the vendor
    async createVendor(data:VendorCreateData):Promise<IVendor>{
        return await Vendor.create(data)
    }

    async findByOwnerId(ownerId:string):Promise<IVendor|null>{
        return await Vendor.findOne({ownerId})
    }

    async findAll(): Promise<IVendor[]> {
        return await Vendor.find().populate("ownerId","name email").sort({createdAt:-1})
    }

    async approveVendor(vendorId: string): Promise<IVendor | null> {
        Logger.info("Updating vendor approval status", { vendorId });
        return await Vendor.findByIdAndUpdate(
            vendorId,
            {
                status:VendorStatus.APPROVED,
                isLive:true,
                rejectionReason: null,

            },
            {
                new :true
            }
        )
    }

    async rejectVendor(vendorId: string,reason:string): Promise<IVendor | null> {
        return await Vendor.findByIdAndUpdate(
            vendorId,
            {
                status:VendorStatus.REJECTED,
                rejectionReason:reason,
                isLive:false
            },
            {new :true}
        )
        
    }

    async findById(vendorId: string): Promise<IVendor | null> {
        return await Vendor.findById(vendorId)
    }


}