// which define the authentication service shoudl provide

import { IUser } from "../../models/user/user.model";

//what authentication service can do
export interface iAuthService{
    register(name:string,email:string,password:string,phone?:string):Promise<IUser>
     resendOtp(email: string): Promise<boolean>;
     verifyOtp(email:string,otp:string):Promise<IUser|null>
    login(email:string,password:string):Promise<{
        user:IUser,
        accessToken:string;
        refreshToken:string
    }>
    refreshToken(refreshToken:string):Promise<{accessToken:string}>//request for getting new accesstoken.the input is old refrsh token and the output is new access token
    getMe(userId:string):Promise<IUser|null>
    
}