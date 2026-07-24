import { ICreateVendorDTO, IVendorCreateData } from "../../dtos/vendor.dto";
import { IUser } from "../../models/user/user.model";
import { IVendor} from "../models/IVendor.model";

export interface IVendorRepository{
   createVendor(data:IVendorCreateData):Promise<IVendor>;
   findByOwnerId(ownerId:string):Promise<IVendor|null>
   findAll():Promise<IVendor[]>
   approveVendor(vendorId:string):Promise<IVendor|null>
   rejectVendor(vendorId:string,reason:string):Promise<IVendor|null>
   findById(vendorId:string):Promise<IVendor|null>
   getAllUsers():Promise<IUser[]>
   updateUserStatus(userId:string,isActive:boolean):Promise<IUser|null>
   // getVendorById(vendorId:string):Promise<IVendor|null>

  
}