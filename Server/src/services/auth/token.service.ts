import jwt from "jsonwebtoken";
import {
  ITokenService,
  TokenPayload,
} from "../../interfaces/service/auth/ITokenService";

import { jwtConfig } from "../../config/jwt";

export class TokenService implements ITokenService{
  generateAccessToken(payload:TokenPayload):string{//here we are actually creating the accesstoken
    return jwt.sign(payload,jwtConfig.accessSecret,{
      expiresIn:jwtConfig.accessExpiresIn
    })
  }

  generateRefreshToken(payload:TokenPayload):string{//also creating the refresh token
    return jwt.sign(payload,jwtConfig.refreshSecret,{
      expiresIn:jwtConfig.refreshExpiresIn
    })
  }

  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token,jwtConfig.accessSecret)as TokenPayload//to verify
  }
  verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token,jwtConfig.refreshSecret)as TokenPayload
  }
}

