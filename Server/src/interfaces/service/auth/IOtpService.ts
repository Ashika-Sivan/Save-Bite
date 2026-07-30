import { IVerifyOtpRequestDTO } from "../../../dtos/auth.dto"

export interface IOtpService{
    createOtp(email:string):Promise<boolean>
    verifyOtp(data:IVerifyOtpRequestDTO):Promise<boolean>

}