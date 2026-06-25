import { iAuthService } from "../interfaces/service/IAuthService";
import { IUserRepository } from "../interfaces/repository/IUserRepository";
import { IUser } from "../models/user.model";
import bcrypt from 'bcrypt'
import { ITokenService } from "../interfaces/service/ITokenService";
import { IOtpService } from "../interfaces/service/IOtpService";


export class AuthService implements iAuthService{
    constructor(
        private userRepository:IUserRepository,
        private otpService:IOtpService,
        private tokenService:ITokenService
    ){}

    async register(
        name:string,
        email:string,
        password:string,
        phone?:string
    ):Promise<IUser>{
        
        const existingUser = await this.userRepository.findByEmail(email);

        if (existingUser) {
        throw new Error("Email already exists");
        }

        const hashedPassword=await bcrypt.hash(password,10)


        const user=await this.userRepository.create({
            name,
            email,
            password:hashedPassword,
            phone,
            isAuthenticated:false
        })

        await this.otpService.createOtp(email)

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

        const user= await this.userRepository.updateAuthenticationStatus(
            email,
            true

        )
        return user
    }

    async login(email:string,password:string):Promise<{
        user:IUser,
        accessToken:string,
        refreshToken:string
    }>{
        const user=await this.userRepository.findByEmail(email)

        if(!user){
            throw new Error("invalid email or password")
        }
        if(!user.isAuthenticated){
            throw new Error('Please verify your email first')
        }

        const passwordMatch=await bcrypt.compare(password,user.password)

        if(!passwordMatch){
            throw new Error('Invalid email or password')
        }

        const payload={
            userId:user._id.toString(),
            email:user.email,
        }
        const accessToken=this.tokenService.generateAccessToken(payload)

        const refreshToken=this.tokenService.generateRefreshToken(payload)
        return{
            user,
            accessToken,
            refreshToken
        }
    }

    async refreshToken(refreshToken: string): Promise<{ accessToken: string; }> {
        const payload=await this.tokenService.verifyRefreshToken(refreshToken)
        const accessToken=this.tokenService.generateAccessToken({
            userId:payload.userId,
            email:payload.email//filter out the userid and email from the payload and check the token.created new
        })
        return {
            accessToken
        }
    }

    async getMe(userId:string):Promise<IUser|null>{
        return await this.userRepository.findById(userId)
    }
}