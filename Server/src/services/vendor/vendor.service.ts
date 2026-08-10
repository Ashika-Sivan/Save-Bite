import {
    ICreateVendorDTO,
    IVendorCreateData,
    IVendorStatusResponseDTO,
} from "../../dtos/vendor.dto";
import { IVendorRepository } from "../../interfaces/repository/IVendorRepository";
import { IVendorService } from "../../interfaces/service/vendor/IVendorService";
import { IVendor, VendorStatus } from "../../interfaces/models/IVendor.model";
import { uploadToS3 } from "../../utils/uploadToS3";
import { AppError } from "../../errors/AppError";
import { StatusCode } from "../../constants/statusCode";
import { VENDOR_MESSAGES } from "../../constants/messages";
import { validateVendorVertification } from "../../validations/vendor.validations";

export class VendorService implements IVendorService {
    constructor(private vendorRepository: IVendorRepository) {}

    async registerVendor(
        ownerId: string,
        data: ICreateVendorDTO,
        files: { [fieldName: string]: Express.Multer.File[] }
    ): Promise<IVendor> {
        const existingVendor = await this.vendorRepository.findByOwnerId(
            ownerId
        );

        if (existingVendor) {
            if (existingVendor.status === VendorStatus.PENDING) {
                throw new AppError(
                    VENDOR_MESSAGES.APPLICATION_PENDING,
                    StatusCode.CONFILCT
                );
            }

            if (existingVendor.status === VendorStatus.APPROVED) {
                throw new AppError(
                    VENDOR_MESSAGES.ALREADY_APPROVED,
                    StatusCode.CONFILCT
                );
            }

            if (existingVendor.status === VendorStatus.REJECTED) {
                throw new AppError(
                    VENDOR_MESSAGES.APPLICATION_REJECTED,
                    StatusCode.CONFILCT
                );
            }
        }

        validateVendorVertification(data.verification);

        const businessImage = files.businessImage?.[0];
        const gstCertificate = files.gstCertificate?.[0];
        const fssaiCertificate = files.fssaiCertificate?.[0];
        const panCard = files.panCard?.[0];
        const registrationCertificate =
            files.businessRegistrationCertificate?.[0];

        if (
            !businessImage ||
            !gstCertificate ||
            !fssaiCertificate ||
            !panCard ||
            !registrationCertificate
        ) {
            throw new AppError(
                VENDOR_MESSAGES.ALL_FILES_REQUIRED,
                StatusCode.BAD_REQUEST
            );
        }

        // Upload every vendor document to S3
        const businessImageUpload = await uploadToS3(
            businessImage,
            "vendor-business-images"
        );
        const gstUpload = await uploadToS3(gstCertificate, "vendor-documents");
        const fssaiUpload = await uploadToS3(
            fssaiCertificate,
            "vendor-documents"
        );
        const panUpload = await uploadToS3(panCard, "vendor-documents");
        const registrationUpload = await uploadToS3(
            registrationCertificate,
            "vendor-documents"
        );

        const vendorData: IVendorCreateData = {
            ownerId,
            businessInfo: {
                businessName: data.businessInfo.businessName,
                businessType: data.businessInfo.businessType,
                place: data.businessInfo.place,
                address: data.businessInfo.address,
                businessImageKey: businessImageUpload.key,
                location: {
                    type: "Point",
                    coordinates: [
                        data.businessInfo.longitude,
                        data.businessInfo.latitude,
                    ],
                },
            },
            verification: data.verification,
            documents: {
                gstCertificateKey: gstUpload.key,
                fssaiCertificateKey: fssaiUpload.key,
                panCardKey: panUpload.key,
                businessRegistrationCertificateKey: registrationUpload.key,
            },
        };

        return await this.vendorRepository.createVendor(vendorData);
    }

    async getVendorStatus(ownerId: string): Promise<IVendorStatusResponseDTO> {
    
        const vendor = await this.vendorRepository.findByOwnerId(ownerId);
        if (!vendor) {
            return { hasApplication: false };
        }
        return {
            hasApplication: true,
            status: vendor.status,
            rejectionReason: vendor.rejectionReason,
        };
    }

    async reapplyVendor(
        ownerId: string,
        data: ICreateVendorDTO,
        files: { [fieldName: string]: Express.Multer.File[] }
    ): Promise<IVendor> {
        const existingVendor = await this.vendorRepository.findByOwnerId(ownerId);

        if (!existingVendor) {
            throw new AppError(
                VENDOR_MESSAGES.NO_EXISTING_APPLICATION,
                StatusCode.NOT_FOUND
            );
        }

        if (existingVendor.status !== VendorStatus.REJECTED) {
            throw new AppError(
                VENDOR_MESSAGES.NOT_REJECTED,
                StatusCode.BAD_REQUEST
            );
        }

        validateVendorVertification(data.verification);

        const businessImage = files.businessImage?.[0];
        const gstCertificate = files.gstCertificate?.[0];
        const fssaiCertificate = files.fssaiCertificate?.[0];
        const panCard = files.panCard?.[0];
        const registrationCertificate =
            files.businessRegistrationCertificate?.[0];

        if (
            !businessImage ||
            !gstCertificate ||
            !fssaiCertificate ||
            !panCard ||
            !registrationCertificate
        ) {
            throw new AppError(
                VENDOR_MESSAGES.ALL_FILES_REQUIRED,
                StatusCode.BAD_REQUEST
            );
        }

        const businessImageUpload = await uploadToS3(
            businessImage,
            "vendor-business-images"
        );
        const gstUpload = await uploadToS3(gstCertificate, "vendor-documents");
        const fssaiUpload = await uploadToS3(
            fssaiCertificate,
            "vendor-documents"
        );
        const panUpload = await uploadToS3(panCard, "vendor-documents");
        const registrationUpload = await uploadToS3(
            registrationCertificate,
            "vendor-documents"
        );

        const vendorData: IVendorCreateData = {
            ownerId,
            businessInfo: {
                businessName: data.businessInfo.businessName,
                businessType: data.businessInfo.businessType,
                place: data.businessInfo.place,
                address: data.businessInfo.address,
                businessImageKey: businessImageUpload.key,
                location: {
                    type: "Point",
                    coordinates: [
                        data.businessInfo.longitude,
                        data.businessInfo.latitude,
                    ],
                },
            },
            verification: data.verification,
            documents: {
                gstCertificateKey: gstUpload.key,
                fssaiCertificateKey: fssaiUpload.key,
                panCardKey: panUpload.key,
                businessRegistrationCertificateKey: registrationUpload.key,
            },
        };

        const updatedVendor = await this.vendorRepository.reapplyVendor(ownerId, vendorData);

        if (!updatedVendor) {
            throw new AppError(
                VENDOR_MESSAGES.VENDOR_NOT_FOUND,
                StatusCode.NOT_FOUND
            );
        }

        return updatedVendor;
    }
}