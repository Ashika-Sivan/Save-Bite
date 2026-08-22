//the main responsibily of this is save vendor and find vendor by owner id

import { IVendorCreateData } from "../../dtos/vendor.dto";
import { IPopulatedVendorOwner, IVendorWithOwner, Vendor } from "../../models/vendor/vendor.model";
import { IVendor, VendorStatus } from "../../interfaces/models/IVendor.model";
import { IVendorRepository } from "../../interfaces/repository/IVendorRepository";
import { Logger } from "../../utils/logger";
import { IUser, User } from "../../models/user/user.model";
import { BaseRepository } from "../base.repository";
import { IPaginationOptions } from "../../types/pagination.types";

export class VendorRepository extends BaseRepository<IVendor> implements IVendorRepository {
    constructor() {
        super(Vendor)
    }
    async createVendor(data: IVendorCreateData): Promise<IVendor> {
        return await Vendor.create(data)
    }

    async findByOwnerId(ownerId: string): Promise<IVendor | null> {
        return await Vendor.findOne({ ownerId })
    }

    async findAllWithOwner(options?: IPaginationOptions): Promise<{ vendors: IVendorWithOwner[]; total: number }> {
        const page = Math.max(1, options?.page || 1);
        const limit = Math.max(1, options?.limit || 10);
        const skip = (page - 1) * limit;
        const search = options?.search?.trim();
        const status = options?.status;

        const filterQuery: Record<string, unknown> = {};

        if (status && status !== "all") {
            filterQuery.status = status;
        }

        if (search) {
            const matchingOwners = await User.find({
                $or: [
                    { name: new RegExp(search, "i") },
                    { email: new RegExp(search, "i") },
                ],
            }).select("_id");
            const ownerIds = matchingOwners.map((u) => u._id);

            filterQuery.$or = [
                { "businessInfo.businessName": new RegExp(search, "i") },
                { "businessInfo.businessType": new RegExp(search, "i") },
                { "businessInfo.place": new RegExp(search, "i") },
                { ownerId: { $in: ownerIds } },
            ];
        }

        const total = await Vendor.countDocuments(filterQuery);
        const vendors = await Vendor.find(filterQuery)
            .populate<{ ownerId: IPopulatedVendorOwner }>(
                "ownerId",
                "name email phone"
            )
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return { vendors, total };
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

    async reapplyVendor(ownerId: string, data: IVendorCreateData): Promise<IVendor | null> {
        return await Vendor.findOneAndUpdate(
            { ownerId, status: VendorStatus.REJECTED },
            {
                ...data,
                status: VendorStatus.PENDING,
                rejectionReason: null,
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

    async getAllUsers(options?: IPaginationOptions): Promise<{ users: IUser[]; total: number }> {
        const page = Math.max(1, options?.page || 1);
        const limit = Math.max(1, options?.limit || 10);
        const skip = (page - 1) * limit;
        const search = options?.search?.trim();
        const status = options?.status;

        const filterQuery: Record<string, unknown> = { role: 'user' , isAuthenticated:true};

        if (status && status !== "all") {
            if (status === "active") {
                filterQuery.isActive = true;
            } else if (status === "blocked") {
                filterQuery.isActive = false;
            }
        }

        if (search) {
            filterQuery.$or = [
                { name: new RegExp(search, "i") },
                { email: new RegExp(search, "i") },
            ];
        }

        const total = await User.countDocuments(filterQuery);

        const users = await User.find(filterQuery)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
            

        return { users, total };
    }

    async updateUserStatus(userId: string, isActive: boolean): Promise<IUser | null> {
        return await User.findByIdAndUpdate(userId, { isActive }, { new: true }).select("-password")
    }

}
