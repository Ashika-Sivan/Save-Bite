import { NextFunction, Request, Response } from "express";
import { TokenService } from "../services/token.service";


export class AuthMiddleware{
    constructor(
        private tokenService:TokenService
    ){}
    authenticate=(req:Request,res:Response,next:NextFunction):void=>{
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
}

//here we are actually checking the accesstoken i mean the authorisation contain Bearer <access_token>
//then in the auth middleware read the authorisation header,check header exist,check bearer format, them extract jwt,verify jwt,store the decoded payload in the req.user.then call the next function 