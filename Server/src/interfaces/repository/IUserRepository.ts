
//this file is created because to follow SOLID's DIP:this is actually a contract
//create user interface 
//and also we want to follow the dependency inversion pronciple
// <IUser> means all fields required
//partial <IUser> means all fields become optional

import { Types } from "mongoose";
import { IUser } from "../../models/user/user.model"
import { IPaginationOptions } from "../../types/pagination.types"

export interface IUserRepository{//user repo aayittolla any repository must have this methods
    findByEmail(email:string):Promise<IUser|null>;//give me an email i will search for a user.reason used promise is db took time a lot.returns:IUser means user found
    create(userData:Partial<IUser>):Promise<IUser>//create a new user.return :created user document.promise means this operation takes times
    updateAuthenticationStatus(email:string,status:boolean):Promise<IUser|null>
    findById(userId:string):Promise<IUser|null>
    updateById(userId:string,updateData:Partial<IUser>):Promise<IUser|null>
    updateRole(userId:string,role:"vendor"):Promise<IUser|null>
    getAllUsers(options?: IPaginationOptions): Promise<{ users: IUser[]; total: number }>;
    updateUserStatus(userId: string, isActive: boolean): Promise<IUser | null>;

}