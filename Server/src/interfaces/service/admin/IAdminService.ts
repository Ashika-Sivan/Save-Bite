
import {
    IAdminVendorListDTO,
    IAdminVendorDocumentListDTO,
} from "../../../dtos/vendor.dto";
import { IVendor } from "../../models/IVendor.model";
import { IAdminUserListDTO } from "../../../dtos/user.dto";
import { IPaginatedResult, IPaginationOptions } from "../../../types/pagination.types";

export interface IAdminService {
    getAllVendors(options?: IPaginationOptions): Promise<IPaginatedResult<IAdminVendorListDTO>>;
    approveVendor(vendorId: string): Promise<IVendor>;
    rejectVendor(vendorId: string, reason: string): Promise<IVendor>;
    getAllUsers(options?: IPaginationOptions): Promise<IPaginatedResult<IAdminUserListDTO>>;
    toggleUserStatus(userId: string): Promise<IAdminUserListDTO>;
    getVendorById(vendorId: string): Promise<IAdminVendorDocumentListDTO>;
}