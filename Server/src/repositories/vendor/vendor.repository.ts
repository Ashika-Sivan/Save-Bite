//the main responsibily of this is save vendor and find vendor by owner id

import { IVendorCreateData } from "../../dtos/vendor.dto";
import { IPopulatedVendorOwner, IVendorWithOwner, Vendor } from "../../models/vendor/vendor.model";
import { IVendor, VendorStatus } from "../../interfaces/models/IVendor.model";
import { IVendorRepository } from "../../interfaces/repository/IVendorRepository";
import { Logger } from "../../utils/logger";
import { IUser, User } from "../../models/user/user.model";
import { BaseRepository } from "../base.repository";

export class VendorRepository extends BaseRepository<IVendor> implements IVendorRepository {//how we created the vendor
    constructor() {
        super(Vendor)
    }
    async createVendor(data: IVendorCreateData): Promise<IVendor> {
        return await Vendor.create(data)
    }

    async findByOwnerId(ownerId: string): Promise<IVendor | null> {
        return await Vendor.findOne({ ownerId })
    }

    async findAllWithOwner(): Promise<IVendorWithOwner[]> {
        const vendors = await Vendor.find()
            .populate<{ ownerId: IPopulatedVendorOwner }>(
                "ownerId",
                "name email phone"
            )
            .sort({ createdAt: -1 });

        return vendors;
    }

    async approveVendor(vendorId: string): Promise<IVendor | null> {
        Logger.info("Updating vendor approval status", { vendorId });
        return await Vendor.findByIdAndUpdate(
            vendorId,
            {
                status: VendorStatus.APPROVED,
                // isLive:true,
                rejectionReason: null,

            },
            {
                new: true
            }
        )
    }

    async rejectVendor(vendorId: string, reason: string): Promise<IVendor | null> {
        return await Vendor.findByIdAndUpdate(
            vendorId,
            {
                status: VendorStatus.REJECTED,
                rejectionReason: reason,
                isLive: false
            },
            { new: true }
        )

    }

    async findByIdWithOwner(vendorId: string): Promise<IVendorWithOwner | null> {
        const vendor = await Vendor.findById(vendorId).populate<{ ownerId: IPopulatedVendorOwner }>(
            "ownerId",
            "name email phone"
        )
        return vendor
    }

    async getAllUsers(): Promise<IUser[]> {
        return await User.find({ role: 'user' }).select("-password").sort({ createdAt: -1 })
    }

    async updateUserStatus(userId: string, isActive: boolean): Promise<IUser | null> {
        return await User.findByIdAndUpdate(userId, { isActive }, { new: true }).select("-password")
    }

}