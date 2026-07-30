

export interface IBusinessInfoDTO {
  businessName: string;
  businessType: string;
  place: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface IVerificationDTO {
  gstNumber: string;
  panNumber: string;
  ifscCode: string;
  bankAccountNumber: string;
  fssaiNumber: string;
}

export interface IDocumentsDTO {
  gstCertificateKey: string;
  fssaiCertificateKey: string;
  panCardKey: string;
  businessRegistrationCertificateKey: string;
}

export interface ICreateVendorDTO {
  businessInfo: IBusinessInfoDTO;
  verification: IVerificationDTO;
}

export interface IVendorCreateData {
  ownerId: string;

  businessInfo: {
    businessName: string;
    businessType: string;
    place: string;
    address: string;
    businessImageKey: string;

    location: {
      type: "Point";
      coordinates: [number, number];
    };
  };

  verification: IVerificationDTO;
  documents: IDocumentsDTO;
}

export interface IAdminVendorListDTO {
  id: string;
  ownerName: string;
  ownerEmail: string;
  businessName: string;
  businessType: string;
  place: string;
  status: "pending" | "approved" | "rejected";
  isLive: boolean;
  createdAt: Date;
}

export interface IAdminVendorDetailsDTO {
  id: string;

  owner: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };

  businessInfo: {
    businessName: string;
    businessType: string;
    place: string;
    address: string;
    businessImageKey: string;

    location: {
      type: "Point";
      coordinates: [number, number];
    };
  };

  verification: IVerificationDTO;
  documents: IDocumentsDTO;

  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  isLive: boolean;
  createdAt: Date;
}

export interface IRejectVendorRequestDTO {
  rejectionReason: string;
}

//response dto

export interface IVendorStatusResponseDTO {
  hasApplication:boolean
  status?: "pending" | "approved" | "rejected";
  rejectionReason?: string|null;
}

export interface IAdminVendorDocumentListDTO{//url list
  vendor:IAdminVendorDetailsDTO;
  documentUrls:{
    gstCertificateUrl: string;
    fssaiCertificateUrl: string;
    panCardUrl: string;
    registrationCertificateUrl: string;

  }
}


