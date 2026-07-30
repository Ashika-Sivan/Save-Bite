
import crypto from "crypto";
import { redisClient } from "../../config/redis";
import { env } from "../../config/env";
import { IPasswordResetTokenService } from "../../interfaces/service/auth/IPasswordResetTokenService";

export class RedisPasswordResetTokenService implements IPasswordResetTokenService {
  async generateAndStore(userId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString("hex");
    await redisClient.getClient().set(`password_reset:${token}`, userId, {
      EX: env.PASSWORD_RESET_EXPIRY,
    });
    return token;
  }

  async resolve(token: string): Promise<string | null> {
    return redisClient.getClient().get(`password_reset:${token}`);
  }

  async invalidate(token: string): Promise<void> {
    await redisClient.getClient().del(`password_reset:${token}`);
  }
}