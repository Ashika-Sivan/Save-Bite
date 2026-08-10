import { IVendorCreateData } from "../../dtos/vendor.dto";
import { IUser } from "../../models/user/user.model";
import { IVendorWithOwner } from "../../models/vendor/vendor.model";
import { IVendor } from "../models/IVendor.model";
import { IPaginationOptions } from "../../types/pagination.types";

export interface IVendorRepository {
  createVendor(data: IVendorCreateData): Promise<IVendor>;
  findByOwnerId(ownerId: string): Promise<IVendor | null>;
  findAllWithOwner(options?: IPaginationOptions): Promise<{ vendors: IVendorWithOwner[]; total: number }>;
  approveVendor(vendorId: string): Promise<IVendor | null>;
  rejectVendor(vendorId: string, reason: string): Promise<IVendor | null>;
  reapplyVendor(ownerId: string, data: IVendorCreateData): Promise<IVendor | null>;
  findByIdWithOwner(vendorId: string): Promise<IVendorWithOwner | null>;
  getAllUsers(options?: IPaginationOptions): Promise<{ users: IUser[]; total: number }>;
  updateUserStatus(userId: string, isActive: boolean): Promise<IUser | null>;
}