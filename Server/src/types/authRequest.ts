import { Request } from "express";
import { TokenPayload } from "../interfaces/service/ITokenService";

export interface AuthRequest extends Request {
    user?: TokenPayload;
}