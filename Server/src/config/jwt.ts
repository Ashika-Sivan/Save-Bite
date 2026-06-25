import type { SignOptions } from "jsonwebtoken";


export const jwtConfig={
    accessSecret:process.env.JWT_ACCESS_SECRET as string,//used to signin the access tokem 
     refreshSecret: process.env.JWT_REFRESH_SECRET as string,
      accessExpiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ||
    "15m") as SignOptions["expiresIn"],

  refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ||
    "7d") as SignOptions["expiresIn"],
}

// actually this is the central pplace for jwt settigs.which is like db.ts,redis.ts like that.
