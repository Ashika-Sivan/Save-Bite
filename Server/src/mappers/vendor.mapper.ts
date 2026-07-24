import {
  IAdminVendorDetailsDTO,
  IAdminVendorListDTO,
} from "../dtos/vendor.dto";
import { IVendor } from "../interfaces/models/IVendor.model";

export const toAdminVendorListDTO = (
  vendor: IVendor
): IAdminVendorListDTO => {
  const owner = vendor.ownerId as any;

  return {
    id: vendor._id.toString(),
    ownerName: owner?.name ?? "",
    ownerEmail: owner?.email ?? "",
    businessName: vendor.businessInfo.businessName,
    businessType: vendor.businessInfo.businessType,
    place: vendor.businessInfo.place,
    status: vendor.status,
    isLive: vendor.isLive,
    createdAt: vendor.createdAt,
  };
};

export const toAdminVendorDetailsDTO = (
  vendor: IVendor
): IAdminVendorDetailsDTO => {
  const owner = vendor.ownerId as any;

  return {
    id: vendor._id.toString(),

    owner: {
      id: owner?._id?.toString() ?? "",
      name: owner?.name ?? "",
      email: owner?.email ?? "",
      phone: owner?.phone,
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