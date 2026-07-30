import { Request } from "express";
import { TokenPayload } from "../interfaces/service/auth/ITokenService";

export interface AuthRequest extends Request {
    user?: TokenPayload;
}