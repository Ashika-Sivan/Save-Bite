import dotenv from "dotenv";
dotenv.config();

export const env = {
  MONGODB_URI: process.env.MONGODB_URI!,
  PORT: Number(process.env.PORT),

  EMAIL_USER: process.env.EMAIL_USER!,
  EMAIL_PASS: process.env.EMAIL_PASS!,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,

  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN!,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN!,

  REFRESH_COOKIE_MAX_AGE: Number(process.env.REFRESH_COOKIE_MAX_AGE),

  PASSWORD_RESET_EXPIRY: Number(process.env.PASSWORD_RESET_EXPIRY),

  BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS),
};