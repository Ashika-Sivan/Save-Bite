import dotenv from "dotenv";

dotenv.config();

const getEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
};

export const env = {
  MONGODB_URI: getEnv("MONGODB_URI"),
  PORT: Number(getEnv("PORT")),

  EMAIL_USER: getEnv("EMAIL_USER"),
  EMAIL_PASS: getEnv("EMAIL_PASS"),

  JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
  JWT_ACCESS_EXPIRES_IN: getEnv("JWT_ACCESS_EXPIRES_IN"),
  JWT_REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN"),

  REFRESH_COOKIE_MAX_AGE: Number(getEnv("REFRESH_COOKIE_MAX_AGE")),
  PASSWORD_RESET_EXPIRY: Number(getEnv("PASSWORD_RESET_EXPIRY")),
  BCRYPT_SALT_ROUNDS: Number(getEnv("BCRYPT_SALT_ROUNDS")),

  AWS_REGION: getEnv("AWS_REGION"),
  AWS_ACCESS_KEY_ID: getEnv("AWS_ACCESS_KEY_ID"),
  AWS_SECRET_ACCESS_KEY: getEnv("AWS_SECRET_ACCESS_KEY"),
  AWS_S3_BUCKET_NAME: getEnv("AWS_S3_BUCKET_NAME"),
  CLIENT_URL: getEnv("CLIENT_URL"),
};