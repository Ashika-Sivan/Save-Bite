import { NextFunction, Request, Response } from "express";
import { TokenService } from "../services/auth/token.service";
import { AuthRequest } from "../types/authRequest";


export class AuthMiddleware{
    constructor(
        private tokenService:TokenService
    ){}
    authenticate=(req:AuthRequest,res:Response,next:NextFunction):void=>{
        try {
           
            const authHeader=req.headers.authorization;
          
            if(!authHeader || !authHeader.startsWith("Bearer ")){
                res.status(401).json({success:false,message:"Access Token missing"})
                return 
            }
             const token=authHeader.split(" ")[1];
               if(!token){
                res.status(401).json({
                    success:false,
                    message:'Invalid token format',
                })
                 return 
            }
            //when the token come we have to verify it and placed it to payload
            const payload=this.tokenService.verifyAccessToken(token);//verify
           
            (req as any).user = payload;
            next()
           
            
        } catch (error) {
            res.status(401).json({success:false,message:'Invalid or expired token'})
        }
    }

    // authorize=(...allowedRoles:Array<"user"|"vendor"|"admin">)=>{
    //     return (req:AuthRequest,res:Response,next:NextFunction):void=>{
    //         const role=req.user?.role;

    //         if(!role||!allowedRoles.includes(role)){
    //             res.status(403).json({
    //                 success:false,
    //                 message:'Access denied'
    //             })
    //             return 
    //         }
    //         next()
    //     }
    // }
}

//here we are actually checking the accesstoken i mean the authorisation contain Bearer <access_token>
//then in the auth middleware read the authorisation header,check header exist,check bearer format, them extract jwt,verify jwt,store the decoded payload in the req.user.then call the next function 
//now for the vendor side ;-take the ownerid from the req.user and then