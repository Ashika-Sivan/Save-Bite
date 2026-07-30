import { IAdminVendorDetailsDTO, IAdminVendorDocumentListDTO, IAdminVendorListDTO, ICreateVendorDTO } from "../../dtos/vendor.dto";
import { IUser } from "../../models/user/user.model";
import { IVendor, VendorStatus } from "../models/IVendor.model";

export interface IVendorService{
    registerVendor(
        ownerId:string,
        data:ICreateVendorDTO,
        files:{
            [fieldName:string]:Express.Multer.File[]
        }
    ):Promise<IVendor>


    getAllVendors():Promise<IAdminVendorListDTO[]>
    approveVendor(vendorId:string):Promise<IVendor>
    rejectVendor(vendorId:string,reason:string):Promise<IVendor>
    getVendorStatus(ownerId:string):Promise<{
        hasApplication:boolean;
        status?:VendorStatus,
        rejectReason?:string|null
    }>;
    getAllUsers():Promise<IUser[]>
    toggleUserStatus(userId:string):Promise<IUser>
    getVendorById(vendorId:string):Promise<IAdminVendorDocumentListDTO>

}