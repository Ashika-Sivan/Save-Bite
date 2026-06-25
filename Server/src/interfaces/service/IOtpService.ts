export interface IOtpService{
    createOtp(email:string):Promise<boolean>
    verifyOtp(email:string,otp:string):Promise<boolean>

}