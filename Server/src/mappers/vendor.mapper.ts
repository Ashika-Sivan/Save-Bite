import {
  IAdminVendorDetailsDTO,
  IAdminVendorListDTO,
} from "../dtos/vendor.dto";
import { IVendorWithOwner } from "../models/vendor/vendor.model";

export const toAdminVendorListDTO = (
  vendor: IVendorWithOwner
): IAdminVendorListDTO => {
  return {
    id: vendor._id.toString(),
    ownerName: vendor.ownerId?.name??"unknown",
    ownerEmail: vendor.ownerId?.email??"unknown",
    businessName: vendor.businessInfo.businessName,
    businessType: vendor.businessInfo.businessType,
    place: vendor.businessInfo.place,
    status: vendor.status,
    isLive: vendor.isLive,
    createdAt: vendor.createdAt,
  };
};

export const toAdminVendorDetailsDTO = (
  vendor: IVendorWithOwner
): IAdminVendorDetailsDTO => {

  return {
    id: vendor._id.toString(),

      owner: {
      id: vendor.ownerId?._id.toString()??"",
      name: vendor.ownerId?.name??"unknown",
      email: vendor.ownerId?.email ??"unknown",
      phone: vendor.ownerId?.phone,
    },

    businessInfo: {
      businessName: vendor.businessInfo.businessName,
      businessType: vendor.businessInfo.businessType,
      place: vendor.businessInfo.place,
      address: vendor.businessInfo.address,
      businessImageKey: vendor.businessInfo.businessImageKey,
      location: vendor.businessInfo.location,
    },

     verification: vendor.verification,
    documents: vendor.documents,
    status: vendor.status,
    rejectionReason: vendor.rejectionReason ?? undefined,
    isLive: vendor.isLive,
    createdAt: vendor.createdAt,
  };
};