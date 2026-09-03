import { Types } from "mongoose";

export enum VendorStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  SUSPENDED = "suspended",
}

export interface IVendor {
  _id:Types.ObjectId
  ownerId: Types.ObjectId;

  businessInfo: {
    businessName: string;
    businessImageKey: string;
    businessType: string;
    place: string;
    address: string;

    location: {
      type: "Point";
      coordinates: [number, number];
    };
  };

  verification: {
    gstNumber: string;
    panNumber: string;
    ifscCode: string;
    bankAccountNumber: string;
    fssaiNumber: string;
  };

  documents: {
    gstCertificateKey: string;
    fssaiCertificateKey: string;
    panCardKey: string;
    businessRegistrationCertificateKey: string;
  };

  status: VendorStatus;
  revenue?: number;
  rejectionReason?: string | null;
  isLive: boolean;
  createdAt:Date;
  updatedAt:Date
}