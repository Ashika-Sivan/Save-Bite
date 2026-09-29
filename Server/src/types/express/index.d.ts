import { TokenPayload } from "../interfaces/service/ITokenService";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export { };

//modfy express request to use the user as globally
//so in the authRequest we use the usr