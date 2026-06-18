import { iAuthService } from "../interfaces/IAuthService";
import { IUserRepository } from "../interfaces/IUserRepository";
import { IUser } from "../models/user.model";
import { UserRepository } from "../repositories/user.repository";

export class AuthService implements iAuthService{
    constructor(
        private userRepository:IUserRepository
    ){}

    async register(
        name:string,
        email:string,
        password:string,
        phone?:string
    ):Promise<IUser>{
        
        const existingUser=await this.userRepository.findByEmail(email)
        if(existingUser){
            throw new Error('email already exist ')
        }

        const user=await this.userRepository.create({
            name,
            email,
            password,
            phone
        })
        return user
    }
}