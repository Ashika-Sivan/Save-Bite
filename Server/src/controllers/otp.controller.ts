import { Request, Response } from "express";
import OtpService from "../services/auth/otp.service";

class OtpController{
    private otpService:OtpService
   

    constructor(otpService:OtpService){
        this.otpService=otpService
    }

    sendOtp=async(req:Request,res:Response)=>{
        console.log('send otp hit')
        const {email}=req.body
        const otp=await this.otpService.createOtp(email)
        console.log(otp,'otp form the send otp')
        return res.status(200).json({
            message:'OTP generated successfully',
            
        })

    }
    verifyOtp=async(req:Request,res:Response)=>{
        console.log('verify otp hit')
        const {email,otp}=req.body
        console.log('otp from verify otp',otp)
        try {
            const result=await this.otpService.verifyOtp(email,otp)
            return res.status(200).json({
                message:'OTP verified successfully',
                success:result
            })
            
        } catch (error:any) {
            return res.status(400).json({
                message:error.message,
                
            })
            
            
        }
    }
}

export default OtpController