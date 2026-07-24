//the main responsibily of this is save vendor and find vendor by owner id

import { ICreateVendorDTO, IVendorCreateData } from "../../dtos/vendor.dto";
import { Vendor } from "../../models/vendor/vendor.model";
import { IVendor, VendorStatus } from "../../interfaces/models/IVendor.model";
import { IVendorRepository } from "../../interfaces/repository/IVendorRepository";
import { Logger } from "../../utils/logger";
import { IUser, User } from "../../models/user/user.model";

export class VendorRepository implements IVendorRepository{//how we created the vendor
    async createVendor(data:IVendorCreateData):Promise<IVendor>{
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
                // isLive:true,
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
    async getAllUsers(): Promise<IUser[]> {
        return await User.find({role:'user'}).select("-password").sort({createdAt:-1})
    }

    async updateUserStatus(userId: string, isActive: boolean): Promise<IUser | null> {
        return await User.findByIdAndUpdate(userId,{isActive},{new:true}).select("-password")
    }
    //  async getVendorById(vendorId: string): Promise<IVendor | null> {
    //     return await Vendor.findById(vendorId)
    // }

}