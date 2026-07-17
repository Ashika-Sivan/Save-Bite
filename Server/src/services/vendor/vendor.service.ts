
import { createVendorDTO, VendorCreateData } from "../../dtos/vendor.dto";
import { IVendorRepository } from "../../interfaces/repository/IVendorRepository";
import { IVendorService } from "../../interfaces/service/IVendorService";
import { IVendor, VendorStatus } from "../../interfaces/models/IVendor.model";
import { uploadToS3 } from "../../utils/uploadToS3";
import { AppError } from "../../errors/AppError";
import { IUserRepository } from "../../interfaces/repository/IUserRepository";
import { Vendor } from "../../models/vendor/vendor.model";


export class VendorService implements IVendorService{
    constructor(
        private vendorRepository:IVendorRepository,
        private  _userRepository:IUserRepository
    ){}

    async registerVendor(
        ownerId: string,
        data: createVendorDTO,
        files: { [fieldName: string]: Express.Multer.File[] }
    ): Promise<IVendor> {
        const existingVendor =
            await this.vendorRepository.findByOwnerId(ownerId);

        if (existingVendor) {
            // throw new Error("Vendor application already exists");

            if(existingVendor.status===VendorStatus.PENDING){
                throw new AppError(
                    "Your vendor application is already pending",
                    409
                )

            }

            if(existingVendor.status===VendorStatus.APPROVED){
                throw new AppError(
                    "your are already an approved vendor",409
                )
            }
            if(existingVendor.status===VendorStatus.REJECTED){
                throw new AppError(
                    "your vendor application was rejected",409
                )
            }
        }

        const businessImage = files.businessImage?.[0];//if file exist take first file otherwise return undefined
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
            throw new Error("All files are required");
        }

        //here we are uploading every file to s3

        const businessImageUpload = await uploadToS3(
            businessImage,
            "vendor-business-images"
        );

        const gstUpload = await uploadToS3(
            gstCertificate,
            "vendor-documents"
        );

        const fssaiUpload = await uploadToS3(
            fssaiCertificate,
            "vendor-documents"
        );

        const panUpload = await uploadToS3(
            panCard,
            "vendor-documents"
        );

        const registrationUpload = await uploadToS3(
            registrationCertificate,
            "vendor-documents"
        );

        const vendorData: VendorCreateData = {
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
                        data.businessInfo.latitude
                    ]
                }
            },

            verification: data.verification,

            documents: {
                gstCertificateKey: gstUpload.key,
                fssaiCertificateKey: fssaiUpload.key,
                panCardKey: panUpload.key,
                businessRegistrationCertificateKey:
                    registrationUpload.key
            }
        };

        return await this.vendorRepository.createVendor(vendorData);
    }

    //ADMIN..........................................

    async getAllVendors(): Promise<IVendor[]> {
        return await this.vendorRepository.findAll()
    }

    async approveVendor(vendorId: string): Promise<IVendor> {
        const vendor=await this.vendorRepository.approveVendor(vendorId)
        if(!vendor){
            throw new AppError("vendor not found",404)
        }

        await this._userRepository.updateRole(
            vendor.ownerId.toString(),
            "vendor"
        );
        return vendor
    }

    async rejectVendor(vendorId: string, reason: string): Promise<IVendor> {
        if(!reason.trim()){
            throw new AppError("Rejection reason is required",400);
        }
            const vendor=await this.vendorRepository.rejectVendor(
                vendorId,
                reason
            );

            if(!vendor){
                throw new AppError("vendor not found",404)
            }
            return vendor
    }
}

// {
//     key: "vendor-certificates/random-file-name.pdf"
// }