import { iAuthService } from "../interfaces/service/IAuthService";
import { IUserRepository } from "../interfaces/repository/IUserRepository";
import { IUser } from "../models/user.model";
import OtpService from "./otp.service";


export class AuthService implements iAuthService{
    constructor(
        private userRepository:IUserRepository,
        private otpService:OtpService
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
            phone,
            isAuthenticated:false
        })
        return user
    }

    async resendOtp(email:string):Promise<boolean>{
        const user=await this.userRepository.findByEmail(email)
        if(!user){
            throw new Error("user not found")
        }

        if(user.isAuthenticated){
            throw new Error("User already verified")
        }
        await this.otpService.createOtp(email)
        return true
        
    }

    async verifyOtp(email:string,otp:string):Promise<IUser|null>{
        await this.otpService.verifyOtp(email,otp)

        const user= this.userRepository.updateAuthenticatioStatus(
            email,
            true

        )
        return user
    }
}