import { IUser, User } from "../../models/user/user.model";
import { IPaginationOptions } from "../../types/pagination.types";
import { IUserRepository } from "../../interfaces/repository/IUserRepository";
import { BaseRepository } from "../base.repository";
//this file is responsible for talking to mongodb
// only db operations go here

export class UserRepository  extends BaseRepository<IUser> implements IUserRepository {

    constructor(){
        super(User)
    }
    async findByEmail(email:string):Promise<IUser|null>{
        return await User.findOne({email}).select("+password")
        
        

        
    }
    async updateAuthenticationStatus(email: string, status: boolean): Promise<IUser | null> {
        return await User.findOneAndUpdate(
            {email},
            {isAuthenticated:status},
            {new :true}
        )
        
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



    

    async getAllUsers(options?: IPaginationOptions): Promise<{ users: IUser[]; total: number }> {
        const page = Math.max(1, options?.page || 1);
        const limit = Math.max(1, options?.limit || 10);
        const skip = (page - 1) * limit;
        const search = options?.search?.trim();
        const status = options?.status;

        const filterQuery: Record<string, unknown> = { role: 'user' , isAuthenticated:true};

        if (status && status !== "all") {
            if (status === "active") {
                filterQuery.isActive = true;
            } else if (status === "blocked") {
                filterQuery.isActive = false;
            }
        }

        if (search) {
            filterQuery.$or = [
                { name: new RegExp(search, "i") },
                { email: new RegExp(search, "i") },
            ];
        }

        const total = await User.countDocuments(filterQuery);

        const users = await User.find(filterQuery)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
            

        return { users, total };
    }

    async updateUserStatus(userId: string, isActive: boolean): Promise<IUser | null> {
        return await User.findByIdAndUpdate(userId, { isActive }, { new: true }).select("-password")
    }

}


// IUserRepository:-i mean what are the things that needed in the user repository