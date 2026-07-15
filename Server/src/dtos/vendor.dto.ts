export interface BusinessInfoDTO{
    businessName:string;
    businessType:string;
    place:string;
    address:string;
    latitude:number;
    longitude:number;
}

export interface VerificationDTO{
    gstNumber:string;
    panNumber:string;
    ifscCode:string;
    bankAccountNumber:string;
    fssaiNumber:string;
}

export interface DocumentsDTO{
    gstCertificateKey:string;
    fssaiCertificateKey:string;
    panCardKey:string;
    businessRegistrationCertificateKey:string
}

export interface createVendorDTO{
    businessInfo:BusinessInfoDTO;
    verification:VerificationDTO;
}

export interface VendorCreateData{
    ownerId:string;
    businessInfo:{
        businessName:string;
        businessType:string;
        place:string;
        address:string;
        businessImageKey:string;

        location:{
            type:"Point";
            coordinates:[number,number]
        };
    };
    verification:VerificationDTO;
    documents:DocumentsDTO
}