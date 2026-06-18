import { Request, Response } from "express";
import OtpService from "../services/otp.service";

class OtpController{
    private otpService:OtpService
   

    constructor(otpService:OtpService){
        this.otpService=otpService
    }

    sendOtp=async(req:Request,res:Response)=>{
        const {email}=req.body
        const otp=await this.otpService.createOtp(email)
        return res.status(200).json({
            message:'OTP generated successfully',
            otp,
        })

    }
    verifyOtp=async(req:Request,res:Response)=>{
        const {email,otp}=req.body
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