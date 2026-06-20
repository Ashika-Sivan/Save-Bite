import OtpRepository from "../repositories/otp.repository";
import { generateOtp } from "../utils/generateOtp";
import EmailServce from "./email.service";

class OtpService{
    private otpRepository:OtpRepository
    private emailService:EmailServce

    constructor(otpRepository:OtpRepository,emailService:EmailServce){
        this.otpRepository=otpRepository
        this.emailService=emailService
    }

    async createOtp(email:string){
        const otp=generateOtp()
        await this.otpRepository.storeOtp(email,otp)
        await this.emailService.sendOtpEmail(email,otp)

        return true
    }

    async verifyOtp(email:string,otp:string){
        const storedOtp=await this.otpRepository.getOtp(email)
        if(!storedOtp){
            throw new Error("OTP expired or not found")
        }

        if(storedOtp!==otp){
            throw new Error("Invalud otp")
        }
        await this.otpRepository.deleteOtp(email)
        return true
    }
}

export default OtpService