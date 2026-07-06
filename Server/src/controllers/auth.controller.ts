import { Request, Response } from "express";
import { iAuthService } from "../interfaces/service/IAuthService";
import { TokenPayload } from "../interfaces/service/ITokenService";
type AuthRequest = Request & {
  user?: TokenPayload;
};




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
                const message =
                    error instanceof Error ? error.message : "something went wrong";

                const statusCode =
                    message === "Email already exists" ? 409 : 400;

                res.status(statusCode).json({
                    success: false,
                    message,
                });
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

    async login(req:Request,res:Response):Promise<void>{
        try {
            const {email,password}=req.body

            const {user,accessToken,refreshToken}=await this.authService.login(email,password)
        // await this.authService.login(email,password)

        res.cookie("refreshToken",refreshToken,{
            httpOnly:true,
            secure:false,
            sameSite:"strict",
            maxAge:7*24*60*60*1000
        })

        const userData={
            id:user._id,
            name:user.name,
            email:user.email,
            phone:user.phone,
            isAuthenticated:user.isAuthenticated,
        }

            res.status(200).json({success:true,message:'user login successfull',user:userData,accessToken})
            
        } catch (error) {
            res.status(400).json({success:false, message: error instanceof Error ? error.message : "Something went wrong",})
            
        }
    }

    async logout(req:Request,res:Response):Promise<void>{
        try {
            res.clearCookie("accessToken")
            res.clearCookie("refreshToken")

            res.status(200).json({
                success:true,
                message:"Logout successfully"
            })
            
        } catch (error) {
            res.status(500).json({success:false,message:'loggedout successful'})
            
        }
    }
    async getMe(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if(!userId){
                res.status(401).json({
                    success:false,
                    message:'user not authenticated'
                });
                return;
            }

            const user=await this.authService.getMe(userId)
            res.status(200).json({
                success:true,
                message:"user fetched successfully",
                user,
            })
        } catch (error) {
             res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Something went wrong",
            }); 
            
        }
    }

    async refreshToken(req:Request,res:Response):Promise<void>{
        try {
            const refreshToken=req.cookies.refreshToken
            if(!refreshToken){
                 res.status(401).json({success:false,message:"Refresh token is missing"})
                  return
            }
            const {accessToken}=await this.authService.refreshToken(refreshToken)
            res.status(200).json({
                success:true,
                message:"Access token refrshed successfully",
                accessToken
            })
           
            
        } catch (error) {
            res.status(401).json({
                success:false,message:"Invalid or expired refresh token"
            })
        }
    }

    async forgotPassword(req:Request,res:Response):Promise<void>{
        try {
            const {email}=req.body;
            const result=await this.authService.forgotPassword(email);
            res.status(200).json(result)
            
        } catch (error) {
            res.status(400).json({message:error instanceof Error?error.message:"something went wrong"})
            
        }
    }
    async resetPassword(req:Request,res:Response):Promise<void>{
        try {
            const {token,newPassword}=req.body
             console.log(token)
            const result=await this.authService.resetPassword(
                token,
                newPassword
            )
           
            res.status(200).json(result)
            
        } catch (error) {
            res.status(400).json({
                message:error instanceof Error?error.message:"something went wrong"
            })
            
        }
    }
}