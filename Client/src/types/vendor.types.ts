export interface VendorDetailsType {
  _id: string;

  businessInfo: {
    businessName: string;
    businessImageKey?: string;
    businessType: string;
    place: string;
    address: string;
  };

  verification: {
    gstNumber: string;
    panNumber: string;
    fssaiNumber: string;
    ifscCode: string;
    bankAccountNumber: string;
  };

  status: "pending" | "approved" | "rejected";
}

export interface DocumentUrlsType {
  gstCertificateUrl: string;
  fssaiCertificateUrl: string;
  panCardUrl: string;
  registrationCertificateUrl: string;
}