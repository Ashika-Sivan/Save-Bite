
//this file is created because to follow SOLID's DIP:this is actually a contract
//create user interface 
//and also we want to follow the dependency inversion pronciple
// <IUser> means all fields required
//partial <IUser> means all fields become optional

import { Types } from "mongoose";
import { IUser } from "../../models/user/user.model"
import { IPaginationOptions } from "../../types/pagination.types"

export interface IUserRepository{//user repo aayittolla any repository must have this methods
    findByEmail(email:string):Promise<IUser|null>;
    findByUsername(username:string):Promise<IUser|null>;
    create(userData:Partial<IUser>):Promise<IUser>
    updateAuthenticationStatus(email:string,status:boolean):Promise<IUser|null>
    findById(userId:string):Promise<IUser|null>
    updateById(userId:string,updateData:Partial<IUser>):Promise<IUser|null>
    updateRole(userId:string,role:"vendor"):Promise<IUser|null>
    getAllUsers(options?: IPaginationOptions): Promise<{ users: IUser[]; total: number }>;
    updateUserStatus(userId: string, isActive: boolean): Promise<IUser | null>;
    findUsersWithinRadius(longitude: number, latitude: number, maxDistanceInMeters: number): Promise<IUser[]>;
    countUsers(): Promise<number>;
    countBlockedUsers(): Promise<number>;
    getRecentUsers(limit: number): Promise<IUser[]>;
    updateStatusByVendorId(vendorId: string, isActive: boolean): Promise<void>;
}