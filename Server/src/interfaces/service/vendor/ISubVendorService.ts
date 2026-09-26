import { IUser } from "../../../models/user/user.model";
import { ICreateSubVendorDTO, IUpdateSubVendorPermissionsDTO, IUpdateSubVendorPasswordDTO } from "../../../dtos/subVendor.dto";

export interface ISubVendorService {
    getSubVendor(vendorOwnerId: string, hotelId: string): Promise<IUser | null>;
    createCredentials(vendorOwnerId: string, hotelId: string, data: ICreateSubVendorDTO): Promise<IUser>;
    updatePermissions(vendorOwnerId: string, hotelId: string, data: IUpdateSubVendorPermissionsDTO): Promise<IUser>;
    updatePassword(vendorOwnerId: string, hotelId: string, data: IUpdateSubVendorPasswordDTO): Promise<IUser>;
}
