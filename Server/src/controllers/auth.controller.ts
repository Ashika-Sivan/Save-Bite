import { Request, Response } from "express";
import { iAuthService } from "../interfaces/service/IAuthService";



export class AuthController{
    constructor(
        private authService:iAuthService,
    ){}
    async register(req:Request,res:Response):Promise<void>{
        console.log('register controller hit ')
        try {
            const {name,email,password,phone}=req.body
            console.log('finding...',req.body)
            const user=await this.authService.register(
                name,
                email,
                password,
                phone
            )
            res.status(201).json({
                success:true,
                message:'user registered successfully',
                user
            })
            
        } catch (error) {
            res.status(400).json({
                success:false,
                message:error instanceof Error?error.message:'something went wrong'
            })
            
        }

    }


    async resendOtp(req:Request,res:Response){
        try {
            const {email}=req.body
            await this.authService.resendOtp(email)
            res.status(200).json({
                success:true,
                message:'OTP resend successfully'
            })
            
        } catch (error) {
            res.status(400).json({
                success:false,
                message: error instanceof Error ? error.message : "Something went wrong",
            })
            
        }
    }
    async verifyOtp(req:Request,res:Response):Promise<void>{
        try {
            const {email,otp}=req.body
            const user=await this.authService.verifyOtp(
                email,
                otp
            )
            
            res.status(200).json({
                success:true,
                message:'OTP verified successfully',
                user
            })
        } catch (error) {
            res.status(400).json({
                success:false,
                message:error instanceof Error?error.message:"Something went wrong"
            })
            
        }
    }
}