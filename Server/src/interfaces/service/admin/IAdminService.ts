
import {
    IAdminVendorListDTO,
    IAdminVendorDocumentListDTO,
} from "../../../dtos/vendor.dto";
import { IVendor } from "../../models/IVendor.model";
import { IAdminUserListDTO } from "../../../dtos/user.dto";

export interface IAdminService {
    getAllVendors(): Promise<IAdminVendorListDTO[]>;
    approveVendor(vendorId: string): Promise<IVendor>;
    rejectVendor(vendorId: string, reason: string): Promise<IVendor>;
    getAllUsers(): Promise<IAdminUserListDTO[]>;
    toggleUserStatus(userId: string): Promise<IAdminUserListDTO>;
    getVendorById(vendorId: string): Promise<IAdminVendorDocumentListDTO>;
}