import { iAuthService } from "../../interfaces/service/IAuthService";
import { IUserRepository } from "../../interfaces/repository/IUserRepository";
import { IUser } from "../../models/user/user.model";
import bcrypt from 'bcrypt'
import { ITokenService } from "../../interfaces/service/ITokenService";
import { IOtpService } from "../../interfaces/service/IOtpService";
import crypto from "crypto"
import { redisClient } from "../../config/redis";
import { sendResetPasswordEmail } from "../../utils/email.util";



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
            role:user.role,
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
            email:payload.email,//filter out the userid and email from the payload and check the token.created new,
            role:payload.role
            
        })
        return {
            accessToken
        }
    }

    async getMe(userId:string):Promise<IUser|null>{
        return await this.userRepository.findById(userId)
    }

     async forgotPassword(email: string): Promise<{ message: string }> {
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new Error("User not found");
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        await redisClient.getClient().set(
            `password_reset:${resetToken}`,
            user._id.toString(),
            {
            EX: 15 * 60,
            }
        );

        await sendResetPasswordEmail(user.email, resetToken);

        return {
            message: "Password reset link sent to your email",
        };
    }

    async resetPassword(
        token: string,
        newPassword: string
    ): Promise<{ message: string }> {
        const userId = await redisClient
            .getClient()
            .get(`password_reset:${token}`);

            if (!userId) {
                throw new Error("Invalid or expired reset token");
            }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await this.userRepository.updateById(userId, {
            password: hashedPassword,
        });

        await redisClient.getClient().del(`password_reset:${token}`);

        return {
            message: "Password reset successfully",
        };
    }

    
}