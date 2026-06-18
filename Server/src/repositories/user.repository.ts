import { IUser, User } from "../models/user.model";
import { IUserRepository } from "../interfaces/repository/IUserRepository";
//this file is responsible for talking to mongodb
// only db operations go here

export class UserRepository implements IUserRepository{
    async findByEmail(email:string):Promise<IUser|null>{
        return await User.findOne({email})
        
    }
    async create(userData:Partial<IUser>):Promise<IUser>{
        return await User.create(userData)

    }
}