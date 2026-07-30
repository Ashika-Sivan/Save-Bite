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

export class AdminService implements IAdminService {
    constructor(
        private _vendorRepository: IVendorRepository,
        private _userRepository: IUserRepository
    ) { }

    async getAllVendors(): Promise<IAdminVendorListDTO[]> {
        const vendors = await this._vendorRepository.findAllWithOwner();
        return vendors.map(toAdminVendorListDTO);
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

    async getAllUsers(): Promise<IAdminUserListDTO[]> {
        const users = await this._vendorRepository.getAllUsers();
        return users.map(toAdminUserListDTO)
    }

    async toggleUserStatus(userId: string): Promise<IAdminUserListDTO> {
        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new AppError(
                ADMIN_MESSAGES.USER_NOT_FOUND,
                StatusCode.NOT_FOUND
            );
        }

        const updatedUser = await this._vendorRepository.updateUserStatus(
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