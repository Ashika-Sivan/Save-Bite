import OtpRepository from "../repositories/otp.repository";
import { generateOtp } from "../utils/generateOtp";

class OtpService{
    private otpRepository:OtpRepository

    constructor(otpRepository:OtpRepository){
        this.otpRepository=otpRepository
    }

    async createOtp(email:string){
        const otp=generateOtp()
        await this.otpRepository.storeOtp(email,otp)
        return otp
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