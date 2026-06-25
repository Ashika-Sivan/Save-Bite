import { TokenPayload } from "../interfaces/service/ITokenService";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export {};