import {
    IAdminVendorDocumentListDTO,
    IAdminVendorListDTO,
} from "../../dtos/vendor.dto";
import { IVendorRepository } from "../../interfaces/repository/IVendorRepository";
import { IUserRepository } from "../../interfaces/repository/IUserRepository";
import { IAdminService } from "../../interfaces/service/admin/IAdminService";
import { IVendor, VendorStatus } from "../../interfaces/models/IVendor.model";
import { AppError } from "../../errors/AppError";
import { StatusCode } from "../../constants/statusCode";
import { VENDOR_MESSAGES, ADMIN_MESSAGES } from "../../constants/messages";
import { getSignedS3Url } from "../../utils/getSignedS3Url";
import {
    toAdminVendorDetailsDTO,
    toAdminVendorListDTO,
} from "../../mappers/vendor.mapper";
import { IAdminUserListDTO } from "../../dtos/user.dto";
import { toAdminUserListDTO } from "../../mappers/user.mapper";
import { IPaginatedResult, IPaginationOptions } from "../../types/pagination.types";
import { IOrderRepository } from "../../interfaces/repository/IOrderRepository";

export class AdminService implements IAdminService {
    constructor(
        private _vendorRepository: IVendorRepository,
        private _userRepository: IUserRepository,
        private _orderRespository:IOrderRepository
    ) { }

    async getAllVendors(options?: IPaginationOptions): Promise<IPaginatedResult<IAdminVendorListDTO>> {
        const page = Math.max(1, options?.page || 1);
        const limit = Math.max(1, options?.limit || 10);
        const { vendors, total } = await this._vendorRepository.findAllWithOwner(options);
        const totalPages = Math.ceil(total / limit);
       
        return {
            items: vendors.map(toAdminVendorListDTO),
            total,
            page,
            limit,
            totalPages,
        };
    }

    async approveVendor(vendorId: string): Promise<IVendor> {
        const existingVendor = await this._vendorRepository.findByIdWithOwner(vendorId);
        if (!existingVendor) {
            throw new AppError(
                VENDOR_MESSAGES.VENDOR_NOT_FOUND,
                StatusCode.NOT_FOUND
            );
        }

        if (existingVendor.status === VendorStatus.APPROVED) {
            throw new AppError(
                VENDOR_MESSAGES.VENDOR_ALREADY_APPROVED,
                StatusCode.BAD_REQUEST
            );
        }

        if (existingVendor.status === VendorStatus.REJECTED) {
            throw new AppError(
                ADMIN_MESSAGES.REJECTED_VENDOR_CANNOT_APPROVE,
                StatusCode.BAD_REQUEST
            );
        }

        const vendor = await this._vendorRepository.approveVendor(vendorId);
        if (!vendor) {
            throw new AppError(
                ADMIN_MESSAGES.VENDOR_APPROVE_FAILED,
                StatusCode.INTERNAL_SERVER_ERROR
            );
        }

        await this._userRepository.updateRole(
            vendor.ownerId.toString(),
            "vendor"
        );

        return vendor;
    }

    async rejectVendor(vendorId: string, reason: string): Promise<IVendor> {
        if (!reason || !reason.trim()) {
            throw new AppError(
                ADMIN_MESSAGES.REJECTION_REASON_REQUIRED,
                StatusCode.BAD_REQUEST
            );
        }

        const existingVendor = await this._vendorRepository.findByIdWithOwner(vendorId);
        if (!existingVendor) {
            throw new AppError(
                VENDOR_MESSAGES.VENDOR_NOT_FOUND,
                StatusCode.NOT_FOUND
            );
        }

        if (existingVendor.status === VendorStatus.REJECTED) {
            throw new AppError(
                ADMIN_MESSAGES.VENDOR_ALREADY_REJECTED,
                StatusCode.BAD_REQUEST
            );
        }

        if (existingVendor.status === VendorStatus.APPROVED) {
            throw new AppError(
                ADMIN_MESSAGES.APPROVED_VENDOR_CANNOT_REJECT,
                StatusCode.BAD_REQUEST
            );
        }

        const vendor = await this._vendorRepository.rejectVendor(
            vendorId,
            reason.trim()
        );

        if (!vendor) {
            throw new AppError(
                VENDOR_MESSAGES.VENDOR_NOT_FOUND,
                StatusCode.NOT_FOUND
            );
        }

        return vendor;
    }

    async getAllUsers(options?: IPaginationOptions): Promise<IPaginatedResult<IAdminUserListDTO>> {
        const page = Math.max(1, options?.page || 1);
        const limit = Math.max(1, options?.limit || 10);
        const { users, total } = await this._userRepository.getAllUsers(options);
        const totalPages = Math.ceil(total / limit);
        return {
            items: users.map(toAdminUserListDTO),
            total,
            page,
            limit,
            totalPages,
        };
    }


    async toggleUserStatus(userId: string): Promise<IAdminUserListDTO> {
        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new AppError(
                ADMIN_MESSAGES.USER_NOT_FOUND,
                StatusCode.NOT_FOUND
            );
        }

        const updatedUser = await this._userRepository.updateUserStatus(
            userId,
            !user.isActive
        );

        if (!updatedUser) {
            throw new AppError(
                ADMIN_MESSAGES.USER_STATUS_UPDATE_FAILED,
                StatusCode.INTERNAL_SERVER_ERROR
            );
        }

        return toAdminUserListDTO(updatedUser)
    }

    async toggleVendorStatus(vendorId: string): Promise<IAdminVendorListDTO> {
        const existingVendor = await this._vendorRepository.findByIdWithOwner(vendorId);
        if (!existingVendor) {
            throw new AppError(
                VENDOR_MESSAGES.VENDOR_NOT_FOUND,
                StatusCode.NOT_FOUND
            );
        }

        if (existingVendor.status === VendorStatus.PENDING || existingVendor.status === VendorStatus.REJECTED) {
            throw new AppError(
                "Cannot suspend a pending or rejected vendor.",
                StatusCode.BAD_REQUEST
            );
        }

        const newStatus = existingVendor.status === VendorStatus.APPROVED ? VendorStatus.SUSPENDED : VendorStatus.APPROVED;
        
        const vendor = await this._vendorRepository.toggleVendorStatus(vendorId, newStatus);
        if (!vendor) {
            throw new AppError(
                "Failed to update vendor status",
                StatusCode.INTERNAL_SERVER_ERROR
            );
        }

        // We also need to block/unblock the user account so they can't login if suspended
        if (existingVendor.ownerId && existingVendor.ownerId._id) {
            await this._userRepository.updateUserStatus(
                existingVendor.ownerId._id.toString(),
                newStatus === VendorStatus.APPROVED
            );
        }

        const updatedVendorWithPopulatedOwner = await this._vendorRepository.findByIdWithOwner(vendorId);
        if (!updatedVendorWithPopulatedOwner) {
            throw new AppError(
                "Vendor not found after update",
                StatusCode.NOT_FOUND
            );
        }

        return toAdminVendorListDTO(updatedVendorWithPopulatedOwner);
    }

    async getVendorById(
        vendorId: string
    ): Promise<IAdminVendorDocumentListDTO> {
        const vendor = await this._vendorRepository.findByIdWithOwner(vendorId);
        if (!vendor) {
            throw new AppError(
                ADMIN_MESSAGES.VENDOR_APPLICATION_NOT_FOUND,
                StatusCode.NOT_FOUND
            );
        }

        const documentUrls = {
            gstCertificateUrl: await getSignedS3Url(
                vendor.documents.gstCertificateKey
            ),
            fssaiCertificateUrl: await getSignedS3Url(
                vendor.documents.fssaiCertificateKey
            ),
            panCardUrl: await getSignedS3Url(vendor.documents.panCardKey),
            registrationCertificateUrl: await getSignedS3Url(
                vendor.documents.businessRegistrationCertificateKey
            ),
        };

        const vendorData = toAdminVendorDetailsDTO(vendor);

        return {
            vendor: vendorData,
            documentUrls,
        };
    }
}