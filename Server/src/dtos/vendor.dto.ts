export interface BusinessInfoDTO{
    businessName:string;
    businessType:string;
    place:string;
    address:string;
    latitude:number;
    longitude:number;
    businessImage:string;
}

export interface VerificationDTO{
    gstNumber:string;
    panNumber:string;
    ifscCode:string;
    bankAccountNumber:string;
    fssaiNumber:string;
}

export interface DocumentsDTO{
    gstCertificate:string;
    fssaiCertificate:string;
    panCard:string;
    businessRegistrationCertificate:string
}

export interface createVendorDTO{
    businessInfo:BusinessInfoDTO;
    verification:VerificationDTO;
    documents:DocumentsDTO
}

export interface VendorCreateData extends createVendorDTO{
    ownerId:string;
}