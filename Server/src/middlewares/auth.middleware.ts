import { NextFunction, Response } from "express";
import { TokenService } from "../services/auth/token.service";
import { AuthRequest } from "../types/authRequest";
import { StatusCode } from "../constants/statusCode";
import { AUTH_MESSAGES } from "../constants/messages";
import { Logger } from "../utils/logger";


export class AuthMiddleware {
    constructor(
        private _tokenService: TokenService
    ) { }

    authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                res.status(StatusCode.UNAUTHORIZED).json({
                    success: false,
                    message: AUTH_MESSAGES.TOKEN_MISSING,
                })
                return
            }

            const token = authHeader.split(" ")[1];
            if (!token) {
                res.status(StatusCode.UNAUTHORIZED).json({
                    success: false,
                    message: AUTH_MESSAGES.INVALID_TOKEN_FORMAT,
                })
                return
            }

            //when the token come we have to verify it and placed it to payload
            const payload = this._tokenService.verifyAccessToken(token);//verify

            req.user = payload;
            next()

        } catch {
            res.status(StatusCode.UNAUTHORIZED).json({
                success: false,
                message: AUTH_MESSAGES.INVALID_OR_EXPIRED_TOKEN,
            })
        }
    }

    authorize = (...allowedRoles: Array<"user" | "vendor" | "admin">) => {
        return (req: AuthRequest, res: Response, next: NextFunction): void => {
            const role = req.user?.role;
            Logger.info("Authorization Check", {
                role: req.user?.role,
                allowedRoles
            });

            if (!role || !allowedRoles.includes(role)) {
                res.status(StatusCode.FORBIDDEN).json({
                    success: false,
                    message: AUTH_MESSAGES.ACCESS_DENIED,
                })
                return
            }
            next()
        }
    }
}

//here we are actually checking the accesstoken i mean the authorisation contain Bearer <access_token>
//then in the auth middleware read the authorisation header,check header exist,check bearer format, them extract jwt,verify jwt,store the decoded payload in the req.user.then call the next function
//now for the vendor side ;-take the ownerid from the req.user and then