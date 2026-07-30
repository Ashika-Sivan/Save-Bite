import { IUser, User } from "../../models/user/user.model";
import { IUserRepository } from "../../interfaces/repository/IUserRepository";
//this file is responsible for talking to mongodb
// only db operations go here

export class UserRepository implements IUserRepository{
    async findByEmail(email:string):Promise<IUser|null>{
        return await User.findOne({email}).select("+password")
        
    }
    async create(userData:Partial<IUser>):Promise<IUser>{
        return await User.create(userData)
    }
    async updateAuthenticationStatus(email: string, status: boolean): Promise<IUser | null> {
        return await User.findOneAndUpdate(
            {email},
            {isAuthenticated:status},
            {new:true}
        )
        
    }
    async findById(userId:string):Promise<IUser|null>{
        return await User.findById(userId).select("-password")
    }
    async updateById(userId:string,updateData:Partial<IUser>):Promise<IUser|null>{
        return await User.findByIdAndUpdate(userId,updateData,{new:true})
    }
    async updateRole(userId: string, role: "vendor"): Promise<IUser | null> {
        return await User.findByIdAndUpdate(
            userId,
            {
                role,
                isBusinessOwner:true
            },
            {
                new :true
            }
        )
    }
    // async getUser(name: string): Promise<IUser[]> {
    //     return await User.find({name:{$regex:`^${name}`}})
    // }
  
    

}


// IUserRepository:-i mean what are the things that needed in the user repository