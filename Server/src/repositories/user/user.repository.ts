import { IUser, User } from "../../models/user/user.model";
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

  

    

}


// IUserRepository:-i mean what are the things that needed in the user repository