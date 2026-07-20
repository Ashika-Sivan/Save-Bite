import { VerifyOtpRequestDTO } from "../../dtos/auth.dto"

export interface IOtpService{
    createOtp(email:string):Promise<boolean>
    verifyOtp(data:VerifyOtpRequestDTO):Promise<boolean>

}