import {  IVendorCreateData } from "../../dtos/vendor.dto";
import { IUser } from "../../models/user/user.model";
import { IVendorWithOwner } from "../../models/vendor/vendor.model";
import { IVendor} from "../models/IVendor.model";

export interface IVendorRepository{
   createVendor(data:IVendorCreateData):Promise<IVendor>;
   findByOwnerId(ownerId:string):Promise<IVendor|null>
   findAllWithOwner():Promise<IVendorWithOwner[]>
   approveVendor(vendorId:string):Promise<IVendor|null>
   rejectVendor(vendorId:string,reason:string):Promise<IVendor|null>
   findByIdWithOwner(vendorId:string):Promise<IVendorWithOwner|null>
   getAllUsers():Promise<IUser[]>
   updateUserStatus(userId:string,isActive:boolean):Promise<IUser|null>

  
}